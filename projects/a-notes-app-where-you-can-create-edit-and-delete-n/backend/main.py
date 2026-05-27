from fastapi import FastAPI
from pydantic import BaseModel
import aiosqlite3 as sqlite3
from pathlib import Path

app = FastAPI()

DATABASE_URL = Path(__file__).resolve().parent / ".env"

class Note(BaseModel):
    title: str
    text: str

@app.on_event("startup")
async def init_db():
    async with sqlite3.connect(DATABASE_URL) as conn:
        cursor = await conn.cursor()
        await cursor.execute('''
            CREATE TABLE IF NOT EXISTS notes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                text TEXT NOT NULL
            )
        ''')
        await conn.commit()

@app.post("/notes/")
async def create_note(note: Note):
    async with sqlite3.connect(DATABASE_URL) as conn:
        cursor = await conn.cursor()
        await cursor.execute('INSERT INTO notes (title, text) VALUES (?, ?)',
                             (note.title, note.text))
        await conn.commit()
        row_id = await cursor.lastrowid
        return {"id": row_id, "title": note.title, "text": note.text}

@app.get("/notes/")
async def get_notes():
    async with sqlite3.connect(DATABASE_URL) as conn:
        cursor = await conn.cursor()
        await cursor.execute('SELECT id, title, text FROM notes')
        rows = await cursor.fetchall()
        return [{"id": row[0], "title": row[1], "text": row[2]} for row in rows]

@app.delete("/notes/{note_id}")
async def delete_note(note_id: int):
    async with sqlite3.connect(DATABASE_URL) as conn:
        cursor = await conn.cursor()
        await cursor.execute('DELETE FROM notes WHERE id=?', (note_id,))
        await conn.commit()
        return {"message": "Note deleted"}
