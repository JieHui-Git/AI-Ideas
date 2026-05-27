import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sqlite3

app = FastAPI()

# Database setup
os.makedirs('data', exist_ok=True)
conn = sqlite3.connect(os.path.join('data', 'polls.db'))
c = conn.cursor()
c.execute('''CREATE TABLE IF NOT EXISTS polls 
             (id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT UNIQUE NOT NULL, options TEXT NOT NULL)''')
c.execute('''CREATE TABLE IF NOT EXISTS votes 
             (poll_id INTEGER, option TEXT, FOREIGN KEY(poll_id) REFERENCES polls(id))''')
conn.commit()

# Middleware for CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Poll(BaseModel):
    question: str
    options: list

@app.post("/polls/")
async def create_poll(poll: Poll):
    conn = sqlite3.connect(os.path.join('data', 'polls.db'))
    c = conn.cursor()
    try:
        c.execute("INSERT INTO polls (question, options) VALUES (?, ?)", （poll.question, ','.join(poll.options)))
        poll_id = c.lastrowid
        conn.commit()
    except sqlite3.IntegrityError:
        conn.rollback()
        raise HTTPException(status_code=400, detail="Question already taken")
    
    return {"id": poll_id, "question": poll.question, "options": poll.options}

@app.get("/polls/")
async def get_polls():
    conn = sqlite3.connect(os.path.join('data', 'polls.db'))
    c = conn.cursor()
    polls = [dict(row) for row in c.execute("SELECT id, question, options FROM polls")]
    
    return {"polls": polls}

@app.post("/polls/{poll_id}/vote/")
async def vote(poll_id: int, option: str):
    conn = sqlite3.connect(os.path.join('data', 'polls.db'))
    c = conn.cursor()
    try:
        c.execute("INSERT INTO votes (poll_id, option) VALUES (?, ?)", (poll_id, option))
        conn.commit()
    except sqlite3.Error:
        conn.rollback()
        raise HTTPException(status_code=400, detail="Invalid option")
    
    return {"message": "Vote recorded"}

@app.get("/polls/{poll_id}/results/")
async def get_results(poll_id: int):
    conn = sqlite3.connect(os.path.join('data', 'polls.db'))
    c = conn.cursor()
    poll = c.execute("SELECT question, options FROM polls WHERE id = ?", (poll_id,)).fetchone()
    
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    result = {"question": poll[0], "options": [x.strip() for x in poll[1].split(',')] if poll[1] else [], "vote_count": []}
    options = {option: 0 for option in result["options"]}
    
    votes_cursor = c.execute("SELECT option FROM votes WHERE poll_id = ?", (poll_id,))
    vote_counts = [votes_cursor.fetchone()[0] for _ in range(votes_cursor.rowcount)]
    
    for v in vote_counts:
        if v in options:
            options[v] += 1
    
    result["vote_count"] = list(options.values())
    
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
