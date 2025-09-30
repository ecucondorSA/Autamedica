
import {Buffer} from "node:buffer";
globalThis.Buffer = Buffer;

import {AsyncLocalStorage} from "node:async_hooks";
globalThis.AsyncLocalStorage = AsyncLocalStorage;


const defaultDefineProperty = Object.defineProperty;
Object.defineProperty = function(o, p, a) {
  if(p=== '__import_unsupported' && Boolean(globalThis.__import_unsupported)) {
    return;
  }
  return defaultDefineProperty(o, p, a);
};

  
  
  globalThis.openNextDebug = false;globalThis.openNextVersion = "3.7.7";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/utils/error.js
function isOpenNextError(e) {
  try {
    return "__openNextInternal" in e;
  } catch {
    return false;
  }
}
var init_error = __esm({
  "../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/utils/error.js"() {
  }
});

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/adapters/logger.js
function debug(...args) {
  if (globalThis.openNextDebug) {
    console.log(...args);
  }
}
function warn(...args) {
  console.warn(...args);
}
function error(...args) {
  if (args.some((arg) => isDownplayedErrorLog(arg))) {
    return debug(...args);
  }
  if (args.some((arg) => isOpenNextError(arg))) {
    const error2 = args.find((arg) => isOpenNextError(arg));
    if (error2.logLevel < getOpenNextErrorLogLevel()) {
      return;
    }
    if (error2.logLevel === 0) {
      return console.log(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    if (error2.logLevel === 1) {
      return warn(...args.map((arg) => isOpenNextError(arg) ? `${arg.name}: ${arg.message}` : arg));
    }
    return console.error(...args);
  }
  console.error(...args);
}
function getOpenNextErrorLogLevel() {
  const strLevel = process.env.OPEN_NEXT_ERROR_LOG_LEVEL ?? "1";
  switch (strLevel.toLowerCase()) {
    case "debug":
    case "0":
      return 0;
    case "error":
    case "2":
      return 2;
    default:
      return 1;
  }
}
var DOWNPLAYED_ERROR_LOGS, isDownplayedErrorLog;
var init_logger = __esm({
  "../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/adapters/logger.js"() {
    init_error();
    DOWNPLAYED_ERROR_LOGS = [
      {
        clientName: "S3Client",
        commandName: "GetObjectCommand",
        errorName: "NoSuchKey"
      }
    ];
    isDownplayedErrorLog = (errorLog) => DOWNPLAYED_ERROR_LOGS.some((downplayedInput) => downplayedInput.clientName === errorLog?.clientName && downplayedInput.commandName === errorLog?.commandName && (downplayedInput.errorName === errorLog?.error?.name || downplayedInput.errorName === errorLog?.error?.Code));
  }
});

// ../../node_modules/.pnpm/cookie@1.0.2/node_modules/cookie/dist/index.js
var require_dist = __commonJS({
  "../../node_modules/.pnpm/cookie@1.0.2/node_modules/cookie/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parse = parse3;
    exports.serialize = serialize;
    var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
    var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    var __toString = Object.prototype.toString;
    var NullObject = /* @__PURE__ */ (() => {
      const C = function() {
      };
      C.prototype = /* @__PURE__ */ Object.create(null);
      return C;
    })();
    function parse3(str, options) {
      const obj = new NullObject();
      const len = str.length;
      if (len < 2)
        return obj;
      const dec = options?.decode || decode;
      let index = 0;
      do {
        const eqIdx = str.indexOf("=", index);
        if (eqIdx === -1)
          break;
        const colonIdx = str.indexOf(";", index);
        const endIdx = colonIdx === -1 ? len : colonIdx;
        if (eqIdx > endIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        const keyStartIdx = startIndex(str, index, eqIdx);
        const keyEndIdx = endIndex(str, eqIdx, keyStartIdx);
        const key = str.slice(keyStartIdx, keyEndIdx);
        if (obj[key] === void 0) {
          let valStartIdx = startIndex(str, eqIdx + 1, endIdx);
          let valEndIdx = endIndex(str, endIdx, valStartIdx);
          const value = dec(str.slice(valStartIdx, valEndIdx));
          obj[key] = value;
        }
        index = endIdx + 1;
      } while (index < len);
      return obj;
    }
    function startIndex(str, index, max) {
      do {
        const code = str.charCodeAt(index);
        if (code !== 32 && code !== 9)
          return index;
      } while (++index < max);
      return max;
    }
    function endIndex(str, index, min) {
      while (index > min) {
        const code = str.charCodeAt(--index);
        if (code !== 32 && code !== 9)
          return index + 1;
      }
      return min;
    }
    function serialize(name, val, options) {
      const enc = options?.encode || encodeURIComponent;
      if (!cookieNameRegExp.test(name)) {
        throw new TypeError(`argument name is invalid: ${name}`);
      }
      const value = enc(val);
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${val}`);
      }
      let str = name + "=" + value;
      if (!options)
        return str;
      if (options.maxAge !== void 0) {
        if (!Number.isInteger(options.maxAge)) {
          throw new TypeError(`option maxAge is invalid: ${options.maxAge}`);
        }
        str += "; Max-Age=" + options.maxAge;
      }
      if (options.domain) {
        if (!domainValueRegExp.test(options.domain)) {
          throw new TypeError(`option domain is invalid: ${options.domain}`);
        }
        str += "; Domain=" + options.domain;
      }
      if (options.path) {
        if (!pathValueRegExp.test(options.path)) {
          throw new TypeError(`option path is invalid: ${options.path}`);
        }
        str += "; Path=" + options.path;
      }
      if (options.expires) {
        if (!isDate(options.expires) || !Number.isFinite(options.expires.valueOf())) {
          throw new TypeError(`option expires is invalid: ${options.expires}`);
        }
        str += "; Expires=" + options.expires.toUTCString();
      }
      if (options.httpOnly) {
        str += "; HttpOnly";
      }
      if (options.secure) {
        str += "; Secure";
      }
      if (options.partitioned) {
        str += "; Partitioned";
      }
      if (options.priority) {
        const priority = typeof options.priority === "string" ? options.priority.toLowerCase() : void 0;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError(`option priority is invalid: ${options.priority}`);
        }
      }
      if (options.sameSite) {
        const sameSite = typeof options.sameSite === "string" ? options.sameSite.toLowerCase() : options.sameSite;
        switch (sameSite) {
          case true:
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError(`option sameSite is invalid: ${options.sameSite}`);
        }
      }
      return str;
    }
    function decode(str) {
      if (str.indexOf("%") === -1)
        return str;
      try {
        return decodeURIComponent(str);
      } catch (e) {
        return str;
      }
    }
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
  }
});

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/http/util.js
function parseSetCookieHeader(cookies) {
  if (!cookies) {
    return [];
  }
  if (typeof cookies === "string") {
    return cookies.split(/(?<!Expires=\w+),/i).map((c) => c.trim());
  }
  return cookies;
}
function getQueryFromIterator(it) {
  const query = {};
  for (const [key, value] of it) {
    if (key in query) {
      if (Array.isArray(query[key])) {
        query[key].push(value);
      } else {
        query[key] = [query[key], value];
      }
    } else {
      query[key] = value;
    }
  }
  return query;
}
var init_util = __esm({
  "../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/http/util.js"() {
  }
});

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/overrides/converters/utils.js
function getQueryFromSearchParams(searchParams) {
  return getQueryFromIterator(searchParams.entries());
}
var init_utils = __esm({
  "../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/overrides/converters/utils.js"() {
    init_util();
  }
});

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/overrides/converters/edge.js
var edge_exports = {};
__export(edge_exports, {
  default: () => edge_default
});
import { Buffer as Buffer2 } from "node:buffer";
var import_cookie, NULL_BODY_STATUSES, converter, edge_default;
var init_edge = __esm({
  "../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/overrides/converters/edge.js"() {
    import_cookie = __toESM(require_dist(), 1);
    init_util();
    init_utils();
    NULL_BODY_STATUSES = /* @__PURE__ */ new Set([101, 103, 204, 205, 304]);
    converter = {
      convertFrom: async (event) => {
        const url = new URL(event.url);
        const searchParams = url.searchParams;
        const query = getQueryFromSearchParams(searchParams);
        const body = await event.arrayBuffer();
        const headers = {};
        event.headers.forEach((value, key) => {
          headers[key] = value;
        });
        const rawPath = url.pathname;
        const method = event.method;
        const shouldHaveBody = method !== "GET" && method !== "HEAD";
        const cookieHeader = event.headers.get("cookie");
        const cookies = cookieHeader ? import_cookie.default.parse(cookieHeader) : {};
        return {
          type: "core",
          method,
          rawPath,
          url: event.url,
          body: shouldHaveBody ? Buffer2.from(body) : void 0,
          headers,
          remoteAddress: event.headers.get("x-forwarded-for") ?? "::1",
          query,
          cookies
        };
      },
      convertTo: async (result) => {
        if ("internalEvent" in result) {
          const request = new Request(result.internalEvent.url, {
            body: result.internalEvent.body,
            method: result.internalEvent.method,
            headers: {
              ...result.internalEvent.headers,
              "x-forwarded-host": result.internalEvent.headers.host
            }
          });
          if (globalThis.__dangerous_ON_edge_converter_returns_request === true) {
            return request;
          }
          const cfCache = (result.isISR || result.internalEvent.rawPath.startsWith("/_next/image")) && process.env.DISABLE_CACHE !== "true" ? { cacheEverything: true } : {};
          return fetch(request, {
            // This is a hack to make sure that the response is cached by Cloudflare
            // See https://developers.cloudflare.com/workers/examples/cache-using-fetch/#caching-html-resources
            // @ts-expect-error - This is a Cloudflare specific option
            cf: cfCache
          });
        }
        const headers = new Headers();
        for (const [key, value] of Object.entries(result.headers)) {
          if (key === "set-cookie" && typeof value === "string") {
            const cookies = parseSetCookieHeader(value);
            for (const cookie of cookies) {
              headers.append(key, cookie);
            }
            continue;
          }
          if (Array.isArray(value)) {
            for (const v of value) {
              headers.append(key, v);
            }
          } else {
            headers.set(key, value);
          }
        }
        const body = NULL_BODY_STATUSES.has(result.statusCode) ? null : result.body;
        return new Response(body, {
          status: result.statusCode,
          headers
        });
      },
      name: "edge"
    };
    edge_default = converter;
  }
});

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js
var cloudflare_edge_exports = {};
__export(cloudflare_edge_exports, {
  default: () => cloudflare_edge_default
});
var cfPropNameMapping, handler, cloudflare_edge_default;
var init_cloudflare_edge = __esm({
  "../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js"() {
    cfPropNameMapping = {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: [encodeURIComponent, "x-open-next-city"],
      country: "x-open-next-country",
      regionCode: "x-open-next-region",
      latitude: "x-open-next-latitude",
      longitude: "x-open-next-longitude"
    };
    handler = async (handler3, converter2) => async (request, env, ctx) => {
      globalThis.process = process;
      for (const [key, value] of Object.entries(env)) {
        if (typeof value === "string") {
          process.env[key] = value;
        }
      }
      const internalEvent = await converter2.convertFrom(request);
      const cfProperties = request.cf;
      for (const [propName, mapping] of Object.entries(cfPropNameMapping)) {
        const propValue = cfProperties?.[propName];
        if (propValue != null) {
          const [encode, headerName] = Array.isArray(mapping) ? mapping : [null, mapping];
          internalEvent.headers[headerName] = encode ? encode(propValue) : propValue;
        }
      }
      const response = await handler3(internalEvent, {
        waitUntil: ctx.waitUntil.bind(ctx)
      });
      const result = await converter2.convertTo(response);
      return result;
    };
    cloudflare_edge_default = {
      wrapper: handler,
      name: "cloudflare-edge",
      supportStreaming: true,
      edgeRuntime: true
    };
  }
});

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js
var pattern_env_exports = {};
__export(pattern_env_exports, {
  default: () => pattern_env_default
});
var envLoader, pattern_env_default;
var init_pattern_env = __esm({
  "../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js"() {
    init_logger();
    envLoader = {
      name: "env",
      resolve: async (_path) => {
        try {
          const origin = JSON.parse(process.env.OPEN_NEXT_ORIGIN ?? "{}");
          for (const [key, value] of Object.entries(globalThis.openNextConfig.functions ?? {}).filter(([key2]) => key2 !== "default")) {
            if (value.patterns.some((pattern) => {
              return new RegExp(
                // transform glob pattern to regex
                `/${pattern.replace(/\*\*/g, "(.*)").replace(/\*/g, "([^/]*)").replace(/\//g, "\\/").replace(/\?/g, ".")}`
              ).test(_path);
            })) {
              debug("Using origin", key, value.patterns);
              return origin[key];
            }
          }
          if (_path.startsWith("/_next/image") && origin.imageOptimizer) {
            debug("Using origin", "imageOptimizer", _path);
            return origin.imageOptimizer;
          }
          if (origin.default) {
            debug("Using default origin", origin.default, _path);
            return origin.default;
          }
          return false;
        } catch (e) {
          error("Error while resolving origin", e);
          return false;
        }
      }
    };
    pattern_env_default = envLoader;
  }
});

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js
var dummy_exports = {};
__export(dummy_exports, {
  default: () => dummy_default
});
var resolver, dummy_default;
var init_dummy = __esm({
  "../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js"() {
    resolver = {
      name: "dummy"
    };
    dummy_default = resolver;
  }
});

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/utils/stream.js
import { Readable } from "node:stream";
function toReadableStream(value, isBase64) {
  return Readable.toWeb(Readable.from(Buffer.from(value, isBase64 ? "base64" : "utf8")));
}
function emptyReadableStream() {
  if (process.env.OPEN_NEXT_FORCE_NON_EMPTY_RESPONSE === "true") {
    return Readable.toWeb(Readable.from([Buffer.from("SOMETHING")]));
  }
  return Readable.toWeb(Readable.from([]));
}
var init_stream = __esm({
  "../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/utils/stream.js"() {
  }
});

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js
var fetch_exports = {};
__export(fetch_exports, {
  default: () => fetch_default
});
var fetchProxy, fetch_default;
var init_fetch = __esm({
  "../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js"() {
    init_stream();
    fetchProxy = {
      name: "fetch-proxy",
      // @ts-ignore
      proxy: async (internalEvent) => {
        const { url, headers: eventHeaders, method, body } = internalEvent;
        const headers = Object.fromEntries(Object.entries(eventHeaders).filter(([key]) => key.toLowerCase() !== "cf-connecting-ip"));
        const response = await fetch(url, {
          method,
          headers,
          body
        });
        const responseHeaders = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });
        return {
          type: "core",
          headers: responseHeaders,
          statusCode: response.status,
          isBase64Encoded: true,
          body: response.body ?? emptyReadableStream()
        };
      }
    };
    fetch_default = fetchProxy;
  }
});

// .next/server/edge-runtime-webpack.js
var require_edge_runtime_webpack = __commonJS({
  ".next/server/edge-runtime-webpack.js"() {
    "use strict";
    (() => {
      "use strict";
      var a = {}, b = {};
      function c(d) {
        var e = b[d];
        if (void 0 !== e) return e.exports;
        var f = b[d] = { exports: {} }, g = true;
        try {
          a[d].call(f.exports, f, f.exports, c), g = false;
        } finally {
          g && delete b[d];
        }
        return f.exports;
      }
      c.m = a, c.amdO = {}, (() => {
        var a2 = [];
        c.O = (b2, d, e, f) => {
          if (d) {
            f = f || 0;
            for (var g = a2.length; g > 0 && a2[g - 1][2] > f; g--) a2[g] = a2[g - 1];
            a2[g] = [d, e, f];
            return;
          }
          for (var h = 1 / 0, g = 0; g < a2.length; g++) {
            for (var [d, e, f] = a2[g], i = true, j = 0; j < d.length; j++) (false & f || h >= f) && Object.keys(c.O).every((a3) => c.O[a3](d[j])) ? d.splice(j--, 1) : (i = false, f < h && (h = f));
            if (i) {
              a2.splice(g--, 1);
              var k = e();
              void 0 !== k && (b2 = k);
            }
          }
          return b2;
        };
      })(), c.n = (a2) => {
        var b2 = a2 && a2.__esModule ? () => a2.default : () => a2;
        return c.d(b2, { a: b2 }), b2;
      }, c.d = (a2, b2) => {
        for (var d in b2) c.o(b2, d) && !c.o(a2, d) && Object.defineProperty(a2, d, { enumerable: true, get: b2[d] });
      }, c.g = function() {
        if ("object" == typeof globalThis) return globalThis;
        try {
          return this || Function("return this")();
        } catch (a2) {
          if ("object" == typeof window) return window;
        }
      }(), c.o = (a2, b2) => Object.prototype.hasOwnProperty.call(a2, b2), c.r = (a2) => {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(a2, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(a2, "__esModule", { value: true });
      }, (() => {
        var a2 = { 149: 0 };
        c.O.j = (b3) => 0 === a2[b3];
        var b2 = (b3, d2) => {
          var e, f, [g, h, i] = d2, j = 0;
          if (g.some((b4) => 0 !== a2[b4])) {
            for (e in h) c.o(h, e) && (c.m[e] = h[e]);
            if (i) var k = i(c);
          }
          for (b3 && b3(d2); j < g.length; j++) f = g[j], c.o(a2, f) && a2[f] && a2[f][0](), a2[f] = 0;
          return c.O(k);
        }, d = self.webpackChunk_N_E = self.webpackChunk_N_E || [];
        d.forEach(b2.bind(null, 0)), d.push = b2.bind(null, d.push.bind(d));
      })();
    })();
  }
});

// node-built-in-modules:node:buffer
var node_buffer_exports = {};
import * as node_buffer_star from "node:buffer";
var init_node_buffer = __esm({
  "node-built-in-modules:node:buffer"() {
    __reExport(node_buffer_exports, node_buffer_star);
  }
});

// node-built-in-modules:node:async_hooks
var node_async_hooks_exports = {};
import * as node_async_hooks_star from "node:async_hooks";
var init_node_async_hooks = __esm({
  "node-built-in-modules:node:async_hooks"() {
    __reExport(node_async_hooks_exports, node_async_hooks_star);
  }
});

// .next/server/src/middleware.js
var require_middleware = __commonJS({
  ".next/server/src/middleware.js"() {
    "use strict";
    (self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[550], { 17: (a, b, c) => {
      var d;
      (() => {
        var e = { 226: function(e2, f2) {
          !function(g2, h) {
            "use strict";
            var i = "function", j = "undefined", k = "object", l = "string", m = "major", n = "model", o = "name", p = "type", q = "vendor", r = "version", s = "architecture", t = "console", u = "mobile", v = "tablet", w = "smarttv", x = "wearable", y = "embedded", z = "Amazon", A = "Apple", B = "ASUS", C = "BlackBerry", D = "Browser", E = "Chrome", F = "Firefox", G = "Google", H = "Huawei", I = "Microsoft", J = "Motorola", K = "Opera", L = "Samsung", M = "Sharp", N = "Sony", O = "Xiaomi", P = "Zebra", Q = "Facebook", R = "Chromium OS", S = "Mac OS", T = function(a2, b2) {
              var c2 = {};
              for (var d2 in a2) b2[d2] && b2[d2].length % 2 == 0 ? c2[d2] = b2[d2].concat(a2[d2]) : c2[d2] = a2[d2];
              return c2;
            }, U = function(a2) {
              for (var b2 = {}, c2 = 0; c2 < a2.length; c2++) b2[a2[c2].toUpperCase()] = a2[c2];
              return b2;
            }, V = function(a2, b2) {
              return typeof a2 === l && -1 !== W(b2).indexOf(W(a2));
            }, W = function(a2) {
              return a2.toLowerCase();
            }, X = function(a2, b2) {
              if (typeof a2 === l) return a2 = a2.replace(/^\s\s*/, ""), typeof b2 === j ? a2 : a2.substring(0, 350);
            }, Y = function(a2, b2) {
              for (var c2, d2, e3, f3, g3, j2, l2 = 0; l2 < b2.length && !g3; ) {
                var m2 = b2[l2], n2 = b2[l2 + 1];
                for (c2 = d2 = 0; c2 < m2.length && !g3 && m2[c2]; ) if (g3 = m2[c2++].exec(a2)) for (e3 = 0; e3 < n2.length; e3++) j2 = g3[++d2], typeof (f3 = n2[e3]) === k && f3.length > 0 ? 2 === f3.length ? typeof f3[1] == i ? this[f3[0]] = f3[1].call(this, j2) : this[f3[0]] = f3[1] : 3 === f3.length ? typeof f3[1] !== i || f3[1].exec && f3[1].test ? this[f3[0]] = j2 ? j2.replace(f3[1], f3[2]) : void 0 : this[f3[0]] = j2 ? f3[1].call(this, j2, f3[2]) : void 0 : 4 === f3.length && (this[f3[0]] = j2 ? f3[3].call(this, j2.replace(f3[1], f3[2])) : h) : this[f3] = j2 || h;
                l2 += 2;
              }
            }, Z = function(a2, b2) {
              for (var c2 in b2) if (typeof b2[c2] === k && b2[c2].length > 0) {
                for (var d2 = 0; d2 < b2[c2].length; d2++) if (V(b2[c2][d2], a2)) return "?" === c2 ? h : c2;
              } else if (V(b2[c2], a2)) return "?" === c2 ? h : c2;
              return a2;
            }, $ = { ME: "4.90", "NT 3.11": "NT3.51", "NT 4.0": "NT4.0", 2e3: "NT 5.0", XP: ["NT 5.1", "NT 5.2"], Vista: "NT 6.0", 7: "NT 6.1", 8: "NT 6.2", 8.1: "NT 6.3", 10: ["NT 6.4", "NT 10.0"], RT: "ARM" }, _ = { browser: [[/\b(?:crmo|crios)\/([\w\.]+)/i], [r, [o, "Chrome"]], [/edg(?:e|ios|a)?\/([\w\.]+)/i], [r, [o, "Edge"]], [/(opera mini)\/([-\w\.]+)/i, /(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i, /(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i], [o, r], [/opios[\/ ]+([\w\.]+)/i], [r, [o, K + " Mini"]], [/\bopr\/([\w\.]+)/i], [r, [o, K]], [/(kindle)\/([\w\.]+)/i, /(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i, /(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i, /(ba?idubrowser)[\/ ]?([\w\.]+)/i, /(?:ms|\()(ie) ([\w\.]+)/i, /(flock|rockmelt|midori|epiphany|silk|skyfire|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|qq|duckduckgo)\/([-\w\.]+)/i, /(heytap|ovi)browser\/([\d\.]+)/i, /(weibo)__([\d\.]+)/i], [o, r], [/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i], [r, [o, "UC" + D]], [/microm.+\bqbcore\/([\w\.]+)/i, /\bqbcore\/([\w\.]+).+microm/i], [r, [o, "WeChat(Win) Desktop"]], [/micromessenger\/([\w\.]+)/i], [r, [o, "WeChat"]], [/konqueror\/([\w\.]+)/i], [r, [o, "Konqueror"]], [/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i], [r, [o, "IE"]], [/ya(?:search)?browser\/([\w\.]+)/i], [r, [o, "Yandex"]], [/(avast|avg)\/([\w\.]+)/i], [[o, /(.+)/, "$1 Secure " + D], r], [/\bfocus\/([\w\.]+)/i], [r, [o, F + " Focus"]], [/\bopt\/([\w\.]+)/i], [r, [o, K + " Touch"]], [/coc_coc\w+\/([\w\.]+)/i], [r, [o, "Coc Coc"]], [/dolfin\/([\w\.]+)/i], [r, [o, "Dolphin"]], [/coast\/([\w\.]+)/i], [r, [o, K + " Coast"]], [/miuibrowser\/([\w\.]+)/i], [r, [o, "MIUI " + D]], [/fxios\/([-\w\.]+)/i], [r, [o, F]], [/\bqihu|(qi?ho?o?|360)browser/i], [[o, "360 " + D]], [/(oculus|samsung|sailfish|huawei)browser\/([\w\.]+)/i], [[o, /(.+)/, "$1 " + D], r], [/(comodo_dragon)\/([\w\.]+)/i], [[o, /_/g, " "], r], [/(electron)\/([\w\.]+) safari/i, /(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i, /m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i], [o, r], [/(metasr)[\/ ]?([\w\.]+)/i, /(lbbrowser)/i, /\[(linkedin)app\]/i], [o], [/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i], [[o, Q], r], [/(kakao(?:talk|story))[\/ ]([\w\.]+)/i, /(naver)\(.*?(\d+\.[\w\.]+).*\)/i, /safari (line)\/([\w\.]+)/i, /\b(line)\/([\w\.]+)\/iab/i, /(chromium|instagram)[\/ ]([-\w\.]+)/i], [o, r], [/\bgsa\/([\w\.]+) .*safari\//i], [r, [o, "GSA"]], [/musical_ly(?:.+app_?version\/|_)([\w\.]+)/i], [r, [o, "TikTok"]], [/headlesschrome(?:\/([\w\.]+)| )/i], [r, [o, E + " Headless"]], [/ wv\).+(chrome)\/([\w\.]+)/i], [[o, E + " WebView"], r], [/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i], [r, [o, "Android " + D]], [/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i], [o, r], [/version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i], [r, [o, "Mobile Safari"]], [/version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i], [r, o], [/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i], [o, [r, Z, { "1.0": "/8", 1.2: "/1", 1.3: "/3", "2.0": "/412", "2.0.2": "/416", "2.0.3": "/417", "2.0.4": "/419", "?": "/" }]], [/(webkit|khtml)\/([\w\.]+)/i], [o, r], [/(navigator|netscape\d?)\/([-\w\.]+)/i], [[o, "Netscape"], r], [/mobile vr; rv:([\w\.]+)\).+firefox/i], [r, [o, F + " Reality"]], [/ekiohf.+(flow)\/([\w\.]+)/i, /(swiftfox)/i, /(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i, /(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i, /(firefox)\/([\w\.]+)/i, /(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i, /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i, /(links) \(([\w\.]+)/i, /panasonic;(viera)/i], [o, r], [/(cobalt)\/([\w\.]+)/i], [o, [r, /master.|lts./, ""]]], cpu: [[/(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i], [[s, "amd64"]], [/(ia32(?=;))/i], [[s, W]], [/((?:i[346]|x)86)[;\)]/i], [[s, "ia32"]], [/\b(aarch64|arm(v?8e?l?|_?64))\b/i], [[s, "arm64"]], [/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i], [[s, "armhf"]], [/windows (ce|mobile); ppc;/i], [[s, "arm"]], [/((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i], [[s, /ower/, "", W]], [/(sun4\w)[;\)]/i], [[s, "sparc"]], [/((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i], [[s, W]]], device: [[/\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i], [n, [q, L], [p, v]], [/\b((?:s[cgp]h|gt|sm)-\w+|sc[g-]?[\d]+a?|galaxy nexus)/i, /samsung[- ]([-\w]+)/i, /sec-(sgh\w+)/i], [n, [q, L], [p, u]], [/(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i], [n, [q, A], [p, u]], [/\((ipad);[-\w\),; ]+apple/i, /applecoremedia\/[\w\.]+ \((ipad)/i, /\b(ipad)\d\d?,\d\d?[;\]].+ios/i], [n, [q, A], [p, v]], [/(macintosh);/i], [n, [q, A]], [/\b(sh-?[altvz]?\d\d[a-ekm]?)/i], [n, [q, M], [p, u]], [/\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i], [n, [q, H], [p, v]], [/(?:huawei|honor)([-\w ]+)[;\)]/i, /\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i], [n, [q, H], [p, u]], [/\b(poco[\w ]+)(?: bui|\))/i, /\b; (\w+) build\/hm\1/i, /\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i, /\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i, /\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i], [[n, /_/g, " "], [q, O], [p, u]], [/\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i], [[n, /_/g, " "], [q, O], [p, v]], [/; (\w+) bui.+ oppo/i, /\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i], [n, [q, "OPPO"], [p, u]], [/vivo (\w+)(?: bui|\))/i, /\b(v[12]\d{3}\w?[at])(?: bui|;)/i], [n, [q, "Vivo"], [p, u]], [/\b(rmx[12]\d{3})(?: bui|;|\))/i], [n, [q, "Realme"], [p, u]], [/\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i, /\bmot(?:orola)?[- ](\w*)/i, /((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i], [n, [q, J], [p, u]], [/\b(mz60\d|xoom[2 ]{0,2}) build\//i], [n, [q, J], [p, v]], [/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i], [n, [q, "LG"], [p, v]], [/(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i, /\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i, /\blg-?([\d\w]+) bui/i], [n, [q, "LG"], [p, u]], [/(ideatab[-\w ]+)/i, /lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i], [n, [q, "Lenovo"], [p, v]], [/(?:maemo|nokia).*(n900|lumia \d+)/i, /nokia[-_ ]?([-\w\.]*)/i], [[n, /_/g, " "], [q, "Nokia"], [p, u]], [/(pixel c)\b/i], [n, [q, G], [p, v]], [/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i], [n, [q, G], [p, u]], [/droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i], [n, [q, N], [p, u]], [/sony tablet [ps]/i, /\b(?:sony)?sgp\w+(?: bui|\))/i], [[n, "Xperia Tablet"], [q, N], [p, v]], [/ (kb2005|in20[12]5|be20[12][59])\b/i, /(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i], [n, [q, "OnePlus"], [p, u]], [/(alexa)webm/i, /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i, /(kf[a-z]+)( bui|\)).+silk\//i], [n, [q, z], [p, v]], [/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i], [[n, /(.+)/g, "Fire Phone $1"], [q, z], [p, u]], [/(playbook);[-\w\),; ]+(rim)/i], [n, q, [p, v]], [/\b((?:bb[a-f]|st[hv])100-\d)/i, /\(bb10; (\w+)/i], [n, [q, C], [p, u]], [/(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i], [n, [q, B], [p, v]], [/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i], [n, [q, B], [p, u]], [/(nexus 9)/i], [n, [q, "HTC"], [p, v]], [/(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i, /(zte)[- ]([\w ]+?)(?: bui|\/|\))/i, /(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i], [q, [n, /_/g, " "], [p, u]], [/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i], [n, [q, "Acer"], [p, v]], [/droid.+; (m[1-5] note) bui/i, /\bmz-([-\w]{2,})/i], [n, [q, "Meizu"], [p, u]], [/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron)[-_ ]?([-\w]*)/i, /(hp) ([\w ]+\w)/i, /(asus)-?(\w+)/i, /(microsoft); (lumia[\w ]+)/i, /(lenovo)[-_ ]?([-\w]+)/i, /(jolla)/i, /(oppo) ?([\w ]+) bui/i], [q, n, [p, u]], [/(kobo)\s(ereader|touch)/i, /(archos) (gamepad2?)/i, /(hp).+(touchpad(?!.+tablet)|tablet)/i, /(kindle)\/([\w\.]+)/i, /(nook)[\w ]+build\/(\w+)/i, /(dell) (strea[kpr\d ]*[\dko])/i, /(le[- ]+pan)[- ]+(\w{1,9}) bui/i, /(trinity)[- ]*(t\d{3}) bui/i, /(gigaset)[- ]+(q\w{1,9}) bui/i, /(vodafone) ([\w ]+)(?:\)| bui)/i], [q, n, [p, v]], [/(surface duo)/i], [n, [q, I], [p, v]], [/droid [\d\.]+; (fp\du?)(?: b|\))/i], [n, [q, "Fairphone"], [p, u]], [/(u304aa)/i], [n, [q, "AT&T"], [p, u]], [/\bsie-(\w*)/i], [n, [q, "Siemens"], [p, u]], [/\b(rct\w+) b/i], [n, [q, "RCA"], [p, v]], [/\b(venue[\d ]{2,7}) b/i], [n, [q, "Dell"], [p, v]], [/\b(q(?:mv|ta)\w+) b/i], [n, [q, "Verizon"], [p, v]], [/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i], [n, [q, "Barnes & Noble"], [p, v]], [/\b(tm\d{3}\w+) b/i], [n, [q, "NuVision"], [p, v]], [/\b(k88) b/i], [n, [q, "ZTE"], [p, v]], [/\b(nx\d{3}j) b/i], [n, [q, "ZTE"], [p, u]], [/\b(gen\d{3}) b.+49h/i], [n, [q, "Swiss"], [p, u]], [/\b(zur\d{3}) b/i], [n, [q, "Swiss"], [p, v]], [/\b((zeki)?tb.*\b) b/i], [n, [q, "Zeki"], [p, v]], [/\b([yr]\d{2}) b/i, /\b(dragon[- ]+touch |dt)(\w{5}) b/i], [[q, "Dragon Touch"], n, [p, v]], [/\b(ns-?\w{0,9}) b/i], [n, [q, "Insignia"], [p, v]], [/\b((nxa|next)-?\w{0,9}) b/i], [n, [q, "NextBook"], [p, v]], [/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i], [[q, "Voice"], n, [p, u]], [/\b(lvtel\-)?(v1[12]) b/i], [[q, "LvTel"], n, [p, u]], [/\b(ph-1) /i], [n, [q, "Essential"], [p, u]], [/\b(v(100md|700na|7011|917g).*\b) b/i], [n, [q, "Envizen"], [p, v]], [/\b(trio[-\w\. ]+) b/i], [n, [q, "MachSpeed"], [p, v]], [/\btu_(1491) b/i], [n, [q, "Rotor"], [p, v]], [/(shield[\w ]+) b/i], [n, [q, "Nvidia"], [p, v]], [/(sprint) (\w+)/i], [q, n, [p, u]], [/(kin\.[onetw]{3})/i], [[n, /\./g, " "], [q, I], [p, u]], [/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i], [n, [q, P], [p, v]], [/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i], [n, [q, P], [p, u]], [/smart-tv.+(samsung)/i], [q, [p, w]], [/hbbtv.+maple;(\d+)/i], [[n, /^/, "SmartTV"], [q, L], [p, w]], [/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i], [[q, "LG"], [p, w]], [/(apple) ?tv/i], [q, [n, A + " TV"], [p, w]], [/crkey/i], [[n, E + "cast"], [q, G], [p, w]], [/droid.+aft(\w)( bui|\))/i], [n, [q, z], [p, w]], [/\(dtv[\);].+(aquos)/i, /(aquos-tv[\w ]+)\)/i], [n, [q, M], [p, w]], [/(bravia[\w ]+)( bui|\))/i], [n, [q, N], [p, w]], [/(mitv-\w{5}) bui/i], [n, [q, O], [p, w]], [/Hbbtv.*(technisat) (.*);/i], [q, n, [p, w]], [/\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i, /hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i], [[q, X], [n, X], [p, w]], [/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i], [[p, w]], [/(ouya)/i, /(nintendo) ([wids3utch]+)/i], [q, n, [p, t]], [/droid.+; (shield) bui/i], [n, [q, "Nvidia"], [p, t]], [/(playstation [345portablevi]+)/i], [n, [q, N], [p, t]], [/\b(xbox(?: one)?(?!; xbox))[\); ]/i], [n, [q, I], [p, t]], [/((pebble))app/i], [q, n, [p, x]], [/(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i], [n, [q, A], [p, x]], [/droid.+; (glass) \d/i], [n, [q, G], [p, x]], [/droid.+; (wt63?0{2,3})\)/i], [n, [q, P], [p, x]], [/(quest( 2| pro)?)/i], [n, [q, Q], [p, x]], [/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i], [q, [p, y]], [/(aeobc)\b/i], [n, [q, z], [p, y]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i], [n, [p, u]], [/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i], [n, [p, v]], [/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i], [[p, v]], [/(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i], [[p, u]], [/(android[-\w\. ]{0,9});.+buil/i], [n, [q, "Generic"]]], engine: [[/windows.+ edge\/([\w\.]+)/i], [r, [o, "EdgeHTML"]], [/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i], [r, [o, "Blink"]], [/(presto)\/([\w\.]+)/i, /(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i, /ekioh(flow)\/([\w\.]+)/i, /(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i, /(icab)[\/ ]([23]\.[\d\.]+)/i, /\b(libweb)/i], [o, r], [/rv\:([\w\.]{1,9})\b.+(gecko)/i], [r, o]], os: [[/microsoft (windows) (vista|xp)/i], [o, r], [/(windows) nt 6\.2; (arm)/i, /(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i, /(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i], [o, [r, Z, $]], [/(win(?=3|9|n)|win 9x )([nt\d\.]+)/i], [[o, "Windows"], [r, Z, $]], [/ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i, /ios;fbsv\/([\d\.]+)/i, /cfnetwork\/.+darwin/i], [[r, /_/g, "."], [o, "iOS"]], [/(mac os x) ?([\w\. ]*)/i, /(macintosh|mac_powerpc\b)(?!.+haiku)/i], [[o, S], [r, /_/g, "."]], [/droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i], [r, o], [/(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i, /(blackberry)\w*\/([\w\.]*)/i, /(tizen|kaios)[\/ ]([\w\.]+)/i, /\((series40);/i], [o, r], [/\(bb(10);/i], [r, [o, C]], [/(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i], [r, [o, "Symbian"]], [/mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i], [r, [o, F + " OS"]], [/web0s;.+rt(tv)/i, /\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i], [r, [o, "webOS"]], [/watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i], [r, [o, "watchOS"]], [/crkey\/([\d\.]+)/i], [r, [o, E + "cast"]], [/(cros) [\w]+(?:\)| ([\w\.]+)\b)/i], [[o, R], r], [/panasonic;(viera)/i, /(netrange)mmh/i, /(nettv)\/(\d+\.[\w\.]+)/i, /(nintendo|playstation) ([wids345portablevuch]+)/i, /(xbox); +xbox ([^\);]+)/i, /\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i, /(mint)[\/\(\) ]?(\w*)/i, /(mageia|vectorlinux)[; ]/i, /([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i, /(hurd|linux) ?([\w\.]*)/i, /(gnu) ?([\w\.]*)/i, /\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i, /(haiku) (\w+)/i], [o, r], [/(sunos) ?([\w\.\d]*)/i], [[o, "Solaris"], r], [/((?:open)?solaris)[-\/ ]?([\w\.]*)/i, /(aix) ((\d)(?=\.|\)| )[\w\.])*/i, /\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i, /(unix) ?([\w\.]*)/i], [o, r]] }, aa = function(a2, b2) {
              if (typeof a2 === k && (b2 = a2, a2 = h), !(this instanceof aa)) return new aa(a2, b2).getResult();
              var c2 = typeof g2 !== j && g2.navigator ? g2.navigator : h, d2 = a2 || (c2 && c2.userAgent ? c2.userAgent : ""), e3 = c2 && c2.userAgentData ? c2.userAgentData : h, f3 = b2 ? T(_, b2) : _, t2 = c2 && c2.userAgent == d2;
              return this.getBrowser = function() {
                var a3, b3 = {};
                return b3[o] = h, b3[r] = h, Y.call(b3, d2, f3.browser), b3[m] = typeof (a3 = b3[r]) === l ? a3.replace(/[^\d\.]/g, "").split(".")[0] : h, t2 && c2 && c2.brave && typeof c2.brave.isBrave == i && (b3[o] = "Brave"), b3;
              }, this.getCPU = function() {
                var a3 = {};
                return a3[s] = h, Y.call(a3, d2, f3.cpu), a3;
              }, this.getDevice = function() {
                var a3 = {};
                return a3[q] = h, a3[n] = h, a3[p] = h, Y.call(a3, d2, f3.device), t2 && !a3[p] && e3 && e3.mobile && (a3[p] = u), t2 && "Macintosh" == a3[n] && c2 && typeof c2.standalone !== j && c2.maxTouchPoints && c2.maxTouchPoints > 2 && (a3[n] = "iPad", a3[p] = v), a3;
              }, this.getEngine = function() {
                var a3 = {};
                return a3[o] = h, a3[r] = h, Y.call(a3, d2, f3.engine), a3;
              }, this.getOS = function() {
                var a3 = {};
                return a3[o] = h, a3[r] = h, Y.call(a3, d2, f3.os), t2 && !a3[o] && e3 && "Unknown" != e3.platform && (a3[o] = e3.platform.replace(/chrome os/i, R).replace(/macos/i, S)), a3;
              }, this.getResult = function() {
                return { ua: this.getUA(), browser: this.getBrowser(), engine: this.getEngine(), os: this.getOS(), device: this.getDevice(), cpu: this.getCPU() };
              }, this.getUA = function() {
                return d2;
              }, this.setUA = function(a3) {
                return d2 = typeof a3 === l && a3.length > 350 ? X(a3, 350) : a3, this;
              }, this.setUA(d2), this;
            };
            aa.VERSION = "1.0.35", aa.BROWSER = U([o, r, m]), aa.CPU = U([s]), aa.DEVICE = U([n, q, p, t, u, w, v, x, y]), aa.ENGINE = aa.OS = U([o, r]), typeof f2 !== j ? (e2.exports && (f2 = e2.exports = aa), f2.UAParser = aa) : c.amdO ? void 0 === (d = function() {
              return aa;
            }.call(b, c, b, a)) || (a.exports = d) : typeof g2 !== j && (g2.UAParser = aa);
            var ab = typeof g2 !== j && (g2.jQuery || g2.Zepto);
            if (ab && !ab.ua) {
              var ac = new aa();
              ab.ua = ac.getResult(), ab.ua.get = function() {
                return ac.getUA();
              }, ab.ua.set = function(a2) {
                ac.setUA(a2);
                var b2 = ac.getResult();
                for (var c2 in b2) ab.ua[c2] = b2[c2];
              };
            }
          }("object" == typeof window ? window : this);
        } }, f = {};
        function g(a2) {
          var b2 = f[a2];
          if (void 0 !== b2) return b2.exports;
          var c2 = f[a2] = { exports: {} }, d2 = true;
          try {
            e[a2].call(c2.exports, c2, c2.exports, g), d2 = false;
          } finally {
            d2 && delete f[a2];
          }
          return c2.exports;
        }
        g.ab = "//", a.exports = g(226);
      })();
    }, 136: (a, b, c) => {
      "use strict";
      Object.defineProperty(b, "__esModule", { value: true }), !function(a2, b2) {
        for (var c2 in b2) Object.defineProperty(a2, c2, { enumerable: true, get: b2[c2] });
      }(b, { interceptTestApis: function() {
        return f;
      }, wrapRequestHandler: function() {
        return g;
      } });
      let d = c(344), e = c(181);
      function f() {
        return (0, e.interceptFetch)(c.g.fetch);
      }
      function g(a2) {
        return (b2, c2) => (0, d.withRequest)(b2, e.reader, () => a2(b2, c2));
      }
    }, 141: function(a, b, c) {
      "use strict";
      var d = this && this.__importDefault || function(a2) {
        return a2 && a2.__esModule ? a2 : { default: a2 };
      };
      Object.defineProperty(b, "__esModule", { value: true });
      let e = d(c(927));
      class f extends e.default {
        select(a2) {
          let b2 = false, c2 = (null != a2 ? a2 : "*").split("").map((a3) => /\s/.test(a3) && !b2 ? "" : ('"' === a3 && (b2 = !b2), a3)).join("");
          return this.url.searchParams.set("select", c2), this.headers.append("Prefer", "return=representation"), this;
        }
        order(a2, { ascending: b2 = true, nullsFirst: c2, foreignTable: d2, referencedTable: e2 = d2 } = {}) {
          let f2 = e2 ? `${e2}.order` : "order", g = this.url.searchParams.get(f2);
          return this.url.searchParams.set(f2, `${g ? `${g},` : ""}${a2}.${b2 ? "asc" : "desc"}${void 0 === c2 ? "" : c2 ? ".nullsfirst" : ".nullslast"}`), this;
        }
        limit(a2, { foreignTable: b2, referencedTable: c2 = b2 } = {}) {
          let d2 = void 0 === c2 ? "limit" : `${c2}.limit`;
          return this.url.searchParams.set(d2, `${a2}`), this;
        }
        range(a2, b2, { foreignTable: c2, referencedTable: d2 = c2 } = {}) {
          let e2 = void 0 === d2 ? "offset" : `${d2}.offset`, f2 = void 0 === d2 ? "limit" : `${d2}.limit`;
          return this.url.searchParams.set(e2, `${a2}`), this.url.searchParams.set(f2, `${b2 - a2 + 1}`), this;
        }
        abortSignal(a2) {
          return this.signal = a2, this;
        }
        single() {
          return this.headers.set("Accept", "application/vnd.pgrst.object+json"), this;
        }
        maybeSingle() {
          return "GET" === this.method ? this.headers.set("Accept", "application/json") : this.headers.set("Accept", "application/vnd.pgrst.object+json"), this.isMaybeSingle = true, this;
        }
        csv() {
          return this.headers.set("Accept", "text/csv"), this;
        }
        geojson() {
          return this.headers.set("Accept", "application/geo+json"), this;
        }
        explain({ analyze: a2 = false, verbose: b2 = false, settings: c2 = false, buffers: d2 = false, wal: e2 = false, format: f2 = "text" } = {}) {
          var g;
          let h = [a2 ? "analyze" : null, b2 ? "verbose" : null, c2 ? "settings" : null, d2 ? "buffers" : null, e2 ? "wal" : null].filter(Boolean).join("|"), i = null != (g = this.headers.get("Accept")) ? g : "application/json";
          return this.headers.set("Accept", `application/vnd.pgrst.plan+${f2}; for="${i}"; options=${h};`), this;
        }
        rollback() {
          return this.headers.append("Prefer", "tx=rollback"), this;
        }
        returns() {
          return this;
        }
        maxAffected(a2) {
          return this.headers.append("Prefer", "handling=strict"), this.headers.append("Prefer", `max-affected=${a2}`), this;
        }
      }
      b.default = f;
    }, 181: (a, b, c) => {
      "use strict";
      var d = c(356).Buffer;
      Object.defineProperty(b, "__esModule", { value: true }), !function(a2, b2) {
        for (var c2 in b2) Object.defineProperty(a2, c2, { enumerable: true, get: b2[c2] });
      }(b, { handleFetch: function() {
        return h;
      }, interceptFetch: function() {
        return i;
      }, reader: function() {
        return f;
      } });
      let e = c(344), f = { url: (a2) => a2.url, header: (a2, b2) => a2.headers.get(b2) };
      async function g(a2, b2) {
        let { url: c2, method: e2, headers: f2, body: g2, cache: h2, credentials: i2, integrity: j, mode: k, redirect: l, referrer: m, referrerPolicy: n } = b2;
        return { testData: a2, api: "fetch", request: { url: c2, method: e2, headers: [...Array.from(f2), ["next-test-stack", function() {
          let a3 = (Error().stack ?? "").split("\n");
          for (let b3 = 1; b3 < a3.length; b3++) if (a3[b3].length > 0) {
            a3 = a3.slice(b3);
            break;
          }
          return (a3 = (a3 = (a3 = a3.filter((a4) => !a4.includes("/next/dist/"))).slice(0, 5)).map((a4) => a4.replace("webpack-internal:///(rsc)/", "").trim())).join("    ");
        }()]], body: g2 ? d.from(await b2.arrayBuffer()).toString("base64") : null, cache: h2, credentials: i2, integrity: j, mode: k, redirect: l, referrer: m, referrerPolicy: n } };
      }
      async function h(a2, b2) {
        let c2 = (0, e.getTestReqInfo)(b2, f);
        if (!c2) return a2(b2);
        let { testData: h2, proxyPort: i2 } = c2, j = await g(h2, b2), k = await a2(`http://localhost:${i2}`, { method: "POST", body: JSON.stringify(j), next: { internal: true } });
        if (!k.ok) throw Object.defineProperty(Error(`Proxy request failed: ${k.status}`), "__NEXT_ERROR_CODE", { value: "E146", enumerable: false, configurable: true });
        let l = await k.json(), { api: m } = l;
        switch (m) {
          case "continue":
            return a2(b2);
          case "abort":
          case "unhandled":
            throw Object.defineProperty(Error(`Proxy request aborted [${b2.method} ${b2.url}]`), "__NEXT_ERROR_CODE", { value: "E145", enumerable: false, configurable: true });
          case "fetch":
            let { status: n, headers: o, body: p } = l.response;
            return new Response(p ? d.from(p, "base64") : null, { status: n, headers: new Headers(o) });
          default:
            return m;
        }
      }
      function i(a2) {
        return c.g.fetch = function(b2, c2) {
          var d2;
          return (null == c2 || null == (d2 = c2.next) ? void 0 : d2.internal) ? a2(b2, c2) : h(a2, new Request(b2, c2));
        }, () => {
          c.g.fetch = a2;
        };
      }
    }, 221: (a) => {
      (() => {
        "use strict";
        var b = { 993: (a2) => {
          var b2 = Object.prototype.hasOwnProperty, c2 = "~";
          function d2() {
          }
          function e2(a3, b3, c3) {
            this.fn = a3, this.context = b3, this.once = c3 || false;
          }
          function f(a3, b3, d3, f2, g2) {
            if ("function" != typeof d3) throw TypeError("The listener must be a function");
            var h2 = new e2(d3, f2 || a3, g2), i = c2 ? c2 + b3 : b3;
            return a3._events[i] ? a3._events[i].fn ? a3._events[i] = [a3._events[i], h2] : a3._events[i].push(h2) : (a3._events[i] = h2, a3._eventsCount++), a3;
          }
          function g(a3, b3) {
            0 == --a3._eventsCount ? a3._events = new d2() : delete a3._events[b3];
          }
          function h() {
            this._events = new d2(), this._eventsCount = 0;
          }
          Object.create && (d2.prototype = /* @__PURE__ */ Object.create(null), new d2().__proto__ || (c2 = false)), h.prototype.eventNames = function() {
            var a3, d3, e3 = [];
            if (0 === this._eventsCount) return e3;
            for (d3 in a3 = this._events) b2.call(a3, d3) && e3.push(c2 ? d3.slice(1) : d3);
            return Object.getOwnPropertySymbols ? e3.concat(Object.getOwnPropertySymbols(a3)) : e3;
          }, h.prototype.listeners = function(a3) {
            var b3 = c2 ? c2 + a3 : a3, d3 = this._events[b3];
            if (!d3) return [];
            if (d3.fn) return [d3.fn];
            for (var e3 = 0, f2 = d3.length, g2 = Array(f2); e3 < f2; e3++) g2[e3] = d3[e3].fn;
            return g2;
          }, h.prototype.listenerCount = function(a3) {
            var b3 = c2 ? c2 + a3 : a3, d3 = this._events[b3];
            return d3 ? d3.fn ? 1 : d3.length : 0;
          }, h.prototype.emit = function(a3, b3, d3, e3, f2, g2) {
            var h2 = c2 ? c2 + a3 : a3;
            if (!this._events[h2]) return false;
            var i, j, k = this._events[h2], l = arguments.length;
            if (k.fn) {
              switch (k.once && this.removeListener(a3, k.fn, void 0, true), l) {
                case 1:
                  return k.fn.call(k.context), true;
                case 2:
                  return k.fn.call(k.context, b3), true;
                case 3:
                  return k.fn.call(k.context, b3, d3), true;
                case 4:
                  return k.fn.call(k.context, b3, d3, e3), true;
                case 5:
                  return k.fn.call(k.context, b3, d3, e3, f2), true;
                case 6:
                  return k.fn.call(k.context, b3, d3, e3, f2, g2), true;
              }
              for (j = 1, i = Array(l - 1); j < l; j++) i[j - 1] = arguments[j];
              k.fn.apply(k.context, i);
            } else {
              var m, n = k.length;
              for (j = 0; j < n; j++) switch (k[j].once && this.removeListener(a3, k[j].fn, void 0, true), l) {
                case 1:
                  k[j].fn.call(k[j].context);
                  break;
                case 2:
                  k[j].fn.call(k[j].context, b3);
                  break;
                case 3:
                  k[j].fn.call(k[j].context, b3, d3);
                  break;
                case 4:
                  k[j].fn.call(k[j].context, b3, d3, e3);
                  break;
                default:
                  if (!i) for (m = 1, i = Array(l - 1); m < l; m++) i[m - 1] = arguments[m];
                  k[j].fn.apply(k[j].context, i);
              }
            }
            return true;
          }, h.prototype.on = function(a3, b3, c3) {
            return f(this, a3, b3, c3, false);
          }, h.prototype.once = function(a3, b3, c3) {
            return f(this, a3, b3, c3, true);
          }, h.prototype.removeListener = function(a3, b3, d3, e3) {
            var f2 = c2 ? c2 + a3 : a3;
            if (!this._events[f2]) return this;
            if (!b3) return g(this, f2), this;
            var h2 = this._events[f2];
            if (h2.fn) h2.fn !== b3 || e3 && !h2.once || d3 && h2.context !== d3 || g(this, f2);
            else {
              for (var i = 0, j = [], k = h2.length; i < k; i++) (h2[i].fn !== b3 || e3 && !h2[i].once || d3 && h2[i].context !== d3) && j.push(h2[i]);
              j.length ? this._events[f2] = 1 === j.length ? j[0] : j : g(this, f2);
            }
            return this;
          }, h.prototype.removeAllListeners = function(a3) {
            var b3;
            return a3 ? (b3 = c2 ? c2 + a3 : a3, this._events[b3] && g(this, b3)) : (this._events = new d2(), this._eventsCount = 0), this;
          }, h.prototype.off = h.prototype.removeListener, h.prototype.addListener = h.prototype.on, h.prefixed = c2, h.EventEmitter = h, a2.exports = h;
        }, 213: (a2) => {
          a2.exports = (a3, b2) => (b2 = b2 || (() => {
          }), a3.then((a4) => new Promise((a5) => {
            a5(b2());
          }).then(() => a4), (a4) => new Promise((a5) => {
            a5(b2());
          }).then(() => {
            throw a4;
          })));
        }, 574: (a2, b2) => {
          Object.defineProperty(b2, "__esModule", { value: true }), b2.default = function(a3, b3, c2) {
            let d2 = 0, e2 = a3.length;
            for (; e2 > 0; ) {
              let f = e2 / 2 | 0, g = d2 + f;
              0 >= c2(a3[g], b3) ? (d2 = ++g, e2 -= f + 1) : e2 = f;
            }
            return d2;
          };
        }, 821: (a2, b2, c2) => {
          Object.defineProperty(b2, "__esModule", { value: true });
          let d2 = c2(574);
          class e2 {
            constructor() {
              this._queue = [];
            }
            enqueue(a3, b3) {
              let c3 = { priority: (b3 = Object.assign({ priority: 0 }, b3)).priority, run: a3 };
              if (this.size && this._queue[this.size - 1].priority >= b3.priority) return void this._queue.push(c3);
              let e3 = d2.default(this._queue, c3, (a4, b4) => b4.priority - a4.priority);
              this._queue.splice(e3, 0, c3);
            }
            dequeue() {
              let a3 = this._queue.shift();
              return null == a3 ? void 0 : a3.run;
            }
            filter(a3) {
              return this._queue.filter((b3) => b3.priority === a3.priority).map((a4) => a4.run);
            }
            get size() {
              return this._queue.length;
            }
          }
          b2.default = e2;
        }, 816: (a2, b2, c2) => {
          let d2 = c2(213);
          class e2 extends Error {
            constructor(a3) {
              super(a3), this.name = "TimeoutError";
            }
          }
          let f = (a3, b3, c3) => new Promise((f2, g) => {
            if ("number" != typeof b3 || b3 < 0) throw TypeError("Expected `milliseconds` to be a positive number");
            if (b3 === 1 / 0) return void f2(a3);
            let h = setTimeout(() => {
              if ("function" == typeof c3) {
                try {
                  f2(c3());
                } catch (a4) {
                  g(a4);
                }
                return;
              }
              let d3 = "string" == typeof c3 ? c3 : `Promise timed out after ${b3} milliseconds`, h2 = c3 instanceof Error ? c3 : new e2(d3);
              "function" == typeof a3.cancel && a3.cancel(), g(h2);
            }, b3);
            d2(a3.then(f2, g), () => {
              clearTimeout(h);
            });
          });
          a2.exports = f, a2.exports.default = f, a2.exports.TimeoutError = e2;
        } }, c = {};
        function d(a2) {
          var e2 = c[a2];
          if (void 0 !== e2) return e2.exports;
          var f = c[a2] = { exports: {} }, g = true;
          try {
            b[a2](f, f.exports, d), g = false;
          } finally {
            g && delete c[a2];
          }
          return f.exports;
        }
        d.ab = "//";
        var e = {};
        (() => {
          Object.defineProperty(e, "__esModule", { value: true });
          let a2 = d(993), b2 = d(816), c2 = d(821), f = () => {
          }, g = new b2.TimeoutError();
          class h extends a2 {
            constructor(a3) {
              var b3, d2, e2, g2;
              if (super(), this._intervalCount = 0, this._intervalEnd = 0, this._pendingCount = 0, this._resolveEmpty = f, this._resolveIdle = f, !("number" == typeof (a3 = Object.assign({ carryoverConcurrencyCount: false, intervalCap: 1 / 0, interval: 0, concurrency: 1 / 0, autoStart: true, queueClass: c2.default }, a3)).intervalCap && a3.intervalCap >= 1)) throw TypeError(`Expected \`intervalCap\` to be a number from 1 and up, got \`${null != (d2 = null == (b3 = a3.intervalCap) ? void 0 : b3.toString()) ? d2 : ""}\` (${typeof a3.intervalCap})`);
              if (void 0 === a3.interval || !(Number.isFinite(a3.interval) && a3.interval >= 0)) throw TypeError(`Expected \`interval\` to be a finite number >= 0, got \`${null != (g2 = null == (e2 = a3.interval) ? void 0 : e2.toString()) ? g2 : ""}\` (${typeof a3.interval})`);
              this._carryoverConcurrencyCount = a3.carryoverConcurrencyCount, this._isIntervalIgnored = a3.intervalCap === 1 / 0 || 0 === a3.interval, this._intervalCap = a3.intervalCap, this._interval = a3.interval, this._queue = new a3.queueClass(), this._queueClass = a3.queueClass, this.concurrency = a3.concurrency, this._timeout = a3.timeout, this._throwOnTimeout = true === a3.throwOnTimeout, this._isPaused = false === a3.autoStart;
            }
            get _doesIntervalAllowAnother() {
              return this._isIntervalIgnored || this._intervalCount < this._intervalCap;
            }
            get _doesConcurrentAllowAnother() {
              return this._pendingCount < this._concurrency;
            }
            _next() {
              this._pendingCount--, this._tryToStartAnother(), this.emit("next");
            }
            _resolvePromises() {
              this._resolveEmpty(), this._resolveEmpty = f, 0 === this._pendingCount && (this._resolveIdle(), this._resolveIdle = f, this.emit("idle"));
            }
            _onResumeInterval() {
              this._onInterval(), this._initializeIntervalIfNeeded(), this._timeoutId = void 0;
            }
            _isIntervalPaused() {
              let a3 = Date.now();
              if (void 0 === this._intervalId) {
                let b3 = this._intervalEnd - a3;
                if (!(b3 < 0)) return void 0 === this._timeoutId && (this._timeoutId = setTimeout(() => {
                  this._onResumeInterval();
                }, b3)), true;
                this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0;
              }
              return false;
            }
            _tryToStartAnother() {
              if (0 === this._queue.size) return this._intervalId && clearInterval(this._intervalId), this._intervalId = void 0, this._resolvePromises(), false;
              if (!this._isPaused) {
                let a3 = !this._isIntervalPaused();
                if (this._doesIntervalAllowAnother && this._doesConcurrentAllowAnother) {
                  let b3 = this._queue.dequeue();
                  return !!b3 && (this.emit("active"), b3(), a3 && this._initializeIntervalIfNeeded(), true);
                }
              }
              return false;
            }
            _initializeIntervalIfNeeded() {
              this._isIntervalIgnored || void 0 !== this._intervalId || (this._intervalId = setInterval(() => {
                this._onInterval();
              }, this._interval), this._intervalEnd = Date.now() + this._interval);
            }
            _onInterval() {
              0 === this._intervalCount && 0 === this._pendingCount && this._intervalId && (clearInterval(this._intervalId), this._intervalId = void 0), this._intervalCount = this._carryoverConcurrencyCount ? this._pendingCount : 0, this._processQueue();
            }
            _processQueue() {
              for (; this._tryToStartAnother(); ) ;
            }
            get concurrency() {
              return this._concurrency;
            }
            set concurrency(a3) {
              if (!("number" == typeof a3 && a3 >= 1)) throw TypeError(`Expected \`concurrency\` to be a number from 1 and up, got \`${a3}\` (${typeof a3})`);
              this._concurrency = a3, this._processQueue();
            }
            async add(a3, c3 = {}) {
              return new Promise((d2, e2) => {
                let f2 = async () => {
                  this._pendingCount++, this._intervalCount++;
                  try {
                    let f3 = void 0 === this._timeout && void 0 === c3.timeout ? a3() : b2.default(Promise.resolve(a3()), void 0 === c3.timeout ? this._timeout : c3.timeout, () => {
                      (void 0 === c3.throwOnTimeout ? this._throwOnTimeout : c3.throwOnTimeout) && e2(g);
                    });
                    d2(await f3);
                  } catch (a4) {
                    e2(a4);
                  }
                  this._next();
                };
                this._queue.enqueue(f2, c3), this._tryToStartAnother(), this.emit("add");
              });
            }
            async addAll(a3, b3) {
              return Promise.all(a3.map(async (a4) => this.add(a4, b3)));
            }
            start() {
              return this._isPaused && (this._isPaused = false, this._processQueue()), this;
            }
            pause() {
              this._isPaused = true;
            }
            clear() {
              this._queue = new this._queueClass();
            }
            async onEmpty() {
              if (0 !== this._queue.size) return new Promise((a3) => {
                let b3 = this._resolveEmpty;
                this._resolveEmpty = () => {
                  b3(), a3();
                };
              });
            }
            async onIdle() {
              if (0 !== this._pendingCount || 0 !== this._queue.size) return new Promise((a3) => {
                let b3 = this._resolveIdle;
                this._resolveIdle = () => {
                  b3(), a3();
                };
              });
            }
            get size() {
              return this._queue.size;
            }
            sizeBy(a3) {
              return this._queue.filter(a3).length;
            }
            get pending() {
              return this._pendingCount;
            }
            get isPaused() {
              return this._isPaused;
            }
            get timeout() {
              return this._timeout;
            }
            set timeout(a3) {
              this._timeout = a3;
            }
          }
          e.default = h;
        })(), a.exports = e;
      })();
    }, 228: (a, b, c) => {
      "use strict";
      let d;
      c.r(b), c.d(b, { default: () => by });
      var e, f = {};
      async function g() {
        return "_ENTRIES" in globalThis && _ENTRIES.middleware_instrumentation && await _ENTRIES.middleware_instrumentation;
      }
      c.r(f), c.d(f, { config: () => bu, middleware: () => bt });
      let h = null;
      async function i() {
        if ("phase-production-build" === process.env.NEXT_PHASE) return;
        h || (h = g());
        let a10 = await h;
        if (null == a10 ? void 0 : a10.register) try {
          await a10.register();
        } catch (a11) {
          throw a11.message = `An error occurred while loading instrumentation hook: ${a11.message}`, a11;
        }
      }
      async function j(...a10) {
        let b2 = await g();
        try {
          var c2;
          await (null == b2 || null == (c2 = b2.onRequestError) ? void 0 : c2.call(b2, ...a10));
        } catch (a11) {
          console.error("Error in instrumentation.onRequestError:", a11);
        }
      }
      let k = null;
      function l() {
        return k || (k = i()), k;
      }
      function m(a10) {
        return `The edge runtime does not support Node.js '${a10}' module.
Learn More: https://nextjs.org/docs/messages/node-module-in-edge-runtime`;
      }
      process !== c.g.process && (process.env = c.g.process.env, c.g.process = process);
      try {
        Object.defineProperty(globalThis, "__import_unsupported", { value: function(a10) {
          let b2 = new Proxy(function() {
          }, { get(b3, c2) {
            if ("then" === c2) return {};
            throw Object.defineProperty(Error(m(a10)), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
          }, construct() {
            throw Object.defineProperty(Error(m(a10)), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
          }, apply(c2, d2, e2) {
            if ("function" == typeof e2[0]) return e2[0](b2);
            throw Object.defineProperty(Error(m(a10)), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
          } });
          return new Proxy({}, { get: () => b2 });
        }, enumerable: false, configurable: false });
      } catch {
      }
      l();
      class n extends Error {
        constructor({ page: a10 }) {
          super(`The middleware "${a10}" accepts an async API directly with the form:
  
  export function middleware(request, event) {
    return NextResponse.redirect('/new-location')
  }
  
  Read more: https://nextjs.org/docs/messages/middleware-new-signature
  `);
        }
      }
      class o extends Error {
        constructor() {
          super(`The request.page has been deprecated in favour of \`URLPattern\`.
  Read more: https://nextjs.org/docs/messages/middleware-request-page
  `);
        }
      }
      class p extends Error {
        constructor() {
          super(`The request.ua has been removed in favour of \`userAgent\` function.
  Read more: https://nextjs.org/docs/messages/middleware-parse-user-agent
  `);
        }
      }
      let q = "_N_T_", r = { shared: "shared", reactServerComponents: "rsc", serverSideRendering: "ssr", actionBrowser: "action-browser", apiNode: "api-node", apiEdge: "api-edge", middleware: "middleware", instrument: "instrument", edgeAsset: "edge-asset", appPagesBrowser: "app-pages-browser", pagesDirBrowser: "pages-dir-browser", pagesDirEdge: "pages-dir-edge", pagesDirNode: "pages-dir-node" };
      function s(a10) {
        var b2, c2, d2, e2, f2, g2 = [], h2 = 0;
        function i2() {
          for (; h2 < a10.length && /\s/.test(a10.charAt(h2)); ) h2 += 1;
          return h2 < a10.length;
        }
        for (; h2 < a10.length; ) {
          for (b2 = h2, f2 = false; i2(); ) if ("," === (c2 = a10.charAt(h2))) {
            for (d2 = h2, h2 += 1, i2(), e2 = h2; h2 < a10.length && "=" !== (c2 = a10.charAt(h2)) && ";" !== c2 && "," !== c2; ) h2 += 1;
            h2 < a10.length && "=" === a10.charAt(h2) ? (f2 = true, h2 = e2, g2.push(a10.substring(b2, d2)), b2 = h2) : h2 = d2 + 1;
          } else h2 += 1;
          (!f2 || h2 >= a10.length) && g2.push(a10.substring(b2, a10.length));
        }
        return g2;
      }
      function t(a10) {
        let b2 = {}, c2 = [];
        if (a10) for (let [d2, e2] of a10.entries()) "set-cookie" === d2.toLowerCase() ? (c2.push(...s(e2)), b2[d2] = 1 === c2.length ? c2[0] : c2) : b2[d2] = e2;
        return b2;
      }
      function u(a10) {
        try {
          return String(new URL(String(a10)));
        } catch (b2) {
          throw Object.defineProperty(Error(`URL is malformed "${String(a10)}". Please use only absolute URLs - https://nextjs.org/docs/messages/middleware-relative-urls`, { cause: b2 }), "__NEXT_ERROR_CODE", { value: "E61", enumerable: false, configurable: true });
        }
      }
      ({ ...r, GROUP: { builtinReact: [r.reactServerComponents, r.actionBrowser], serverOnly: [r.reactServerComponents, r.actionBrowser, r.instrument, r.middleware], neutralTarget: [r.apiNode, r.apiEdge], clientOnly: [r.serverSideRendering, r.appPagesBrowser], bundled: [r.reactServerComponents, r.actionBrowser, r.serverSideRendering, r.appPagesBrowser, r.shared, r.instrument, r.middleware], appPages: [r.reactServerComponents, r.serverSideRendering, r.appPagesBrowser, r.actionBrowser] } });
      let v = Symbol("response"), w = Symbol("passThrough"), x = Symbol("waitUntil");
      class y {
        constructor(a10, b2) {
          this[w] = false, this[x] = b2 ? { kind: "external", function: b2 } : { kind: "internal", promises: [] };
        }
        respondWith(a10) {
          this[v] || (this[v] = Promise.resolve(a10));
        }
        passThroughOnException() {
          this[w] = true;
        }
        waitUntil(a10) {
          if ("external" === this[x].kind) return (0, this[x].function)(a10);
          this[x].promises.push(a10);
        }
      }
      class z extends y {
        constructor(a10) {
          var b2;
          super(a10.request, null == (b2 = a10.context) ? void 0 : b2.waitUntil), this.sourcePage = a10.page;
        }
        get request() {
          throw Object.defineProperty(new n({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
        respondWith() {
          throw Object.defineProperty(new n({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
      }
      function A(a10) {
        return a10.replace(/\/$/, "") || "/";
      }
      function B(a10) {
        let b2 = a10.indexOf("#"), c2 = a10.indexOf("?"), d2 = c2 > -1 && (b2 < 0 || c2 < b2);
        return d2 || b2 > -1 ? { pathname: a10.substring(0, d2 ? c2 : b2), query: d2 ? a10.substring(c2, b2 > -1 ? b2 : void 0) : "", hash: b2 > -1 ? a10.slice(b2) : "" } : { pathname: a10, query: "", hash: "" };
      }
      function C(a10, b2) {
        if (!a10.startsWith("/") || !b2) return a10;
        let { pathname: c2, query: d2, hash: e2 } = B(a10);
        return "" + b2 + c2 + d2 + e2;
      }
      function D(a10, b2) {
        if (!a10.startsWith("/") || !b2) return a10;
        let { pathname: c2, query: d2, hash: e2 } = B(a10);
        return "" + c2 + b2 + d2 + e2;
      }
      function E(a10, b2) {
        if ("string" != typeof a10) return false;
        let { pathname: c2 } = B(a10);
        return c2 === b2 || c2.startsWith(b2 + "/");
      }
      let F = /* @__PURE__ */ new WeakMap();
      function G(a10, b2) {
        let c2;
        if (!b2) return { pathname: a10 };
        let d2 = F.get(b2);
        d2 || (d2 = b2.map((a11) => a11.toLowerCase()), F.set(b2, d2));
        let e2 = a10.split("/", 2);
        if (!e2[1]) return { pathname: a10 };
        let f2 = e2[1].toLowerCase(), g2 = d2.indexOf(f2);
        return g2 < 0 ? { pathname: a10 } : (c2 = b2[g2], { pathname: a10 = a10.slice(c2.length + 1) || "/", detectedLocale: c2 });
      }
      let H = /(?!^https?:\/\/)(127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}|\[::1\]|localhost)/;
      function I(a10, b2) {
        return new URL(String(a10).replace(H, "localhost"), b2 && String(b2).replace(H, "localhost"));
      }
      let J = Symbol("NextURLInternal");
      class K {
        constructor(a10, b2, c2) {
          let d2, e2;
          "object" == typeof b2 && "pathname" in b2 || "string" == typeof b2 ? (d2 = b2, e2 = c2 || {}) : e2 = c2 || b2 || {}, this[J] = { url: I(a10, d2 ?? e2.base), options: e2, basePath: "" }, this.analyze();
        }
        analyze() {
          var a10, b2, c2, d2, e2;
          let f2 = function(a11, b3) {
            var c3, d3;
            let { basePath: e3, i18n: f3, trailingSlash: g3 } = null != (c3 = b3.nextConfig) ? c3 : {}, h3 = { pathname: a11, trailingSlash: "/" !== a11 ? a11.endsWith("/") : g3 };
            e3 && E(h3.pathname, e3) && (h3.pathname = function(a12, b4) {
              if (!E(a12, b4)) return a12;
              let c4 = a12.slice(b4.length);
              return c4.startsWith("/") ? c4 : "/" + c4;
            }(h3.pathname, e3), h3.basePath = e3);
            let i2 = h3.pathname;
            if (h3.pathname.startsWith("/_next/data/") && h3.pathname.endsWith(".json")) {
              let a12 = h3.pathname.replace(/^\/_next\/data\//, "").replace(/\.json$/, "").split("/");
              h3.buildId = a12[0], i2 = "index" !== a12[1] ? "/" + a12.slice(1).join("/") : "/", true === b3.parseData && (h3.pathname = i2);
            }
            if (f3) {
              let a12 = b3.i18nProvider ? b3.i18nProvider.analyze(h3.pathname) : G(h3.pathname, f3.locales);
              h3.locale = a12.detectedLocale, h3.pathname = null != (d3 = a12.pathname) ? d3 : h3.pathname, !a12.detectedLocale && h3.buildId && (a12 = b3.i18nProvider ? b3.i18nProvider.analyze(i2) : G(i2, f3.locales)).detectedLocale && (h3.locale = a12.detectedLocale);
            }
            return h3;
          }(this[J].url.pathname, { nextConfig: this[J].options.nextConfig, parseData: true, i18nProvider: this[J].options.i18nProvider }), g2 = function(a11, b3) {
            let c3;
            if ((null == b3 ? void 0 : b3.host) && !Array.isArray(b3.host)) c3 = b3.host.toString().split(":", 1)[0];
            else {
              if (!a11.hostname) return;
              c3 = a11.hostname;
            }
            return c3.toLowerCase();
          }(this[J].url, this[J].options.headers);
          this[J].domainLocale = this[J].options.i18nProvider ? this[J].options.i18nProvider.detectDomainLocale(g2) : function(a11, b3, c3) {
            if (a11) for (let f3 of (c3 && (c3 = c3.toLowerCase()), a11)) {
              var d3, e3;
              if (b3 === (null == (d3 = f3.domain) ? void 0 : d3.split(":", 1)[0].toLowerCase()) || c3 === f3.defaultLocale.toLowerCase() || (null == (e3 = f3.locales) ? void 0 : e3.some((a12) => a12.toLowerCase() === c3))) return f3;
            }
          }(null == (b2 = this[J].options.nextConfig) || null == (a10 = b2.i18n) ? void 0 : a10.domains, g2);
          let h2 = (null == (c2 = this[J].domainLocale) ? void 0 : c2.defaultLocale) || (null == (e2 = this[J].options.nextConfig) || null == (d2 = e2.i18n) ? void 0 : d2.defaultLocale);
          this[J].url.pathname = f2.pathname, this[J].defaultLocale = h2, this[J].basePath = f2.basePath ?? "", this[J].buildId = f2.buildId, this[J].locale = f2.locale ?? h2, this[J].trailingSlash = f2.trailingSlash;
        }
        formatPathname() {
          var a10;
          let b2;
          return b2 = function(a11, b3, c2, d2) {
            if (!b3 || b3 === c2) return a11;
            let e2 = a11.toLowerCase();
            return !d2 && (E(e2, "/api") || E(e2, "/" + b3.toLowerCase())) ? a11 : C(a11, "/" + b3);
          }((a10 = { basePath: this[J].basePath, buildId: this[J].buildId, defaultLocale: this[J].options.forceLocale ? void 0 : this[J].defaultLocale, locale: this[J].locale, pathname: this[J].url.pathname, trailingSlash: this[J].trailingSlash }).pathname, a10.locale, a10.buildId ? void 0 : a10.defaultLocale, a10.ignorePrefix), (a10.buildId || !a10.trailingSlash) && (b2 = A(b2)), a10.buildId && (b2 = D(C(b2, "/_next/data/" + a10.buildId), "/" === a10.pathname ? "index.json" : ".json")), b2 = C(b2, a10.basePath), !a10.buildId && a10.trailingSlash ? b2.endsWith("/") ? b2 : D(b2, "/") : A(b2);
        }
        formatSearch() {
          return this[J].url.search;
        }
        get buildId() {
          return this[J].buildId;
        }
        set buildId(a10) {
          this[J].buildId = a10;
        }
        get locale() {
          return this[J].locale ?? "";
        }
        set locale(a10) {
          var b2, c2;
          if (!this[J].locale || !(null == (c2 = this[J].options.nextConfig) || null == (b2 = c2.i18n) ? void 0 : b2.locales.includes(a10))) throw Object.defineProperty(TypeError(`The NextURL configuration includes no locale "${a10}"`), "__NEXT_ERROR_CODE", { value: "E597", enumerable: false, configurable: true });
          this[J].locale = a10;
        }
        get defaultLocale() {
          return this[J].defaultLocale;
        }
        get domainLocale() {
          return this[J].domainLocale;
        }
        get searchParams() {
          return this[J].url.searchParams;
        }
        get host() {
          return this[J].url.host;
        }
        set host(a10) {
          this[J].url.host = a10;
        }
        get hostname() {
          return this[J].url.hostname;
        }
        set hostname(a10) {
          this[J].url.hostname = a10;
        }
        get port() {
          return this[J].url.port;
        }
        set port(a10) {
          this[J].url.port = a10;
        }
        get protocol() {
          return this[J].url.protocol;
        }
        set protocol(a10) {
          this[J].url.protocol = a10;
        }
        get href() {
          let a10 = this.formatPathname(), b2 = this.formatSearch();
          return `${this.protocol}//${this.host}${a10}${b2}${this.hash}`;
        }
        set href(a10) {
          this[J].url = I(a10), this.analyze();
        }
        get origin() {
          return this[J].url.origin;
        }
        get pathname() {
          return this[J].url.pathname;
        }
        set pathname(a10) {
          this[J].url.pathname = a10;
        }
        get hash() {
          return this[J].url.hash;
        }
        set hash(a10) {
          this[J].url.hash = a10;
        }
        get search() {
          return this[J].url.search;
        }
        set search(a10) {
          this[J].url.search = a10;
        }
        get password() {
          return this[J].url.password;
        }
        set password(a10) {
          this[J].url.password = a10;
        }
        get username() {
          return this[J].url.username;
        }
        set username(a10) {
          this[J].url.username = a10;
        }
        get basePath() {
          return this[J].basePath;
        }
        set basePath(a10) {
          this[J].basePath = a10.startsWith("/") ? a10 : `/${a10}`;
        }
        toString() {
          return this.href;
        }
        toJSON() {
          return this.href;
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { href: this.href, origin: this.origin, protocol: this.protocol, username: this.username, password: this.password, host: this.host, hostname: this.hostname, port: this.port, pathname: this.pathname, search: this.search, searchParams: this.searchParams, hash: this.hash };
        }
        clone() {
          return new K(String(this), this[J].options);
        }
      }
      var L = c(363);
      let M = Symbol("internal request");
      class N extends Request {
        constructor(a10, b2 = {}) {
          let c2 = "string" != typeof a10 && "url" in a10 ? a10.url : String(a10);
          u(c2), a10 instanceof Request ? super(a10, b2) : super(c2, b2);
          let d2 = new K(c2, { headers: t(this.headers), nextConfig: b2.nextConfig });
          this[M] = { cookies: new L.RequestCookies(this.headers), nextUrl: d2, url: d2.toString() };
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { cookies: this.cookies, nextUrl: this.nextUrl, url: this.url, bodyUsed: this.bodyUsed, cache: this.cache, credentials: this.credentials, destination: this.destination, headers: Object.fromEntries(this.headers), integrity: this.integrity, keepalive: this.keepalive, method: this.method, mode: this.mode, redirect: this.redirect, referrer: this.referrer, referrerPolicy: this.referrerPolicy, signal: this.signal };
        }
        get cookies() {
          return this[M].cookies;
        }
        get nextUrl() {
          return this[M].nextUrl;
        }
        get page() {
          throw new o();
        }
        get ua() {
          throw new p();
        }
        get url() {
          return this[M].url;
        }
      }
      class O {
        static get(a10, b2, c2) {
          let d2 = Reflect.get(a10, b2, c2);
          return "function" == typeof d2 ? d2.bind(a10) : d2;
        }
        static set(a10, b2, c2, d2) {
          return Reflect.set(a10, b2, c2, d2);
        }
        static has(a10, b2) {
          return Reflect.has(a10, b2);
        }
        static deleteProperty(a10, b2) {
          return Reflect.deleteProperty(a10, b2);
        }
      }
      let P = Symbol("internal response"), Q = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
      function R(a10, b2) {
        var c2;
        if (null == a10 || null == (c2 = a10.request) ? void 0 : c2.headers) {
          if (!(a10.request.headers instanceof Headers)) throw Object.defineProperty(Error("request.headers must be an instance of Headers"), "__NEXT_ERROR_CODE", { value: "E119", enumerable: false, configurable: true });
          let c3 = [];
          for (let [d2, e2] of a10.request.headers) b2.set("x-middleware-request-" + d2, e2), c3.push(d2);
          b2.set("x-middleware-override-headers", c3.join(","));
        }
      }
      class S extends Response {
        constructor(a10, b2 = {}) {
          super(a10, b2);
          let c2 = this.headers, d2 = new Proxy(new L.ResponseCookies(c2), { get(a11, d3, e2) {
            switch (d3) {
              case "delete":
              case "set":
                return (...e3) => {
                  let f2 = Reflect.apply(a11[d3], a11, e3), g2 = new Headers(c2);
                  return f2 instanceof L.ResponseCookies && c2.set("x-middleware-set-cookie", f2.getAll().map((a12) => (0, L.stringifyCookie)(a12)).join(",")), R(b2, g2), f2;
                };
              default:
                return O.get(a11, d3, e2);
            }
          } });
          this[P] = { cookies: d2, url: b2.url ? new K(b2.url, { headers: t(c2), nextConfig: b2.nextConfig }) : void 0 };
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { cookies: this.cookies, url: this.url, body: this.body, bodyUsed: this.bodyUsed, headers: Object.fromEntries(this.headers), ok: this.ok, redirected: this.redirected, status: this.status, statusText: this.statusText, type: this.type };
        }
        get cookies() {
          return this[P].cookies;
        }
        static json(a10, b2) {
          let c2 = Response.json(a10, b2);
          return new S(c2.body, c2);
        }
        static redirect(a10, b2) {
          let c2 = "number" == typeof b2 ? b2 : (null == b2 ? void 0 : b2.status) ?? 307;
          if (!Q.has(c2)) throw Object.defineProperty(RangeError('Failed to execute "redirect" on "response": Invalid status code'), "__NEXT_ERROR_CODE", { value: "E529", enumerable: false, configurable: true });
          let d2 = "object" == typeof b2 ? b2 : {}, e2 = new Headers(null == d2 ? void 0 : d2.headers);
          return e2.set("Location", u(a10)), new S(null, { ...d2, headers: e2, status: c2 });
        }
        static rewrite(a10, b2) {
          let c2 = new Headers(null == b2 ? void 0 : b2.headers);
          return c2.set("x-middleware-rewrite", u(a10)), R(b2, c2), new S(null, { ...b2, headers: c2 });
        }
        static next(a10) {
          let b2 = new Headers(null == a10 ? void 0 : a10.headers);
          return b2.set("x-middleware-next", "1"), R(a10, b2), new S(null, { ...a10, headers: b2 });
        }
      }
      function T(a10, b2) {
        let c2 = "string" == typeof b2 ? new URL(b2) : b2, d2 = new URL(a10, b2), e2 = d2.origin === c2.origin;
        return { url: e2 ? d2.toString().slice(c2.origin.length) : d2.toString(), isRelative: e2 };
      }
      let U = "next-router-prefetch", V = ["rsc", "next-router-state-tree", U, "next-hmr-refresh", "next-router-segment-prefetch"], W = "_rsc";
      class X extends Error {
        constructor() {
          super("Headers cannot be modified. Read more: https://nextjs.org/docs/app/api-reference/functions/headers");
        }
        static callable() {
          throw new X();
        }
      }
      class Y extends Headers {
        constructor(a10) {
          super(), this.headers = new Proxy(a10, { get(b2, c2, d2) {
            if ("symbol" == typeof c2) return O.get(b2, c2, d2);
            let e2 = c2.toLowerCase(), f2 = Object.keys(a10).find((a11) => a11.toLowerCase() === e2);
            if (void 0 !== f2) return O.get(b2, f2, d2);
          }, set(b2, c2, d2, e2) {
            if ("symbol" == typeof c2) return O.set(b2, c2, d2, e2);
            let f2 = c2.toLowerCase(), g2 = Object.keys(a10).find((a11) => a11.toLowerCase() === f2);
            return O.set(b2, g2 ?? c2, d2, e2);
          }, has(b2, c2) {
            if ("symbol" == typeof c2) return O.has(b2, c2);
            let d2 = c2.toLowerCase(), e2 = Object.keys(a10).find((a11) => a11.toLowerCase() === d2);
            return void 0 !== e2 && O.has(b2, e2);
          }, deleteProperty(b2, c2) {
            if ("symbol" == typeof c2) return O.deleteProperty(b2, c2);
            let d2 = c2.toLowerCase(), e2 = Object.keys(a10).find((a11) => a11.toLowerCase() === d2);
            return void 0 === e2 || O.deleteProperty(b2, e2);
          } });
        }
        static seal(a10) {
          return new Proxy(a10, { get(a11, b2, c2) {
            switch (b2) {
              case "append":
              case "delete":
              case "set":
                return X.callable;
              default:
                return O.get(a11, b2, c2);
            }
          } });
        }
        merge(a10) {
          return Array.isArray(a10) ? a10.join(", ") : a10;
        }
        static from(a10) {
          return a10 instanceof Headers ? a10 : new Y(a10);
        }
        append(a10, b2) {
          let c2 = this.headers[a10];
          "string" == typeof c2 ? this.headers[a10] = [c2, b2] : Array.isArray(c2) ? c2.push(b2) : this.headers[a10] = b2;
        }
        delete(a10) {
          delete this.headers[a10];
        }
        get(a10) {
          let b2 = this.headers[a10];
          return void 0 !== b2 ? this.merge(b2) : null;
        }
        has(a10) {
          return void 0 !== this.headers[a10];
        }
        set(a10, b2) {
          this.headers[a10] = b2;
        }
        forEach(a10, b2) {
          for (let [c2, d2] of this.entries()) a10.call(b2, d2, c2, this);
        }
        *entries() {
          for (let a10 of Object.keys(this.headers)) {
            let b2 = a10.toLowerCase(), c2 = this.get(b2);
            yield [b2, c2];
          }
        }
        *keys() {
          for (let a10 of Object.keys(this.headers)) {
            let b2 = a10.toLowerCase();
            yield b2;
          }
        }
        *values() {
          for (let a10 of Object.keys(this.headers)) {
            let b2 = this.get(a10);
            yield b2;
          }
        }
        [Symbol.iterator]() {
          return this.entries();
        }
      }
      let Z = Object.defineProperty(Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available"), "__NEXT_ERROR_CODE", { value: "E504", enumerable: false, configurable: true });
      class $ {
        disable() {
          throw Z;
        }
        getStore() {
        }
        run() {
          throw Z;
        }
        exit() {
          throw Z;
        }
        enterWith() {
          throw Z;
        }
        static bind(a10) {
          return a10;
        }
      }
      let _ = "undefined" != typeof globalThis && globalThis.AsyncLocalStorage;
      function aa() {
        return _ ? new _() : new $();
      }
      let ab = aa();
      class ac extends Error {
        constructor() {
          super("Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#options");
        }
        static callable() {
          throw new ac();
        }
      }
      class ad {
        static seal(a10) {
          return new Proxy(a10, { get(a11, b2, c2) {
            switch (b2) {
              case "clear":
              case "delete":
              case "set":
                return ac.callable;
              default:
                return O.get(a11, b2, c2);
            }
          } });
        }
      }
      let ae = Symbol.for("next.mutated.cookies");
      class af {
        static wrap(a10, b2) {
          let c2 = new L.ResponseCookies(new Headers());
          for (let b3 of a10.getAll()) c2.set(b3);
          let d2 = [], e2 = /* @__PURE__ */ new Set(), f2 = () => {
            let a11 = ab.getStore();
            if (a11 && (a11.pathWasRevalidated = true), d2 = c2.getAll().filter((a12) => e2.has(a12.name)), b2) {
              let a12 = [];
              for (let b3 of d2) {
                let c3 = new L.ResponseCookies(new Headers());
                c3.set(b3), a12.push(c3.toString());
              }
              b2(a12);
            }
          }, g2 = new Proxy(c2, { get(a11, b3, c3) {
            switch (b3) {
              case ae:
                return d2;
              case "delete":
                return function(...b4) {
                  e2.add("string" == typeof b4[0] ? b4[0] : b4[0].name);
                  try {
                    return a11.delete(...b4), g2;
                  } finally {
                    f2();
                  }
                };
              case "set":
                return function(...b4) {
                  e2.add("string" == typeof b4[0] ? b4[0] : b4[0].name);
                  try {
                    return a11.set(...b4), g2;
                  } finally {
                    f2();
                  }
                };
              default:
                return O.get(a11, b3, c3);
            }
          } });
          return g2;
        }
      }
      function ag(a10, b2) {
        if ("action" !== a10.phase) throw new ac();
      }
      var ah = function(a10) {
        return a10.handleRequest = "BaseServer.handleRequest", a10.run = "BaseServer.run", a10.pipe = "BaseServer.pipe", a10.getStaticHTML = "BaseServer.getStaticHTML", a10.render = "BaseServer.render", a10.renderToResponseWithComponents = "BaseServer.renderToResponseWithComponents", a10.renderToResponse = "BaseServer.renderToResponse", a10.renderToHTML = "BaseServer.renderToHTML", a10.renderError = "BaseServer.renderError", a10.renderErrorToResponse = "BaseServer.renderErrorToResponse", a10.renderErrorToHTML = "BaseServer.renderErrorToHTML", a10.render404 = "BaseServer.render404", a10;
      }(ah || {}), ai = function(a10) {
        return a10.loadDefaultErrorComponents = "LoadComponents.loadDefaultErrorComponents", a10.loadComponents = "LoadComponents.loadComponents", a10;
      }(ai || {}), aj = function(a10) {
        return a10.getRequestHandler = "NextServer.getRequestHandler", a10.getServer = "NextServer.getServer", a10.getServerRequestHandler = "NextServer.getServerRequestHandler", a10.createServer = "createServer.createServer", a10;
      }(aj || {}), ak = function(a10) {
        return a10.compression = "NextNodeServer.compression", a10.getBuildId = "NextNodeServer.getBuildId", a10.createComponentTree = "NextNodeServer.createComponentTree", a10.clientComponentLoading = "NextNodeServer.clientComponentLoading", a10.getLayoutOrPageModule = "NextNodeServer.getLayoutOrPageModule", a10.generateStaticRoutes = "NextNodeServer.generateStaticRoutes", a10.generateFsStaticRoutes = "NextNodeServer.generateFsStaticRoutes", a10.generatePublicRoutes = "NextNodeServer.generatePublicRoutes", a10.generateImageRoutes = "NextNodeServer.generateImageRoutes.route", a10.sendRenderResult = "NextNodeServer.sendRenderResult", a10.proxyRequest = "NextNodeServer.proxyRequest", a10.runApi = "NextNodeServer.runApi", a10.render = "NextNodeServer.render", a10.renderHTML = "NextNodeServer.renderHTML", a10.imageOptimizer = "NextNodeServer.imageOptimizer", a10.getPagePath = "NextNodeServer.getPagePath", a10.getRoutesManifest = "NextNodeServer.getRoutesManifest", a10.findPageComponents = "NextNodeServer.findPageComponents", a10.getFontManifest = "NextNodeServer.getFontManifest", a10.getServerComponentManifest = "NextNodeServer.getServerComponentManifest", a10.getRequestHandler = "NextNodeServer.getRequestHandler", a10.renderToHTML = "NextNodeServer.renderToHTML", a10.renderError = "NextNodeServer.renderError", a10.renderErrorToHTML = "NextNodeServer.renderErrorToHTML", a10.render404 = "NextNodeServer.render404", a10.startResponse = "NextNodeServer.startResponse", a10.route = "route", a10.onProxyReq = "onProxyReq", a10.apiResolver = "apiResolver", a10.internalFetch = "internalFetch", a10;
      }(ak || {}), al = function(a10) {
        return a10.startServer = "startServer.startServer", a10;
      }(al || {}), am = function(a10) {
        return a10.getServerSideProps = "Render.getServerSideProps", a10.getStaticProps = "Render.getStaticProps", a10.renderToString = "Render.renderToString", a10.renderDocument = "Render.renderDocument", a10.createBodyResult = "Render.createBodyResult", a10;
      }(am || {}), an = function(a10) {
        return a10.renderToString = "AppRender.renderToString", a10.renderToReadableStream = "AppRender.renderToReadableStream", a10.getBodyResult = "AppRender.getBodyResult", a10.fetch = "AppRender.fetch", a10;
      }(an || {}), ao = function(a10) {
        return a10.executeRoute = "Router.executeRoute", a10;
      }(ao || {}), ap = function(a10) {
        return a10.runHandler = "Node.runHandler", a10;
      }(ap || {}), aq = function(a10) {
        return a10.runHandler = "AppRouteRouteHandlers.runHandler", a10;
      }(aq || {}), ar = function(a10) {
        return a10.generateMetadata = "ResolveMetadata.generateMetadata", a10.generateViewport = "ResolveMetadata.generateViewport", a10;
      }(ar || {}), as = function(a10) {
        return a10.execute = "Middleware.execute", a10;
      }(as || {});
      let at = ["Middleware.execute", "BaseServer.handleRequest", "Render.getServerSideProps", "Render.getStaticProps", "AppRender.fetch", "AppRender.getBodyResult", "Render.renderDocument", "Node.runHandler", "AppRouteRouteHandlers.runHandler", "ResolveMetadata.generateMetadata", "ResolveMetadata.generateViewport", "NextNodeServer.createComponentTree", "NextNodeServer.findPageComponents", "NextNodeServer.getLayoutOrPageModule", "NextNodeServer.startResponse", "NextNodeServer.clientComponentLoading"], au = ["NextNodeServer.findPageComponents", "NextNodeServer.createComponentTree", "NextNodeServer.clientComponentLoading"];
      function av(a10) {
        return null !== a10 && "object" == typeof a10 && "then" in a10 && "function" == typeof a10.then;
      }
      let { context: aw, propagation: ax, trace: ay, SpanStatusCode: az, SpanKind: aA, ROOT_CONTEXT: aB } = d = c(329);
      class aC extends Error {
        constructor(a10, b2) {
          super(), this.bubble = a10, this.result = b2;
        }
      }
      let aD = (a10, b2) => {
        (function(a11) {
          return "object" == typeof a11 && null !== a11 && a11 instanceof aC;
        })(b2) && b2.bubble ? a10.setAttribute("next.bubble", true) : (b2 && (a10.recordException(b2), a10.setAttribute("error.type", b2.name)), a10.setStatus({ code: az.ERROR, message: null == b2 ? void 0 : b2.message })), a10.end();
      }, aE = /* @__PURE__ */ new Map(), aF = d.createContextKey("next.rootSpanId"), aG = 0, aH = { set(a10, b2, c2) {
        a10.push({ key: b2, value: c2 });
      } };
      class aI {
        getTracerInstance() {
          return ay.getTracer("next.js", "0.0.1");
        }
        getContext() {
          return aw;
        }
        getTracePropagationData() {
          let a10 = aw.active(), b2 = [];
          return ax.inject(a10, b2, aH), b2;
        }
        getActiveScopeSpan() {
          return ay.getSpan(null == aw ? void 0 : aw.active());
        }
        withPropagatedContext(a10, b2, c2) {
          let d2 = aw.active();
          if (ay.getSpanContext(d2)) return b2();
          let e2 = ax.extract(d2, a10, c2);
          return aw.with(e2, b2);
        }
        trace(...a10) {
          var b2;
          let [c2, d2, e2] = a10, { fn: f2, options: g2 } = "function" == typeof d2 ? { fn: d2, options: {} } : { fn: e2, options: { ...d2 } }, h2 = g2.spanName ?? c2;
          if (!at.includes(c2) && "1" !== process.env.NEXT_OTEL_VERBOSE || g2.hideSpan) return f2();
          let i2 = this.getSpanContext((null == g2 ? void 0 : g2.parentSpan) ?? this.getActiveScopeSpan()), j2 = false;
          i2 ? (null == (b2 = ay.getSpanContext(i2)) ? void 0 : b2.isRemote) && (j2 = true) : (i2 = (null == aw ? void 0 : aw.active()) ?? aB, j2 = true);
          let k2 = aG++;
          return g2.attributes = { "next.span_name": h2, "next.span_type": c2, ...g2.attributes }, aw.with(i2.setValue(aF, k2), () => this.getTracerInstance().startActiveSpan(h2, g2, (a11) => {
            let b3 = "performance" in globalThis && "measure" in performance ? globalThis.performance.now() : void 0, d3 = () => {
              aE.delete(k2), b3 && process.env.NEXT_OTEL_PERFORMANCE_PREFIX && au.includes(c2 || "") && performance.measure(`${process.env.NEXT_OTEL_PERFORMANCE_PREFIX}:next-${(c2.split(".").pop() || "").replace(/[A-Z]/g, (a12) => "-" + a12.toLowerCase())}`, { start: b3, end: performance.now() });
            };
            j2 && aE.set(k2, new Map(Object.entries(g2.attributes ?? {})));
            try {
              if (f2.length > 1) return f2(a11, (b5) => aD(a11, b5));
              let b4 = f2(a11);
              if (av(b4)) return b4.then((b5) => (a11.end(), b5)).catch((b5) => {
                throw aD(a11, b5), b5;
              }).finally(d3);
              return a11.end(), d3(), b4;
            } catch (b4) {
              throw aD(a11, b4), d3(), b4;
            }
          }));
        }
        wrap(...a10) {
          let b2 = this, [c2, d2, e2] = 3 === a10.length ? a10 : [a10[0], {}, a10[1]];
          return at.includes(c2) || "1" === process.env.NEXT_OTEL_VERBOSE ? function() {
            let a11 = d2;
            "function" == typeof a11 && "function" == typeof e2 && (a11 = a11.apply(this, arguments));
            let f2 = arguments.length - 1, g2 = arguments[f2];
            if ("function" != typeof g2) return b2.trace(c2, a11, () => e2.apply(this, arguments));
            {
              let d3 = b2.getContext().bind(aw.active(), g2);
              return b2.trace(c2, a11, (a12, b3) => (arguments[f2] = function(a13) {
                return null == b3 || b3(a13), d3.apply(this, arguments);
              }, e2.apply(this, arguments)));
            }
          } : e2;
        }
        startSpan(...a10) {
          let [b2, c2] = a10, d2 = this.getSpanContext((null == c2 ? void 0 : c2.parentSpan) ?? this.getActiveScopeSpan());
          return this.getTracerInstance().startSpan(b2, c2, d2);
        }
        getSpanContext(a10) {
          return a10 ? ay.setSpan(aw.active(), a10) : void 0;
        }
        getRootSpanAttributes() {
          let a10 = aw.active().getValue(aF);
          return aE.get(a10);
        }
        setRootSpanAttribute(a10, b2) {
          let c2 = aw.active().getValue(aF), d2 = aE.get(c2);
          d2 && d2.set(a10, b2);
        }
      }
      let aJ = (() => {
        let a10 = new aI();
        return () => a10;
      })(), aK = "__prerender_bypass";
      Symbol("__next_preview_data"), Symbol(aK);
      class aL {
        constructor(a10, b2, c2, d2) {
          var e2;
          let f2 = a10 && function(a11, b3) {
            let c3 = Y.from(a11.headers);
            return { isOnDemandRevalidate: c3.get("x-prerender-revalidate") === b3.previewModeId, revalidateOnlyGenerated: c3.has("x-prerender-revalidate-if-generated") };
          }(b2, a10).isOnDemandRevalidate, g2 = null == (e2 = c2.get(aK)) ? void 0 : e2.value;
          this._isEnabled = !!(!f2 && g2 && a10 && g2 === a10.previewModeId), this._previewModeId = null == a10 ? void 0 : a10.previewModeId, this._mutableCookies = d2;
        }
        get isEnabled() {
          return this._isEnabled;
        }
        enable() {
          if (!this._previewModeId) throw Object.defineProperty(Error("Invariant: previewProps missing previewModeId this should never happen"), "__NEXT_ERROR_CODE", { value: "E93", enumerable: false, configurable: true });
          this._mutableCookies.set({ name: aK, value: this._previewModeId, httpOnly: true, sameSite: "none", secure: true, path: "/" }), this._isEnabled = true;
        }
        disable() {
          this._mutableCookies.set({ name: aK, value: "", httpOnly: true, sameSite: "none", secure: true, path: "/", expires: /* @__PURE__ */ new Date(0) }), this._isEnabled = false;
        }
      }
      function aM(a10, b2) {
        if ("x-middleware-set-cookie" in a10.headers && "string" == typeof a10.headers["x-middleware-set-cookie"]) {
          let c2 = a10.headers["x-middleware-set-cookie"], d2 = new Headers();
          for (let a11 of s(c2)) d2.append("set-cookie", a11);
          for (let a11 of new L.ResponseCookies(d2).getAll()) b2.set(a11);
        }
      }
      let aN = aa();
      var aO = c(221), aP = c.n(aO);
      class aQ extends Error {
        constructor(a10, b2) {
          super("Invariant: " + (a10.endsWith(".") ? a10 : a10 + ".") + " This is a bug in Next.js.", b2), this.name = "InvariantError";
        }
      }
      class aR {
        constructor(a10, b2, c2) {
          this.prev = null, this.next = null, this.key = a10, this.data = b2, this.size = c2;
        }
      }
      class aS {
        constructor() {
          this.prev = null, this.next = null;
        }
      }
      class aT {
        constructor(a10, b2) {
          this.cache = /* @__PURE__ */ new Map(), this.totalSize = 0, this.maxSize = a10, this.calculateSize = b2, this.head = new aS(), this.tail = new aS(), this.head.next = this.tail, this.tail.prev = this.head;
        }
        addToHead(a10) {
          a10.prev = this.head, a10.next = this.head.next, this.head.next.prev = a10, this.head.next = a10;
        }
        removeNode(a10) {
          a10.prev.next = a10.next, a10.next.prev = a10.prev;
        }
        moveToHead(a10) {
          this.removeNode(a10), this.addToHead(a10);
        }
        removeTail() {
          let a10 = this.tail.prev;
          return this.removeNode(a10), a10;
        }
        set(a10, b2) {
          let c2 = (null == this.calculateSize ? void 0 : this.calculateSize.call(this, b2)) ?? 1;
          if (c2 > this.maxSize) return void console.warn("Single item size exceeds maxSize");
          let d2 = this.cache.get(a10);
          if (d2) d2.data = b2, this.totalSize = this.totalSize - d2.size + c2, d2.size = c2, this.moveToHead(d2);
          else {
            let d3 = new aR(a10, b2, c2);
            this.cache.set(a10, d3), this.addToHead(d3), this.totalSize += c2;
          }
          for (; this.totalSize > this.maxSize && this.cache.size > 0; ) {
            let a11 = this.removeTail();
            this.cache.delete(a11.key), this.totalSize -= a11.size;
          }
        }
        has(a10) {
          return this.cache.has(a10);
        }
        get(a10) {
          let b2 = this.cache.get(a10);
          if (b2) return this.moveToHead(b2), b2.data;
        }
        *[Symbol.iterator]() {
          let a10 = this.head.next;
          for (; a10 && a10 !== this.tail; ) {
            let b2 = a10;
            yield [b2.key, b2.data], a10 = a10.next;
          }
        }
        remove(a10) {
          let b2 = this.cache.get(a10);
          b2 && (this.removeNode(b2), this.cache.delete(a10), this.totalSize -= b2.size);
        }
        get size() {
          return this.cache.size;
        }
        get currentSize() {
          return this.totalSize;
        }
      }
      c(356).Buffer, new aT(52428800, (a10) => a10.size), process.env.NEXT_PRIVATE_DEBUG_CACHE && console.debug.bind(console, "DefaultCacheHandler:"), process.env.NEXT_PRIVATE_DEBUG_CACHE && ((a10, ...b2) => {
        console.log(`use-cache: ${a10}`, ...b2);
      }), Symbol.for("@next/cache-handlers");
      let aU = Symbol.for("@next/cache-handlers-map"), aV = Symbol.for("@next/cache-handlers-set"), aW = globalThis;
      function aX() {
        if (aW[aU]) return aW[aU].entries();
      }
      async function aY(a10, b2) {
        if (!a10) return b2();
        let c2 = aZ(a10);
        try {
          return await b2();
        } finally {
          let b3 = function(a11, b4) {
            let c3 = new Set(a11.pendingRevalidatedTags), d2 = new Set(a11.pendingRevalidateWrites);
            return { pendingRevalidatedTags: b4.pendingRevalidatedTags.filter((a12) => !c3.has(a12)), pendingRevalidates: Object.fromEntries(Object.entries(b4.pendingRevalidates).filter(([b5]) => !(b5 in a11.pendingRevalidates))), pendingRevalidateWrites: b4.pendingRevalidateWrites.filter((a12) => !d2.has(a12)) };
          }(c2, aZ(a10));
          await a_(a10, b3);
        }
      }
      function aZ(a10) {
        return { pendingRevalidatedTags: a10.pendingRevalidatedTags ? [...a10.pendingRevalidatedTags] : [], pendingRevalidates: { ...a10.pendingRevalidates }, pendingRevalidateWrites: a10.pendingRevalidateWrites ? [...a10.pendingRevalidateWrites] : [] };
      }
      async function a$(a10, b2) {
        if (0 === a10.length) return;
        let c2 = [];
        b2 && c2.push(b2.revalidateTag(a10));
        let d2 = function() {
          if (aW[aV]) return aW[aV].values();
        }();
        if (d2) for (let b3 of d2) c2.push(b3.expireTags(...a10));
        await Promise.all(c2);
      }
      async function a_(a10, b2) {
        let c2 = (null == b2 ? void 0 : b2.pendingRevalidatedTags) ?? a10.pendingRevalidatedTags ?? [], d2 = (null == b2 ? void 0 : b2.pendingRevalidates) ?? a10.pendingRevalidates ?? {}, e2 = (null == b2 ? void 0 : b2.pendingRevalidateWrites) ?? a10.pendingRevalidateWrites ?? [];
        return Promise.all([a$(c2, a10.incrementalCache), ...Object.values(d2), ...e2]);
      }
      let a0 = Object.defineProperty(Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available"), "__NEXT_ERROR_CODE", { value: "E504", enumerable: false, configurable: true });
      class a1 {
        disable() {
          throw a0;
        }
        getStore() {
        }
        run() {
          throw a0;
        }
        exit() {
          throw a0;
        }
        enterWith() {
          throw a0;
        }
        static bind(a10) {
          return a10;
        }
      }
      let a2 = "undefined" != typeof globalThis && globalThis.AsyncLocalStorage, a3 = a2 ? new a2() : new a1();
      class a4 {
        constructor({ waitUntil: a10, onClose: b2, onTaskError: c2 }) {
          this.workUnitStores = /* @__PURE__ */ new Set(), this.waitUntil = a10, this.onClose = b2, this.onTaskError = c2, this.callbackQueue = new (aP())(), this.callbackQueue.pause();
        }
        after(a10) {
          if (av(a10)) this.waitUntil || a5(), this.waitUntil(a10.catch((a11) => this.reportTaskError("promise", a11)));
          else if ("function" == typeof a10) this.addCallback(a10);
          else throw Object.defineProperty(Error("`after()`: Argument must be a promise or a function"), "__NEXT_ERROR_CODE", { value: "E50", enumerable: false, configurable: true });
        }
        addCallback(a10) {
          var b2;
          this.waitUntil || a5();
          let c2 = aN.getStore();
          c2 && this.workUnitStores.add(c2);
          let d2 = a3.getStore(), e2 = d2 ? d2.rootTaskSpawnPhase : null == c2 ? void 0 : c2.phase;
          this.runCallbacksOnClosePromise || (this.runCallbacksOnClosePromise = this.runCallbacksOnClose(), this.waitUntil(this.runCallbacksOnClosePromise));
          let f2 = (b2 = async () => {
            try {
              await a3.run({ rootTaskSpawnPhase: e2 }, () => a10());
            } catch (a11) {
              this.reportTaskError("function", a11);
            }
          }, a2 ? a2.bind(b2) : a1.bind(b2));
          this.callbackQueue.add(f2);
        }
        async runCallbacksOnClose() {
          return await new Promise((a10) => this.onClose(a10)), this.runCallbacks();
        }
        async runCallbacks() {
          if (0 === this.callbackQueue.size) return;
          for (let a11 of this.workUnitStores) a11.phase = "after";
          let a10 = ab.getStore();
          if (!a10) throw Object.defineProperty(new aQ("Missing workStore in AfterContext.runCallbacks"), "__NEXT_ERROR_CODE", { value: "E547", enumerable: false, configurable: true });
          return aY(a10, () => (this.callbackQueue.start(), this.callbackQueue.onIdle()));
        }
        reportTaskError(a10, b2) {
          if (console.error("promise" === a10 ? "A promise passed to `after()` rejected:" : "An error occurred in a function passed to `after()`:", b2), this.onTaskError) try {
            null == this.onTaskError || this.onTaskError.call(this, b2);
          } catch (a11) {
            console.error(Object.defineProperty(new aQ("`onTaskError` threw while handling an error thrown from an `after` task", { cause: a11 }), "__NEXT_ERROR_CODE", { value: "E569", enumerable: false, configurable: true }));
          }
        }
      }
      function a5() {
        throw Object.defineProperty(Error("`after()` will not work correctly, because `waitUntil` is not available in the current environment."), "__NEXT_ERROR_CODE", { value: "E91", enumerable: false, configurable: true });
      }
      function a6(a10) {
        let b2, c2 = { then: (d2, e2) => (b2 || (b2 = a10()), b2.then((a11) => {
          c2.value = a11;
        }).catch(() => {
        }), b2.then(d2, e2)) };
        return c2;
      }
      class a7 {
        onClose(a10) {
          if (this.isClosed) throw Object.defineProperty(Error("Cannot subscribe to a closed CloseController"), "__NEXT_ERROR_CODE", { value: "E365", enumerable: false, configurable: true });
          this.target.addEventListener("close", a10), this.listeners++;
        }
        dispatchClose() {
          if (this.isClosed) throw Object.defineProperty(Error("Cannot close a CloseController multiple times"), "__NEXT_ERROR_CODE", { value: "E229", enumerable: false, configurable: true });
          this.listeners > 0 && this.target.dispatchEvent(new Event("close")), this.isClosed = true;
        }
        constructor() {
          this.target = new EventTarget(), this.listeners = 0, this.isClosed = false;
        }
      }
      function a8() {
        return { previewModeId: process.env.__NEXT_PREVIEW_MODE_ID || "", previewModeSigningKey: process.env.__NEXT_PREVIEW_MODE_SIGNING_KEY || "", previewModeEncryptionKey: process.env.__NEXT_PREVIEW_MODE_ENCRYPTION_KEY || "" };
      }
      let a9 = Symbol.for("@next/request-context");
      async function ba(a10, b2, c2) {
        let d2 = [], e2 = c2 && c2.size > 0;
        for (let b3 of ((a11) => {
          let b4 = ["/layout"];
          if (a11.startsWith("/")) {
            let c3 = a11.split("/");
            for (let a12 = 1; a12 < c3.length + 1; a12++) {
              let d3 = c3.slice(0, a12).join("/");
              d3 && (d3.endsWith("/page") || d3.endsWith("/route") || (d3 = `${d3}${!d3.endsWith("/") ? "/" : ""}layout`), b4.push(d3));
            }
          }
          return b4;
        })(a10)) b3 = `${q}${b3}`, d2.push(b3);
        if (b2.pathname && !e2) {
          let a11 = `${q}${b2.pathname}`;
          d2.push(a11);
        }
        return { tags: d2, expirationsByCacheKind: function(a11) {
          let b3 = /* @__PURE__ */ new Map(), c3 = aX();
          if (c3) for (let [d3, e3] of c3) "getExpiration" in e3 && b3.set(d3, a6(async () => e3.getExpiration(...a11)));
          return b3;
        }(d2) };
      }
      class bb extends N {
        constructor(a10) {
          super(a10.input, a10.init), this.sourcePage = a10.page;
        }
        get request() {
          throw Object.defineProperty(new n({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
        respondWith() {
          throw Object.defineProperty(new n({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
        waitUntil() {
          throw Object.defineProperty(new n({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
      }
      let bc = { keys: (a10) => Array.from(a10.keys()), get: (a10, b2) => a10.get(b2) ?? void 0 }, bd = (a10, b2) => aJ().withPropagatedContext(a10.headers, b2, bc), be = false;
      async function bf(a10) {
        var b2;
        let d2, e2;
        if (!be && (be = true, "true" === process.env.NEXT_PRIVATE_TEST_PROXY)) {
          let { interceptTestApis: a11, wrapRequestHandler: b3 } = c(136);
          a11(), bd = b3(bd);
        }
        await l();
        let f2 = void 0 !== globalThis.__BUILD_MANIFEST;
        a10.request.url = a10.request.url.replace(/\.rsc($|\?)/, "$1");
        let g2 = a10.bypassNextUrl ? new URL(a10.request.url) : new K(a10.request.url, { headers: a10.request.headers, nextConfig: a10.request.nextConfig });
        for (let a11 of [...g2.searchParams.keys()]) {
          let b3 = g2.searchParams.getAll(a11), c2 = function(a12) {
            for (let b4 of ["nxtP", "nxtI"]) if (a12 !== b4 && a12.startsWith(b4)) return a12.substring(b4.length);
            return null;
          }(a11);
          if (c2) {
            for (let a12 of (g2.searchParams.delete(c2), b3)) g2.searchParams.append(c2, a12);
            g2.searchParams.delete(a11);
          }
        }
        let h2 = process.env.__NEXT_BUILD_ID || "";
        "buildId" in g2 && (h2 = g2.buildId || "", g2.buildId = "");
        let i2 = function(a11) {
          let b3 = new Headers();
          for (let [c2, d3] of Object.entries(a11)) for (let a12 of Array.isArray(d3) ? d3 : [d3]) void 0 !== a12 && ("number" == typeof a12 && (a12 = a12.toString()), b3.append(c2, a12));
          return b3;
        }(a10.request.headers), j2 = i2.has("x-nextjs-data"), k2 = "1" === i2.get("rsc");
        j2 && "/index" === g2.pathname && (g2.pathname = "/");
        let m2 = /* @__PURE__ */ new Map();
        if (!f2) for (let a11 of V) {
          let b3 = i2.get(a11);
          null !== b3 && (m2.set(a11, b3), i2.delete(a11));
        }
        let n2 = g2.searchParams.get(W), o2 = new bb({ page: a10.page, input: function(a11) {
          let b3 = "string" == typeof a11, c2 = b3 ? new URL(a11) : a11;
          return c2.searchParams.delete(W), b3 ? c2.toString() : c2;
        }(g2).toString(), init: { body: a10.request.body, headers: i2, method: a10.request.method, nextConfig: a10.request.nextConfig, signal: a10.request.signal } });
        j2 && Object.defineProperty(o2, "__isData", { enumerable: false, value: true }), !globalThis.__incrementalCacheShared && a10.IncrementalCache && (globalThis.__incrementalCache = new a10.IncrementalCache({ CurCacheHandler: a10.incrementalCacheHandler, minimalMode: true, fetchCacheKeyPrefix: "", dev: false, requestHeaders: a10.request.headers, getPrerenderManifest: () => ({ version: -1, routes: {}, dynamicRoutes: {}, notFoundRoutes: [], preview: a8() }) }));
        let p2 = a10.request.waitUntil ?? (null == (b2 = function() {
          let a11 = globalThis[a9];
          return null == a11 ? void 0 : a11.get();
        }()) ? void 0 : b2.waitUntil), q2 = new z({ request: o2, page: a10.page, context: p2 ? { waitUntil: p2 } : void 0 });
        if ((d2 = await bd(o2, () => {
          if ("/middleware" === a10.page || "/src/middleware" === a10.page) {
            let b3 = q2.waitUntil.bind(q2), c2 = new a7();
            return aJ().trace(as.execute, { spanName: `middleware ${o2.method} ${o2.nextUrl.pathname}`, attributes: { "http.target": o2.nextUrl.pathname, "http.method": o2.method } }, async () => {
              try {
                var d3, f3, g3, i3, j3, k3;
                let l2 = a8(), m3 = await ba("/", o2.nextUrl, null), n3 = (j3 = o2.nextUrl, k3 = (a11) => {
                  e2 = a11;
                }, function(a11, b4, c3, d4, e3, f4, g4, h3, i4, j4, k4, l3) {
                  function m4(a12) {
                    c3 && c3.setHeader("Set-Cookie", a12);
                  }
                  let n4 = {};
                  return { type: "request", phase: a11, implicitTags: f4, url: { pathname: d4.pathname, search: d4.search ?? "" }, rootParams: e3, get headers() {
                    return n4.headers || (n4.headers = function(a12) {
                      let b5 = Y.from(a12);
                      for (let a13 of V) b5.delete(a13);
                      return Y.seal(b5);
                    }(b4.headers)), n4.headers;
                  }, get cookies() {
                    if (!n4.cookies) {
                      let a12 = new L.RequestCookies(Y.from(b4.headers));
                      aM(b4, a12), n4.cookies = ad.seal(a12);
                    }
                    return n4.cookies;
                  }, set cookies(value) {
                    n4.cookies = value;
                  }, get mutableCookies() {
                    if (!n4.mutableCookies) {
                      let a12 = function(a13, b5) {
                        let c4 = new L.RequestCookies(Y.from(a13));
                        return af.wrap(c4, b5);
                      }(b4.headers, g4 || (c3 ? m4 : void 0));
                      aM(b4, a12), n4.mutableCookies = a12;
                    }
                    return n4.mutableCookies;
                  }, get userspaceMutableCookies() {
                    return n4.userspaceMutableCookies || (n4.userspaceMutableCookies = function(a12) {
                      let b5 = new Proxy(a12.mutableCookies, { get(c4, d5, e4) {
                        switch (d5) {
                          case "delete":
                            return function(...d6) {
                              return ag(a12, "cookies().delete"), c4.delete(...d6), b5;
                            };
                          case "set":
                            return function(...d6) {
                              return ag(a12, "cookies().set"), c4.set(...d6), b5;
                            };
                          default:
                            return O.get(c4, d5, e4);
                        }
                      } });
                      return b5;
                    }(this)), n4.userspaceMutableCookies;
                  }, get draftMode() {
                    return n4.draftMode || (n4.draftMode = new aL(i4, b4, this.cookies, this.mutableCookies)), n4.draftMode;
                  }, renderResumeDataCache: h3 ?? null, isHmrRefresh: j4, serverComponentsHmrCache: k4 || globalThis.__serverComponentsHmrCache, devFallbackParams: null };
                }("action", o2, void 0, j3, {}, m3, k3, void 0, l2, false, void 0, null)), p3 = function({ page: a11, renderOpts: b4, isPrefetchRequest: c3, buildId: d4, previouslyRevalidatedTags: e3 }) {
                  var f4;
                  let g4 = !b4.shouldWaitOnAllReady && !b4.supportsDynamicResponse && !b4.isDraftMode && !b4.isPossibleServerAction, h3 = b4.dev ?? false, i4 = h3 || g4 && (!!process.env.NEXT_DEBUG_BUILD || "1" === process.env.NEXT_SSG_FETCH_METRICS), j4 = { isStaticGeneration: g4, page: a11, route: (f4 = a11.split("/").reduce((a12, b5, c4, d5) => b5 ? "(" === b5[0] && b5.endsWith(")") || "@" === b5[0] || ("page" === b5 || "route" === b5) && c4 === d5.length - 1 ? a12 : a12 + "/" + b5 : a12, "")).startsWith("/") ? f4 : "/" + f4, incrementalCache: b4.incrementalCache || globalThis.__incrementalCache, cacheLifeProfiles: b4.cacheLifeProfiles, isRevalidate: b4.isRevalidate, isBuildTimePrerendering: b4.nextExport, hasReadableErrorStacks: b4.hasReadableErrorStacks, fetchCache: b4.fetchCache, isOnDemandRevalidate: b4.isOnDemandRevalidate, isDraftMode: b4.isDraftMode, isPrefetchRequest: c3, buildId: d4, reactLoadableManifest: (null == b4 ? void 0 : b4.reactLoadableManifest) || {}, assetPrefix: (null == b4 ? void 0 : b4.assetPrefix) || "", afterContext: function(a12) {
                    let { waitUntil: b5, onClose: c4, onAfterTaskError: d5 } = a12;
                    return new a4({ waitUntil: b5, onClose: c4, onTaskError: d5 });
                  }(b4), cacheComponentsEnabled: b4.experimental.cacheComponents, dev: h3, previouslyRevalidatedTags: e3, refreshTagsByCacheKind: function() {
                    let a12 = /* @__PURE__ */ new Map(), b5 = aX();
                    if (b5) for (let [c4, d5] of b5) "refreshTags" in d5 && a12.set(c4, a6(async () => d5.refreshTags()));
                    return a12;
                  }(), runInCleanSnapshot: a2 ? a2.snapshot() : function(a12, ...b5) {
                    return a12(...b5);
                  }, shouldTrackFetchMetrics: i4 };
                  return b4.store = j4, j4;
                }({ page: "/", renderOpts: { cacheLifeProfiles: null == (f3 = a10.request.nextConfig) || null == (d3 = f3.experimental) ? void 0 : d3.cacheLife, experimental: { isRoutePPREnabled: false, cacheComponents: false, authInterrupts: !!(null == (i3 = a10.request.nextConfig) || null == (g3 = i3.experimental) ? void 0 : g3.authInterrupts) }, supportsDynamicResponse: true, waitUntil: b3, onClose: c2.onClose.bind(c2), onAfterTaskError: void 0 }, isPrefetchRequest: "1" === o2.headers.get(U), buildId: h2 ?? "", previouslyRevalidatedTags: [] });
                return await ab.run(p3, () => aN.run(n3, a10.handler, o2, q2));
              } finally {
                setTimeout(() => {
                  c2.dispatchClose();
                }, 0);
              }
            });
          }
          return a10.handler(o2, q2);
        })) && !(d2 instanceof Response)) throw Object.defineProperty(TypeError("Expected an instance of Response to be returned"), "__NEXT_ERROR_CODE", { value: "E567", enumerable: false, configurable: true });
        d2 && e2 && d2.headers.set("set-cookie", e2);
        let r2 = null == d2 ? void 0 : d2.headers.get("x-middleware-rewrite");
        if (d2 && r2 && (k2 || !f2)) {
          let b3 = new K(r2, { forceLocale: true, headers: a10.request.headers, nextConfig: a10.request.nextConfig });
          f2 || b3.host !== o2.nextUrl.host || (b3.buildId = h2 || b3.buildId, d2.headers.set("x-middleware-rewrite", String(b3)));
          let { url: c2, isRelative: e3 } = T(b3.toString(), g2.toString());
          !f2 && j2 && d2.headers.set("x-nextjs-rewrite", c2), k2 && e3 && (g2.pathname !== b3.pathname && d2.headers.set("x-nextjs-rewritten-path", b3.pathname), g2.search !== b3.search && d2.headers.set("x-nextjs-rewritten-query", b3.search.slice(1)));
        }
        if (d2 && r2 && k2 && n2) {
          let a11 = new URL(r2);
          a11.searchParams.has(W) || (a11.searchParams.set(W, n2), d2.headers.set("x-middleware-rewrite", a11.toString()));
        }
        let s2 = null == d2 ? void 0 : d2.headers.get("Location");
        if (d2 && s2 && !f2) {
          let b3 = new K(s2, { forceLocale: false, headers: a10.request.headers, nextConfig: a10.request.nextConfig });
          d2 = new Response(d2.body, d2), b3.host === g2.host && (b3.buildId = h2 || b3.buildId, d2.headers.set("Location", b3.toString())), j2 && (d2.headers.delete("Location"), d2.headers.set("x-nextjs-redirect", T(b3.toString(), g2.toString()).url));
        }
        let t2 = d2 || S.next(), u2 = t2.headers.get("x-middleware-override-headers"), v2 = [];
        if (u2) {
          for (let [a11, b3] of m2) t2.headers.set(`x-middleware-request-${a11}`, b3), v2.push(a11);
          v2.length > 0 && t2.headers.set("x-middleware-override-headers", u2 + "," + v2.join(","));
        }
        return { response: t2, waitUntil: ("internal" === q2[x].kind ? Promise.all(q2[x].promises).then(() => {
        }) : void 0) ?? Promise.resolve(), fetchMetrics: o2.fetchMetrics };
      }
      var bg = c(519);
      c(17), "undefined" == typeof URLPattern || URLPattern;
      var bh = c(454);
      if (/* @__PURE__ */ new WeakMap(), bh.unstable_postpone, false === function(a10) {
        return a10.includes("needs to bail out of prerendering at this point because it used") && a10.includes("Learn more: https://nextjs.org/docs/messages/ppr-caught-error");
      }("Route %%% needs to bail out of prerendering at this point because it used ^^^. React throws this special object to indicate where. It should not be caught by your own try/catch. Learn more: https://nextjs.org/docs/messages/ppr-caught-error")) throw Object.defineProperty(Error("Invariant: isDynamicPostpone misidentified a postpone reason. This is a bug in Next.js"), "__NEXT_ERROR_CODE", { value: "E296", enumerable: false, configurable: true });
      RegExp(`\\n\\s+at Suspense \\(<anonymous>\\)(?:(?!\\n\\s+at (?:body|div|main|section|article|aside|header|footer|nav|form|p|span|h1|h2|h3|h4|h5|h6) \\(<anonymous>\\))[\\s\\S])*?\\n\\s+at __next_root_layout_boundary__ \\([^\\n]*\\)`), RegExp(`\\n\\s+at __next_metadata_boundary__[\\n\\s]`), RegExp(`\\n\\s+at __next_viewport_boundary__[\\n\\s]`), RegExp(`\\n\\s+at __next_outlet_boundary__[\\n\\s]`), aa();
      let { env: bi, stdout: bj } = (null == (e = globalThis) ? void 0 : e.process) ?? {}, bk = bi && !bi.NO_COLOR && (bi.FORCE_COLOR || (null == bj ? void 0 : bj.isTTY) && !bi.CI && "dumb" !== bi.TERM), bl = (a10, b2, c2, d2) => {
        let e2 = a10.substring(0, d2) + c2, f2 = a10.substring(d2 + b2.length), g2 = f2.indexOf(b2);
        return ~g2 ? e2 + bl(f2, b2, c2, g2) : e2 + f2;
      }, bm = (a10, b2, c2 = a10) => bk ? (d2) => {
        let e2 = "" + d2, f2 = e2.indexOf(b2, a10.length);
        return ~f2 ? a10 + bl(e2, b2, c2, f2) + b2 : a10 + e2 + b2;
      } : String, bn = bm("\x1B[1m", "\x1B[22m", "\x1B[22m\x1B[1m");
      bm("\x1B[2m", "\x1B[22m", "\x1B[22m\x1B[2m"), bm("\x1B[3m", "\x1B[23m"), bm("\x1B[4m", "\x1B[24m"), bm("\x1B[7m", "\x1B[27m"), bm("\x1B[8m", "\x1B[28m"), bm("\x1B[9m", "\x1B[29m"), bm("\x1B[30m", "\x1B[39m");
      let bo = bm("\x1B[31m", "\x1B[39m"), bp = bm("\x1B[32m", "\x1B[39m"), bq = bm("\x1B[33m", "\x1B[39m");
      bm("\x1B[34m", "\x1B[39m");
      let br = bm("\x1B[35m", "\x1B[39m");
      bm("\x1B[38;2;173;127;168m", "\x1B[39m"), bm("\x1B[36m", "\x1B[39m");
      let bs = bm("\x1B[37m", "\x1B[39m");
      async function bt(a10) {
        let b2 = S.next(), c2 = (0, bg.createMiddlewareClient)({ req: a10, res: b2 }), { data: { session: d2 }, error: e2 } = await c2.auth.getSession();
        if (e2 && console.error("Middleware session error:", e2), d2?.user ? console.log(`[Middleware] User authenticated: ${d2.user.email} (ID: ${d2.user.id})`) : console.log("[Middleware] No authenticated session"), ["/dashboard", "/profile", "/settings"].some((b3) => a10.nextUrl.pathname.startsWith(b3)) && !d2) {
          let b3 = new URL("/auth/login", a10.url);
          return b3.searchParams.set("returnTo", a10.nextUrl.pathname), S.redirect(b3);
        }
        return b2;
      }
      bm("\x1B[90m", "\x1B[39m"), bm("\x1B[40m", "\x1B[49m"), bm("\x1B[41m", "\x1B[49m"), bm("\x1B[42m", "\x1B[49m"), bm("\x1B[43m", "\x1B[49m"), bm("\x1B[44m", "\x1B[49m"), bm("\x1B[45m", "\x1B[49m"), bm("\x1B[46m", "\x1B[49m"), bm("\x1B[47m", "\x1B[49m"), bs(bn("\u25CB")), bo(bn("\u2A2F")), bq(bn("\u26A0")), bs(bn(" ")), bp(bn("\u2713")), br(bn("\xBB")), new aT(1e4, (a10) => a10.length), /* @__PURE__ */ new WeakMap();
      let bu = { matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"] };
      Object.values({ NOT_FOUND: 404, FORBIDDEN: 403, UNAUTHORIZED: 401 });
      let bv = { ...f }, bw = bv.middleware || bv.default, bx = "/src/middleware";
      if ("function" != typeof bw) throw Object.defineProperty(Error(`The Middleware "${bx}" must export a \`middleware\` or a \`default\` function`), "__NEXT_ERROR_CODE", { value: "E120", enumerable: false, configurable: true });
      function by(a10) {
        return bf({ ...a10, page: bx, handler: async (...a11) => {
          try {
            return await bw(...a11);
          } catch (e2) {
            let b2 = a11[0], c2 = new URL(b2.url), d2 = c2.pathname + c2.search;
            throw await j(e2, { path: d2, method: b2.method, headers: Object.fromEntries(b2.headers.entries()) }, { routerKind: "Pages Router", routePath: "/middleware", routeType: "middleware", revalidateReason: void 0 }), e2;
          }
        } });
      }
    }, 296: (a, b) => {
      "use strict";
      Symbol.for("react.transitional.element"), Symbol.for("react.portal"), Symbol.for("react.fragment"), Symbol.for("react.strict_mode"), Symbol.for("react.profiler"), Symbol.for("react.forward_ref"), Symbol.for("react.suspense"), Symbol.for("react.memo"), Symbol.for("react.lazy"), Symbol.iterator;
      Object.prototype.hasOwnProperty, Object.assign;
    }, 329: (a, b, c) => {
      (() => {
        "use strict";
        var b2 = { 491: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.ContextAPI = void 0;
          let d2 = c2(223), e2 = c2(172), f2 = c2(930), g = "context", h = new d2.NoopContextManager();
          class i {
            constructor() {
            }
            static getInstance() {
              return this._instance || (this._instance = new i()), this._instance;
            }
            setGlobalContextManager(a3) {
              return (0, e2.registerGlobal)(g, a3, f2.DiagAPI.instance());
            }
            active() {
              return this._getContextManager().active();
            }
            with(a3, b4, c3, ...d3) {
              return this._getContextManager().with(a3, b4, c3, ...d3);
            }
            bind(a3, b4) {
              return this._getContextManager().bind(a3, b4);
            }
            _getContextManager() {
              return (0, e2.getGlobal)(g) || h;
            }
            disable() {
              this._getContextManager().disable(), (0, e2.unregisterGlobal)(g, f2.DiagAPI.instance());
            }
          }
          b3.ContextAPI = i;
        }, 930: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.DiagAPI = void 0;
          let d2 = c2(56), e2 = c2(912), f2 = c2(957), g = c2(172);
          class h {
            constructor() {
              function a3(a4) {
                return function(...b5) {
                  let c3 = (0, g.getGlobal)("diag");
                  if (c3) return c3[a4](...b5);
                };
              }
              let b4 = this;
              b4.setLogger = (a4, c3 = { logLevel: f2.DiagLogLevel.INFO }) => {
                var d3, h2, i;
                if (a4 === b4) {
                  let a5 = Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
                  return b4.error(null != (d3 = a5.stack) ? d3 : a5.message), false;
                }
                "number" == typeof c3 && (c3 = { logLevel: c3 });
                let j = (0, g.getGlobal)("diag"), k = (0, e2.createLogLevelDiagLogger)(null != (h2 = c3.logLevel) ? h2 : f2.DiagLogLevel.INFO, a4);
                if (j && !c3.suppressOverrideMessage) {
                  let a5 = null != (i = Error().stack) ? i : "<failed to generate stacktrace>";
                  j.warn(`Current logger will be overwritten from ${a5}`), k.warn(`Current logger will overwrite one already registered from ${a5}`);
                }
                return (0, g.registerGlobal)("diag", k, b4, true);
              }, b4.disable = () => {
                (0, g.unregisterGlobal)("diag", b4);
              }, b4.createComponentLogger = (a4) => new d2.DiagComponentLogger(a4), b4.verbose = a3("verbose"), b4.debug = a3("debug"), b4.info = a3("info"), b4.warn = a3("warn"), b4.error = a3("error");
            }
            static instance() {
              return this._instance || (this._instance = new h()), this._instance;
            }
          }
          b3.DiagAPI = h;
        }, 653: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.MetricsAPI = void 0;
          let d2 = c2(660), e2 = c2(172), f2 = c2(930), g = "metrics";
          class h {
            constructor() {
            }
            static getInstance() {
              return this._instance || (this._instance = new h()), this._instance;
            }
            setGlobalMeterProvider(a3) {
              return (0, e2.registerGlobal)(g, a3, f2.DiagAPI.instance());
            }
            getMeterProvider() {
              return (0, e2.getGlobal)(g) || d2.NOOP_METER_PROVIDER;
            }
            getMeter(a3, b4, c3) {
              return this.getMeterProvider().getMeter(a3, b4, c3);
            }
            disable() {
              (0, e2.unregisterGlobal)(g, f2.DiagAPI.instance());
            }
          }
          b3.MetricsAPI = h;
        }, 181: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.PropagationAPI = void 0;
          let d2 = c2(172), e2 = c2(874), f2 = c2(194), g = c2(277), h = c2(369), i = c2(930), j = "propagation", k = new e2.NoopTextMapPropagator();
          class l {
            constructor() {
              this.createBaggage = h.createBaggage, this.getBaggage = g.getBaggage, this.getActiveBaggage = g.getActiveBaggage, this.setBaggage = g.setBaggage, this.deleteBaggage = g.deleteBaggage;
            }
            static getInstance() {
              return this._instance || (this._instance = new l()), this._instance;
            }
            setGlobalPropagator(a3) {
              return (0, d2.registerGlobal)(j, a3, i.DiagAPI.instance());
            }
            inject(a3, b4, c3 = f2.defaultTextMapSetter) {
              return this._getGlobalPropagator().inject(a3, b4, c3);
            }
            extract(a3, b4, c3 = f2.defaultTextMapGetter) {
              return this._getGlobalPropagator().extract(a3, b4, c3);
            }
            fields() {
              return this._getGlobalPropagator().fields();
            }
            disable() {
              (0, d2.unregisterGlobal)(j, i.DiagAPI.instance());
            }
            _getGlobalPropagator() {
              return (0, d2.getGlobal)(j) || k;
            }
          }
          b3.PropagationAPI = l;
        }, 997: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.TraceAPI = void 0;
          let d2 = c2(172), e2 = c2(846), f2 = c2(139), g = c2(607), h = c2(930), i = "trace";
          class j {
            constructor() {
              this._proxyTracerProvider = new e2.ProxyTracerProvider(), this.wrapSpanContext = f2.wrapSpanContext, this.isSpanContextValid = f2.isSpanContextValid, this.deleteSpan = g.deleteSpan, this.getSpan = g.getSpan, this.getActiveSpan = g.getActiveSpan, this.getSpanContext = g.getSpanContext, this.setSpan = g.setSpan, this.setSpanContext = g.setSpanContext;
            }
            static getInstance() {
              return this._instance || (this._instance = new j()), this._instance;
            }
            setGlobalTracerProvider(a3) {
              let b4 = (0, d2.registerGlobal)(i, this._proxyTracerProvider, h.DiagAPI.instance());
              return b4 && this._proxyTracerProvider.setDelegate(a3), b4;
            }
            getTracerProvider() {
              return (0, d2.getGlobal)(i) || this._proxyTracerProvider;
            }
            getTracer(a3, b4) {
              return this.getTracerProvider().getTracer(a3, b4);
            }
            disable() {
              (0, d2.unregisterGlobal)(i, h.DiagAPI.instance()), this._proxyTracerProvider = new e2.ProxyTracerProvider();
            }
          }
          b3.TraceAPI = j;
        }, 277: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.deleteBaggage = b3.setBaggage = b3.getActiveBaggage = b3.getBaggage = void 0;
          let d2 = c2(491), e2 = (0, c2(780).createContextKey)("OpenTelemetry Baggage Key");
          function f2(a3) {
            return a3.getValue(e2) || void 0;
          }
          b3.getBaggage = f2, b3.getActiveBaggage = function() {
            return f2(d2.ContextAPI.getInstance().active());
          }, b3.setBaggage = function(a3, b4) {
            return a3.setValue(e2, b4);
          }, b3.deleteBaggage = function(a3) {
            return a3.deleteValue(e2);
          };
        }, 993: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.BaggageImpl = void 0;
          class c2 {
            constructor(a3) {
              this._entries = a3 ? new Map(a3) : /* @__PURE__ */ new Map();
            }
            getEntry(a3) {
              let b4 = this._entries.get(a3);
              if (b4) return Object.assign({}, b4);
            }
            getAllEntries() {
              return Array.from(this._entries.entries()).map(([a3, b4]) => [a3, b4]);
            }
            setEntry(a3, b4) {
              let d2 = new c2(this._entries);
              return d2._entries.set(a3, b4), d2;
            }
            removeEntry(a3) {
              let b4 = new c2(this._entries);
              return b4._entries.delete(a3), b4;
            }
            removeEntries(...a3) {
              let b4 = new c2(this._entries);
              for (let c3 of a3) b4._entries.delete(c3);
              return b4;
            }
            clear() {
              return new c2();
            }
          }
          b3.BaggageImpl = c2;
        }, 830: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.baggageEntryMetadataSymbol = void 0, b3.baggageEntryMetadataSymbol = Symbol("BaggageEntryMetadata");
        }, 369: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.baggageEntryMetadataFromString = b3.createBaggage = void 0;
          let d2 = c2(930), e2 = c2(993), f2 = c2(830), g = d2.DiagAPI.instance();
          b3.createBaggage = function(a3 = {}) {
            return new e2.BaggageImpl(new Map(Object.entries(a3)));
          }, b3.baggageEntryMetadataFromString = function(a3) {
            return "string" != typeof a3 && (g.error(`Cannot create baggage metadata from unknown type: ${typeof a3}`), a3 = ""), { __TYPE__: f2.baggageEntryMetadataSymbol, toString: () => a3 };
          };
        }, 67: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.context = void 0, b3.context = c2(491).ContextAPI.getInstance();
        }, 223: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.NoopContextManager = void 0;
          let d2 = c2(780);
          class e2 {
            active() {
              return d2.ROOT_CONTEXT;
            }
            with(a3, b4, c3, ...d3) {
              return b4.call(c3, ...d3);
            }
            bind(a3, b4) {
              return b4;
            }
            enable() {
              return this;
            }
            disable() {
              return this;
            }
          }
          b3.NoopContextManager = e2;
        }, 780: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.ROOT_CONTEXT = b3.createContextKey = void 0, b3.createContextKey = function(a3) {
            return Symbol.for(a3);
          };
          class c2 {
            constructor(a3) {
              let b4 = this;
              b4._currentContext = a3 ? new Map(a3) : /* @__PURE__ */ new Map(), b4.getValue = (a4) => b4._currentContext.get(a4), b4.setValue = (a4, d2) => {
                let e2 = new c2(b4._currentContext);
                return e2._currentContext.set(a4, d2), e2;
              }, b4.deleteValue = (a4) => {
                let d2 = new c2(b4._currentContext);
                return d2._currentContext.delete(a4), d2;
              };
            }
          }
          b3.ROOT_CONTEXT = new c2();
        }, 506: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.diag = void 0, b3.diag = c2(930).DiagAPI.instance();
        }, 56: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.DiagComponentLogger = void 0;
          let d2 = c2(172);
          class e2 {
            constructor(a3) {
              this._namespace = a3.namespace || "DiagComponentLogger";
            }
            debug(...a3) {
              return f2("debug", this._namespace, a3);
            }
            error(...a3) {
              return f2("error", this._namespace, a3);
            }
            info(...a3) {
              return f2("info", this._namespace, a3);
            }
            warn(...a3) {
              return f2("warn", this._namespace, a3);
            }
            verbose(...a3) {
              return f2("verbose", this._namespace, a3);
            }
          }
          function f2(a3, b4, c3) {
            let e3 = (0, d2.getGlobal)("diag");
            if (e3) return c3.unshift(b4), e3[a3](...c3);
          }
          b3.DiagComponentLogger = e2;
        }, 972: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.DiagConsoleLogger = void 0;
          let c2 = [{ n: "error", c: "error" }, { n: "warn", c: "warn" }, { n: "info", c: "info" }, { n: "debug", c: "debug" }, { n: "verbose", c: "trace" }];
          class d2 {
            constructor() {
              for (let a3 = 0; a3 < c2.length; a3++) this[c2[a3].n] = /* @__PURE__ */ function(a4) {
                return function(...b4) {
                  if (console) {
                    let c3 = console[a4];
                    if ("function" != typeof c3 && (c3 = console.log), "function" == typeof c3) return c3.apply(console, b4);
                  }
                };
              }(c2[a3].c);
            }
          }
          b3.DiagConsoleLogger = d2;
        }, 912: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.createLogLevelDiagLogger = void 0;
          let d2 = c2(957);
          b3.createLogLevelDiagLogger = function(a3, b4) {
            function c3(c4, d3) {
              let e2 = b4[c4];
              return "function" == typeof e2 && a3 >= d3 ? e2.bind(b4) : function() {
              };
            }
            return a3 < d2.DiagLogLevel.NONE ? a3 = d2.DiagLogLevel.NONE : a3 > d2.DiagLogLevel.ALL && (a3 = d2.DiagLogLevel.ALL), b4 = b4 || {}, { error: c3("error", d2.DiagLogLevel.ERROR), warn: c3("warn", d2.DiagLogLevel.WARN), info: c3("info", d2.DiagLogLevel.INFO), debug: c3("debug", d2.DiagLogLevel.DEBUG), verbose: c3("verbose", d2.DiagLogLevel.VERBOSE) };
          };
        }, 957: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.DiagLogLevel = void 0, function(a3) {
            a3[a3.NONE = 0] = "NONE", a3[a3.ERROR = 30] = "ERROR", a3[a3.WARN = 50] = "WARN", a3[a3.INFO = 60] = "INFO", a3[a3.DEBUG = 70] = "DEBUG", a3[a3.VERBOSE = 80] = "VERBOSE", a3[a3.ALL = 9999] = "ALL";
          }(b3.DiagLogLevel || (b3.DiagLogLevel = {}));
        }, 172: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.unregisterGlobal = b3.getGlobal = b3.registerGlobal = void 0;
          let d2 = c2(200), e2 = c2(521), f2 = c2(130), g = e2.VERSION.split(".")[0], h = Symbol.for(`opentelemetry.js.api.${g}`), i = d2._globalThis;
          b3.registerGlobal = function(a3, b4, c3, d3 = false) {
            var f3;
            let g2 = i[h] = null != (f3 = i[h]) ? f3 : { version: e2.VERSION };
            if (!d3 && g2[a3]) {
              let b5 = Error(`@opentelemetry/api: Attempted duplicate registration of API: ${a3}`);
              return c3.error(b5.stack || b5.message), false;
            }
            if (g2.version !== e2.VERSION) {
              let b5 = Error(`@opentelemetry/api: Registration of version v${g2.version} for ${a3} does not match previously registered API v${e2.VERSION}`);
              return c3.error(b5.stack || b5.message), false;
            }
            return g2[a3] = b4, c3.debug(`@opentelemetry/api: Registered a global for ${a3} v${e2.VERSION}.`), true;
          }, b3.getGlobal = function(a3) {
            var b4, c3;
            let d3 = null == (b4 = i[h]) ? void 0 : b4.version;
            if (d3 && (0, f2.isCompatible)(d3)) return null == (c3 = i[h]) ? void 0 : c3[a3];
          }, b3.unregisterGlobal = function(a3, b4) {
            b4.debug(`@opentelemetry/api: Unregistering a global for ${a3} v${e2.VERSION}.`);
            let c3 = i[h];
            c3 && delete c3[a3];
          };
        }, 130: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.isCompatible = b3._makeCompatibilityCheck = void 0;
          let d2 = c2(521), e2 = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
          function f2(a3) {
            let b4 = /* @__PURE__ */ new Set([a3]), c3 = /* @__PURE__ */ new Set(), d3 = a3.match(e2);
            if (!d3) return () => false;
            let f3 = { major: +d3[1], minor: +d3[2], patch: +d3[3], prerelease: d3[4] };
            if (null != f3.prerelease) return function(b5) {
              return b5 === a3;
            };
            function g(a4) {
              return c3.add(a4), false;
            }
            return function(a4) {
              if (b4.has(a4)) return true;
              if (c3.has(a4)) return false;
              let d4 = a4.match(e2);
              if (!d4) return g(a4);
              let h = { major: +d4[1], minor: +d4[2], patch: +d4[3], prerelease: d4[4] };
              if (null != h.prerelease || f3.major !== h.major) return g(a4);
              if (0 === f3.major) return f3.minor === h.minor && f3.patch <= h.patch ? (b4.add(a4), true) : g(a4);
              return f3.minor <= h.minor ? (b4.add(a4), true) : g(a4);
            };
          }
          b3._makeCompatibilityCheck = f2, b3.isCompatible = f2(d2.VERSION);
        }, 886: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.metrics = void 0, b3.metrics = c2(653).MetricsAPI.getInstance();
        }, 901: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.ValueType = void 0, function(a3) {
            a3[a3.INT = 0] = "INT", a3[a3.DOUBLE = 1] = "DOUBLE";
          }(b3.ValueType || (b3.ValueType = {}));
        }, 102: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.createNoopMeter = b3.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = b3.NOOP_OBSERVABLE_GAUGE_METRIC = b3.NOOP_OBSERVABLE_COUNTER_METRIC = b3.NOOP_UP_DOWN_COUNTER_METRIC = b3.NOOP_HISTOGRAM_METRIC = b3.NOOP_COUNTER_METRIC = b3.NOOP_METER = b3.NoopObservableUpDownCounterMetric = b3.NoopObservableGaugeMetric = b3.NoopObservableCounterMetric = b3.NoopObservableMetric = b3.NoopHistogramMetric = b3.NoopUpDownCounterMetric = b3.NoopCounterMetric = b3.NoopMetric = b3.NoopMeter = void 0;
          class c2 {
            constructor() {
            }
            createHistogram(a3, c3) {
              return b3.NOOP_HISTOGRAM_METRIC;
            }
            createCounter(a3, c3) {
              return b3.NOOP_COUNTER_METRIC;
            }
            createUpDownCounter(a3, c3) {
              return b3.NOOP_UP_DOWN_COUNTER_METRIC;
            }
            createObservableGauge(a3, c3) {
              return b3.NOOP_OBSERVABLE_GAUGE_METRIC;
            }
            createObservableCounter(a3, c3) {
              return b3.NOOP_OBSERVABLE_COUNTER_METRIC;
            }
            createObservableUpDownCounter(a3, c3) {
              return b3.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
            }
            addBatchObservableCallback(a3, b4) {
            }
            removeBatchObservableCallback(a3) {
            }
          }
          b3.NoopMeter = c2;
          class d2 {
          }
          b3.NoopMetric = d2;
          class e2 extends d2 {
            add(a3, b4) {
            }
          }
          b3.NoopCounterMetric = e2;
          class f2 extends d2 {
            add(a3, b4) {
            }
          }
          b3.NoopUpDownCounterMetric = f2;
          class g extends d2 {
            record(a3, b4) {
            }
          }
          b3.NoopHistogramMetric = g;
          class h {
            addCallback(a3) {
            }
            removeCallback(a3) {
            }
          }
          b3.NoopObservableMetric = h;
          class i extends h {
          }
          b3.NoopObservableCounterMetric = i;
          class j extends h {
          }
          b3.NoopObservableGaugeMetric = j;
          class k extends h {
          }
          b3.NoopObservableUpDownCounterMetric = k, b3.NOOP_METER = new c2(), b3.NOOP_COUNTER_METRIC = new e2(), b3.NOOP_HISTOGRAM_METRIC = new g(), b3.NOOP_UP_DOWN_COUNTER_METRIC = new f2(), b3.NOOP_OBSERVABLE_COUNTER_METRIC = new i(), b3.NOOP_OBSERVABLE_GAUGE_METRIC = new j(), b3.NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new k(), b3.createNoopMeter = function() {
            return b3.NOOP_METER;
          };
        }, 660: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.NOOP_METER_PROVIDER = b3.NoopMeterProvider = void 0;
          let d2 = c2(102);
          class e2 {
            getMeter(a3, b4, c3) {
              return d2.NOOP_METER;
            }
          }
          b3.NoopMeterProvider = e2, b3.NOOP_METER_PROVIDER = new e2();
        }, 200: function(a2, b3, c2) {
          var d2 = this && this.__createBinding || (Object.create ? function(a3, b4, c3, d3) {
            void 0 === d3 && (d3 = c3), Object.defineProperty(a3, d3, { enumerable: true, get: function() {
              return b4[c3];
            } });
          } : function(a3, b4, c3, d3) {
            void 0 === d3 && (d3 = c3), a3[d3] = b4[c3];
          }), e2 = this && this.__exportStar || function(a3, b4) {
            for (var c3 in a3) "default" === c3 || Object.prototype.hasOwnProperty.call(b4, c3) || d2(b4, a3, c3);
          };
          Object.defineProperty(b3, "__esModule", { value: true }), e2(c2(46), b3);
        }, 651: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3._globalThis = void 0, b3._globalThis = "object" == typeof globalThis ? globalThis : c.g;
        }, 46: function(a2, b3, c2) {
          var d2 = this && this.__createBinding || (Object.create ? function(a3, b4, c3, d3) {
            void 0 === d3 && (d3 = c3), Object.defineProperty(a3, d3, { enumerable: true, get: function() {
              return b4[c3];
            } });
          } : function(a3, b4, c3, d3) {
            void 0 === d3 && (d3 = c3), a3[d3] = b4[c3];
          }), e2 = this && this.__exportStar || function(a3, b4) {
            for (var c3 in a3) "default" === c3 || Object.prototype.hasOwnProperty.call(b4, c3) || d2(b4, a3, c3);
          };
          Object.defineProperty(b3, "__esModule", { value: true }), e2(c2(651), b3);
        }, 939: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.propagation = void 0, b3.propagation = c2(181).PropagationAPI.getInstance();
        }, 874: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.NoopTextMapPropagator = void 0;
          class c2 {
            inject(a3, b4) {
            }
            extract(a3, b4) {
              return a3;
            }
            fields() {
              return [];
            }
          }
          b3.NoopTextMapPropagator = c2;
        }, 194: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.defaultTextMapSetter = b3.defaultTextMapGetter = void 0, b3.defaultTextMapGetter = { get(a3, b4) {
            if (null != a3) return a3[b4];
          }, keys: (a3) => null == a3 ? [] : Object.keys(a3) }, b3.defaultTextMapSetter = { set(a3, b4, c2) {
            null != a3 && (a3[b4] = c2);
          } };
        }, 845: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.trace = void 0, b3.trace = c2(997).TraceAPI.getInstance();
        }, 403: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.NonRecordingSpan = void 0;
          let d2 = c2(476);
          class e2 {
            constructor(a3 = d2.INVALID_SPAN_CONTEXT) {
              this._spanContext = a3;
            }
            spanContext() {
              return this._spanContext;
            }
            setAttribute(a3, b4) {
              return this;
            }
            setAttributes(a3) {
              return this;
            }
            addEvent(a3, b4) {
              return this;
            }
            setStatus(a3) {
              return this;
            }
            updateName(a3) {
              return this;
            }
            end(a3) {
            }
            isRecording() {
              return false;
            }
            recordException(a3, b4) {
            }
          }
          b3.NonRecordingSpan = e2;
        }, 614: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.NoopTracer = void 0;
          let d2 = c2(491), e2 = c2(607), f2 = c2(403), g = c2(139), h = d2.ContextAPI.getInstance();
          class i {
            startSpan(a3, b4, c3 = h.active()) {
              var d3;
              if (null == b4 ? void 0 : b4.root) return new f2.NonRecordingSpan();
              let i2 = c3 && (0, e2.getSpanContext)(c3);
              return "object" == typeof (d3 = i2) && "string" == typeof d3.spanId && "string" == typeof d3.traceId && "number" == typeof d3.traceFlags && (0, g.isSpanContextValid)(i2) ? new f2.NonRecordingSpan(i2) : new f2.NonRecordingSpan();
            }
            startActiveSpan(a3, b4, c3, d3) {
              let f3, g2, i2;
              if (arguments.length < 2) return;
              2 == arguments.length ? i2 = b4 : 3 == arguments.length ? (f3 = b4, i2 = c3) : (f3 = b4, g2 = c3, i2 = d3);
              let j = null != g2 ? g2 : h.active(), k = this.startSpan(a3, f3, j), l = (0, e2.setSpan)(j, k);
              return h.with(l, i2, void 0, k);
            }
          }
          b3.NoopTracer = i;
        }, 124: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.NoopTracerProvider = void 0;
          let d2 = c2(614);
          class e2 {
            getTracer(a3, b4, c3) {
              return new d2.NoopTracer();
            }
          }
          b3.NoopTracerProvider = e2;
        }, 125: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.ProxyTracer = void 0;
          let d2 = new (c2(614)).NoopTracer();
          class e2 {
            constructor(a3, b4, c3, d3) {
              this._provider = a3, this.name = b4, this.version = c3, this.options = d3;
            }
            startSpan(a3, b4, c3) {
              return this._getTracer().startSpan(a3, b4, c3);
            }
            startActiveSpan(a3, b4, c3, d3) {
              let e3 = this._getTracer();
              return Reflect.apply(e3.startActiveSpan, e3, arguments);
            }
            _getTracer() {
              if (this._delegate) return this._delegate;
              let a3 = this._provider.getDelegateTracer(this.name, this.version, this.options);
              return a3 ? (this._delegate = a3, this._delegate) : d2;
            }
          }
          b3.ProxyTracer = e2;
        }, 846: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.ProxyTracerProvider = void 0;
          let d2 = c2(125), e2 = new (c2(124)).NoopTracerProvider();
          class f2 {
            getTracer(a3, b4, c3) {
              var e3;
              return null != (e3 = this.getDelegateTracer(a3, b4, c3)) ? e3 : new d2.ProxyTracer(this, a3, b4, c3);
            }
            getDelegate() {
              var a3;
              return null != (a3 = this._delegate) ? a3 : e2;
            }
            setDelegate(a3) {
              this._delegate = a3;
            }
            getDelegateTracer(a3, b4, c3) {
              var d3;
              return null == (d3 = this._delegate) ? void 0 : d3.getTracer(a3, b4, c3);
            }
          }
          b3.ProxyTracerProvider = f2;
        }, 996: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.SamplingDecision = void 0, function(a3) {
            a3[a3.NOT_RECORD = 0] = "NOT_RECORD", a3[a3.RECORD = 1] = "RECORD", a3[a3.RECORD_AND_SAMPLED = 2] = "RECORD_AND_SAMPLED";
          }(b3.SamplingDecision || (b3.SamplingDecision = {}));
        }, 607: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.getSpanContext = b3.setSpanContext = b3.deleteSpan = b3.setSpan = b3.getActiveSpan = b3.getSpan = void 0;
          let d2 = c2(780), e2 = c2(403), f2 = c2(491), g = (0, d2.createContextKey)("OpenTelemetry Context Key SPAN");
          function h(a3) {
            return a3.getValue(g) || void 0;
          }
          function i(a3, b4) {
            return a3.setValue(g, b4);
          }
          b3.getSpan = h, b3.getActiveSpan = function() {
            return h(f2.ContextAPI.getInstance().active());
          }, b3.setSpan = i, b3.deleteSpan = function(a3) {
            return a3.deleteValue(g);
          }, b3.setSpanContext = function(a3, b4) {
            return i(a3, new e2.NonRecordingSpan(b4));
          }, b3.getSpanContext = function(a3) {
            var b4;
            return null == (b4 = h(a3)) ? void 0 : b4.spanContext();
          };
        }, 325: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.TraceStateImpl = void 0;
          let d2 = c2(564);
          class e2 {
            constructor(a3) {
              this._internalState = /* @__PURE__ */ new Map(), a3 && this._parse(a3);
            }
            set(a3, b4) {
              let c3 = this._clone();
              return c3._internalState.has(a3) && c3._internalState.delete(a3), c3._internalState.set(a3, b4), c3;
            }
            unset(a3) {
              let b4 = this._clone();
              return b4._internalState.delete(a3), b4;
            }
            get(a3) {
              return this._internalState.get(a3);
            }
            serialize() {
              return this._keys().reduce((a3, b4) => (a3.push(b4 + "=" + this.get(b4)), a3), []).join(",");
            }
            _parse(a3) {
              !(a3.length > 512) && (this._internalState = a3.split(",").reverse().reduce((a4, b4) => {
                let c3 = b4.trim(), e3 = c3.indexOf("=");
                if (-1 !== e3) {
                  let f2 = c3.slice(0, e3), g = c3.slice(e3 + 1, b4.length);
                  (0, d2.validateKey)(f2) && (0, d2.validateValue)(g) && a4.set(f2, g);
                }
                return a4;
              }, /* @__PURE__ */ new Map()), this._internalState.size > 32 && (this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, 32))));
            }
            _keys() {
              return Array.from(this._internalState.keys()).reverse();
            }
            _clone() {
              let a3 = new e2();
              return a3._internalState = new Map(this._internalState), a3;
            }
          }
          b3.TraceStateImpl = e2;
        }, 564: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.validateValue = b3.validateKey = void 0;
          let c2 = "[_0-9a-z-*/]", d2 = `[a-z]${c2}{0,255}`, e2 = `[a-z0-9]${c2}{0,240}@[a-z]${c2}{0,13}`, f2 = RegExp(`^(?:${d2}|${e2})$`), g = /^[ -~]{0,255}[!-~]$/, h = /,|=/;
          b3.validateKey = function(a3) {
            return f2.test(a3);
          }, b3.validateValue = function(a3) {
            return g.test(a3) && !h.test(a3);
          };
        }, 98: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.createTraceState = void 0;
          let d2 = c2(325);
          b3.createTraceState = function(a3) {
            return new d2.TraceStateImpl(a3);
          };
        }, 476: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.INVALID_SPAN_CONTEXT = b3.INVALID_TRACEID = b3.INVALID_SPANID = void 0;
          let d2 = c2(475);
          b3.INVALID_SPANID = "0000000000000000", b3.INVALID_TRACEID = "00000000000000000000000000000000", b3.INVALID_SPAN_CONTEXT = { traceId: b3.INVALID_TRACEID, spanId: b3.INVALID_SPANID, traceFlags: d2.TraceFlags.NONE };
        }, 357: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.SpanKind = void 0, function(a3) {
            a3[a3.INTERNAL = 0] = "INTERNAL", a3[a3.SERVER = 1] = "SERVER", a3[a3.CLIENT = 2] = "CLIENT", a3[a3.PRODUCER = 3] = "PRODUCER", a3[a3.CONSUMER = 4] = "CONSUMER";
          }(b3.SpanKind || (b3.SpanKind = {}));
        }, 139: (a2, b3, c2) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.wrapSpanContext = b3.isSpanContextValid = b3.isValidSpanId = b3.isValidTraceId = void 0;
          let d2 = c2(476), e2 = c2(403), f2 = /^([0-9a-f]{32})$/i, g = /^[0-9a-f]{16}$/i;
          function h(a3) {
            return f2.test(a3) && a3 !== d2.INVALID_TRACEID;
          }
          function i(a3) {
            return g.test(a3) && a3 !== d2.INVALID_SPANID;
          }
          b3.isValidTraceId = h, b3.isValidSpanId = i, b3.isSpanContextValid = function(a3) {
            return h(a3.traceId) && i(a3.spanId);
          }, b3.wrapSpanContext = function(a3) {
            return new e2.NonRecordingSpan(a3);
          };
        }, 847: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.SpanStatusCode = void 0, function(a3) {
            a3[a3.UNSET = 0] = "UNSET", a3[a3.OK = 1] = "OK", a3[a3.ERROR = 2] = "ERROR";
          }(b3.SpanStatusCode || (b3.SpanStatusCode = {}));
        }, 475: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.TraceFlags = void 0, function(a3) {
            a3[a3.NONE = 0] = "NONE", a3[a3.SAMPLED = 1] = "SAMPLED";
          }(b3.TraceFlags || (b3.TraceFlags = {}));
        }, 521: (a2, b3) => {
          Object.defineProperty(b3, "__esModule", { value: true }), b3.VERSION = void 0, b3.VERSION = "1.6.0";
        } }, d = {};
        function e(a2) {
          var c2 = d[a2];
          if (void 0 !== c2) return c2.exports;
          var f2 = d[a2] = { exports: {} }, g = true;
          try {
            b2[a2].call(f2.exports, f2, f2.exports, e), g = false;
          } finally {
            g && delete d[a2];
          }
          return f2.exports;
        }
        e.ab = "//";
        var f = {};
        (() => {
          Object.defineProperty(f, "__esModule", { value: true }), f.trace = f.propagation = f.metrics = f.diag = f.context = f.INVALID_SPAN_CONTEXT = f.INVALID_TRACEID = f.INVALID_SPANID = f.isValidSpanId = f.isValidTraceId = f.isSpanContextValid = f.createTraceState = f.TraceFlags = f.SpanStatusCode = f.SpanKind = f.SamplingDecision = f.ProxyTracerProvider = f.ProxyTracer = f.defaultTextMapSetter = f.defaultTextMapGetter = f.ValueType = f.createNoopMeter = f.DiagLogLevel = f.DiagConsoleLogger = f.ROOT_CONTEXT = f.createContextKey = f.baggageEntryMetadataFromString = void 0;
          var a2 = e(369);
          Object.defineProperty(f, "baggageEntryMetadataFromString", { enumerable: true, get: function() {
            return a2.baggageEntryMetadataFromString;
          } });
          var b3 = e(780);
          Object.defineProperty(f, "createContextKey", { enumerable: true, get: function() {
            return b3.createContextKey;
          } }), Object.defineProperty(f, "ROOT_CONTEXT", { enumerable: true, get: function() {
            return b3.ROOT_CONTEXT;
          } });
          var c2 = e(972);
          Object.defineProperty(f, "DiagConsoleLogger", { enumerable: true, get: function() {
            return c2.DiagConsoleLogger;
          } });
          var d2 = e(957);
          Object.defineProperty(f, "DiagLogLevel", { enumerable: true, get: function() {
            return d2.DiagLogLevel;
          } });
          var g = e(102);
          Object.defineProperty(f, "createNoopMeter", { enumerable: true, get: function() {
            return g.createNoopMeter;
          } });
          var h = e(901);
          Object.defineProperty(f, "ValueType", { enumerable: true, get: function() {
            return h.ValueType;
          } });
          var i = e(194);
          Object.defineProperty(f, "defaultTextMapGetter", { enumerable: true, get: function() {
            return i.defaultTextMapGetter;
          } }), Object.defineProperty(f, "defaultTextMapSetter", { enumerable: true, get: function() {
            return i.defaultTextMapSetter;
          } });
          var j = e(125);
          Object.defineProperty(f, "ProxyTracer", { enumerable: true, get: function() {
            return j.ProxyTracer;
          } });
          var k = e(846);
          Object.defineProperty(f, "ProxyTracerProvider", { enumerable: true, get: function() {
            return k.ProxyTracerProvider;
          } });
          var l = e(996);
          Object.defineProperty(f, "SamplingDecision", { enumerable: true, get: function() {
            return l.SamplingDecision;
          } });
          var m = e(357);
          Object.defineProperty(f, "SpanKind", { enumerable: true, get: function() {
            return m.SpanKind;
          } });
          var n = e(847);
          Object.defineProperty(f, "SpanStatusCode", { enumerable: true, get: function() {
            return n.SpanStatusCode;
          } });
          var o = e(475);
          Object.defineProperty(f, "TraceFlags", { enumerable: true, get: function() {
            return o.TraceFlags;
          } });
          var p = e(98);
          Object.defineProperty(f, "createTraceState", { enumerable: true, get: function() {
            return p.createTraceState;
          } });
          var q = e(139);
          Object.defineProperty(f, "isSpanContextValid", { enumerable: true, get: function() {
            return q.isSpanContextValid;
          } }), Object.defineProperty(f, "isValidTraceId", { enumerable: true, get: function() {
            return q.isValidTraceId;
          } }), Object.defineProperty(f, "isValidSpanId", { enumerable: true, get: function() {
            return q.isValidSpanId;
          } });
          var r = e(476);
          Object.defineProperty(f, "INVALID_SPANID", { enumerable: true, get: function() {
            return r.INVALID_SPANID;
          } }), Object.defineProperty(f, "INVALID_TRACEID", { enumerable: true, get: function() {
            return r.INVALID_TRACEID;
          } }), Object.defineProperty(f, "INVALID_SPAN_CONTEXT", { enumerable: true, get: function() {
            return r.INVALID_SPAN_CONTEXT;
          } });
          let s = e(67);
          Object.defineProperty(f, "context", { enumerable: true, get: function() {
            return s.context;
          } });
          let t = e(506);
          Object.defineProperty(f, "diag", { enumerable: true, get: function() {
            return t.diag;
          } });
          let u = e(886);
          Object.defineProperty(f, "metrics", { enumerable: true, get: function() {
            return u.metrics;
          } });
          let v = e(939);
          Object.defineProperty(f, "propagation", { enumerable: true, get: function() {
            return v.propagation;
          } });
          let w = e(845);
          Object.defineProperty(f, "trace", { enumerable: true, get: function() {
            return w.trace;
          } }), f.default = { context: s.context, diag: t.diag, metrics: u.metrics, propagation: v.propagation, trace: w.trace };
        })(), a.exports = f;
      })();
    }, 344: (a, b, c) => {
      "use strict";
      Object.defineProperty(b, "__esModule", { value: true }), !function(a2, b2) {
        for (var c2 in b2) Object.defineProperty(a2, c2, { enumerable: true, get: b2[c2] });
      }(b, { getTestReqInfo: function() {
        return g;
      }, withRequest: function() {
        return f;
      } });
      let d = new (c(521)).AsyncLocalStorage();
      function e(a2, b2) {
        let c2 = b2.header(a2, "next-test-proxy-port");
        if (!c2) return;
        let d2 = b2.url(a2);
        return { url: d2, proxyPort: Number(c2), testData: b2.header(a2, "next-test-data") || "" };
      }
      function f(a2, b2, c2) {
        let f2 = e(a2, b2);
        return f2 ? d.run(f2, c2) : c2();
      }
      function g(a2, b2) {
        let c2 = d.getStore();
        return c2 || (a2 && b2 ? e(a2, b2) : void 0);
      }
    }, 356: (a) => {
      "use strict";
      a.exports = (init_node_buffer(), __toCommonJS(node_buffer_exports));
    }, 363: (a) => {
      "use strict";
      var b = Object.defineProperty, c = Object.getOwnPropertyDescriptor, d = Object.getOwnPropertyNames, e = Object.prototype.hasOwnProperty, f = {};
      function g(a2) {
        var b2;
        let c2 = ["path" in a2 && a2.path && `Path=${a2.path}`, "expires" in a2 && (a2.expires || 0 === a2.expires) && `Expires=${("number" == typeof a2.expires ? new Date(a2.expires) : a2.expires).toUTCString()}`, "maxAge" in a2 && "number" == typeof a2.maxAge && `Max-Age=${a2.maxAge}`, "domain" in a2 && a2.domain && `Domain=${a2.domain}`, "secure" in a2 && a2.secure && "Secure", "httpOnly" in a2 && a2.httpOnly && "HttpOnly", "sameSite" in a2 && a2.sameSite && `SameSite=${a2.sameSite}`, "partitioned" in a2 && a2.partitioned && "Partitioned", "priority" in a2 && a2.priority && `Priority=${a2.priority}`].filter(Boolean), d2 = `${a2.name}=${encodeURIComponent(null != (b2 = a2.value) ? b2 : "")}`;
        return 0 === c2.length ? d2 : `${d2}; ${c2.join("; ")}`;
      }
      function h(a2) {
        let b2 = /* @__PURE__ */ new Map();
        for (let c2 of a2.split(/; */)) {
          if (!c2) continue;
          let a3 = c2.indexOf("=");
          if (-1 === a3) {
            b2.set(c2, "true");
            continue;
          }
          let [d2, e2] = [c2.slice(0, a3), c2.slice(a3 + 1)];
          try {
            b2.set(d2, decodeURIComponent(null != e2 ? e2 : "true"));
          } catch {
          }
        }
        return b2;
      }
      function i(a2) {
        if (!a2) return;
        let [[b2, c2], ...d2] = h(a2), { domain: e2, expires: f2, httponly: g2, maxage: i2, path: l2, samesite: m2, secure: n, partitioned: o, priority: p } = Object.fromEntries(d2.map(([a3, b3]) => [a3.toLowerCase().replace(/-/g, ""), b3]));
        {
          var q, r, s = { name: b2, value: decodeURIComponent(c2), domain: e2, ...f2 && { expires: new Date(f2) }, ...g2 && { httpOnly: true }, ..."string" == typeof i2 && { maxAge: Number(i2) }, path: l2, ...m2 && { sameSite: j.includes(q = (q = m2).toLowerCase()) ? q : void 0 }, ...n && { secure: true }, ...p && { priority: k.includes(r = (r = p).toLowerCase()) ? r : void 0 }, ...o && { partitioned: true } };
          let a3 = {};
          for (let b3 in s) s[b3] && (a3[b3] = s[b3]);
          return a3;
        }
      }
      ((a2, c2) => {
        for (var d2 in c2) b(a2, d2, { get: c2[d2], enumerable: true });
      })(f, { RequestCookies: () => l, ResponseCookies: () => m, parseCookie: () => h, parseSetCookie: () => i, stringifyCookie: () => g }), a.exports = ((a2, f2, g2, h2) => {
        if (f2 && "object" == typeof f2 || "function" == typeof f2) for (let i2 of d(f2)) e.call(a2, i2) || i2 === g2 || b(a2, i2, { get: () => f2[i2], enumerable: !(h2 = c(f2, i2)) || h2.enumerable });
        return a2;
      })(b({}, "__esModule", { value: true }), f);
      var j = ["strict", "lax", "none"], k = ["low", "medium", "high"], l = class {
        constructor(a2) {
          this._parsed = /* @__PURE__ */ new Map(), this._headers = a2;
          let b2 = a2.get("cookie");
          if (b2) for (let [a3, c2] of h(b2)) this._parsed.set(a3, { name: a3, value: c2 });
        }
        [Symbol.iterator]() {
          return this._parsed[Symbol.iterator]();
        }
        get size() {
          return this._parsed.size;
        }
        get(...a2) {
          let b2 = "string" == typeof a2[0] ? a2[0] : a2[0].name;
          return this._parsed.get(b2);
        }
        getAll(...a2) {
          var b2;
          let c2 = Array.from(this._parsed);
          if (!a2.length) return c2.map(([a3, b3]) => b3);
          let d2 = "string" == typeof a2[0] ? a2[0] : null == (b2 = a2[0]) ? void 0 : b2.name;
          return c2.filter(([a3]) => a3 === d2).map(([a3, b3]) => b3);
        }
        has(a2) {
          return this._parsed.has(a2);
        }
        set(...a2) {
          let [b2, c2] = 1 === a2.length ? [a2[0].name, a2[0].value] : a2, d2 = this._parsed;
          return d2.set(b2, { name: b2, value: c2 }), this._headers.set("cookie", Array.from(d2).map(([a3, b3]) => g(b3)).join("; ")), this;
        }
        delete(a2) {
          let b2 = this._parsed, c2 = Array.isArray(a2) ? a2.map((a3) => b2.delete(a3)) : b2.delete(a2);
          return this._headers.set("cookie", Array.from(b2).map(([a3, b3]) => g(b3)).join("; ")), c2;
        }
        clear() {
          return this.delete(Array.from(this._parsed.keys())), this;
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return `RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
        }
        toString() {
          return [...this._parsed.values()].map((a2) => `${a2.name}=${encodeURIComponent(a2.value)}`).join("; ");
        }
      }, m = class {
        constructor(a2) {
          var b2, c2, d2;
          this._parsed = /* @__PURE__ */ new Map(), this._headers = a2;
          let e2 = null != (d2 = null != (c2 = null == (b2 = a2.getSetCookie) ? void 0 : b2.call(a2)) ? c2 : a2.get("set-cookie")) ? d2 : [];
          for (let a3 of Array.isArray(e2) ? e2 : function(a4) {
            if (!a4) return [];
            var b3, c3, d3, e3, f2, g2 = [], h2 = 0;
            function i2() {
              for (; h2 < a4.length && /\s/.test(a4.charAt(h2)); ) h2 += 1;
              return h2 < a4.length;
            }
            for (; h2 < a4.length; ) {
              for (b3 = h2, f2 = false; i2(); ) if ("," === (c3 = a4.charAt(h2))) {
                for (d3 = h2, h2 += 1, i2(), e3 = h2; h2 < a4.length && "=" !== (c3 = a4.charAt(h2)) && ";" !== c3 && "," !== c3; ) h2 += 1;
                h2 < a4.length && "=" === a4.charAt(h2) ? (f2 = true, h2 = e3, g2.push(a4.substring(b3, d3)), b3 = h2) : h2 = d3 + 1;
              } else h2 += 1;
              (!f2 || h2 >= a4.length) && g2.push(a4.substring(b3, a4.length));
            }
            return g2;
          }(e2)) {
            let b3 = i(a3);
            b3 && this._parsed.set(b3.name, b3);
          }
        }
        get(...a2) {
          let b2 = "string" == typeof a2[0] ? a2[0] : a2[0].name;
          return this._parsed.get(b2);
        }
        getAll(...a2) {
          var b2;
          let c2 = Array.from(this._parsed.values());
          if (!a2.length) return c2;
          let d2 = "string" == typeof a2[0] ? a2[0] : null == (b2 = a2[0]) ? void 0 : b2.name;
          return c2.filter((a3) => a3.name === d2);
        }
        has(a2) {
          return this._parsed.has(a2);
        }
        set(...a2) {
          let [b2, c2, d2] = 1 === a2.length ? [a2[0].name, a2[0].value, a2[0]] : a2, e2 = this._parsed;
          return e2.set(b2, function(a3 = { name: "", value: "" }) {
            return "number" == typeof a3.expires && (a3.expires = new Date(a3.expires)), a3.maxAge && (a3.expires = new Date(Date.now() + 1e3 * a3.maxAge)), (null === a3.path || void 0 === a3.path) && (a3.path = "/"), a3;
          }({ name: b2, value: c2, ...d2 })), function(a3, b3) {
            for (let [, c3] of (b3.delete("set-cookie"), a3)) {
              let a4 = g(c3);
              b3.append("set-cookie", a4);
            }
          }(e2, this._headers), this;
        }
        delete(...a2) {
          let [b2, c2] = "string" == typeof a2[0] ? [a2[0]] : [a2[0].name, a2[0]];
          return this.set({ ...c2, name: b2, value: "", expires: /* @__PURE__ */ new Date(0) });
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return `ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`;
        }
        toString() {
          return [...this._parsed.values()].map(g).join("; ");
        }
      };
    }, 398: (a) => {
      "use strict";
      var b = { decodeValues: true, map: false, silent: false };
      function c(a2) {
        return "string" == typeof a2 && !!a2.trim();
      }
      function d(a2, d2) {
        var e2, f, g, h, i = a2.split(";").filter(c), j = (e2 = i.shift(), f = "", g = "", (h = e2.split("=")).length > 1 ? (f = h.shift(), g = h.join("=")) : g = e2, { name: f, value: g }), k = j.name, l = j.value;
        d2 = d2 ? Object.assign({}, b, d2) : b;
        try {
          l = d2.decodeValues ? decodeURIComponent(l) : l;
        } catch (a3) {
          console.error("set-cookie-parser encountered an error while decoding a cookie with value '" + l + "'. Set options.decodeValues to false to disable this feature.", a3);
        }
        var m = { name: k, value: l };
        return i.forEach(function(a3) {
          var b2 = a3.split("="), c2 = b2.shift().trimLeft().toLowerCase(), d3 = b2.join("=");
          "expires" === c2 ? m.expires = new Date(d3) : "max-age" === c2 ? m.maxAge = parseInt(d3, 10) : "secure" === c2 ? m.secure = true : "httponly" === c2 ? m.httpOnly = true : "samesite" === c2 ? m.sameSite = d3 : "partitioned" === c2 ? m.partitioned = true : m[c2] = d3;
        }), m;
      }
      function e(a2, e2) {
        if (e2 = e2 ? Object.assign({}, b, e2) : b, !a2) if (!e2.map) return [];
        else return {};
        if (a2.headers) if ("function" == typeof a2.headers.getSetCookie) a2 = a2.headers.getSetCookie();
        else if (a2.headers["set-cookie"]) a2 = a2.headers["set-cookie"];
        else {
          var f = a2.headers[Object.keys(a2.headers).find(function(a3) {
            return "set-cookie" === a3.toLowerCase();
          })];
          f || !a2.headers.cookie || e2.silent || console.warn("Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning."), a2 = f;
        }
        return (Array.isArray(a2) || (a2 = [a2]), e2.map) ? a2.filter(c).reduce(function(a3, b2) {
          var c2 = d(b2, e2);
          return a3[c2.name] = c2, a3;
        }, {}) : a2.filter(c).map(function(a3) {
          return d(a3, e2);
        });
      }
      a.exports = e, a.exports.parse = e, a.exports.parseString = d, a.exports.splitCookiesString = function(a2) {
        if (Array.isArray(a2)) return a2;
        if ("string" != typeof a2) return [];
        var b2, c2, d2, e2, f, g = [], h = 0;
        function i() {
          for (; h < a2.length && /\s/.test(a2.charAt(h)); ) h += 1;
          return h < a2.length;
        }
        for (; h < a2.length; ) {
          for (b2 = h, f = false; i(); ) if ("," === (c2 = a2.charAt(h))) {
            for (d2 = h, h += 1, i(), e2 = h; h < a2.length && "=" !== (c2 = a2.charAt(h)) && ";" !== c2 && "," !== c2; ) h += 1;
            h < a2.length && "=" === a2.charAt(h) ? (f = true, h = e2, g.push(a2.substring(b2, d2)), b2 = h) : h = d2 + 1;
          } else h += 1;
          (!f || h >= a2.length) && g.push(a2.substring(b2, a2.length));
        }
        return g;
      };
    }, 411: (a, b, c) => {
      "use strict";
      c.r(b), c.d(b, { Headers: () => g, Request: () => h, Response: () => i, default: () => f, fetch: () => e });
      var d = function() {
        if ("undefined" != typeof self) return self;
        if ("undefined" != typeof window) return window;
        if (void 0 !== c.g) return c.g;
        throw Error("unable to locate global object");
      }();
      let e = d.fetch, f = d.fetch.bind(d), g = d.Headers, h = d.Request, i = d.Response;
    }, 454: (a, b, c) => {
      "use strict";
      a.exports = c(296);
    }, 519: (a, b, c) => {
      "use strict";
      var d, e = Object.defineProperty, f = Object.getOwnPropertyDescriptor, g = Object.getOwnPropertyNames, h = Object.prototype.hasOwnProperty, i = {};
      ((a2, b2) => {
        for (var c2 in b2) e(a2, c2, { get: b2[c2], enumerable: true });
      })(i, { createBrowserSupabaseClient: () => B, createClientComponentClient: () => k, createMiddlewareClient: () => t, createMiddlewareSupabaseClient: () => D, createPagesBrowserClient: () => l, createPagesServerClient: () => p, createRouteHandlerClient: () => z, createServerActionClient: () => A, createServerComponentClient: () => w, createServerSupabaseClient: () => C }), a.exports = ((a2, b2, c2, d2) => {
        if (b2 && "object" == typeof b2 || "function" == typeof b2) for (let i2 of g(b2)) h.call(a2, i2) || i2 === c2 || e(a2, i2, { get: () => b2[i2], enumerable: !(d2 = f(b2, i2)) || d2.enumerable });
        return a2;
      })(e({}, "__esModule", { value: true }), i);
      var j = c(656);
      function k({ supabaseUrl: a2 = "https://gtyvdircfhmdjiaelqkg.supabase.co", supabaseKey: b2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2Njc4NTUsImV4cCI6MjA3MjI0Mzg1NX0.DeEm08k7QOrKObWaz8AUaOB5N6Z2QZhZHFaUf2siALA", options: c2, cookieOptions: e2, isSingleton: f2 = true } = {}) {
        if (!a2 || !b2) throw Error("either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!");
        let g2 = () => {
          var d2;
          return (0, j.createSupabaseClient)(a2, b2, { ...c2, global: { ...null == c2 ? void 0 : c2.global, headers: { ...null == (d2 = null == c2 ? void 0 : c2.global) ? void 0 : d2.headers, "X-Client-Info": "@supabase/auth-helpers-nextjs@0.8.7" } }, auth: { storage: new j.BrowserCookieAuthStorageAdapter(e2) } });
        };
        if (f2) {
          let a3 = d ?? g2();
          return "undefined" == typeof window ? a3 : (d || (d = a3), d);
        }
        return g2();
      }
      var l = k, m = c(656), n = c(398), o = class extends m.CookieAuthStorageAdapter {
        constructor(a2, b2) {
          super(b2), this.context = a2;
        }
        getCookie(a2) {
          var b2, c2, d2;
          return (0, n.splitCookiesString)((null == (c2 = null == (b2 = this.context.res) ? void 0 : b2.getHeader("set-cookie")) ? void 0 : c2.toString()) ?? "").map((b3) => (0, m.parseCookies)(b3)[a2]).find((a3) => !!a3) ?? (null == (d2 = this.context.req) ? void 0 : d2.cookies[a2]);
        }
        setCookie(a2, b2) {
          this._setCookie(a2, b2);
        }
        deleteCookie(a2) {
          this._setCookie(a2, "", { maxAge: 0 });
        }
        _setCookie(a2, b2, c2) {
          var d2;
          let e2 = (0, n.splitCookiesString)((null == (d2 = this.context.res.getHeader("set-cookie")) ? void 0 : d2.toString()) ?? "").filter((b3) => !(a2 in (0, m.parseCookies)(b3))), f2 = (0, m.serializeCookie)(a2, b2, { ...this.cookieOptions, ...c2, httpOnly: false });
          this.context.res.setHeader("set-cookie", [...e2, f2]);
        }
      };
      function p(a2, { supabaseUrl: b2 = "https://gtyvdircfhmdjiaelqkg.supabase.co", supabaseKey: c2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2Njc4NTUsImV4cCI6MjA3MjI0Mzg1NX0.DeEm08k7QOrKObWaz8AUaOB5N6Z2QZhZHFaUf2siALA", options: d2, cookieOptions: e2 } = {}) {
        var f2;
        if (!b2 || !c2) throw Error("either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!");
        return (0, m.createSupabaseClient)(b2, c2, { ...d2, global: { ...null == d2 ? void 0 : d2.global, headers: { ...null == (f2 = null == d2 ? void 0 : d2.global) ? void 0 : f2.headers, "X-Client-Info": "@supabase/auth-helpers-nextjs@0.8.7" } }, auth: { storage: new o(a2, e2) } });
      }
      var q = c(656), r = c(398), s = class extends q.CookieAuthStorageAdapter {
        constructor(a2, b2) {
          super(b2), this.context = a2;
        }
        getCookie(a2) {
          var b2;
          let c2 = (0, r.splitCookiesString)((null == (b2 = this.context.res.headers.get("set-cookie")) ? void 0 : b2.toString()) ?? "").map((b3) => (0, q.parseCookies)(b3)[a2]).find((a3) => !!a3);
          return c2 || (0, q.parseCookies)(this.context.req.headers.get("cookie") ?? "")[a2];
        }
        setCookie(a2, b2) {
          this._setCookie(a2, b2);
        }
        deleteCookie(a2) {
          this._setCookie(a2, "", { maxAge: 0 });
        }
        _setCookie(a2, b2, c2) {
          let d2 = (0, q.serializeCookie)(a2, b2, { ...this.cookieOptions, ...c2, httpOnly: false });
          this.context.res.headers && this.context.res.headers.append("set-cookie", d2);
        }
      };
      function t(a2, { supabaseUrl: b2 = "https://gtyvdircfhmdjiaelqkg.supabase.co", supabaseKey: c2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2Njc4NTUsImV4cCI6MjA3MjI0Mzg1NX0.DeEm08k7QOrKObWaz8AUaOB5N6Z2QZhZHFaUf2siALA", options: d2, cookieOptions: e2 } = {}) {
        var f2;
        if (!b2 || !c2) throw Error("either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!");
        return (0, q.createSupabaseClient)(b2, c2, { ...d2, global: { ...null == d2 ? void 0 : d2.global, headers: { ...null == (f2 = null == d2 ? void 0 : d2.global) ? void 0 : f2.headers, "X-Client-Info": "@supabase/auth-helpers-nextjs@0.8.7" } }, auth: { storage: new s(a2, e2) } });
      }
      var u = c(656), v = class extends u.CookieAuthStorageAdapter {
        constructor(a2, b2) {
          super(b2), this.context = a2;
        }
        getCookie(a2) {
          var b2;
          return null == (b2 = this.context.cookies().get(a2)) ? void 0 : b2.value;
        }
        setCookie(a2, b2) {
        }
        deleteCookie(a2) {
        }
      };
      function w(a2, { supabaseUrl: b2 = "https://gtyvdircfhmdjiaelqkg.supabase.co", supabaseKey: c2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2Njc4NTUsImV4cCI6MjA3MjI0Mzg1NX0.DeEm08k7QOrKObWaz8AUaOB5N6Z2QZhZHFaUf2siALA", options: d2, cookieOptions: e2 } = {}) {
        var f2;
        if (!b2 || !c2) throw Error("either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!");
        return (0, u.createSupabaseClient)(b2, c2, { ...d2, global: { ...null == d2 ? void 0 : d2.global, headers: { ...null == (f2 = null == d2 ? void 0 : d2.global) ? void 0 : f2.headers, "X-Client-Info": "@supabase/auth-helpers-nextjs@0.8.7" } }, auth: { storage: new v(a2, e2) } });
      }
      var x = c(656), y = class extends x.CookieAuthStorageAdapter {
        constructor(a2, b2) {
          super(b2), this.context = a2;
        }
        getCookie(a2) {
          var b2;
          return null == (b2 = this.context.cookies().get(a2)) ? void 0 : b2.value;
        }
        setCookie(a2, b2) {
          this.context.cookies().set(a2, b2, this.cookieOptions);
        }
        deleteCookie(a2) {
          this.context.cookies().set(a2, "", { ...this.cookieOptions, maxAge: 0 });
        }
      };
      function z(a2, { supabaseUrl: b2 = "https://gtyvdircfhmdjiaelqkg.supabase.co", supabaseKey: c2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2Njc4NTUsImV4cCI6MjA3MjI0Mzg1NX0.DeEm08k7QOrKObWaz8AUaOB5N6Z2QZhZHFaUf2siALA", options: d2, cookieOptions: e2 } = {}) {
        var f2;
        if (!b2 || !c2) throw Error("either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!");
        return (0, x.createSupabaseClient)(b2, c2, { ...d2, global: { ...null == d2 ? void 0 : d2.global, headers: { ...null == (f2 = null == d2 ? void 0 : d2.global) ? void 0 : f2.headers, "X-Client-Info": "@supabase/auth-helpers-nextjs@0.8.7" } }, auth: { storage: new y(a2, e2) } });
      }
      var A = z;
      function B({ supabaseUrl: a2 = "https://gtyvdircfhmdjiaelqkg.supabase.co", supabaseKey: b2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2Njc4NTUsImV4cCI6MjA3MjI0Mzg1NX0.DeEm08k7QOrKObWaz8AUaOB5N6Z2QZhZHFaUf2siALA", options: c2, cookieOptions: d2 } = {}) {
        return console.warn("Please utilize the `createPagesBrowserClient` function instead of the deprecated `createBrowserSupabaseClient` function. Learn more: https://supabase.com/docs/guides/auth/auth-helpers/nextjs-pages"), l({ supabaseUrl: a2, supabaseKey: b2, options: c2, cookieOptions: d2 });
      }
      function C(a2, { supabaseUrl: b2 = "https://gtyvdircfhmdjiaelqkg.supabase.co", supabaseKey: c2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2Njc4NTUsImV4cCI6MjA3MjI0Mzg1NX0.DeEm08k7QOrKObWaz8AUaOB5N6Z2QZhZHFaUf2siALA", options: d2, cookieOptions: e2 } = {}) {
        return console.warn("Please utilize the `createPagesServerClient` function instead of the deprecated `createServerSupabaseClient` function. Learn more: https://supabase.com/docs/guides/auth/auth-helpers/nextjs-pages"), p(a2, { supabaseUrl: b2, supabaseKey: c2, options: d2, cookieOptions: e2 });
      }
      function D(a2, { supabaseUrl: b2 = "https://gtyvdircfhmdjiaelqkg.supabase.co", supabaseKey: c2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0eXZkaXJjZmhtZGppYWVscWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2Njc4NTUsImV4cCI6MjA3MjI0Mzg1NX0.DeEm08k7QOrKObWaz8AUaOB5N6Z2QZhZHFaUf2siALA", options: d2, cookieOptions: e2 } = {}) {
        return console.warn("Please utilize the `createMiddlewareClient` function instead of the deprecated `createMiddlewareSupabaseClient` function. Learn more: https://supabase.com/docs/guides/auth/auth-helpers/nextjs#middleware"), t(a2, { supabaseUrl: b2, supabaseKey: c2, options: d2, cookieOptions: e2 });
      }
    }, 521: (a) => {
      "use strict";
      a.exports = (init_node_async_hooks(), __toCommonJS(node_async_hooks_exports));
    }, 549: function(a, b, c) {
      "use strict";
      var d = this && this.__importDefault || function(a2) {
        return a2 && a2.__esModule ? a2 : { default: a2 };
      };
      Object.defineProperty(b, "__esModule", { value: true });
      let e = d(c(141));
      class f extends e.default {
        eq(a2, b2) {
          return this.url.searchParams.append(a2, `eq.${b2}`), this;
        }
        neq(a2, b2) {
          return this.url.searchParams.append(a2, `neq.${b2}`), this;
        }
        gt(a2, b2) {
          return this.url.searchParams.append(a2, `gt.${b2}`), this;
        }
        gte(a2, b2) {
          return this.url.searchParams.append(a2, `gte.${b2}`), this;
        }
        lt(a2, b2) {
          return this.url.searchParams.append(a2, `lt.${b2}`), this;
        }
        lte(a2, b2) {
          return this.url.searchParams.append(a2, `lte.${b2}`), this;
        }
        like(a2, b2) {
          return this.url.searchParams.append(a2, `like.${b2}`), this;
        }
        likeAllOf(a2, b2) {
          return this.url.searchParams.append(a2, `like(all).{${b2.join(",")}}`), this;
        }
        likeAnyOf(a2, b2) {
          return this.url.searchParams.append(a2, `like(any).{${b2.join(",")}}`), this;
        }
        ilike(a2, b2) {
          return this.url.searchParams.append(a2, `ilike.${b2}`), this;
        }
        ilikeAllOf(a2, b2) {
          return this.url.searchParams.append(a2, `ilike(all).{${b2.join(",")}}`), this;
        }
        ilikeAnyOf(a2, b2) {
          return this.url.searchParams.append(a2, `ilike(any).{${b2.join(",")}}`), this;
        }
        is(a2, b2) {
          return this.url.searchParams.append(a2, `is.${b2}`), this;
        }
        in(a2, b2) {
          let c2 = Array.from(new Set(b2)).map((a3) => "string" == typeof a3 && RegExp("[,()]").test(a3) ? `"${a3}"` : `${a3}`).join(",");
          return this.url.searchParams.append(a2, `in.(${c2})`), this;
        }
        contains(a2, b2) {
          return "string" == typeof b2 ? this.url.searchParams.append(a2, `cs.${b2}`) : Array.isArray(b2) ? this.url.searchParams.append(a2, `cs.{${b2.join(",")}}`) : this.url.searchParams.append(a2, `cs.${JSON.stringify(b2)}`), this;
        }
        containedBy(a2, b2) {
          return "string" == typeof b2 ? this.url.searchParams.append(a2, `cd.${b2}`) : Array.isArray(b2) ? this.url.searchParams.append(a2, `cd.{${b2.join(",")}}`) : this.url.searchParams.append(a2, `cd.${JSON.stringify(b2)}`), this;
        }
        rangeGt(a2, b2) {
          return this.url.searchParams.append(a2, `sr.${b2}`), this;
        }
        rangeGte(a2, b2) {
          return this.url.searchParams.append(a2, `nxl.${b2}`), this;
        }
        rangeLt(a2, b2) {
          return this.url.searchParams.append(a2, `sl.${b2}`), this;
        }
        rangeLte(a2, b2) {
          return this.url.searchParams.append(a2, `nxr.${b2}`), this;
        }
        rangeAdjacent(a2, b2) {
          return this.url.searchParams.append(a2, `adj.${b2}`), this;
        }
        overlaps(a2, b2) {
          return "string" == typeof b2 ? this.url.searchParams.append(a2, `ov.${b2}`) : this.url.searchParams.append(a2, `ov.{${b2.join(",")}}`), this;
        }
        textSearch(a2, b2, { config: c2, type: d2 } = {}) {
          let e2 = "";
          "plain" === d2 ? e2 = "pl" : "phrase" === d2 ? e2 = "ph" : "websearch" === d2 && (e2 = "w");
          let f2 = void 0 === c2 ? "" : `(${c2})`;
          return this.url.searchParams.append(a2, `${e2}fts${f2}.${b2}`), this;
        }
        match(a2) {
          return Object.entries(a2).forEach(([a3, b2]) => {
            this.url.searchParams.append(a3, `eq.${b2}`);
          }), this;
        }
        not(a2, b2, c2) {
          return this.url.searchParams.append(a2, `not.${b2}.${c2}`), this;
        }
        or(a2, { foreignTable: b2, referencedTable: c2 = b2 } = {}) {
          let d2 = c2 ? `${c2}.or` : "or";
          return this.url.searchParams.append(d2, `(${a2})`), this;
        }
        filter(a2, b2, c2) {
          return this.url.searchParams.append(a2, `${b2}.${c2}`), this;
        }
      }
      b.default = f;
    }, 592: (a, b) => {
      "use strict";
      Object.defineProperty(b, "__esModule", { value: true });
      class c extends Error {
        constructor(a2) {
          super(a2.message), this.name = "PostgrestError", this.details = a2.details, this.hint = a2.hint, this.code = a2.code;
        }
      }
      b.default = c;
    }, 607: (a) => {
      (() => {
        "use strict";
        "undefined" != typeof __nccwpck_require__ && (__nccwpck_require__.ab = "//");
        var b = {};
        (() => {
          b.parse = function(b2, c2) {
            if ("string" != typeof b2) throw TypeError("argument str must be a string");
            for (var e2 = {}, f = b2.split(d), g = (c2 || {}).decode || a2, h = 0; h < f.length; h++) {
              var i = f[h], j = i.indexOf("=");
              if (!(j < 0)) {
                var k = i.substr(0, j).trim(), l = i.substr(++j, i.length).trim();
                '"' == l[0] && (l = l.slice(1, -1)), void 0 == e2[k] && (e2[k] = function(a3, b3) {
                  try {
                    return b3(a3);
                  } catch (b4) {
                    return a3;
                  }
                }(l, g));
              }
            }
            return e2;
          }, b.serialize = function(a3, b2, d2) {
            var f = d2 || {}, g = f.encode || c;
            if ("function" != typeof g) throw TypeError("option encode is invalid");
            if (!e.test(a3)) throw TypeError("argument name is invalid");
            var h = g(b2);
            if (h && !e.test(h)) throw TypeError("argument val is invalid");
            var i = a3 + "=" + h;
            if (null != f.maxAge) {
              var j = f.maxAge - 0;
              if (isNaN(j) || !isFinite(j)) throw TypeError("option maxAge is invalid");
              i += "; Max-Age=" + Math.floor(j);
            }
            if (f.domain) {
              if (!e.test(f.domain)) throw TypeError("option domain is invalid");
              i += "; Domain=" + f.domain;
            }
            if (f.path) {
              if (!e.test(f.path)) throw TypeError("option path is invalid");
              i += "; Path=" + f.path;
            }
            if (f.expires) {
              if ("function" != typeof f.expires.toUTCString) throw TypeError("option expires is invalid");
              i += "; Expires=" + f.expires.toUTCString();
            }
            if (f.httpOnly && (i += "; HttpOnly"), f.secure && (i += "; Secure"), f.sameSite) switch ("string" == typeof f.sameSite ? f.sameSite.toLowerCase() : f.sameSite) {
              case true:
              case "strict":
                i += "; SameSite=Strict";
                break;
              case "lax":
                i += "; SameSite=Lax";
                break;
              case "none":
                i += "; SameSite=None";
                break;
              default:
                throw TypeError("option sameSite is invalid");
            }
            return i;
          };
          var a2 = decodeURIComponent, c = encodeURIComponent, d = /; */, e = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
        })(), a.exports = b;
      })();
    }, 617: function(a, b, c) {
      "use strict";
      var d = this && this.__importDefault || function(a2) {
        return a2 && a2.__esModule ? a2 : { default: a2 };
      };
      Object.defineProperty(b, "__esModule", { value: true });
      let e = d(c(902)), f = d(c(549));
      class g {
        constructor(a2, { headers: b2 = {}, schema: c2, fetch: d2 } = {}) {
          this.url = a2, this.headers = new Headers(b2), this.schemaName = c2, this.fetch = d2;
        }
        from(a2) {
          let b2 = new URL(`${this.url}/${a2}`);
          return new e.default(b2, { headers: new Headers(this.headers), schema: this.schemaName, fetch: this.fetch });
        }
        schema(a2) {
          return new g(this.url, { headers: this.headers, schema: a2, fetch: this.fetch });
        }
        rpc(a2, b2 = {}, { head: c2 = false, get: d2 = false, count: e2 } = {}) {
          var g2;
          let h, i, j = new URL(`${this.url}/rpc/${a2}`);
          c2 || d2 ? (h = c2 ? "HEAD" : "GET", Object.entries(b2).filter(([a3, b3]) => void 0 !== b3).map(([a3, b3]) => [a3, Array.isArray(b3) ? `{${b3.join(",")}}` : `${b3}`]).forEach(([a3, b3]) => {
            j.searchParams.append(a3, b3);
          })) : (h = "POST", i = b2);
          let k = new Headers(this.headers);
          return e2 && k.set("Prefer", `count=${e2}`), new f.default({ method: h, url: j, headers: k, schema: this.schemaName, body: i, fetch: null != (g2 = this.fetch) ? g2 : fetch });
        }
      }
      b.default = g;
    }, 656: (a, b, c) => {
      "use strict";
      c.r(b), c.d(b, { BrowserCookieAuthStorageAdapter: () => bS, CookieAuthStorageAdapter: () => bR, DEFAULT_COOKIE_OPTIONS: () => bP, createSupabaseClient: () => bT, isBrowser: () => bO, parseCookies: () => bU, parseSupabaseCookie: () => bM, serializeCookie: () => bV, stringifySupabaseSession: () => bN }), new TextEncoder();
      let d = new TextDecoder();
      class e extends Error {
        constructor(a10, b2 = "FunctionsError", c2) {
          super(a10), this.name = b2, this.context = c2;
        }
      }
      class f extends e {
        constructor(a10) {
          super("Failed to send a request to the Edge Function", "FunctionsFetchError", a10);
        }
      }
      class g extends e {
        constructor(a10) {
          super("Relay Error invoking the Edge Function", "FunctionsRelayError", a10);
        }
      }
      class h extends e {
        constructor(a10) {
          super("Edge Function returned a non-2xx status code", "FunctionsHttpError", a10);
        }
      }
      !function(a10) {
        a10.Any = "any", a10.ApNortheast1 = "ap-northeast-1", a10.ApNortheast2 = "ap-northeast-2", a10.ApSouth1 = "ap-south-1", a10.ApSoutheast1 = "ap-southeast-1", a10.ApSoutheast2 = "ap-southeast-2", a10.CaCentral1 = "ca-central-1", a10.EuCentral1 = "eu-central-1", a10.EuWest1 = "eu-west-1", a10.EuWest2 = "eu-west-2", a10.EuWest3 = "eu-west-3", a10.SaEast1 = "sa-east-1", a10.UsEast1 = "us-east-1", a10.UsWest1 = "us-west-1", a10.UsWest2 = "us-west-2";
      }(Q || (Q = {}));
      class i {
        constructor(a10, { headers: b2 = {}, customFetch: d2, region: e2 = Q.Any } = {}) {
          this.url = a10, this.headers = b2, this.region = e2, this.fetch = ((a11) => {
            let b3;
            return b3 = a11 || ("undefined" == typeof fetch ? (...a12) => Promise.resolve().then(c.bind(c, 411)).then(({ default: b4 }) => b4(...a12)) : fetch), (...a12) => b3(...a12);
          })(d2);
        }
        setAuth(a10) {
          this.headers.Authorization = `Bearer ${a10}`;
        }
        invoke(a10, b2 = {}) {
          var c2, d2, e2, i2, j2;
          return d2 = this, e2 = void 0, i2 = void 0, j2 = function* () {
            try {
              let d3, { headers: e3, method: i3, body: j3 } = b2, k2 = {}, { region: l2 } = b2;
              l2 || (l2 = this.region);
              let m2 = new URL(`${this.url}/${a10}`);
              l2 && "any" !== l2 && (k2["x-region"] = l2, m2.searchParams.set("forceFunctionRegion", l2)), j3 && (e3 && !Object.prototype.hasOwnProperty.call(e3, "Content-Type") || !e3) && ("undefined" != typeof Blob && j3 instanceof Blob || j3 instanceof ArrayBuffer ? (k2["Content-Type"] = "application/octet-stream", d3 = j3) : "string" == typeof j3 ? (k2["Content-Type"] = "text/plain", d3 = j3) : "undefined" != typeof FormData && j3 instanceof FormData ? d3 = j3 : (k2["Content-Type"] = "application/json", d3 = JSON.stringify(j3)));
              let n2 = yield this.fetch(m2.toString(), { method: i3 || "POST", headers: Object.assign(Object.assign(Object.assign({}, k2), this.headers), e3), body: d3 }).catch((a11) => {
                throw new f(a11);
              }), o2 = n2.headers.get("x-relay-error");
              if (o2 && "true" === o2) throw new g(n2);
              if (!n2.ok) throw new h(n2);
              let p2 = (null != (c2 = n2.headers.get("Content-Type")) ? c2 : "text/plain").split(";")[0].trim();
              return { data: "application/json" === p2 ? yield n2.json() : "application/octet-stream" === p2 ? yield n2.blob() : "text/event-stream" === p2 ? n2 : "multipart/form-data" === p2 ? yield n2.formData() : yield n2.text(), error: null, response: n2 };
            } catch (a11) {
              return { data: null, error: a11, response: a11 instanceof h || a11 instanceof g ? a11.context : void 0 };
            }
          }, new (i2 || (i2 = Promise))(function(a11, b3) {
            function c3(a12) {
              try {
                g2(j2.next(a12));
              } catch (a13) {
                b3(a13);
              }
            }
            function f2(a12) {
              try {
                g2(j2.throw(a12));
              } catch (a13) {
                b3(a13);
              }
            }
            function g2(b4) {
              var d3;
              b4.done ? a11(b4.value) : ((d3 = b4.value) instanceof i2 ? d3 : new i2(function(a12) {
                a12(d3);
              })).then(c3, f2);
            }
            g2((j2 = j2.apply(d2, e2 || [])).next());
          });
        }
      }
      let { PostgrestClient: j, PostgrestQueryBuilder: k, PostgrestFilterBuilder: l, PostgrestTransformBuilder: m, PostgrestBuilder: n, PostgrestError: o } = c(747);
      class p {
        static detectEnvironment() {
          var a10;
          if ("undefined" != typeof WebSocket) return { type: "native", constructor: WebSocket };
          if ("undefined" != typeof globalThis && void 0 !== globalThis.WebSocket) return { type: "native", constructor: globalThis.WebSocket };
          if (void 0 !== c.g && void 0 !== c.g.WebSocket) return { type: "native", constructor: c.g.WebSocket };
          if ("undefined" != typeof globalThis && void 0 !== globalThis.WebSocketPair && void 0 === globalThis.WebSocket) return { type: "cloudflare", error: "Cloudflare Workers detected. WebSocket clients are not supported in Cloudflare Workers.", workaround: "Use Cloudflare Workers WebSocket API for server-side WebSocket handling, or deploy to a different runtime." };
          if ("undefined" != typeof globalThis && globalThis.EdgeRuntime || "undefined" != typeof navigator && (null == (a10 = navigator.userAgent) ? void 0 : a10.includes("Vercel-Edge"))) return { type: "unsupported", error: "Edge runtime detected (Vercel Edge/Netlify Edge). WebSockets are not supported in edge functions.", workaround: "Use serverless functions or a different deployment target for WebSocket functionality." };
          if ("undefined" != typeof process) {
            let a11 = process.versions;
            if (a11 && a11.node) {
              let b2 = parseInt(a11.node.replace(/^v/, "").split(".")[0]);
              return b2 >= 22 ? void 0 !== globalThis.WebSocket ? { type: "native", constructor: globalThis.WebSocket } : { type: "unsupported", error: `Node.js ${b2} detected but native WebSocket not found.`, workaround: "Provide a WebSocket implementation via the transport option." } : { type: "unsupported", error: `Node.js ${b2} detected without native WebSocket support.`, workaround: 'For Node.js < 22, install "ws" package and provide it via the transport option:\nimport ws from "ws"\nnew RealtimeClient(url, { transport: ws })' };
            }
          }
          return { type: "unsupported", error: "Unknown JavaScript runtime without WebSocket support.", workaround: "Ensure you're running in a supported environment (browser, Node.js, Deno) or provide a custom WebSocket implementation." };
        }
        static getWebSocketConstructor() {
          let a10 = this.detectEnvironment();
          if (a10.constructor) return a10.constructor;
          let b2 = a10.error || "WebSocket not supported in this environment.";
          throw a10.workaround && (b2 += `

Suggested solution: ${a10.workaround}`), Error(b2);
        }
        static createWebSocket(a10, b2) {
          return new (this.getWebSocketConstructor())(a10, b2);
        }
        static isWebSocketSupported() {
          try {
            let a10 = this.detectEnvironment();
            return "native" === a10.type || "ws" === a10.type;
          } catch (a10) {
            return false;
          }
        }
      }
      !function(a10) {
        a10[a10.connecting = 0] = "connecting", a10[a10.open = 1] = "open", a10[a10.closing = 2] = "closing", a10[a10.closed = 3] = "closed";
      }(R || (R = {})), function(a10) {
        a10.closed = "closed", a10.errored = "errored", a10.joined = "joined", a10.joining = "joining", a10.leaving = "leaving";
      }(S || (S = {})), function(a10) {
        a10.close = "phx_close", a10.error = "phx_error", a10.join = "phx_join", a10.reply = "phx_reply", a10.leave = "phx_leave", a10.access_token = "access_token";
      }(T || (T = {})), (U || (U = {})).websocket = "websocket", function(a10) {
        a10.Connecting = "connecting", a10.Open = "open", a10.Closing = "closing", a10.Closed = "closed";
      }(V || (V = {}));
      class q {
        constructor() {
          this.HEADER_LENGTH = 1;
        }
        decode(a10, b2) {
          return a10.constructor === ArrayBuffer ? b2(this._binaryDecode(a10)) : "string" == typeof a10 ? b2(JSON.parse(a10)) : b2({});
        }
        _binaryDecode(a10) {
          let b2 = new DataView(a10), c2 = new TextDecoder();
          return this._decodeBroadcast(a10, b2, c2);
        }
        _decodeBroadcast(a10, b2, c2) {
          let d2 = b2.getUint8(1), e2 = b2.getUint8(2), f2 = this.HEADER_LENGTH + 2, g2 = c2.decode(a10.slice(f2, f2 + d2));
          f2 += d2;
          let h2 = c2.decode(a10.slice(f2, f2 + e2));
          return f2 += e2, { ref: null, topic: g2, event: h2, payload: JSON.parse(c2.decode(a10.slice(f2, a10.byteLength))) };
        }
      }
      class r {
        constructor(a10, b2) {
          this.callback = a10, this.timerCalc = b2, this.timer = void 0, this.tries = 0, this.callback = a10, this.timerCalc = b2;
        }
        reset() {
          this.tries = 0, clearTimeout(this.timer), this.timer = void 0;
        }
        scheduleTimeout() {
          clearTimeout(this.timer), this.timer = setTimeout(() => {
            this.tries = this.tries + 1, this.callback();
          }, this.timerCalc(this.tries + 1));
        }
      }
      !function(a10) {
        a10.abstime = "abstime", a10.bool = "bool", a10.date = "date", a10.daterange = "daterange", a10.float4 = "float4", a10.float8 = "float8", a10.int2 = "int2", a10.int4 = "int4", a10.int4range = "int4range", a10.int8 = "int8", a10.int8range = "int8range", a10.json = "json", a10.jsonb = "jsonb", a10.money = "money", a10.numeric = "numeric", a10.oid = "oid", a10.reltime = "reltime", a10.text = "text", a10.time = "time", a10.timestamp = "timestamp", a10.timestamptz = "timestamptz", a10.timetz = "timetz", a10.tsrange = "tsrange", a10.tstzrange = "tstzrange";
      }(W || (W = {}));
      let s = (a10, b2, c2 = {}) => {
        var d2;
        let e2 = null != (d2 = c2.skipTypes) ? d2 : [];
        return Object.keys(b2).reduce((c3, d3) => (c3[d3] = t(d3, a10, b2, e2), c3), {});
      }, t = (a10, b2, c2, d2) => {
        let e2 = b2.find((b3) => b3.name === a10), f2 = null == e2 ? void 0 : e2.type, g2 = c2[a10];
        return f2 && !d2.includes(f2) ? u(f2, g2) : v(g2);
      }, u = (a10, b2) => {
        if ("_" === a10.charAt(0)) return z(b2, a10.slice(1, a10.length));
        switch (a10) {
          case W.bool:
            return w(b2);
          case W.float4:
          case W.float8:
          case W.int2:
          case W.int4:
          case W.int8:
          case W.numeric:
          case W.oid:
            return x(b2);
          case W.json:
          case W.jsonb:
            return y(b2);
          case W.timestamp:
            return A(b2);
          case W.abstime:
          case W.date:
          case W.daterange:
          case W.int4range:
          case W.int8range:
          case W.money:
          case W.reltime:
          case W.text:
          case W.time:
          case W.timestamptz:
          case W.timetz:
          case W.tsrange:
          case W.tstzrange:
          default:
            return v(b2);
        }
      }, v = (a10) => a10, w = (a10) => {
        switch (a10) {
          case "t":
            return true;
          case "f":
            return false;
          default:
            return a10;
        }
      }, x = (a10) => {
        if ("string" == typeof a10) {
          let b2 = parseFloat(a10);
          if (!Number.isNaN(b2)) return b2;
        }
        return a10;
      }, y = (a10) => {
        if ("string" == typeof a10) try {
          return JSON.parse(a10);
        } catch (a11) {
          console.log(`JSON parse error: ${a11}`);
        }
        return a10;
      }, z = (a10, b2) => {
        if ("string" != typeof a10) return a10;
        let c2 = a10.length - 1, d2 = a10[c2];
        if ("{" === a10[0] && "}" === d2) {
          let d3, e2 = a10.slice(1, c2);
          try {
            d3 = JSON.parse("[" + e2 + "]");
          } catch (a11) {
            d3 = e2 ? e2.split(",") : [];
          }
          return d3.map((a11) => u(b2, a11));
        }
        return a10;
      }, A = (a10) => "string" == typeof a10 ? a10.replace(" ", "T") : a10, B = (a10) => {
        let b2 = a10;
        return (b2 = (b2 = b2.replace(/^ws/i, "http")).replace(/(\/socket\/websocket|\/socket|\/websocket)\/?$/i, "")).replace(/\/+$/, "") + "/api/broadcast";
      };
      class C {
        constructor(a10, b2, c2 = {}, d2 = 1e4) {
          this.channel = a10, this.event = b2, this.payload = c2, this.timeout = d2, this.sent = false, this.timeoutTimer = void 0, this.ref = "", this.receivedResp = null, this.recHooks = [], this.refEvent = null;
        }
        resend(a10) {
          this.timeout = a10, this._cancelRefEvent(), this.ref = "", this.refEvent = null, this.receivedResp = null, this.sent = false, this.send();
        }
        send() {
          this._hasReceived("timeout") || (this.startTimeout(), this.sent = true, this.channel.socket.push({ topic: this.channel.topic, event: this.event, payload: this.payload, ref: this.ref, join_ref: this.channel._joinRef() }));
        }
        updatePayload(a10) {
          this.payload = Object.assign(Object.assign({}, this.payload), a10);
        }
        receive(a10, b2) {
          var c2;
          return this._hasReceived(a10) && b2(null == (c2 = this.receivedResp) ? void 0 : c2.response), this.recHooks.push({ status: a10, callback: b2 }), this;
        }
        startTimeout() {
          if (this.timeoutTimer) return;
          this.ref = this.channel.socket._makeRef(), this.refEvent = this.channel._replyEventName(this.ref);
          let a10 = (a11) => {
            this._cancelRefEvent(), this._cancelTimeout(), this.receivedResp = a11, this._matchReceive(a11);
          };
          this.channel._on(this.refEvent, {}, a10), this.timeoutTimer = setTimeout(() => {
            this.trigger("timeout", {});
          }, this.timeout);
        }
        trigger(a10, b2) {
          this.refEvent && this.channel._trigger(this.refEvent, { status: a10, response: b2 });
        }
        destroy() {
          this._cancelRefEvent(), this._cancelTimeout();
        }
        _cancelRefEvent() {
          this.refEvent && this.channel._off(this.refEvent, {});
        }
        _cancelTimeout() {
          clearTimeout(this.timeoutTimer), this.timeoutTimer = void 0;
        }
        _matchReceive({ status: a10, response: b2 }) {
          this.recHooks.filter((b3) => b3.status === a10).forEach((a11) => a11.callback(b2));
        }
        _hasReceived(a10) {
          return this.receivedResp && this.receivedResp.status === a10;
        }
      }
      !function(a10) {
        a10.SYNC = "sync", a10.JOIN = "join", a10.LEAVE = "leave";
      }(X || (X = {}));
      class D {
        constructor(a10, b2) {
          this.channel = a10, this.state = {}, this.pendingDiffs = [], this.joinRef = null, this.enabled = false, this.caller = { onJoin: () => {
          }, onLeave: () => {
          }, onSync: () => {
          } };
          let c2 = (null == b2 ? void 0 : b2.events) || { state: "presence_state", diff: "presence_diff" };
          this.channel._on(c2.state, {}, (a11) => {
            let { onJoin: b3, onLeave: c3, onSync: d2 } = this.caller;
            this.joinRef = this.channel._joinRef(), this.state = D.syncState(this.state, a11, b3, c3), this.pendingDiffs.forEach((a12) => {
              this.state = D.syncDiff(this.state, a12, b3, c3);
            }), this.pendingDiffs = [], d2();
          }), this.channel._on(c2.diff, {}, (a11) => {
            let { onJoin: b3, onLeave: c3, onSync: d2 } = this.caller;
            this.inPendingSyncState() ? this.pendingDiffs.push(a11) : (this.state = D.syncDiff(this.state, a11, b3, c3), d2());
          }), this.onJoin((a11, b3, c3) => {
            this.channel._trigger("presence", { event: "join", key: a11, currentPresences: b3, newPresences: c3 });
          }), this.onLeave((a11, b3, c3) => {
            this.channel._trigger("presence", { event: "leave", key: a11, currentPresences: b3, leftPresences: c3 });
          }), this.onSync(() => {
            this.channel._trigger("presence", { event: "sync" });
          });
        }
        static syncState(a10, b2, c2, d2) {
          let e2 = this.cloneDeep(a10), f2 = this.transformState(b2), g2 = {}, h2 = {};
          return this.map(e2, (a11, b3) => {
            f2[a11] || (h2[a11] = b3);
          }), this.map(f2, (a11, b3) => {
            let c3 = e2[a11];
            if (c3) {
              let d3 = b3.map((a12) => a12.presence_ref), e3 = c3.map((a12) => a12.presence_ref), f3 = b3.filter((a12) => 0 > e3.indexOf(a12.presence_ref)), i2 = c3.filter((a12) => 0 > d3.indexOf(a12.presence_ref));
              f3.length > 0 && (g2[a11] = f3), i2.length > 0 && (h2[a11] = i2);
            } else g2[a11] = b3;
          }), this.syncDiff(e2, { joins: g2, leaves: h2 }, c2, d2);
        }
        static syncDiff(a10, b2, c2, d2) {
          let { joins: e2, leaves: f2 } = { joins: this.transformState(b2.joins), leaves: this.transformState(b2.leaves) };
          return c2 || (c2 = () => {
          }), d2 || (d2 = () => {
          }), this.map(e2, (b3, d3) => {
            var e3;
            let f3 = null != (e3 = a10[b3]) ? e3 : [];
            if (a10[b3] = this.cloneDeep(d3), f3.length > 0) {
              let c3 = a10[b3].map((a11) => a11.presence_ref), d4 = f3.filter((a11) => 0 > c3.indexOf(a11.presence_ref));
              a10[b3].unshift(...d4);
            }
            c2(b3, f3, d3);
          }), this.map(f2, (b3, c3) => {
            let e3 = a10[b3];
            if (!e3) return;
            let f3 = c3.map((a11) => a11.presence_ref);
            e3 = e3.filter((a11) => 0 > f3.indexOf(a11.presence_ref)), a10[b3] = e3, d2(b3, e3, c3), 0 === e3.length && delete a10[b3];
          }), a10;
        }
        static map(a10, b2) {
          return Object.getOwnPropertyNames(a10).map((c2) => b2(c2, a10[c2]));
        }
        static transformState(a10) {
          return Object.getOwnPropertyNames(a10 = this.cloneDeep(a10)).reduce((b2, c2) => {
            let d2 = a10[c2];
            return "metas" in d2 ? b2[c2] = d2.metas.map((a11) => (a11.presence_ref = a11.phx_ref, delete a11.phx_ref, delete a11.phx_ref_prev, a11)) : b2[c2] = d2, b2;
          }, {});
        }
        static cloneDeep(a10) {
          return JSON.parse(JSON.stringify(a10));
        }
        onJoin(a10) {
          this.caller.onJoin = a10;
        }
        onLeave(a10) {
          this.caller.onLeave = a10;
        }
        onSync(a10) {
          this.caller.onSync = a10;
        }
        inPendingSyncState() {
          return !this.joinRef || this.joinRef !== this.channel._joinRef();
        }
      }
      !function(a10) {
        a10.ALL = "*", a10.INSERT = "INSERT", a10.UPDATE = "UPDATE", a10.DELETE = "DELETE";
      }(Y || (Y = {})), function(a10) {
        a10.BROADCAST = "broadcast", a10.PRESENCE = "presence", a10.POSTGRES_CHANGES = "postgres_changes", a10.SYSTEM = "system";
      }(Z || (Z = {})), function(a10) {
        a10.SUBSCRIBED = "SUBSCRIBED", a10.TIMED_OUT = "TIMED_OUT", a10.CLOSED = "CLOSED", a10.CHANNEL_ERROR = "CHANNEL_ERROR";
      }($ || ($ = {}));
      class E {
        constructor(a10, b2 = { config: {} }, c2) {
          this.topic = a10, this.params = b2, this.socket = c2, this.bindings = {}, this.state = S.closed, this.joinedOnce = false, this.pushBuffer = [], this.subTopic = a10.replace(/^realtime:/i, ""), this.params.config = Object.assign({ broadcast: { ack: false, self: false }, presence: { key: "", enabled: false }, private: false }, b2.config), this.timeout = this.socket.timeout, this.joinPush = new C(this, T.join, this.params, this.timeout), this.rejoinTimer = new r(() => this._rejoinUntilConnected(), this.socket.reconnectAfterMs), this.joinPush.receive("ok", () => {
            this.state = S.joined, this.rejoinTimer.reset(), this.pushBuffer.forEach((a11) => a11.send()), this.pushBuffer = [];
          }), this._onClose(() => {
            this.rejoinTimer.reset(), this.socket.log("channel", `close ${this.topic} ${this._joinRef()}`), this.state = S.closed, this.socket._remove(this);
          }), this._onError((a11) => {
            this._isLeaving() || this._isClosed() || (this.socket.log("channel", `error ${this.topic}`, a11), this.state = S.errored, this.rejoinTimer.scheduleTimeout());
          }), this.joinPush.receive("timeout", () => {
            this._isJoining() && (this.socket.log("channel", `timeout ${this.topic}`, this.joinPush.timeout), this.state = S.errored, this.rejoinTimer.scheduleTimeout());
          }), this.joinPush.receive("error", (a11) => {
            this._isLeaving() || this._isClosed() || (this.socket.log("channel", `error ${this.topic}`, a11), this.state = S.errored, this.rejoinTimer.scheduleTimeout());
          }), this._on(T.reply, {}, (a11, b3) => {
            this._trigger(this._replyEventName(b3), a11);
          }), this.presence = new D(this), this.broadcastEndpointURL = B(this.socket.endPoint), this.private = this.params.config.private || false;
        }
        subscribe(a10, b2 = this.timeout) {
          var c2, d2, e2;
          if (this.socket.isConnected() || this.socket.connect(), this.state == S.closed) {
            let { config: { broadcast: f2, presence: g2, private: h2 } } = this.params, i2 = null != (d2 = null == (c2 = this.bindings.postgres_changes) ? void 0 : c2.map((a11) => a11.filter)) ? d2 : [], j2 = !!this.bindings[Z.PRESENCE] && this.bindings[Z.PRESENCE].length > 0 || (null == (e2 = this.params.config.presence) ? void 0 : e2.enabled) === true, k2 = {}, l2 = { broadcast: f2, presence: Object.assign(Object.assign({}, g2), { enabled: j2 }), postgres_changes: i2, private: h2 };
            this.socket.accessTokenValue && (k2.access_token = this.socket.accessTokenValue), this._onError((b3) => null == a10 ? void 0 : a10($.CHANNEL_ERROR, b3)), this._onClose(() => null == a10 ? void 0 : a10($.CLOSED)), this.updateJoinPayload(Object.assign({ config: l2 }, k2)), this.joinedOnce = true, this._rejoin(b2), this.joinPush.receive("ok", async ({ postgres_changes: b3 }) => {
              var c3;
              if (this.socket.setAuth(), void 0 === b3) {
                null == a10 || a10($.SUBSCRIBED);
                return;
              }
              {
                let d3 = this.bindings.postgres_changes, e3 = null != (c3 = null == d3 ? void 0 : d3.length) ? c3 : 0, f3 = [];
                for (let c4 = 0; c4 < e3; c4++) {
                  let e4 = d3[c4], { filter: { event: g3, schema: h3, table: i3, filter: j3 } } = e4, k3 = b3 && b3[c4];
                  if (k3 && k3.event === g3 && k3.schema === h3 && k3.table === i3 && k3.filter === j3) f3.push(Object.assign(Object.assign({}, e4), { id: k3.id }));
                  else {
                    this.unsubscribe(), this.state = S.errored, null == a10 || a10($.CHANNEL_ERROR, Error("mismatch between server and client bindings for postgres changes"));
                    return;
                  }
                }
                this.bindings.postgres_changes = f3, a10 && a10($.SUBSCRIBED);
                return;
              }
            }).receive("error", (b3) => {
              this.state = S.errored, null == a10 || a10($.CHANNEL_ERROR, Error(JSON.stringify(Object.values(b3).join(", ") || "error")));
            }).receive("timeout", () => {
              null == a10 || a10($.TIMED_OUT);
            });
          }
          return this;
        }
        presenceState() {
          return this.presence.state;
        }
        async track(a10, b2 = {}) {
          return await this.send({ type: "presence", event: "track", payload: a10 }, b2.timeout || this.timeout);
        }
        async untrack(a10 = {}) {
          return await this.send({ type: "presence", event: "untrack" }, a10);
        }
        on(a10, b2, c2) {
          return this.state === S.joined && a10 === Z.PRESENCE && (this.socket.log("channel", `resubscribe to ${this.topic} due to change in presence callbacks on joined channel`), this.unsubscribe().then(() => this.subscribe())), this._on(a10, b2, c2);
        }
        async send(a10, b2 = {}) {
          var c2, d2;
          if (this._canPush() || "broadcast" !== a10.type) return new Promise((c3) => {
            var d3, e2, f2;
            let g2 = this._push(a10.type, a10, b2.timeout || this.timeout);
            "broadcast" !== a10.type || (null == (f2 = null == (e2 = null == (d3 = this.params) ? void 0 : d3.config) ? void 0 : e2.broadcast) ? void 0 : f2.ack) || c3("ok"), g2.receive("ok", () => c3("ok")), g2.receive("error", () => c3("error")), g2.receive("timeout", () => c3("timed out"));
          });
          {
            let { event: e2, payload: f2 } = a10, g2 = { method: "POST", headers: { Authorization: this.socket.accessTokenValue ? `Bearer ${this.socket.accessTokenValue}` : "", apikey: this.socket.apiKey ? this.socket.apiKey : "", "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ topic: this.subTopic, event: e2, payload: f2, private: this.private }] }) };
            try {
              let a11 = await this._fetchWithTimeout(this.broadcastEndpointURL, g2, null != (c2 = b2.timeout) ? c2 : this.timeout);
              return await (null == (d2 = a11.body) ? void 0 : d2.cancel()), a11.ok ? "ok" : "error";
            } catch (a11) {
              if ("AbortError" === a11.name) return "timed out";
              return "error";
            }
          }
        }
        updateJoinPayload(a10) {
          this.joinPush.updatePayload(a10);
        }
        unsubscribe(a10 = this.timeout) {
          this.state = S.leaving;
          let b2 = () => {
            this.socket.log("channel", `leave ${this.topic}`), this._trigger(T.close, "leave", this._joinRef());
          };
          this.joinPush.destroy();
          let c2 = null;
          return new Promise((d2) => {
            (c2 = new C(this, T.leave, {}, a10)).receive("ok", () => {
              b2(), d2("ok");
            }).receive("timeout", () => {
              b2(), d2("timed out");
            }).receive("error", () => {
              d2("error");
            }), c2.send(), this._canPush() || c2.trigger("ok", {});
          }).finally(() => {
            null == c2 || c2.destroy();
          });
        }
        teardown() {
          this.pushBuffer.forEach((a10) => a10.destroy()), this.pushBuffer = [], this.rejoinTimer.reset(), this.joinPush.destroy(), this.state = S.closed, this.bindings = {};
        }
        async _fetchWithTimeout(a10, b2, c2) {
          let d2 = new AbortController(), e2 = setTimeout(() => d2.abort(), c2), f2 = await this.socket.fetch(a10, Object.assign(Object.assign({}, b2), { signal: d2.signal }));
          return clearTimeout(e2), f2;
        }
        _push(a10, b2, c2 = this.timeout) {
          if (!this.joinedOnce) throw `tried to push '${a10}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
          let d2 = new C(this, a10, b2, c2);
          return this._canPush() ? d2.send() : this._addToPushBuffer(d2), d2;
        }
        _addToPushBuffer(a10) {
          if (a10.startTimeout(), this.pushBuffer.push(a10), this.pushBuffer.length > 100) {
            let a11 = this.pushBuffer.shift();
            a11 && (a11.destroy(), this.socket.log("channel", `discarded push due to buffer overflow: ${a11.event}`, a11.payload));
          }
        }
        _onMessage(a10, b2, c2) {
          return b2;
        }
        _isMember(a10) {
          return this.topic === a10;
        }
        _joinRef() {
          return this.joinPush.ref;
        }
        _trigger(a10, b2, c2) {
          var d2, e2;
          let f2 = a10.toLocaleLowerCase(), { close: g2, error: h2, leave: i2, join: j2 } = T;
          if (c2 && [g2, h2, i2, j2].indexOf(f2) >= 0 && c2 !== this._joinRef()) return;
          let k2 = this._onMessage(f2, b2, c2);
          if (b2 && !k2) throw "channel onMessage callbacks must return the payload, modified or unmodified";
          ["insert", "update", "delete"].includes(f2) ? null == (d2 = this.bindings.postgres_changes) || d2.filter((a11) => {
            var b3, c3, d3;
            return (null == (b3 = a11.filter) ? void 0 : b3.event) === "*" || (null == (d3 = null == (c3 = a11.filter) ? void 0 : c3.event) ? void 0 : d3.toLocaleLowerCase()) === f2;
          }).map((a11) => a11.callback(k2, c2)) : null == (e2 = this.bindings[f2]) || e2.filter((a11) => {
            var c3, d3, e3, g3, h3, i3;
            if (!["broadcast", "presence", "postgres_changes"].includes(f2)) return a11.type.toLocaleLowerCase() === f2;
            if ("id" in a11) {
              let f3 = a11.id, g4 = null == (c3 = a11.filter) ? void 0 : c3.event;
              return f3 && (null == (d3 = b2.ids) ? void 0 : d3.includes(f3)) && ("*" === g4 || (null == g4 ? void 0 : g4.toLocaleLowerCase()) === (null == (e3 = b2.data) ? void 0 : e3.type.toLocaleLowerCase()));
            }
            {
              let c4 = null == (h3 = null == (g3 = null == a11 ? void 0 : a11.filter) ? void 0 : g3.event) ? void 0 : h3.toLocaleLowerCase();
              return "*" === c4 || c4 === (null == (i3 = null == b2 ? void 0 : b2.event) ? void 0 : i3.toLocaleLowerCase());
            }
          }).map((a11) => {
            if ("object" == typeof k2 && "ids" in k2) {
              let a12 = k2.data, { schema: b3, table: c3, commit_timestamp: d3, type: e3, errors: f3 } = a12;
              k2 = Object.assign(Object.assign({}, { schema: b3, table: c3, commit_timestamp: d3, eventType: e3, new: {}, old: {}, errors: f3 }), this._getPayloadRecords(a12));
            }
            a11.callback(k2, c2);
          });
        }
        _isClosed() {
          return this.state === S.closed;
        }
        _isJoined() {
          return this.state === S.joined;
        }
        _isJoining() {
          return this.state === S.joining;
        }
        _isLeaving() {
          return this.state === S.leaving;
        }
        _replyEventName(a10) {
          return `chan_reply_${a10}`;
        }
        _on(a10, b2, c2) {
          let d2 = a10.toLocaleLowerCase(), e2 = { type: d2, filter: b2, callback: c2 };
          return this.bindings[d2] ? this.bindings[d2].push(e2) : this.bindings[d2] = [e2], this;
        }
        _off(a10, b2) {
          let c2 = a10.toLocaleLowerCase();
          return this.bindings[c2] && (this.bindings[c2] = this.bindings[c2].filter((a11) => {
            var d2;
            return !((null == (d2 = a11.type) ? void 0 : d2.toLocaleLowerCase()) === c2 && E.isEqual(a11.filter, b2));
          })), this;
        }
        static isEqual(a10, b2) {
          if (Object.keys(a10).length !== Object.keys(b2).length) return false;
          for (let c2 in a10) if (a10[c2] !== b2[c2]) return false;
          return true;
        }
        _rejoinUntilConnected() {
          this.rejoinTimer.scheduleTimeout(), this.socket.isConnected() && this._rejoin();
        }
        _onClose(a10) {
          this._on(T.close, {}, a10);
        }
        _onError(a10) {
          this._on(T.error, {}, (b2) => a10(b2));
        }
        _canPush() {
          return this.socket.isConnected() && this._isJoined();
        }
        _rejoin(a10 = this.timeout) {
          this._isLeaving() || (this.socket._leaveOpenTopic(this.topic), this.state = S.joining, this.joinPush.resend(a10));
        }
        _getPayloadRecords(a10) {
          let b2 = { new: {}, old: {} };
          return ("INSERT" === a10.type || "UPDATE" === a10.type) && (b2.new = s(a10.columns, a10.record)), ("UPDATE" === a10.type || "DELETE" === a10.type) && (b2.old = s(a10.columns, a10.old_record)), b2;
        }
      }
      let F = () => {
      }, G = { HEARTBEAT_INTERVAL: 25e3, RECONNECT_DELAY: 10, HEARTBEAT_TIMEOUT_FALLBACK: 100 }, H = [1e3, 2e3, 5e3, 1e4], I = `
  addEventListener("message", (e) => {
    if (e.data.event === "start") {
      setInterval(() => postMessage({ event: "keepAlive" }), e.data.interval);
    }
  });`;
      class J {
        constructor(a10, b2) {
          var d2;
          if (this.accessTokenValue = null, this.apiKey = null, this.channels = [], this.endPoint = "", this.httpEndpoint = "", this.headers = {}, this.params = {}, this.timeout = 1e4, this.transport = null, this.heartbeatIntervalMs = G.HEARTBEAT_INTERVAL, this.heartbeatTimer = void 0, this.pendingHeartbeatRef = null, this.heartbeatCallback = F, this.ref = 0, this.reconnectTimer = null, this.logger = F, this.conn = null, this.sendBuffer = [], this.serializer = new q(), this.stateChangeCallbacks = { open: [], close: [], error: [], message: [] }, this.accessToken = null, this._connectionState = "disconnected", this._wasManualDisconnect = false, this._authPromise = null, this._resolveFetch = (a11) => {
            let b3;
            return b3 = a11 || ("undefined" == typeof fetch ? (...a12) => Promise.resolve().then(c.bind(c, 411)).then(({ default: b4 }) => b4(...a12)).catch((a13) => {
              throw Error(`Failed to load @supabase/node-fetch: ${a13.message}. This is required for HTTP requests in Node.js environments without native fetch.`);
            }) : fetch), (...a12) => b3(...a12);
          }, !(null == (d2 = null == b2 ? void 0 : b2.params) ? void 0 : d2.apikey)) throw Error("API key is required to connect to Realtime");
          this.apiKey = b2.params.apikey, this.endPoint = `${a10}/${U.websocket}`, this.httpEndpoint = B(a10), this._initializeOptions(b2), this._setupReconnectionTimer(), this.fetch = this._resolveFetch(null == b2 ? void 0 : b2.fetch);
        }
        connect() {
          if (!(this.isConnecting() || this.isDisconnecting() || null !== this.conn && this.isConnected())) {
            if (this._setConnectionState("connecting"), this._setAuthSafely("connect"), this.transport) this.conn = new this.transport(this.endpointURL());
            else try {
              this.conn = p.createWebSocket(this.endpointURL());
            } catch (b2) {
              this._setConnectionState("disconnected");
              let a10 = b2.message;
              if (a10.includes("Node.js")) throw Error(`${a10}

To use Realtime in Node.js, you need to provide a WebSocket implementation:

Option 1: Use Node.js 22+ which has native WebSocket support
Option 2: Install and provide the "ws" package:

  npm install ws

  import ws from "ws"
  const client = new RealtimeClient(url, {
    ...options,
    transport: ws
  })`);
              throw Error(`WebSocket not available: ${a10}`);
            }
            this._setupConnectionHandlers();
          }
        }
        endpointURL() {
          return this._appendParams(this.endPoint, Object.assign({}, this.params, { vsn: "1.0.0" }));
        }
        disconnect(a10, b2) {
          if (!this.isDisconnecting()) if (this._setConnectionState("disconnecting", true), this.conn) {
            let c2 = setTimeout(() => {
              this._setConnectionState("disconnected");
            }, 100);
            this.conn.onclose = () => {
              clearTimeout(c2), this._setConnectionState("disconnected");
            }, a10 ? this.conn.close(a10, null != b2 ? b2 : "") : this.conn.close(), this._teardownConnection();
          } else this._setConnectionState("disconnected");
        }
        getChannels() {
          return this.channels;
        }
        async removeChannel(a10) {
          let b2 = await a10.unsubscribe();
          return 0 === this.channels.length && this.disconnect(), b2;
        }
        async removeAllChannels() {
          let a10 = await Promise.all(this.channels.map((a11) => a11.unsubscribe()));
          return this.channels = [], this.disconnect(), a10;
        }
        log(a10, b2, c2) {
          this.logger(a10, b2, c2);
        }
        connectionState() {
          switch (this.conn && this.conn.readyState) {
            case R.connecting:
              return V.Connecting;
            case R.open:
              return V.Open;
            case R.closing:
              return V.Closing;
            default:
              return V.Closed;
          }
        }
        isConnected() {
          return this.connectionState() === V.Open;
        }
        isConnecting() {
          return "connecting" === this._connectionState;
        }
        isDisconnecting() {
          return "disconnecting" === this._connectionState;
        }
        channel(a10, b2 = { config: {} }) {
          let c2 = `realtime:${a10}`, d2 = this.getChannels().find((a11) => a11.topic === c2);
          if (d2) return d2;
          {
            let c3 = new E(`realtime:${a10}`, b2, this);
            return this.channels.push(c3), c3;
          }
        }
        push(a10) {
          let { topic: b2, event: c2, payload: d2, ref: e2 } = a10, f2 = () => {
            this.encode(a10, (a11) => {
              var b3;
              null == (b3 = this.conn) || b3.send(a11);
            });
          };
          this.log("push", `${b2} ${c2} (${e2})`, d2), this.isConnected() ? f2() : this.sendBuffer.push(f2);
        }
        async setAuth(a10 = null) {
          this._authPromise = this._performAuth(a10);
          try {
            await this._authPromise;
          } finally {
            this._authPromise = null;
          }
        }
        async sendHeartbeat() {
          var a10;
          if (!this.isConnected()) {
            try {
              this.heartbeatCallback("disconnected");
            } catch (a11) {
              this.log("error", "error in heartbeat callback", a11);
            }
            return;
          }
          if (this.pendingHeartbeatRef) {
            this.pendingHeartbeatRef = null, this.log("transport", "heartbeat timeout. Attempting to re-establish connection");
            try {
              this.heartbeatCallback("timeout");
            } catch (a11) {
              this.log("error", "error in heartbeat callback", a11);
            }
            this._wasManualDisconnect = false, null == (a10 = this.conn) || a10.close(1e3, "heartbeat timeout"), setTimeout(() => {
              var a11;
              this.isConnected() || null == (a11 = this.reconnectTimer) || a11.scheduleTimeout();
            }, G.HEARTBEAT_TIMEOUT_FALLBACK);
            return;
          }
          this.pendingHeartbeatRef = this._makeRef(), this.push({ topic: "phoenix", event: "heartbeat", payload: {}, ref: this.pendingHeartbeatRef });
          try {
            this.heartbeatCallback("sent");
          } catch (a11) {
            this.log("error", "error in heartbeat callback", a11);
          }
          this._setAuthSafely("heartbeat");
        }
        onHeartbeat(a10) {
          this.heartbeatCallback = a10;
        }
        flushSendBuffer() {
          this.isConnected() && this.sendBuffer.length > 0 && (this.sendBuffer.forEach((a10) => a10()), this.sendBuffer = []);
        }
        _makeRef() {
          let a10 = this.ref + 1;
          return a10 === this.ref ? this.ref = 0 : this.ref = a10, this.ref.toString();
        }
        _leaveOpenTopic(a10) {
          let b2 = this.channels.find((b3) => b3.topic === a10 && (b3._isJoined() || b3._isJoining()));
          b2 && (this.log("transport", `leaving duplicate topic "${a10}"`), b2.unsubscribe());
        }
        _remove(a10) {
          this.channels = this.channels.filter((b2) => b2.topic !== a10.topic);
        }
        _onConnMessage(a10) {
          this.decode(a10.data, (a11) => {
            if ("phoenix" === a11.topic && "phx_reply" === a11.event) try {
              this.heartbeatCallback("ok" === a11.payload.status ? "ok" : "error");
            } catch (a12) {
              this.log("error", "error in heartbeat callback", a12);
            }
            a11.ref && a11.ref === this.pendingHeartbeatRef && (this.pendingHeartbeatRef = null);
            let { topic: b2, event: c2, payload: d2, ref: e2 } = a11, f2 = e2 ? `(${e2})` : "", g2 = d2.status || "";
            this.log("receive", `${g2} ${b2} ${c2} ${f2}`.trim(), d2), this.channels.filter((a12) => a12._isMember(b2)).forEach((a12) => a12._trigger(c2, d2, e2)), this._triggerStateCallbacks("message", a11);
          });
        }
        _clearTimer(a10) {
          var b2;
          "heartbeat" === a10 && this.heartbeatTimer ? (clearInterval(this.heartbeatTimer), this.heartbeatTimer = void 0) : "reconnect" === a10 && (null == (b2 = this.reconnectTimer) || b2.reset());
        }
        _clearAllTimers() {
          this._clearTimer("heartbeat"), this._clearTimer("reconnect");
        }
        _setupConnectionHandlers() {
          this.conn && ("binaryType" in this.conn && (this.conn.binaryType = "arraybuffer"), this.conn.onopen = () => this._onConnOpen(), this.conn.onerror = (a10) => this._onConnError(a10), this.conn.onmessage = (a10) => this._onConnMessage(a10), this.conn.onclose = (a10) => this._onConnClose(a10));
        }
        _teardownConnection() {
          this.conn && (this.conn.onopen = null, this.conn.onerror = null, this.conn.onmessage = null, this.conn.onclose = null, this.conn = null), this._clearAllTimers(), this.channels.forEach((a10) => a10.teardown());
        }
        _onConnOpen() {
          this._setConnectionState("connected"), this.log("transport", `connected to ${this.endpointURL()}`), this.flushSendBuffer(), this._clearTimer("reconnect"), this.worker ? this.workerRef || this._startWorkerHeartbeat() : this._startHeartbeat(), this._triggerStateCallbacks("open");
        }
        _startHeartbeat() {
          this.heartbeatTimer && clearInterval(this.heartbeatTimer), this.heartbeatTimer = setInterval(() => this.sendHeartbeat(), this.heartbeatIntervalMs);
        }
        _startWorkerHeartbeat() {
          this.workerUrl ? this.log("worker", `starting worker for from ${this.workerUrl}`) : this.log("worker", "starting default worker");
          let a10 = this._workerObjectUrl(this.workerUrl);
          this.workerRef = new Worker(a10), this.workerRef.onerror = (a11) => {
            this.log("worker", "worker error", a11.message), this.workerRef.terminate();
          }, this.workerRef.onmessage = (a11) => {
            "keepAlive" === a11.data.event && this.sendHeartbeat();
          }, this.workerRef.postMessage({ event: "start", interval: this.heartbeatIntervalMs });
        }
        _onConnClose(a10) {
          var b2;
          this._setConnectionState("disconnected"), this.log("transport", "close", a10), this._triggerChanError(), this._clearTimer("heartbeat"), this._wasManualDisconnect || null == (b2 = this.reconnectTimer) || b2.scheduleTimeout(), this._triggerStateCallbacks("close", a10);
        }
        _onConnError(a10) {
          this._setConnectionState("disconnected"), this.log("transport", `${a10}`), this._triggerChanError(), this._triggerStateCallbacks("error", a10);
        }
        _triggerChanError() {
          this.channels.forEach((a10) => a10._trigger(T.error));
        }
        _appendParams(a10, b2) {
          if (0 === Object.keys(b2).length) return a10;
          let c2 = a10.match(/\?/) ? "&" : "?", d2 = new URLSearchParams(b2);
          return `${a10}${c2}${d2}`;
        }
        _workerObjectUrl(a10) {
          let b2;
          if (a10) b2 = a10;
          else {
            let a11 = new Blob([I], { type: "application/javascript" });
            b2 = URL.createObjectURL(a11);
          }
          return b2;
        }
        _setConnectionState(a10, b2 = false) {
          this._connectionState = a10, "connecting" === a10 ? this._wasManualDisconnect = false : "disconnecting" === a10 && (this._wasManualDisconnect = b2);
        }
        async _performAuth(a10 = null) {
          let b2;
          b2 = a10 || (this.accessToken ? await this.accessToken() : this.accessTokenValue), this.accessTokenValue != b2 && (this.accessTokenValue = b2, this.channels.forEach((a11) => {
            b2 && a11.updateJoinPayload({ access_token: b2, version: "realtime-js/2.15.5" }), a11.joinedOnce && a11._isJoined() && a11._push(T.access_token, { access_token: b2 });
          }));
        }
        async _waitForAuthIfNeeded() {
          this._authPromise && await this._authPromise;
        }
        _setAuthSafely(a10 = "general") {
          this.setAuth().catch((b2) => {
            this.log("error", `error setting auth in ${a10}`, b2);
          });
        }
        _triggerStateCallbacks(a10, b2) {
          try {
            this.stateChangeCallbacks[a10].forEach((c2) => {
              try {
                c2(b2);
              } catch (b3) {
                this.log("error", `error in ${a10} callback`, b3);
              }
            });
          } catch (b3) {
            this.log("error", `error triggering ${a10} callbacks`, b3);
          }
        }
        _setupReconnectionTimer() {
          this.reconnectTimer = new r(async () => {
            setTimeout(async () => {
              await this._waitForAuthIfNeeded(), this.isConnected() || this.connect();
            }, G.RECONNECT_DELAY);
          }, this.reconnectAfterMs);
        }
        _initializeOptions(a10) {
          var b2, c2, d2, e2, f2, g2, h2, i2, j2;
          if (this.transport = null != (b2 = null == a10 ? void 0 : a10.transport) ? b2 : null, this.timeout = null != (c2 = null == a10 ? void 0 : a10.timeout) ? c2 : 1e4, this.heartbeatIntervalMs = null != (d2 = null == a10 ? void 0 : a10.heartbeatIntervalMs) ? d2 : G.HEARTBEAT_INTERVAL, this.worker = null != (e2 = null == a10 ? void 0 : a10.worker) && e2, this.accessToken = null != (f2 = null == a10 ? void 0 : a10.accessToken) ? f2 : null, this.heartbeatCallback = null != (g2 = null == a10 ? void 0 : a10.heartbeatCallback) ? g2 : F, (null == a10 ? void 0 : a10.params) && (this.params = a10.params), (null == a10 ? void 0 : a10.logger) && (this.logger = a10.logger), ((null == a10 ? void 0 : a10.logLevel) || (null == a10 ? void 0 : a10.log_level)) && (this.logLevel = a10.logLevel || a10.log_level, this.params = Object.assign(Object.assign({}, this.params), { log_level: this.logLevel })), this.reconnectAfterMs = null != (h2 = null == a10 ? void 0 : a10.reconnectAfterMs) ? h2 : (a11) => H[a11 - 1] || 1e4, this.encode = null != (i2 = null == a10 ? void 0 : a10.encode) ? i2 : (a11, b3) => b3(JSON.stringify(a11)), this.decode = null != (j2 = null == a10 ? void 0 : a10.decode) ? j2 : this.serializer.decode.bind(this.serializer), this.worker) {
            if ("undefined" != typeof window && !window.Worker) throw Error("Web Worker is not supported");
            this.workerUrl = null == a10 ? void 0 : a10.workerUrl;
          }
        }
      }
      class K extends Error {
        constructor(a10) {
          super(a10), this.__isStorageError = true, this.name = "StorageError";
        }
      }
      function L(a10) {
        return "object" == typeof a10 && null !== a10 && "__isStorageError" in a10;
      }
      class M extends K {
        constructor(a10, b2, c2) {
          super(a10), this.name = "StorageApiError", this.status = b2, this.statusCode = c2;
        }
        toJSON() {
          return { name: this.name, message: this.message, status: this.status, statusCode: this.statusCode };
        }
      }
      class N extends K {
        constructor(a10, b2) {
          super(a10), this.name = "StorageUnknownError", this.originalError = b2;
        }
      }
      let O = (a10) => {
        let b2;
        return b2 = a10 || ("undefined" == typeof fetch ? (...a11) => Promise.resolve().then(c.bind(c, 411)).then(({ default: b3 }) => b3(...a11)) : fetch), (...a11) => b2(...a11);
      }, P = (a10) => {
        if (Array.isArray(a10)) return a10.map((a11) => P(a11));
        if ("function" == typeof a10 || a10 !== Object(a10)) return a10;
        let b2 = {};
        return Object.entries(a10).forEach(([a11, c2]) => {
          b2[a11.replace(/([-_][a-z])/gi, (a12) => a12.toUpperCase().replace(/[-_]/g, ""))] = P(c2);
        }), b2;
      };
      var Q, R, S, T, U, V, W, X, Y, Z, $, _ = function(a10, b2, c2, d2) {
        return new (c2 || (c2 = Promise))(function(e2, f2) {
          function g2(a11) {
            try {
              i2(d2.next(a11));
            } catch (a12) {
              f2(a12);
            }
          }
          function h2(a11) {
            try {
              i2(d2.throw(a11));
            } catch (a12) {
              f2(a12);
            }
          }
          function i2(a11) {
            var b3;
            a11.done ? e2(a11.value) : ((b3 = a11.value) instanceof c2 ? b3 : new c2(function(a12) {
              a12(b3);
            })).then(g2, h2);
          }
          i2((d2 = d2.apply(a10, b2 || [])).next());
        });
      };
      let aa = (a10) => a10.msg || a10.message || a10.error_description || a10.error || JSON.stringify(a10);
      function ab(a10, b2, d2, e2, f2, g2) {
        return _(this, void 0, void 0, function* () {
          return new Promise((h2, i2) => {
            a10(d2, ((a11, b3, c2, d3) => {
              let e3 = { method: a11, headers: (null == b3 ? void 0 : b3.headers) || {} };
              return "GET" !== a11 && d3 ? (((a12) => {
                if ("object" != typeof a12 || null === a12) return false;
                let b4 = Object.getPrototypeOf(a12);
                return (null === b4 || b4 === Object.prototype || null === Object.getPrototypeOf(b4)) && !(Symbol.toStringTag in a12) && !(Symbol.iterator in a12);
              })(d3) ? (e3.headers = Object.assign({ "Content-Type": "application/json" }, null == b3 ? void 0 : b3.headers), e3.body = JSON.stringify(d3)) : e3.body = d3, (null == b3 ? void 0 : b3.duplex) && (e3.duplex = b3.duplex), Object.assign(Object.assign({}, e3), c2)) : e3;
            })(b2, e2, f2, g2)).then((a11) => {
              if (!a11.ok) throw a11;
              return (null == e2 ? void 0 : e2.noResolveJson) ? a11 : a11.json();
            }).then((a11) => h2(a11)).catch((a11) => _(void 0, void 0, void 0, function* () {
              var b3, d3, f3, g3;
              let h3 = yield (b3 = void 0, d3 = void 0, f3 = void 0, g3 = function* () {
                return "undefined" == typeof Response ? (yield Promise.resolve().then(c.bind(c, 411))).Response : Response;
              }, new (f3 || (f3 = Promise))(function(a12, c2) {
                function e3(a13) {
                  try {
                    i3(g3.next(a13));
                  } catch (a14) {
                    c2(a14);
                  }
                }
                function h4(a13) {
                  try {
                    i3(g3.throw(a13));
                  } catch (a14) {
                    c2(a14);
                  }
                }
                function i3(b4) {
                  var c3;
                  b4.done ? a12(b4.value) : ((c3 = b4.value) instanceof f3 ? c3 : new f3(function(a13) {
                    a13(c3);
                  })).then(e3, h4);
                }
                i3((g3 = g3.apply(b3, d3 || [])).next());
              }));
              a11 instanceof h3 && !(null == e2 ? void 0 : e2.noResolveJson) ? a11.json().then((b4) => {
                let c2 = a11.status || 500, d4 = (null == b4 ? void 0 : b4.statusCode) || c2 + "";
                i2(new M(aa(b4), c2, d4));
              }).catch((a12) => {
                i2(new N(aa(a12), a12));
              }) : i2(new N(aa(a11), a11));
            }));
          });
        });
      }
      function ac(a10, b2, c2, d2) {
        return _(this, void 0, void 0, function* () {
          return ab(a10, "GET", b2, c2, d2);
        });
      }
      function ad(a10, b2, c2, d2, e2) {
        return _(this, void 0, void 0, function* () {
          return ab(a10, "POST", b2, d2, e2, c2);
        });
      }
      function ae(a10, b2, c2, d2, e2) {
        return _(this, void 0, void 0, function* () {
          return ab(a10, "PUT", b2, d2, e2, c2);
        });
      }
      function af(a10, b2, c2, d2, e2) {
        return _(this, void 0, void 0, function* () {
          return ab(a10, "DELETE", b2, d2, e2, c2);
        });
      }
      var ag = c(356).Buffer, ah = function(a10, b2, c2, d2) {
        return new (c2 || (c2 = Promise))(function(e2, f2) {
          function g2(a11) {
            try {
              i2(d2.next(a11));
            } catch (a12) {
              f2(a12);
            }
          }
          function h2(a11) {
            try {
              i2(d2.throw(a11));
            } catch (a12) {
              f2(a12);
            }
          }
          function i2(a11) {
            var b3;
            a11.done ? e2(a11.value) : ((b3 = a11.value) instanceof c2 ? b3 : new c2(function(a12) {
              a12(b3);
            })).then(g2, h2);
          }
          i2((d2 = d2.apply(a10, b2 || [])).next());
        });
      };
      let ai = { limit: 100, offset: 0, sortBy: { column: "name", order: "asc" } }, aj = { cacheControl: "3600", contentType: "text/plain;charset=UTF-8", upsert: false };
      class ak {
        constructor(a10, b2 = {}, c2, d2) {
          this.shouldThrowOnError = false, this.url = a10, this.headers = b2, this.bucketId = c2, this.fetch = O(d2);
        }
        throwOnError() {
          return this.shouldThrowOnError = true, this;
        }
        uploadOrUpdate(a10, b2, c2, d2) {
          return ah(this, void 0, void 0, function* () {
            try {
              let e2, f2 = Object.assign(Object.assign({}, aj), d2), g2 = Object.assign(Object.assign({}, this.headers), "POST" === a10 && { "x-upsert": String(f2.upsert) }), h2 = f2.metadata;
              "undefined" != typeof Blob && c2 instanceof Blob ? ((e2 = new FormData()).append("cacheControl", f2.cacheControl), h2 && e2.append("metadata", this.encodeMetadata(h2)), e2.append("", c2)) : "undefined" != typeof FormData && c2 instanceof FormData ? ((e2 = c2).append("cacheControl", f2.cacheControl), h2 && e2.append("metadata", this.encodeMetadata(h2))) : (e2 = c2, g2["cache-control"] = `max-age=${f2.cacheControl}`, g2["content-type"] = f2.contentType, h2 && (g2["x-metadata"] = this.toBase64(this.encodeMetadata(h2)))), (null == d2 ? void 0 : d2.headers) && (g2 = Object.assign(Object.assign({}, g2), d2.headers));
              let i2 = this._removeEmptyFolders(b2), j2 = this._getFinalPath(i2), k2 = yield ("PUT" == a10 ? ae : ad)(this.fetch, `${this.url}/object/${j2}`, e2, Object.assign({ headers: g2 }, (null == f2 ? void 0 : f2.duplex) ? { duplex: f2.duplex } : {}));
              return { data: { path: i2, id: k2.Id, fullPath: k2.Key }, error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (L(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        upload(a10, b2, c2) {
          return ah(this, void 0, void 0, function* () {
            return this.uploadOrUpdate("POST", a10, b2, c2);
          });
        }
        uploadToSignedUrl(a10, b2, c2, d2) {
          return ah(this, void 0, void 0, function* () {
            let e2 = this._removeEmptyFolders(a10), f2 = this._getFinalPath(e2), g2 = new URL(this.url + `/object/upload/sign/${f2}`);
            g2.searchParams.set("token", b2);
            try {
              let a11, b3 = Object.assign({ upsert: aj.upsert }, d2), f3 = Object.assign(Object.assign({}, this.headers), { "x-upsert": String(b3.upsert) });
              "undefined" != typeof Blob && c2 instanceof Blob ? ((a11 = new FormData()).append("cacheControl", b3.cacheControl), a11.append("", c2)) : "undefined" != typeof FormData && c2 instanceof FormData ? (a11 = c2).append("cacheControl", b3.cacheControl) : (a11 = c2, f3["cache-control"] = `max-age=${b3.cacheControl}`, f3["content-type"] = b3.contentType);
              let h2 = yield ae(this.fetch, g2.toString(), a11, { headers: f3 });
              return { data: { path: e2, fullPath: h2.Key }, error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (L(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        createSignedUploadUrl(a10, b2) {
          return ah(this, void 0, void 0, function* () {
            try {
              let c2 = this._getFinalPath(a10), d2 = Object.assign({}, this.headers);
              (null == b2 ? void 0 : b2.upsert) && (d2["x-upsert"] = "true");
              let e2 = yield ad(this.fetch, `${this.url}/object/upload/sign/${c2}`, {}, { headers: d2 }), f2 = new URL(this.url + e2.url), g2 = f2.searchParams.get("token");
              if (!g2) throw new K("No token returned by API");
              return { data: { signedUrl: f2.toString(), path: a10, token: g2 }, error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (L(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        update(a10, b2, c2) {
          return ah(this, void 0, void 0, function* () {
            return this.uploadOrUpdate("PUT", a10, b2, c2);
          });
        }
        move(a10, b2, c2) {
          return ah(this, void 0, void 0, function* () {
            try {
              return { data: yield ad(this.fetch, `${this.url}/object/move`, { bucketId: this.bucketId, sourceKey: a10, destinationKey: b2, destinationBucket: null == c2 ? void 0 : c2.destinationBucket }, { headers: this.headers }), error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (L(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        copy(a10, b2, c2) {
          return ah(this, void 0, void 0, function* () {
            try {
              return { data: { path: (yield ad(this.fetch, `${this.url}/object/copy`, { bucketId: this.bucketId, sourceKey: a10, destinationKey: b2, destinationBucket: null == c2 ? void 0 : c2.destinationBucket }, { headers: this.headers })).Key }, error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (L(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        createSignedUrl(a10, b2, c2) {
          return ah(this, void 0, void 0, function* () {
            try {
              let d2 = this._getFinalPath(a10), e2 = yield ad(this.fetch, `${this.url}/object/sign/${d2}`, Object.assign({ expiresIn: b2 }, (null == c2 ? void 0 : c2.transform) ? { transform: c2.transform } : {}), { headers: this.headers }), f2 = (null == c2 ? void 0 : c2.download) ? `&download=${true === c2.download ? "" : c2.download}` : "";
              return { data: e2 = { signedUrl: encodeURI(`${this.url}${e2.signedURL}${f2}`) }, error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (L(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        createSignedUrls(a10, b2, c2) {
          return ah(this, void 0, void 0, function* () {
            try {
              let d2 = yield ad(this.fetch, `${this.url}/object/sign/${this.bucketId}`, { expiresIn: b2, paths: a10 }, { headers: this.headers }), e2 = (null == c2 ? void 0 : c2.download) ? `&download=${true === c2.download ? "" : c2.download}` : "";
              return { data: d2.map((a11) => Object.assign(Object.assign({}, a11), { signedUrl: a11.signedURL ? encodeURI(`${this.url}${a11.signedURL}${e2}`) : null })), error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (L(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        download(a10, b2) {
          return ah(this, void 0, void 0, function* () {
            let c2 = void 0 !== (null == b2 ? void 0 : b2.transform), d2 = this.transformOptsToQueryString((null == b2 ? void 0 : b2.transform) || {}), e2 = d2 ? `?${d2}` : "";
            try {
              let b3 = this._getFinalPath(a10), d3 = yield ac(this.fetch, `${this.url}/${c2 ? "render/image/authenticated" : "object"}/${b3}${e2}`, { headers: this.headers, noResolveJson: true });
              return { data: yield d3.blob(), error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (L(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        info(a10) {
          return ah(this, void 0, void 0, function* () {
            let b2 = this._getFinalPath(a10);
            try {
              let a11 = yield ac(this.fetch, `${this.url}/object/info/${b2}`, { headers: this.headers });
              return { data: P(a11), error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (L(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        exists(a10) {
          return ah(this, void 0, void 0, function* () {
            let b2 = this._getFinalPath(a10);
            try {
              return yield function(a11, b3, c2, d2) {
                return _(this, void 0, void 0, function* () {
                  return ab(a11, "HEAD", b3, Object.assign(Object.assign({}, c2), { noResolveJson: true }), void 0);
                });
              }(this.fetch, `${this.url}/object/${b2}`, { headers: this.headers }), { data: true, error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (L(a11) && a11 instanceof N) {
                let b3 = a11.originalError;
                if ([400, 404].includes(null == b3 ? void 0 : b3.status)) return { data: false, error: a11 };
              }
              throw a11;
            }
          });
        }
        getPublicUrl(a10, b2) {
          let c2 = this._getFinalPath(a10), d2 = [], e2 = (null == b2 ? void 0 : b2.download) ? `download=${true === b2.download ? "" : b2.download}` : "";
          "" !== e2 && d2.push(e2);
          let f2 = void 0 !== (null == b2 ? void 0 : b2.transform), g2 = this.transformOptsToQueryString((null == b2 ? void 0 : b2.transform) || {});
          "" !== g2 && d2.push(g2);
          let h2 = d2.join("&");
          return "" !== h2 && (h2 = `?${h2}`), { data: { publicUrl: encodeURI(`${this.url}/${f2 ? "render/image" : "object"}/public/${c2}${h2}`) } };
        }
        remove(a10) {
          return ah(this, void 0, void 0, function* () {
            try {
              return { data: yield af(this.fetch, `${this.url}/object/${this.bucketId}`, { prefixes: a10 }, { headers: this.headers }), error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (L(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        list(a10, b2, c2) {
          return ah(this, void 0, void 0, function* () {
            try {
              let d2 = Object.assign(Object.assign(Object.assign({}, ai), b2), { prefix: a10 || "" });
              return { data: yield ad(this.fetch, `${this.url}/object/list/${this.bucketId}`, d2, { headers: this.headers }, c2), error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (L(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        listV2(a10, b2) {
          return ah(this, void 0, void 0, function* () {
            try {
              let c2 = Object.assign({}, a10);
              return { data: yield ad(this.fetch, `${this.url}/object/list-v2/${this.bucketId}`, c2, { headers: this.headers }, b2), error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (L(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        encodeMetadata(a10) {
          return JSON.stringify(a10);
        }
        toBase64(a10) {
          return void 0 !== ag ? ag.from(a10).toString("base64") : btoa(a10);
        }
        _getFinalPath(a10) {
          return `${this.bucketId}/${a10.replace(/^\/+/, "")}`;
        }
        _removeEmptyFolders(a10) {
          return a10.replace(/^\/|\/$/g, "").replace(/\/+/g, "/");
        }
        transformOptsToQueryString(a10) {
          let b2 = [];
          return a10.width && b2.push(`width=${a10.width}`), a10.height && b2.push(`height=${a10.height}`), a10.resize && b2.push(`resize=${a10.resize}`), a10.format && b2.push(`format=${a10.format}`), a10.quality && b2.push(`quality=${a10.quality}`), b2.join("&");
        }
      }
      let al = { "X-Client-Info": "storage-js/2.12.1" };
      var am = function(a10, b2, c2, d2) {
        return new (c2 || (c2 = Promise))(function(e2, f2) {
          function g2(a11) {
            try {
              i2(d2.next(a11));
            } catch (a12) {
              f2(a12);
            }
          }
          function h2(a11) {
            try {
              i2(d2.throw(a11));
            } catch (a12) {
              f2(a12);
            }
          }
          function i2(a11) {
            var b3;
            a11.done ? e2(a11.value) : ((b3 = a11.value) instanceof c2 ? b3 : new c2(function(a12) {
              a12(b3);
            })).then(g2, h2);
          }
          i2((d2 = d2.apply(a10, b2 || [])).next());
        });
      };
      class an {
        constructor(a10, b2 = {}, c2, d2) {
          this.shouldThrowOnError = false;
          let e2 = new URL(a10);
          (null == d2 ? void 0 : d2.useNewHostname) && /supabase\.(co|in|red)$/.test(e2.hostname) && !e2.hostname.includes("storage.supabase.") && (e2.hostname = e2.hostname.replace("supabase.", "storage.supabase.")), this.url = e2.href, this.headers = Object.assign(Object.assign({}, al), b2), this.fetch = O(c2);
        }
        throwOnError() {
          return this.shouldThrowOnError = true, this;
        }
        listBuckets() {
          return am(this, void 0, void 0, function* () {
            try {
              return { data: yield ac(this.fetch, `${this.url}/bucket`, { headers: this.headers }), error: null };
            } catch (a10) {
              if (this.shouldThrowOnError) throw a10;
              if (L(a10)) return { data: null, error: a10 };
              throw a10;
            }
          });
        }
        getBucket(a10) {
          return am(this, void 0, void 0, function* () {
            try {
              return { data: yield ac(this.fetch, `${this.url}/bucket/${a10}`, { headers: this.headers }), error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (L(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        createBucket(a10, b2 = { public: false }) {
          return am(this, void 0, void 0, function* () {
            try {
              return { data: yield ad(this.fetch, `${this.url}/bucket`, { id: a10, name: a10, type: b2.type, public: b2.public, file_size_limit: b2.fileSizeLimit, allowed_mime_types: b2.allowedMimeTypes }, { headers: this.headers }), error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (L(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        updateBucket(a10, b2) {
          return am(this, void 0, void 0, function* () {
            try {
              return { data: yield ae(this.fetch, `${this.url}/bucket/${a10}`, { id: a10, name: a10, public: b2.public, file_size_limit: b2.fileSizeLimit, allowed_mime_types: b2.allowedMimeTypes }, { headers: this.headers }), error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (L(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        emptyBucket(a10) {
          return am(this, void 0, void 0, function* () {
            try {
              return { data: yield ad(this.fetch, `${this.url}/bucket/${a10}/empty`, {}, { headers: this.headers }), error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (L(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        deleteBucket(a10) {
          return am(this, void 0, void 0, function* () {
            try {
              return { data: yield af(this.fetch, `${this.url}/bucket/${a10}`, {}, { headers: this.headers }), error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (L(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
      }
      class ao extends an {
        constructor(a10, b2 = {}, c2, d2) {
          super(a10, b2, c2, d2);
        }
        from(a10) {
          return new ak(this.url, this.headers, a10, this.fetch);
        }
      }
      let ap = "";
      ap = "undefined" != typeof Deno ? "deno" : "undefined" != typeof document ? "web" : "undefined" != typeof navigator && "ReactNative" === navigator.product ? "react-native" : "node";
      let aq = { headers: { "X-Client-Info": `supabase-js-${ap}/2.57.4` } }, ar = { schema: "public" }, as = { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true, flowType: "implicit" }, at = {};
      var au = c(411);
      let av = "2.71.1", aw = { "X-Client-Info": `gotrue-js/${av}` }, ax = "X-Supabase-Api-Version", ay = { "2024-01-01": { timestamp: Date.parse("2024-01-01T00:00:00.0Z"), name: "2024-01-01" } }, az = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}$|[a-z0-9_-]{2}$)$/i;
      class aA extends Error {
        constructor(a10, b2, c2) {
          super(a10), this.__isAuthError = true, this.name = "AuthError", this.status = b2, this.code = c2;
        }
      }
      function aB(a10) {
        return "object" == typeof a10 && null !== a10 && "__isAuthError" in a10;
      }
      class aC extends aA {
        constructor(a10, b2, c2) {
          super(a10, b2, c2), this.name = "AuthApiError", this.status = b2, this.code = c2;
        }
      }
      class aD extends aA {
        constructor(a10, b2) {
          super(a10), this.name = "AuthUnknownError", this.originalError = b2;
        }
      }
      class aE extends aA {
        constructor(a10, b2, c2, d2) {
          super(a10, c2, d2), this.name = b2, this.status = c2;
        }
      }
      class aF extends aE {
        constructor() {
          super("Auth session missing!", "AuthSessionMissingError", 400, void 0);
        }
      }
      class aG extends aE {
        constructor() {
          super("Auth session or user missing", "AuthInvalidTokenResponseError", 500, void 0);
        }
      }
      class aH extends aE {
        constructor(a10) {
          super(a10, "AuthInvalidCredentialsError", 400, void 0);
        }
      }
      class aI extends aE {
        constructor(a10, b2 = null) {
          super(a10, "AuthImplicitGrantRedirectError", 500, void 0), this.details = null, this.details = b2;
        }
        toJSON() {
          return { name: this.name, message: this.message, status: this.status, details: this.details };
        }
      }
      class aJ extends aE {
        constructor(a10, b2 = null) {
          super(a10, "AuthPKCEGrantCodeExchangeError", 500, void 0), this.details = null, this.details = b2;
        }
        toJSON() {
          return { name: this.name, message: this.message, status: this.status, details: this.details };
        }
      }
      class aK extends aE {
        constructor(a10, b2) {
          super(a10, "AuthRetryableFetchError", b2, void 0);
        }
      }
      function aL(a10) {
        return aB(a10) && "AuthRetryableFetchError" === a10.name;
      }
      class aM extends aE {
        constructor(a10, b2, c2) {
          super(a10, "AuthWeakPasswordError", b2, "weak_password"), this.reasons = c2;
        }
      }
      class aN extends aE {
        constructor(a10) {
          super(a10, "AuthInvalidJwtError", 400, "invalid_jwt");
        }
      }
      let aO = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split(""), aP = " 	\n\r=".split(""), aQ = (() => {
        let a10 = Array(128);
        for (let b2 = 0; b2 < a10.length; b2 += 1) a10[b2] = -1;
        for (let b2 = 0; b2 < aP.length; b2 += 1) a10[aP[b2].charCodeAt(0)] = -2;
        for (let b2 = 0; b2 < aO.length; b2 += 1) a10[aO[b2].charCodeAt(0)] = b2;
        return a10;
      })();
      function aR(a10, b2, c2) {
        if (null !== a10) for (b2.queue = b2.queue << 8 | a10, b2.queuedBits += 8; b2.queuedBits >= 6; ) c2(aO[b2.queue >> b2.queuedBits - 6 & 63]), b2.queuedBits -= 6;
        else if (b2.queuedBits > 0) for (b2.queue = b2.queue << 6 - b2.queuedBits, b2.queuedBits = 6; b2.queuedBits >= 6; ) c2(aO[b2.queue >> b2.queuedBits - 6 & 63]), b2.queuedBits -= 6;
      }
      function aS(a10, b2, c2) {
        let d2 = aQ[a10];
        if (d2 > -1) for (b2.queue = b2.queue << 6 | d2, b2.queuedBits += 6; b2.queuedBits >= 8; ) c2(b2.queue >> b2.queuedBits - 8 & 255), b2.queuedBits -= 8;
        else if (-2 === d2) return;
        else throw Error(`Invalid Base64-URL character "${String.fromCharCode(a10)}"`);
      }
      function aT(a10) {
        let b2 = [], c2 = (a11) => {
          b2.push(String.fromCodePoint(a11));
        }, d2 = { utf8seq: 0, codepoint: 0 }, e2 = { queue: 0, queuedBits: 0 }, f2 = (a11) => {
          !function(a12, b3, c3) {
            if (0 === b3.utf8seq) {
              if (a12 <= 127) return c3(a12);
              for (let c4 = 1; c4 < 6; c4 += 1) if ((a12 >> 7 - c4 & 1) == 0) {
                b3.utf8seq = c4;
                break;
              }
              if (2 === b3.utf8seq) b3.codepoint = 31 & a12;
              else if (3 === b3.utf8seq) b3.codepoint = 15 & a12;
              else if (4 === b3.utf8seq) b3.codepoint = 7 & a12;
              else throw Error("Invalid UTF-8 sequence");
              b3.utf8seq -= 1;
            } else if (b3.utf8seq > 0) {
              if (a12 <= 127) throw Error("Invalid UTF-8 sequence");
              b3.codepoint = b3.codepoint << 6 | 63 & a12, b3.utf8seq -= 1, 0 === b3.utf8seq && c3(b3.codepoint);
            }
          }(a11, d2, c2);
        };
        for (let b3 = 0; b3 < a10.length; b3 += 1) aS(a10.charCodeAt(b3), e2, f2);
        return b2.join("");
      }
      let aU = () => "undefined" != typeof window && "undefined" != typeof document, aV = { tested: false, writable: false }, aW = () => {
        if (!aU()) return false;
        try {
          if ("object" != typeof globalThis.localStorage) return false;
        } catch (a11) {
          return false;
        }
        if (aV.tested) return aV.writable;
        let a10 = `lswt-${Math.random()}${Math.random()}`;
        try {
          globalThis.localStorage.setItem(a10, a10), globalThis.localStorage.removeItem(a10), aV.tested = true, aV.writable = true;
        } catch (a11) {
          aV.tested = true, aV.writable = false;
        }
        return aV.writable;
      }, aX = (a10) => {
        let b2;
        return b2 = a10 || ("undefined" == typeof fetch ? (...a11) => Promise.resolve().then(c.bind(c, 411)).then(({ default: b3 }) => b3(...a11)) : fetch), (...a11) => b2(...a11);
      }, aY = async (a10, b2, c2) => {
        await a10.setItem(b2, JSON.stringify(c2));
      }, aZ = async (a10, b2) => {
        let c2 = await a10.getItem(b2);
        if (!c2) return null;
        try {
          return JSON.parse(c2);
        } catch (a11) {
          return c2;
        }
      }, a$ = async (a10, b2) => {
        await a10.removeItem(b2);
      };
      class a_ {
        constructor() {
          this.promise = new a_.promiseConstructor((a10, b2) => {
            this.resolve = a10, this.reject = b2;
          });
        }
      }
      function a0(a10) {
        let b2 = a10.split(".");
        if (3 !== b2.length) throw new aN("Invalid JWT structure");
        for (let a11 = 0; a11 < b2.length; a11++) if (!az.test(b2[a11])) throw new aN("JWT not in base64url format");
        return { header: JSON.parse(aT(b2[0])), payload: JSON.parse(aT(b2[1])), signature: function(a11) {
          let b3 = [], c2 = { queue: 0, queuedBits: 0 }, d2 = (a12) => {
            b3.push(a12);
          };
          for (let b4 = 0; b4 < a11.length; b4 += 1) aS(a11.charCodeAt(b4), c2, d2);
          return new Uint8Array(b3);
        }(b2[2]), raw: { header: b2[0], payload: b2[1] } };
      }
      async function a1(a10) {
        return await new Promise((b2) => {
          setTimeout(() => b2(null), a10);
        });
      }
      function a2(a10) {
        return ("0" + a10.toString(16)).substr(-2);
      }
      async function a3(a10) {
        let b2 = new TextEncoder().encode(a10);
        return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", b2))).map((a11) => String.fromCharCode(a11)).join("");
      }
      async function a4(a10) {
        return "undefined" == typeof crypto || void 0 === crypto.subtle || "undefined" == typeof TextEncoder ? (console.warn("WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256."), a10) : btoa(await a3(a10)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      }
      async function a5(a10, b2, c2 = false) {
        let d2 = function() {
          let a11 = new Uint32Array(56);
          if ("undefined" == typeof crypto) {
            let a12 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~", b3 = a12.length, c3 = "";
            for (let d3 = 0; d3 < 56; d3++) c3 += a12.charAt(Math.floor(Math.random() * b3));
            return c3;
          }
          return crypto.getRandomValues(a11), Array.from(a11, a2).join("");
        }(), e2 = d2;
        c2 && (e2 += "/PASSWORD_RECOVERY"), await aY(a10, `${b2}-code-verifier`, e2);
        let f2 = await a4(d2), g2 = d2 === f2 ? "plain" : "s256";
        return [f2, g2];
      }
      a_.promiseConstructor = Promise;
      let a6 = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i, a7 = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
      function a8(a10) {
        if (!a7.test(a10)) throw Error("@supabase/auth-js: Expected parameter to be UUID but is not");
      }
      function a9() {
        return new Proxy({}, { get: (a10, b2) => {
          if ("__isUserNotAvailableProxy" === b2) return true;
          if ("symbol" == typeof b2) {
            let a11 = b2.toString();
            if ("Symbol(Symbol.toPrimitive)" === a11 || "Symbol(Symbol.toStringTag)" === a11 || "Symbol(util.inspect.custom)" === a11) return;
          }
          throw Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Accessing the "${b2}" property of the session object is not supported. Please use getUser() instead.`);
        }, set: (a10, b2) => {
          throw Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Setting the "${b2}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
        }, deleteProperty: (a10, b2) => {
          throw Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Deleting the "${b2}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
        } });
      }
      function ba(a10) {
        return JSON.parse(JSON.stringify(a10));
      }
      var bb = function(a10, b2) {
        var c2 = {};
        for (var d2 in a10) Object.prototype.hasOwnProperty.call(a10, d2) && 0 > b2.indexOf(d2) && (c2[d2] = a10[d2]);
        if (null != a10 && "function" == typeof Object.getOwnPropertySymbols) for (var e2 = 0, d2 = Object.getOwnPropertySymbols(a10); e2 < d2.length; e2++) 0 > b2.indexOf(d2[e2]) && Object.prototype.propertyIsEnumerable.call(a10, d2[e2]) && (c2[d2[e2]] = a10[d2[e2]]);
        return c2;
      };
      let bc = (a10) => a10.msg || a10.message || a10.error_description || a10.error || JSON.stringify(a10), bd = [502, 503, 504];
      async function be(a10) {
        var b2;
        let c2, d2;
        if (!("object" == typeof a10 && null !== a10 && "status" in a10 && "ok" in a10 && "json" in a10 && "function" == typeof a10.json)) throw new aK(bc(a10), 0);
        if (bd.includes(a10.status)) throw new aK(bc(a10), a10.status);
        try {
          c2 = await a10.json();
        } catch (a11) {
          throw new aD(bc(a11), a11);
        }
        let e2 = function(a11) {
          let b3 = a11.headers.get(ax);
          if (!b3 || !b3.match(a6)) return null;
          try {
            return /* @__PURE__ */ new Date(`${b3}T00:00:00.0Z`);
          } catch (a12) {
            return null;
          }
        }(a10);
        if (e2 && e2.getTime() >= ay["2024-01-01"].timestamp && "object" == typeof c2 && c2 && "string" == typeof c2.code ? d2 = c2.code : "object" == typeof c2 && c2 && "string" == typeof c2.error_code && (d2 = c2.error_code), d2) {
          if ("weak_password" === d2) throw new aM(bc(c2), a10.status, (null == (b2 = c2.weak_password) ? void 0 : b2.reasons) || []);
          else if ("session_not_found" === d2) throw new aF();
        } else if ("object" == typeof c2 && c2 && "object" == typeof c2.weak_password && c2.weak_password && Array.isArray(c2.weak_password.reasons) && c2.weak_password.reasons.length && c2.weak_password.reasons.reduce((a11, b3) => a11 && "string" == typeof b3, true)) throw new aM(bc(c2), a10.status, c2.weak_password.reasons);
        throw new aC(bc(c2), a10.status || 500, d2);
      }
      async function bf(a10, b2, c2, d2) {
        var e2;
        let f2 = Object.assign({}, null == d2 ? void 0 : d2.headers);
        f2[ax] || (f2[ax] = ay["2024-01-01"].name), (null == d2 ? void 0 : d2.jwt) && (f2.Authorization = `Bearer ${d2.jwt}`);
        let g2 = null != (e2 = null == d2 ? void 0 : d2.query) ? e2 : {};
        (null == d2 ? void 0 : d2.redirectTo) && (g2.redirect_to = d2.redirectTo);
        let h2 = Object.keys(g2).length ? "?" + new URLSearchParams(g2).toString() : "", i2 = await bg(a10, b2, c2 + h2, { headers: f2, noResolveJson: null == d2 ? void 0 : d2.noResolveJson }, {}, null == d2 ? void 0 : d2.body);
        return (null == d2 ? void 0 : d2.xform) ? null == d2 ? void 0 : d2.xform(i2) : { data: Object.assign({}, i2), error: null };
      }
      async function bg(a10, b2, c2, d2, e2, f2) {
        let g2, h2 = ((a11, b3, c3, d3) => {
          let e3 = { method: a11, headers: (null == b3 ? void 0 : b3.headers) || {} };
          return "GET" === a11 ? e3 : (e3.headers = Object.assign({ "Content-Type": "application/json;charset=UTF-8" }, null == b3 ? void 0 : b3.headers), e3.body = JSON.stringify(d3), Object.assign(Object.assign({}, e3), c3));
        })(b2, d2, e2, f2);
        try {
          g2 = await a10(c2, Object.assign({}, h2));
        } catch (a11) {
          throw console.error(a11), new aK(bc(a11), 0);
        }
        if (g2.ok || await be(g2), null == d2 ? void 0 : d2.noResolveJson) return g2;
        try {
          return await g2.json();
        } catch (a11) {
          await be(a11);
        }
      }
      function bh(a10) {
        var b2, c2, d2;
        let e2 = null;
        (d2 = a10).access_token && d2.refresh_token && d2.expires_in && (e2 = Object.assign({}, a10), a10.expires_at || (e2.expires_at = (c2 = a10.expires_in, Math.round(Date.now() / 1e3) + c2)));
        return { data: { session: e2, user: null != (b2 = a10.user) ? b2 : a10 }, error: null };
      }
      function bi(a10) {
        let b2 = bh(a10);
        return !b2.error && a10.weak_password && "object" == typeof a10.weak_password && Array.isArray(a10.weak_password.reasons) && a10.weak_password.reasons.length && a10.weak_password.message && "string" == typeof a10.weak_password.message && a10.weak_password.reasons.reduce((a11, b3) => a11 && "string" == typeof b3, true) && (b2.data.weak_password = a10.weak_password), b2;
      }
      function bj(a10) {
        var b2;
        return { data: { user: null != (b2 = a10.user) ? b2 : a10 }, error: null };
      }
      function bk(a10) {
        return { data: a10, error: null };
      }
      function bl(a10) {
        let { action_link: b2, email_otp: c2, hashed_token: d2, redirect_to: e2, verification_type: f2 } = a10;
        return { data: { properties: { action_link: b2, email_otp: c2, hashed_token: d2, redirect_to: e2, verification_type: f2 }, user: Object.assign({}, bb(a10, ["action_link", "email_otp", "hashed_token", "redirect_to", "verification_type"])) }, error: null };
      }
      function bm(a10) {
        return a10;
      }
      let bn = ["global", "local", "others"];
      var bo = function(a10, b2) {
        var c2 = {};
        for (var d2 in a10) Object.prototype.hasOwnProperty.call(a10, d2) && 0 > b2.indexOf(d2) && (c2[d2] = a10[d2]);
        if (null != a10 && "function" == typeof Object.getOwnPropertySymbols) for (var e2 = 0, d2 = Object.getOwnPropertySymbols(a10); e2 < d2.length; e2++) 0 > b2.indexOf(d2[e2]) && Object.prototype.propertyIsEnumerable.call(a10, d2[e2]) && (c2[d2[e2]] = a10[d2[e2]]);
        return c2;
      };
      class bp {
        constructor({ url: a10 = "", headers: b2 = {}, fetch: c2 }) {
          this.url = a10, this.headers = b2, this.fetch = aX(c2), this.mfa = { listFactors: this._listFactors.bind(this), deleteFactor: this._deleteFactor.bind(this) };
        }
        async signOut(a10, b2 = bn[0]) {
          if (0 > bn.indexOf(b2)) throw Error(`@supabase/auth-js: Parameter scope must be one of ${bn.join(", ")}`);
          try {
            return await bf(this.fetch, "POST", `${this.url}/logout?scope=${b2}`, { headers: this.headers, jwt: a10, noResolveJson: true }), { data: null, error: null };
          } catch (a11) {
            if (aB(a11)) return { data: null, error: a11 };
            throw a11;
          }
        }
        async inviteUserByEmail(a10, b2 = {}) {
          try {
            return await bf(this.fetch, "POST", `${this.url}/invite`, { body: { email: a10, data: b2.data }, headers: this.headers, redirectTo: b2.redirectTo, xform: bj });
          } catch (a11) {
            if (aB(a11)) return { data: { user: null }, error: a11 };
            throw a11;
          }
        }
        async generateLink(a10) {
          try {
            let { options: b2 } = a10, c2 = bo(a10, ["options"]), d2 = Object.assign(Object.assign({}, c2), b2);
            return "newEmail" in c2 && (d2.new_email = null == c2 ? void 0 : c2.newEmail, delete d2.newEmail), await bf(this.fetch, "POST", `${this.url}/admin/generate_link`, { body: d2, headers: this.headers, xform: bl, redirectTo: null == b2 ? void 0 : b2.redirectTo });
          } catch (a11) {
            if (aB(a11)) return { data: { properties: null, user: null }, error: a11 };
            throw a11;
          }
        }
        async createUser(a10) {
          try {
            return await bf(this.fetch, "POST", `${this.url}/admin/users`, { body: a10, headers: this.headers, xform: bj });
          } catch (a11) {
            if (aB(a11)) return { data: { user: null }, error: a11 };
            throw a11;
          }
        }
        async listUsers(a10) {
          var b2, c2, d2, e2, f2, g2, h2;
          try {
            let i2 = { nextPage: null, lastPage: 0, total: 0 }, j2 = await bf(this.fetch, "GET", `${this.url}/admin/users`, { headers: this.headers, noResolveJson: true, query: { page: null != (c2 = null == (b2 = null == a10 ? void 0 : a10.page) ? void 0 : b2.toString()) ? c2 : "", per_page: null != (e2 = null == (d2 = null == a10 ? void 0 : a10.perPage) ? void 0 : d2.toString()) ? e2 : "" }, xform: bm });
            if (j2.error) throw j2.error;
            let k2 = await j2.json(), l2 = null != (f2 = j2.headers.get("x-total-count")) ? f2 : 0, m2 = null != (h2 = null == (g2 = j2.headers.get("link")) ? void 0 : g2.split(",")) ? h2 : [];
            return m2.length > 0 && (m2.forEach((a11) => {
              let b3 = parseInt(a11.split(";")[0].split("=")[1].substring(0, 1)), c3 = JSON.parse(a11.split(";")[1].split("=")[1]);
              i2[`${c3}Page`] = b3;
            }), i2.total = parseInt(l2)), { data: Object.assign(Object.assign({}, k2), i2), error: null };
          } catch (a11) {
            if (aB(a11)) return { data: { users: [] }, error: a11 };
            throw a11;
          }
        }
        async getUserById(a10) {
          a8(a10);
          try {
            return await bf(this.fetch, "GET", `${this.url}/admin/users/${a10}`, { headers: this.headers, xform: bj });
          } catch (a11) {
            if (aB(a11)) return { data: { user: null }, error: a11 };
            throw a11;
          }
        }
        async updateUserById(a10, b2) {
          a8(a10);
          try {
            return await bf(this.fetch, "PUT", `${this.url}/admin/users/${a10}`, { body: b2, headers: this.headers, xform: bj });
          } catch (a11) {
            if (aB(a11)) return { data: { user: null }, error: a11 };
            throw a11;
          }
        }
        async deleteUser(a10, b2 = false) {
          a8(a10);
          try {
            return await bf(this.fetch, "DELETE", `${this.url}/admin/users/${a10}`, { headers: this.headers, body: { should_soft_delete: b2 }, xform: bj });
          } catch (a11) {
            if (aB(a11)) return { data: { user: null }, error: a11 };
            throw a11;
          }
        }
        async _listFactors(a10) {
          a8(a10.userId);
          try {
            let { data: b2, error: c2 } = await bf(this.fetch, "GET", `${this.url}/admin/users/${a10.userId}/factors`, { headers: this.headers, xform: (a11) => ({ data: { factors: a11 }, error: null }) });
            return { data: b2, error: c2 };
          } catch (a11) {
            if (aB(a11)) return { data: null, error: a11 };
            throw a11;
          }
        }
        async _deleteFactor(a10) {
          a8(a10.userId), a8(a10.id);
          try {
            return { data: await bf(this.fetch, "DELETE", `${this.url}/admin/users/${a10.userId}/factors/${a10.id}`, { headers: this.headers }), error: null };
          } catch (a11) {
            if (aB(a11)) return { data: null, error: a11 };
            throw a11;
          }
        }
      }
      function bq(a10 = {}) {
        return { getItem: (b2) => a10[b2] || null, setItem: (b2, c2) => {
          a10[b2] = c2;
        }, removeItem: (b2) => {
          delete a10[b2];
        } };
      }
      let br = { debug: !!(globalThis && aW() && globalThis.localStorage && "true" === globalThis.localStorage.getItem("supabase.gotrue-js.locks.debug")) };
      class bs extends Error {
        constructor(a10) {
          super(a10), this.isAcquireTimeout = true;
        }
      }
      class bt extends bs {
      }
      async function bu(a10, b2, c2) {
        br.debug && console.log("@supabase/gotrue-js: navigatorLock: acquire lock", a10, b2);
        let d2 = new globalThis.AbortController();
        return b2 > 0 && setTimeout(() => {
          d2.abort(), br.debug && console.log("@supabase/gotrue-js: navigatorLock acquire timed out", a10);
        }, b2), await Promise.resolve().then(() => globalThis.navigator.locks.request(a10, 0 === b2 ? { mode: "exclusive", ifAvailable: true } : { mode: "exclusive", signal: d2.signal }, async (d3) => {
          if (d3) {
            br.debug && console.log("@supabase/gotrue-js: navigatorLock: acquired", a10, d3.name);
            try {
              return await c2();
            } finally {
              br.debug && console.log("@supabase/gotrue-js: navigatorLock: released", a10, d3.name);
            }
          }
          if (0 === b2) throw br.debug && console.log("@supabase/gotrue-js: navigatorLock: not immediately available", a10), new bt(`Acquiring an exclusive Navigator LockManager lock "${a10}" immediately failed`);
          if (br.debug) try {
            let a11 = await globalThis.navigator.locks.query();
            console.log("@supabase/gotrue-js: Navigator LockManager state", JSON.stringify(a11, null, "  "));
          } catch (a11) {
            console.warn("@supabase/gotrue-js: Error when querying Navigator LockManager state", a11);
          }
          return console.warn("@supabase/gotrue-js: Navigator LockManager returned a null lock when using #request without ifAvailable set to true, it appears this browser is not following the LockManager spec https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request"), await c2();
        }));
      }
      if ("object" != typeof globalThis) try {
        Object.defineProperty(Object.prototype, "__magic__", { get: function() {
          return this;
        }, configurable: true }), __magic__.globalThis = __magic__, delete Object.prototype.__magic__;
      } catch (a10) {
        "undefined" != typeof self && (self.globalThis = self);
      }
      let bv = { url: "http://localhost:9999", storageKey: "supabase.auth.token", autoRefreshToken: true, persistSession: true, detectSessionInUrl: true, headers: aw, flowType: "implicit", debug: false, hasCustomAuthorizationHeader: false };
      async function bw(a10, b2, c2) {
        return await c2();
      }
      let bx = {};
      class by {
        constructor(a10) {
          var b2, c2;
          this.userStorage = null, this.memoryStorage = null, this.stateChangeEmitters = /* @__PURE__ */ new Map(), this.autoRefreshTicker = null, this.visibilityChangedCallback = null, this.refreshingDeferred = null, this.initializePromise = null, this.detectSessionInUrl = true, this.hasCustomAuthorizationHeader = false, this.suppressGetSessionWarning = false, this.lockAcquired = false, this.pendingInLock = [], this.broadcastChannel = null, this.logger = console.log, this.instanceID = by.nextInstanceID, by.nextInstanceID += 1, this.instanceID > 0 && aU() && console.warn("Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.");
          let d2 = Object.assign(Object.assign({}, bv), a10);
          if (this.logDebugMessages = !!d2.debug, "function" == typeof d2.debug && (this.logger = d2.debug), this.persistSession = d2.persistSession, this.storageKey = d2.storageKey, this.autoRefreshToken = d2.autoRefreshToken, this.admin = new bp({ url: d2.url, headers: d2.headers, fetch: d2.fetch }), this.url = d2.url, this.headers = d2.headers, this.fetch = aX(d2.fetch), this.lock = d2.lock || bw, this.detectSessionInUrl = d2.detectSessionInUrl, this.flowType = d2.flowType, this.hasCustomAuthorizationHeader = d2.hasCustomAuthorizationHeader, d2.lock ? this.lock = d2.lock : aU() && (null == (b2 = null == globalThis ? void 0 : globalThis.navigator) ? void 0 : b2.locks) ? this.lock = bu : this.lock = bw, this.jwks || (this.jwks = { keys: [] }, this.jwks_cached_at = Number.MIN_SAFE_INTEGER), this.mfa = { verify: this._verify.bind(this), enroll: this._enroll.bind(this), unenroll: this._unenroll.bind(this), challenge: this._challenge.bind(this), listFactors: this._listFactors.bind(this), challengeAndVerify: this._challengeAndVerify.bind(this), getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this) }, this.persistSession ? (d2.storage ? this.storage = d2.storage : aW() ? this.storage = globalThis.localStorage : (this.memoryStorage = {}, this.storage = bq(this.memoryStorage)), d2.userStorage && (this.userStorage = d2.userStorage)) : (this.memoryStorage = {}, this.storage = bq(this.memoryStorage)), aU() && globalThis.BroadcastChannel && this.persistSession && this.storageKey) {
            try {
              this.broadcastChannel = new globalThis.BroadcastChannel(this.storageKey);
            } catch (a11) {
              console.error("Failed to create a new BroadcastChannel, multi-tab state changes will not be available", a11);
            }
            null == (c2 = this.broadcastChannel) || c2.addEventListener("message", async (a11) => {
              this._debug("received broadcast notification from other tab or client", a11), await this._notifyAllSubscribers(a11.data.event, a11.data.session, false);
            });
          }
          this.initialize();
        }
        get jwks() {
          var a10, b2;
          return null != (b2 = null == (a10 = bx[this.storageKey]) ? void 0 : a10.jwks) ? b2 : { keys: [] };
        }
        set jwks(a10) {
          bx[this.storageKey] = Object.assign(Object.assign({}, bx[this.storageKey]), { jwks: a10 });
        }
        get jwks_cached_at() {
          var a10, b2;
          return null != (b2 = null == (a10 = bx[this.storageKey]) ? void 0 : a10.cachedAt) ? b2 : Number.MIN_SAFE_INTEGER;
        }
        set jwks_cached_at(a10) {
          bx[this.storageKey] = Object.assign(Object.assign({}, bx[this.storageKey]), { cachedAt: a10 });
        }
        _debug(...a10) {
          return this.logDebugMessages && this.logger(`GoTrueClient@${this.instanceID} (${av}) ${(/* @__PURE__ */ new Date()).toISOString()}`, ...a10), this;
        }
        async initialize() {
          return this.initializePromise || (this.initializePromise = (async () => await this._acquireLock(-1, async () => await this._initialize()))()), await this.initializePromise;
        }
        async _initialize() {
          var a10;
          try {
            let b2 = function(a11) {
              let b3 = {}, c3 = new URL(a11);
              if (c3.hash && "#" === c3.hash[0]) try {
                new URLSearchParams(c3.hash.substring(1)).forEach((a12, c4) => {
                  b3[c4] = a12;
                });
              } catch (a12) {
              }
              return c3.searchParams.forEach((a12, c4) => {
                b3[c4] = a12;
              }), b3;
            }(window.location.href), c2 = "none";
            if (this._isImplicitGrantCallback(b2) ? c2 = "implicit" : await this._isPKCECallback(b2) && (c2 = "pkce"), aU() && this.detectSessionInUrl && "none" !== c2) {
              let { data: d2, error: e2 } = await this._getSessionFromURL(b2, c2);
              if (e2) {
                if (this._debug("#_initialize()", "error detecting session from URL", e2), aB(e2) && "AuthImplicitGrantRedirectError" === e2.name) {
                  let b3 = null == (a10 = e2.details) ? void 0 : a10.code;
                  if ("identity_already_exists" === b3 || "identity_not_found" === b3 || "single_identity_not_deletable" === b3) return { error: e2 };
                }
                return await this._removeSession(), { error: e2 };
              }
              let { session: f2, redirectType: g2 } = d2;
              return this._debug("#_initialize()", "detected session in URL", f2, "redirect type", g2), await this._saveSession(f2), setTimeout(async () => {
                "recovery" === g2 ? await this._notifyAllSubscribers("PASSWORD_RECOVERY", f2) : await this._notifyAllSubscribers("SIGNED_IN", f2);
              }, 0), { error: null };
            }
            return await this._recoverAndRefresh(), { error: null };
          } catch (a11) {
            if (aB(a11)) return { error: a11 };
            return { error: new aD("Unexpected error during initialization", a11) };
          } finally {
            await this._handleVisibilityChange(), this._debug("#_initialize()", "end");
          }
        }
        async signInAnonymously(a10) {
          var b2, c2, d2;
          try {
            let { data: e2, error: f2 } = await bf(this.fetch, "POST", `${this.url}/signup`, { headers: this.headers, body: { data: null != (c2 = null == (b2 = null == a10 ? void 0 : a10.options) ? void 0 : b2.data) ? c2 : {}, gotrue_meta_security: { captcha_token: null == (d2 = null == a10 ? void 0 : a10.options) ? void 0 : d2.captchaToken } }, xform: bh });
            if (f2 || !e2) return { data: { user: null, session: null }, error: f2 };
            let g2 = e2.session, h2 = e2.user;
            return e2.session && (await this._saveSession(e2.session), await this._notifyAllSubscribers("SIGNED_IN", g2)), { data: { user: h2, session: g2 }, error: null };
          } catch (a11) {
            if (aB(a11)) return { data: { user: null, session: null }, error: a11 };
            throw a11;
          }
        }
        async signUp(a10) {
          var b2, c2, d2;
          try {
            let e2;
            if ("email" in a10) {
              let { email: c3, password: d3, options: f3 } = a10, g3 = null, h3 = null;
              "pkce" === this.flowType && ([g3, h3] = await a5(this.storage, this.storageKey)), e2 = await bf(this.fetch, "POST", `${this.url}/signup`, { headers: this.headers, redirectTo: null == f3 ? void 0 : f3.emailRedirectTo, body: { email: c3, password: d3, data: null != (b2 = null == f3 ? void 0 : f3.data) ? b2 : {}, gotrue_meta_security: { captcha_token: null == f3 ? void 0 : f3.captchaToken }, code_challenge: g3, code_challenge_method: h3 }, xform: bh });
            } else if ("phone" in a10) {
              let { phone: b3, password: f3, options: g3 } = a10;
              e2 = await bf(this.fetch, "POST", `${this.url}/signup`, { headers: this.headers, body: { phone: b3, password: f3, data: null != (c2 = null == g3 ? void 0 : g3.data) ? c2 : {}, channel: null != (d2 = null == g3 ? void 0 : g3.channel) ? d2 : "sms", gotrue_meta_security: { captcha_token: null == g3 ? void 0 : g3.captchaToken } }, xform: bh });
            } else throw new aH("You must provide either an email or phone number and a password");
            let { data: f2, error: g2 } = e2;
            if (g2 || !f2) return { data: { user: null, session: null }, error: g2 };
            let h2 = f2.session, i2 = f2.user;
            return f2.session && (await this._saveSession(f2.session), await this._notifyAllSubscribers("SIGNED_IN", h2)), { data: { user: i2, session: h2 }, error: null };
          } catch (a11) {
            if (aB(a11)) return { data: { user: null, session: null }, error: a11 };
            throw a11;
          }
        }
        async signInWithPassword(a10) {
          try {
            let b2;
            if ("email" in a10) {
              let { email: c3, password: d3, options: e2 } = a10;
              b2 = await bf(this.fetch, "POST", `${this.url}/token?grant_type=password`, { headers: this.headers, body: { email: c3, password: d3, gotrue_meta_security: { captcha_token: null == e2 ? void 0 : e2.captchaToken } }, xform: bi });
            } else if ("phone" in a10) {
              let { phone: c3, password: d3, options: e2 } = a10;
              b2 = await bf(this.fetch, "POST", `${this.url}/token?grant_type=password`, { headers: this.headers, body: { phone: c3, password: d3, gotrue_meta_security: { captcha_token: null == e2 ? void 0 : e2.captchaToken } }, xform: bi });
            } else throw new aH("You must provide either an email or phone number and a password");
            let { data: c2, error: d2 } = b2;
            if (d2) return { data: { user: null, session: null }, error: d2 };
            if (!c2 || !c2.session || !c2.user) return { data: { user: null, session: null }, error: new aG() };
            return c2.session && (await this._saveSession(c2.session), await this._notifyAllSubscribers("SIGNED_IN", c2.session)), { data: Object.assign({ user: c2.user, session: c2.session }, c2.weak_password ? { weakPassword: c2.weak_password } : null), error: d2 };
          } catch (a11) {
            if (aB(a11)) return { data: { user: null, session: null }, error: a11 };
            throw a11;
          }
        }
        async signInWithOAuth(a10) {
          var b2, c2, d2, e2;
          return await this._handleProviderSignIn(a10.provider, { redirectTo: null == (b2 = a10.options) ? void 0 : b2.redirectTo, scopes: null == (c2 = a10.options) ? void 0 : c2.scopes, queryParams: null == (d2 = a10.options) ? void 0 : d2.queryParams, skipBrowserRedirect: null == (e2 = a10.options) ? void 0 : e2.skipBrowserRedirect });
        }
        async exchangeCodeForSession(a10) {
          return await this.initializePromise, this._acquireLock(-1, async () => this._exchangeCodeForSession(a10));
        }
        async signInWithWeb3(a10) {
          let { chain: b2 } = a10;
          if ("solana" === b2) return await this.signInWithSolana(a10);
          throw Error(`@supabase/auth-js: Unsupported chain "${b2}"`);
        }
        async signInWithSolana(a10) {
          var b2, c2, d2, e2, f2, g2, h2, i2, j2, k2, l2, m2;
          let n2, o2;
          if ("message" in a10) n2 = a10.message, o2 = a10.signature;
          else {
            let l3, { chain: m3, wallet: p2, statement: q2, options: r2 } = a10;
            if (aU()) if ("object" == typeof p2) l3 = p2;
            else {
              let a11 = window;
              if ("solana" in a11 && "object" == typeof a11.solana && ("signIn" in a11.solana && "function" == typeof a11.solana.signIn || "signMessage" in a11.solana && "function" == typeof a11.solana.signMessage)) l3 = a11.solana;
              else throw Error("@supabase/auth-js: No compatible Solana wallet interface on the window object (window.solana) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'solana', wallet: resolvedUserWallet }) instead.");
            }
            else {
              if ("object" != typeof p2 || !(null == r2 ? void 0 : r2.url)) throw Error("@supabase/auth-js: Both wallet and url must be specified in non-browser environments.");
              l3 = p2;
            }
            let s2 = new URL(null != (b2 = null == r2 ? void 0 : r2.url) ? b2 : window.location.href);
            if ("signIn" in l3 && l3.signIn) {
              let a11, b3 = await l3.signIn(Object.assign(Object.assign(Object.assign({ issuedAt: (/* @__PURE__ */ new Date()).toISOString() }, null == r2 ? void 0 : r2.signInWithSolana), { version: "1", domain: s2.host, uri: s2.href }), q2 ? { statement: q2 } : null));
              if (Array.isArray(b3) && b3[0] && "object" == typeof b3[0]) a11 = b3[0];
              else if (b3 && "object" == typeof b3 && "signedMessage" in b3 && "signature" in b3) a11 = b3;
              else throw Error("@supabase/auth-js: Wallet method signIn() returned unrecognized value");
              if ("signedMessage" in a11 && "signature" in a11 && ("string" == typeof a11.signedMessage || a11.signedMessage instanceof Uint8Array) && a11.signature instanceof Uint8Array) n2 = "string" == typeof a11.signedMessage ? a11.signedMessage : new TextDecoder().decode(a11.signedMessage), o2 = a11.signature;
              else throw Error("@supabase/auth-js: Wallet method signIn() API returned object without signedMessage and signature fields");
            } else {
              if (!("signMessage" in l3) || "function" != typeof l3.signMessage || !("publicKey" in l3) || "object" != typeof l3 || !l3.publicKey || !("toBase58" in l3.publicKey) || "function" != typeof l3.publicKey.toBase58) throw Error("@supabase/auth-js: Wallet does not have a compatible signMessage() and publicKey.toBase58() API");
              n2 = [`${s2.host} wants you to sign in with your Solana account:`, l3.publicKey.toBase58(), ...q2 ? ["", q2, ""] : [""], "Version: 1", `URI: ${s2.href}`, `Issued At: ${null != (d2 = null == (c2 = null == r2 ? void 0 : r2.signInWithSolana) ? void 0 : c2.issuedAt) ? d2 : (/* @__PURE__ */ new Date()).toISOString()}`, ...(null == (e2 = null == r2 ? void 0 : r2.signInWithSolana) ? void 0 : e2.notBefore) ? [`Not Before: ${r2.signInWithSolana.notBefore}`] : [], ...(null == (f2 = null == r2 ? void 0 : r2.signInWithSolana) ? void 0 : f2.expirationTime) ? [`Expiration Time: ${r2.signInWithSolana.expirationTime}`] : [], ...(null == (g2 = null == r2 ? void 0 : r2.signInWithSolana) ? void 0 : g2.chainId) ? [`Chain ID: ${r2.signInWithSolana.chainId}`] : [], ...(null == (h2 = null == r2 ? void 0 : r2.signInWithSolana) ? void 0 : h2.nonce) ? [`Nonce: ${r2.signInWithSolana.nonce}`] : [], ...(null == (i2 = null == r2 ? void 0 : r2.signInWithSolana) ? void 0 : i2.requestId) ? [`Request ID: ${r2.signInWithSolana.requestId}`] : [], ...(null == (k2 = null == (j2 = null == r2 ? void 0 : r2.signInWithSolana) ? void 0 : j2.resources) ? void 0 : k2.length) ? ["Resources", ...r2.signInWithSolana.resources.map((a12) => `- ${a12}`)] : []].join("\n");
              let a11 = await l3.signMessage(new TextEncoder().encode(n2), "utf8");
              if (!a11 || !(a11 instanceof Uint8Array)) throw Error("@supabase/auth-js: Wallet signMessage() API returned an recognized value");
              o2 = a11;
            }
          }
          try {
            let { data: b3, error: c3 } = await bf(this.fetch, "POST", `${this.url}/token?grant_type=web3`, { headers: this.headers, body: Object.assign({ chain: "solana", message: n2, signature: function(a11) {
              let b4 = [], c4 = { queue: 0, queuedBits: 0 }, d3 = (a12) => {
                b4.push(a12);
              };
              return a11.forEach((a12) => aR(a12, c4, d3)), aR(null, c4, d3), b4.join("");
            }(o2) }, (null == (l2 = a10.options) ? void 0 : l2.captchaToken) ? { gotrue_meta_security: { captcha_token: null == (m2 = a10.options) ? void 0 : m2.captchaToken } } : null), xform: bh });
            if (c3) throw c3;
            if (!b3 || !b3.session || !b3.user) return { data: { user: null, session: null }, error: new aG() };
            return b3.session && (await this._saveSession(b3.session), await this._notifyAllSubscribers("SIGNED_IN", b3.session)), { data: Object.assign({}, b3), error: c3 };
          } catch (a11) {
            if (aB(a11)) return { data: { user: null, session: null }, error: a11 };
            throw a11;
          }
        }
        async _exchangeCodeForSession(a10) {
          let b2 = await aZ(this.storage, `${this.storageKey}-code-verifier`), [c2, d2] = (null != b2 ? b2 : "").split("/");
          try {
            let { data: b3, error: e2 } = await bf(this.fetch, "POST", `${this.url}/token?grant_type=pkce`, { headers: this.headers, body: { auth_code: a10, code_verifier: c2 }, xform: bh });
            if (await a$(this.storage, `${this.storageKey}-code-verifier`), e2) throw e2;
            if (!b3 || !b3.session || !b3.user) return { data: { user: null, session: null, redirectType: null }, error: new aG() };
            return b3.session && (await this._saveSession(b3.session), await this._notifyAllSubscribers("SIGNED_IN", b3.session)), { data: Object.assign(Object.assign({}, b3), { redirectType: null != d2 ? d2 : null }), error: e2 };
          } catch (a11) {
            if (aB(a11)) return { data: { user: null, session: null, redirectType: null }, error: a11 };
            throw a11;
          }
        }
        async signInWithIdToken(a10) {
          try {
            let { options: b2, provider: c2, token: d2, access_token: e2, nonce: f2 } = a10, { data: g2, error: h2 } = await bf(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, { headers: this.headers, body: { provider: c2, id_token: d2, access_token: e2, nonce: f2, gotrue_meta_security: { captcha_token: null == b2 ? void 0 : b2.captchaToken } }, xform: bh });
            if (h2) return { data: { user: null, session: null }, error: h2 };
            if (!g2 || !g2.session || !g2.user) return { data: { user: null, session: null }, error: new aG() };
            return g2.session && (await this._saveSession(g2.session), await this._notifyAllSubscribers("SIGNED_IN", g2.session)), { data: g2, error: h2 };
          } catch (a11) {
            if (aB(a11)) return { data: { user: null, session: null }, error: a11 };
            throw a11;
          }
        }
        async signInWithOtp(a10) {
          var b2, c2, d2, e2, f2;
          try {
            if ("email" in a10) {
              let { email: d3, options: e3 } = a10, f3 = null, g2 = null;
              "pkce" === this.flowType && ([f3, g2] = await a5(this.storage, this.storageKey));
              let { error: h2 } = await bf(this.fetch, "POST", `${this.url}/otp`, { headers: this.headers, body: { email: d3, data: null != (b2 = null == e3 ? void 0 : e3.data) ? b2 : {}, create_user: null == (c2 = null == e3 ? void 0 : e3.shouldCreateUser) || c2, gotrue_meta_security: { captcha_token: null == e3 ? void 0 : e3.captchaToken }, code_challenge: f3, code_challenge_method: g2 }, redirectTo: null == e3 ? void 0 : e3.emailRedirectTo });
              return { data: { user: null, session: null }, error: h2 };
            }
            if ("phone" in a10) {
              let { phone: b3, options: c3 } = a10, { data: g2, error: h2 } = await bf(this.fetch, "POST", `${this.url}/otp`, { headers: this.headers, body: { phone: b3, data: null != (d2 = null == c3 ? void 0 : c3.data) ? d2 : {}, create_user: null == (e2 = null == c3 ? void 0 : c3.shouldCreateUser) || e2, gotrue_meta_security: { captcha_token: null == c3 ? void 0 : c3.captchaToken }, channel: null != (f2 = null == c3 ? void 0 : c3.channel) ? f2 : "sms" } });
              return { data: { user: null, session: null, messageId: null == g2 ? void 0 : g2.message_id }, error: h2 };
            }
            throw new aH("You must provide either an email or phone number.");
          } catch (a11) {
            if (aB(a11)) return { data: { user: null, session: null }, error: a11 };
            throw a11;
          }
        }
        async verifyOtp(a10) {
          var b2, c2;
          try {
            let d2, e2;
            "options" in a10 && (d2 = null == (b2 = a10.options) ? void 0 : b2.redirectTo, e2 = null == (c2 = a10.options) ? void 0 : c2.captchaToken);
            let { data: f2, error: g2 } = await bf(this.fetch, "POST", `${this.url}/verify`, { headers: this.headers, body: Object.assign(Object.assign({}, a10), { gotrue_meta_security: { captcha_token: e2 } }), redirectTo: d2, xform: bh });
            if (g2) throw g2;
            if (!f2) throw Error("An error occurred on token verification.");
            let h2 = f2.session, i2 = f2.user;
            return (null == h2 ? void 0 : h2.access_token) && (await this._saveSession(h2), await this._notifyAllSubscribers("recovery" == a10.type ? "PASSWORD_RECOVERY" : "SIGNED_IN", h2)), { data: { user: i2, session: h2 }, error: null };
          } catch (a11) {
            if (aB(a11)) return { data: { user: null, session: null }, error: a11 };
            throw a11;
          }
        }
        async signInWithSSO(a10) {
          var b2, c2, d2;
          try {
            let e2 = null, f2 = null;
            return "pkce" === this.flowType && ([e2, f2] = await a5(this.storage, this.storageKey)), await bf(this.fetch, "POST", `${this.url}/sso`, { body: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, "providerId" in a10 ? { provider_id: a10.providerId } : null), "domain" in a10 ? { domain: a10.domain } : null), { redirect_to: null != (c2 = null == (b2 = a10.options) ? void 0 : b2.redirectTo) ? c2 : void 0 }), (null == (d2 = null == a10 ? void 0 : a10.options) ? void 0 : d2.captchaToken) ? { gotrue_meta_security: { captcha_token: a10.options.captchaToken } } : null), { skip_http_redirect: true, code_challenge: e2, code_challenge_method: f2 }), headers: this.headers, xform: bk });
          } catch (a11) {
            if (aB(a11)) return { data: null, error: a11 };
            throw a11;
          }
        }
        async reauthenticate() {
          return await this.initializePromise, await this._acquireLock(-1, async () => await this._reauthenticate());
        }
        async _reauthenticate() {
          try {
            return await this._useSession(async (a10) => {
              let { data: { session: b2 }, error: c2 } = a10;
              if (c2) throw c2;
              if (!b2) throw new aF();
              let { error: d2 } = await bf(this.fetch, "GET", `${this.url}/reauthenticate`, { headers: this.headers, jwt: b2.access_token });
              return { data: { user: null, session: null }, error: d2 };
            });
          } catch (a10) {
            if (aB(a10)) return { data: { user: null, session: null }, error: a10 };
            throw a10;
          }
        }
        async resend(a10) {
          try {
            let b2 = `${this.url}/resend`;
            if ("email" in a10) {
              let { email: c2, type: d2, options: e2 } = a10, { error: f2 } = await bf(this.fetch, "POST", b2, { headers: this.headers, body: { email: c2, type: d2, gotrue_meta_security: { captcha_token: null == e2 ? void 0 : e2.captchaToken } }, redirectTo: null == e2 ? void 0 : e2.emailRedirectTo });
              return { data: { user: null, session: null }, error: f2 };
            }
            if ("phone" in a10) {
              let { phone: c2, type: d2, options: e2 } = a10, { data: f2, error: g2 } = await bf(this.fetch, "POST", b2, { headers: this.headers, body: { phone: c2, type: d2, gotrue_meta_security: { captcha_token: null == e2 ? void 0 : e2.captchaToken } } });
              return { data: { user: null, session: null, messageId: null == f2 ? void 0 : f2.message_id }, error: g2 };
            }
            throw new aH("You must provide either an email or phone number and a type");
          } catch (a11) {
            if (aB(a11)) return { data: { user: null, session: null }, error: a11 };
            throw a11;
          }
        }
        async getSession() {
          return await this.initializePromise, await this._acquireLock(-1, async () => this._useSession(async (a10) => a10));
        }
        async _acquireLock(a10, b2) {
          this._debug("#_acquireLock", "begin", a10);
          try {
            if (this.lockAcquired) {
              let a11 = this.pendingInLock.length ? this.pendingInLock[this.pendingInLock.length - 1] : Promise.resolve(), c2 = (async () => (await a11, await b2()))();
              return this.pendingInLock.push((async () => {
                try {
                  await c2;
                } catch (a12) {
                }
              })()), c2;
            }
            return await this.lock(`lock:${this.storageKey}`, a10, async () => {
              this._debug("#_acquireLock", "lock acquired for storage key", this.storageKey);
              try {
                this.lockAcquired = true;
                let a11 = b2();
                for (this.pendingInLock.push((async () => {
                  try {
                    await a11;
                  } catch (a12) {
                  }
                })()), await a11; this.pendingInLock.length; ) {
                  let a12 = [...this.pendingInLock];
                  await Promise.all(a12), this.pendingInLock.splice(0, a12.length);
                }
                return await a11;
              } finally {
                this._debug("#_acquireLock", "lock released for storage key", this.storageKey), this.lockAcquired = false;
              }
            });
          } finally {
            this._debug("#_acquireLock", "end");
          }
        }
        async _useSession(a10) {
          this._debug("#_useSession", "begin");
          try {
            let b2 = await this.__loadSession();
            return await a10(b2);
          } finally {
            this._debug("#_useSession", "end");
          }
        }
        async __loadSession() {
          this._debug("#__loadSession()", "begin"), this.lockAcquired || this._debug("#__loadSession()", "used outside of an acquired lock!", Error().stack);
          try {
            let a10 = null, b2 = await aZ(this.storage, this.storageKey);
            if (this._debug("#getSession()", "session from storage", b2), null !== b2 && (this._isValidSession(b2) ? a10 = b2 : (this._debug("#getSession()", "session from storage is not valid"), await this._removeSession())), !a10) return { data: { session: null }, error: null };
            let c2 = !!a10.expires_at && 1e3 * a10.expires_at - Date.now() < 9e4;
            if (this._debug("#__loadSession()", `session has${c2 ? "" : " not"} expired`, "expires_at", a10.expires_at), !c2) {
              if (this.userStorage) {
                let b3 = await aZ(this.userStorage, this.storageKey + "-user");
                (null == b3 ? void 0 : b3.user) ? a10.user = b3.user : a10.user = a9();
              }
              if (this.storage.isServer && a10.user) {
                let b3 = this.suppressGetSessionWarning;
                a10 = new Proxy(a10, { get: (a11, c3, d3) => (b3 || "user" !== c3 || (console.warn("Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server."), b3 = true, this.suppressGetSessionWarning = true), Reflect.get(a11, c3, d3)) });
              }
              return { data: { session: a10 }, error: null };
            }
            let { session: d2, error: e2 } = await this._callRefreshToken(a10.refresh_token);
            if (e2) return { data: { session: null }, error: e2 };
            return { data: { session: d2 }, error: null };
          } finally {
            this._debug("#__loadSession()", "end");
          }
        }
        async getUser(a10) {
          return a10 ? await this._getUser(a10) : (await this.initializePromise, await this._acquireLock(-1, async () => await this._getUser()));
        }
        async _getUser(a10) {
          try {
            if (a10) return await bf(this.fetch, "GET", `${this.url}/user`, { headers: this.headers, jwt: a10, xform: bj });
            return await this._useSession(async (a11) => {
              var b2, c2, d2;
              let { data: e2, error: f2 } = a11;
              if (f2) throw f2;
              return (null == (b2 = e2.session) ? void 0 : b2.access_token) || this.hasCustomAuthorizationHeader ? await bf(this.fetch, "GET", `${this.url}/user`, { headers: this.headers, jwt: null != (d2 = null == (c2 = e2.session) ? void 0 : c2.access_token) ? d2 : void 0, xform: bj }) : { data: { user: null }, error: new aF() };
            });
          } catch (a11) {
            if (aB(a11)) return aB(a11) && "AuthSessionMissingError" === a11.name && (await this._removeSession(), await a$(this.storage, `${this.storageKey}-code-verifier`)), { data: { user: null }, error: a11 };
            throw a11;
          }
        }
        async updateUser(a10, b2 = {}) {
          return await this.initializePromise, await this._acquireLock(-1, async () => await this._updateUser(a10, b2));
        }
        async _updateUser(a10, b2 = {}) {
          try {
            return await this._useSession(async (c2) => {
              let { data: d2, error: e2 } = c2;
              if (e2) throw e2;
              if (!d2.session) throw new aF();
              let f2 = d2.session, g2 = null, h2 = null;
              "pkce" === this.flowType && null != a10.email && ([g2, h2] = await a5(this.storage, this.storageKey));
              let { data: i2, error: j2 } = await bf(this.fetch, "PUT", `${this.url}/user`, { headers: this.headers, redirectTo: null == b2 ? void 0 : b2.emailRedirectTo, body: Object.assign(Object.assign({}, a10), { code_challenge: g2, code_challenge_method: h2 }), jwt: f2.access_token, xform: bj });
              if (j2) throw j2;
              return f2.user = i2.user, await this._saveSession(f2), await this._notifyAllSubscribers("USER_UPDATED", f2), { data: { user: f2.user }, error: null };
            });
          } catch (a11) {
            if (aB(a11)) return { data: { user: null }, error: a11 };
            throw a11;
          }
        }
        async setSession(a10) {
          return await this.initializePromise, await this._acquireLock(-1, async () => await this._setSession(a10));
        }
        async _setSession(a10) {
          try {
            if (!a10.access_token || !a10.refresh_token) throw new aF();
            let b2 = Date.now() / 1e3, c2 = b2, d2 = true, e2 = null, { payload: f2 } = a0(a10.access_token);
            if (f2.exp && (d2 = (c2 = f2.exp) <= b2), d2) {
              let { session: b3, error: c3 } = await this._callRefreshToken(a10.refresh_token);
              if (c3) return { data: { user: null, session: null }, error: c3 };
              if (!b3) return { data: { user: null, session: null }, error: null };
              e2 = b3;
            } else {
              let { data: d3, error: f3 } = await this._getUser(a10.access_token);
              if (f3) throw f3;
              e2 = { access_token: a10.access_token, refresh_token: a10.refresh_token, user: d3.user, token_type: "bearer", expires_in: c2 - b2, expires_at: c2 }, await this._saveSession(e2), await this._notifyAllSubscribers("SIGNED_IN", e2);
            }
            return { data: { user: e2.user, session: e2 }, error: null };
          } catch (a11) {
            if (aB(a11)) return { data: { session: null, user: null }, error: a11 };
            throw a11;
          }
        }
        async refreshSession(a10) {
          return await this.initializePromise, await this._acquireLock(-1, async () => await this._refreshSession(a10));
        }
        async _refreshSession(a10) {
          try {
            return await this._useSession(async (b2) => {
              var c2;
              if (!a10) {
                let { data: d3, error: e3 } = b2;
                if (e3) throw e3;
                a10 = null != (c2 = d3.session) ? c2 : void 0;
              }
              if (!(null == a10 ? void 0 : a10.refresh_token)) throw new aF();
              let { session: d2, error: e2 } = await this._callRefreshToken(a10.refresh_token);
              return e2 ? { data: { user: null, session: null }, error: e2 } : d2 ? { data: { user: d2.user, session: d2 }, error: null } : { data: { user: null, session: null }, error: null };
            });
          } catch (a11) {
            if (aB(a11)) return { data: { user: null, session: null }, error: a11 };
            throw a11;
          }
        }
        async _getSessionFromURL(a10, b2) {
          try {
            if (!aU()) throw new aI("No browser detected.");
            if (a10.error || a10.error_description || a10.error_code) throw new aI(a10.error_description || "Error in URL with unspecified error_description", { error: a10.error || "unspecified_error", code: a10.error_code || "unspecified_code" });
            switch (b2) {
              case "implicit":
                if ("pkce" === this.flowType) throw new aJ("Not a valid PKCE flow url.");
                break;
              case "pkce":
                if ("implicit" === this.flowType) throw new aI("Not a valid implicit grant flow url.");
            }
            if ("pkce" === b2) {
              if (this._debug("#_initialize()", "begin", "is PKCE flow", true), !a10.code) throw new aJ("No code detected.");
              let { data: b3, error: c3 } = await this._exchangeCodeForSession(a10.code);
              if (c3) throw c3;
              let d3 = new URL(window.location.href);
              return d3.searchParams.delete("code"), window.history.replaceState(window.history.state, "", d3.toString()), { data: { session: b3.session, redirectType: null }, error: null };
            }
            let { provider_token: c2, provider_refresh_token: d2, access_token: e2, refresh_token: f2, expires_in: g2, expires_at: h2, token_type: i2 } = a10;
            if (!e2 || !g2 || !f2 || !i2) throw new aI("No session defined in URL");
            let j2 = Math.round(Date.now() / 1e3), k2 = parseInt(g2), l2 = j2 + k2;
            h2 && (l2 = parseInt(h2));
            let m2 = l2 - j2;
            1e3 * m2 <= 3e4 && console.warn(`@supabase/gotrue-js: Session as retrieved from URL expires in ${m2}s, should have been closer to ${k2}s`);
            let n2 = l2 - k2;
            j2 - n2 >= 120 ? console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale", n2, l2, j2) : j2 - n2 < 0 && console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew", n2, l2, j2);
            let { data: o2, error: p2 } = await this._getUser(e2);
            if (p2) throw p2;
            let q2 = { provider_token: c2, provider_refresh_token: d2, access_token: e2, expires_in: k2, expires_at: l2, refresh_token: f2, token_type: i2, user: o2.user };
            return window.location.hash = "", this._debug("#_getSessionFromURL()", "clearing window.location.hash"), { data: { session: q2, redirectType: a10.type }, error: null };
          } catch (a11) {
            if (aB(a11)) return { data: { session: null, redirectType: null }, error: a11 };
            throw a11;
          }
        }
        _isImplicitGrantCallback(a10) {
          return !!(a10.access_token || a10.error_description);
        }
        async _isPKCECallback(a10) {
          let b2 = await aZ(this.storage, `${this.storageKey}-code-verifier`);
          return !!(a10.code && b2);
        }
        async signOut(a10 = { scope: "global" }) {
          return await this.initializePromise, await this._acquireLock(-1, async () => await this._signOut(a10));
        }
        async _signOut({ scope: a10 } = { scope: "global" }) {
          return await this._useSession(async (b2) => {
            var c2;
            let { data: d2, error: e2 } = b2;
            if (e2) return { error: e2 };
            let f2 = null == (c2 = d2.session) ? void 0 : c2.access_token;
            if (f2) {
              let { error: b3 } = await this.admin.signOut(f2, a10);
              if (b3 && !(aB(b3) && "AuthApiError" === b3.name && (404 === b3.status || 401 === b3.status || 403 === b3.status))) return { error: b3 };
            }
            return "others" !== a10 && (await this._removeSession(), await a$(this.storage, `${this.storageKey}-code-verifier`)), { error: null };
          });
        }
        onAuthStateChange(a10) {
          let b2 = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(a11) {
            let b3 = 16 * Math.random() | 0;
            return ("x" == a11 ? b3 : 3 & b3 | 8).toString(16);
          }), c2 = { id: b2, callback: a10, unsubscribe: () => {
            this._debug("#unsubscribe()", "state change callback with id removed", b2), this.stateChangeEmitters.delete(b2);
          } };
          return this._debug("#onAuthStateChange()", "registered callback with id", b2), this.stateChangeEmitters.set(b2, c2), (async () => {
            await this.initializePromise, await this._acquireLock(-1, async () => {
              this._emitInitialSession(b2);
            });
          })(), { data: { subscription: c2 } };
        }
        async _emitInitialSession(a10) {
          return await this._useSession(async (b2) => {
            var c2, d2;
            try {
              let { data: { session: d3 }, error: e2 } = b2;
              if (e2) throw e2;
              await (null == (c2 = this.stateChangeEmitters.get(a10)) ? void 0 : c2.callback("INITIAL_SESSION", d3)), this._debug("INITIAL_SESSION", "callback id", a10, "session", d3);
            } catch (b3) {
              await (null == (d2 = this.stateChangeEmitters.get(a10)) ? void 0 : d2.callback("INITIAL_SESSION", null)), this._debug("INITIAL_SESSION", "callback id", a10, "error", b3), console.error(b3);
            }
          });
        }
        async resetPasswordForEmail(a10, b2 = {}) {
          let c2 = null, d2 = null;
          "pkce" === this.flowType && ([c2, d2] = await a5(this.storage, this.storageKey, true));
          try {
            return await bf(this.fetch, "POST", `${this.url}/recover`, { body: { email: a10, code_challenge: c2, code_challenge_method: d2, gotrue_meta_security: { captcha_token: b2.captchaToken } }, headers: this.headers, redirectTo: b2.redirectTo });
          } catch (a11) {
            if (aB(a11)) return { data: null, error: a11 };
            throw a11;
          }
        }
        async getUserIdentities() {
          var a10;
          try {
            let { data: b2, error: c2 } = await this.getUser();
            if (c2) throw c2;
            return { data: { identities: null != (a10 = b2.user.identities) ? a10 : [] }, error: null };
          } catch (a11) {
            if (aB(a11)) return { data: null, error: a11 };
            throw a11;
          }
        }
        async linkIdentity(a10) {
          var b2;
          try {
            let { data: c2, error: d2 } = await this._useSession(async (b3) => {
              var c3, d3, e2, f2, g2;
              let { data: h2, error: i2 } = b3;
              if (i2) throw i2;
              let j2 = await this._getUrlForProvider(`${this.url}/user/identities/authorize`, a10.provider, { redirectTo: null == (c3 = a10.options) ? void 0 : c3.redirectTo, scopes: null == (d3 = a10.options) ? void 0 : d3.scopes, queryParams: null == (e2 = a10.options) ? void 0 : e2.queryParams, skipBrowserRedirect: true });
              return await bf(this.fetch, "GET", j2, { headers: this.headers, jwt: null != (g2 = null == (f2 = h2.session) ? void 0 : f2.access_token) ? g2 : void 0 });
            });
            if (d2) throw d2;
            return !aU() || (null == (b2 = a10.options) ? void 0 : b2.skipBrowserRedirect) || window.location.assign(null == c2 ? void 0 : c2.url), { data: { provider: a10.provider, url: null == c2 ? void 0 : c2.url }, error: null };
          } catch (b3) {
            if (aB(b3)) return { data: { provider: a10.provider, url: null }, error: b3 };
            throw b3;
          }
        }
        async unlinkIdentity(a10) {
          try {
            return await this._useSession(async (b2) => {
              var c2, d2;
              let { data: e2, error: f2 } = b2;
              if (f2) throw f2;
              return await bf(this.fetch, "DELETE", `${this.url}/user/identities/${a10.identity_id}`, { headers: this.headers, jwt: null != (d2 = null == (c2 = e2.session) ? void 0 : c2.access_token) ? d2 : void 0 });
            });
          } catch (a11) {
            if (aB(a11)) return { data: null, error: a11 };
            throw a11;
          }
        }
        async _refreshAccessToken(a10) {
          let b2 = `#_refreshAccessToken(${a10.substring(0, 5)}...)`;
          this._debug(b2, "begin");
          try {
            var c2, d2;
            let e2 = Date.now();
            return await (c2 = async (c3) => (c3 > 0 && await a1(200 * Math.pow(2, c3 - 1)), this._debug(b2, "refreshing attempt", c3), await bf(this.fetch, "POST", `${this.url}/token?grant_type=refresh_token`, { body: { refresh_token: a10 }, headers: this.headers, xform: bh })), d2 = (a11, b3) => {
              let c3 = 200 * Math.pow(2, a11);
              return b3 && aL(b3) && Date.now() + c3 - e2 < 3e4;
            }, new Promise((a11, b3) => {
              (async () => {
                for (let e3 = 0; e3 < 1 / 0; e3++) try {
                  let b4 = await c2(e3);
                  if (!d2(e3, null, b4)) return void a11(b4);
                } catch (a12) {
                  if (!d2(e3, a12)) return void b3(a12);
                }
              })();
            }));
          } catch (a11) {
            if (this._debug(b2, "error", a11), aB(a11)) return { data: { session: null, user: null }, error: a11 };
            throw a11;
          } finally {
            this._debug(b2, "end");
          }
        }
        _isValidSession(a10) {
          return "object" == typeof a10 && null !== a10 && "access_token" in a10 && "refresh_token" in a10 && "expires_at" in a10;
        }
        async _handleProviderSignIn(a10, b2) {
          let c2 = await this._getUrlForProvider(`${this.url}/authorize`, a10, { redirectTo: b2.redirectTo, scopes: b2.scopes, queryParams: b2.queryParams });
          return this._debug("#_handleProviderSignIn()", "provider", a10, "options", b2, "url", c2), aU() && !b2.skipBrowserRedirect && window.location.assign(c2), { data: { provider: a10, url: c2 }, error: null };
        }
        async _recoverAndRefresh() {
          var a10, b2;
          let c2 = "#_recoverAndRefresh()";
          this._debug(c2, "begin");
          try {
            let d2 = await aZ(this.storage, this.storageKey);
            if (d2 && this.userStorage) {
              let b3 = await aZ(this.userStorage, this.storageKey + "-user");
              !this.storage.isServer && Object.is(this.storage, this.userStorage) && !b3 && (b3 = { user: d2.user }, await aY(this.userStorage, this.storageKey + "-user", b3)), d2.user = null != (a10 = null == b3 ? void 0 : b3.user) ? a10 : a9();
            } else if (d2 && !d2.user && !d2.user) {
              let a11 = await aZ(this.storage, this.storageKey + "-user");
              a11 && (null == a11 ? void 0 : a11.user) ? (d2.user = a11.user, await a$(this.storage, this.storageKey + "-user"), await aY(this.storage, this.storageKey, d2)) : d2.user = a9();
            }
            if (this._debug(c2, "session from storage", d2), !this._isValidSession(d2)) {
              this._debug(c2, "session is not valid"), null !== d2 && await this._removeSession();
              return;
            }
            let e2 = (null != (b2 = d2.expires_at) ? b2 : 1 / 0) * 1e3 - Date.now() < 9e4;
            if (this._debug(c2, `session has${e2 ? "" : " not"} expired with margin of 90000s`), e2) {
              if (this.autoRefreshToken && d2.refresh_token) {
                let { error: a11 } = await this._callRefreshToken(d2.refresh_token);
                a11 && (console.error(a11), aL(a11) || (this._debug(c2, "refresh failed with a non-retryable error, removing the session", a11), await this._removeSession()));
              }
            } else if (d2.user && true === d2.user.__isUserNotAvailableProxy) try {
              let { data: a11, error: b3 } = await this._getUser(d2.access_token);
              !b3 && (null == a11 ? void 0 : a11.user) ? (d2.user = a11.user, await this._saveSession(d2), await this._notifyAllSubscribers("SIGNED_IN", d2)) : this._debug(c2, "could not get user data, skipping SIGNED_IN notification");
            } catch (a11) {
              console.error("Error getting user data:", a11), this._debug(c2, "error getting user data, skipping SIGNED_IN notification", a11);
            }
            else await this._notifyAllSubscribers("SIGNED_IN", d2);
          } catch (a11) {
            this._debug(c2, "error", a11), console.error(a11);
            return;
          } finally {
            this._debug(c2, "end");
          }
        }
        async _callRefreshToken(a10) {
          var b2, c2;
          if (!a10) throw new aF();
          if (this.refreshingDeferred) return this.refreshingDeferred.promise;
          let d2 = `#_callRefreshToken(${a10.substring(0, 5)}...)`;
          this._debug(d2, "begin");
          try {
            this.refreshingDeferred = new a_();
            let { data: b3, error: c3 } = await this._refreshAccessToken(a10);
            if (c3) throw c3;
            if (!b3.session) throw new aF();
            await this._saveSession(b3.session), await this._notifyAllSubscribers("TOKEN_REFRESHED", b3.session);
            let d3 = { session: b3.session, error: null };
            return this.refreshingDeferred.resolve(d3), d3;
          } catch (a11) {
            if (this._debug(d2, "error", a11), aB(a11)) {
              let c3 = { session: null, error: a11 };
              return aL(a11) || await this._removeSession(), null == (b2 = this.refreshingDeferred) || b2.resolve(c3), c3;
            }
            throw null == (c2 = this.refreshingDeferred) || c2.reject(a11), a11;
          } finally {
            this.refreshingDeferred = null, this._debug(d2, "end");
          }
        }
        async _notifyAllSubscribers(a10, b2, c2 = true) {
          let d2 = `#_notifyAllSubscribers(${a10})`;
          this._debug(d2, "begin", b2, `broadcast = ${c2}`);
          try {
            this.broadcastChannel && c2 && this.broadcastChannel.postMessage({ event: a10, session: b2 });
            let d3 = [], e2 = Array.from(this.stateChangeEmitters.values()).map(async (c3) => {
              try {
                await c3.callback(a10, b2);
              } catch (a11) {
                d3.push(a11);
              }
            });
            if (await Promise.all(e2), d3.length > 0) {
              for (let a11 = 0; a11 < d3.length; a11 += 1) console.error(d3[a11]);
              throw d3[0];
            }
          } finally {
            this._debug(d2, "end");
          }
        }
        async _saveSession(a10) {
          this._debug("#_saveSession()", a10), this.suppressGetSessionWarning = true;
          let b2 = Object.assign({}, a10), c2 = b2.user && true === b2.user.__isUserNotAvailableProxy;
          if (this.userStorage) {
            !c2 && b2.user && await aY(this.userStorage, this.storageKey + "-user", { user: b2.user });
            let a11 = Object.assign({}, b2);
            delete a11.user;
            let d2 = ba(a11);
            await aY(this.storage, this.storageKey, d2);
          } else {
            let a11 = ba(b2);
            await aY(this.storage, this.storageKey, a11);
          }
        }
        async _removeSession() {
          this._debug("#_removeSession()"), await a$(this.storage, this.storageKey), await a$(this.storage, this.storageKey + "-code-verifier"), await a$(this.storage, this.storageKey + "-user"), this.userStorage && await a$(this.userStorage, this.storageKey + "-user"), await this._notifyAllSubscribers("SIGNED_OUT", null);
        }
        _removeVisibilityChangedCallback() {
          this._debug("#_removeVisibilityChangedCallback()");
          let a10 = this.visibilityChangedCallback;
          this.visibilityChangedCallback = null;
          try {
            a10 && aU() && (null == window ? void 0 : window.removeEventListener) && window.removeEventListener("visibilitychange", a10);
          } catch (a11) {
            console.error("removing visibilitychange callback failed", a11);
          }
        }
        async _startAutoRefresh() {
          await this._stopAutoRefresh(), this._debug("#_startAutoRefresh()");
          let a10 = setInterval(() => this._autoRefreshTokenTick(), 3e4);
          this.autoRefreshTicker = a10, a10 && "object" == typeof a10 && "function" == typeof a10.unref ? a10.unref() : "undefined" != typeof Deno && "function" == typeof Deno.unrefTimer && Deno.unrefTimer(a10), setTimeout(async () => {
            await this.initializePromise, await this._autoRefreshTokenTick();
          }, 0);
        }
        async _stopAutoRefresh() {
          this._debug("#_stopAutoRefresh()");
          let a10 = this.autoRefreshTicker;
          this.autoRefreshTicker = null, a10 && clearInterval(a10);
        }
        async startAutoRefresh() {
          this._removeVisibilityChangedCallback(), await this._startAutoRefresh();
        }
        async stopAutoRefresh() {
          this._removeVisibilityChangedCallback(), await this._stopAutoRefresh();
        }
        async _autoRefreshTokenTick() {
          this._debug("#_autoRefreshTokenTick()", "begin");
          try {
            await this._acquireLock(0, async () => {
              try {
                let a10 = Date.now();
                try {
                  return await this._useSession(async (b2) => {
                    let { data: { session: c2 } } = b2;
                    if (!c2 || !c2.refresh_token || !c2.expires_at) return void this._debug("#_autoRefreshTokenTick()", "no session");
                    let d2 = Math.floor((1e3 * c2.expires_at - a10) / 3e4);
                    this._debug("#_autoRefreshTokenTick()", `access token expires in ${d2} ticks, a tick lasts 30000ms, refresh threshold is 3 ticks`), d2 <= 3 && await this._callRefreshToken(c2.refresh_token);
                  });
                } catch (a11) {
                  console.error("Auto refresh tick failed with error. This is likely a transient error.", a11);
                }
              } finally {
                this._debug("#_autoRefreshTokenTick()", "end");
              }
            });
          } catch (a10) {
            if (a10.isAcquireTimeout || a10 instanceof bs) this._debug("auto refresh token tick lock not available");
            else throw a10;
          }
        }
        async _handleVisibilityChange() {
          if (this._debug("#_handleVisibilityChange()"), !aU() || !(null == window ? void 0 : window.addEventListener)) return this.autoRefreshToken && this.startAutoRefresh(), false;
          try {
            this.visibilityChangedCallback = async () => await this._onVisibilityChanged(false), null == window || window.addEventListener("visibilitychange", this.visibilityChangedCallback), await this._onVisibilityChanged(true);
          } catch (a10) {
            console.error("_handleVisibilityChange", a10);
          }
        }
        async _onVisibilityChanged(a10) {
          let b2 = `#_onVisibilityChanged(${a10})`;
          this._debug(b2, "visibilityState", document.visibilityState), "visible" === document.visibilityState ? (this.autoRefreshToken && this._startAutoRefresh(), a10 || (await this.initializePromise, await this._acquireLock(-1, async () => {
            if ("visible" !== document.visibilityState) return void this._debug(b2, "acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting");
            await this._recoverAndRefresh();
          }))) : "hidden" === document.visibilityState && this.autoRefreshToken && this._stopAutoRefresh();
        }
        async _getUrlForProvider(a10, b2, c2) {
          let d2 = [`provider=${encodeURIComponent(b2)}`];
          if ((null == c2 ? void 0 : c2.redirectTo) && d2.push(`redirect_to=${encodeURIComponent(c2.redirectTo)}`), (null == c2 ? void 0 : c2.scopes) && d2.push(`scopes=${encodeURIComponent(c2.scopes)}`), "pkce" === this.flowType) {
            let [a11, b3] = await a5(this.storage, this.storageKey), c3 = new URLSearchParams({ code_challenge: `${encodeURIComponent(a11)}`, code_challenge_method: `${encodeURIComponent(b3)}` });
            d2.push(c3.toString());
          }
          if (null == c2 ? void 0 : c2.queryParams) {
            let a11 = new URLSearchParams(c2.queryParams);
            d2.push(a11.toString());
          }
          return (null == c2 ? void 0 : c2.skipBrowserRedirect) && d2.push(`skip_http_redirect=${c2.skipBrowserRedirect}`), `${a10}?${d2.join("&")}`;
        }
        async _unenroll(a10) {
          try {
            return await this._useSession(async (b2) => {
              var c2;
              let { data: d2, error: e2 } = b2;
              return e2 ? { data: null, error: e2 } : await bf(this.fetch, "DELETE", `${this.url}/factors/${a10.factorId}`, { headers: this.headers, jwt: null == (c2 = null == d2 ? void 0 : d2.session) ? void 0 : c2.access_token });
            });
          } catch (a11) {
            if (aB(a11)) return { data: null, error: a11 };
            throw a11;
          }
        }
        async _enroll(a10) {
          try {
            return await this._useSession(async (b2) => {
              var c2, d2;
              let { data: e2, error: f2 } = b2;
              if (f2) return { data: null, error: f2 };
              let g2 = Object.assign({ friendly_name: a10.friendlyName, factor_type: a10.factorType }, "phone" === a10.factorType ? { phone: a10.phone } : { issuer: a10.issuer }), { data: h2, error: i2 } = await bf(this.fetch, "POST", `${this.url}/factors`, { body: g2, headers: this.headers, jwt: null == (c2 = null == e2 ? void 0 : e2.session) ? void 0 : c2.access_token });
              return i2 ? { data: null, error: i2 } : ("totp" === a10.factorType && (null == (d2 = null == h2 ? void 0 : h2.totp) ? void 0 : d2.qr_code) && (h2.totp.qr_code = `data:image/svg+xml;utf-8,${h2.totp.qr_code}`), { data: h2, error: null });
            });
          } catch (a11) {
            if (aB(a11)) return { data: null, error: a11 };
            throw a11;
          }
        }
        async _verify(a10) {
          return this._acquireLock(-1, async () => {
            try {
              return await this._useSession(async (b2) => {
                var c2;
                let { data: d2, error: e2 } = b2;
                if (e2) return { data: null, error: e2 };
                let { data: f2, error: g2 } = await bf(this.fetch, "POST", `${this.url}/factors/${a10.factorId}/verify`, { body: { code: a10.code, challenge_id: a10.challengeId }, headers: this.headers, jwt: null == (c2 = null == d2 ? void 0 : d2.session) ? void 0 : c2.access_token });
                return g2 ? { data: null, error: g2 } : (await this._saveSession(Object.assign({ expires_at: Math.round(Date.now() / 1e3) + f2.expires_in }, f2)), await this._notifyAllSubscribers("MFA_CHALLENGE_VERIFIED", f2), { data: f2, error: g2 });
              });
            } catch (a11) {
              if (aB(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        async _challenge(a10) {
          return this._acquireLock(-1, async () => {
            try {
              return await this._useSession(async (b2) => {
                var c2;
                let { data: d2, error: e2 } = b2;
                return e2 ? { data: null, error: e2 } : await bf(this.fetch, "POST", `${this.url}/factors/${a10.factorId}/challenge`, { body: { channel: a10.channel }, headers: this.headers, jwt: null == (c2 = null == d2 ? void 0 : d2.session) ? void 0 : c2.access_token });
              });
            } catch (a11) {
              if (aB(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        async _challengeAndVerify(a10) {
          let { data: b2, error: c2 } = await this._challenge({ factorId: a10.factorId });
          return c2 ? { data: null, error: c2 } : await this._verify({ factorId: a10.factorId, challengeId: b2.id, code: a10.code });
        }
        async _listFactors() {
          let { data: { user: a10 }, error: b2 } = await this.getUser();
          if (b2) return { data: null, error: b2 };
          let c2 = (null == a10 ? void 0 : a10.factors) || [], d2 = c2.filter((a11) => "totp" === a11.factor_type && "verified" === a11.status), e2 = c2.filter((a11) => "phone" === a11.factor_type && "verified" === a11.status);
          return { data: { all: c2, totp: d2, phone: e2 }, error: null };
        }
        async _getAuthenticatorAssuranceLevel() {
          return this._acquireLock(-1, async () => await this._useSession(async (a10) => {
            var b2, c2;
            let { data: { session: d2 }, error: e2 } = a10;
            if (e2) return { data: null, error: e2 };
            if (!d2) return { data: { currentLevel: null, nextLevel: null, currentAuthenticationMethods: [] }, error: null };
            let { payload: f2 } = a0(d2.access_token), g2 = null;
            f2.aal && (g2 = f2.aal);
            let h2 = g2;
            return (null != (c2 = null == (b2 = d2.user.factors) ? void 0 : b2.filter((a11) => "verified" === a11.status)) ? c2 : []).length > 0 && (h2 = "aal2"), { data: { currentLevel: g2, nextLevel: h2, currentAuthenticationMethods: f2.amr || [] }, error: null };
          }));
        }
        async fetchJwk(a10, b2 = { keys: [] }) {
          let c2 = b2.keys.find((b3) => b3.kid === a10);
          if (c2) return c2;
          let d2 = Date.now();
          if ((c2 = this.jwks.keys.find((b3) => b3.kid === a10)) && this.jwks_cached_at + 6e5 > d2) return c2;
          let { data: e2, error: f2 } = await bf(this.fetch, "GET", `${this.url}/.well-known/jwks.json`, { headers: this.headers });
          if (f2) throw f2;
          return e2.keys && 0 !== e2.keys.length && (this.jwks = e2, this.jwks_cached_at = d2, c2 = e2.keys.find((b3) => b3.kid === a10)) ? c2 : null;
        }
        async getClaims(a10, b2 = {}) {
          try {
            let c2 = a10;
            if (!c2) {
              let { data: a11, error: b3 } = await this.getSession();
              if (b3 || !a11.session) return { data: null, error: b3 };
              c2 = a11.session.access_token;
            }
            let { header: d2, payload: e2, signature: f2, raw: { header: g2, payload: h2 } } = a0(c2);
            (null == b2 ? void 0 : b2.allowExpired) || function(a11) {
              if (!a11) throw Error("Missing exp claim");
              if (a11 <= Math.floor(Date.now() / 1e3)) throw Error("JWT has expired");
            }(e2.exp);
            let i2 = !d2.alg || d2.alg.startsWith("HS") || !d2.kid || !("crypto" in globalThis && "subtle" in globalThis.crypto) ? null : await this.fetchJwk(d2.kid, (null == b2 ? void 0 : b2.keys) ? { keys: b2.keys } : null == b2 ? void 0 : b2.jwks);
            if (!i2) {
              let { error: a11 } = await this.getUser(c2);
              if (a11) throw a11;
              return { data: { claims: e2, header: d2, signature: f2 }, error: null };
            }
            let j2 = function(a11) {
              switch (a11) {
                case "RS256":
                  return { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } };
                case "ES256":
                  return { name: "ECDSA", namedCurve: "P-256", hash: { name: "SHA-256" } };
                default:
                  throw Error("Invalid alg claim");
              }
            }(d2.alg), k2 = await crypto.subtle.importKey("jwk", i2, j2, true, ["verify"]);
            if (!await crypto.subtle.verify(j2, k2, f2, function(a11) {
              let b3 = [];
              return !function(a12, b4) {
                for (let c3 = 0; c3 < a12.length; c3 += 1) {
                  let d3 = a12.charCodeAt(c3);
                  if (d3 > 55295 && d3 <= 56319) {
                    let b5 = (d3 - 55296) * 1024 & 65535;
                    d3 = (a12.charCodeAt(c3 + 1) - 56320 & 65535 | b5) + 65536, c3 += 1;
                  }
                  !function(a13, b5) {
                    if (a13 <= 127) return b5(a13);
                    if (a13 <= 2047) {
                      b5(192 | a13 >> 6), b5(128 | 63 & a13);
                      return;
                    }
                    if (a13 <= 65535) {
                      b5(224 | a13 >> 12), b5(128 | a13 >> 6 & 63), b5(128 | 63 & a13);
                      return;
                    }
                    if (a13 <= 1114111) {
                      b5(240 | a13 >> 18), b5(128 | a13 >> 12 & 63), b5(128 | a13 >> 6 & 63), b5(128 | 63 & a13);
                      return;
                    }
                    throw Error(`Unrecognized Unicode codepoint: ${a13.toString(16)}`);
                  }(d3, b4);
                }
              }(a11, (a12) => b3.push(a12)), new Uint8Array(b3);
            }(`${g2}.${h2}`))) throw new aN("Invalid JWT signature");
            return { data: { claims: e2, header: d2, signature: f2 }, error: null };
          } catch (a11) {
            if (aB(a11)) return { data: null, error: a11 };
            throw a11;
          }
        }
      }
      by.nextInstanceID = 0;
      let bz = by;
      class bA extends bz {
        constructor(a10) {
          super(a10);
        }
      }
      class bB {
        constructor(a10, b2, c2) {
          var d2, e2, f2;
          this.supabaseUrl = a10, this.supabaseKey = b2;
          let g2 = function(a11) {
            let b3 = null == a11 ? void 0 : a11.trim();
            if (!b3) throw Error("supabaseUrl is required.");
            if (!b3.match(/^https?:\/\//i)) throw Error("Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.");
            try {
              return new URL(b3.endsWith("/") ? b3 : b3 + "/");
            } catch (a12) {
              throw Error("Invalid supabaseUrl: Provided URL is malformed.");
            }
          }(a10);
          if (!b2) throw Error("supabaseKey is required.");
          this.realtimeUrl = new URL("realtime/v1", g2), this.realtimeUrl.protocol = this.realtimeUrl.protocol.replace("http", "ws"), this.authUrl = new URL("auth/v1", g2), this.storageUrl = new URL("storage/v1", g2), this.functionsUrl = new URL("functions/v1", g2);
          let h2 = `sb-${g2.hostname.split(".")[0]}-auth-token`, i2 = function(a11, b3) {
            var c3, d3;
            let { db: e3, auth: f3, realtime: g3, global: h3 } = a11, { db: i3, auth: j2, realtime: k2, global: l2 } = b3, m2 = { db: Object.assign(Object.assign({}, i3), e3), auth: Object.assign(Object.assign({}, j2), f3), realtime: Object.assign(Object.assign({}, k2), g3), storage: {}, global: Object.assign(Object.assign(Object.assign({}, l2), h3), { headers: Object.assign(Object.assign({}, null != (c3 = null == l2 ? void 0 : l2.headers) ? c3 : {}), null != (d3 = null == h3 ? void 0 : h3.headers) ? d3 : {}) }), accessToken: () => {
              var a12, b4, c4, d4;
              return a12 = this, b4 = void 0, d4 = function* () {
                return "";
              }, new (c4 = void 0, c4 = Promise)(function(e4, f4) {
                function g4(a13) {
                  try {
                    i4(d4.next(a13));
                  } catch (a14) {
                    f4(a14);
                  }
                }
                function h4(a13) {
                  try {
                    i4(d4.throw(a13));
                  } catch (a14) {
                    f4(a14);
                  }
                }
                function i4(a13) {
                  var b5;
                  a13.done ? e4(a13.value) : ((b5 = a13.value) instanceof c4 ? b5 : new c4(function(a14) {
                    a14(b5);
                  })).then(g4, h4);
                }
                i4((d4 = d4.apply(a12, b4 || [])).next());
              });
            } };
            return a11.accessToken ? m2.accessToken = a11.accessToken : delete m2.accessToken, m2;
          }(null != c2 ? c2 : {}, { db: ar, realtime: at, auth: Object.assign(Object.assign({}, as), { storageKey: h2 }), global: aq });
          this.storageKey = null != (d2 = i2.auth.storageKey) ? d2 : "", this.headers = null != (e2 = i2.global.headers) ? e2 : {}, i2.accessToken ? (this.accessToken = i2.accessToken, this.auth = new Proxy({}, { get: (a11, b3) => {
            throw Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(b3)} is not possible`);
          } })) : this.auth = this._initSupabaseAuthClient(null != (f2 = i2.auth) ? f2 : {}, this.headers, i2.global.fetch), this.fetch = ((a11, b3, c3) => {
            let d3 = ((a12) => {
              let b4;
              return b4 = a12 || ("undefined" == typeof fetch ? au.default : fetch), (...a13) => b4(...a13);
            })(c3), e3 = "undefined" == typeof Headers ? au.Headers : Headers;
            return (c4, f3) => function(a12, b4, c5, d4) {
              return new (c5 || (c5 = Promise))(function(e4, f4) {
                function g3(a13) {
                  try {
                    i3(d4.next(a13));
                  } catch (a14) {
                    f4(a14);
                  }
                }
                function h3(a13) {
                  try {
                    i3(d4.throw(a13));
                  } catch (a14) {
                    f4(a14);
                  }
                }
                function i3(a13) {
                  var b5;
                  a13.done ? e4(a13.value) : ((b5 = a13.value) instanceof c5 ? b5 : new c5(function(a14) {
                    a14(b5);
                  })).then(g3, h3);
                }
                i3((d4 = d4.apply(a12, b4 || [])).next());
              });
            }(void 0, void 0, void 0, function* () {
              var g3;
              let h3 = null != (g3 = yield b3()) ? g3 : a11, i3 = new e3(null == f3 ? void 0 : f3.headers);
              return i3.has("apikey") || i3.set("apikey", a11), i3.has("Authorization") || i3.set("Authorization", `Bearer ${h3}`), d3(c4, Object.assign(Object.assign({}, f3), { headers: i3 }));
            });
          })(b2, this._getAccessToken.bind(this), i2.global.fetch), this.realtime = this._initRealtimeClient(Object.assign({ headers: this.headers, accessToken: this._getAccessToken.bind(this) }, i2.realtime)), this.rest = new j(new URL("rest/v1", g2).href, { headers: this.headers, schema: i2.db.schema, fetch: this.fetch }), this.storage = new ao(this.storageUrl.href, this.headers, this.fetch, null == c2 ? void 0 : c2.storage), i2.accessToken || this._listenForAuthEvents();
        }
        get functions() {
          return new i(this.functionsUrl.href, { headers: this.headers, customFetch: this.fetch });
        }
        from(a10) {
          return this.rest.from(a10);
        }
        schema(a10) {
          return this.rest.schema(a10);
        }
        rpc(a10, b2 = {}, c2 = {}) {
          return this.rest.rpc(a10, b2, c2);
        }
        channel(a10, b2 = { config: {} }) {
          return this.realtime.channel(a10, b2);
        }
        getChannels() {
          return this.realtime.getChannels();
        }
        removeChannel(a10) {
          return this.realtime.removeChannel(a10);
        }
        removeAllChannels() {
          return this.realtime.removeAllChannels();
        }
        _getAccessToken() {
          var a10, b2, c2, d2, e2, f2;
          return c2 = this, d2 = void 0, e2 = void 0, f2 = function* () {
            if (this.accessToken) return yield this.accessToken();
            let { data: c3 } = yield this.auth.getSession();
            return null != (b2 = null == (a10 = c3.session) ? void 0 : a10.access_token) ? b2 : this.supabaseKey;
          }, new (e2 || (e2 = Promise))(function(a11, b3) {
            function g2(a12) {
              try {
                i2(f2.next(a12));
              } catch (a13) {
                b3(a13);
              }
            }
            function h2(a12) {
              try {
                i2(f2.throw(a12));
              } catch (a13) {
                b3(a13);
              }
            }
            function i2(b4) {
              var c3;
              b4.done ? a11(b4.value) : ((c3 = b4.value) instanceof e2 ? c3 : new e2(function(a12) {
                a12(c3);
              })).then(g2, h2);
            }
            i2((f2 = f2.apply(c2, d2 || [])).next());
          });
        }
        _initSupabaseAuthClient({ autoRefreshToken: a10, persistSession: b2, detectSessionInUrl: c2, storage: d2, userStorage: e2, storageKey: f2, flowType: g2, lock: h2, debug: i2 }, j2, k2) {
          let l2 = { Authorization: `Bearer ${this.supabaseKey}`, apikey: `${this.supabaseKey}` };
          return new bA({ url: this.authUrl.href, headers: Object.assign(Object.assign({}, l2), j2), storageKey: f2, autoRefreshToken: a10, persistSession: b2, detectSessionInUrl: c2, storage: d2, userStorage: e2, flowType: g2, lock: h2, debug: i2, fetch: k2, hasCustomAuthorizationHeader: Object.keys(this.headers).some((a11) => "authorization" === a11.toLowerCase()) });
        }
        _initRealtimeClient(a10) {
          return new J(this.realtimeUrl.href, Object.assign(Object.assign({}, a10), { params: Object.assign({ apikey: this.supabaseKey }, null == a10 ? void 0 : a10.params) }));
        }
        _listenForAuthEvents() {
          return this.auth.onAuthStateChange((a10, b2) => {
            this._handleTokenChanged(a10, "CLIENT", null == b2 ? void 0 : b2.access_token);
          });
        }
        _handleTokenChanged(a10, b2, c2) {
          ("TOKEN_REFRESHED" === a10 || "SIGNED_IN" === a10) && this.changedAccessToken !== c2 ? this.changedAccessToken = c2 : "SIGNED_OUT" === a10 && (this.realtime.setAuth(), "STORAGE" == b2 && this.auth.signOut(), this.changedAccessToken = void 0);
        }
      }
      (function() {
        if ("undefined" != typeof window || "undefined" == typeof process) return false;
        let a10 = process.version;
        if (null == a10) return false;
        let b2 = a10.match(/^v(\d+)\./);
        return !!b2 && 18 >= parseInt(b2[1], 10);
      })() && console.warn(`\u26A0\uFE0F  Node.js 18 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 20 or later. For more information, visit: https://github.com/orgs/supabase/discussions/37217`);
      var bC = Object.create, bD = Object.defineProperty, bE = Object.getOwnPropertyDescriptor, bF = Object.getOwnPropertyNames, bG = Object.getPrototypeOf, bH = Object.prototype.hasOwnProperty, bI = (a10, b2, c2) => (c2 = null != a10 ? bC(bG(a10)) : {}, ((a11, b3, c3, d2) => {
        if (b3 && "object" == typeof b3 || "function" == typeof b3) for (let e2 of bF(b3)) bH.call(a11, e2) || e2 === c3 || bD(a11, e2, { get: () => b3[e2], enumerable: !(d2 = bE(b3, e2)) || d2.enumerable });
        return a11;
      })(!b2 && a10 && a10.__esModule ? c2 : bD(c2, "default", { value: a10, enumerable: true }), a10)), bJ = /* @__PURE__ */ ((a10, b2) => function() {
        return b2 || (0, a10[bF(a10)[0]])((b2 = { exports: {} }).exports, b2), b2.exports;
      })({ "../../node_modules/.pnpm/cookie@0.5.0/node_modules/cookie/index.js"(a10) {
        a10.parse = function(a11, b3) {
          if ("string" != typeof a11) throw TypeError("argument str must be a string");
          for (var c3 = {}, e3 = (b3 || {}).decode || d2, f2 = 0; f2 < a11.length; ) {
            var g2 = a11.indexOf("=", f2);
            if (-1 === g2) break;
            var h2 = a11.indexOf(";", f2);
            if (-1 === h2) h2 = a11.length;
            else if (h2 < g2) {
              f2 = a11.lastIndexOf(";", g2 - 1) + 1;
              continue;
            }
            var i2 = a11.slice(f2, g2).trim();
            if (void 0 === c3[i2]) {
              var j2 = a11.slice(g2 + 1, h2).trim();
              34 === j2.charCodeAt(0) && (j2 = j2.slice(1, -1)), c3[i2] = function(a12, b4) {
                try {
                  return b4(a12);
                } catch (b5) {
                  return a12;
                }
              }(j2, e3);
            }
            f2 = h2 + 1;
          }
          return c3;
        }, a10.serialize = function(a11, d3, f2) {
          var g2 = f2 || {}, h2 = g2.encode || e2;
          if ("function" != typeof h2) throw TypeError("option encode is invalid");
          if (!c2.test(a11)) throw TypeError("argument name is invalid");
          var i2 = h2(d3);
          if (i2 && !c2.test(i2)) throw TypeError("argument val is invalid");
          var j2 = a11 + "=" + i2;
          if (null != g2.maxAge) {
            var k2 = g2.maxAge - 0;
            if (isNaN(k2) || !isFinite(k2)) throw TypeError("option maxAge is invalid");
            j2 += "; Max-Age=" + Math.floor(k2);
          }
          if (g2.domain) {
            if (!c2.test(g2.domain)) throw TypeError("option domain is invalid");
            j2 += "; Domain=" + g2.domain;
          }
          if (g2.path) {
            if (!c2.test(g2.path)) throw TypeError("option path is invalid");
            j2 += "; Path=" + g2.path;
          }
          if (g2.expires) {
            var l2, m2 = g2.expires;
            if (l2 = m2, "[object Date]" !== b2.call(l2) && !(l2 instanceof Date) || isNaN(m2.valueOf())) throw TypeError("option expires is invalid");
            j2 += "; Expires=" + m2.toUTCString();
          }
          if (g2.httpOnly && (j2 += "; HttpOnly"), g2.secure && (j2 += "; Secure"), g2.priority) switch ("string" == typeof g2.priority ? g2.priority.toLowerCase() : g2.priority) {
            case "low":
              j2 += "; Priority=Low";
              break;
            case "medium":
              j2 += "; Priority=Medium";
              break;
            case "high":
              j2 += "; Priority=High";
              break;
            default:
              throw TypeError("option priority is invalid");
          }
          if (g2.sameSite) switch ("string" == typeof g2.sameSite ? g2.sameSite.toLowerCase() : g2.sameSite) {
            case true:
            case "strict":
              j2 += "; SameSite=Strict";
              break;
            case "lax":
              j2 += "; SameSite=Lax";
              break;
            case "none":
              j2 += "; SameSite=None";
              break;
            default:
              throw TypeError("option sameSite is invalid");
          }
          return j2;
        };
        var b2 = Object.prototype.toString, c2 = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
        function d2(a11) {
          return -1 !== a11.indexOf("%") ? decodeURIComponent(a11) : a11;
        }
        function e2(a11) {
          return encodeURIComponent(a11);
        }
      } }), bK = bI(bJ()), bL = bI(bJ());
      function bM(a10) {
        if (!a10) return null;
        try {
          let b2 = JSON.parse(a10);
          if (!b2) return null;
          if ("Object" === b2.constructor.name) return b2;
          if ("Array" !== b2.constructor.name) throw Error(`Unexpected format: ${b2.constructor.name}`);
          let [c2, e2, f2] = b2[0].split("."), g2 = ((a11) => {
            let b3 = a11;
            b3 instanceof Uint8Array && (b3 = d.decode(b3)), b3 = b3.replace(/-/g, "+").replace(/_/g, "/").replace(/\s/g, "");
            try {
              var c3 = b3;
              let a12 = atob(c3), d2 = new Uint8Array(a12.length);
              for (let b4 = 0; b4 < a12.length; b4++) d2[b4] = a12.charCodeAt(b4);
              return d2;
            } catch (a12) {
              throw TypeError("The input to be decoded is not correctly encoded.");
            }
          })(e2), h2 = new TextDecoder(), { exp: i2, sub: j2, ...k2 } = JSON.parse(h2.decode(g2));
          return { expires_at: i2, expires_in: i2 - Math.round(Date.now() / 1e3), token_type: "bearer", access_token: b2[0], refresh_token: b2[1], provider_token: b2[2], provider_refresh_token: b2[3], user: { id: j2, factors: b2[4], ...k2 } };
        } catch (a11) {
          return console.warn("Failed to parse cookie string:", a11), null;
        }
      }
      function bN(a10) {
        var b2;
        return JSON.stringify([a10.access_token, a10.refresh_token, a10.provider_token, a10.provider_refresh_token, (null == (b2 = a10.user) ? void 0 : b2.factors) ?? null]);
      }
      function bO() {
        return "undefined" != typeof window && void 0 !== window.document;
      }
      var bP = { path: "/", sameSite: "lax", maxAge: 31536e6 }, bQ = RegExp(".{1,3180}", "g"), bR = class {
        constructor(a10) {
          this.cookieOptions = { ...bP, ...a10, maxAge: bP.maxAge };
        }
        getItem(a10) {
          let b2 = this.getCookie(a10);
          if (a10.endsWith("-code-verifier") && b2) return b2;
          if (b2) return JSON.stringify(bM(b2));
          let c2 = function(a11, b3 = () => null) {
            let c3 = [];
            for (let d2 = 0; ; d2++) {
              let e2 = b3(`${a11}.${d2}`);
              if (!e2) break;
              c3.push(e2);
            }
            return c3.length ? c3.join("") : null;
          }(a10, (a11) => this.getCookie(a11));
          return null !== c2 ? JSON.stringify(bM(c2)) : null;
        }
        setItem(a10, b2) {
          if (a10.endsWith("-code-verifier")) return void this.setCookie(a10, b2);
          (function(a11, b3, c2) {
            if (1 === Math.ceil(b3.length / 3180)) return [{ name: a11, value: b3 }];
            let d2 = [], e2 = b3.match(bQ);
            return null == e2 || e2.forEach((b4, c3) => {
              let e3 = `${a11}.${c3}`;
              d2.push({ name: e3, value: b4 });
            }), d2;
          })(a10, bN(JSON.parse(b2))).forEach((a11) => {
            this.setCookie(a11.name, a11.value);
          });
        }
        removeItem(a10) {
          this._deleteSingleCookie(a10), this._deleteChunkedCookies(a10);
        }
        _deleteSingleCookie(a10) {
          this.getCookie(a10) && this.deleteCookie(a10);
        }
        _deleteChunkedCookies(a10, b2 = 0) {
          for (let c2 = b2; ; c2++) {
            let b3 = `${a10}.${c2}`;
            if (void 0 === this.getCookie(b3)) break;
            this.deleteCookie(b3);
          }
        }
      }, bS = class extends bR {
        constructor(a10) {
          super(a10);
        }
        getCookie(a10) {
          return bO() ? (0, bK.parse)(document.cookie)[a10] : null;
        }
        setCookie(a10, b2) {
          if (!bO()) return null;
          document.cookie = (0, bK.serialize)(a10, b2, { ...this.cookieOptions, httpOnly: false });
        }
        deleteCookie(a10) {
          if (!bO()) return null;
          document.cookie = (0, bK.serialize)(a10, "", { ...this.cookieOptions, maxAge: 0, httpOnly: false });
        }
      };
      function bT(a10, b2, c2) {
        var d2;
        let e2 = bO();
        return new bB(a10, b2, { ...c2, auth: { flowType: "pkce", autoRefreshToken: e2, detectSessionInUrl: e2, persistSession: true, storage: c2.auth.storage, ...(null == (d2 = c2.auth) ? void 0 : d2.storageKey) ? { storageKey: c2.auth.storageKey } : {} } });
      }
      var bU = bL.parse, bV = bL.serialize;
    }, 747: function(a, b, c) {
      "use strict";
      var d = this && this.__importDefault || function(a2) {
        return a2 && a2.__esModule ? a2 : { default: a2 };
      };
      Object.defineProperty(b, "__esModule", { value: true }), b.PostgrestError = b.PostgrestBuilder = b.PostgrestTransformBuilder = b.PostgrestFilterBuilder = b.PostgrestQueryBuilder = b.PostgrestClient = void 0;
      let e = d(c(617));
      b.PostgrestClient = e.default;
      let f = d(c(902));
      b.PostgrestQueryBuilder = f.default;
      let g = d(c(549));
      b.PostgrestFilterBuilder = g.default;
      let h = d(c(141));
      b.PostgrestTransformBuilder = h.default;
      let i = d(c(927));
      b.PostgrestBuilder = i.default;
      let j = d(c(592));
      b.PostgrestError = j.default, b.default = { PostgrestClient: e.default, PostgrestQueryBuilder: f.default, PostgrestFilterBuilder: g.default, PostgrestTransformBuilder: h.default, PostgrestBuilder: i.default, PostgrestError: j.default };
    }, 902: function(a, b, c) {
      "use strict";
      var d = this && this.__importDefault || function(a2) {
        return a2 && a2.__esModule ? a2 : { default: a2 };
      };
      Object.defineProperty(b, "__esModule", { value: true });
      let e = d(c(549));
      class f {
        constructor(a2, { headers: b2 = {}, schema: c2, fetch: d2 }) {
          this.url = a2, this.headers = new Headers(b2), this.schema = c2, this.fetch = d2;
        }
        select(a2, { head: b2 = false, count: c2 } = {}) {
          let d2 = false, f2 = (null != a2 ? a2 : "*").split("").map((a3) => /\s/.test(a3) && !d2 ? "" : ('"' === a3 && (d2 = !d2), a3)).join("");
          return this.url.searchParams.set("select", f2), c2 && this.headers.append("Prefer", `count=${c2}`), new e.default({ method: b2 ? "HEAD" : "GET", url: this.url, headers: this.headers, schema: this.schema, fetch: this.fetch });
        }
        insert(a2, { count: b2, defaultToNull: c2 = true } = {}) {
          var d2;
          if (b2 && this.headers.append("Prefer", `count=${b2}`), c2 || this.headers.append("Prefer", "missing=default"), Array.isArray(a2)) {
            let b3 = a2.reduce((a3, b4) => a3.concat(Object.keys(b4)), []);
            if (b3.length > 0) {
              let a3 = [...new Set(b3)].map((a4) => `"${a4}"`);
              this.url.searchParams.set("columns", a3.join(","));
            }
          }
          return new e.default({ method: "POST", url: this.url, headers: this.headers, schema: this.schema, body: a2, fetch: null != (d2 = this.fetch) ? d2 : fetch });
        }
        upsert(a2, { onConflict: b2, ignoreDuplicates: c2 = false, count: d2, defaultToNull: f2 = true } = {}) {
          var g;
          if (this.headers.append("Prefer", `resolution=${c2 ? "ignore" : "merge"}-duplicates`), void 0 !== b2 && this.url.searchParams.set("on_conflict", b2), d2 && this.headers.append("Prefer", `count=${d2}`), f2 || this.headers.append("Prefer", "missing=default"), Array.isArray(a2)) {
            let b3 = a2.reduce((a3, b4) => a3.concat(Object.keys(b4)), []);
            if (b3.length > 0) {
              let a3 = [...new Set(b3)].map((a4) => `"${a4}"`);
              this.url.searchParams.set("columns", a3.join(","));
            }
          }
          return new e.default({ method: "POST", url: this.url, headers: this.headers, schema: this.schema, body: a2, fetch: null != (g = this.fetch) ? g : fetch });
        }
        update(a2, { count: b2 } = {}) {
          var c2;
          return b2 && this.headers.append("Prefer", `count=${b2}`), new e.default({ method: "PATCH", url: this.url, headers: this.headers, schema: this.schema, body: a2, fetch: null != (c2 = this.fetch) ? c2 : fetch });
        }
        delete({ count: a2 } = {}) {
          var b2;
          return a2 && this.headers.append("Prefer", `count=${a2}`), new e.default({ method: "DELETE", url: this.url, headers: this.headers, schema: this.schema, fetch: null != (b2 = this.fetch) ? b2 : fetch });
        }
      }
      b.default = f;
    }, 927: function(a, b, c) {
      "use strict";
      var d = this && this.__importDefault || function(a2) {
        return a2 && a2.__esModule ? a2 : { default: a2 };
      };
      Object.defineProperty(b, "__esModule", { value: true });
      let e = d(c(411)), f = d(c(592));
      class g {
        constructor(a2) {
          var b2, c2;
          this.shouldThrowOnError = false, this.method = a2.method, this.url = a2.url, this.headers = new Headers(a2.headers), this.schema = a2.schema, this.body = a2.body, this.shouldThrowOnError = null != (b2 = a2.shouldThrowOnError) && b2, this.signal = a2.signal, this.isMaybeSingle = null != (c2 = a2.isMaybeSingle) && c2, a2.fetch ? this.fetch = a2.fetch : "undefined" == typeof fetch ? this.fetch = e.default : this.fetch = fetch;
        }
        throwOnError() {
          return this.shouldThrowOnError = true, this;
        }
        setHeader(a2, b2) {
          return this.headers = new Headers(this.headers), this.headers.set(a2, b2), this;
        }
        then(a2, b2) {
          void 0 === this.schema || (["GET", "HEAD"].includes(this.method) ? this.headers.set("Accept-Profile", this.schema) : this.headers.set("Content-Profile", this.schema)), "GET" !== this.method && "HEAD" !== this.method && this.headers.set("Content-Type", "application/json");
          let c2 = (0, this.fetch)(this.url.toString(), { method: this.method, headers: this.headers, body: JSON.stringify(this.body), signal: this.signal }).then(async (a3) => {
            var b3, c3, d2, e2;
            let g2 = null, h = null, i = null, j = a3.status, k = a3.statusText;
            if (a3.ok) {
              if ("HEAD" !== this.method) {
                let c4 = await a3.text();
                "" === c4 || (h = "text/csv" === this.headers.get("Accept") || this.headers.get("Accept") && (null == (b3 = this.headers.get("Accept")) ? void 0 : b3.includes("application/vnd.pgrst.plan+text")) ? c4 : JSON.parse(c4));
              }
              let e3 = null == (c3 = this.headers.get("Prefer")) ? void 0 : c3.match(/count=(exact|planned|estimated)/), f2 = null == (d2 = a3.headers.get("content-range")) ? void 0 : d2.split("/");
              e3 && f2 && f2.length > 1 && (i = parseInt(f2[1])), this.isMaybeSingle && "GET" === this.method && Array.isArray(h) && (h.length > 1 ? (g2 = { code: "PGRST116", details: `Results contain ${h.length} rows, application/vnd.pgrst.object+json requires 1 row`, hint: null, message: "JSON object requested, multiple (or no) rows returned" }, h = null, i = null, j = 406, k = "Not Acceptable") : h = 1 === h.length ? h[0] : null);
            } else {
              let b4 = await a3.text();
              try {
                g2 = JSON.parse(b4), Array.isArray(g2) && 404 === a3.status && (h = [], g2 = null, j = 200, k = "OK");
              } catch (c4) {
                404 === a3.status && "" === b4 ? (j = 204, k = "No Content") : g2 = { message: b4 };
              }
              if (g2 && this.isMaybeSingle && (null == (e2 = null == g2 ? void 0 : g2.details) ? void 0 : e2.includes("0 rows")) && (g2 = null, j = 200, k = "OK"), g2 && this.shouldThrowOnError) throw new f.default(g2);
            }
            return { error: g2, data: h, count: i, status: j, statusText: k };
          });
          return this.shouldThrowOnError || (c2 = c2.catch((a3) => {
            var b3, c3, d2;
            return { error: { message: `${null != (b3 = null == a3 ? void 0 : a3.name) ? b3 : "FetchError"}: ${null == a3 ? void 0 : a3.message}`, details: `${null != (c3 = null == a3 ? void 0 : a3.stack) ? c3 : ""}`, hint: "", code: `${null != (d2 = null == a3 ? void 0 : a3.code) ? d2 : ""}` }, data: null, count: null, status: 0, statusText: "" };
          })), c2.then(a2, b2);
        }
        returns() {
          return this;
        }
        overrideTypes() {
          return this;
        }
      }
      b.default = g;
    } }, (a) => {
      var b = a(a.s = 228);
      (_ENTRIES = "undefined" == typeof _ENTRIES ? {} : _ENTRIES)["middleware_src/middleware"] = b;
    }]);
  }
});

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js
var edgeFunctionHandler_exports = {};
__export(edgeFunctionHandler_exports, {
  default: () => edgeFunctionHandler
});
async function edgeFunctionHandler(request) {
  const path3 = new URL(request.url).pathname;
  const routes = globalThis._ROUTES;
  const correspondingRoute = routes.find((route) => route.regex.some((r) => new RegExp(r).test(path3)));
  if (!correspondingRoute) {
    throw new Error(`No route found for ${request.url}`);
  }
  const entry = await self._ENTRIES[`middleware_${correspondingRoute.name}`];
  const result = await entry.default({
    page: correspondingRoute.page,
    request: {
      ...request,
      page: {
        name: correspondingRoute.name
      }
    }
  });
  globalThis.__openNextAls.getStore()?.pendingPromiseRunner.add(result.waitUntil);
  const response = result.response;
  return response;
}
var init_edgeFunctionHandler = __esm({
  "../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js"() {
    globalThis._ENTRIES = {};
    globalThis.self = globalThis;
    globalThis._ROUTES = [{ "name": "src/middleware", "page": "/", "regex": ["^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/((?!_next\\/static|_next\\/image|favicon.ico|public).*))(\\.json)?[\\/#\\?]?$"] }];
    require_edge_runtime_webpack();
    require_middleware();
  }
});

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/utils/promise.js
init_logger();
var DetachedPromise = class {
  resolve;
  reject;
  promise;
  constructor() {
    let resolve;
    let reject;
    this.promise = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });
    this.resolve = resolve;
    this.reject = reject;
  }
};
var DetachedPromiseRunner = class {
  promises = [];
  withResolvers() {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    return detachedPromise;
  }
  add(promise) {
    const detachedPromise = new DetachedPromise();
    this.promises.push(detachedPromise);
    promise.then(detachedPromise.resolve, detachedPromise.reject);
  }
  async await() {
    debug(`Awaiting ${this.promises.length} detached promises`);
    const results = await Promise.allSettled(this.promises.map((p) => p.promise));
    const rejectedPromises = results.filter((r) => r.status === "rejected");
    rejectedPromises.forEach((r) => {
      error(r.reason);
    });
  }
};
async function awaitAllDetachedPromise() {
  const store = globalThis.__openNextAls.getStore();
  const promisesToAwait = store?.pendingPromiseRunner.await() ?? Promise.resolve();
  if (store?.waitUntil) {
    store.waitUntil(promisesToAwait);
    return;
  }
  await promisesToAwait;
}
function provideNextAfterProvider() {
  const NEXT_REQUEST_CONTEXT_SYMBOL = Symbol.for("@next/request-context");
  const VERCEL_REQUEST_CONTEXT_SYMBOL = Symbol.for("@vercel/request-context");
  const store = globalThis.__openNextAls.getStore();
  const waitUntil = store?.waitUntil ?? ((promise) => store?.pendingPromiseRunner.add(promise));
  const nextAfterContext = {
    get: () => ({
      waitUntil
    })
  };
  globalThis[NEXT_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  if (process.env.EMULATE_VERCEL_REQUEST_CONTEXT) {
    globalThis[VERCEL_REQUEST_CONTEXT_SYMBOL] = nextAfterContext;
  }
}
function runWithOpenNextRequestContext({ isISRRevalidation, waitUntil, requestId = Math.random().toString(36) }, fn) {
  return globalThis.__openNextAls.run({
    requestId,
    pendingPromiseRunner: new DetachedPromiseRunner(),
    isISRRevalidation,
    waitUntil,
    writtenTags: /* @__PURE__ */ new Set()
  }, async () => {
    provideNextAfterProvider();
    let result;
    try {
      result = await fn();
    } finally {
      await awaitAllDetachedPromise();
    }
    return result;
  });
}

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/adapters/middleware.js
init_logger();

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/core/createGenericHandler.js
init_logger();

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/core/resolve.js
async function resolveConverter(converter2) {
  if (typeof converter2 === "function") {
    return converter2();
  }
  const m_1 = await Promise.resolve().then(() => (init_edge(), edge_exports));
  return m_1.default;
}
async function resolveWrapper(wrapper) {
  if (typeof wrapper === "function") {
    return wrapper();
  }
  const m_1 = await Promise.resolve().then(() => (init_cloudflare_edge(), cloudflare_edge_exports));
  return m_1.default;
}
async function resolveOriginResolver(originResolver) {
  if (typeof originResolver === "function") {
    return originResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_pattern_env(), pattern_env_exports));
  return m_1.default;
}
async function resolveAssetResolver(assetResolver) {
  if (typeof assetResolver === "function") {
    return assetResolver();
  }
  const m_1 = await Promise.resolve().then(() => (init_dummy(), dummy_exports));
  return m_1.default;
}
async function resolveProxyRequest(proxyRequest) {
  if (typeof proxyRequest === "function") {
    return proxyRequest();
  }
  const m_1 = await Promise.resolve().then(() => (init_fetch(), fetch_exports));
  return m_1.default;
}

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/core/createGenericHandler.js
async function createGenericHandler(handler3) {
  const config = await import("./open-next.config.mjs").then((m) => m.default);
  globalThis.openNextConfig = config;
  const handlerConfig = config[handler3.type];
  const override = handlerConfig && "override" in handlerConfig ? handlerConfig.override : void 0;
  const converter2 = await resolveConverter(override?.converter);
  const { name, wrapper } = await resolveWrapper(override?.wrapper);
  debug("Using wrapper", name);
  return wrapper(handler3.handler, converter2);
}

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/core/routing/util.js
import crypto2 from "node:crypto";
import { parse as parseQs, stringify as stringifyQs } from "node:querystring";
import { Readable as Readable2 } from "node:stream";

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/adapters/config/index.js
init_logger();
import path from "node:path";
globalThis.__dirname ??= "";
var NEXT_DIR = path.join(__dirname, ".next");
var OPEN_NEXT_DIR = path.join(__dirname, ".open-next");
debug({ NEXT_DIR, OPEN_NEXT_DIR });
var NextConfig = { "env": {}, "webpack": null, "eslint": { "ignoreDuringBuilds": true }, "typescript": { "ignoreBuildErrors": true, "tsconfigPath": "tsconfig.json" }, "typedRoutes": false, "distDir": ".next", "cleanDistDir": true, "assetPrefix": "", "cacheMaxMemorySize": 52428800, "configOrigin": "next.config.mjs", "useFileSystemPublicRoutes": true, "generateEtags": true, "pageExtensions": ["tsx", "ts", "jsx", "js"], "poweredByHeader": true, "compress": true, "images": { "deviceSizes": [640, 750, 828, 1080, 1200, 1920, 2048, 3840], "imageSizes": [16, 32, 48, 64, 96, 128, 256, 384], "path": "/_next/image", "loader": "default", "loaderFile": "", "domains": [], "disableStaticImages": false, "minimumCacheTTL": 60, "formats": ["image/webp"], "dangerouslyAllowSVG": false, "contentSecurityPolicy": "script-src 'none'; frame-src 'none'; sandbox;", "contentDispositionType": "attachment", "remotePatterns": [], "unoptimized": true }, "devIndicators": { "position": "bottom-left" }, "onDemandEntries": { "maxInactiveAge": 6e4, "pagesBufferLength": 5 }, "amp": { "canonicalBase": "" }, "basePath": "", "sassOptions": {}, "trailingSlash": false, "i18n": null, "productionBrowserSourceMaps": false, "excludeDefaultMomentLocales": true, "serverRuntimeConfig": {}, "publicRuntimeConfig": {}, "reactProductionProfiling": false, "reactStrictMode": null, "reactMaxHeadersLength": 6e3, "httpAgentOptions": { "keepAlive": true }, "logging": {}, "compiler": {}, "expireTime": 31536e3, "staticPageGenerationTimeout": 60, "output": "standalone", "modularizeImports": { "@mui/icons-material": { "transform": "@mui/icons-material/{{member}}" }, "lodash": { "transform": "lodash/{{member}}" } }, "outputFileTracingRoot": "/root/altamedica-reboot-fresh", "experimental": { "useSkewCookie": false, "cacheLife": { "default": { "stale": 300, "revalidate": 900, "expire": 4294967294 }, "seconds": { "stale": 30, "revalidate": 1, "expire": 60 }, "minutes": { "stale": 300, "revalidate": 60, "expire": 3600 }, "hours": { "stale": 300, "revalidate": 3600, "expire": 86400 }, "days": { "stale": 300, "revalidate": 86400, "expire": 604800 }, "weeks": { "stale": 300, "revalidate": 604800, "expire": 2592e3 }, "max": { "stale": 300, "revalidate": 2592e3, "expire": 4294967294 } }, "cacheHandlers": {}, "cssChunking": true, "multiZoneDraftMode": false, "appNavFailHandling": false, "prerenderEarlyExit": true, "serverMinification": true, "serverSourceMaps": false, "linkNoTouchStart": false, "caseSensitiveRoutes": false, "clientSegmentCache": false, "clientParamParsing": false, "dynamicOnHover": false, "preloadEntriesOnStart": true, "clientRouterFilter": true, "clientRouterFilterRedirects": false, "fetchCacheKeyPrefix": "", "middlewarePrefetch": "flexible", "optimisticClientCache": true, "manualClientBasePath": false, "cpus": 3, "memoryBasedWorkersCount": false, "imgOptConcurrency": null, "imgOptTimeoutInSeconds": 7, "imgOptMaxInputPixels": 268402689, "imgOptSequentialRead": null, "imgOptSkipMetadata": null, "isrFlushToDisk": true, "workerThreads": false, "optimizeCss": false, "nextScriptWorkers": false, "scrollRestoration": false, "externalDir": false, "disableOptimizedLoading": false, "gzipSize": true, "craCompat": false, "esmExternals": true, "fullySpecified": false, "swcTraceProfiling": false, "forceSwcTransforms": false, "largePageDataBytes": 128e3, "typedEnv": false, "parallelServerCompiles": false, "parallelServerBuildTraces": false, "ppr": false, "authInterrupts": false, "webpackMemoryOptimizations": false, "optimizeServerReact": true, "viewTransition": false, "routerBFCache": false, "removeUncaughtErrorAndRejectionListeners": false, "validateRSCRequestHeaders": false, "staleTimes": { "dynamic": 0, "static": 300 }, "serverComponentsHmrCache": true, "staticGenerationMaxConcurrency": 8, "staticGenerationMinPagesPerWorker": 25, "cacheComponents": false, "inlineCss": false, "useCache": false, "globalNotFound": false, "devtoolSegmentExplorer": true, "browserDebugInfoInTerminal": false, "optimizeRouterScrolling": false, "optimizePackageImports": ["lucide-react", "date-fns", "lodash-es", "ramda", "antd", "react-bootstrap", "ahooks", "@ant-design/icons", "@headlessui/react", "@headlessui-float/react", "@heroicons/react/20/solid", "@heroicons/react/24/solid", "@heroicons/react/24/outline", "@visx/visx", "@tremor/react", "rxjs", "@mui/material", "@mui/icons-material", "recharts", "react-use", "effect", "@effect/schema", "@effect/platform", "@effect/platform-node", "@effect/platform-browser", "@effect/platform-bun", "@effect/sql", "@effect/sql-mssql", "@effect/sql-mysql2", "@effect/sql-pg", "@effect/sql-sqlite-node", "@effect/sql-sqlite-bun", "@effect/sql-sqlite-wasm", "@effect/sql-sqlite-react-native", "@effect/rpc", "@effect/rpc-http", "@effect/typeclass", "@effect/experimental", "@effect/opentelemetry", "@material-ui/core", "@material-ui/icons", "@tabler/icons-react", "mui-core", "react-icons/ai", "react-icons/bi", "react-icons/bs", "react-icons/cg", "react-icons/ci", "react-icons/di", "react-icons/fa", "react-icons/fa6", "react-icons/fc", "react-icons/fi", "react-icons/gi", "react-icons/go", "react-icons/gr", "react-icons/hi", "react-icons/hi2", "react-icons/im", "react-icons/io", "react-icons/io5", "react-icons/lia", "react-icons/lib", "react-icons/lu", "react-icons/md", "react-icons/pi", "react-icons/ri", "react-icons/rx", "react-icons/si", "react-icons/sl", "react-icons/tb", "react-icons/tfi", "react-icons/ti", "react-icons/vsc", "react-icons/wi"], "trustHostHeader": false, "isExperimentalCompile": false }, "htmlLimitedBots": "[\\w-]+-Google|Google-[\\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight", "bundlePagesRouterDependencies": false, "configFileName": "next.config.mjs", "turbopack": { "root": "/root/altamedica-reboot-fresh" } };
var BuildId = "FPiwa9U6sTeC-cR9vwb42";
var RoutesManifest = { "basePath": "", "rewrites": { "beforeFiles": [], "afterFiles": [], "fallback": [] }, "redirects": [{ "source": "/:path+/", "destination": "/:path+", "internal": true, "statusCode": 308, "regex": "^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))/$" }], "routes": { "static": [{ "page": "/", "regex": "^/(?:/)?$", "routeKeys": {}, "namedRegex": "^/(?:/)?$" }, { "page": "/_not-found", "regex": "^/_not\\-found(?:/)?$", "routeKeys": {}, "namedRegex": "^/_not\\-found(?:/)?$" }, { "page": "/auth/callback", "regex": "^/auth/callback(?:/)?$", "routeKeys": {}, "namedRegex": "^/auth/callback(?:/)?$" }, { "page": "/auth/callback-client", "regex": "^/auth/callback\\-client(?:/)?$", "routeKeys": {}, "namedRegex": "^/auth/callback\\-client(?:/)?$" }, { "page": "/auth/forgot-password", "regex": "^/auth/forgot\\-password(?:/)?$", "routeKeys": {}, "namedRegex": "^/auth/forgot\\-password(?:/)?$" }, { "page": "/auth/login", "regex": "^/auth/login(?:/)?$", "routeKeys": {}, "namedRegex": "^/auth/login(?:/)?$" }, { "page": "/auth/register", "regex": "^/auth/register(?:/)?$", "routeKeys": {}, "namedRegex": "^/auth/register(?:/)?$" }, { "page": "/auth/select-role", "regex": "^/auth/select\\-role(?:/)?$", "routeKeys": {}, "namedRegex": "^/auth/select\\-role(?:/)?$" }], "dynamic": [], "data": { "static": [], "dynamic": [] } }, "locales": [] };
var ConfigHeaders = [{ "source": "/:path*", "headers": [{ "key": "X-DNS-Prefetch-Control", "value": "on" }, { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }, { "key": "X-Frame-Options", "value": "SAMEORIGIN" }, { "key": "X-Content-Type-Options", "value": "nosniff" }, { "key": "X-XSS-Protection", "value": "1; mode=block" }, { "key": "Referrer-Policy", "value": "origin-when-cross-origin" }, { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }], "regex": "^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))?(?:/)?$" }];
var PrerenderManifest = { "version": 4, "routes": { "/_not-found": { "initialStatus": 404, "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/_not-found", "dataRoute": "/_not-found.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/auth/callback-client": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/auth/callback-client", "dataRoute": "/auth/callback-client.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/auth/callback": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/auth/callback", "dataRoute": "/auth/callback.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/auth/forgot-password": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/auth/forgot-password", "dataRoute": "/auth/forgot-password.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/auth/register": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/auth/register", "dataRoute": "/auth/register.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/auth/select-role": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/auth/select-role", "dataRoute": "/auth/select-role.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/", "dataRoute": "/index.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/auth/login": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/auth/login", "dataRoute": "/auth/login.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] } }, "dynamicRoutes": {}, "notFoundRoutes": [], "preview": { "previewModeId": "522e35c9b2f171d741836540245fd44a", "previewModeSigningKey": "ab1ffa86085ae9ce510b09b91493c99484a2f705cd6b2e672b5ce4bd5fffa29d", "previewModeEncryptionKey": "7af01d4a27ad8289e539db2fe9fece132b7fbdb2f2feb8da3ffea8197b585acd" } };
var MiddlewareManifest = { "version": 3, "middleware": { "/": { "files": ["server/edge-runtime-webpack.js", "server/src/middleware.js"], "name": "src/middleware", "page": "/", "matchers": [{ "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/((?!_next\\/static|_next\\/image|favicon.ico|public).*))(\\.json)?[\\/#\\?]?$", "originalSource": "/((?!_next/static|_next/image|favicon.ico|public).*)" }], "wasm": [], "assets": [], "env": { "__NEXT_BUILD_ID": "FPiwa9U6sTeC-cR9vwb42", "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY": "adfZVjUuO6Vwe5KUcTW5m3sQhCTAA2fwq31mfMzBlrQ=", "__NEXT_PREVIEW_MODE_ID": "522e35c9b2f171d741836540245fd44a", "__NEXT_PREVIEW_MODE_SIGNING_KEY": "ab1ffa86085ae9ce510b09b91493c99484a2f705cd6b2e672b5ce4bd5fffa29d", "__NEXT_PREVIEW_MODE_ENCRYPTION_KEY": "7af01d4a27ad8289e539db2fe9fece132b7fbdb2f2feb8da3ffea8197b585acd" } } }, "functions": {}, "sortedMiddleware": ["/"] };
var AppPathRoutesManifest = { "/_not-found/page": "/_not-found", "/auth/callback-client/page": "/auth/callback-client", "/auth/callback/page": "/auth/callback", "/auth/forgot-password/page": "/auth/forgot-password", "/auth/register/page": "/auth/register", "/auth/select-role/page": "/auth/select-role", "/page": "/", "/auth/login/page": "/auth/login" };
var FunctionsConfigManifest = { "version": 1, "functions": {} };
var PagesManifest = { "/_app": "pages/_app.js", "/_error": "pages/_error.js", "/_document": "pages/_document.js", "/404": "pages/404.html" };
process.env.NEXT_BUILD_ID = BuildId;

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/http/openNextResponse.js
init_logger();
init_util();
import { Transform } from "node:stream";

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/core/routing/util.js
init_util();
init_logger();

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/utils/binary.js
var commonBinaryMimeTypes = /* @__PURE__ */ new Set([
  "application/octet-stream",
  // Docs
  "application/epub+zip",
  "application/msword",
  "application/pdf",
  "application/rtf",
  "application/vnd.amazon.ebook",
  "application/vnd.ms-excel",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Fonts
  "font/otf",
  "font/woff",
  "font/woff2",
  // Images
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/png",
  "image/tiff",
  "image/vnd.microsoft.icon",
  "image/webp",
  // Audio
  "audio/3gpp",
  "audio/aac",
  "audio/basic",
  "audio/flac",
  "audio/mpeg",
  "audio/ogg",
  "audio/wavaudio/webm",
  "audio/x-aiff",
  "audio/x-midi",
  "audio/x-wav",
  // Video
  "video/3gpp",
  "video/mp2t",
  "video/mpeg",
  "video/ogg",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  // Archives
  "application/java-archive",
  "application/vnd.apple.installer+xml",
  "application/x-7z-compressed",
  "application/x-apple-diskimage",
  "application/x-bzip",
  "application/x-bzip2",
  "application/x-gzip",
  "application/x-java-archive",
  "application/x-rar-compressed",
  "application/x-tar",
  "application/x-zip",
  "application/zip",
  // Serialized data
  "application/x-protobuf"
]);
function isBinaryContentType(contentType) {
  if (!contentType)
    return false;
  const value = contentType?.split(";")[0] ?? "";
  return commonBinaryMimeTypes.has(value);
}

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js
init_stream();
init_logger();

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/core/routing/i18n/accept-header.js
function parse(raw, preferences, options) {
  const lowers = /* @__PURE__ */ new Map();
  const header = raw.replace(/[ \t]/g, "");
  if (preferences) {
    let pos = 0;
    for (const preference of preferences) {
      const lower = preference.toLowerCase();
      lowers.set(lower, { orig: preference, pos: pos++ });
      if (options.prefixMatch) {
        const parts2 = lower.split("-");
        while (parts2.pop(), parts2.length > 0) {
          const joined = parts2.join("-");
          if (!lowers.has(joined)) {
            lowers.set(joined, { orig: preference, pos: pos++ });
          }
        }
      }
    }
  }
  const parts = header.split(",");
  const selections = [];
  const map = /* @__PURE__ */ new Set();
  for (let i = 0; i < parts.length; ++i) {
    const part = parts[i];
    if (!part) {
      continue;
    }
    const params = part.split(";");
    if (params.length > 2) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const token = params[0].toLowerCase();
    if (!token) {
      throw new Error(`Invalid ${options.type} header`);
    }
    const selection = { token, pos: i, q: 1 };
    if (preferences && lowers.has(token)) {
      selection.pref = lowers.get(token).pos;
    }
    map.add(selection.token);
    if (params.length === 2) {
      const q = params[1];
      const [key, value] = q.split("=");
      if (!value || key !== "q" && key !== "Q") {
        throw new Error(`Invalid ${options.type} header`);
      }
      const score = Number.parseFloat(value);
      if (score === 0) {
        continue;
      }
      if (Number.isFinite(score) && score <= 1 && score >= 1e-3) {
        selection.q = score;
      }
    }
    selections.push(selection);
  }
  selections.sort((a, b) => {
    if (b.q !== a.q) {
      return b.q - a.q;
    }
    if (b.pref !== a.pref) {
      if (a.pref === void 0) {
        return 1;
      }
      if (b.pref === void 0) {
        return -1;
      }
      return a.pref - b.pref;
    }
    return a.pos - b.pos;
  });
  const values = selections.map((selection) => selection.token);
  if (!preferences || !preferences.length) {
    return values;
  }
  const preferred = [];
  for (const selection of values) {
    if (selection === "*") {
      for (const [preference, value] of lowers) {
        if (!map.has(preference)) {
          preferred.push(value.orig);
        }
      }
    } else {
      const lower = selection.toLowerCase();
      if (lowers.has(lower)) {
        preferred.push(lowers.get(lower).orig);
      }
    }
  }
  return preferred;
}
function acceptLanguage(header = "", preferences) {
  return parse(header, preferences, {
    type: "accept-language",
    prefixMatch: true
  })[0] || void 0;
}

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js
function isLocalizedPath(path3) {
  return NextConfig.i18n?.locales.includes(path3.split("/")[1].toLowerCase()) ?? false;
}
function getLocaleFromCookie(cookies) {
  const i18n = NextConfig.i18n;
  const nextLocale = cookies.NEXT_LOCALE?.toLowerCase();
  return nextLocale ? i18n?.locales.find((locale) => nextLocale === locale.toLowerCase()) : void 0;
}
function detectDomainLocale({ hostname, detectedLocale }) {
  const i18n = NextConfig.i18n;
  const domains = i18n?.domains;
  if (!domains) {
    return;
  }
  const lowercasedLocale = detectedLocale?.toLowerCase();
  for (const domain of domains) {
    const domainHostname = domain.domain.split(":", 1)[0].toLowerCase();
    if (hostname === domainHostname || lowercasedLocale === domain.defaultLocale.toLowerCase() || domain.locales?.some((locale) => lowercasedLocale === locale.toLowerCase())) {
      return domain;
    }
  }
}
function detectLocale(internalEvent, i18n) {
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  if (i18n.localeDetection === false) {
    return domainLocale?.defaultLocale ?? i18n.defaultLocale;
  }
  const cookiesLocale = getLocaleFromCookie(internalEvent.cookies);
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  debug({
    cookiesLocale,
    preferredLocale,
    defaultLocale: i18n.defaultLocale,
    domainLocale
  });
  return domainLocale?.defaultLocale ?? cookiesLocale ?? preferredLocale ?? i18n.defaultLocale;
}
function localizePath(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n) {
    return internalEvent.rawPath;
  }
  if (isLocalizedPath(internalEvent.rawPath)) {
    return internalEvent.rawPath;
  }
  const detectedLocale = detectLocale(internalEvent, i18n);
  return `/${detectedLocale}${internalEvent.rawPath}`;
}
function handleLocaleRedirect(internalEvent) {
  const i18n = NextConfig.i18n;
  if (!i18n || i18n.localeDetection === false || internalEvent.rawPath !== "/") {
    return false;
  }
  const preferredLocale = acceptLanguage(internalEvent.headers["accept-language"], i18n?.locales);
  const detectedLocale = detectLocale(internalEvent, i18n);
  const domainLocale = detectDomainLocale({
    hostname: internalEvent.headers.host
  });
  const preferredDomain = detectDomainLocale({
    detectedLocale: preferredLocale
  });
  if (domainLocale && preferredDomain) {
    const isPDomain = preferredDomain.domain === domainLocale.domain;
    const isPLocale = preferredDomain.defaultLocale === preferredLocale;
    if (!isPDomain || !isPLocale) {
      const scheme = `http${preferredDomain.http ? "" : "s"}`;
      const rlocale = isPLocale ? "" : preferredLocale;
      return {
        type: "core",
        statusCode: 307,
        headers: {
          Location: `${scheme}://${preferredDomain.domain}/${rlocale}`
        },
        body: emptyReadableStream(),
        isBase64Encoded: false
      };
    }
  }
  const defaultLocale = domainLocale?.defaultLocale ?? i18n.defaultLocale;
  if (detectedLocale.toLowerCase() !== defaultLocale.toLowerCase()) {
    return {
      type: "core",
      statusCode: 307,
      headers: {
        Location: constructNextUrl(internalEvent.url, `/${detectedLocale}`)
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/core/routing/queue.js
function generateShardId(rawPath, maxConcurrency, prefix) {
  let a = cyrb128(rawPath);
  let t = a += 1831565813;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  const randomFloat = ((t ^ t >>> 14) >>> 0) / 4294967296;
  const randomInt = Math.floor(randomFloat * maxConcurrency);
  return `${prefix}-${randomInt}`;
}
function generateMessageGroupId(rawPath) {
  const maxConcurrency = Number.parseInt(process.env.MAX_REVALIDATE_CONCURRENCY ?? "10");
  return generateShardId(rawPath, maxConcurrency, "revalidate");
}
function cyrb128(str) {
  let h1 = 1779033703;
  let h2 = 3144134277;
  let h3 = 1013904242;
  let h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ h1 >>> 18, 597399067);
  h2 = Math.imul(h4 ^ h2 >>> 22, 2869860233);
  h3 = Math.imul(h1 ^ h3 >>> 17, 951274213);
  h4 = Math.imul(h2 ^ h4 >>> 19, 2716044179);
  h1 ^= h2 ^ h3 ^ h4, h2 ^= h1, h3 ^= h1, h4 ^= h1;
  return h1 >>> 0;
}

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/core/routing/util.js
function isExternal(url, host) {
  if (!url)
    return false;
  const pattern = /^https?:\/\//;
  if (host) {
    return pattern.test(url) && !url.includes(host);
  }
  return pattern.test(url);
}
function convertFromQueryString(query) {
  if (query === "")
    return {};
  const queryParts = query.split("&");
  return getQueryFromIterator(queryParts.map((p) => {
    const [key, value] = p.split("=");
    return [key, value];
  }));
}
function getUrlParts(url, isExternal2) {
  if (!isExternal2) {
    const regex2 = /\/([^?]*)\??(.*)/;
    const match3 = url.match(regex2);
    return {
      hostname: "",
      pathname: match3?.[1] ? `/${match3[1]}` : url,
      protocol: "",
      queryString: match3?.[2] ?? ""
    };
  }
  const regex = /^(https?:)\/\/?([^\/\s]+)(\/[^?]*)?(\?.*)?/;
  const match2 = url.match(regex);
  if (!match2) {
    throw new Error(`Invalid external URL: ${url}`);
  }
  return {
    protocol: match2[1] ?? "https:",
    hostname: match2[2],
    pathname: match2[3] ?? "",
    queryString: match2[4]?.slice(1) ?? ""
  };
}
function constructNextUrl(baseUrl, path3) {
  const nextBasePath = NextConfig.basePath ?? "";
  const url = new URL(`${nextBasePath}${path3}`, baseUrl);
  return url.href;
}
function convertToQueryString(query) {
  const queryStrings = [];
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => queryStrings.push(`${key}=${entry}`));
    } else {
      queryStrings.push(`${key}=${value}`);
    }
  });
  return queryStrings.length > 0 ? `?${queryStrings.join("&")}` : "";
}
function getMiddlewareMatch(middlewareManifest2, functionsManifest) {
  if (functionsManifest?.functions?.["/_middleware"]) {
    return functionsManifest.functions["/_middleware"].matchers?.map(({ regexp }) => new RegExp(regexp)) ?? [/.*/];
  }
  const rootMiddleware = middlewareManifest2.middleware["/"];
  if (!rootMiddleware?.matchers)
    return [];
  return rootMiddleware.matchers.map(({ regexp }) => new RegExp(regexp));
}
function escapeRegex(str, { isPath } = {}) {
  const result = str.replaceAll("(.)", "_\xB51_").replaceAll("(..)", "_\xB52_").replaceAll("(...)", "_\xB53_");
  return isPath ? result : result.replaceAll("+", "_\xB54_");
}
function unescapeRegex(str) {
  return str.replaceAll("_\xB51_", "(.)").replaceAll("_\xB52_", "(..)").replaceAll("_\xB53_", "(...)").replaceAll("_\xB54_", "+");
}
function convertBodyToReadableStream(method, body) {
  if (method === "GET" || method === "HEAD")
    return void 0;
  if (!body)
    return void 0;
  const readable = new ReadableStream({
    start(controller) {
      controller.enqueue(body);
      controller.close();
    }
  });
  return readable;
}
var CommonHeaders;
(function(CommonHeaders2) {
  CommonHeaders2["CACHE_CONTROL"] = "cache-control";
  CommonHeaders2["NEXT_CACHE"] = "x-nextjs-cache";
})(CommonHeaders || (CommonHeaders = {}));
function normalizeLocationHeader(location, baseUrl, encodeQuery = false) {
  if (!URL.canParse(location)) {
    return location;
  }
  const locationURL = new URL(location);
  const origin = new URL(baseUrl).origin;
  let search = locationURL.search;
  if (encodeQuery && search) {
    search = `?${stringifyQs(parseQs(search.slice(1)))}`;
  }
  const href = `${locationURL.origin}${locationURL.pathname}${search}${locationURL.hash}`;
  if (locationURL.origin === origin) {
    return href.slice(origin.length);
  }
  return href;
}

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/core/routingHandler.js
init_logger();

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
import { createHash } from "node:crypto";
init_stream();

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/utils/cache.js
init_logger();
async function hasBeenRevalidated(key, tags, cacheEntry) {
  if (globalThis.openNextConfig.dangerous?.disableTagCache) {
    return false;
  }
  const value = cacheEntry.value;
  if (!value) {
    return true;
  }
  if ("type" in cacheEntry && cacheEntry.type === "page") {
    return false;
  }
  const lastModified = cacheEntry.lastModified ?? Date.now();
  if (globalThis.tagCache.mode === "nextMode") {
    return await globalThis.tagCache.hasBeenRevalidated(tags, lastModified);
  }
  const _lastModified = await globalThis.tagCache.getLastModified(key, lastModified);
  return _lastModified === -1;
}
function getTagsFromValue(value) {
  if (!value) {
    return [];
  }
  try {
    return value.meta?.headers?.["x-next-cache-tags"]?.split(",") ?? [];
  } catch (e) {
    return [];
  }
}

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
init_logger();
var CACHE_ONE_YEAR = 60 * 60 * 24 * 365;
var CACHE_ONE_MONTH = 60 * 60 * 24 * 30;
var VARY_HEADER = "RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch, Next-Url";
async function computeCacheControl(path3, body, host, revalidate, lastModified) {
  let finalRevalidate = CACHE_ONE_YEAR;
  const existingRoute = Object.entries(PrerenderManifest.routes).find((p) => p[0] === path3)?.[1];
  if (revalidate === void 0 && existingRoute) {
    finalRevalidate = existingRoute.initialRevalidateSeconds === false ? CACHE_ONE_YEAR : existingRoute.initialRevalidateSeconds;
  } else if (revalidate !== void 0) {
    finalRevalidate = revalidate === false ? CACHE_ONE_YEAR : revalidate;
  }
  const age = Math.round((Date.now() - (lastModified ?? 0)) / 1e3);
  const hash = (str) => createHash("md5").update(str).digest("hex");
  const etag = hash(body);
  if (revalidate === 0) {
    return {
      "cache-control": "private, no-cache, no-store, max-age=0, must-revalidate",
      "x-opennext-cache": "ERROR",
      etag
    };
  }
  if (finalRevalidate !== CACHE_ONE_YEAR) {
    const sMaxAge = Math.max(finalRevalidate - age, 1);
    debug("sMaxAge", {
      finalRevalidate,
      age,
      lastModified,
      revalidate
    });
    const isStale = sMaxAge === 1;
    if (isStale) {
      let url = NextConfig.trailingSlash ? `${path3}/` : path3;
      if (NextConfig.basePath) {
        url = `${NextConfig.basePath}${url}`;
      }
      await globalThis.queue.send({
        MessageBody: {
          host,
          url,
          eTag: etag,
          lastModified: lastModified ?? Date.now()
        },
        MessageDeduplicationId: hash(`${path3}-${lastModified}-${etag}`),
        MessageGroupId: generateMessageGroupId(path3)
      });
    }
    return {
      "cache-control": `s-maxage=${sMaxAge}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
      "x-opennext-cache": isStale ? "STALE" : "HIT",
      etag
    };
  }
  return {
    "cache-control": `s-maxage=${CACHE_ONE_YEAR}, stale-while-revalidate=${CACHE_ONE_MONTH}`,
    "x-opennext-cache": "HIT",
    etag
  };
}
async function generateResult(event, localizedPath, cachedValue, lastModified) {
  debug("Returning result from experimental cache");
  let body = "";
  let type = "application/octet-stream";
  let isDataRequest = false;
  switch (cachedValue.type) {
    case "app":
      isDataRequest = Boolean(event.headers.rsc);
      body = isDataRequest ? cachedValue.rsc : cachedValue.html;
      type = isDataRequest ? "text/x-component" : "text/html; charset=utf-8";
      break;
    case "page":
      isDataRequest = Boolean(event.query.__nextDataReq);
      body = isDataRequest ? JSON.stringify(cachedValue.json) : cachedValue.html;
      type = isDataRequest ? "application/json" : "text/html; charset=utf-8";
      break;
  }
  const cacheControl = await computeCacheControl(localizedPath, body, event.headers.host, cachedValue.revalidate, lastModified);
  return {
    type: "core",
    // sometimes other status codes can be cached, like 404. For these cases, we should return the correct status code
    statusCode: cachedValue.meta?.status ?? 200,
    body: toReadableStream(body, false),
    isBase64Encoded: false,
    headers: {
      ...cacheControl,
      "content-type": type,
      ...cachedValue.meta?.headers,
      vary: VARY_HEADER
    }
  };
}
function escapePathDelimiters(segment, escapeEncoded) {
  return segment.replace(new RegExp(`([/#?]${escapeEncoded ? "|%(2f|23|3f|5c)" : ""})`, "gi"), (char) => encodeURIComponent(char));
}
function decodePathParams(pathname) {
  return pathname.split("/").map((segment) => {
    try {
      return escapePathDelimiters(decodeURIComponent(segment), true);
    } catch (e) {
      return segment;
    }
  }).join("/");
}
async function cacheInterceptor(event) {
  if (Boolean(event.headers["next-action"]) || Boolean(event.headers["x-prerender-revalidate"]))
    return event;
  const cookies = event.headers.cookie || "";
  const hasPreviewData = cookies.includes("__prerender_bypass") || cookies.includes("__next_preview_data");
  if (hasPreviewData) {
    debug("Preview mode detected, passing through to handler");
    return event;
  }
  let localizedPath = localizePath(event);
  if (NextConfig.basePath) {
    localizedPath = localizedPath.replace(NextConfig.basePath, "");
  }
  localizedPath = localizedPath.replace(/\/$/, "");
  localizedPath = decodePathParams(localizedPath);
  debug("Checking cache for", localizedPath, PrerenderManifest);
  const isISR = Object.keys(PrerenderManifest.routes).includes(localizedPath ?? "/") || Object.values(PrerenderManifest.dynamicRoutes).some((dr) => new RegExp(dr.routeRegex).test(localizedPath));
  debug("isISR", isISR);
  if (isISR) {
    try {
      const cachedData = await globalThis.incrementalCache.get(localizedPath ?? "/index");
      debug("cached data in interceptor", cachedData);
      if (!cachedData?.value) {
        return event;
      }
      if (cachedData.value?.type === "app" || cachedData.value?.type === "route") {
        const tags = getTagsFromValue(cachedData.value);
        const _hasBeenRevalidated = cachedData.shouldBypassTagCache ? false : await hasBeenRevalidated(localizedPath, tags, cachedData);
        if (_hasBeenRevalidated) {
          return event;
        }
      }
      const host = event.headers.host;
      switch (cachedData?.value?.type) {
        case "app":
        case "page":
          return generateResult(event, localizedPath, cachedData.value, cachedData.lastModified);
        case "redirect": {
          const cacheControl = await computeCacheControl(localizedPath, "", host, cachedData.value.revalidate, cachedData.lastModified);
          return {
            type: "core",
            statusCode: cachedData.value.meta?.status ?? 307,
            body: emptyReadableStream(),
            headers: {
              ...cachedData.value.meta?.headers ?? {},
              ...cacheControl
            },
            isBase64Encoded: false
          };
        }
        case "route": {
          const cacheControl = await computeCacheControl(localizedPath, cachedData.value.body, host, cachedData.value.revalidate, cachedData.lastModified);
          const isBinary = isBinaryContentType(String(cachedData.value.meta?.headers?.["content-type"]));
          return {
            type: "core",
            statusCode: cachedData.value.meta?.status ?? 200,
            body: toReadableStream(cachedData.value.body, isBinary),
            headers: {
              ...cacheControl,
              ...cachedData.value.meta?.headers,
              vary: VARY_HEADER
            },
            isBase64Encoded: isBinary
          };
        }
        default:
          return event;
      }
    } catch (e) {
      debug("Error while fetching cache", e);
      return event;
    }
  }
  return event;
}

// ../../node_modules/.pnpm/path-to-regexp@6.3.0/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
function parse2(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path3 = "";
  var tryConsume = function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  };
  var mustConsume = function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  };
  var consumeText = function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  };
  var isSafe = function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  };
  var safePattern = function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  };
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path3 += prefix;
        prefix = "";
      }
      if (path3) {
        result.push(path3);
        path3 = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path3 += value;
      continue;
    }
    if (path3) {
      result.push(path3);
      path3 = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
function compile(str, options) {
  return tokensToFunction(parse2(str, options), options);
}
function tokensToFunction(tokens, options) {
  if (options === void 0) {
    options = {};
  }
  var reFlags = flags(options);
  var _a = options.encode, encode = _a === void 0 ? function(x) {
    return x;
  } : _a, _b = options.validate, validate = _b === void 0 ? true : _b;
  var matches = tokens.map(function(token) {
    if (typeof token === "object") {
      return new RegExp("^(?:".concat(token.pattern, ")$"), reFlags);
    }
  });
  return function(data) {
    var path3 = "";
    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i];
      if (typeof token === "string") {
        path3 += token;
        continue;
      }
      var value = data ? data[token.name] : void 0;
      var optional = token.modifier === "?" || token.modifier === "*";
      var repeat = token.modifier === "*" || token.modifier === "+";
      if (Array.isArray(value)) {
        if (!repeat) {
          throw new TypeError('Expected "'.concat(token.name, '" to not repeat, but got an array'));
        }
        if (value.length === 0) {
          if (optional)
            continue;
          throw new TypeError('Expected "'.concat(token.name, '" to not be empty'));
        }
        for (var j = 0; j < value.length; j++) {
          var segment = encode(value[j], token);
          if (validate && !matches[i].test(segment)) {
            throw new TypeError('Expected all "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
          }
          path3 += token.prefix + segment + token.suffix;
        }
        continue;
      }
      if (typeof value === "string" || typeof value === "number") {
        var segment = encode(String(value), token);
        if (validate && !matches[i].test(segment)) {
          throw new TypeError('Expected "'.concat(token.name, '" to match "').concat(token.pattern, '", but got "').concat(segment, '"'));
        }
        path3 += token.prefix + segment + token.suffix;
        continue;
      }
      if (optional)
        continue;
      var typeOfMessage = repeat ? "an array" : "a string";
      throw new TypeError('Expected "'.concat(token.name, '" to be ').concat(typeOfMessage));
    }
    return path3;
  };
}
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path3 = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    };
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path: path3, index, params };
  };
}
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
function regexpToRegexp(path3, keys) {
  if (!keys)
    return path3;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path3.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path3.source);
  }
  return path3;
}
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path3) {
    return pathToRegexp(path3, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
function stringToRegexp(path3, keys, options) {
  return tokensToRegexp(parse2(path3, options), keys, options);
}
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
function pathToRegexp(path3, keys, options) {
  if (path3 instanceof RegExp)
    return regexpToRegexp(path3, keys);
  if (Array.isArray(path3))
    return arrayToRegexp(path3, keys, options);
  return stringToRegexp(path3, keys, options);
}

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/utils/normalize-path.js
import path2 from "node:path";
function normalizeRepeatedSlashes(url) {
  const urlNoQuery = url.host + url.pathname;
  return `${url.protocol}//${urlNoQuery.replace(/\\/g, "/").replace(/\/\/+/g, "/")}${url.search}`;
}

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/core/routing/matcher.js
init_stream();
init_logger();

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/core/routing/routeMatcher.js
var optionalLocalePrefixRegex = `^/(?:${RoutesManifest.locales.map((locale) => `${locale}/?`).join("|")})?`;
var optionalBasepathPrefixRegex = RoutesManifest.basePath ? `^${RoutesManifest.basePath}/?` : "^/";
var optionalPrefix = optionalLocalePrefixRegex.replace("^/", optionalBasepathPrefixRegex);
function routeMatcher(routeDefinitions) {
  const regexp = routeDefinitions.map((route) => ({
    page: route.page,
    regexp: new RegExp(route.regex.replace("^/", optionalPrefix))
  }));
  const appPathsSet = /* @__PURE__ */ new Set();
  const routePathsSet = /* @__PURE__ */ new Set();
  for (const [k, v] of Object.entries(AppPathRoutesManifest)) {
    if (k.endsWith("page")) {
      appPathsSet.add(v);
    } else if (k.endsWith("route")) {
      routePathsSet.add(v);
    }
  }
  return function matchRoute(path3) {
    const foundRoutes = regexp.filter((route) => route.regexp.test(path3));
    return foundRoutes.map((foundRoute) => {
      let routeType = "page";
      if (appPathsSet.has(foundRoute.page)) {
        routeType = "app";
      } else if (routePathsSet.has(foundRoute.page)) {
        routeType = "route";
      }
      return {
        route: foundRoute.page,
        type: routeType
      };
    });
  };
}
var staticRouteMatcher = routeMatcher([
  ...RoutesManifest.routes.static,
  ...getStaticAPIRoutes()
]);
var dynamicRouteMatcher = routeMatcher(RoutesManifest.routes.dynamic);
function getStaticAPIRoutes() {
  const createRouteDefinition = (route) => ({
    page: route,
    regex: `^${route}(?:/)?$`
  });
  const dynamicRoutePages = new Set(RoutesManifest.routes.dynamic.map(({ page }) => page));
  const pagesStaticAPIRoutes = Object.keys(PagesManifest).filter((route) => route.startsWith("/api/") && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  const appPathsStaticAPIRoutes = Object.values(AppPathRoutesManifest).filter((route) => route.startsWith("/api/") || route === "/api" && !dynamicRoutePages.has(route)).map(createRouteDefinition);
  return [...pagesStaticAPIRoutes, ...appPathsStaticAPIRoutes];
}

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/core/routing/matcher.js
var routeHasMatcher = (headers, cookies, query) => (redirect) => {
  switch (redirect.type) {
    case "header":
      return !!headers?.[redirect.key.toLowerCase()] && new RegExp(redirect.value ?? "").test(headers[redirect.key.toLowerCase()] ?? "");
    case "cookie":
      return !!cookies?.[redirect.key] && new RegExp(redirect.value ?? "").test(cookies[redirect.key] ?? "");
    case "query":
      return query[redirect.key] && Array.isArray(redirect.value) ? redirect.value.reduce((prev, current) => prev || new RegExp(current).test(query[redirect.key]), false) : new RegExp(redirect.value ?? "").test(query[redirect.key] ?? "");
    case "host":
      return headers?.host !== "" && new RegExp(redirect.value ?? "").test(headers.host);
    default:
      return false;
  }
};
function checkHas(matcher, has, inverted = false) {
  return has ? has.reduce((acc, cur) => {
    if (acc === false)
      return false;
    return inverted ? !matcher(cur) : matcher(cur);
  }, true) : true;
}
var getParamsFromSource = (source) => (value) => {
  debug("value", value);
  const _match = source(value);
  return _match ? _match.params : {};
};
var computeParamHas = (headers, cookies, query) => (has) => {
  if (!has.value)
    return {};
  const matcher = new RegExp(`^${has.value}$`);
  const fromSource = (value) => {
    const matches = value.match(matcher);
    return matches?.groups ?? {};
  };
  switch (has.type) {
    case "header":
      return fromSource(headers[has.key.toLowerCase()] ?? "");
    case "cookie":
      return fromSource(cookies[has.key] ?? "");
    case "query":
      return Array.isArray(query[has.key]) ? fromSource(query[has.key].join(",")) : fromSource(query[has.key] ?? "");
    case "host":
      return fromSource(headers.host ?? "");
  }
};
function convertMatch(match2, toDestination, destination) {
  if (!match2) {
    return destination;
  }
  const { params } = match2;
  const isUsingParams = Object.keys(params).length > 0;
  return isUsingParams ? toDestination(params) : destination;
}
function getNextConfigHeaders(event, configHeaders) {
  if (!configHeaders) {
    return {};
  }
  const matcher = routeHasMatcher(event.headers, event.cookies, event.query);
  const requestHeaders = {};
  const localizedRawPath = localizePath(event);
  for (const { headers, has, missing, regex, source, locale } of configHeaders) {
    const path3 = locale === false ? event.rawPath : localizedRawPath;
    if (new RegExp(regex).test(path3) && checkHas(matcher, has) && checkHas(matcher, missing, true)) {
      const fromSource = match(source);
      const _match = fromSource(path3);
      headers.forEach((h) => {
        try {
          const key = convertMatch(_match, compile(h.key), h.key);
          const value = convertMatch(_match, compile(h.value), h.value);
          requestHeaders[key] = value;
        } catch {
          debug(`Error matching header ${h.key} with value ${h.value}`);
          requestHeaders[h.key] = h.value;
        }
      });
    }
  }
  return requestHeaders;
}
function handleRewrites(event, rewrites) {
  const { rawPath, headers, query, cookies, url } = event;
  const localizedRawPath = localizePath(event);
  const matcher = routeHasMatcher(headers, cookies, query);
  const computeHas = computeParamHas(headers, cookies, query);
  const rewrite = rewrites.find((route) => {
    const path3 = route.locale === false ? rawPath : localizedRawPath;
    return new RegExp(route.regex).test(path3) && checkHas(matcher, route.has) && checkHas(matcher, route.missing, true);
  });
  let finalQuery = query;
  let rewrittenUrl = url;
  const isExternalRewrite = isExternal(rewrite?.destination);
  debug("isExternalRewrite", isExternalRewrite);
  if (rewrite) {
    const { pathname, protocol, hostname, queryString } = getUrlParts(rewrite.destination, isExternalRewrite);
    const pathToUse = rewrite.locale === false ? rawPath : localizedRawPath;
    debug("urlParts", { pathname, protocol, hostname, queryString });
    const toDestinationPath = compile(escapeRegex(pathname, { isPath: true }));
    const toDestinationHost = compile(escapeRegex(hostname));
    const toDestinationQuery = compile(escapeRegex(queryString));
    const params = {
      // params for the source
      ...getParamsFromSource(match(escapeRegex(rewrite.source, { isPath: true })))(pathToUse),
      // params for the has
      ...rewrite.has?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {}),
      // params for the missing
      ...rewrite.missing?.reduce((acc, cur) => {
        return Object.assign(acc, computeHas(cur));
      }, {})
    };
    const isUsingParams = Object.keys(params).length > 0;
    let rewrittenQuery = queryString;
    let rewrittenHost = hostname;
    let rewrittenPath = pathname;
    if (isUsingParams) {
      rewrittenPath = unescapeRegex(toDestinationPath(params));
      rewrittenHost = unescapeRegex(toDestinationHost(params));
      rewrittenQuery = unescapeRegex(toDestinationQuery(params));
    }
    if (NextConfig.i18n && !isExternalRewrite) {
      const strippedPathLocale = rewrittenPath.replace(new RegExp(`^/(${NextConfig.i18n.locales.join("|")})`), "");
      if (strippedPathLocale.startsWith("/api/")) {
        rewrittenPath = strippedPathLocale;
      }
    }
    rewrittenUrl = isExternalRewrite ? `${protocol}//${rewrittenHost}${rewrittenPath}` : new URL(rewrittenPath, event.url).href;
    finalQuery = {
      ...query,
      ...convertFromQueryString(rewrittenQuery)
    };
    rewrittenUrl += convertToQueryString(finalQuery);
    debug("rewrittenUrl", { rewrittenUrl, finalQuery, isUsingParams });
  }
  return {
    internalEvent: {
      ...event,
      query: finalQuery,
      rawPath: new URL(rewrittenUrl).pathname,
      url: rewrittenUrl
    },
    __rewrite: rewrite,
    isExternalRewrite
  };
}
function handleRepeatedSlashRedirect(event) {
  if (event.rawPath.match(/(\\|\/\/)/)) {
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: normalizeRepeatedSlashes(new URL(event.url))
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
  return false;
}
function handleTrailingSlashRedirect(event) {
  const url = new URL(event.rawPath, "http://localhost");
  if (
    // Someone is trying to redirect to a different origin, let's not do that
    url.host !== "localhost" || NextConfig.skipTrailingSlashRedirect || // We should not apply trailing slash redirect to API routes
    event.rawPath.startsWith("/api/")
  ) {
    return false;
  }
  const emptyBody = emptyReadableStream();
  if (NextConfig.trailingSlash && !event.headers["x-nextjs-data"] && !event.rawPath.endsWith("/") && !event.rawPath.match(/[\w-]+\.[\w]+$/g)) {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0]}/${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  if (!NextConfig.trailingSlash && event.rawPath.endsWith("/") && event.rawPath !== "/") {
    const headersLocation = event.url.split("?");
    return {
      type: event.type,
      statusCode: 308,
      headers: {
        Location: `${headersLocation[0].replace(/\/$/, "")}${headersLocation[1] ? `?${headersLocation[1]}` : ""}`
      },
      body: emptyBody,
      isBase64Encoded: false
    };
  }
  return false;
}
function handleRedirects(event, redirects) {
  const repeatedSlashRedirect = handleRepeatedSlashRedirect(event);
  if (repeatedSlashRedirect)
    return repeatedSlashRedirect;
  const trailingSlashRedirect = handleTrailingSlashRedirect(event);
  if (trailingSlashRedirect)
    return trailingSlashRedirect;
  const localeRedirect = handleLocaleRedirect(event);
  if (localeRedirect)
    return localeRedirect;
  const { internalEvent, __rewrite } = handleRewrites(event, redirects.filter((r) => !r.internal));
  if (__rewrite && !__rewrite.internal) {
    return {
      type: event.type,
      statusCode: __rewrite.statusCode ?? 308,
      headers: {
        Location: internalEvent.url
      },
      body: emptyReadableStream(),
      isBase64Encoded: false
    };
  }
}
function fixDataPage(internalEvent, buildId) {
  const { rawPath, query } = internalEvent;
  const basePath = NextConfig.basePath ?? "";
  const dataPattern = `${basePath}/_next/data/${buildId}`;
  if (rawPath.startsWith("/_next/data") && !rawPath.startsWith(dataPattern)) {
    return {
      type: internalEvent.type,
      statusCode: 404,
      body: toReadableStream("{}"),
      headers: {
        "Content-Type": "application/json"
      },
      isBase64Encoded: false
    };
  }
  if (rawPath.startsWith(dataPattern) && rawPath.endsWith(".json")) {
    const newPath = `${basePath}${rawPath.slice(dataPattern.length, -".json".length).replace(/^\/index$/, "/")}`;
    query.__nextDataReq = "1";
    return {
      ...internalEvent,
      rawPath: newPath,
      query,
      url: new URL(`${newPath}${convertToQueryString(query)}`, internalEvent.url).href
    };
  }
  return internalEvent;
}
function handleFallbackFalse(internalEvent, prerenderManifest) {
  const { rawPath } = internalEvent;
  const { dynamicRoutes, routes } = prerenderManifest;
  const prerenderedFallbackRoutes = Object.entries(dynamicRoutes).filter(([, { fallback }]) => fallback === false);
  const routeFallback = prerenderedFallbackRoutes.some(([, { routeRegex }]) => {
    const routeRegexExp = new RegExp(routeRegex);
    return routeRegexExp.test(rawPath);
  });
  const locales = NextConfig.i18n?.locales;
  const routesAlreadyHaveLocale = locales?.includes(rawPath.split("/")[1]) || // If we don't use locales, we don't need to add the default locale
  locales === void 0;
  let localizedPath = routesAlreadyHaveLocale ? rawPath : `/${NextConfig.i18n?.defaultLocale}${rawPath}`;
  if (
    // Not if localizedPath is "/" tho, because that would not make it find `isPregenerated` below since it would be try to match an empty string.
    localizedPath !== "/" && NextConfig.trailingSlash && localizedPath.endsWith("/")
  ) {
    localizedPath = localizedPath.slice(0, -1);
  }
  const matchedStaticRoute = staticRouteMatcher(localizedPath);
  const prerenderedFallbackRoutesName = prerenderedFallbackRoutes.map(([name]) => name);
  const matchedDynamicRoute = dynamicRouteMatcher(localizedPath).filter(({ route }) => !prerenderedFallbackRoutesName.includes(route));
  const isPregenerated = Object.keys(routes).includes(localizedPath);
  if (routeFallback && !isPregenerated && matchedStaticRoute.length === 0 && matchedDynamicRoute.length === 0) {
    return {
      event: {
        ...internalEvent,
        rawPath: "/404",
        url: constructNextUrl(internalEvent.url, "/404"),
        headers: {
          ...internalEvent.headers,
          "x-invoke-status": "404"
        }
      },
      isISR: false
    };
  }
  return {
    event: internalEvent,
    isISR: routeFallback || isPregenerated
  };
}

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/core/routing/middleware.js
init_stream();
init_utils();
var middlewareManifest = MiddlewareManifest;
var functionsConfigManifest = FunctionsConfigManifest;
var middleMatch = getMiddlewareMatch(middlewareManifest, functionsConfigManifest);
var REDIRECTS = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
function defaultMiddlewareLoader() {
  return Promise.resolve().then(() => (init_edgeFunctionHandler(), edgeFunctionHandler_exports));
}
async function handleMiddleware(internalEvent, initialSearch, middlewareLoader = defaultMiddlewareLoader) {
  const headers = internalEvent.headers;
  if (headers["x-isr"] && headers["x-prerender-revalidate"] === PrerenderManifest.preview.previewModeId)
    return internalEvent;
  const normalizedPath = localizePath(internalEvent);
  const hasMatch = middleMatch.some((r) => r.test(normalizedPath));
  if (!hasMatch)
    return internalEvent;
  const initialUrl = new URL(normalizedPath, internalEvent.url);
  initialUrl.search = initialSearch;
  const url = initialUrl.href;
  const middleware = await middlewareLoader();
  const result = await middleware.default({
    // `geo` is pre Next 15.
    geo: {
      // The city name is percent-encoded.
      // See https://github.com/vercel/vercel/blob/4cb6143/packages/functions/src/headers.ts#L94C19-L94C37
      city: decodeURIComponent(headers["x-open-next-city"]),
      country: headers["x-open-next-country"],
      region: headers["x-open-next-region"],
      latitude: headers["x-open-next-latitude"],
      longitude: headers["x-open-next-longitude"]
    },
    headers,
    method: internalEvent.method || "GET",
    nextConfig: {
      basePath: NextConfig.basePath,
      i18n: NextConfig.i18n,
      trailingSlash: NextConfig.trailingSlash
    },
    url,
    body: convertBodyToReadableStream(internalEvent.method, internalEvent.body)
  });
  const statusCode = result.status;
  const responseHeaders = result.headers;
  const reqHeaders = {};
  const resHeaders = {};
  const filteredHeaders = [
    "x-middleware-override-headers",
    "x-middleware-next",
    "x-middleware-rewrite",
    // We need to drop `content-encoding` because it will be decoded
    "content-encoding"
  ];
  const xMiddlewareKey = "x-middleware-request-";
  responseHeaders.forEach((value, key) => {
    if (key.startsWith(xMiddlewareKey)) {
      const k = key.substring(xMiddlewareKey.length);
      reqHeaders[k] = value;
    } else {
      if (filteredHeaders.includes(key.toLowerCase()))
        return;
      if (key.toLowerCase() === "set-cookie") {
        resHeaders[key] = resHeaders[key] ? [...resHeaders[key], value] : [value];
      } else if (REDIRECTS.has(statusCode) && key.toLowerCase() === "location") {
        resHeaders[key] = normalizeLocationHeader(value, internalEvent.url);
      } else {
        resHeaders[key] = value;
      }
    }
  });
  const rewriteUrl = responseHeaders.get("x-middleware-rewrite");
  let isExternalRewrite = false;
  let middlewareQuery = internalEvent.query;
  let newUrl = internalEvent.url;
  if (rewriteUrl) {
    newUrl = rewriteUrl;
    if (isExternal(newUrl, internalEvent.headers.host)) {
      isExternalRewrite = true;
    } else {
      const rewriteUrlObject = new URL(rewriteUrl);
      middlewareQuery = getQueryFromSearchParams(rewriteUrlObject.searchParams);
      if ("__nextDataReq" in internalEvent.query) {
        middlewareQuery.__nextDataReq = internalEvent.query.__nextDataReq;
      }
    }
  }
  if (!rewriteUrl && !responseHeaders.get("x-middleware-next")) {
    const body = result.body ?? emptyReadableStream();
    return {
      type: internalEvent.type,
      statusCode,
      headers: resHeaders,
      body,
      isBase64Encoded: false
    };
  }
  return {
    responseHeaders: resHeaders,
    url: newUrl,
    rawPath: new URL(newUrl).pathname,
    type: internalEvent.type,
    headers: { ...internalEvent.headers, ...reqHeaders },
    body: internalEvent.body,
    method: internalEvent.method,
    query: middlewareQuery,
    cookies: internalEvent.cookies,
    remoteAddress: internalEvent.remoteAddress,
    isExternalRewrite,
    rewriteStatusCode: statusCode
  };
}

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/core/routingHandler.js
var MIDDLEWARE_HEADER_PREFIX = "x-middleware-response-";
var MIDDLEWARE_HEADER_PREFIX_LEN = MIDDLEWARE_HEADER_PREFIX.length;
var INTERNAL_HEADER_PREFIX = "x-opennext-";
var INTERNAL_HEADER_INITIAL_URL = `${INTERNAL_HEADER_PREFIX}initial-url`;
var INTERNAL_HEADER_LOCALE = `${INTERNAL_HEADER_PREFIX}locale`;
var INTERNAL_HEADER_RESOLVED_ROUTES = `${INTERNAL_HEADER_PREFIX}resolved-routes`;
var INTERNAL_HEADER_REWRITE_STATUS_CODE = `${INTERNAL_HEADER_PREFIX}rewrite-status-code`;
var INTERNAL_EVENT_REQUEST_ID = `${INTERNAL_HEADER_PREFIX}request-id`;
var geoHeaderToNextHeader = {
  "x-open-next-city": "x-vercel-ip-city",
  "x-open-next-country": "x-vercel-ip-country",
  "x-open-next-region": "x-vercel-ip-country-region",
  "x-open-next-latitude": "x-vercel-ip-latitude",
  "x-open-next-longitude": "x-vercel-ip-longitude"
};
function applyMiddlewareHeaders(eventOrResult, middlewareHeaders) {
  const isResult = isInternalResult(eventOrResult);
  const headers = eventOrResult.headers;
  const keyPrefix = isResult ? "" : MIDDLEWARE_HEADER_PREFIX;
  Object.entries(middlewareHeaders).forEach(([key, value]) => {
    if (value) {
      headers[keyPrefix + key] = Array.isArray(value) ? value.join(",") : value;
    }
  });
}
async function routingHandler(event, { assetResolver }) {
  try {
    for (const [openNextGeoName, nextGeoName] of Object.entries(geoHeaderToNextHeader)) {
      const value = event.headers[openNextGeoName];
      if (value) {
        event.headers[nextGeoName] = value;
      }
    }
    for (const key of Object.keys(event.headers)) {
      if (key.startsWith(INTERNAL_HEADER_PREFIX) || key.startsWith(MIDDLEWARE_HEADER_PREFIX)) {
        delete event.headers[key];
      }
    }
    let headers = getNextConfigHeaders(event, ConfigHeaders);
    let eventOrResult = fixDataPage(event, BuildId);
    if (isInternalResult(eventOrResult)) {
      return eventOrResult;
    }
    const redirect = handleRedirects(eventOrResult, RoutesManifest.redirects);
    if (redirect) {
      redirect.headers.Location = normalizeLocationHeader(redirect.headers.Location, event.url, true);
      debug("redirect", redirect);
      return redirect;
    }
    const middlewareEventOrResult = await handleMiddleware(
      eventOrResult,
      // We need to pass the initial search without any decoding
      // TODO: we'd need to refactor InternalEvent to include the initial querystring directly
      // Should be done in another PR because it is a breaking change
      new URL(event.url).search
    );
    if (isInternalResult(middlewareEventOrResult)) {
      return middlewareEventOrResult;
    }
    headers = {
      ...middlewareEventOrResult.responseHeaders,
      ...headers
    };
    let isExternalRewrite = middlewareEventOrResult.isExternalRewrite ?? false;
    eventOrResult = middlewareEventOrResult;
    if (!isExternalRewrite) {
      const beforeRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.beforeFiles);
      eventOrResult = beforeRewrite.internalEvent;
      isExternalRewrite = beforeRewrite.isExternalRewrite;
      if (!isExternalRewrite) {
        const assetResult = await assetResolver?.maybeGetAssetResult?.(eventOrResult);
        if (assetResult) {
          applyMiddlewareHeaders(assetResult, headers);
          return assetResult;
        }
      }
    }
    const foundStaticRoute = staticRouteMatcher(eventOrResult.rawPath);
    const isStaticRoute = !isExternalRewrite && foundStaticRoute.length > 0;
    if (!(isStaticRoute || isExternalRewrite)) {
      const afterRewrite = handleRewrites(eventOrResult, RoutesManifest.rewrites.afterFiles);
      eventOrResult = afterRewrite.internalEvent;
      isExternalRewrite = afterRewrite.isExternalRewrite;
    }
    let isISR = false;
    if (!isExternalRewrite) {
      const fallbackResult = handleFallbackFalse(eventOrResult, PrerenderManifest);
      eventOrResult = fallbackResult.event;
      isISR = fallbackResult.isISR;
    }
    const foundDynamicRoute = dynamicRouteMatcher(eventOrResult.rawPath);
    const isDynamicRoute = !isExternalRewrite && foundDynamicRoute.length > 0;
    if (!(isDynamicRoute || isStaticRoute || isExternalRewrite)) {
      const fallbackRewrites = handleRewrites(eventOrResult, RoutesManifest.rewrites.fallback);
      eventOrResult = fallbackRewrites.internalEvent;
      isExternalRewrite = fallbackRewrites.isExternalRewrite;
    }
    const isNextImageRoute = eventOrResult.rawPath.startsWith("/_next/image");
    const isRouteFoundBeforeAllRewrites = isStaticRoute || isDynamicRoute || isExternalRewrite;
    if (!(isRouteFoundBeforeAllRewrites || isNextImageRoute || // We need to check again once all rewrites have been applied
    staticRouteMatcher(eventOrResult.rawPath).length > 0 || dynamicRouteMatcher(eventOrResult.rawPath).length > 0)) {
      eventOrResult = {
        ...eventOrResult,
        rawPath: "/404",
        url: constructNextUrl(eventOrResult.url, "/404"),
        headers: {
          ...eventOrResult.headers,
          "x-middleware-response-cache-control": "private, no-cache, no-store, max-age=0, must-revalidate"
        }
      };
    }
    if (globalThis.openNextConfig.dangerous?.enableCacheInterception && !isInternalResult(eventOrResult)) {
      debug("Cache interception enabled");
      eventOrResult = await cacheInterceptor(eventOrResult);
      if (isInternalResult(eventOrResult)) {
        applyMiddlewareHeaders(eventOrResult, headers);
        return eventOrResult;
      }
    }
    applyMiddlewareHeaders(eventOrResult, headers);
    const resolvedRoutes = [
      ...foundStaticRoute,
      ...foundDynamicRoute
    ];
    debug("resolvedRoutes", resolvedRoutes);
    return {
      internalEvent: eventOrResult,
      isExternalRewrite,
      origin: false,
      isISR,
      resolvedRoutes,
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(eventOrResult, NextConfig.i18n) : void 0,
      rewriteStatusCode: middlewareEventOrResult.rewriteStatusCode
    };
  } catch (e) {
    error("Error in routingHandler", e);
    return {
      internalEvent: {
        type: "core",
        method: "GET",
        rawPath: "/500",
        url: constructNextUrl(event.url, "/500"),
        headers: {
          ...event.headers
        },
        query: event.query,
        cookies: event.cookies,
        remoteAddress: event.remoteAddress
      },
      isExternalRewrite: false,
      origin: false,
      isISR: false,
      resolvedRoutes: [],
      initialURL: event.url,
      locale: NextConfig.i18n ? detectLocale(event, NextConfig.i18n) : void 0
    };
  }
}
function isInternalResult(eventOrResult) {
  return eventOrResult != null && "statusCode" in eventOrResult;
}

// ../../node_modules/.pnpm/@opennextjs+aws@3.7.7/node_modules/@opennextjs/aws/dist/adapters/middleware.js
globalThis.internalFetch = fetch;
globalThis.__openNextAls = new AsyncLocalStorage();
var defaultHandler = async (internalEvent, options) => {
  const middlewareConfig = globalThis.openNextConfig.middleware;
  const originResolver = await resolveOriginResolver(middlewareConfig?.originResolver);
  const externalRequestProxy = await resolveProxyRequest(middlewareConfig?.override?.proxyExternalRequest);
  const assetResolver = await resolveAssetResolver(middlewareConfig?.assetResolver);
  const requestId = Math.random().toString(36);
  return runWithOpenNextRequestContext({
    isISRRevalidation: internalEvent.headers["x-isr"] === "1",
    waitUntil: options?.waitUntil,
    requestId
  }, async () => {
    const result = await routingHandler(internalEvent, { assetResolver });
    if ("internalEvent" in result) {
      debug("Middleware intercepted event", internalEvent);
      if (!result.isExternalRewrite) {
        const origin = await originResolver.resolve(result.internalEvent.rawPath);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_HEADER_INITIAL_URL]: internalEvent.url,
              [INTERNAL_HEADER_RESOLVED_ROUTES]: JSON.stringify(result.resolvedRoutes),
              [INTERNAL_EVENT_REQUEST_ID]: requestId,
              [INTERNAL_HEADER_REWRITE_STATUS_CODE]: String(result.rewriteStatusCode)
            }
          },
          isExternalRewrite: result.isExternalRewrite,
          origin,
          isISR: result.isISR,
          initialURL: result.initialURL,
          resolvedRoutes: result.resolvedRoutes
        };
      }
      try {
        return externalRequestProxy.proxy(result.internalEvent);
      } catch (e) {
        error("External request failed.", e);
        return {
          type: "middleware",
          internalEvent: {
            ...result.internalEvent,
            headers: {
              ...result.internalEvent.headers,
              [INTERNAL_EVENT_REQUEST_ID]: requestId
            },
            rawPath: "/500",
            url: constructNextUrl(result.internalEvent.url, "/500"),
            method: "GET"
          },
          // On error we need to rewrite to the 500 page which is an internal rewrite
          isExternalRewrite: false,
          origin: false,
          isISR: result.isISR,
          initialURL: result.internalEvent.url,
          resolvedRoutes: [{ route: "/500", type: "page" }]
        };
      }
    }
    result.headers[INTERNAL_EVENT_REQUEST_ID] = requestId;
    debug("Middleware response", result);
    return result;
  });
};
var handler2 = await createGenericHandler({
  handler: defaultHandler,
  type: "middleware"
});
var middleware_default = {
  fetch: handler2
};
export {
  middleware_default as default,
  handler2 as handler
};
