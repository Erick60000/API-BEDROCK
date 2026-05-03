const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

const app = express();
const port = 3000;

// Configure AWS Bedrock client
const client = new BedrockRuntimeClient({ region: 'us-east-1' }); // Change region as needed

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from root

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Prepare the request for Amazon Titan Text Lite
    const input = {
      modelId: 'amazon.titan-text-lite-v1',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        inputText: message,
        textGenerationConfig: {
          maxTokenCount: 100,
          temperature: 0.7,
          topP: 1,
        },
      }),
    };

    const command = new InvokeModelCommand(input);
    const response = await client.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const generatedText = responseBody.results[0].outputText;

    res.json({ response: generatedText });
  } catch (error) {
    console.error('Error calling Bedrock:', error);
    res.status(500).json({ error: 'Failed to get response from AI' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
