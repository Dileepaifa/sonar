const express = require('express');
const app = express();

// 1. HARDCODED PASSWORD (Security Risk)
const password = "password123"; 

// 2. EVIL EVAL (Critical Security Risk)
const user_input = "console.log('hi')";
eval(user_input); 

// 3. UNUSED VARIABLE (Code Smell)
var x = 10; 

app.get('/', (req, res) => {
  // 4. WEAK ENCRYPTION (Security Hotspot)
  const crypto = require('crypto');
  const hash = crypto.createHash('md5').update('data').digest('hex');
  
  res.send('Testing SonarQube Analysis');
});

app.listen(3000);
