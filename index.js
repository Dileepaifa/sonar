const express = require('express');
const mysql = require('mysql');
const crypto = require('crypto');
const { exec } = require('child_process');
const axios = require('axios'); // For SSRF example
const serialize = require('node-serialize'); // For Insecure Deserialization

const app = express();
app.use(express.json());

const connection = mysql.createConnection({ 
    host: 'localhost', 
    user: 'root', 
    password: 'password123' // Hardcoded Credential (Security Hotspot)
});

// 1. SQL Injection (Critical)
app.get('/user', (req, res) => {
    const userId = req.query.id;
    const query = `SELECT * FROM users WHERE id = ${userId}`; // Unsanitized input
    connection.query(query, (err, results) => {
        res.send(results);
    });
});

// 2. OS Command Injection (Blocker)
app.get('/system/ping', (req, res) => {
    const ip = req.query.ip;
    // Malicious input like "; rm -rf /" could be passed here
    exec(`ping -c 1 ${ip}`, (error, stdout) => {
        res.send(stdout);
    });
});

// 3. Server-Side Request Forgery - SSRF (Major)
app.get('/fetch-url', async (req, res) => {
    const targetUrl = req.query.url;
    // An attacker could use this to scan internal EC2 metadata at 169.254.169.254
    try {
        const response = await axios.get(targetUrl);
        res.send(response.data);
    } catch (e) {
        res.status(500).send("Error fetching URL");
    }
});

// 4. Insecure Deserialization (Critical)
app.post('/profile', (req, res) => {
    if (req.body.cookie) {
        // Deserializing untrusted data can lead to Remote Code Execution (RCE)
        const obj = serialize.unserialize(req.body.cookie);
        res.send(`Hello ${obj.name}`);
    }
});

// 5. Weak Hashing Algorithm (Security Hotspot)
app.get('/hash', (req, res) => {
    const data = req.query.data;
    const hash = crypto.createHash('md5').update(data).digest('hex'); // MD5 is weak
    res.send(hash);
});

// 6. Broken Access Control / Insecure Direct Object Reference (IDOR)
app.get('/api/get-invoice', (req, res) => {
    const invoiceId = req.query.id;
    // No check if the current user actually owns this invoice
    connection.query(`SELECT * FROM invoices WHERE id = ${invoiceId}`, (err, results) => {
        res.send(results);
    });
});

app.listen(3000, () => console.log('Extreme Vulnerability Lab running on port 3000'));
