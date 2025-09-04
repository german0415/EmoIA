const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/chat", async (req, res) => {
  const { userMessage } = req.body;
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer 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"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Eres un chatbot de apoyo emocional llamado EmoIA. Responde siempre con empatía, apoyo, escucha activa y sin dar consejos médicos ni diagnósticos. Usa un tono cálido y cercano." },
        { role: "user", content: userMessage }
      ],
      max_tokens: 150,
      temperature: 0.8
    })
  });
  const data = await response.json();
  res.json(data);
});

app.listen(3000, () => console.log("Backend listo en http://localhost:3000"));