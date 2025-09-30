export default {
  fetch: (req: Request, env: any) => {
    const url = new URL(req.url)
    if (url.pathname === '/connect') return handleWS(req, env)
    return new Response(JSON.stringify({
      error: 'Not Found',
      availableEndpoints: ['/connect?roomId&userId&userType']
    }), { status: 404, headers: { 'content-type': 'application/json' }})
  }
}

type Meta = { userId?: string; userType?: 'doctor'|'patient'|'unknown'; roomId?: string }

const users = new Map<string, WebSocket>()                 // userId -> ws
const rooms = new Map<string, Set<WebSocket>>()            // roomId -> set<ws>
const metas = new WeakMap<WebSocket, Meta>()

function handleWS(req: Request, env: any) {
  const url = new URL(req.url)
  const userId = url.searchParams.get('userId') || undefined
  const userType = (url.searchParams.get('userType') as Meta['userType']) || 'unknown'
  const roomId = url.searchParams.get('roomId') || undefined
  const upgradeHeader = req.headers.get('Upgrade') || ''
  if (upgradeHeader.toLowerCase() !== 'websocket') return new Response('Expected websocket', { status: 400 })

  const { socket, response } = new WebSocketPair()
  const ws = socket as unknown as WebSocket
  ws.accept()

  metas.set(ws, { userId, userType, roomId })
  if (userId) users.set(userId, ws)
  if (roomId) {
    let set = rooms.get(roomId); if (!set) { set = new Set(); rooms.set(roomId, set) }
    set.add(ws)
  }

  ws.addEventListener('message', (evt: MessageEvent) => {
    try {
      const meta = metas.get(ws) || {}
      const msg = JSON.parse(String(evt.data))
      switch (msg.type) {
        // Control 1:1 (invite/accept/decline/cancel/end)
        case 'invite':
        case 'accept':
        case 'decline':
        case 'cancel':
        case 'end': {
          const to = users.get(msg.toUserId)
          if (to) to.send(JSON.stringify({ ...msg, fromUserId: meta.userId }))
          break
        }
        // Señalización sala (offer/answer/candidate/join/leave)
        case 'join': {
          broadcast(meta.roomId, { type: 'peer-joined', userId: meta.userId }, ws)
          break
        }
        case 'offer':
        case 'answer':
        case 'candidate': {
          broadcast(meta.roomId, { ...msg, fromUserId: meta.userId }, ws)
          break
        }
        default:
          // opcional: echo para debug
          ws.send(JSON.stringify({ ok: true, echo: msg.type }))
      }
    } catch (e) {
      try { ws.send(JSON.stringify({ error: 'bad-json' })) } catch {}
    }
  })

  ws.addEventListener('close', () => cleanup(ws))
  ws.addEventListener('error', () => cleanup(ws))

  return response
}

function cleanup(ws: WebSocket) {
  const meta = metas.get(ws) || {}
  if (meta.userId) users.delete(meta.userId)
  if (meta.roomId) rooms.get(meta.roomId)?.delete(ws)
  metas.delete(ws)
}

function broadcast(roomId: string | undefined, payload: any, exclude?: WebSocket) {
  if (!roomId) return
  const set = rooms.get(roomId); if (!set) return
  const raw = JSON.stringify(payload)
  for (const client of set) {
    if (client === exclude) continue
    try { client.send(raw) } catch { set.delete(client) }
  }
}