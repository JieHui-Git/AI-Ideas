from flask import Flask, request, jsonify
import sqlite3

app = Flask(__name__)

def init_db():
  conn = sqlite3.connect('urls.db')
  c = conn.cursor()
  c.execute('''CREATE TABLE IF NOT EXISTS urls (short_url TEXT PRIMARY KEY, long_url TEXT)''')
  conn.commit()
  conn.close()

init_db()

@app.route('/shorten', methods=['POST'])
def shorten_url():
  data = request.get_json()
  long_url = data['long_url']
  
  conn = sqlite3.connect('urls.db')
  c = conn.cursor()
  c.execute('SELECT * FROM urls WHERE long_url = ?', (long_url,))
  url = c.fetchone()

  if url:
    short_url = url[0]
  else:
    import uuid
    short_url = str(uuid.uuid4())[:6]  # generate a random string
    while True:
      conn = sqlite3.connect('urls.db')
      c = conn.cursor()
      c.execute('SELECT * FROM urls WHERE short_url = ?', (short_url,))
      existing_url = c.fetchone()
      if not existing_url:
        break
      short_url = str(uuid.uuid4())[:6]

    c.execute('INSERT INTO urls VALUES (?, ?)', (short_url, long_url))
    conn.commit()

  full_short_url = request.host_url + short_url
  conn.close()

  return jsonify({'short_url': full_short_url})

@app.route('/<short_url>/redirect', methods=['GET'])
def redirect_to_long(short_url):
  conn = sqlite3.connect('urls.db')
  c = conn.cursor()
  c.execute('SELECT long_url FROM urls WHERE short_url = ?', (short_url,))
  url = c.fetchone()

  if url:
    return {'redirect': url[0]}
  else:
    return jsonify({'error': 'Short URL not found'}), 404

if __name__ == '__main__':
  app.run(debug=True, port=5000)
