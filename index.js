const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const port = 3000;

const OPENAI_API_KEY = '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';

app.use(express.json());
app.use(cors()); // Allow all CORS requests

app.get('/extract-text', async (req, res) => {
  const { url } = req.query;

  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    const selector = '.attributed-text-segment-list__container';
    const element = $(selector);
    let text = element.text().trim();

    // Remove non-printable characters from the text
    text = text.replace(/[\x00-\x1F\x7F-\x9F]/g, '');

    const requestBody = {
      prompt: `The following is a linkedin post. Act as my personal assistant and write atleast four appropriate comments for the post:  \n\n"${text}"`,
      temperature: 0.7,
      max_tokens: 2049,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    };

    console.log('Sending request:', JSON.stringify(requestBody, null, 2));

    const openaiResponse = await axios.post(
      'https://api.openai.com/v1/engines/text-davinci-003/completions',
      requestBody,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    const summary = openaiResponse.data.choices[0].text.trim().split('\n').map(s => s.trim()).join('\n ');

    console.log('Received response:', JSON.stringify(openaiResponse.data, null, 2));
    res.send(summary); // Send the summary as plain text
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to extract text or generate summary' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
