const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');

const app = express();
app.use(bodyParser.json());

// Hardcoded credentials (Vulnerability #1)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123', // hardcoded password
    database: 'testdb'
});

// Weak JWT secret (Vulnerability #2)
const SECRET = "12345";

// No input validation (Vulnerability #3)
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // SQL Injection (Vulnerability #4)
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    db.query(query, (err, results) => {
        if (err) {
            return res.send(err); // Information leakage (Vulnerability #5)
        }

        if (results.length > 0) {
            // Insecure JWT
            const token = jwt.sign({ username }, SECRET);
            res.json({ token });
        } else {
            res.status(401).send("Invalid credentials");
        }
    });
});

// Command Injection (Vulnerability #6)
const { exec } = require('child_process');
app.get('/ping', (req, res) => {
    const host = req.query.host;

    exec(`ping -c 1 ${host}`, (err, stdout, stderr) => {
        if (err) {
            return res.send(stderr);
        }
        res.send(stdout);
    });
});

// XSS vulnerability (Vulnerability #7)
app.get('/search', (req, res) => {
    const query = req.query.q;
    res.send(`<h1>Results for: ${query}</h1>`);
});

// Open redirect (Vulnerability #8)
app.get('/redirect', (req, res) => {
    const url = req.query.url;
    res.redirect(url);
});

// Insecure file read (Path Traversal) (Vulnerability #9)
const fs = require('fs');
app.get('/read-file', (req, res) => {
    const file = req.query.file;
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) return res.send(err);
        res.send(data);
    });
});

// No rate limiting (Vulnerability #10)
app.get('/data', (req, res) => {
    res.send("Sensitive data exposed");
});

app.listen(3000, () => {
    console.log('Vulnerable app running on port 3000');
});