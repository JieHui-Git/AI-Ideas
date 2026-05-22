from fastapi import FastAPI, HTTPException
import sqlite3
from typing import Dict

app = FastAPI()

def init_db():
    conn = sqlite3.connect('url_shortener.db')
    c = conn.cursor()
    c.execute("CREATE TABLE IF NOT EXISTS urls (id INTEGER PRIMARY KEY AUTOINCREMENT, long_url TEXT UNIQUE NOT NULL, short_code TEXT UNIQUE NOT NULL)")
    conn.commit()
    conn.close()

@app.on_event("startup")
def startup_event():
    init_db()

short_codes = {}
last_id = 0

@app.post("/shorten", response_model=Dict[str, str])
async def shorten_url(data: Dict[str, str]):
    global last_id
    long_url = data["longUrl"]
    
    conn = sqlite3.connect('url_shortener.db')
    c = conn.cursor()

    # Check if the URL already exists with a short code
    c.execute("SELECT short_code FROM urls WHERE long_url=?", (long_url,))
    existing_code = c.fetchone()
    
    if existing_code:
        short_code = existing_code[0]
    else:
        last_id += 1
        short_code = f"{'a' * 6}{last_id:0>6}"
        
        # Ensure the short code is unique
        while len(short_code) != len(set(short_code)) != len(short_code.replace('a', '')):
            last_id += 1
            short_code = f"{'a' * 6}{last_id:0>6}"

        c.execute("INSERT INTO urls (long_url, short_code) VALUES (?, ?)", (long_url, short_code))

    conn.commit()
    conn.close()

    return {"shortUrl": "http://localhost:3000/" + short_code}

@app.get("/{code}")
async def redirect_to_long_url(code: str):
    conn = sqlite3.connect('url_shortener.db')
    c = conn.cursor()
    c.execute("SELECT long_url FROM urls WHERE short_code=?", (code,))
    result = c.fetchone()

    if result:
        return {"redirect": result[0]}
    else:
        raise HTTPException(status_code=404, detail="URL not found")
