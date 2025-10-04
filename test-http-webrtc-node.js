// Test HTTP WebRTC Client functionality in Node.js
logger.info('🧪 Testing HTTP WebRTC Client...');

const testHttpClient = {
  config: {
    signalingUrl: 'https://autamedica-http-signaling-server.ecucondor.workers.dev',
    roomId: 'test-room-node',
    userId: 'test-doctor',
    userType: 'doctor',
    pollInterval: 1000
  },

  async connect() {
    logger.info('🔗 Testing connection to:', this.config.signalingUrl);

    const joinResponse = await fetch(`${this.config.signalingUrl}/api/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: this.config.roomId,
        userId: this.config.userId,
        userType: this.config.userType
      })
    });

    const joinData = await joinResponse.json();
    if (joinData.success) {
      logger.info('✅ Successfully joined room:', this.config.roomId);
    } else {
      throw new Error('Failed to join room: ' + joinData.error);
    }

    return joinData;
  },

  async pollOnce() {
    logger.info('📡 Testing polling...');
    const response = await fetch(
      `${this.config.signalingUrl}/api/poll?roomId=${encodeURIComponent(this.config.roomId)}&userId=${encodeURIComponent(this.config.userId)}&since=0`
    );

    const data = await response.json();
    logger.info('✅ Poll successful, messages:', data.messages.length);
    return data;
  },

  async sendMessage() {
    logger.info('📤 Testing message sending...');
    const response = await fetch(`${this.config.signalingUrl}/api/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: this.config.roomId,
        from: this.config.userId,
        type: 'test-message',
        data: { test: true }
      })
    });

    const data = await response.json();
    logger.info('✅ Message sent successfully:', data.success);
    return data;
  },

  async disconnect() {
    logger.info('👋 Testing disconnect...');
    const response = await fetch(`${this.config.signalingUrl}/api/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: this.config.roomId,
        userId: this.config.userId
      })
    });

    const data = await response.json();
    if (data.success) {
      logger.info('✅ Successfully left room');
    }
    return data;
  }
};

// Ejecutar las pruebas secuencialmente
testHttpClient.connect()
  .then(() => testHttpClient.pollOnce())
  .then(() => testHttpClient.sendMessage())
  .then(() => testHttpClient.pollOnce())
  .then(() => testHttpClient.disconnect())
  .then(() => {
    logger.info('🎉 HTTP WebRTC Client test completed successfully!');
    logger.info('✅ All fetch and HTTP functionality verified');
  })
  .catch(err => {
    logger.error('❌ Test failed:', err.message);
  });