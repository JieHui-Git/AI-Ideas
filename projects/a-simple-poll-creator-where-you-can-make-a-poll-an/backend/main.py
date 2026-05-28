from fastapi import FastAPI
import sqlite3

app = FastAPI()

# Initialize SQLite database and create table
connection = sqlite3.connect('polls.db')
cursor = connection.cursor()
cursor.execute('CREATE TABLE IF NOT EXISTS polls (id INTEGER PRIMARY KEY, question TEXT, options TEXT, votes TEXT)')
connection.commit()

@app.get('/polls', response_model=list[dict])
def get_polls():
    cursor.execute('SELECT * FROM polls')
    rows = cursor.fetchall()
    return [{'id': row[0], 'question': row[1], 'options': eval(row[2]), 'votes': eval(row[3])} for row in rows]

@app.post('/polls', status_code=201)
def create_poll(question: str, options: list[str]):
    cursor.execute("INSERT INTO polls (question, options, votes) VALUES (?, ?, ?)", (question, str(options), str([0] * len(options))))
    connection.commit()
    return {'id': cursor.lastrowid, 'question': question, 'options': options, 'votes': [0] * len(options)}

@app.post('/polls/{poll_id}/vote')
def vote(poll_id: int, optionIndex: int):
    cursor.execute('SELECT votes FROM polls WHERE id = ?', (poll_id,))
    row = cursor.fetchone()
    if row:
        votes = eval(row[0])
        votes[optionIndex] += 1
        cursor.execute('UPDATE polls SET votes = ? WHERE id = ?', (str(votes), poll_id))
        connection.commit()

# Close database connection on shutdown
@app.on_event("shutdown")
def shutdown_db():
    connection.close()
