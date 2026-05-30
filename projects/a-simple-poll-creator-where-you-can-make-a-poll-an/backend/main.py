from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sqlite3

app = FastAPI()

class Poll(BaseModel):
    question: str
    options: list

def get_db_connection():
    conn = sqlite3.connect('polls.db')
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS polls (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            options TEXT NOT NULL,
            votes TEXT NOT NULL DEFAULT '{}'
        )
    """)
    conn.commit()
    conn.close()

init_db()

@app.post("/polls/", response_model=Poll)
async def create_poll(poll: Poll):
    conn = get_db_connection()
    cursor = conn.cursor()
    options_str = ', '.join(f"'{option}'" for option in poll.options)
    votes_str = str([0] * len(poll.options))
    cursor.execute("INSERT INTO polls (question, options, votes) VALUES (?, ?, ?)", (poll.question, options_str, votes_str))
    conn.commit()
    new_poll_id = cursor.lastrowid
    cursor.close()
    conn.close()
    return {**poll.dict(), "id": new_poll_id}

@app.get("/polls/", response_model=list[Poll])
async def read_polls():
    conn = get_db_connection()
    polls = conn.execute("SELECT * FROM polls").fetchall()
    conn.close()
    return [{"id": poll["id"], "question": poll["question"], "options": poll["options"].split(', '), "votes": list(map(int, poll["votes"].strip('[]').split(', ')))} for poll in polls]

@app.post("/polls/{poll_id}/vote/", status_code=204)
async def vote_on_poll(poll_id: int, option_index: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    poll = conn.execute("SELECT * FROM polls WHERE id = ?", (poll_id,)).fetchone()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    votes = list(map(int, poll["votes"].strip('[]').split(', ')))
    votes[option_index] += 1
    votes_str = str(votes)
    cursor.execute("UPDATE polls SET votes = ? WHERE id = ?", (votes_str, poll_id))
    conn.commit()
    cursor.close()
    conn.close()