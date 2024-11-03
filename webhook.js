const axios = require('axios');
const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
  try {
    console.log("Request headers:", req.headers);
    console.log("Request body received:", req.body);

    if (!req.body || !req.body.queryResult || !req.body.queryResult.parameters) {
      console.log("Invalid request format");
      return res.status(400).send("Invalid request format");
    }

    const { queryResult } = req.body;
    const query = queryResult.parameters.query;

    if (!query) {
      console.log("Query is undefined or empty");
      return res.status(400).send("Query is undefined or empty");
    }

    if (!process.env.GOOGLE_API_KEY) {
      console.log("GOOGLE_API_KEY is not defined");
      return res.status(500).send("GOOGLE_API_KEY is not defined");
    }

    console.log("GOOGLE_API_KEY:", process.env.GOOGLE_API_KEY);

    console.log("Making request to Google Custom Search");
    const response = await axios.get(`https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=90d22e418744f4392&q=${encodeURIComponent(query)}+site=guerrestellari.net`);

    console.log("Google Custom Search response:", response.data);

    const results = response.data.items ? response.data.items.map(item => item.title).join(', ') : 'No results found';

    const responseMessage = `Risultati trovati per '${query}': ${results}`;
    console.log("Response message:", responseMessage);
    res.status(200).json({ fulfillmentText: responseMessage });
  } catch (error) {
    console.error("Errore nella gestione della richiesta:", error.message);
    res.status(500).send("Errore nella comunicazione con Google Custom Search.");
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

module.exports = app;
