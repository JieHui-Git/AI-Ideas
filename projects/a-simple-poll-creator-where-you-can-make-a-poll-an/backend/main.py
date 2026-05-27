from fastapi import FastAPI, HTTPException, Body
import sqlalchemy as sa
from aiosqlite import connect as aioc_connect

app = FastAPI()

DATABASE_URL = "sqlite+aiosqlite:///./polls.db"

engine = sa.create_engine(DATABASE_URL)
async with engine.begin() as conn:
    await conn.run_sync(create_tables)


async def create_poll(options):
    async with aioc_connect(DATABASE_URL) as db:
        async with db.cursor() as cursor:
            options_data = [0] * len(options)
            values = tuple([(options, options_data)])
            placeholders = ", ".join(["?"] * len(values))
            await cursor.executemany(
                "INSERT INTO polls (options, counts) VALUES (?, ?)", values
            )

@app.get("/api/polls")
async def get_polls():
    async with aioc_connect(DATABASE_URL) as db:
        async with db.cursor() as cursor:
            result = await cursor.execute("SELECT id, options, counts FROM polls", ())
            polls = [
                {
                    "id": row[0],
                    "options": list(map(int, row[1].split(','))),
                    "counts": list(map(int, row[2].split(',')))
                }
                for row in await result.fetchall()
            ]
            return polls


@app.post("/api/polls")
async def create_poll_from_json(data: dict = Body(...)):
    options = data.get("options")
    if not isinstance(options, list) or len(options) < 2:
        raise HTTPException(status_code=400, detail="Invalid poll options")

    await create_poll(options)

    return {"message": "Poll created successfully", "poll_id": polls[-1].id}


@app.put("/api/polls/{poll_id}")
async def vote_on_poll(poll_id: int):
    result = await get_poll(poll_id)
    if not result:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    values = []
    for index, count in enumerate(result["counts"]):
        new_count = count + 1
        values.append((new_count, poll_id))

    async with aioc_connect(DATABASE_URL) as db:
        async with db.cursor() as cursor:
            await cursor.executemany(
                "UPDATE polls SET counts = ? WHERE id = ?", values)
            
    return {"message": "Vote cast successfully"}


async def vote_on_poll_from_json(poll_id, choice):
    result = await get_poll(poll_id)
    if not result:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    options = result["options"]
    counts = result["counts"]

    async with aioc_connect(DATABASE_URL) as db:
        async with db.cursor() as cursor:
                await cursor.execute(
                    "UPDATE polls SET counts = ? + 1 WHERE id = ?", (choice, poll_id))
                
    return {"message": "Vote cast successfully"}


async def create_tables():
    metadata = sa.MetaData()

    polls_table = sa.Table(
        "polls",
        metadata,
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("options", sa.String(256), nullable=False),
        sa.Column("counts", sa.String(256), nullable=False)
    )

    metadata.create_all(engine)


def get_poll(poll_id):
    result = None
    async with aioc_connect(DATABASE_URL) as db:
        async with db.cursor() as cursor:
            await cursor.execute(
                "SELECT id, options, counts FROM polls WHERE id = ? LIMIT 1", (poll_id,)
            )
            row = await cursor.fetchone()
            
            if row is not None:           
              result = {
                  "id": poll_id,
                  "options": list(map(int, row[1].split(','))),
                  "counts": list(map(int, row[2].split(',')))
                }
                
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
