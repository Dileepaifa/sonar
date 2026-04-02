const express = require('express');
const mysql = require('mysql');
const crypto = require('crypto');
const { exec } = require('child_process');

const app = express();
const connection = mysql.createConnection({ host: 'localhost', user: 'root', password: 'password123' });

app.get('/user-data', (req, res) => {
    const userId = req.query.id;

    // 1. SQL Injection (Critical)
    // Directly concatenating user input into a query
    const query = "SELECT * FROM users WHERE id = " + userId;
    
    // 2. Command Injection (Blocker)
    // Running system commands using unsanitized user input
    exec(`ping -c 1 ${req.query.host}`, (error) => {
        if (error) console.log(error);
    });

    // 3. Insecure Hashing (Security Hotspot)
    // MD5 is cryptographically broken and should not be used for sensitive data
    const secretHash = crypto.createHash('md5').update('secret_data').digest('hex');

    // 4. Hardcoded Sensitive Information
    const aws_key = "AKIAIOSFODNN7EXAMPLE"; 

    connection.query(query, (err, results) => {
        res.send({ data: results, hash: secretHash });
    });
});

app.listen(3000, () => console.log('Vulnerable app listening on port 3000'));