const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const {SpeechClient} = require('@google-cloud/speech');

const app = express();
const port = process.env.PORT || 3000;

const speechClient = new SpeechClient();

const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
  let recognizeStream = null;

  function startRecognitionStream() {
    recognizeStream = speechClient
      .streamingRecognize({
        config: {
          encoding: 'LINEAR16',
          sampleRateHertz: 44100,
          languageCode: 'el-GR',
          enableAutomaticPunctuation: true,
          model: 'default',
        },
        interimResults: true,
      })
      .on('error', (error) => {
        console.error('Speech API error:', error);
        ws.send(JSON.stringify({ type: 'error', error: error.message }));
      })
      .on('data', (data) => {
        if (!data || !data.results || data.results.length === 0) return;
        const result = data.results[0];
        if (!result.alternatives || result.alternatives.length === 0) return;
        ws.send(JSON.stringify({
          type: 'transcript',
          transcript: result.alternatives[0].transcript || '',
          isFinal: result.isFinal || false,
        }));
      });
  }

  startRecognitionStream();

  ws.on('message', (message) => {
    if (typeof message === 'string') {
      try {
        const data = JSON.parse(message);
        if (data.type === 'stop' && recognizeStream) {
          recognizeStream.end();
        }
      } catch (e) {
        console.warn('Invalid JSON message', e);
      }
      return;
    }

    if (recognizeStream) {
      recognizeStream.write(message);
    }
  });

  ws.on('close', () => {
    if (recognizeStream) {
      try { recognizeStream.end(); } catch (err) {}
    }
  });
});

server.on('upgrade', (request, socket, head) => {
  if (request.url === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

server.listen(port, () => {
  console.log(`Speech proxy server listening on http://localhost:${port}`);
});
