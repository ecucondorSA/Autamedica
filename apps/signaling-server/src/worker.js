/**
 * Cloudflare Workers implementation of the signaling server
 * HTTP-based signaling using fetch and polling for better reliability
 */

import { HttpSignalingAPI } from './http-api.js'

// Global instance of HTTP API
const httpApi = new HttpSignalingAPI()

// Schedule cleanup every 30 seconds
const CLEANUP_INTERVAL = 30000

export default {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url)

    // Handle all HTTP API routes
    if (pathname.startsWith('/api/') || pathname === '/health') {
      return await httpApi.handleRequest(request, env)
    }

    // Legacy WebSocket endpoint - return helpful message
    if (pathname === '/signaling') {
      return new Response(JSON.stringify({
        error: 'WebSocket endpoint deprecated',
        message: 'Please use HTTP API endpoints: /api/join, /api/poll, /api/message',
        documentation: 'https://github.com/autamedica/signaling-server'
      }), {
        status: 410,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // API documentation
    if (pathname === '/') {
      return new Response(`
<!DOCTYPE html>
<html>
<head>
    <title>AltaMedica Signaling Server - HTTP API</title>
    <style>body{font-family:Arial,sans-serif;margin:40px;}</style>
</head>
<body>
    <h1>🏥 AltaMedica Signaling Server</h1>
    <p><strong>Status:</strong> ✅ Active</p>
    <p><strong>Mode:</strong> HTTP API with polling</p>

    <h2>📡 API Endpoints</h2>
    <ul>
        <li><code>GET /health</code> - Server health check</li>
        <li><code>POST /api/join</code> - Join a room</li>
        <li><code>POST /api/leave</code> - Leave a room</li>
        <li><code>POST /api/message</code> - Send WebRTC message</li>
        <li><code>GET /api/poll</code> - Poll for new messages</li>
        <li><code>GET /api/room</code> - Get room information</li>
        <li><code>POST /api/ping</code> - Heartbeat/keep-alive</li>
    </ul>

    <h2>🔬 Test</h2>
    <p><a href="/test-websocket.html">WebSocket Test Page</a></p>

    <h2>📚 Integration</h2>
    <p>Use the <code>@autamedica/telemedicine</code> package for easy integration.</p>
</body>
</html>
    `, {
        headers: { 'Content-Type': 'text/html' }
      })
    }

    return new Response('Not Found', { status: 404 })
  },

  // Optional: Schedule periodic cleanup
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(httpApi.cleanup())
  }
}