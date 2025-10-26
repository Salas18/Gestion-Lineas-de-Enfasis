// 1. Cargar las variables de entorno (la API key)
require('dotenv').config();

// 2. Importar las librerías necesarias
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Usando node-fetch@2

// 3. Inicializar el servidor
const app = express();
app.use(cors()); // Habilita CORS
app.use(express.json()); // Permite al servidor entender JSON

// 4. Leer la API key de Groq (¡CAMBIO 1!)
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// 5. Definir la URL de la API de Groq (¡CAMBIO 2!)
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// 6. Definir el "cerebro" o personalidad de la IA (Este se queda igual)
const systemPrompt = `
Eres un asistente virtual de orientación para la Universidad de Medellín.
Tu nombre es "UdeM Virtual".
Tu único propósito es ayudar a los estudiantes a entender las líneas de énfasis.
Debes ser amable, profesional y usar un lenguaje claro.
NO hables de temas que no sean de la universidad o las líneas de énfasis.
Si te preguntan por algo irrelevante (como "qué es la computación cuántica" o "quién eres"),
responde amablemente que no puedes ayudar con eso y redirige la conversación a las líneas de énfasis.
`;

// 7. Crear el endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const userInput = req.body.prompt; 

    if (!userInput) {
      return res.status(400).json({ error: 'No se recibió ningún prompt.' });
    }

    // El "cuerpo" que Groq espera (es idéntico al de OpenAI)
    const requestBody = {
      model: 'llama-3.1-8b-instant', // ¡CAMBIO 3! Usamos el modelo más rápido y ACTIVO
      messages: [
        { role: 'system', content: systemPrompt }, // La personalidad
        { role: 'user', content: userInput }      // La pregunta del usuario
      ]
    };

    // 8. Llamar a la API de Groq
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}` // ¡CAMBIO 4! Usamos la key de Groq
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      // Si Groq da un error (API key mala, etc.)
      const errorData = await response.json();
      console.error('Error de la API de Groq:', errorData);
      return res.status(response.status).json({ error: 'Error de la API de Groq', details: errorData });
    }

    // 9. Leer la respuesta y enviarla al frontend
    const data = await response.json();

    // La respuesta de Groq también es idéntica a la de OpenAI
    if (data.choices && data.choices[0] && data.choices[0].message) {
      res.json({ response: data.choices[0].message.content });
    } else {
      res.json({ response: 'No pude generar una respuesta.' });
    }

  } catch (error) {
    // Si nuestro propio servidor falla
    console.error('Error en el servidor:', error);
    res.status(500).json({ error: 'Error en el servidor: ' + error.message });
  }
});

// 10. Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`¡¡¡LA VENCIDA! Servidor con GROQ ⚡ escuchando en http://localhost:${PORT}!!!`);
});