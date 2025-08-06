const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ 
    message: 'SkillBridge API is running!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
