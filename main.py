from flask import Flask, request, jsonify, redirect
import sqlite3
import jwt
import os
import subprocess

app = Flask(__name__)

# Hardcoded secret (Vulnerability #1)
SECRET_KEY = "secret123"

# Hardcoded DB path (Vulnerability #2)
DB_PATH = "users.db"

# Create DB (for demo)
conn = sqlite3.connect(DB_PATH)
conn.execute("CREATE TABLE IF NOT EXISTS users (username TEXT, password TEXT)")
conn.commit()
conn.close()


# SQL Injection (Vulnerability #3)
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Unsafe query
    query = f"SELECT * FROM users WHERE username='{username}' AND password='{password}'"
    cursor.execute(query)

    user = cursor.fetchone()
    conn.close()

    if user:
        # Weak JWT (Vulnerability #4)
        token = jwt.encode({"user": username}, SECRET_KEY, algorithm="HS256")
        return jsonify({"token": token})
    else:
        return "Invalid credentials", 401


# Command Injection (Vulnerability #5)
@app.route('/ping')
def ping():
    host = request.args.get('host')
    result = subprocess.getoutput(f"ping -c 1 {host}")
    return result


# XSS (Vulnerability #6)
@app.route('/search')
def search():
    q = request.args.get('q')
    return f"<h1>Results for: {q}</h1>"


# Open Redirect (Vulnerability #7)
@app.route('/redirect')
def open_redirect():
    url = request.args.get('url')
    return redirect(url)


# Path Traversal (Vulnerability #8)
@app.route('/read-file')
def read_file():
    filename = request.args.get('file')
    try:
        with open(filename, 'r') as f:
            return f.read()
    except Exception as e:
        return str(e)


# Insecure file upload (Vulnerability #9)
@app.route('/upload', methods=['POST'])
def upload():
    file = request.files['file']
    file.save(os.path.join("uploads", file.filename))  # no validation
    return "File uploaded"


# Debug mode enabled (Vulnerability #10)
if __name__ == '__main__':
    app.run(debug=True)