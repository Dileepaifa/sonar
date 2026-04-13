import os
import subprocess
import pickle
import base64
import sqlite3
import hashlib
from flask import Flask, request

app = Flask(__name__)

# 1. HARDCODED SECRET (High Severity - Vulnerability)
# SonarQube will flag this as a Blocker/Critical issue.
SECRET_KEY = "AIFA_LABS_INTERNAL_TOKEN_DO_NOT_SHARE_12345"

# 2. INSECURE DATABASE CONNECTION (Intermediate Severity - Code Smell/Bug)
# Using a hardcoded path and unencrypted SQLite
DB_PATH = "/tmp/test_db.sqlite"

@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')

    # 3. SQL INJECTION (High Severity - Vulnerability)
    # Directly formatting strings into SQL queries.
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    query = "SELECT * FROM users WHERE username = '%s' AND password = '%s'" % (username, password)
    cursor.execute(query)
    user = cursor.fetchone()
    
    # 4. WEAK HASHING (Basic Severity - Security Hotspot)
    # MD5 is outdated and insecure for passwords.
    h = hashlib.md5(password.encode()).hexdigest()
    
    return f"User authenticated with hash: {h}"

@app.route('/process-data', methods=['POST'])
def process_data():
    # 5. INSECURE DESERIALIZATION (High Severity - Vulnerability)
    # Using pickle.loads on user-provided data leads to Remote Code Execution (RCE).
    data = request.form.get('data')
    decoded_data = base64.b64decode(data)
    obj = pickle.loads(decoded_data) # CRITICAL ISSUE
    return "Data Processed"

@app.route('/debug-ping', methods=['GET'])
def debug_ping():
    # 6. COMMAND INJECTION (High Severity - Vulnerability)
    # shell=True with unsanitized input is a major security flaw.
    hostname = request.args.get('host')
    command = f"ping -c 1 {hostname}"
    result = subprocess.check_output(command, shell=True) 
    return result

@app.route('/useless-function')
def useless():
    # 7. MULTIPLE CODE SMELLS (Basic to Intermediate)
    # - Unused variables
    # - Deep nesting
    # - Large functions
    # - Broad Exception handling
    try:
        a = 10
        b = 20
        c = 30
        if a < b:
            if b < c:
                if True:
                    print("Deeply nested logic")
        unused_var = "I am never used"
    except Exception: # Too broad exception
        pass
    return "Check your smells"

if __name__ == "__main__":
    # 8. RUNNING IN DEBUG MODE (Intermediate - Vulnerability)
    app.run(debug=True, host='0.0.0.0')