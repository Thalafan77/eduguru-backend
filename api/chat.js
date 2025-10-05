const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.use(express.json());

// ChatGPT key (hardcoded)
const CHATGPT_KEY = "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";

// root responds to /api/chat when this file is mounted at /api/chat
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Chat function ready' });
});

app.post('/', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        'Authorization': 'Bearer ' + CHATGPT_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
        max_tokens: 200
      })
    });

    const data = await response.json();

    if (!data || !data.choices || !data.choices[0]) {
      return res.status(500).json({ error: 'Invalid response from ChatGPT' });
    }

    const aiResponse = data.choices[0].message && data.choices[0].message.content
      ? data.choices[0].message.content
      : "No response";

    res.json({ response: aiResponse });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: String(error.message || error) });
  }
});

module.exports = app;
