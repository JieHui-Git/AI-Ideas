from fastapi import FastAPI, HTTPException
import sqlite3
from datetime import datetime

app = FastAPI()

# Setup database
conn = sqlite3.connect("polls.db")
c = conn.cursor()
c.execute('''CREATE TABLE IF NOT EXISTS polls (id INTEGER PRIMARY KEY AUTOINCREMENT, question TEXT, options TEXT)''')
c.execute('''CREATE TABLE IF NOT EXISTS votes (id INTEGER PRIMARY KEY AUTOINCREMENT, poll_id INTEGER, option TEXT)''')
conn.commit()

# Create a new poll 
@app.post("/polls/")
async def create_poll(question: str, options: list):
    if len(options) < 2:
        raise HTTPException(status_code=400, detail="At least two options are required")
    options = ','.join(options)
    c.execute("INSERT INTO polls (question, options) VALUES (?, ?)", (question, options))
    conn.commit()
    poll_id = c.lastrowid
    return {"poll_id": poll_id, "url": f"http://localhost:8000/vote/{poll_id}"}

# Vote on a poll 
@app.post("/vote/")
async def vote(poll_id: int, option: str):
    c.execute("SELECT id FROM polls WHERE id=?", (poll_id,))
    poll = c.fetchone()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    c.execute("SELECT COUNT(*) FROM votes WHERE poll_id=? AND option=?", (poll_id, option))
    count = c.fetchone()[0] + 1
    c.execute("INSERT INTO votes (poll_id, option) VALUES (?, ?)", (poll_id, option))
    conn.commit()
    return {"option": option, "count": count}

# Get a poll and its results 
@app.get("/vote/{poll_id}")
async def get_poll(poll_id: int):
    c.execute("SELECT id FROM polls WHERE id=?", (poll_id,))
    poll = c.fetchone()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    c.execute("SELECT option, COUNT(*) AS count FROM votes WHERE poll_id=? GROUP BY option", (poll_id,))
    results = c.fetchall()
    return {"question": poll[1], "options": {result[0]: result[1] for result in results}}
