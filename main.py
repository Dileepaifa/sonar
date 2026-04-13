import os
import subprocess
import pickle
import base64
import sqlite3
import hashlib
from flask import Flask, request

app = Flask(__name__)

# 1. HARDCODED SENSITIVE DATA (High Severity - Vulnerability)
# Flagged as a "Critical" security risk.
AWS_SECRET_CONFIG = "AKIAIOSFODNN7EXAMPLE/wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"

# 2. INSECURE DATABASE PATH (Basic - Code Smell)
DB_PATH = "/tmp/aifa_test_db.sqlite"

@app.route('/login', methods=['POST'])
def login():
    username = request.form.get('username')
    password = request.form.get('password')

    # 3. SQL INJECTION (High Severity - Vulnerability)
    # Blocker: String formatting directly into SQL.
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    query = "SELECT * FROM users WHERE username = '%s'" % username
    cursor.execute(query)
    
    # 4. WEAK HASHING (Intermediate - Security Hotspot)
    # MD5 is cryptographically broken.
    h = hashlib.md5(password.encode()).hexdigest()
    
    return f"Logged in user hash: {h}"

@app.route('/internal/exec', methods=['POST'])
def run_internal_tool():
    # 5. COMMAND INJECTION (High Severity - Vulnerability)
    # Blocker: shell=True with user input allows RCE.
    cmd_param = request.form.get('cmd')
    result = subprocess.check_output(f"ls -la {cmd_param}", shell=True)
    return result

@app.route('/load-config', methods=['POST'])
def load_config():
    # 6. INSECURE DESERIALIZATION (High Severity - Vulnerability)
    # Critical: Unpickling user-controlled data.
    data = request.form.get('payload')
    user_obj = pickle.loads(base64.b64decode(data))
    return "Configuration Loaded"

@app.route('/debug')
def debug_info():
    # 7. MULTIPLE CODE SMELLS (Basic/Intermediate)
    # Nested try-except, unused variables, and broad exceptions.
    try:
        unused_info = "Sensitive Traceback"
        x = 1/0
    except Exception:
        # 8. SENSITIVE DATA EXPOSURE (Intermediate)
        import traceback
        return traceback.format_exc()

if __name__ == "__main__":
    # 9. INSECURE SERVER CONFIG (Intermediate - Vulnerability)
    # Running on 0.0.0.0 with debug=True.
    app.run(debug=True, host='0.0.0.0', port=5000)