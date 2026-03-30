const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
app.get('/', (req, res) => res.json({ status: 'ok' }));
const PORT = 5001;
server.listen(PORT, () => console.log(`Debug server on ${PORT}`));
