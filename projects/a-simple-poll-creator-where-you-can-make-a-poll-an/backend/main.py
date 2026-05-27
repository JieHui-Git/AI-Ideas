from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)

def get_db_connection():
    conn = sqlite3.connect('data.db')
    conn.row_factory = sqlite3.Row
    return conn

@app.before_first_request
def create_tables():
    conn = get_db_connection()
    conn.execute('''CREATE TABLE IF NOT EXISTS polls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        options TEXT NOT NULL,
        votes TEXT NOT NULL
    )''')
    conn.commit()
    conn.close()

@app.route('/polls', methods=['POST'])
def create_poll():
    data = request.json
    conn = get_db_connection()
    conn.execute('''INSERT INTO polls (question, options, votes)
        VALUES (?, ?, ?)''', 
        (data['question'], ','.join(data['options']),(','.join('0' for _ in range(len(data['options']))))
    ))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Poll created successfully'}), 201

@app.route('/polls', methods=['GET'])
def get_polls():
    conn = get_db_connection()
    polls = conn.execute('''SELECT * FROM polls''').fetchall()
    conn.close()
    poll_list = []
    for poll in polls:
        options = poll['options'].split(',')
        votes = list(map(int, poll['votes'].split(',')))
        poll_dict = {
            'id': poll['id'],
            'question': poll['question'],
            'options': options,
            'votes': votes
        }
        poll_list.append(poll_dict)
    return jsonify(poll_list), 200

@app.route('/polls/<int:poll_id>/vote/<int:option_index>', methods=['POST'])
def vote(poll_id, option_index):
    conn = get_db_connection()
    cur = conn.execute('''SELECT * FROM polls WHERE id  = ?''', (poll_id))
    poll = cur.fetchone()
    options = poll['options'].split(',')
    votes = list(map(int, poll['votes'].split(',')))
    votes[option_index] += 1
    conn.execute('''UPDATE polls SET options = ?, votes = ? WHERE id = ?''',
               (','.join(options), ','.join(map(str, votes)), poll_id))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Vote counted successfully'}), 200

if __name__ == '__main__':
    app.run(debug=True)
