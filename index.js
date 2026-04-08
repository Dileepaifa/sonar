const express = require('express');
const path = require('path');
const mysql = require('mysql');
const serialize = require('serialize-javascript');
const { exec } = require('child_process');
const axios = require('axios'); // For SSRF example
const serialize = require('node-serialize'); // For Insecure Deserialization

const app = express();
app.use(express.json());

<<<<<<< HEAD
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
=======
// 1. INSECURE DESERIALIZATION (Critical)
// Using an old version of a library to handle objects can lead to RCE
const legacyData = '{"user": "admin", "role": "superuser"}';
const obj = JSON.parse(legacyData); 

// 2. CROSS-SITE SCRIPTING (XSS)
// Using serialize-javascript without proper sanitization
app.get('/profile', (req, res) => {
    const userProfile = { name: req.query.name || "Guest" };
    res.send(`
        <script>
            window.user = ${serialize(userProfile)}; // VULNERABLE TO XSS
        </script>
    `);
});

// 3. PATH TRAVERSAL (Blocker)
// Allowing users to define the file path directly
app.get('/download', (req, res) => {
    const fileName = req.query.file;
    const filePath = path.join(__dirname, 'public', fileName);
    res.sendFile(filePath); // Attacker can use ../../../etc/passwd
});

// 4. COMMAND INJECTION (Blocker)
// Running system commands with user-controlled input
app.get('/network-check', (req, res) => {
    const target = req.query.ip;
    exec(`nslookup ${target}`, (err, stdout) => {
        res.send(stdout);
    });
});

// 5. INSECURE SQL QUERY (Critical)
const db = mysql.createConnection({ host: 'localhost', user: 'root', password: '' });
app.get('/search', (req, res) => {
    const sql = "SELECT * FROM products WHERE name = '" + req.query.name + "'";
    db.query(sql, (err, result) => {
        res.send(result);
    });
});

// 6. SENSITIVE DATA EXPOSURE
// Hardcoded credentials and debugging info
const ADMIN_PASS = "SuperSecret123!";
app.get('/debug', (req, res) => {
    res.json({ config: process.env, db_password: ADMIN_PASS });
});

app.listen(3000);
>>>>>>> 79e3eec (code issues)
