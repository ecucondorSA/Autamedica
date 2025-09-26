var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/http-api.js
var HttpSignalingAPI = class {
  static {
    __name(this, "HttpSignalingAPI");
  }
  constructor() {
    this.rooms = /* @__PURE__ */ new Map();
    this.userSessions = /* @__PURE__ */ new Map();
  }
  async handleRequest(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400"
    };
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders
      });
    }
    try {
      if (pathname === "/health") {
        return this.jsonResponse({
          status: "ok",
          time: (/* @__PURE__ */ new Date()).toISOString(),
          service: "autamedica-http-signaling"
        }, { headers: corsHeaders });
      }
      if (pathname === "/api/join" && method === "POST") {
        return this.handleJoin(request, corsHeaders);
      }
      if (pathname === "/api/leave" && method === "POST") {
        return this.handleLeave(request, corsHeaders);
      }
      if (pathname === "/api/message" && method === "POST") {
        return this.handleMessage(request, corsHeaders);
      }
      if (pathname === "/api/poll" && method === "GET") {
        return this.handlePoll(request, corsHeaders);
      }
      if (pathname === "/api/room" && method === "GET") {
        return this.handleRoomInfo(request, corsHeaders);
      }
      if (pathname === "/api/ping" && method === "POST") {
        return this.handlePing(request, corsHeaders);
      }
      return this.jsonResponse({ error: "Not found" }, {
        status: 404,
        headers: corsHeaders
      });
    } catch (error) {
      console.error("HTTP API Error:", error);
      return this.jsonResponse({
        error: "Internal server error",
        details: error.message
      }, {
        status: 500,
        headers: corsHeaders
      });
    }
  }
  async handleJoin(request, corsHeaders) {
    const body = await request.json();
    const { roomId, userId, userType } = body;
    if (!roomId || !userId || !userType) {
      return this.jsonResponse({
        error: "Missing required fields: roomId, userId, userType"
      }, { status: 400, headers: corsHeaders });
    }
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        users: /* @__PURE__ */ new Set(),
        messages: []
      });
    }
    const room = this.rooms.get(roomId);
    const userInfo = { userId, userType, joinedAt: Date.now() };
    room.users.add(JSON.stringify(userInfo));
    this.userSessions.set(userId, {
      roomId,
      userType,
      lastPing: Date.now()
    });
    const joinMessage = {
      type: "user-joined",
      from: userId,
      roomId,
      data: { userType },
      timestamp: Date.now()
    };
    room.messages.push(joinMessage);
    const users = Array.from(room.users).map((u) => JSON.parse(u));
    console.log(`User ${userId} joined room ${roomId} as ${userType}`);
    return this.jsonResponse({
      success: true,
      roomState: {
        users: users.filter((u) => u.userId !== userId),
        // Exclude self
        roomId
      }
    }, { headers: corsHeaders });
  }
  async handleLeave(request, corsHeaders) {
    const body = await request.json();
    const { roomId, userId } = body;
    if (!roomId || !userId) {
      return this.jsonResponse({
        error: "Missing required fields: roomId, userId"
      }, { status: 400, headers: corsHeaders });
    }
    const room = this.rooms.get(roomId);
    if (!room) {
      return this.jsonResponse({
        error: "Room not found"
      }, { status: 404, headers: corsHeaders });
    }
    const userSession = this.userSessions.get(userId);
    if (userSession) {
      const userInfo = { userId, userType: userSession.userType, joinedAt: 0 };
      room.users.delete(JSON.stringify(userInfo));
      this.userSessions.delete(userId);
      const leaveMessage = {
        type: "user-left",
        from: userId,
        roomId,
        data: { userType: userSession.userType },
        timestamp: Date.now()
      };
      room.messages.push(leaveMessage);
      console.log(`User ${userId} left room ${roomId}`);
    }
    return this.jsonResponse({
      success: true
    }, { headers: corsHeaders });
  }
  async handleMessage(request, corsHeaders) {
    const body = await request.json();
    const { roomId, from, to, type, data } = body;
    if (!roomId || !from || !type) {
      return this.jsonResponse({
        error: "Missing required fields: roomId, from, type"
      }, { status: 400, headers: corsHeaders });
    }
    const room = this.rooms.get(roomId);
    if (!room) {
      return this.jsonResponse({
        error: "Room not found"
      }, { status: 404, headers: corsHeaders });
    }
    const message = {
      type,
      from,
      to,
      roomId,
      data,
      timestamp: Date.now()
    };
    room.messages.push(message);
    if (room.messages.length > 100) {
      room.messages = room.messages.slice(-100);
    }
    console.log(`Message ${type} from ${from} to ${to || "all"} in room ${roomId}`);
    return this.jsonResponse({
      success: true,
      messageId: message.timestamp
    }, { headers: corsHeaders });
  }
  async handlePoll(request, corsHeaders) {
    const url = new URL(request.url);
    const roomId = url.searchParams.get("roomId");
    const userId = url.searchParams.get("userId");
    const since = parseInt(url.searchParams.get("since") || "0");
    if (!roomId || !userId) {
      return this.jsonResponse({
        error: "Missing required params: roomId, userId"
      }, { status: 400, headers: corsHeaders });
    }
    const room = this.rooms.get(roomId);
    if (!room) {
      return this.jsonResponse({
        messages: [],
        timestamp: Date.now()
      }, { headers: corsHeaders });
    }
    const messages = room.messages.filter((msg) => {
      if (msg.timestamp <= since) return false;
      if (msg.from === userId) return false;
      if (msg.to && msg.to !== userId) return false;
      return true;
    }).slice(-20);
    return this.jsonResponse({
      messages,
      timestamp: Date.now()
    }, { headers: corsHeaders });
  }
  async handleRoomInfo(request, corsHeaders) {
    const url = new URL(request.url);
    const roomId = url.searchParams.get("roomId");
    if (!roomId) {
      return this.jsonResponse({
        error: "Missing required param: roomId"
      }, { status: 400, headers: corsHeaders });
    }
    const room = this.rooms.get(roomId);
    if (!room) {
      return this.jsonResponse({
        roomId,
        users: [],
        exists: false
      }, { headers: corsHeaders });
    }
    const users = Array.from(room.users).map((u) => JSON.parse(u));
    return this.jsonResponse({
      roomId,
      users,
      exists: true,
      messageCount: room.messages.length
    }, { headers: corsHeaders });
  }
  async handlePing(request, corsHeaders) {
    const body = await request.json();
    const { userId } = body;
    if (!userId) {
      return this.jsonResponse({
        error: "Missing required field: userId"
      }, { status: 400, headers: corsHeaders });
    }
    const session = this.userSessions.get(userId);
    if (session) {
      session.lastPing = Date.now();
    }
    return this.jsonResponse({
      success: true,
      timestamp: Date.now()
    }, { headers: corsHeaders });
  }
  jsonResponse(data, options = {}) {
    const { status = 200, headers = {} } = options;
    return new Response(JSON.stringify(data), {
      status,
      headers: {
        "Content-Type": "application/json",
        ...headers
      }
    });
  }
  // Cleanup inactive users (call periodically)
  cleanup() {
    const now = Date.now();
    const timeout = 3e4;
    for (const [userId, session] of this.userSessions) {
      if (now - session.lastPing > timeout) {
        console.log(`Cleaning up inactive user: ${userId}`);
        const room = this.rooms.get(session.roomId);
        if (room) {
          const userInfo = { userId, userType: session.userType, joinedAt: 0 };
          room.users.delete(JSON.stringify(userInfo));
          const leaveMessage = {
            type: "user-left",
            from: userId,
            roomId: session.roomId,
            data: { userType: session.userType },
            timestamp: now
          };
          room.messages.push(leaveMessage);
        }
        this.userSessions.delete(userId);
      }
    }
  }
};

// src/worker.js
var httpApi = new HttpSignalingAPI();
var worker_default = {
  async fetch(request, env, ctx) {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith("/api/") || pathname === "/health") {
      return await httpApi.handleRequest(request, env);
    }
    if (pathname === "/signaling") {
      return new Response(JSON.stringify({
        error: "WebSocket endpoint deprecated",
        message: "Please use HTTP API endpoints: /api/join, /api/poll, /api/message",
        documentation: "https://github.com/autamedica/signaling-server"
      }), {
        status: 410,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
    if (pathname === "/") {
      return new Response(`
<!DOCTYPE html>
<html>
<head>
    <title>AltaMedica Signaling Server - HTTP API</title>
    <style>body{font-family:Arial,sans-serif;margin:40px;}</style>
</head>
<body>
    <h1>\u{1F3E5} AltaMedica Signaling Server</h1>
    <p><strong>Status:</strong> \u2705 Active</p>
    <p><strong>Mode:</strong> HTTP API with polling</p>

    <h2>\u{1F4E1} API Endpoints</h2>
    <ul>
        <li><code>GET /health</code> - Server health check</li>
        <li><code>POST /api/join</code> - Join a room</li>
        <li><code>POST /api/leave</code> - Leave a room</li>
        <li><code>POST /api/message</code> - Send WebRTC message</li>
        <li><code>GET /api/poll</code> - Poll for new messages</li>
        <li><code>GET /api/room</code> - Get room information</li>
        <li><code>POST /api/ping</code> - Heartbeat/keep-alive</li>
    </ul>

    <h2>\u{1F52C} Test</h2>
    <p><a href="/test-websocket.html">WebSocket Test Page</a></p>

    <h2>\u{1F4DA} Integration</h2>
    <p>Use the <code>@autamedica/telemedicine</code> package for easy integration.</p>
</body>
</html>
    `, {
        headers: { "Content-Type": "text/html" }
      });
    }
    return new Response("Not Found", { status: 404 });
  },
  // Optional: Schedule periodic cleanup
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(httpApi.cleanup());
  }
};

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-zTFRmy/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-zTFRmy/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
