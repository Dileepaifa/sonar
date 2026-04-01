// index.js
const express = require('express');
const app = express();
const port = 3000;

// Code Smell: Unused variable
const unusedVar = "I am not used"; 

// Security Risk: Hardcoded "secret" (SonarQube will flag this)
const apiKey = "12345-ABCDE-67890-FGHIJ"; 

app.get('/', (req, res) => {
  res.send('Hello World! SonarQube is watching.');
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
