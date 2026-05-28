# Poll Creator App

## Setup Instructions

### Backend
1. Navigate to the `backend` directory.
2. Install dependencies: `pip install -r requirements.txt`.
3. Start the server: `uvicorn main:app --reload`.

### Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies: `npm install`.
3. Start the dev server: `npm run dev`.

## How It Works

This app allows users to create simple polls and vote on them. The frontend is built with React + Vite for interactive UI, while Express handles backend operations and SQLite stores the poll data.
