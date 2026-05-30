from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sqlite3

app = FastAPI()

class PollOption(BaseModel):
    id: str
    text: str
    votes: int = 0

class Poll(BaseModel):
    title: str
    options: list[PollOption]

DATABASE_URL = "polls.db"

# Initialize database and table
conn = sqlite3.connect(DATABASE_URL)
cursor = conn.cursor()
cursor.execute('''
CREATE TABLE IF NOT EXISTS polls (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    options TEXT NOT NULL
);
''')
conn.commit()
conn.close()

def get_db_connection():
    connection = sqlite3.connect(DATABASE_URL)
    connection.row_factory = sqlite3.Row
    return connection

@app.get('/polls', response_model=list[Poll])
def read_polls():
    conn = get_db_connection()
    polls = []
    for row in conn.execute('SELECT * FROM polls').fetchall():
        polls.append(Poll(title=row['title'], options=[PollOption(**opt) for opt in eval(row['options'])]))
    conn.close()
    return polls

@app.post('/polls', response_model=Poll)
def create_poll(poll: Poll):
    conn = get_db_connection()
    cursor = conn.cursor()
    poll_id = uuid.uuid4().hex
    cursor.execute(
        "INSERT INTO polls (id, title, options) VALUES (?, ?, ?)",
        (poll_id, poll.title, str([opt.dict() for opt in poll.options]))
    )
    conn.commit()
    conn.close()
    return { **poll.dict(), "id": poll_id }
