const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const clearChatBtn = document.getElementById("clearChatBtn");
const newChatBtn = document.getElementById("newChatBtn");
const exportBtn = document.getElementById("exportBtn");

// —— Estado —— //
let messages = loadMessages() || [
  { sender: "bot", text: "👋 Hola, soy EmoIA. Cuéntame cómo te sientes hoy.", emotion: "neutral", confidence: 0.72 },
];

// Render inicial
render();

// —— Utilidades —— //
function addMessage(text, sender = "user") {
  const emotion = detectEmotionMock(text);
  const confidence = +(0.75 + Math.random() * 0.2).toFixed(2);
  messages.push({ sender, text, emotion, confidence });
  saveMessages();
  render();

  if (sender === "user") {
    setTimeout(async () => {
      // const reply = generateSupportMessage(emotion); // ← ya no usamos esto
      const reply = await getBotResponse(text);
      messages.push({ sender: "bot", text: reply, emotion, confidence: +(0.8 + Math.random() * 0.15).toFixed(2) });
      saveMessages();
      render();
    }, 700);
  }
}

function render() {
  chatBox.innerHTML = "";
  messages.forEach(m => chatBox.appendChild(messageNode(m)));
  chatBox.scrollTop = chatBox.scrollHeight;
}

function messageNode({ sender, text, emotion, confidence }) {
  const li = document.createElement("div");
  li.className = `message ${sender}`;

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = sender === "user" ? "Tú" : "IA";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.innerText = text;

  const meta = document.createElement("div");
  meta.className = "meta";
  meta.innerHTML = `Emoción: <strong>${emotion}</strong> · Confianza: ${(confidence * 100).toFixed(0)}%`;

  const wrap = document.createElement("div");
  wrap.appendChild(bubble);
  wrap.appendChild(meta);

  li.appendChild(avatar);
  li.appendChild(wrap);
  return li;
}

// —— Persistencia con localStorage —— //
function saveMessages() {
  localStorage.setItem("emoia_chat", JSON.stringify(messages));
}

function loadMessages() {
  const saved = localStorage.getItem("emoia_chat");
  return saved ? JSON.parse(saved) : null;
}

// —— Lógica mock de emociones —— //
function detectEmotionMock(text) {
  const t = text.toLowerCase();
  if (/(feliz|content|alegr|genial|bien)/.test(t)) return "happy";
  if (/(triste|deprim|mal|solo)/.test(t)) return "sad";
  if (/(enoja|rabia|molest|furios)/.test(t)) return "angry";
  if (/(miedo|ansied|nervi|preocup)/.test(t)) return "fear";
  return "neutral";
}

function generateSupportMessage(emotion) {
  const tips = {
    happy: "Me alegra que te sientas bien 😄. ¿Qué pasó hoy que te hizo sentir así?",
    sad: "Siento que te sientas triste 😔. Respirar profundo y hablarlo ayuda. ¿Quieres intentarlo?",
    angry: "Es válido sentir enojo 😠. Identifiquemos el detonante y pensemos una acción concreta.",
    fear: "La ansiedad puede ser intensa 😟. Probemos 4-7-8: inhala 4s, sostén 7s, exhala 8s.",
    neutral: "Gracias por compartir 💚. Si quieres, describe tu ánimo del 1 al 10."
  };
  return tips[emotion] || tips.neutral;
}

// —— Eventos —— //
sendBtn?.addEventListener("click", sendMessage);
userInput?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

clearChatBtn?.addEventListener("click", () => {
  messages = [];
  saveMessages();
  render();
});

newChatBtn?.addEventListener("click", () => {
  messages = [
    { sender: "bot", text: "🧠 Nuevo chat iniciado. ¿Cómo te sientes ahora?", emotion: "neutral", confidence: 0.75 }
  ];
  saveMessages();
  render();
});

exportBtn?.addEventListener("click", () => {
  const data = messages.map(m => ({
    sender: m.sender, text: m.text, emotion: m.emotion, confidence: m.confidence
  }));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "emoia_chat.json";
  document.body.appendChild(a); a.click();
  a.remove(); URL.revokeObjectURL(url);
});

// 🚀 Obtener respuesta real desde OpenAI
async function getBotResponse(userMessage) {
  try {
    const response = await fetch("http://localhost:3000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userMessage })
    });

    const data = await response.json();

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      return "Lo siento, estoy teniendo problemas para responder en este momento 😔.";
    }
  } catch (error) {
    console.error("Error con la API:", error);
    return "Ha ocurrido un error al conectarme. Intenta nuevamente más tarde.";
  }
}

async function sendMessage() {
  const inputField = document.getElementById("userInput");
  const userMessage = inputField.value.trim();

  if (userMessage === "") return;

  // Mostrar mensaje del usuario
  addMessage(userMessage, "user");

  // Vaciar campo
  inputField.value = "";

  // Mostrar estado "escribiendo..."
  messages.push({
    sender: "bot",
    text: "💭 Estoy pensando...",
    emotion: "neutral",
    confidence: 0.7
  });
  render();

  // Obtener respuesta desde OpenAI
  const botResponse = await getBotResponse(userMessage);

  // Reemplazar el mensaje de "pensando" por la respuesta real
  messages[messages.length - 1].text = botResponse;
  render();
  saveMessages();
}

function replaceLastBotMessage(newText) {
  // Busca el último mensaje del bot en el arreglo
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].sender === "bot") {
      messages[i].text = newText;
      break;
    }
  }
  render();
  saveMessages();
}
