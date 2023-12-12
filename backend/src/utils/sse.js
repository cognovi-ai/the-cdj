let clients = [];

export const initSSE = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
  });

  // Add this client to the clients array
  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res
  };
  clients.push(newClient);

  // Remove client from array when connection is closed
  req.on('close', () => {
    clients = clients.filter(client => client.id !== clientId);
  });
};
