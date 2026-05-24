from fastapi import FastAPI, HTTPException
import sqlite3 as sql
from datetime import datetime
import uuid

app = FastAPI()

DATABASE_URI = 'sqlite:///polls.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        conn = sql.connect(DATABASE_URI)
        conn.row_factory = sql.Row
        g._database = conn
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = g.pop('_database', None)
    if db is not None:
        db.close()

@app.post("/polls")
def create_poll(poll_data: list):
    poll_id = uuid.uuid4()
    for choice in poll_data:
        choice['poll_id'] = poll_id
        choice['timestamp'] = datetime.now().isoformat()
    conn = get_db()
    conn.executemany('''
        INSERT INTO polls (id, poll_id, title, votes)
        VALUES (?, ?, ?, ?)
    ''', [(x['poll_id'], x['title'], 0, 1) for x in poll_data])
    conn.executemany('''
        INSERT INTO choices (id, poll_id, title, votes, timestamp)
        VALUES (?, ?, ?, ?, ?)
    ''', [(str(uuid.uuid4()), poll_id, choice['title'], 0, 
              datetime.now().isoformat()) for x in poll_data for choice in x['choices']])
    conn.commit()
    return {'id': str(poll_id)}

@app.get("/polls/{poll_id}")
def get_poll(poll_id: str):
    conn = get_db()
    cursor = conn.execute('SELECT * FROM polls WHERE poll_id=?', [poll_id])
    rows = cursor.fetchall()

    if len(rows) == 0:
        raise HTTPException(status_code=404, detail="Poll not found")

    return {
        'id': str(rows[0]['poll_id']),
        'question': rows[0]['title'],
        'choices': [r for r in rows if r['type'] == 'choice']
    }
