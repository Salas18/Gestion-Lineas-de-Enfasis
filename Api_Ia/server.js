// 1. Cargar las librerías
require('dotenv').config(); // Carga las variables del archivo .env
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

// 2. Inicializar el servidor
const app = express();
app.use(cors()); // Habilita CORS para que tu frontend pueda hacer peticiones
app.use(express.json()); // Permite al servidor entender JSON

// 3. Leer la API key de forma SEGURA desde el archivo .env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

// 4. Crear el endpoint (la URL que llamará tu frontend)
app.post('/api/chat', async (req, res) => {
    try {
        // Recibe el prompt que envió el frontend
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'El "prompt" es requerido' });
        }

        // Llama a la API de Gemini (de forma segura desde el backend)
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error de la API de Gemini: ${errorText}`);
        }

        const data = await response.json();

        // 5. Enviar la respuesta de vuelta al frontend
        if (data.candidates && data.candidates.length > 0) {
            // Envía solo el texto de la respuesta
            res.json({ response: data.candidates[0].content.parts[0].text });
        } else {
            res.json({ response: "No pude generar una respuesta." });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error en el servidor: ' + error.message });
    }
});

// 6. Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en http://localhost:${PORT} 🚀`);
});