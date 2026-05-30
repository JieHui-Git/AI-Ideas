from fastapi import FastAPI, HTTPException
from typing import List, Optional
import json

app = FastAPI()

# In-memory storage for simplicity. Use JSON file for persistence.
with open("polls.json", "r") as f:
    polls = json.load(f)

@app.get("/polls/", response_model=List[dict])
async def read_polls():
    return polls

@app.post("/polls/")
async def create_poll(poll: dict):
    poll["id"] = len(polls) + 1
    poll["votes"] = {}
    for option in poll['options']:
        poll['votes'][option] = 0
    polls.append(poll)
    with open("polls.json", "w") as f:
        json.dump(polls, f)
    return poll

@app.post("/votes/{poll_id}/{option}")
async def vote_poll(poll_id: int, option: str):
    poll = next((p for p in polls if p['id'] == poll_id), None)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    if option not in poll['votes']:
        raise HTTPException(status_code=400, detail="Invalid vote option")
    
    poll['votes'][option] += 1
    with open("polls.json", "w") as f:
        json.dump(polls, f)
    return {"detail": "Vote recorded successfully"}

@app.get("/polls/{poll_id}", response_model=dict)
async def read_poll(poll_id: int):
    poll = next((p for p in polls if p['id'] == poll_id), None)
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    return poll
