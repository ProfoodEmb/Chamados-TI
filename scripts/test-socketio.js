const io = require('socket.io-client');

console.log('🔌 Testando conexão Socket.IO...\n');

const socket = io('http://localhost:3000', {
  path: '/api/socketio',
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('✅ Conectado ao Socket.IO!');
  console.log('   ID:', socket.id);
  console.log('   Transport:', socket.io.engine.transport.name);
});

socket.on('connected', (data) => {
  console.log('📡 Confirmação do servidor:', data);
});

socket.on('ticket-update', (data) => {
  console.log('📢 Evento recebido:', data);
});

socket.on('connect_error', (error) => {
  console.error('❌ Erro de conexão:', error.message);
});

socket.on('disconnect', (reason) => {
  console.log('🔌 Desconectado:', reason);
});

// Manter o script rodando
console.log('\n👂 Aguardando eventos... (Ctrl+C para sair)\n');

// Testar envio de evento a cada 10 segundos
setInterval(() => {
  console.log('💓 Heartbeat - Socket conectado:', socket.connected);
}, 10000);
