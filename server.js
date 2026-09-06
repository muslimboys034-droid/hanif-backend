const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// The API key is read from an environment variable — NEVER hard-code it here.
const API_KEY = process.env.GROQ_API_KEY;

app.post('/chat', async (req, res) => {
  try {
    if (!API_KEY) {
      return res.status(500).json({ error: 'Server is missing GROQ_API_KEY. Set it in your hosting dashboard.' });
    }

    const { messages } = req.body;

    const groqMessages = [
      { role: 'system', content: "Your name is Hanif. If anyone asks your name, who you are, or who made you, answer that your name is Hanif. Stay in this persona throughout the conversation. Keep replies conversational, like a WhatsApp chat." },
      ...messages.map(m => ({ role: m.role, content: m.content }))
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages
      })
    });

    const data = await response.json();
    const replyText = data?.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
    res.json({ reply: replyText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong talking to the AI.' });
  }
});

app.get('/', (req, res) => {
  res.send('Hanif AI backend is running.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));
