// Server-Sent Events (SSE) Manager for Real-time push updates to React clients
let clients = [];

export const addClient = (req, res) => {
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  clients.push(newClient);

  // Send initial connected ping
  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', message: 'SSE Live Stream Connected', clientId })}\n\n`);

  req.on('close', () => {
    clients = clients.filter(c => c.id !== clientId);
  });
};

export const broadcastEvent = (eventType, payload) => {
  const message = `data: ${JSON.stringify({ type: eventType, data: payload, timestamp: new Date().toISOString() })}\n\n`;
  clients.forEach(c => {
    try {
      c.res.write(message);
    } catch (err) {
      // client disconnected
    }
  });
};
