
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

  
  
  globalThis.openNextDebug = false;globalThis.openNextVersion = "3.8.0";
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

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/utils/error.js
function isOpenNextError(e) {
  try {
    return "__openNextInternal" in e;
  } catch {
    return false;
  }
}
var init_error = __esm({
  "../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/utils/error.js"() {
  }
});

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/adapters/logger.js
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
  "../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/adapters/logger.js"() {
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

// ../../node_modules/.pnpm/cookie@0.7.2/node_modules/cookie/index.js
var require_cookie = __commonJS({
  "../../node_modules/.pnpm/cookie@0.7.2/node_modules/cookie/index.js"(exports) {
    "use strict";
    exports.parse = parse3;
    exports.serialize = serialize;
    var __toString = Object.prototype.toString;
    var __hasOwnProperty = Object.prototype.hasOwnProperty;
    var cookieNameRegExp = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
    var cookieValueRegExp = /^("?)[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]*\1$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    function parse3(str, opt) {
      if (typeof str !== "string") {
        throw new TypeError("argument str must be a string");
      }
      var obj = {};
      var len = str.length;
      if (len < 2) return obj;
      var dec = opt && opt.decode || decode;
      var index = 0;
      var eqIdx = 0;
      var endIdx = 0;
      do {
        eqIdx = str.indexOf("=", index);
        if (eqIdx === -1) break;
        endIdx = str.indexOf(";", index);
        if (endIdx === -1) {
          endIdx = len;
        } else if (eqIdx > endIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        var keyStartIdx = startIndex(str, index, eqIdx);
        var keyEndIdx = endIndex(str, eqIdx, keyStartIdx);
        var key = str.slice(keyStartIdx, keyEndIdx);
        if (!__hasOwnProperty.call(obj, key)) {
          var valStartIdx = startIndex(str, eqIdx + 1, endIdx);
          var valEndIdx = endIndex(str, endIdx, valStartIdx);
          if (str.charCodeAt(valStartIdx) === 34 && str.charCodeAt(valEndIdx - 1) === 34) {
            valStartIdx++;
            valEndIdx--;
          }
          var val = str.slice(valStartIdx, valEndIdx);
          obj[key] = tryDecode(val, dec);
        }
        index = endIdx + 1;
      } while (index < len);
      return obj;
    }
    function startIndex(str, index, max) {
      do {
        var code = str.charCodeAt(index);
        if (code !== 32 && code !== 9) return index;
      } while (++index < max);
      return max;
    }
    function endIndex(str, index, min) {
      while (index > min) {
        var code = str.charCodeAt(--index);
        if (code !== 32 && code !== 9) return index + 1;
      }
      return min;
    }
    function serialize(name, val, opt) {
      var enc = opt && opt.encode || encodeURIComponent;
      if (typeof enc !== "function") {
        throw new TypeError("option encode is invalid");
      }
      if (!cookieNameRegExp.test(name)) {
        throw new TypeError("argument name is invalid");
      }
      var value = enc(val);
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError("argument val is invalid");
      }
      var str = name + "=" + value;
      if (!opt) return str;
      if (null != opt.maxAge) {
        var maxAge = Math.floor(opt.maxAge);
        if (!isFinite(maxAge)) {
          throw new TypeError("option maxAge is invalid");
        }
        str += "; Max-Age=" + maxAge;
      }
      if (opt.domain) {
        if (!domainValueRegExp.test(opt.domain)) {
          throw new TypeError("option domain is invalid");
        }
        str += "; Domain=" + opt.domain;
      }
      if (opt.path) {
        if (!pathValueRegExp.test(opt.path)) {
          throw new TypeError("option path is invalid");
        }
        str += "; Path=" + opt.path;
      }
      if (opt.expires) {
        var expires = opt.expires;
        if (!isDate(expires) || isNaN(expires.valueOf())) {
          throw new TypeError("option expires is invalid");
        }
        str += "; Expires=" + expires.toUTCString();
      }
      if (opt.httpOnly) {
        str += "; HttpOnly";
      }
      if (opt.secure) {
        str += "; Secure";
      }
      if (opt.partitioned) {
        str += "; Partitioned";
      }
      if (opt.priority) {
        var priority = typeof opt.priority === "string" ? opt.priority.toLowerCase() : opt.priority;
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
            throw new TypeError("option priority is invalid");
        }
      }
      if (opt.sameSite) {
        var sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
        switch (sameSite) {
          case true:
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError("option sameSite is invalid");
        }
      }
      return str;
    }
    function decode(str) {
      return str.indexOf("%") !== -1 ? decodeURIComponent(str) : str;
    }
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
    function tryDecode(str, decode2) {
      try {
        return decode2(str);
      } catch (e) {
        return str;
      }
    }
  }
});

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/http/util.js
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
  "../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/http/util.js"() {
  }
});

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/overrides/converters/utils.js
function getQueryFromSearchParams(searchParams) {
  return getQueryFromIterator(searchParams.entries());
}
var init_utils = __esm({
  "../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/overrides/converters/utils.js"() {
    init_util();
  }
});

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/overrides/converters/edge.js
var edge_exports = {};
__export(edge_exports, {
  default: () => edge_default
});
import { Buffer as Buffer2 } from "node:buffer";
var import_cookie, NULL_BODY_STATUSES, converter, edge_default;
var init_edge = __esm({
  "../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/overrides/converters/edge.js"() {
    import_cookie = __toESM(require_cookie(), 1);
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

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js
var cloudflare_edge_exports = {};
__export(cloudflare_edge_exports, {
  default: () => cloudflare_edge_default
});
var cfPropNameMapping, handler, cloudflare_edge_default;
var init_cloudflare_edge = __esm({
  "../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/overrides/wrappers/cloudflare-edge.js"() {
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

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js
var pattern_env_exports = {};
__export(pattern_env_exports, {
  default: () => pattern_env_default
});
var envLoader, pattern_env_default;
var init_pattern_env = __esm({
  "../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/overrides/originResolver/pattern-env.js"() {
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

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js
var dummy_exports = {};
__export(dummy_exports, {
  default: () => dummy_default
});
var resolver, dummy_default;
var init_dummy = __esm({
  "../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/overrides/assetResolver/dummy.js"() {
    resolver = {
      name: "dummy"
    };
    dummy_default = resolver;
  }
});

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/utils/stream.js
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
  "../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/utils/stream.js"() {
  }
});

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js
var fetch_exports = {};
__export(fetch_exports, {
  default: () => fetch_default
});
var fetchProxy, fetch_default;
var init_fetch = __esm({
  "../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/overrides/proxyExternalRequest/fetch.js"() {
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
    (self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([[550], { 9: (a) => {
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
    }, 82: function(a, b, c) {
      "use strict";
      var d = this && this.__importDefault || function(a2) {
        return a2 && a2.__esModule ? a2 : { default: a2 };
      };
      Object.defineProperty(b, "__esModule", { value: true });
      let e = d(c(698));
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
    }, 110: function(a, b, c) {
      "use strict";
      var d = this && this.__importDefault || function(a2) {
        return a2 && a2.__esModule ? a2 : { default: a2 };
      };
      Object.defineProperty(b, "__esModule", { value: true });
      let e = d(c(518)), f = d(c(784));
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
    }, 116: function(a, b, c) {
      "use strict";
      var d = this && this.__importDefault || function(a2) {
        return a2 && a2.__esModule ? a2 : { default: a2 };
      };
      Object.defineProperty(b, "__esModule", { value: true }), b.PostgrestError = b.PostgrestBuilder = b.PostgrestTransformBuilder = b.PostgrestFilterBuilder = b.PostgrestQueryBuilder = b.PostgrestClient = void 0;
      let e = d(c(110));
      b.PostgrestClient = e.default;
      let f = d(c(518));
      b.PostgrestQueryBuilder = f.default;
      let g = d(c(784));
      b.PostgrestFilterBuilder = g.default;
      let h = d(c(82));
      b.PostgrestTransformBuilder = h.default;
      let i = d(c(698));
      b.PostgrestBuilder = i.default;
      let j = d(c(401));
      b.PostgrestError = j.default, b.default = { PostgrestClient: e.default, PostgrestQueryBuilder: f.default, PostgrestFilterBuilder: g.default, PostgrestTransformBuilder: h.default, PostgrestBuilder: i.default, PostgrestError: j.default };
    }, 253: (a, b, c) => {
      "use strict";
      let d;
      c.r(b), c.d(b, { default: () => ej });
      var e, f, g, h, i, j, k, l, m, n, o, p, q = {};
      async function r() {
        return "_ENTRIES" in globalThis && _ENTRIES.middleware_instrumentation && await _ENTRIES.middleware_instrumentation;
      }
      c.r(q), c.d(q, { config: () => ef, middleware: () => ee });
      let s = null;
      async function t() {
        if ("phase-production-build" === process.env.NEXT_PHASE) return;
        s || (s = r());
        let a10 = await s;
        if (null == a10 ? void 0 : a10.register) try {
          await a10.register();
        } catch (a11) {
          throw a11.message = `An error occurred while loading instrumentation hook: ${a11.message}`, a11;
        }
      }
      async function u(...a10) {
        let b10 = await r();
        try {
          var c10;
          await (null == b10 || null == (c10 = b10.onRequestError) ? void 0 : c10.call(b10, ...a10));
        } catch (a11) {
          console.error("Error in instrumentation.onRequestError:", a11);
        }
      }
      let v = null;
      function w() {
        return v || (v = t()), v;
      }
      function x(a10) {
        return `The edge runtime does not support Node.js '${a10}' module.
Learn More: https://nextjs.org/docs/messages/node-module-in-edge-runtime`;
      }
      process !== c.g.process && (process.env = c.g.process.env, c.g.process = process);
      try {
        Object.defineProperty(globalThis, "__import_unsupported", { value: function(a10) {
          let b10 = new Proxy(function() {
          }, { get(b11, c10) {
            if ("then" === c10) return {};
            throw Object.defineProperty(Error(x(a10)), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
          }, construct() {
            throw Object.defineProperty(Error(x(a10)), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
          }, apply(c10, d10, e2) {
            if ("function" == typeof e2[0]) return e2[0](b10);
            throw Object.defineProperty(Error(x(a10)), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
          } });
          return new Proxy({}, { get: () => b10 });
        }, enumerable: false, configurable: false });
      } catch {
      }
      w();
      class y extends Error {
        constructor({ page: a10 }) {
          super(`The middleware "${a10}" accepts an async API directly with the form:
  
  export function middleware(request, event) {
    return NextResponse.redirect('/new-location')
  }
  
  Read more: https://nextjs.org/docs/messages/middleware-new-signature
  `);
        }
      }
      class z extends Error {
        constructor() {
          super(`The request.page has been deprecated in favour of \`URLPattern\`.
  Read more: https://nextjs.org/docs/messages/middleware-request-page
  `);
        }
      }
      class A extends Error {
        constructor() {
          super(`The request.ua has been removed in favour of \`userAgent\` function.
  Read more: https://nextjs.org/docs/messages/middleware-parse-user-agent
  `);
        }
      }
      let B = "_N_T_", C = { shared: "shared", reactServerComponents: "rsc", serverSideRendering: "ssr", actionBrowser: "action-browser", apiNode: "api-node", apiEdge: "api-edge", middleware: "middleware", instrument: "instrument", edgeAsset: "edge-asset", appPagesBrowser: "app-pages-browser", pagesDirBrowser: "pages-dir-browser", pagesDirEdge: "pages-dir-edge", pagesDirNode: "pages-dir-node" };
      function D(a10) {
        var b10, c10, d10, e2, f2, g2 = [], h2 = 0;
        function i2() {
          for (; h2 < a10.length && /\s/.test(a10.charAt(h2)); ) h2 += 1;
          return h2 < a10.length;
        }
        for (; h2 < a10.length; ) {
          for (b10 = h2, f2 = false; i2(); ) if ("," === (c10 = a10.charAt(h2))) {
            for (d10 = h2, h2 += 1, i2(), e2 = h2; h2 < a10.length && "=" !== (c10 = a10.charAt(h2)) && ";" !== c10 && "," !== c10; ) h2 += 1;
            h2 < a10.length && "=" === a10.charAt(h2) ? (f2 = true, h2 = e2, g2.push(a10.substring(b10, d10)), b10 = h2) : h2 = d10 + 1;
          } else h2 += 1;
          (!f2 || h2 >= a10.length) && g2.push(a10.substring(b10, a10.length));
        }
        return g2;
      }
      function E(a10) {
        let b10 = {}, c10 = [];
        if (a10) for (let [d10, e2] of a10.entries()) "set-cookie" === d10.toLowerCase() ? (c10.push(...D(e2)), b10[d10] = 1 === c10.length ? c10[0] : c10) : b10[d10] = e2;
        return b10;
      }
      function F(a10) {
        try {
          return String(new URL(String(a10)));
        } catch (b10) {
          throw Object.defineProperty(Error(`URL is malformed "${String(a10)}". Please use only absolute URLs - https://nextjs.org/docs/messages/middleware-relative-urls`, { cause: b10 }), "__NEXT_ERROR_CODE", { value: "E61", enumerable: false, configurable: true });
        }
      }
      ({ ...C, GROUP: { builtinReact: [C.reactServerComponents, C.actionBrowser], serverOnly: [C.reactServerComponents, C.actionBrowser, C.instrument, C.middleware], neutralTarget: [C.apiNode, C.apiEdge], clientOnly: [C.serverSideRendering, C.appPagesBrowser], bundled: [C.reactServerComponents, C.actionBrowser, C.serverSideRendering, C.appPagesBrowser, C.shared, C.instrument, C.middleware], appPages: [C.reactServerComponents, C.serverSideRendering, C.appPagesBrowser, C.actionBrowser] } });
      let G = Symbol("response"), H = Symbol("passThrough"), I = Symbol("waitUntil");
      class J {
        constructor(a10, b10) {
          this[H] = false, this[I] = b10 ? { kind: "external", function: b10 } : { kind: "internal", promises: [] };
        }
        respondWith(a10) {
          this[G] || (this[G] = Promise.resolve(a10));
        }
        passThroughOnException() {
          this[H] = true;
        }
        waitUntil(a10) {
          if ("external" === this[I].kind) return (0, this[I].function)(a10);
          this[I].promises.push(a10);
        }
      }
      class K extends J {
        constructor(a10) {
          var b10;
          super(a10.request, null == (b10 = a10.context) ? void 0 : b10.waitUntil), this.sourcePage = a10.page;
        }
        get request() {
          throw Object.defineProperty(new y({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
        respondWith() {
          throw Object.defineProperty(new y({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
      }
      function L(a10) {
        return a10.replace(/\/$/, "") || "/";
      }
      function M(a10) {
        let b10 = a10.indexOf("#"), c10 = a10.indexOf("?"), d10 = c10 > -1 && (b10 < 0 || c10 < b10);
        return d10 || b10 > -1 ? { pathname: a10.substring(0, d10 ? c10 : b10), query: d10 ? a10.substring(c10, b10 > -1 ? b10 : void 0) : "", hash: b10 > -1 ? a10.slice(b10) : "" } : { pathname: a10, query: "", hash: "" };
      }
      function N(a10, b10) {
        if (!a10.startsWith("/") || !b10) return a10;
        let { pathname: c10, query: d10, hash: e2 } = M(a10);
        return "" + b10 + c10 + d10 + e2;
      }
      function O(a10, b10) {
        if (!a10.startsWith("/") || !b10) return a10;
        let { pathname: c10, query: d10, hash: e2 } = M(a10);
        return "" + c10 + b10 + d10 + e2;
      }
      function P(a10, b10) {
        if ("string" != typeof a10) return false;
        let { pathname: c10 } = M(a10);
        return c10 === b10 || c10.startsWith(b10 + "/");
      }
      let Q = /* @__PURE__ */ new WeakMap();
      function R(a10, b10) {
        let c10;
        if (!b10) return { pathname: a10 };
        let d10 = Q.get(b10);
        d10 || (d10 = b10.map((a11) => a11.toLowerCase()), Q.set(b10, d10));
        let e2 = a10.split("/", 2);
        if (!e2[1]) return { pathname: a10 };
        let f2 = e2[1].toLowerCase(), g2 = d10.indexOf(f2);
        return g2 < 0 ? { pathname: a10 } : (c10 = b10[g2], { pathname: a10 = a10.slice(c10.length + 1) || "/", detectedLocale: c10 });
      }
      let S = /(?!^https?:\/\/)(127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}|\[::1\]|localhost)/;
      function T(a10, b10) {
        return new URL(String(a10).replace(S, "localhost"), b10 && String(b10).replace(S, "localhost"));
      }
      let U = Symbol("NextURLInternal");
      class V {
        constructor(a10, b10, c10) {
          let d10, e2;
          "object" == typeof b10 && "pathname" in b10 || "string" == typeof b10 ? (d10 = b10, e2 = c10 || {}) : e2 = c10 || b10 || {}, this[U] = { url: T(a10, d10 ?? e2.base), options: e2, basePath: "" }, this.analyze();
        }
        analyze() {
          var a10, b10, c10, d10, e2;
          let f2 = function(a11, b11) {
            var c11, d11;
            let { basePath: e3, i18n: f3, trailingSlash: g3 } = null != (c11 = b11.nextConfig) ? c11 : {}, h3 = { pathname: a11, trailingSlash: "/" !== a11 ? a11.endsWith("/") : g3 };
            e3 && P(h3.pathname, e3) && (h3.pathname = function(a12, b12) {
              if (!P(a12, b12)) return a12;
              let c12 = a12.slice(b12.length);
              return c12.startsWith("/") ? c12 : "/" + c12;
            }(h3.pathname, e3), h3.basePath = e3);
            let i2 = h3.pathname;
            if (h3.pathname.startsWith("/_next/data/") && h3.pathname.endsWith(".json")) {
              let a12 = h3.pathname.replace(/^\/_next\/data\//, "").replace(/\.json$/, "").split("/");
              h3.buildId = a12[0], i2 = "index" !== a12[1] ? "/" + a12.slice(1).join("/") : "/", true === b11.parseData && (h3.pathname = i2);
            }
            if (f3) {
              let a12 = b11.i18nProvider ? b11.i18nProvider.analyze(h3.pathname) : R(h3.pathname, f3.locales);
              h3.locale = a12.detectedLocale, h3.pathname = null != (d11 = a12.pathname) ? d11 : h3.pathname, !a12.detectedLocale && h3.buildId && (a12 = b11.i18nProvider ? b11.i18nProvider.analyze(i2) : R(i2, f3.locales)).detectedLocale && (h3.locale = a12.detectedLocale);
            }
            return h3;
          }(this[U].url.pathname, { nextConfig: this[U].options.nextConfig, parseData: true, i18nProvider: this[U].options.i18nProvider }), g2 = function(a11, b11) {
            let c11;
            if ((null == b11 ? void 0 : b11.host) && !Array.isArray(b11.host)) c11 = b11.host.toString().split(":", 1)[0];
            else {
              if (!a11.hostname) return;
              c11 = a11.hostname;
            }
            return c11.toLowerCase();
          }(this[U].url, this[U].options.headers);
          this[U].domainLocale = this[U].options.i18nProvider ? this[U].options.i18nProvider.detectDomainLocale(g2) : function(a11, b11, c11) {
            if (a11) for (let f3 of (c11 && (c11 = c11.toLowerCase()), a11)) {
              var d11, e3;
              if (b11 === (null == (d11 = f3.domain) ? void 0 : d11.split(":", 1)[0].toLowerCase()) || c11 === f3.defaultLocale.toLowerCase() || (null == (e3 = f3.locales) ? void 0 : e3.some((a12) => a12.toLowerCase() === c11))) return f3;
            }
          }(null == (b10 = this[U].options.nextConfig) || null == (a10 = b10.i18n) ? void 0 : a10.domains, g2);
          let h2 = (null == (c10 = this[U].domainLocale) ? void 0 : c10.defaultLocale) || (null == (e2 = this[U].options.nextConfig) || null == (d10 = e2.i18n) ? void 0 : d10.defaultLocale);
          this[U].url.pathname = f2.pathname, this[U].defaultLocale = h2, this[U].basePath = f2.basePath ?? "", this[U].buildId = f2.buildId, this[U].locale = f2.locale ?? h2, this[U].trailingSlash = f2.trailingSlash;
        }
        formatPathname() {
          var a10;
          let b10;
          return b10 = function(a11, b11, c10, d10) {
            if (!b11 || b11 === c10) return a11;
            let e2 = a11.toLowerCase();
            return !d10 && (P(e2, "/api") || P(e2, "/" + b11.toLowerCase())) ? a11 : N(a11, "/" + b11);
          }((a10 = { basePath: this[U].basePath, buildId: this[U].buildId, defaultLocale: this[U].options.forceLocale ? void 0 : this[U].defaultLocale, locale: this[U].locale, pathname: this[U].url.pathname, trailingSlash: this[U].trailingSlash }).pathname, a10.locale, a10.buildId ? void 0 : a10.defaultLocale, a10.ignorePrefix), (a10.buildId || !a10.trailingSlash) && (b10 = L(b10)), a10.buildId && (b10 = O(N(b10, "/_next/data/" + a10.buildId), "/" === a10.pathname ? "index.json" : ".json")), b10 = N(b10, a10.basePath), !a10.buildId && a10.trailingSlash ? b10.endsWith("/") ? b10 : O(b10, "/") : L(b10);
        }
        formatSearch() {
          return this[U].url.search;
        }
        get buildId() {
          return this[U].buildId;
        }
        set buildId(a10) {
          this[U].buildId = a10;
        }
        get locale() {
          return this[U].locale ?? "";
        }
        set locale(a10) {
          var b10, c10;
          if (!this[U].locale || !(null == (c10 = this[U].options.nextConfig) || null == (b10 = c10.i18n) ? void 0 : b10.locales.includes(a10))) throw Object.defineProperty(TypeError(`The NextURL configuration includes no locale "${a10}"`), "__NEXT_ERROR_CODE", { value: "E597", enumerable: false, configurable: true });
          this[U].locale = a10;
        }
        get defaultLocale() {
          return this[U].defaultLocale;
        }
        get domainLocale() {
          return this[U].domainLocale;
        }
        get searchParams() {
          return this[U].url.searchParams;
        }
        get host() {
          return this[U].url.host;
        }
        set host(a10) {
          this[U].url.host = a10;
        }
        get hostname() {
          return this[U].url.hostname;
        }
        set hostname(a10) {
          this[U].url.hostname = a10;
        }
        get port() {
          return this[U].url.port;
        }
        set port(a10) {
          this[U].url.port = a10;
        }
        get protocol() {
          return this[U].url.protocol;
        }
        set protocol(a10) {
          this[U].url.protocol = a10;
        }
        get href() {
          let a10 = this.formatPathname(), b10 = this.formatSearch();
          return `${this.protocol}//${this.host}${a10}${b10}${this.hash}`;
        }
        set href(a10) {
          this[U].url = T(a10), this.analyze();
        }
        get origin() {
          return this[U].url.origin;
        }
        get pathname() {
          return this[U].url.pathname;
        }
        set pathname(a10) {
          this[U].url.pathname = a10;
        }
        get hash() {
          return this[U].url.hash;
        }
        set hash(a10) {
          this[U].url.hash = a10;
        }
        get search() {
          return this[U].url.search;
        }
        set search(a10) {
          this[U].url.search = a10;
        }
        get password() {
          return this[U].url.password;
        }
        set password(a10) {
          this[U].url.password = a10;
        }
        get username() {
          return this[U].url.username;
        }
        set username(a10) {
          this[U].url.username = a10;
        }
        get basePath() {
          return this[U].basePath;
        }
        set basePath(a10) {
          this[U].basePath = a10.startsWith("/") ? a10 : `/${a10}`;
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
          return new V(String(this), this[U].options);
        }
      }
      var W = c(9);
      let X = Symbol("internal request");
      class Y extends Request {
        constructor(a10, b10 = {}) {
          let c10 = "string" != typeof a10 && "url" in a10 ? a10.url : String(a10);
          F(c10), a10 instanceof Request ? super(a10, b10) : super(c10, b10);
          let d10 = new V(c10, { headers: E(this.headers), nextConfig: b10.nextConfig });
          this[X] = { cookies: new W.RequestCookies(this.headers), nextUrl: d10, url: d10.toString() };
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { cookies: this.cookies, nextUrl: this.nextUrl, url: this.url, bodyUsed: this.bodyUsed, cache: this.cache, credentials: this.credentials, destination: this.destination, headers: Object.fromEntries(this.headers), integrity: this.integrity, keepalive: this.keepalive, method: this.method, mode: this.mode, redirect: this.redirect, referrer: this.referrer, referrerPolicy: this.referrerPolicy, signal: this.signal };
        }
        get cookies() {
          return this[X].cookies;
        }
        get nextUrl() {
          return this[X].nextUrl;
        }
        get page() {
          throw new z();
        }
        get ua() {
          throw new A();
        }
        get url() {
          return this[X].url;
        }
      }
      class Z {
        static get(a10, b10, c10) {
          let d10 = Reflect.get(a10, b10, c10);
          return "function" == typeof d10 ? d10.bind(a10) : d10;
        }
        static set(a10, b10, c10, d10) {
          return Reflect.set(a10, b10, c10, d10);
        }
        static has(a10, b10) {
          return Reflect.has(a10, b10);
        }
        static deleteProperty(a10, b10) {
          return Reflect.deleteProperty(a10, b10);
        }
      }
      let $ = Symbol("internal response"), _ = /* @__PURE__ */ new Set([301, 302, 303, 307, 308]);
      function aa(a10, b10) {
        var c10;
        if (null == a10 || null == (c10 = a10.request) ? void 0 : c10.headers) {
          if (!(a10.request.headers instanceof Headers)) throw Object.defineProperty(Error("request.headers must be an instance of Headers"), "__NEXT_ERROR_CODE", { value: "E119", enumerable: false, configurable: true });
          let c11 = [];
          for (let [d10, e2] of a10.request.headers) b10.set("x-middleware-request-" + d10, e2), c11.push(d10);
          b10.set("x-middleware-override-headers", c11.join(","));
        }
      }
      class ab extends Response {
        constructor(a10, b10 = {}) {
          super(a10, b10);
          let c10 = this.headers, d10 = new Proxy(new W.ResponseCookies(c10), { get(a11, d11, e2) {
            switch (d11) {
              case "delete":
              case "set":
                return (...e3) => {
                  let f2 = Reflect.apply(a11[d11], a11, e3), g2 = new Headers(c10);
                  return f2 instanceof W.ResponseCookies && c10.set("x-middleware-set-cookie", f2.getAll().map((a12) => (0, W.stringifyCookie)(a12)).join(",")), aa(b10, g2), f2;
                };
              default:
                return Z.get(a11, d11, e2);
            }
          } });
          this[$] = { cookies: d10, url: b10.url ? new V(b10.url, { headers: E(c10), nextConfig: b10.nextConfig }) : void 0 };
        }
        [Symbol.for("edge-runtime.inspect.custom")]() {
          return { cookies: this.cookies, url: this.url, body: this.body, bodyUsed: this.bodyUsed, headers: Object.fromEntries(this.headers), ok: this.ok, redirected: this.redirected, status: this.status, statusText: this.statusText, type: this.type };
        }
        get cookies() {
          return this[$].cookies;
        }
        static json(a10, b10) {
          let c10 = Response.json(a10, b10);
          return new ab(c10.body, c10);
        }
        static redirect(a10, b10) {
          let c10 = "number" == typeof b10 ? b10 : (null == b10 ? void 0 : b10.status) ?? 307;
          if (!_.has(c10)) throw Object.defineProperty(RangeError('Failed to execute "redirect" on "response": Invalid status code'), "__NEXT_ERROR_CODE", { value: "E529", enumerable: false, configurable: true });
          let d10 = "object" == typeof b10 ? b10 : {}, e2 = new Headers(null == d10 ? void 0 : d10.headers);
          return e2.set("Location", F(a10)), new ab(null, { ...d10, headers: e2, status: c10 });
        }
        static rewrite(a10, b10) {
          let c10 = new Headers(null == b10 ? void 0 : b10.headers);
          return c10.set("x-middleware-rewrite", F(a10)), aa(b10, c10), new ab(null, { ...b10, headers: c10 });
        }
        static next(a10) {
          let b10 = new Headers(null == a10 ? void 0 : a10.headers);
          return b10.set("x-middleware-next", "1"), aa(a10, b10), new ab(null, { ...a10, headers: b10 });
        }
      }
      function ac(a10, b10) {
        let c10 = "string" == typeof b10 ? new URL(b10) : b10, d10 = new URL(a10, b10), e2 = d10.origin === c10.origin;
        return { url: e2 ? d10.toString().slice(c10.origin.length) : d10.toString(), isRelative: e2 };
      }
      let ad = "next-router-prefetch", ae = ["rsc", "next-router-state-tree", ad, "next-hmr-refresh", "next-router-segment-prefetch"], af = "_rsc";
      class ag extends Error {
        constructor() {
          super("Headers cannot be modified. Read more: https://nextjs.org/docs/app/api-reference/functions/headers");
        }
        static callable() {
          throw new ag();
        }
      }
      class ah extends Headers {
        constructor(a10) {
          super(), this.headers = new Proxy(a10, { get(b10, c10, d10) {
            if ("symbol" == typeof c10) return Z.get(b10, c10, d10);
            let e2 = c10.toLowerCase(), f2 = Object.keys(a10).find((a11) => a11.toLowerCase() === e2);
            if (void 0 !== f2) return Z.get(b10, f2, d10);
          }, set(b10, c10, d10, e2) {
            if ("symbol" == typeof c10) return Z.set(b10, c10, d10, e2);
            let f2 = c10.toLowerCase(), g2 = Object.keys(a10).find((a11) => a11.toLowerCase() === f2);
            return Z.set(b10, g2 ?? c10, d10, e2);
          }, has(b10, c10) {
            if ("symbol" == typeof c10) return Z.has(b10, c10);
            let d10 = c10.toLowerCase(), e2 = Object.keys(a10).find((a11) => a11.toLowerCase() === d10);
            return void 0 !== e2 && Z.has(b10, e2);
          }, deleteProperty(b10, c10) {
            if ("symbol" == typeof c10) return Z.deleteProperty(b10, c10);
            let d10 = c10.toLowerCase(), e2 = Object.keys(a10).find((a11) => a11.toLowerCase() === d10);
            return void 0 === e2 || Z.deleteProperty(b10, e2);
          } });
        }
        static seal(a10) {
          return new Proxy(a10, { get(a11, b10, c10) {
            switch (b10) {
              case "append":
              case "delete":
              case "set":
                return ag.callable;
              default:
                return Z.get(a11, b10, c10);
            }
          } });
        }
        merge(a10) {
          return Array.isArray(a10) ? a10.join(", ") : a10;
        }
        static from(a10) {
          return a10 instanceof Headers ? a10 : new ah(a10);
        }
        append(a10, b10) {
          let c10 = this.headers[a10];
          "string" == typeof c10 ? this.headers[a10] = [c10, b10] : Array.isArray(c10) ? c10.push(b10) : this.headers[a10] = b10;
        }
        delete(a10) {
          delete this.headers[a10];
        }
        get(a10) {
          let b10 = this.headers[a10];
          return void 0 !== b10 ? this.merge(b10) : null;
        }
        has(a10) {
          return void 0 !== this.headers[a10];
        }
        set(a10, b10) {
          this.headers[a10] = b10;
        }
        forEach(a10, b10) {
          for (let [c10, d10] of this.entries()) a10.call(b10, d10, c10, this);
        }
        *entries() {
          for (let a10 of Object.keys(this.headers)) {
            let b10 = a10.toLowerCase(), c10 = this.get(b10);
            yield [b10, c10];
          }
        }
        *keys() {
          for (let a10 of Object.keys(this.headers)) {
            let b10 = a10.toLowerCase();
            yield b10;
          }
        }
        *values() {
          for (let a10 of Object.keys(this.headers)) {
            let b10 = this.get(a10);
            yield b10;
          }
        }
        [Symbol.iterator]() {
          return this.entries();
        }
      }
      let ai = Object.defineProperty(Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available"), "__NEXT_ERROR_CODE", { value: "E504", enumerable: false, configurable: true });
      class aj {
        disable() {
          throw ai;
        }
        getStore() {
        }
        run() {
          throw ai;
        }
        exit() {
          throw ai;
        }
        enterWith() {
          throw ai;
        }
        static bind(a10) {
          return a10;
        }
      }
      let ak = "undefined" != typeof globalThis && globalThis.AsyncLocalStorage;
      function al() {
        return ak ? new ak() : new aj();
      }
      let am = al();
      class an extends Error {
        constructor() {
          super("Cookies can only be modified in a Server Action or Route Handler. Read more: https://nextjs.org/docs/app/api-reference/functions/cookies#options");
        }
        static callable() {
          throw new an();
        }
      }
      class ao {
        static seal(a10) {
          return new Proxy(a10, { get(a11, b10, c10) {
            switch (b10) {
              case "clear":
              case "delete":
              case "set":
                return an.callable;
              default:
                return Z.get(a11, b10, c10);
            }
          } });
        }
      }
      let ap = Symbol.for("next.mutated.cookies");
      class aq {
        static wrap(a10, b10) {
          let c10 = new W.ResponseCookies(new Headers());
          for (let b11 of a10.getAll()) c10.set(b11);
          let d10 = [], e2 = /* @__PURE__ */ new Set(), f2 = () => {
            let a11 = am.getStore();
            if (a11 && (a11.pathWasRevalidated = true), d10 = c10.getAll().filter((a12) => e2.has(a12.name)), b10) {
              let a12 = [];
              for (let b11 of d10) {
                let c11 = new W.ResponseCookies(new Headers());
                c11.set(b11), a12.push(c11.toString());
              }
              b10(a12);
            }
          }, g2 = new Proxy(c10, { get(a11, b11, c11) {
            switch (b11) {
              case ap:
                return d10;
              case "delete":
                return function(...b12) {
                  e2.add("string" == typeof b12[0] ? b12[0] : b12[0].name);
                  try {
                    return a11.delete(...b12), g2;
                  } finally {
                    f2();
                  }
                };
              case "set":
                return function(...b12) {
                  e2.add("string" == typeof b12[0] ? b12[0] : b12[0].name);
                  try {
                    return a11.set(...b12), g2;
                  } finally {
                    f2();
                  }
                };
              default:
                return Z.get(a11, b11, c11);
            }
          } });
          return g2;
        }
      }
      function ar(a10, b10) {
        if ("action" !== a10.phase) throw new an();
      }
      var as = function(a10) {
        return a10.handleRequest = "BaseServer.handleRequest", a10.run = "BaseServer.run", a10.pipe = "BaseServer.pipe", a10.getStaticHTML = "BaseServer.getStaticHTML", a10.render = "BaseServer.render", a10.renderToResponseWithComponents = "BaseServer.renderToResponseWithComponents", a10.renderToResponse = "BaseServer.renderToResponse", a10.renderToHTML = "BaseServer.renderToHTML", a10.renderError = "BaseServer.renderError", a10.renderErrorToResponse = "BaseServer.renderErrorToResponse", a10.renderErrorToHTML = "BaseServer.renderErrorToHTML", a10.render404 = "BaseServer.render404", a10;
      }(as || {}), at = function(a10) {
        return a10.loadDefaultErrorComponents = "LoadComponents.loadDefaultErrorComponents", a10.loadComponents = "LoadComponents.loadComponents", a10;
      }(at || {}), au = function(a10) {
        return a10.getRequestHandler = "NextServer.getRequestHandler", a10.getServer = "NextServer.getServer", a10.getServerRequestHandler = "NextServer.getServerRequestHandler", a10.createServer = "createServer.createServer", a10;
      }(au || {}), av = function(a10) {
        return a10.compression = "NextNodeServer.compression", a10.getBuildId = "NextNodeServer.getBuildId", a10.createComponentTree = "NextNodeServer.createComponentTree", a10.clientComponentLoading = "NextNodeServer.clientComponentLoading", a10.getLayoutOrPageModule = "NextNodeServer.getLayoutOrPageModule", a10.generateStaticRoutes = "NextNodeServer.generateStaticRoutes", a10.generateFsStaticRoutes = "NextNodeServer.generateFsStaticRoutes", a10.generatePublicRoutes = "NextNodeServer.generatePublicRoutes", a10.generateImageRoutes = "NextNodeServer.generateImageRoutes.route", a10.sendRenderResult = "NextNodeServer.sendRenderResult", a10.proxyRequest = "NextNodeServer.proxyRequest", a10.runApi = "NextNodeServer.runApi", a10.render = "NextNodeServer.render", a10.renderHTML = "NextNodeServer.renderHTML", a10.imageOptimizer = "NextNodeServer.imageOptimizer", a10.getPagePath = "NextNodeServer.getPagePath", a10.getRoutesManifest = "NextNodeServer.getRoutesManifest", a10.findPageComponents = "NextNodeServer.findPageComponents", a10.getFontManifest = "NextNodeServer.getFontManifest", a10.getServerComponentManifest = "NextNodeServer.getServerComponentManifest", a10.getRequestHandler = "NextNodeServer.getRequestHandler", a10.renderToHTML = "NextNodeServer.renderToHTML", a10.renderError = "NextNodeServer.renderError", a10.renderErrorToHTML = "NextNodeServer.renderErrorToHTML", a10.render404 = "NextNodeServer.render404", a10.startResponse = "NextNodeServer.startResponse", a10.route = "route", a10.onProxyReq = "onProxyReq", a10.apiResolver = "apiResolver", a10.internalFetch = "internalFetch", a10;
      }(av || {}), aw = function(a10) {
        return a10.startServer = "startServer.startServer", a10;
      }(aw || {}), ax = function(a10) {
        return a10.getServerSideProps = "Render.getServerSideProps", a10.getStaticProps = "Render.getStaticProps", a10.renderToString = "Render.renderToString", a10.renderDocument = "Render.renderDocument", a10.createBodyResult = "Render.createBodyResult", a10;
      }(ax || {}), ay = function(a10) {
        return a10.renderToString = "AppRender.renderToString", a10.renderToReadableStream = "AppRender.renderToReadableStream", a10.getBodyResult = "AppRender.getBodyResult", a10.fetch = "AppRender.fetch", a10;
      }(ay || {}), az = function(a10) {
        return a10.executeRoute = "Router.executeRoute", a10;
      }(az || {}), aA = function(a10) {
        return a10.runHandler = "Node.runHandler", a10;
      }(aA || {}), aB = function(a10) {
        return a10.runHandler = "AppRouteRouteHandlers.runHandler", a10;
      }(aB || {}), aC = function(a10) {
        return a10.generateMetadata = "ResolveMetadata.generateMetadata", a10.generateViewport = "ResolveMetadata.generateViewport", a10;
      }(aC || {}), aD = function(a10) {
        return a10.execute = "Middleware.execute", a10;
      }(aD || {});
      let aE = ["Middleware.execute", "BaseServer.handleRequest", "Render.getServerSideProps", "Render.getStaticProps", "AppRender.fetch", "AppRender.getBodyResult", "Render.renderDocument", "Node.runHandler", "AppRouteRouteHandlers.runHandler", "ResolveMetadata.generateMetadata", "ResolveMetadata.generateViewport", "NextNodeServer.createComponentTree", "NextNodeServer.findPageComponents", "NextNodeServer.getLayoutOrPageModule", "NextNodeServer.startResponse", "NextNodeServer.clientComponentLoading"], aF = ["NextNodeServer.findPageComponents", "NextNodeServer.createComponentTree", "NextNodeServer.clientComponentLoading"];
      function aG(a10) {
        return null !== a10 && "object" == typeof a10 && "then" in a10 && "function" == typeof a10.then;
      }
      let { context: aH, propagation: aI, trace: aJ, SpanStatusCode: aK, SpanKind: aL, ROOT_CONTEXT: aM } = d = c(487);
      class aN extends Error {
        constructor(a10, b10) {
          super(), this.bubble = a10, this.result = b10;
        }
      }
      let aO = (a10, b10) => {
        (function(a11) {
          return "object" == typeof a11 && null !== a11 && a11 instanceof aN;
        })(b10) && b10.bubble ? a10.setAttribute("next.bubble", true) : (b10 && (a10.recordException(b10), a10.setAttribute("error.type", b10.name)), a10.setStatus({ code: aK.ERROR, message: null == b10 ? void 0 : b10.message })), a10.end();
      }, aP = /* @__PURE__ */ new Map(), aQ = d.createContextKey("next.rootSpanId"), aR = 0, aS = { set(a10, b10, c10) {
        a10.push({ key: b10, value: c10 });
      } };
      class aT {
        getTracerInstance() {
          return aJ.getTracer("next.js", "0.0.1");
        }
        getContext() {
          return aH;
        }
        getTracePropagationData() {
          let a10 = aH.active(), b10 = [];
          return aI.inject(a10, b10, aS), b10;
        }
        getActiveScopeSpan() {
          return aJ.getSpan(null == aH ? void 0 : aH.active());
        }
        withPropagatedContext(a10, b10, c10) {
          let d10 = aH.active();
          if (aJ.getSpanContext(d10)) return b10();
          let e2 = aI.extract(d10, a10, c10);
          return aH.with(e2, b10);
        }
        trace(...a10) {
          var b10;
          let [c10, d10, e2] = a10, { fn: f2, options: g2 } = "function" == typeof d10 ? { fn: d10, options: {} } : { fn: e2, options: { ...d10 } }, h2 = g2.spanName ?? c10;
          if (!aE.includes(c10) && "1" !== process.env.NEXT_OTEL_VERBOSE || g2.hideSpan) return f2();
          let i2 = this.getSpanContext((null == g2 ? void 0 : g2.parentSpan) ?? this.getActiveScopeSpan()), j2 = false;
          i2 ? (null == (b10 = aJ.getSpanContext(i2)) ? void 0 : b10.isRemote) && (j2 = true) : (i2 = (null == aH ? void 0 : aH.active()) ?? aM, j2 = true);
          let k2 = aR++;
          return g2.attributes = { "next.span_name": h2, "next.span_type": c10, ...g2.attributes }, aH.with(i2.setValue(aQ, k2), () => this.getTracerInstance().startActiveSpan(h2, g2, (a11) => {
            let b11 = "performance" in globalThis && "measure" in performance ? globalThis.performance.now() : void 0, d11 = () => {
              aP.delete(k2), b11 && process.env.NEXT_OTEL_PERFORMANCE_PREFIX && aF.includes(c10 || "") && performance.measure(`${process.env.NEXT_OTEL_PERFORMANCE_PREFIX}:next-${(c10.split(".").pop() || "").replace(/[A-Z]/g, (a12) => "-" + a12.toLowerCase())}`, { start: b11, end: performance.now() });
            };
            j2 && aP.set(k2, new Map(Object.entries(g2.attributes ?? {})));
            try {
              if (f2.length > 1) return f2(a11, (b13) => aO(a11, b13));
              let b12 = f2(a11);
              if (aG(b12)) return b12.then((b13) => (a11.end(), b13)).catch((b13) => {
                throw aO(a11, b13), b13;
              }).finally(d11);
              return a11.end(), d11(), b12;
            } catch (b12) {
              throw aO(a11, b12), d11(), b12;
            }
          }));
        }
        wrap(...a10) {
          let b10 = this, [c10, d10, e2] = 3 === a10.length ? a10 : [a10[0], {}, a10[1]];
          return aE.includes(c10) || "1" === process.env.NEXT_OTEL_VERBOSE ? function() {
            let a11 = d10;
            "function" == typeof a11 && "function" == typeof e2 && (a11 = a11.apply(this, arguments));
            let f2 = arguments.length - 1, g2 = arguments[f2];
            if ("function" != typeof g2) return b10.trace(c10, a11, () => e2.apply(this, arguments));
            {
              let d11 = b10.getContext().bind(aH.active(), g2);
              return b10.trace(c10, a11, (a12, b11) => (arguments[f2] = function(a13) {
                return null == b11 || b11(a13), d11.apply(this, arguments);
              }, e2.apply(this, arguments)));
            }
          } : e2;
        }
        startSpan(...a10) {
          let [b10, c10] = a10, d10 = this.getSpanContext((null == c10 ? void 0 : c10.parentSpan) ?? this.getActiveScopeSpan());
          return this.getTracerInstance().startSpan(b10, c10, d10);
        }
        getSpanContext(a10) {
          return a10 ? aJ.setSpan(aH.active(), a10) : void 0;
        }
        getRootSpanAttributes() {
          let a10 = aH.active().getValue(aQ);
          return aP.get(a10);
        }
        setRootSpanAttribute(a10, b10) {
          let c10 = aH.active().getValue(aQ), d10 = aP.get(c10);
          d10 && d10.set(a10, b10);
        }
      }
      let aU = (() => {
        let a10 = new aT();
        return () => a10;
      })(), aV = "__prerender_bypass";
      Symbol("__next_preview_data"), Symbol(aV);
      class aW {
        constructor(a10, b10, c10, d10) {
          var e2;
          let f2 = a10 && function(a11, b11) {
            let c11 = ah.from(a11.headers);
            return { isOnDemandRevalidate: c11.get("x-prerender-revalidate") === b11.previewModeId, revalidateOnlyGenerated: c11.has("x-prerender-revalidate-if-generated") };
          }(b10, a10).isOnDemandRevalidate, g2 = null == (e2 = c10.get(aV)) ? void 0 : e2.value;
          this._isEnabled = !!(!f2 && g2 && a10 && g2 === a10.previewModeId), this._previewModeId = null == a10 ? void 0 : a10.previewModeId, this._mutableCookies = d10;
        }
        get isEnabled() {
          return this._isEnabled;
        }
        enable() {
          if (!this._previewModeId) throw Object.defineProperty(Error("Invariant: previewProps missing previewModeId this should never happen"), "__NEXT_ERROR_CODE", { value: "E93", enumerable: false, configurable: true });
          this._mutableCookies.set({ name: aV, value: this._previewModeId, httpOnly: true, sameSite: "none", secure: true, path: "/" }), this._isEnabled = true;
        }
        disable() {
          this._mutableCookies.set({ name: aV, value: "", httpOnly: true, sameSite: "none", secure: true, path: "/", expires: /* @__PURE__ */ new Date(0) }), this._isEnabled = false;
        }
      }
      function aX(a10, b10) {
        if ("x-middleware-set-cookie" in a10.headers && "string" == typeof a10.headers["x-middleware-set-cookie"]) {
          let c10 = a10.headers["x-middleware-set-cookie"], d10 = new Headers();
          for (let a11 of D(c10)) d10.append("set-cookie", a11);
          for (let a11 of new W.ResponseCookies(d10).getAll()) b10.set(a11);
        }
      }
      let aY = al();
      var aZ = c(975), a$ = c.n(aZ);
      class a_ extends Error {
        constructor(a10, b10) {
          super("Invariant: " + (a10.endsWith(".") ? a10 : a10 + ".") + " This is a bug in Next.js.", b10), this.name = "InvariantError";
        }
      }
      class a0 {
        constructor(a10, b10, c10) {
          this.prev = null, this.next = null, this.key = a10, this.data = b10, this.size = c10;
        }
      }
      class a1 {
        constructor() {
          this.prev = null, this.next = null;
        }
      }
      class a2 {
        constructor(a10, b10) {
          this.cache = /* @__PURE__ */ new Map(), this.totalSize = 0, this.maxSize = a10, this.calculateSize = b10, this.head = new a1(), this.tail = new a1(), this.head.next = this.tail, this.tail.prev = this.head;
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
        set(a10, b10) {
          let c10 = (null == this.calculateSize ? void 0 : this.calculateSize.call(this, b10)) ?? 1;
          if (c10 > this.maxSize) return void console.warn("Single item size exceeds maxSize");
          let d10 = this.cache.get(a10);
          if (d10) d10.data = b10, this.totalSize = this.totalSize - d10.size + c10, d10.size = c10, this.moveToHead(d10);
          else {
            let d11 = new a0(a10, b10, c10);
            this.cache.set(a10, d11), this.addToHead(d11), this.totalSize += c10;
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
          let b10 = this.cache.get(a10);
          if (b10) return this.moveToHead(b10), b10.data;
        }
        *[Symbol.iterator]() {
          let a10 = this.head.next;
          for (; a10 && a10 !== this.tail; ) {
            let b10 = a10;
            yield [b10.key, b10.data], a10 = a10.next;
          }
        }
        remove(a10) {
          let b10 = this.cache.get(a10);
          b10 && (this.removeNode(b10), this.cache.delete(a10), this.totalSize -= b10.size);
        }
        get size() {
          return this.cache.size;
        }
        get currentSize() {
          return this.totalSize;
        }
      }
      c(356).Buffer, new a2(52428800, (a10) => a10.size), process.env.NEXT_PRIVATE_DEBUG_CACHE && console.debug.bind(console, "DefaultCacheHandler:"), process.env.NEXT_PRIVATE_DEBUG_CACHE && ((a10, ...b10) => {
        console.log(`use-cache: ${a10}`, ...b10);
      }), Symbol.for("@next/cache-handlers");
      let a3 = Symbol.for("@next/cache-handlers-map"), a4 = Symbol.for("@next/cache-handlers-set"), a5 = globalThis;
      function a6() {
        if (a5[a3]) return a5[a3].entries();
      }
      async function a7(a10, b10) {
        if (!a10) return b10();
        let c10 = a8(a10);
        try {
          return await b10();
        } finally {
          let b11 = function(a11, b12) {
            let c11 = new Set(a11.pendingRevalidatedTags), d10 = new Set(a11.pendingRevalidateWrites);
            return { pendingRevalidatedTags: b12.pendingRevalidatedTags.filter((a12) => !c11.has(a12)), pendingRevalidates: Object.fromEntries(Object.entries(b12.pendingRevalidates).filter(([b13]) => !(b13 in a11.pendingRevalidates))), pendingRevalidateWrites: b12.pendingRevalidateWrites.filter((a12) => !d10.has(a12)) };
          }(c10, a8(a10));
          await ba(a10, b11);
        }
      }
      function a8(a10) {
        return { pendingRevalidatedTags: a10.pendingRevalidatedTags ? [...a10.pendingRevalidatedTags] : [], pendingRevalidates: { ...a10.pendingRevalidates }, pendingRevalidateWrites: a10.pendingRevalidateWrites ? [...a10.pendingRevalidateWrites] : [] };
      }
      async function a9(a10, b10) {
        if (0 === a10.length) return;
        let c10 = [];
        b10 && c10.push(b10.revalidateTag(a10));
        let d10 = function() {
          if (a5[a4]) return a5[a4].values();
        }();
        if (d10) for (let b11 of d10) c10.push(b11.expireTags(...a10));
        await Promise.all(c10);
      }
      async function ba(a10, b10) {
        let c10 = (null == b10 ? void 0 : b10.pendingRevalidatedTags) ?? a10.pendingRevalidatedTags ?? [], d10 = (null == b10 ? void 0 : b10.pendingRevalidates) ?? a10.pendingRevalidates ?? {}, e2 = (null == b10 ? void 0 : b10.pendingRevalidateWrites) ?? a10.pendingRevalidateWrites ?? [];
        return Promise.all([a9(c10, a10.incrementalCache), ...Object.values(d10), ...e2]);
      }
      let bb = Object.defineProperty(Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available"), "__NEXT_ERROR_CODE", { value: "E504", enumerable: false, configurable: true });
      class bc {
        disable() {
          throw bb;
        }
        getStore() {
        }
        run() {
          throw bb;
        }
        exit() {
          throw bb;
        }
        enterWith() {
          throw bb;
        }
        static bind(a10) {
          return a10;
        }
      }
      let bd = "undefined" != typeof globalThis && globalThis.AsyncLocalStorage, be = bd ? new bd() : new bc();
      class bf {
        constructor({ waitUntil: a10, onClose: b10, onTaskError: c10 }) {
          this.workUnitStores = /* @__PURE__ */ new Set(), this.waitUntil = a10, this.onClose = b10, this.onTaskError = c10, this.callbackQueue = new (a$())(), this.callbackQueue.pause();
        }
        after(a10) {
          if (aG(a10)) this.waitUntil || bg(), this.waitUntil(a10.catch((a11) => this.reportTaskError("promise", a11)));
          else if ("function" == typeof a10) this.addCallback(a10);
          else throw Object.defineProperty(Error("`after()`: Argument must be a promise or a function"), "__NEXT_ERROR_CODE", { value: "E50", enumerable: false, configurable: true });
        }
        addCallback(a10) {
          var b10;
          this.waitUntil || bg();
          let c10 = aY.getStore();
          c10 && this.workUnitStores.add(c10);
          let d10 = be.getStore(), e2 = d10 ? d10.rootTaskSpawnPhase : null == c10 ? void 0 : c10.phase;
          this.runCallbacksOnClosePromise || (this.runCallbacksOnClosePromise = this.runCallbacksOnClose(), this.waitUntil(this.runCallbacksOnClosePromise));
          let f2 = (b10 = async () => {
            try {
              await be.run({ rootTaskSpawnPhase: e2 }, () => a10());
            } catch (a11) {
              this.reportTaskError("function", a11);
            }
          }, bd ? bd.bind(b10) : bc.bind(b10));
          this.callbackQueue.add(f2);
        }
        async runCallbacksOnClose() {
          return await new Promise((a10) => this.onClose(a10)), this.runCallbacks();
        }
        async runCallbacks() {
          if (0 === this.callbackQueue.size) return;
          for (let a11 of this.workUnitStores) a11.phase = "after";
          let a10 = am.getStore();
          if (!a10) throw Object.defineProperty(new a_("Missing workStore in AfterContext.runCallbacks"), "__NEXT_ERROR_CODE", { value: "E547", enumerable: false, configurable: true });
          return a7(a10, () => (this.callbackQueue.start(), this.callbackQueue.onIdle()));
        }
        reportTaskError(a10, b10) {
          if (console.error("promise" === a10 ? "A promise passed to `after()` rejected:" : "An error occurred in a function passed to `after()`:", b10), this.onTaskError) try {
            null == this.onTaskError || this.onTaskError.call(this, b10);
          } catch (a11) {
            console.error(Object.defineProperty(new a_("`onTaskError` threw while handling an error thrown from an `after` task", { cause: a11 }), "__NEXT_ERROR_CODE", { value: "E569", enumerable: false, configurable: true }));
          }
        }
      }
      function bg() {
        throw Object.defineProperty(Error("`after()` will not work correctly, because `waitUntil` is not available in the current environment."), "__NEXT_ERROR_CODE", { value: "E91", enumerable: false, configurable: true });
      }
      function bh(a10) {
        let b10, c10 = { then: (d10, e2) => (b10 || (b10 = a10()), b10.then((a11) => {
          c10.value = a11;
        }).catch(() => {
        }), b10.then(d10, e2)) };
        return c10;
      }
      class bi {
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
      function bj() {
        return { previewModeId: process.env.__NEXT_PREVIEW_MODE_ID || "", previewModeSigningKey: process.env.__NEXT_PREVIEW_MODE_SIGNING_KEY || "", previewModeEncryptionKey: process.env.__NEXT_PREVIEW_MODE_ENCRYPTION_KEY || "" };
      }
      let bk = Symbol.for("@next/request-context");
      async function bl(a10, b10, c10) {
        let d10 = [], e2 = c10 && c10.size > 0;
        for (let b11 of ((a11) => {
          let b12 = ["/layout"];
          if (a11.startsWith("/")) {
            let c11 = a11.split("/");
            for (let a12 = 1; a12 < c11.length + 1; a12++) {
              let d11 = c11.slice(0, a12).join("/");
              d11 && (d11.endsWith("/page") || d11.endsWith("/route") || (d11 = `${d11}${!d11.endsWith("/") ? "/" : ""}layout`), b12.push(d11));
            }
          }
          return b12;
        })(a10)) b11 = `${B}${b11}`, d10.push(b11);
        if (b10.pathname && !e2) {
          let a11 = `${B}${b10.pathname}`;
          d10.push(a11);
        }
        return { tags: d10, expirationsByCacheKind: function(a11) {
          let b11 = /* @__PURE__ */ new Map(), c11 = a6();
          if (c11) for (let [d11, e3] of c11) "getExpiration" in e3 && b11.set(d11, bh(async () => e3.getExpiration(...a11)));
          return b11;
        }(d10) };
      }
      class bm extends Y {
        constructor(a10) {
          super(a10.input, a10.init), this.sourcePage = a10.page;
        }
        get request() {
          throw Object.defineProperty(new y({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
        respondWith() {
          throw Object.defineProperty(new y({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
        waitUntil() {
          throw Object.defineProperty(new y({ page: this.sourcePage }), "__NEXT_ERROR_CODE", { value: "E394", enumerable: false, configurable: true });
        }
      }
      let bn = { keys: (a10) => Array.from(a10.keys()), get: (a10, b10) => a10.get(b10) ?? void 0 }, bo = (a10, b10) => aU().withPropagatedContext(a10.headers, b10, bn), bp = false;
      async function bq(a10) {
        var b10;
        let d10, e2;
        if (!bp && (bp = true, "true" === process.env.NEXT_PRIVATE_TEST_PROXY)) {
          let { interceptTestApis: a11, wrapRequestHandler: b11 } = c(374);
          a11(), bo = b11(bo);
        }
        await w();
        let f2 = void 0 !== globalThis.__BUILD_MANIFEST;
        a10.request.url = a10.request.url.replace(/\.rsc($|\?)/, "$1");
        let g2 = a10.bypassNextUrl ? new URL(a10.request.url) : new V(a10.request.url, { headers: a10.request.headers, nextConfig: a10.request.nextConfig });
        for (let a11 of [...g2.searchParams.keys()]) {
          let b11 = g2.searchParams.getAll(a11), c10 = function(a12) {
            for (let b12 of ["nxtP", "nxtI"]) if (a12 !== b12 && a12.startsWith(b12)) return a12.substring(b12.length);
            return null;
          }(a11);
          if (c10) {
            for (let a12 of (g2.searchParams.delete(c10), b11)) g2.searchParams.append(c10, a12);
            g2.searchParams.delete(a11);
          }
        }
        let h2 = process.env.__NEXT_BUILD_ID || "";
        "buildId" in g2 && (h2 = g2.buildId || "", g2.buildId = "");
        let i2 = function(a11) {
          let b11 = new Headers();
          for (let [c10, d11] of Object.entries(a11)) for (let a12 of Array.isArray(d11) ? d11 : [d11]) void 0 !== a12 && ("number" == typeof a12 && (a12 = a12.toString()), b11.append(c10, a12));
          return b11;
        }(a10.request.headers), j2 = i2.has("x-nextjs-data"), k2 = "1" === i2.get("rsc");
        j2 && "/index" === g2.pathname && (g2.pathname = "/");
        let l2 = /* @__PURE__ */ new Map();
        if (!f2) for (let a11 of ae) {
          let b11 = i2.get(a11);
          null !== b11 && (l2.set(a11, b11), i2.delete(a11));
        }
        let m2 = g2.searchParams.get(af), n2 = new bm({ page: a10.page, input: function(a11) {
          let b11 = "string" == typeof a11, c10 = b11 ? new URL(a11) : a11;
          return c10.searchParams.delete(af), b11 ? c10.toString() : c10;
        }(g2).toString(), init: { body: a10.request.body, headers: i2, method: a10.request.method, nextConfig: a10.request.nextConfig, signal: a10.request.signal } });
        j2 && Object.defineProperty(n2, "__isData", { enumerable: false, value: true }), !globalThis.__incrementalCacheShared && a10.IncrementalCache && (globalThis.__incrementalCache = new a10.IncrementalCache({ CurCacheHandler: a10.incrementalCacheHandler, minimalMode: true, fetchCacheKeyPrefix: "", dev: false, requestHeaders: a10.request.headers, getPrerenderManifest: () => ({ version: -1, routes: {}, dynamicRoutes: {}, notFoundRoutes: [], preview: bj() }) }));
        let o2 = a10.request.waitUntil ?? (null == (b10 = function() {
          let a11 = globalThis[bk];
          return null == a11 ? void 0 : a11.get();
        }()) ? void 0 : b10.waitUntil), p2 = new K({ request: n2, page: a10.page, context: o2 ? { waitUntil: o2 } : void 0 });
        if ((d10 = await bo(n2, () => {
          if ("/middleware" === a10.page || "/src/middleware" === a10.page) {
            let b11 = p2.waitUntil.bind(p2), c10 = new bi();
            return aU().trace(aD.execute, { spanName: `middleware ${n2.method} ${n2.nextUrl.pathname}`, attributes: { "http.target": n2.nextUrl.pathname, "http.method": n2.method } }, async () => {
              try {
                var d11, f3, g3, i3, j3, k3;
                let l3 = bj(), m3 = await bl("/", n2.nextUrl, null), o3 = (j3 = n2.nextUrl, k3 = (a11) => {
                  e2 = a11;
                }, function(a11, b12, c11, d12, e3, f4, g4, h3, i4, j4, k4, l4) {
                  function m4(a12) {
                    c11 && c11.setHeader("Set-Cookie", a12);
                  }
                  let n3 = {};
                  return { type: "request", phase: a11, implicitTags: f4, url: { pathname: d12.pathname, search: d12.search ?? "" }, rootParams: e3, get headers() {
                    return n3.headers || (n3.headers = function(a12) {
                      let b13 = ah.from(a12);
                      for (let a13 of ae) b13.delete(a13);
                      return ah.seal(b13);
                    }(b12.headers)), n3.headers;
                  }, get cookies() {
                    if (!n3.cookies) {
                      let a12 = new W.RequestCookies(ah.from(b12.headers));
                      aX(b12, a12), n3.cookies = ao.seal(a12);
                    }
                    return n3.cookies;
                  }, set cookies(value) {
                    n3.cookies = value;
                  }, get mutableCookies() {
                    if (!n3.mutableCookies) {
                      let a12 = function(a13, b13) {
                        let c12 = new W.RequestCookies(ah.from(a13));
                        return aq.wrap(c12, b13);
                      }(b12.headers, g4 || (c11 ? m4 : void 0));
                      aX(b12, a12), n3.mutableCookies = a12;
                    }
                    return n3.mutableCookies;
                  }, get userspaceMutableCookies() {
                    return n3.userspaceMutableCookies || (n3.userspaceMutableCookies = function(a12) {
                      let b13 = new Proxy(a12.mutableCookies, { get(c12, d13, e4) {
                        switch (d13) {
                          case "delete":
                            return function(...d14) {
                              return ar(a12, "cookies().delete"), c12.delete(...d14), b13;
                            };
                          case "set":
                            return function(...d14) {
                              return ar(a12, "cookies().set"), c12.set(...d14), b13;
                            };
                          default:
                            return Z.get(c12, d13, e4);
                        }
                      } });
                      return b13;
                    }(this)), n3.userspaceMutableCookies;
                  }, get draftMode() {
                    return n3.draftMode || (n3.draftMode = new aW(i4, b12, this.cookies, this.mutableCookies)), n3.draftMode;
                  }, renderResumeDataCache: h3 ?? null, isHmrRefresh: j4, serverComponentsHmrCache: k4 || globalThis.__serverComponentsHmrCache, devFallbackParams: null };
                }("action", n2, void 0, j3, {}, m3, k3, void 0, l3, false, void 0, null)), q3 = function({ page: a11, renderOpts: b12, isPrefetchRequest: c11, buildId: d12, previouslyRevalidatedTags: e3 }) {
                  var f4;
                  let g4 = !b12.shouldWaitOnAllReady && !b12.supportsDynamicResponse && !b12.isDraftMode && !b12.isPossibleServerAction, h3 = b12.dev ?? false, i4 = h3 || g4 && (!!process.env.NEXT_DEBUG_BUILD || "1" === process.env.NEXT_SSG_FETCH_METRICS), j4 = { isStaticGeneration: g4, page: a11, route: (f4 = a11.split("/").reduce((a12, b13, c12, d13) => b13 ? "(" === b13[0] && b13.endsWith(")") || "@" === b13[0] || ("page" === b13 || "route" === b13) && c12 === d13.length - 1 ? a12 : a12 + "/" + b13 : a12, "")).startsWith("/") ? f4 : "/" + f4, incrementalCache: b12.incrementalCache || globalThis.__incrementalCache, cacheLifeProfiles: b12.cacheLifeProfiles, isRevalidate: b12.isRevalidate, isBuildTimePrerendering: b12.nextExport, hasReadableErrorStacks: b12.hasReadableErrorStacks, fetchCache: b12.fetchCache, isOnDemandRevalidate: b12.isOnDemandRevalidate, isDraftMode: b12.isDraftMode, isPrefetchRequest: c11, buildId: d12, reactLoadableManifest: (null == b12 ? void 0 : b12.reactLoadableManifest) || {}, assetPrefix: (null == b12 ? void 0 : b12.assetPrefix) || "", afterContext: function(a12) {
                    let { waitUntil: b13, onClose: c12, onAfterTaskError: d13 } = a12;
                    return new bf({ waitUntil: b13, onClose: c12, onTaskError: d13 });
                  }(b12), cacheComponentsEnabled: b12.experimental.cacheComponents, dev: h3, previouslyRevalidatedTags: e3, refreshTagsByCacheKind: function() {
                    let a12 = /* @__PURE__ */ new Map(), b13 = a6();
                    if (b13) for (let [c12, d13] of b13) "refreshTags" in d13 && a12.set(c12, bh(async () => d13.refreshTags()));
                    return a12;
                  }(), runInCleanSnapshot: bd ? bd.snapshot() : function(a12, ...b13) {
                    return a12(...b13);
                  }, shouldTrackFetchMetrics: i4 };
                  return b12.store = j4, j4;
                }({ page: "/", renderOpts: { cacheLifeProfiles: null == (f3 = a10.request.nextConfig) || null == (d11 = f3.experimental) ? void 0 : d11.cacheLife, experimental: { isRoutePPREnabled: false, cacheComponents: false, authInterrupts: !!(null == (i3 = a10.request.nextConfig) || null == (g3 = i3.experimental) ? void 0 : g3.authInterrupts) }, supportsDynamicResponse: true, waitUntil: b11, onClose: c10.onClose.bind(c10), onAfterTaskError: void 0 }, isPrefetchRequest: "1" === n2.headers.get(ad), buildId: h2 ?? "", previouslyRevalidatedTags: [] });
                return await am.run(q3, () => aY.run(o3, a10.handler, n2, p2));
              } finally {
                setTimeout(() => {
                  c10.dispatchClose();
                }, 0);
              }
            });
          }
          return a10.handler(n2, p2);
        })) && !(d10 instanceof Response)) throw Object.defineProperty(TypeError("Expected an instance of Response to be returned"), "__NEXT_ERROR_CODE", { value: "E567", enumerable: false, configurable: true });
        d10 && e2 && d10.headers.set("set-cookie", e2);
        let q2 = null == d10 ? void 0 : d10.headers.get("x-middleware-rewrite");
        if (d10 && q2 && (k2 || !f2)) {
          let b11 = new V(q2, { forceLocale: true, headers: a10.request.headers, nextConfig: a10.request.nextConfig });
          f2 || b11.host !== n2.nextUrl.host || (b11.buildId = h2 || b11.buildId, d10.headers.set("x-middleware-rewrite", String(b11)));
          let { url: c10, isRelative: e3 } = ac(b11.toString(), g2.toString());
          !f2 && j2 && d10.headers.set("x-nextjs-rewrite", c10), k2 && e3 && (g2.pathname !== b11.pathname && d10.headers.set("x-nextjs-rewritten-path", b11.pathname), g2.search !== b11.search && d10.headers.set("x-nextjs-rewritten-query", b11.search.slice(1)));
        }
        if (d10 && q2 && k2 && m2) {
          let a11 = new URL(q2);
          a11.searchParams.has(af) || (a11.searchParams.set(af, m2), d10.headers.set("x-middleware-rewrite", a11.toString()));
        }
        let r2 = null == d10 ? void 0 : d10.headers.get("Location");
        if (d10 && r2 && !f2) {
          let b11 = new V(r2, { forceLocale: false, headers: a10.request.headers, nextConfig: a10.request.nextConfig });
          d10 = new Response(d10.body, d10), b11.host === g2.host && (b11.buildId = h2 || b11.buildId, d10.headers.set("Location", b11.toString())), j2 && (d10.headers.delete("Location"), d10.headers.set("x-nextjs-redirect", ac(b11.toString(), g2.toString()).url));
        }
        let s2 = d10 || ab.next(), t2 = s2.headers.get("x-middleware-override-headers"), u2 = [];
        if (t2) {
          for (let [a11, b11] of l2) s2.headers.set(`x-middleware-request-${a11}`, b11), u2.push(a11);
          u2.length > 0 && s2.headers.set("x-middleware-override-headers", t2 + "," + u2.join(","));
        }
        return { response: s2, waitUntil: ("internal" === p2[I].kind ? Promise.all(p2[I].promises).then(() => {
        }) : void 0) ?? Promise.resolve(), fetchMetrics: n2.fetchMetrics };
      }
      c(899), "undefined" == typeof URLPattern || URLPattern;
      var br = c(484);
      if (/* @__PURE__ */ new WeakMap(), br.unstable_postpone, false === function(a10) {
        return a10.includes("needs to bail out of prerendering at this point because it used") && a10.includes("Learn more: https://nextjs.org/docs/messages/ppr-caught-error");
      }("Route %%% needs to bail out of prerendering at this point because it used ^^^. React throws this special object to indicate where. It should not be caught by your own try/catch. Learn more: https://nextjs.org/docs/messages/ppr-caught-error")) throw Object.defineProperty(Error("Invariant: isDynamicPostpone misidentified a postpone reason. This is a bug in Next.js"), "__NEXT_ERROR_CODE", { value: "E296", enumerable: false, configurable: true });
      RegExp(`\\n\\s+at Suspense \\(<anonymous>\\)(?:(?!\\n\\s+at (?:body|div|main|section|article|aside|header|footer|nav|form|p|span|h1|h2|h3|h4|h5|h6) \\(<anonymous>\\))[\\s\\S])*?\\n\\s+at __next_root_layout_boundary__ \\([^\\n]*\\)`), RegExp(`\\n\\s+at __next_metadata_boundary__[\\n\\s]`), RegExp(`\\n\\s+at __next_viewport_boundary__[\\n\\s]`), RegExp(`\\n\\s+at __next_outlet_boundary__[\\n\\s]`), al();
      let { env: bs, stdout: bt } = (null == (e = globalThis) ? void 0 : e.process) ?? {}, bu = bs && !bs.NO_COLOR && (bs.FORCE_COLOR || (null == bt ? void 0 : bt.isTTY) && !bs.CI && "dumb" !== bs.TERM), bv = (a10, b10, c10, d10) => {
        let e2 = a10.substring(0, d10) + c10, f2 = a10.substring(d10 + b10.length), g2 = f2.indexOf(b10);
        return ~g2 ? e2 + bv(f2, b10, c10, g2) : e2 + f2;
      }, bw = (a10, b10, c10 = a10) => bu ? (d10) => {
        let e2 = "" + d10, f2 = e2.indexOf(b10, a10.length);
        return ~f2 ? a10 + bv(e2, b10, c10, f2) + b10 : a10 + e2 + b10;
      } : String, bx = bw("\x1B[1m", "\x1B[22m", "\x1B[22m\x1B[1m");
      bw("\x1B[2m", "\x1B[22m", "\x1B[22m\x1B[2m"), bw("\x1B[3m", "\x1B[23m"), bw("\x1B[4m", "\x1B[24m"), bw("\x1B[7m", "\x1B[27m"), bw("\x1B[8m", "\x1B[28m"), bw("\x1B[9m", "\x1B[29m"), bw("\x1B[30m", "\x1B[39m");
      let by = bw("\x1B[31m", "\x1B[39m"), bz = bw("\x1B[32m", "\x1B[39m"), bA = bw("\x1B[33m", "\x1B[39m");
      bw("\x1B[34m", "\x1B[39m");
      let bB = bw("\x1B[35m", "\x1B[39m");
      bw("\x1B[38;2;173;127;168m", "\x1B[39m"), bw("\x1B[36m", "\x1B[39m");
      let bC = bw("\x1B[37m", "\x1B[39m");
      bw("\x1B[90m", "\x1B[39m"), bw("\x1B[40m", "\x1B[49m"), bw("\x1B[41m", "\x1B[49m"), bw("\x1B[42m", "\x1B[49m"), bw("\x1B[43m", "\x1B[49m"), bw("\x1B[44m", "\x1B[49m"), bw("\x1B[45m", "\x1B[49m"), bw("\x1B[46m", "\x1B[49m"), bw("\x1B[47m", "\x1B[49m"), bC(bx("\u25CB")), by(bx("\u2A2F")), bA(bx("\u26A0")), bC(bx(" ")), bz(bx("\u2713")), bB(bx("\xBB")), new a2(1e4, (a10) => a10.length), /* @__PURE__ */ new WeakMap();
      var bD = c(465);
      function bE() {
        return "undefined" != typeof window && void 0 !== window.document;
      }
      let bF = { path: "/", sameSite: "lax", httpOnly: false, maxAge: 3456e4 }, bG = /^(.*)[.](0|[1-9][0-9]*)$/;
      function bH(a10, b10) {
        if (a10 === b10) return true;
        let c10 = a10.match(bG);
        return !!c10 && c10[1] === b10;
      }
      function bI(a10, b10, c10) {
        let d10 = c10 ?? 3180, e2 = encodeURIComponent(b10);
        if (e2.length <= d10) return [{ name: a10, value: b10 }];
        let f2 = [];
        for (; e2.length > 0; ) {
          let a11 = e2.slice(0, d10), b11 = a11.lastIndexOf("%");
          b11 > d10 - 3 && (a11 = a11.slice(0, b11));
          let c11 = "";
          for (; a11.length > 0; ) try {
            c11 = decodeURIComponent(a11);
            break;
          } catch (b12) {
            if (b12 instanceof URIError && "%" === a11.at(-3) && a11.length > 3) a11 = a11.slice(0, a11.length - 3);
            else throw b12;
          }
          f2.push(c11), e2 = e2.slice(a11.length);
        }
        return f2.map((b11, c11) => ({ name: `${a10}.${c11}`, value: b11 }));
      }
      async function bJ(a10, b10) {
        let c10 = await b10(a10);
        if (c10) return c10;
        let d10 = [];
        for (let c11 = 0; ; c11++) {
          let e2 = `${a10}.${c11}`, f2 = await b10(e2);
          if (!f2) break;
          d10.push(f2);
        }
        return d10.length > 0 ? d10.join("") : null;
      }
      let bK = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split(""), bL = " 	\n\r=".split(""), bM = (() => {
        let a10 = Array(128);
        for (let b10 = 0; b10 < a10.length; b10 += 1) a10[b10] = -1;
        for (let b10 = 0; b10 < bL.length; b10 += 1) a10[bL[b10].charCodeAt(0)] = -2;
        for (let b10 = 0; b10 < bK.length; b10 += 1) a10[bK[b10].charCodeAt(0)] = b10;
        return a10;
      })();
      function bN(a10) {
        let b10 = [], c10 = 0, d10 = 0;
        if (function(a11, b11) {
          for (let c11 = 0; c11 < a11.length; c11 += 1) {
            let d11 = a11.charCodeAt(c11);
            if (d11 > 55295 && d11 <= 56319) {
              let b12 = (d11 - 55296) * 1024 & 65535;
              d11 = (a11.charCodeAt(c11 + 1) - 56320 & 65535 | b12) + 65536, c11 += 1;
            }
            !function(a12, b12) {
              if (a12 <= 127) return b12(a12);
              if (a12 <= 2047) {
                b12(192 | a12 >> 6), b12(128 | 63 & a12);
                return;
              }
              if (a12 <= 65535) {
                b12(224 | a12 >> 12), b12(128 | a12 >> 6 & 63), b12(128 | 63 & a12);
                return;
              }
              if (a12 <= 1114111) {
                b12(240 | a12 >> 18), b12(128 | a12 >> 12 & 63), b12(128 | a12 >> 6 & 63), b12(128 | 63 & a12);
                return;
              }
              throw Error(`Unrecognized Unicode codepoint: ${a12.toString(16)}`);
            }(d11, b11);
          }
        }(a10, (a11) => {
          for (c10 = c10 << 8 | a11, d10 += 8; d10 >= 6; ) {
            let a12 = c10 >> d10 - 6 & 63;
            b10.push(bK[a12]), d10 -= 6;
          }
        }), d10 > 0) for (c10 <<= 6 - d10, d10 = 6; d10 >= 6; ) {
          let a11 = c10 >> d10 - 6 & 63;
          b10.push(bK[a11]), d10 -= 6;
        }
        return b10.join("");
      }
      function bO(a10) {
        let b10 = [], c10 = (a11) => {
          b10.push(String.fromCodePoint(a11));
        }, d10 = { utf8seq: 0, codepoint: 0 }, e2 = 0, f2 = 0;
        for (let b11 = 0; b11 < a10.length; b11 += 1) {
          let g2 = bM[a10.charCodeAt(b11)];
          if (g2 > -1) for (e2 = e2 << 6 | g2, f2 += 6; f2 >= 8; ) (function(a11, b12, c11) {
            if (0 === b12.utf8seq) {
              if (a11 <= 127) return c11(a11);
              for (let c12 = 1; c12 < 6; c12 += 1) if ((a11 >> 7 - c12 & 1) == 0) {
                b12.utf8seq = c12;
                break;
              }
              if (2 === b12.utf8seq) b12.codepoint = 31 & a11;
              else if (3 === b12.utf8seq) b12.codepoint = 15 & a11;
              else if (4 === b12.utf8seq) b12.codepoint = 7 & a11;
              else throw Error("Invalid UTF-8 sequence");
              b12.utf8seq -= 1;
            } else if (b12.utf8seq > 0) {
              if (a11 <= 127) throw Error("Invalid UTF-8 sequence");
              b12.codepoint = b12.codepoint << 6 | 63 & a11, b12.utf8seq -= 1, 0 === b12.utf8seq && c11(b12.codepoint);
            }
          })(e2 >> f2 - 8 & 255, d10, c10), f2 -= 8;
          else if (-2 === g2) continue;
          else throw Error(`Invalid Base64-URL character "${a10.at(b11)}" at position ${b11}`);
        }
        return b10.join("");
      }
      let bP = "base64-";
      async function bQ({ getAll: a10, setAll: b10, setItems: c10, removedItems: d10 }, e2) {
        let f2 = e2.cookieEncoding, g2 = e2.cookieOptions ?? null, h2 = await a10([...c10 ? Object.keys(c10) : [], ...d10 ? Object.keys(d10) : []]), i2 = h2?.map(({ name: a11 }) => a11) || [], j2 = Object.keys(d10).flatMap((a11) => i2.filter((b11) => bH(b11, a11))), k2 = Object.keys(c10).flatMap((a11) => {
          let b11 = new Set(i2.filter((b12) => bH(b12, a11))), d11 = c10[a11];
          "base64url" === f2 && (d11 = bP + bN(d11));
          let e3 = bI(a11, d11);
          return e3.forEach((a12) => {
            b11.delete(a12.name);
          }), j2.push(...b11), e3;
        }), l2 = { ...bF, ...g2, maxAge: 0 }, m2 = { ...bF, ...g2, maxAge: bF.maxAge };
        delete l2.name, delete m2.name, await b10([...j2.map((a11) => ({ name: a11, value: "", options: l2 })), ...k2.map(({ name: a11, value: b11 }) => ({ name: a11, value: b11, options: m2 }))]);
      }
      class bR extends Error {
        constructor(a10, b10 = "FunctionsError", c10) {
          super(a10), this.name = b10, this.context = c10;
        }
      }
      class bS extends bR {
        constructor(a10) {
          super("Failed to send a request to the Edge Function", "FunctionsFetchError", a10);
        }
      }
      class bT extends bR {
        constructor(a10) {
          super("Relay Error invoking the Edge Function", "FunctionsRelayError", a10);
        }
      }
      class bU extends bR {
        constructor(a10) {
          super("Edge Function returned a non-2xx status code", "FunctionsHttpError", a10);
        }
      }
      !function(a10) {
        a10.Any = "any", a10.ApNortheast1 = "ap-northeast-1", a10.ApNortheast2 = "ap-northeast-2", a10.ApSouth1 = "ap-south-1", a10.ApSoutheast1 = "ap-southeast-1", a10.ApSoutheast2 = "ap-southeast-2", a10.CaCentral1 = "ca-central-1", a10.EuCentral1 = "eu-central-1", a10.EuWest1 = "eu-west-1", a10.EuWest2 = "eu-west-2", a10.EuWest3 = "eu-west-3", a10.SaEast1 = "sa-east-1", a10.UsEast1 = "us-east-1", a10.UsWest1 = "us-west-1", a10.UsWest2 = "us-west-2";
      }(f || (f = {}));
      class bV {
        constructor(a10, { headers: b10 = {}, customFetch: d10, region: e2 = f.Any } = {}) {
          this.url = a10, this.headers = b10, this.region = e2, this.fetch = ((a11) => {
            let b11;
            return b11 = a11 || ("undefined" == typeof fetch ? (...a12) => Promise.resolve().then(c.bind(c, 506)).then(({ default: b12 }) => b12(...a12)) : fetch), (...a12) => b11(...a12);
          })(d10);
        }
        setAuth(a10) {
          this.headers.Authorization = `Bearer ${a10}`;
        }
        invoke(a10, b10 = {}) {
          var c10, d10, e2, f2, g2;
          return d10 = this, e2 = void 0, f2 = void 0, g2 = function* () {
            try {
              let d11, { headers: e3, method: f3, body: g3 } = b10, h2 = {}, { region: i2 } = b10;
              i2 || (i2 = this.region);
              let j2 = new URL(`${this.url}/${a10}`);
              i2 && "any" !== i2 && (h2["x-region"] = i2, j2.searchParams.set("forceFunctionRegion", i2)), g3 && (e3 && !Object.prototype.hasOwnProperty.call(e3, "Content-Type") || !e3) && ("undefined" != typeof Blob && g3 instanceof Blob || g3 instanceof ArrayBuffer ? (h2["Content-Type"] = "application/octet-stream", d11 = g3) : "string" == typeof g3 ? (h2["Content-Type"] = "text/plain", d11 = g3) : "undefined" != typeof FormData && g3 instanceof FormData ? d11 = g3 : (h2["Content-Type"] = "application/json", d11 = JSON.stringify(g3)));
              let k2 = yield this.fetch(j2.toString(), { method: f3 || "POST", headers: Object.assign(Object.assign(Object.assign({}, h2), this.headers), e3), body: d11 }).catch((a11) => {
                throw new bS(a11);
              }), l2 = k2.headers.get("x-relay-error");
              if (l2 && "true" === l2) throw new bT(k2);
              if (!k2.ok) throw new bU(k2);
              let m2 = (null != (c10 = k2.headers.get("Content-Type")) ? c10 : "text/plain").split(";")[0].trim();
              return { data: "application/json" === m2 ? yield k2.json() : "application/octet-stream" === m2 ? yield k2.blob() : "text/event-stream" === m2 ? k2 : "multipart/form-data" === m2 ? yield k2.formData() : yield k2.text(), error: null, response: k2 };
            } catch (a11) {
              return { data: null, error: a11, response: a11 instanceof bU || a11 instanceof bT ? a11.context : void 0 };
            }
          }, new (f2 || (f2 = Promise))(function(a11, b11) {
            function c11(a12) {
              try {
                i2(g2.next(a12));
              } catch (a13) {
                b11(a13);
              }
            }
            function h2(a12) {
              try {
                i2(g2.throw(a12));
              } catch (a13) {
                b11(a13);
              }
            }
            function i2(b12) {
              var d11;
              b12.done ? a11(b12.value) : ((d11 = b12.value) instanceof f2 ? d11 : new f2(function(a12) {
                a12(d11);
              })).then(c11, h2);
            }
            i2((g2 = g2.apply(d10, e2 || [])).next());
          });
        }
      }
      let { PostgrestClient: bW, PostgrestQueryBuilder: bX, PostgrestFilterBuilder: bY, PostgrestTransformBuilder: bZ, PostgrestBuilder: b$, PostgrestError: b_ } = c(116);
      class b0 {
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
              let b10 = parseInt(a11.node.replace(/^v/, "").split(".")[0]);
              return b10 >= 22 ? void 0 !== globalThis.WebSocket ? { type: "native", constructor: globalThis.WebSocket } : { type: "unsupported", error: `Node.js ${b10} detected but native WebSocket not found.`, workaround: "Provide a WebSocket implementation via the transport option." } : { type: "unsupported", error: `Node.js ${b10} detected without native WebSocket support.`, workaround: 'For Node.js < 22, install "ws" package and provide it via the transport option:\nimport ws from "ws"\nnew RealtimeClient(url, { transport: ws })' };
            }
          }
          return { type: "unsupported", error: "Unknown JavaScript runtime without WebSocket support.", workaround: "Ensure you're running in a supported environment (browser, Node.js, Deno) or provide a custom WebSocket implementation." };
        }
        static getWebSocketConstructor() {
          let a10 = this.detectEnvironment();
          if (a10.constructor) return a10.constructor;
          let b10 = a10.error || "WebSocket not supported in this environment.";
          throw a10.workaround && (b10 += `

Suggested solution: ${a10.workaround}`), Error(b10);
        }
        static createWebSocket(a10, b10) {
          return new (this.getWebSocketConstructor())(a10, b10);
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
      }(g || (g = {})), function(a10) {
        a10.closed = "closed", a10.errored = "errored", a10.joined = "joined", a10.joining = "joining", a10.leaving = "leaving";
      }(h || (h = {})), function(a10) {
        a10.close = "phx_close", a10.error = "phx_error", a10.join = "phx_join", a10.reply = "phx_reply", a10.leave = "phx_leave", a10.access_token = "access_token";
      }(i || (i = {})), (j || (j = {})).websocket = "websocket", function(a10) {
        a10.Connecting = "connecting", a10.Open = "open", a10.Closing = "closing", a10.Closed = "closed";
      }(k || (k = {}));
      class b1 {
        constructor() {
          this.HEADER_LENGTH = 1;
        }
        decode(a10, b10) {
          return a10.constructor === ArrayBuffer ? b10(this._binaryDecode(a10)) : "string" == typeof a10 ? b10(JSON.parse(a10)) : b10({});
        }
        _binaryDecode(a10) {
          let b10 = new DataView(a10), c10 = new TextDecoder();
          return this._decodeBroadcast(a10, b10, c10);
        }
        _decodeBroadcast(a10, b10, c10) {
          let d10 = b10.getUint8(1), e2 = b10.getUint8(2), f2 = this.HEADER_LENGTH + 2, g2 = c10.decode(a10.slice(f2, f2 + d10));
          f2 += d10;
          let h2 = c10.decode(a10.slice(f2, f2 + e2));
          return f2 += e2, { ref: null, topic: g2, event: h2, payload: JSON.parse(c10.decode(a10.slice(f2, a10.byteLength))) };
        }
      }
      class b2 {
        constructor(a10, b10) {
          this.callback = a10, this.timerCalc = b10, this.timer = void 0, this.tries = 0, this.callback = a10, this.timerCalc = b10;
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
      }(l || (l = {}));
      let b3 = (a10, b10, c10 = {}) => {
        var d10;
        let e2 = null != (d10 = c10.skipTypes) ? d10 : [];
        return Object.keys(b10).reduce((c11, d11) => (c11[d11] = b4(d11, a10, b10, e2), c11), {});
      }, b4 = (a10, b10, c10, d10) => {
        let e2 = b10.find((b11) => b11.name === a10), f2 = null == e2 ? void 0 : e2.type, g2 = c10[a10];
        return f2 && !d10.includes(f2) ? b5(f2, g2) : b6(g2);
      }, b5 = (a10, b10) => {
        if ("_" === a10.charAt(0)) return ca(b10, a10.slice(1, a10.length));
        switch (a10) {
          case l.bool:
            return b7(b10);
          case l.float4:
          case l.float8:
          case l.int2:
          case l.int4:
          case l.int8:
          case l.numeric:
          case l.oid:
            return b8(b10);
          case l.json:
          case l.jsonb:
            return b9(b10);
          case l.timestamp:
            return cb(b10);
          case l.abstime:
          case l.date:
          case l.daterange:
          case l.int4range:
          case l.int8range:
          case l.money:
          case l.reltime:
          case l.text:
          case l.time:
          case l.timestamptz:
          case l.timetz:
          case l.tsrange:
          case l.tstzrange:
          default:
            return b6(b10);
        }
      }, b6 = (a10) => a10, b7 = (a10) => {
        switch (a10) {
          case "t":
            return true;
          case "f":
            return false;
          default:
            return a10;
        }
      }, b8 = (a10) => {
        if ("string" == typeof a10) {
          let b10 = parseFloat(a10);
          if (!Number.isNaN(b10)) return b10;
        }
        return a10;
      }, b9 = (a10) => {
        if ("string" == typeof a10) try {
          return JSON.parse(a10);
        } catch (a11) {
          console.log(`JSON parse error: ${a11}`);
        }
        return a10;
      }, ca = (a10, b10) => {
        if ("string" != typeof a10) return a10;
        let c10 = a10.length - 1, d10 = a10[c10];
        if ("{" === a10[0] && "}" === d10) {
          let d11, e2 = a10.slice(1, c10);
          try {
            d11 = JSON.parse("[" + e2 + "]");
          } catch (a11) {
            d11 = e2 ? e2.split(",") : [];
          }
          return d11.map((a11) => b5(b10, a11));
        }
        return a10;
      }, cb = (a10) => "string" == typeof a10 ? a10.replace(" ", "T") : a10, cc = (a10) => {
        let b10 = a10;
        return (b10 = (b10 = b10.replace(/^ws/i, "http")).replace(/(\/socket\/websocket|\/socket|\/websocket)\/?$/i, "")).replace(/\/+$/, "") + "/api/broadcast";
      };
      class cd {
        constructor(a10, b10, c10 = {}, d10 = 1e4) {
          this.channel = a10, this.event = b10, this.payload = c10, this.timeout = d10, this.sent = false, this.timeoutTimer = void 0, this.ref = "", this.receivedResp = null, this.recHooks = [], this.refEvent = null;
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
        receive(a10, b10) {
          var c10;
          return this._hasReceived(a10) && b10(null == (c10 = this.receivedResp) ? void 0 : c10.response), this.recHooks.push({ status: a10, callback: b10 }), this;
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
        trigger(a10, b10) {
          this.refEvent && this.channel._trigger(this.refEvent, { status: a10, response: b10 });
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
        _matchReceive({ status: a10, response: b10 }) {
          this.recHooks.filter((b11) => b11.status === a10).forEach((a11) => a11.callback(b10));
        }
        _hasReceived(a10) {
          return this.receivedResp && this.receivedResp.status === a10;
        }
      }
      !function(a10) {
        a10.SYNC = "sync", a10.JOIN = "join", a10.LEAVE = "leave";
      }(m || (m = {}));
      class ce {
        constructor(a10, b10) {
          this.channel = a10, this.state = {}, this.pendingDiffs = [], this.joinRef = null, this.enabled = false, this.caller = { onJoin: () => {
          }, onLeave: () => {
          }, onSync: () => {
          } };
          let c10 = (null == b10 ? void 0 : b10.events) || { state: "presence_state", diff: "presence_diff" };
          this.channel._on(c10.state, {}, (a11) => {
            let { onJoin: b11, onLeave: c11, onSync: d10 } = this.caller;
            this.joinRef = this.channel._joinRef(), this.state = ce.syncState(this.state, a11, b11, c11), this.pendingDiffs.forEach((a12) => {
              this.state = ce.syncDiff(this.state, a12, b11, c11);
            }), this.pendingDiffs = [], d10();
          }), this.channel._on(c10.diff, {}, (a11) => {
            let { onJoin: b11, onLeave: c11, onSync: d10 } = this.caller;
            this.inPendingSyncState() ? this.pendingDiffs.push(a11) : (this.state = ce.syncDiff(this.state, a11, b11, c11), d10());
          }), this.onJoin((a11, b11, c11) => {
            this.channel._trigger("presence", { event: "join", key: a11, currentPresences: b11, newPresences: c11 });
          }), this.onLeave((a11, b11, c11) => {
            this.channel._trigger("presence", { event: "leave", key: a11, currentPresences: b11, leftPresences: c11 });
          }), this.onSync(() => {
            this.channel._trigger("presence", { event: "sync" });
          });
        }
        static syncState(a10, b10, c10, d10) {
          let e2 = this.cloneDeep(a10), f2 = this.transformState(b10), g2 = {}, h2 = {};
          return this.map(e2, (a11, b11) => {
            f2[a11] || (h2[a11] = b11);
          }), this.map(f2, (a11, b11) => {
            let c11 = e2[a11];
            if (c11) {
              let d11 = b11.map((a12) => a12.presence_ref), e3 = c11.map((a12) => a12.presence_ref), f3 = b11.filter((a12) => 0 > e3.indexOf(a12.presence_ref)), i2 = c11.filter((a12) => 0 > d11.indexOf(a12.presence_ref));
              f3.length > 0 && (g2[a11] = f3), i2.length > 0 && (h2[a11] = i2);
            } else g2[a11] = b11;
          }), this.syncDiff(e2, { joins: g2, leaves: h2 }, c10, d10);
        }
        static syncDiff(a10, b10, c10, d10) {
          let { joins: e2, leaves: f2 } = { joins: this.transformState(b10.joins), leaves: this.transformState(b10.leaves) };
          return c10 || (c10 = () => {
          }), d10 || (d10 = () => {
          }), this.map(e2, (b11, d11) => {
            var e3;
            let f3 = null != (e3 = a10[b11]) ? e3 : [];
            if (a10[b11] = this.cloneDeep(d11), f3.length > 0) {
              let c11 = a10[b11].map((a11) => a11.presence_ref), d12 = f3.filter((a11) => 0 > c11.indexOf(a11.presence_ref));
              a10[b11].unshift(...d12);
            }
            c10(b11, f3, d11);
          }), this.map(f2, (b11, c11) => {
            let e3 = a10[b11];
            if (!e3) return;
            let f3 = c11.map((a11) => a11.presence_ref);
            e3 = e3.filter((a11) => 0 > f3.indexOf(a11.presence_ref)), a10[b11] = e3, d10(b11, e3, c11), 0 === e3.length && delete a10[b11];
          }), a10;
        }
        static map(a10, b10) {
          return Object.getOwnPropertyNames(a10).map((c10) => b10(c10, a10[c10]));
        }
        static transformState(a10) {
          return Object.getOwnPropertyNames(a10 = this.cloneDeep(a10)).reduce((b10, c10) => {
            let d10 = a10[c10];
            return "metas" in d10 ? b10[c10] = d10.metas.map((a11) => (a11.presence_ref = a11.phx_ref, delete a11.phx_ref, delete a11.phx_ref_prev, a11)) : b10[c10] = d10, b10;
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
      }(n || (n = {})), function(a10) {
        a10.BROADCAST = "broadcast", a10.PRESENCE = "presence", a10.POSTGRES_CHANGES = "postgres_changes", a10.SYSTEM = "system";
      }(o || (o = {})), function(a10) {
        a10.SUBSCRIBED = "SUBSCRIBED", a10.TIMED_OUT = "TIMED_OUT", a10.CLOSED = "CLOSED", a10.CHANNEL_ERROR = "CHANNEL_ERROR";
      }(p || (p = {}));
      class cf {
        constructor(a10, b10 = { config: {} }, c10) {
          this.topic = a10, this.params = b10, this.socket = c10, this.bindings = {}, this.state = h.closed, this.joinedOnce = false, this.pushBuffer = [], this.subTopic = a10.replace(/^realtime:/i, ""), this.params.config = Object.assign({ broadcast: { ack: false, self: false }, presence: { key: "", enabled: false }, private: false }, b10.config), this.timeout = this.socket.timeout, this.joinPush = new cd(this, i.join, this.params, this.timeout), this.rejoinTimer = new b2(() => this._rejoinUntilConnected(), this.socket.reconnectAfterMs), this.joinPush.receive("ok", () => {
            this.state = h.joined, this.rejoinTimer.reset(), this.pushBuffer.forEach((a11) => a11.send()), this.pushBuffer = [];
          }), this._onClose(() => {
            this.rejoinTimer.reset(), this.socket.log("channel", `close ${this.topic} ${this._joinRef()}`), this.state = h.closed, this.socket._remove(this);
          }), this._onError((a11) => {
            this._isLeaving() || this._isClosed() || (this.socket.log("channel", `error ${this.topic}`, a11), this.state = h.errored, this.rejoinTimer.scheduleTimeout());
          }), this.joinPush.receive("timeout", () => {
            this._isJoining() && (this.socket.log("channel", `timeout ${this.topic}`, this.joinPush.timeout), this.state = h.errored, this.rejoinTimer.scheduleTimeout());
          }), this.joinPush.receive("error", (a11) => {
            this._isLeaving() || this._isClosed() || (this.socket.log("channel", `error ${this.topic}`, a11), this.state = h.errored, this.rejoinTimer.scheduleTimeout());
          }), this._on(i.reply, {}, (a11, b11) => {
            this._trigger(this._replyEventName(b11), a11);
          }), this.presence = new ce(this), this.broadcastEndpointURL = cc(this.socket.endPoint), this.private = this.params.config.private || false;
        }
        subscribe(a10, b10 = this.timeout) {
          var c10, d10, e2;
          if (this.socket.isConnected() || this.socket.connect(), this.state == h.closed) {
            let { config: { broadcast: f2, presence: g2, private: i2 } } = this.params, j2 = null != (d10 = null == (c10 = this.bindings.postgres_changes) ? void 0 : c10.map((a11) => a11.filter)) ? d10 : [], k2 = !!this.bindings[o.PRESENCE] && this.bindings[o.PRESENCE].length > 0 || (null == (e2 = this.params.config.presence) ? void 0 : e2.enabled) === true, l2 = {}, m2 = { broadcast: f2, presence: Object.assign(Object.assign({}, g2), { enabled: k2 }), postgres_changes: j2, private: i2 };
            this.socket.accessTokenValue && (l2.access_token = this.socket.accessTokenValue), this._onError((b11) => null == a10 ? void 0 : a10(p.CHANNEL_ERROR, b11)), this._onClose(() => null == a10 ? void 0 : a10(p.CLOSED)), this.updateJoinPayload(Object.assign({ config: m2 }, l2)), this.joinedOnce = true, this._rejoin(b10), this.joinPush.receive("ok", async ({ postgres_changes: b11 }) => {
              var c11;
              if (this.socket.setAuth(), void 0 === b11) {
                null == a10 || a10(p.SUBSCRIBED);
                return;
              }
              {
                let d11 = this.bindings.postgres_changes, e3 = null != (c11 = null == d11 ? void 0 : d11.length) ? c11 : 0, f3 = [];
                for (let c12 = 0; c12 < e3; c12++) {
                  let e4 = d11[c12], { filter: { event: g3, schema: i3, table: j3, filter: k3 } } = e4, l3 = b11 && b11[c12];
                  if (l3 && l3.event === g3 && l3.schema === i3 && l3.table === j3 && l3.filter === k3) f3.push(Object.assign(Object.assign({}, e4), { id: l3.id }));
                  else {
                    this.unsubscribe(), this.state = h.errored, null == a10 || a10(p.CHANNEL_ERROR, Error("mismatch between server and client bindings for postgres changes"));
                    return;
                  }
                }
                this.bindings.postgres_changes = f3, a10 && a10(p.SUBSCRIBED);
                return;
              }
            }).receive("error", (b11) => {
              this.state = h.errored, null == a10 || a10(p.CHANNEL_ERROR, Error(JSON.stringify(Object.values(b11).join(", ") || "error")));
            }).receive("timeout", () => {
              null == a10 || a10(p.TIMED_OUT);
            });
          }
          return this;
        }
        presenceState() {
          return this.presence.state;
        }
        async track(a10, b10 = {}) {
          return await this.send({ type: "presence", event: "track", payload: a10 }, b10.timeout || this.timeout);
        }
        async untrack(a10 = {}) {
          return await this.send({ type: "presence", event: "untrack" }, a10);
        }
        on(a10, b10, c10) {
          return this.state === h.joined && a10 === o.PRESENCE && (this.socket.log("channel", `resubscribe to ${this.topic} due to change in presence callbacks on joined channel`), this.unsubscribe().then(() => this.subscribe())), this._on(a10, b10, c10);
        }
        async send(a10, b10 = {}) {
          var c10, d10;
          if (this._canPush() || "broadcast" !== a10.type) return new Promise((c11) => {
            var d11, e2, f2;
            let g2 = this._push(a10.type, a10, b10.timeout || this.timeout);
            "broadcast" !== a10.type || (null == (f2 = null == (e2 = null == (d11 = this.params) ? void 0 : d11.config) ? void 0 : e2.broadcast) ? void 0 : f2.ack) || c11("ok"), g2.receive("ok", () => c11("ok")), g2.receive("error", () => c11("error")), g2.receive("timeout", () => c11("timed out"));
          });
          {
            let { event: e2, payload: f2 } = a10, g2 = { method: "POST", headers: { Authorization: this.socket.accessTokenValue ? `Bearer ${this.socket.accessTokenValue}` : "", apikey: this.socket.apiKey ? this.socket.apiKey : "", "Content-Type": "application/json" }, body: JSON.stringify({ messages: [{ topic: this.subTopic, event: e2, payload: f2, private: this.private }] }) };
            try {
              let a11 = await this._fetchWithTimeout(this.broadcastEndpointURL, g2, null != (c10 = b10.timeout) ? c10 : this.timeout);
              return await (null == (d10 = a11.body) ? void 0 : d10.cancel()), a11.ok ? "ok" : "error";
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
          this.state = h.leaving;
          let b10 = () => {
            this.socket.log("channel", `leave ${this.topic}`), this._trigger(i.close, "leave", this._joinRef());
          };
          this.joinPush.destroy();
          let c10 = null;
          return new Promise((d10) => {
            (c10 = new cd(this, i.leave, {}, a10)).receive("ok", () => {
              b10(), d10("ok");
            }).receive("timeout", () => {
              b10(), d10("timed out");
            }).receive("error", () => {
              d10("error");
            }), c10.send(), this._canPush() || c10.trigger("ok", {});
          }).finally(() => {
            null == c10 || c10.destroy();
          });
        }
        teardown() {
          this.pushBuffer.forEach((a10) => a10.destroy()), this.pushBuffer = [], this.rejoinTimer.reset(), this.joinPush.destroy(), this.state = h.closed, this.bindings = {};
        }
        async _fetchWithTimeout(a10, b10, c10) {
          let d10 = new AbortController(), e2 = setTimeout(() => d10.abort(), c10), f2 = await this.socket.fetch(a10, Object.assign(Object.assign({}, b10), { signal: d10.signal }));
          return clearTimeout(e2), f2;
        }
        _push(a10, b10, c10 = this.timeout) {
          if (!this.joinedOnce) throw `tried to push '${a10}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
          let d10 = new cd(this, a10, b10, c10);
          return this._canPush() ? d10.send() : this._addToPushBuffer(d10), d10;
        }
        _addToPushBuffer(a10) {
          if (a10.startTimeout(), this.pushBuffer.push(a10), this.pushBuffer.length > 100) {
            let a11 = this.pushBuffer.shift();
            a11 && (a11.destroy(), this.socket.log("channel", `discarded push due to buffer overflow: ${a11.event}`, a11.payload));
          }
        }
        _onMessage(a10, b10, c10) {
          return b10;
        }
        _isMember(a10) {
          return this.topic === a10;
        }
        _joinRef() {
          return this.joinPush.ref;
        }
        _trigger(a10, b10, c10) {
          var d10, e2;
          let f2 = a10.toLocaleLowerCase(), { close: g2, error: h2, leave: j2, join: k2 } = i;
          if (c10 && [g2, h2, j2, k2].indexOf(f2) >= 0 && c10 !== this._joinRef()) return;
          let l2 = this._onMessage(f2, b10, c10);
          if (b10 && !l2) throw "channel onMessage callbacks must return the payload, modified or unmodified";
          ["insert", "update", "delete"].includes(f2) ? null == (d10 = this.bindings.postgres_changes) || d10.filter((a11) => {
            var b11, c11, d11;
            return (null == (b11 = a11.filter) ? void 0 : b11.event) === "*" || (null == (d11 = null == (c11 = a11.filter) ? void 0 : c11.event) ? void 0 : d11.toLocaleLowerCase()) === f2;
          }).map((a11) => a11.callback(l2, c10)) : null == (e2 = this.bindings[f2]) || e2.filter((a11) => {
            var c11, d11, e3, g3, h3, i2;
            if (!["broadcast", "presence", "postgres_changes"].includes(f2)) return a11.type.toLocaleLowerCase() === f2;
            if ("id" in a11) {
              let f3 = a11.id, g4 = null == (c11 = a11.filter) ? void 0 : c11.event;
              return f3 && (null == (d11 = b10.ids) ? void 0 : d11.includes(f3)) && ("*" === g4 || (null == g4 ? void 0 : g4.toLocaleLowerCase()) === (null == (e3 = b10.data) ? void 0 : e3.type.toLocaleLowerCase()));
            }
            {
              let c12 = null == (h3 = null == (g3 = null == a11 ? void 0 : a11.filter) ? void 0 : g3.event) ? void 0 : h3.toLocaleLowerCase();
              return "*" === c12 || c12 === (null == (i2 = null == b10 ? void 0 : b10.event) ? void 0 : i2.toLocaleLowerCase());
            }
          }).map((a11) => {
            if ("object" == typeof l2 && "ids" in l2) {
              let a12 = l2.data, { schema: b11, table: c11, commit_timestamp: d11, type: e3, errors: f3 } = a12;
              l2 = Object.assign(Object.assign({}, { schema: b11, table: c11, commit_timestamp: d11, eventType: e3, new: {}, old: {}, errors: f3 }), this._getPayloadRecords(a12));
            }
            a11.callback(l2, c10);
          });
        }
        _isClosed() {
          return this.state === h.closed;
        }
        _isJoined() {
          return this.state === h.joined;
        }
        _isJoining() {
          return this.state === h.joining;
        }
        _isLeaving() {
          return this.state === h.leaving;
        }
        _replyEventName(a10) {
          return `chan_reply_${a10}`;
        }
        _on(a10, b10, c10) {
          let d10 = a10.toLocaleLowerCase(), e2 = { type: d10, filter: b10, callback: c10 };
          return this.bindings[d10] ? this.bindings[d10].push(e2) : this.bindings[d10] = [e2], this;
        }
        _off(a10, b10) {
          let c10 = a10.toLocaleLowerCase();
          return this.bindings[c10] && (this.bindings[c10] = this.bindings[c10].filter((a11) => {
            var d10;
            return !((null == (d10 = a11.type) ? void 0 : d10.toLocaleLowerCase()) === c10 && cf.isEqual(a11.filter, b10));
          })), this;
        }
        static isEqual(a10, b10) {
          if (Object.keys(a10).length !== Object.keys(b10).length) return false;
          for (let c10 in a10) if (a10[c10] !== b10[c10]) return false;
          return true;
        }
        _rejoinUntilConnected() {
          this.rejoinTimer.scheduleTimeout(), this.socket.isConnected() && this._rejoin();
        }
        _onClose(a10) {
          this._on(i.close, {}, a10);
        }
        _onError(a10) {
          this._on(i.error, {}, (b10) => a10(b10));
        }
        _canPush() {
          return this.socket.isConnected() && this._isJoined();
        }
        _rejoin(a10 = this.timeout) {
          this._isLeaving() || (this.socket._leaveOpenTopic(this.topic), this.state = h.joining, this.joinPush.resend(a10));
        }
        _getPayloadRecords(a10) {
          let b10 = { new: {}, old: {} };
          return ("INSERT" === a10.type || "UPDATE" === a10.type) && (b10.new = b3(a10.columns, a10.record)), ("UPDATE" === a10.type || "DELETE" === a10.type) && (b10.old = b3(a10.columns, a10.old_record)), b10;
        }
      }
      let cg = () => {
      }, ch = { HEARTBEAT_INTERVAL: 25e3, RECONNECT_DELAY: 10, HEARTBEAT_TIMEOUT_FALLBACK: 100 }, ci = [1e3, 2e3, 5e3, 1e4], cj = `
  addEventListener("message", (e) => {
    if (e.data.event === "start") {
      setInterval(() => postMessage({ event: "keepAlive" }), e.data.interval);
    }
  });`;
      class ck {
        constructor(a10, b10) {
          var d10;
          if (this.accessTokenValue = null, this.apiKey = null, this.channels = [], this.endPoint = "", this.httpEndpoint = "", this.headers = {}, this.params = {}, this.timeout = 1e4, this.transport = null, this.heartbeatIntervalMs = ch.HEARTBEAT_INTERVAL, this.heartbeatTimer = void 0, this.pendingHeartbeatRef = null, this.heartbeatCallback = cg, this.ref = 0, this.reconnectTimer = null, this.logger = cg, this.conn = null, this.sendBuffer = [], this.serializer = new b1(), this.stateChangeCallbacks = { open: [], close: [], error: [], message: [] }, this.accessToken = null, this._connectionState = "disconnected", this._wasManualDisconnect = false, this._authPromise = null, this._resolveFetch = (a11) => {
            let b11;
            return b11 = a11 || ("undefined" == typeof fetch ? (...a12) => Promise.resolve().then(c.bind(c, 506)).then(({ default: b12 }) => b12(...a12)).catch((a13) => {
              throw Error(`Failed to load @supabase/node-fetch: ${a13.message}. This is required for HTTP requests in Node.js environments without native fetch.`);
            }) : fetch), (...a12) => b11(...a12);
          }, !(null == (d10 = null == b10 ? void 0 : b10.params) ? void 0 : d10.apikey)) throw Error("API key is required to connect to Realtime");
          this.apiKey = b10.params.apikey, this.endPoint = `${a10}/${j.websocket}`, this.httpEndpoint = cc(a10), this._initializeOptions(b10), this._setupReconnectionTimer(), this.fetch = this._resolveFetch(null == b10 ? void 0 : b10.fetch);
        }
        connect() {
          if (!(this.isConnecting() || this.isDisconnecting() || null !== this.conn && this.isConnected())) {
            if (this._setConnectionState("connecting"), this._setAuthSafely("connect"), this.transport) this.conn = new this.transport(this.endpointURL());
            else try {
              this.conn = b0.createWebSocket(this.endpointURL());
            } catch (b10) {
              this._setConnectionState("disconnected");
              let a10 = b10.message;
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
        disconnect(a10, b10) {
          if (!this.isDisconnecting()) if (this._setConnectionState("disconnecting", true), this.conn) {
            let c10 = setTimeout(() => {
              this._setConnectionState("disconnected");
            }, 100);
            this.conn.onclose = () => {
              clearTimeout(c10), this._setConnectionState("disconnected");
            }, a10 ? this.conn.close(a10, null != b10 ? b10 : "") : this.conn.close(), this._teardownConnection();
          } else this._setConnectionState("disconnected");
        }
        getChannels() {
          return this.channels;
        }
        async removeChannel(a10) {
          let b10 = await a10.unsubscribe();
          return 0 === this.channels.length && this.disconnect(), b10;
        }
        async removeAllChannels() {
          let a10 = await Promise.all(this.channels.map((a11) => a11.unsubscribe()));
          return this.channels = [], this.disconnect(), a10;
        }
        log(a10, b10, c10) {
          this.logger(a10, b10, c10);
        }
        connectionState() {
          switch (this.conn && this.conn.readyState) {
            case g.connecting:
              return k.Connecting;
            case g.open:
              return k.Open;
            case g.closing:
              return k.Closing;
            default:
              return k.Closed;
          }
        }
        isConnected() {
          return this.connectionState() === k.Open;
        }
        isConnecting() {
          return "connecting" === this._connectionState;
        }
        isDisconnecting() {
          return "disconnecting" === this._connectionState;
        }
        channel(a10, b10 = { config: {} }) {
          let c10 = `realtime:${a10}`, d10 = this.getChannels().find((a11) => a11.topic === c10);
          if (d10) return d10;
          {
            let c11 = new cf(`realtime:${a10}`, b10, this);
            return this.channels.push(c11), c11;
          }
        }
        push(a10) {
          let { topic: b10, event: c10, payload: d10, ref: e2 } = a10, f2 = () => {
            this.encode(a10, (a11) => {
              var b11;
              null == (b11 = this.conn) || b11.send(a11);
            });
          };
          this.log("push", `${b10} ${c10} (${e2})`, d10), this.isConnected() ? f2() : this.sendBuffer.push(f2);
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
            }, ch.HEARTBEAT_TIMEOUT_FALLBACK);
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
          let b10 = this.channels.find((b11) => b11.topic === a10 && (b11._isJoined() || b11._isJoining()));
          b10 && (this.log("transport", `leaving duplicate topic "${a10}"`), b10.unsubscribe());
        }
        _remove(a10) {
          this.channels = this.channels.filter((b10) => b10.topic !== a10.topic);
        }
        _onConnMessage(a10) {
          this.decode(a10.data, (a11) => {
            if ("phoenix" === a11.topic && "phx_reply" === a11.event) try {
              this.heartbeatCallback("ok" === a11.payload.status ? "ok" : "error");
            } catch (a12) {
              this.log("error", "error in heartbeat callback", a12);
            }
            a11.ref && a11.ref === this.pendingHeartbeatRef && (this.pendingHeartbeatRef = null);
            let { topic: b10, event: c10, payload: d10, ref: e2 } = a11, f2 = e2 ? `(${e2})` : "", g2 = d10.status || "";
            this.log("receive", `${g2} ${b10} ${c10} ${f2}`.trim(), d10), this.channels.filter((a12) => a12._isMember(b10)).forEach((a12) => a12._trigger(c10, d10, e2)), this._triggerStateCallbacks("message", a11);
          });
        }
        _clearTimer(a10) {
          var b10;
          "heartbeat" === a10 && this.heartbeatTimer ? (clearInterval(this.heartbeatTimer), this.heartbeatTimer = void 0) : "reconnect" === a10 && (null == (b10 = this.reconnectTimer) || b10.reset());
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
          var b10;
          this._setConnectionState("disconnected"), this.log("transport", "close", a10), this._triggerChanError(), this._clearTimer("heartbeat"), this._wasManualDisconnect || null == (b10 = this.reconnectTimer) || b10.scheduleTimeout(), this._triggerStateCallbacks("close", a10);
        }
        _onConnError(a10) {
          this._setConnectionState("disconnected"), this.log("transport", `${a10}`), this._triggerChanError(), this._triggerStateCallbacks("error", a10);
        }
        _triggerChanError() {
          this.channels.forEach((a10) => a10._trigger(i.error));
        }
        _appendParams(a10, b10) {
          if (0 === Object.keys(b10).length) return a10;
          let c10 = a10.match(/\?/) ? "&" : "?", d10 = new URLSearchParams(b10);
          return `${a10}${c10}${d10}`;
        }
        _workerObjectUrl(a10) {
          let b10;
          if (a10) b10 = a10;
          else {
            let a11 = new Blob([cj], { type: "application/javascript" });
            b10 = URL.createObjectURL(a11);
          }
          return b10;
        }
        _setConnectionState(a10, b10 = false) {
          this._connectionState = a10, "connecting" === a10 ? this._wasManualDisconnect = false : "disconnecting" === a10 && (this._wasManualDisconnect = b10);
        }
        async _performAuth(a10 = null) {
          let b10;
          b10 = a10 || (this.accessToken ? await this.accessToken() : this.accessTokenValue), this.accessTokenValue != b10 && (this.accessTokenValue = b10, this.channels.forEach((a11) => {
            b10 && a11.updateJoinPayload({ access_token: b10, version: "realtime-js/2.15.5" }), a11.joinedOnce && a11._isJoined() && a11._push(i.access_token, { access_token: b10 });
          }));
        }
        async _waitForAuthIfNeeded() {
          this._authPromise && await this._authPromise;
        }
        _setAuthSafely(a10 = "general") {
          this.setAuth().catch((b10) => {
            this.log("error", `error setting auth in ${a10}`, b10);
          });
        }
        _triggerStateCallbacks(a10, b10) {
          try {
            this.stateChangeCallbacks[a10].forEach((c10) => {
              try {
                c10(b10);
              } catch (b11) {
                this.log("error", `error in ${a10} callback`, b11);
              }
            });
          } catch (b11) {
            this.log("error", `error triggering ${a10} callbacks`, b11);
          }
        }
        _setupReconnectionTimer() {
          this.reconnectTimer = new b2(async () => {
            setTimeout(async () => {
              await this._waitForAuthIfNeeded(), this.isConnected() || this.connect();
            }, ch.RECONNECT_DELAY);
          }, this.reconnectAfterMs);
        }
        _initializeOptions(a10) {
          var b10, c10, d10, e2, f2, g2, h2, i2, j2;
          if (this.transport = null != (b10 = null == a10 ? void 0 : a10.transport) ? b10 : null, this.timeout = null != (c10 = null == a10 ? void 0 : a10.timeout) ? c10 : 1e4, this.heartbeatIntervalMs = null != (d10 = null == a10 ? void 0 : a10.heartbeatIntervalMs) ? d10 : ch.HEARTBEAT_INTERVAL, this.worker = null != (e2 = null == a10 ? void 0 : a10.worker) && e2, this.accessToken = null != (f2 = null == a10 ? void 0 : a10.accessToken) ? f2 : null, this.heartbeatCallback = null != (g2 = null == a10 ? void 0 : a10.heartbeatCallback) ? g2 : cg, (null == a10 ? void 0 : a10.params) && (this.params = a10.params), (null == a10 ? void 0 : a10.logger) && (this.logger = a10.logger), ((null == a10 ? void 0 : a10.logLevel) || (null == a10 ? void 0 : a10.log_level)) && (this.logLevel = a10.logLevel || a10.log_level, this.params = Object.assign(Object.assign({}, this.params), { log_level: this.logLevel })), this.reconnectAfterMs = null != (h2 = null == a10 ? void 0 : a10.reconnectAfterMs) ? h2 : (a11) => ci[a11 - 1] || 1e4, this.encode = null != (i2 = null == a10 ? void 0 : a10.encode) ? i2 : (a11, b11) => b11(JSON.stringify(a11)), this.decode = null != (j2 = null == a10 ? void 0 : a10.decode) ? j2 : this.serializer.decode.bind(this.serializer), this.worker) {
            if ("undefined" != typeof window && !window.Worker) throw Error("Web Worker is not supported");
            this.workerUrl = null == a10 ? void 0 : a10.workerUrl;
          }
        }
      }
      class cl extends Error {
        constructor(a10) {
          super(a10), this.__isStorageError = true, this.name = "StorageError";
        }
      }
      function cm(a10) {
        return "object" == typeof a10 && null !== a10 && "__isStorageError" in a10;
      }
      class cn extends cl {
        constructor(a10, b10, c10) {
          super(a10), this.name = "StorageApiError", this.status = b10, this.statusCode = c10;
        }
        toJSON() {
          return { name: this.name, message: this.message, status: this.status, statusCode: this.statusCode };
        }
      }
      class co extends cl {
        constructor(a10, b10) {
          super(a10), this.name = "StorageUnknownError", this.originalError = b10;
        }
      }
      let cp = (a10) => {
        let b10;
        return b10 = a10 || ("undefined" == typeof fetch ? (...a11) => Promise.resolve().then(c.bind(c, 506)).then(({ default: b11 }) => b11(...a11)) : fetch), (...a11) => b10(...a11);
      }, cq = (a10) => {
        if (Array.isArray(a10)) return a10.map((a11) => cq(a11));
        if ("function" == typeof a10 || a10 !== Object(a10)) return a10;
        let b10 = {};
        return Object.entries(a10).forEach(([a11, c10]) => {
          b10[a11.replace(/([-_][a-z])/gi, (a12) => a12.toUpperCase().replace(/[-_]/g, ""))] = cq(c10);
        }), b10;
      };
      var cr = function(a10, b10, c10, d10) {
        return new (c10 || (c10 = Promise))(function(e2, f2) {
          function g2(a11) {
            try {
              i2(d10.next(a11));
            } catch (a12) {
              f2(a12);
            }
          }
          function h2(a11) {
            try {
              i2(d10.throw(a11));
            } catch (a12) {
              f2(a12);
            }
          }
          function i2(a11) {
            var b11;
            a11.done ? e2(a11.value) : ((b11 = a11.value) instanceof c10 ? b11 : new c10(function(a12) {
              a12(b11);
            })).then(g2, h2);
          }
          i2((d10 = d10.apply(a10, b10 || [])).next());
        });
      };
      let cs = (a10) => a10.msg || a10.message || a10.error_description || a10.error || JSON.stringify(a10);
      function ct(a10, b10, d10, e2, f2, g2) {
        return cr(this, void 0, void 0, function* () {
          return new Promise((h2, i2) => {
            a10(d10, ((a11, b11, c10, d11) => {
              let e3 = { method: a11, headers: (null == b11 ? void 0 : b11.headers) || {} };
              return "GET" !== a11 && d11 ? (((a12) => {
                if ("object" != typeof a12 || null === a12) return false;
                let b12 = Object.getPrototypeOf(a12);
                return (null === b12 || b12 === Object.prototype || null === Object.getPrototypeOf(b12)) && !(Symbol.toStringTag in a12) && !(Symbol.iterator in a12);
              })(d11) ? (e3.headers = Object.assign({ "Content-Type": "application/json" }, null == b11 ? void 0 : b11.headers), e3.body = JSON.stringify(d11)) : e3.body = d11, (null == b11 ? void 0 : b11.duplex) && (e3.duplex = b11.duplex), Object.assign(Object.assign({}, e3), c10)) : e3;
            })(b10, e2, f2, g2)).then((a11) => {
              if (!a11.ok) throw a11;
              return (null == e2 ? void 0 : e2.noResolveJson) ? a11 : a11.json();
            }).then((a11) => h2(a11)).catch((a11) => cr(void 0, void 0, void 0, function* () {
              var b11, d11, f3, g3;
              let h3 = yield (b11 = void 0, d11 = void 0, f3 = void 0, g3 = function* () {
                return "undefined" == typeof Response ? (yield Promise.resolve().then(c.bind(c, 506))).Response : Response;
              }, new (f3 || (f3 = Promise))(function(a12, c10) {
                function e3(a13) {
                  try {
                    i3(g3.next(a13));
                  } catch (a14) {
                    c10(a14);
                  }
                }
                function h4(a13) {
                  try {
                    i3(g3.throw(a13));
                  } catch (a14) {
                    c10(a14);
                  }
                }
                function i3(b12) {
                  var c11;
                  b12.done ? a12(b12.value) : ((c11 = b12.value) instanceof f3 ? c11 : new f3(function(a13) {
                    a13(c11);
                  })).then(e3, h4);
                }
                i3((g3 = g3.apply(b11, d11 || [])).next());
              }));
              a11 instanceof h3 && !(null == e2 ? void 0 : e2.noResolveJson) ? a11.json().then((b12) => {
                let c10 = a11.status || 500, d12 = (null == b12 ? void 0 : b12.statusCode) || c10 + "";
                i2(new cn(cs(b12), c10, d12));
              }).catch((a12) => {
                i2(new co(cs(a12), a12));
              }) : i2(new co(cs(a11), a11));
            }));
          });
        });
      }
      function cu(a10, b10, c10, d10) {
        return cr(this, void 0, void 0, function* () {
          return ct(a10, "GET", b10, c10, d10);
        });
      }
      function cv(a10, b10, c10, d10, e2) {
        return cr(this, void 0, void 0, function* () {
          return ct(a10, "POST", b10, d10, e2, c10);
        });
      }
      function cw(a10, b10, c10, d10, e2) {
        return cr(this, void 0, void 0, function* () {
          return ct(a10, "PUT", b10, d10, e2, c10);
        });
      }
      function cx(a10, b10, c10, d10, e2) {
        return cr(this, void 0, void 0, function* () {
          return ct(a10, "DELETE", b10, d10, e2, c10);
        });
      }
      var cy = c(356).Buffer, cz = function(a10, b10, c10, d10) {
        return new (c10 || (c10 = Promise))(function(e2, f2) {
          function g2(a11) {
            try {
              i2(d10.next(a11));
            } catch (a12) {
              f2(a12);
            }
          }
          function h2(a11) {
            try {
              i2(d10.throw(a11));
            } catch (a12) {
              f2(a12);
            }
          }
          function i2(a11) {
            var b11;
            a11.done ? e2(a11.value) : ((b11 = a11.value) instanceof c10 ? b11 : new c10(function(a12) {
              a12(b11);
            })).then(g2, h2);
          }
          i2((d10 = d10.apply(a10, b10 || [])).next());
        });
      };
      let cA = { limit: 100, offset: 0, sortBy: { column: "name", order: "asc" } }, cB = { cacheControl: "3600", contentType: "text/plain;charset=UTF-8", upsert: false };
      class cC {
        constructor(a10, b10 = {}, c10, d10) {
          this.shouldThrowOnError = false, this.url = a10, this.headers = b10, this.bucketId = c10, this.fetch = cp(d10);
        }
        throwOnError() {
          return this.shouldThrowOnError = true, this;
        }
        uploadOrUpdate(a10, b10, c10, d10) {
          return cz(this, void 0, void 0, function* () {
            try {
              let e2, f2 = Object.assign(Object.assign({}, cB), d10), g2 = Object.assign(Object.assign({}, this.headers), "POST" === a10 && { "x-upsert": String(f2.upsert) }), h2 = f2.metadata;
              "undefined" != typeof Blob && c10 instanceof Blob ? ((e2 = new FormData()).append("cacheControl", f2.cacheControl), h2 && e2.append("metadata", this.encodeMetadata(h2)), e2.append("", c10)) : "undefined" != typeof FormData && c10 instanceof FormData ? ((e2 = c10).append("cacheControl", f2.cacheControl), h2 && e2.append("metadata", this.encodeMetadata(h2))) : (e2 = c10, g2["cache-control"] = `max-age=${f2.cacheControl}`, g2["content-type"] = f2.contentType, h2 && (g2["x-metadata"] = this.toBase64(this.encodeMetadata(h2)))), (null == d10 ? void 0 : d10.headers) && (g2 = Object.assign(Object.assign({}, g2), d10.headers));
              let i2 = this._removeEmptyFolders(b10), j2 = this._getFinalPath(i2), k2 = yield ("PUT" == a10 ? cw : cv)(this.fetch, `${this.url}/object/${j2}`, e2, Object.assign({ headers: g2 }, (null == f2 ? void 0 : f2.duplex) ? { duplex: f2.duplex } : {}));
              return { data: { path: i2, id: k2.Id, fullPath: k2.Key }, error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (cm(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        upload(a10, b10, c10) {
          return cz(this, void 0, void 0, function* () {
            return this.uploadOrUpdate("POST", a10, b10, c10);
          });
        }
        uploadToSignedUrl(a10, b10, c10, d10) {
          return cz(this, void 0, void 0, function* () {
            let e2 = this._removeEmptyFolders(a10), f2 = this._getFinalPath(e2), g2 = new URL(this.url + `/object/upload/sign/${f2}`);
            g2.searchParams.set("token", b10);
            try {
              let a11, b11 = Object.assign({ upsert: cB.upsert }, d10), f3 = Object.assign(Object.assign({}, this.headers), { "x-upsert": String(b11.upsert) });
              "undefined" != typeof Blob && c10 instanceof Blob ? ((a11 = new FormData()).append("cacheControl", b11.cacheControl), a11.append("", c10)) : "undefined" != typeof FormData && c10 instanceof FormData ? (a11 = c10).append("cacheControl", b11.cacheControl) : (a11 = c10, f3["cache-control"] = `max-age=${b11.cacheControl}`, f3["content-type"] = b11.contentType);
              let h2 = yield cw(this.fetch, g2.toString(), a11, { headers: f3 });
              return { data: { path: e2, fullPath: h2.Key }, error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (cm(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        createSignedUploadUrl(a10, b10) {
          return cz(this, void 0, void 0, function* () {
            try {
              let c10 = this._getFinalPath(a10), d10 = Object.assign({}, this.headers);
              (null == b10 ? void 0 : b10.upsert) && (d10["x-upsert"] = "true");
              let e2 = yield cv(this.fetch, `${this.url}/object/upload/sign/${c10}`, {}, { headers: d10 }), f2 = new URL(this.url + e2.url), g2 = f2.searchParams.get("token");
              if (!g2) throw new cl("No token returned by API");
              return { data: { signedUrl: f2.toString(), path: a10, token: g2 }, error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (cm(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        update(a10, b10, c10) {
          return cz(this, void 0, void 0, function* () {
            return this.uploadOrUpdate("PUT", a10, b10, c10);
          });
        }
        move(a10, b10, c10) {
          return cz(this, void 0, void 0, function* () {
            try {
              return { data: yield cv(this.fetch, `${this.url}/object/move`, { bucketId: this.bucketId, sourceKey: a10, destinationKey: b10, destinationBucket: null == c10 ? void 0 : c10.destinationBucket }, { headers: this.headers }), error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (cm(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        copy(a10, b10, c10) {
          return cz(this, void 0, void 0, function* () {
            try {
              return { data: { path: (yield cv(this.fetch, `${this.url}/object/copy`, { bucketId: this.bucketId, sourceKey: a10, destinationKey: b10, destinationBucket: null == c10 ? void 0 : c10.destinationBucket }, { headers: this.headers })).Key }, error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (cm(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        createSignedUrl(a10, b10, c10) {
          return cz(this, void 0, void 0, function* () {
            try {
              let d10 = this._getFinalPath(a10), e2 = yield cv(this.fetch, `${this.url}/object/sign/${d10}`, Object.assign({ expiresIn: b10 }, (null == c10 ? void 0 : c10.transform) ? { transform: c10.transform } : {}), { headers: this.headers }), f2 = (null == c10 ? void 0 : c10.download) ? `&download=${true === c10.download ? "" : c10.download}` : "";
              return { data: e2 = { signedUrl: encodeURI(`${this.url}${e2.signedURL}${f2}`) }, error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (cm(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        createSignedUrls(a10, b10, c10) {
          return cz(this, void 0, void 0, function* () {
            try {
              let d10 = yield cv(this.fetch, `${this.url}/object/sign/${this.bucketId}`, { expiresIn: b10, paths: a10 }, { headers: this.headers }), e2 = (null == c10 ? void 0 : c10.download) ? `&download=${true === c10.download ? "" : c10.download}` : "";
              return { data: d10.map((a11) => Object.assign(Object.assign({}, a11), { signedUrl: a11.signedURL ? encodeURI(`${this.url}${a11.signedURL}${e2}`) : null })), error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (cm(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        download(a10, b10) {
          return cz(this, void 0, void 0, function* () {
            let c10 = void 0 !== (null == b10 ? void 0 : b10.transform), d10 = this.transformOptsToQueryString((null == b10 ? void 0 : b10.transform) || {}), e2 = d10 ? `?${d10}` : "";
            try {
              let b11 = this._getFinalPath(a10), d11 = yield cu(this.fetch, `${this.url}/${c10 ? "render/image/authenticated" : "object"}/${b11}${e2}`, { headers: this.headers, noResolveJson: true });
              return { data: yield d11.blob(), error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (cm(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        info(a10) {
          return cz(this, void 0, void 0, function* () {
            let b10 = this._getFinalPath(a10);
            try {
              let a11 = yield cu(this.fetch, `${this.url}/object/info/${b10}`, { headers: this.headers });
              return { data: cq(a11), error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (cm(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        exists(a10) {
          return cz(this, void 0, void 0, function* () {
            let b10 = this._getFinalPath(a10);
            try {
              return yield function(a11, b11, c10, d10) {
                return cr(this, void 0, void 0, function* () {
                  return ct(a11, "HEAD", b11, Object.assign(Object.assign({}, c10), { noResolveJson: true }), void 0);
                });
              }(this.fetch, `${this.url}/object/${b10}`, { headers: this.headers }), { data: true, error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (cm(a11) && a11 instanceof co) {
                let b11 = a11.originalError;
                if ([400, 404].includes(null == b11 ? void 0 : b11.status)) return { data: false, error: a11 };
              }
              throw a11;
            }
          });
        }
        getPublicUrl(a10, b10) {
          let c10 = this._getFinalPath(a10), d10 = [], e2 = (null == b10 ? void 0 : b10.download) ? `download=${true === b10.download ? "" : b10.download}` : "";
          "" !== e2 && d10.push(e2);
          let f2 = void 0 !== (null == b10 ? void 0 : b10.transform), g2 = this.transformOptsToQueryString((null == b10 ? void 0 : b10.transform) || {});
          "" !== g2 && d10.push(g2);
          let h2 = d10.join("&");
          return "" !== h2 && (h2 = `?${h2}`), { data: { publicUrl: encodeURI(`${this.url}/${f2 ? "render/image" : "object"}/public/${c10}${h2}`) } };
        }
        remove(a10) {
          return cz(this, void 0, void 0, function* () {
            try {
              return { data: yield cx(this.fetch, `${this.url}/object/${this.bucketId}`, { prefixes: a10 }, { headers: this.headers }), error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (cm(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        list(a10, b10, c10) {
          return cz(this, void 0, void 0, function* () {
            try {
              let d10 = Object.assign(Object.assign(Object.assign({}, cA), b10), { prefix: a10 || "" });
              return { data: yield cv(this.fetch, `${this.url}/object/list/${this.bucketId}`, d10, { headers: this.headers }, c10), error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (cm(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        listV2(a10, b10) {
          return cz(this, void 0, void 0, function* () {
            try {
              let c10 = Object.assign({}, a10);
              return { data: yield cv(this.fetch, `${this.url}/object/list-v2/${this.bucketId}`, c10, { headers: this.headers }, b10), error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (cm(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        encodeMetadata(a10) {
          return JSON.stringify(a10);
        }
        toBase64(a10) {
          return void 0 !== cy ? cy.from(a10).toString("base64") : btoa(a10);
        }
        _getFinalPath(a10) {
          return `${this.bucketId}/${a10.replace(/^\/+/, "")}`;
        }
        _removeEmptyFolders(a10) {
          return a10.replace(/^\/|\/$/g, "").replace(/\/+/g, "/");
        }
        transformOptsToQueryString(a10) {
          let b10 = [];
          return a10.width && b10.push(`width=${a10.width}`), a10.height && b10.push(`height=${a10.height}`), a10.resize && b10.push(`resize=${a10.resize}`), a10.format && b10.push(`format=${a10.format}`), a10.quality && b10.push(`quality=${a10.quality}`), b10.join("&");
        }
      }
      let cD = { "X-Client-Info": "storage-js/2.12.1" };
      var cE = function(a10, b10, c10, d10) {
        return new (c10 || (c10 = Promise))(function(e2, f2) {
          function g2(a11) {
            try {
              i2(d10.next(a11));
            } catch (a12) {
              f2(a12);
            }
          }
          function h2(a11) {
            try {
              i2(d10.throw(a11));
            } catch (a12) {
              f2(a12);
            }
          }
          function i2(a11) {
            var b11;
            a11.done ? e2(a11.value) : ((b11 = a11.value) instanceof c10 ? b11 : new c10(function(a12) {
              a12(b11);
            })).then(g2, h2);
          }
          i2((d10 = d10.apply(a10, b10 || [])).next());
        });
      };
      class cF {
        constructor(a10, b10 = {}, c10, d10) {
          this.shouldThrowOnError = false;
          let e2 = new URL(a10);
          (null == d10 ? void 0 : d10.useNewHostname) && /supabase\.(co|in|red)$/.test(e2.hostname) && !e2.hostname.includes("storage.supabase.") && (e2.hostname = e2.hostname.replace("supabase.", "storage.supabase.")), this.url = e2.href, this.headers = Object.assign(Object.assign({}, cD), b10), this.fetch = cp(c10);
        }
        throwOnError() {
          return this.shouldThrowOnError = true, this;
        }
        listBuckets() {
          return cE(this, void 0, void 0, function* () {
            try {
              return { data: yield cu(this.fetch, `${this.url}/bucket`, { headers: this.headers }), error: null };
            } catch (a10) {
              if (this.shouldThrowOnError) throw a10;
              if (cm(a10)) return { data: null, error: a10 };
              throw a10;
            }
          });
        }
        getBucket(a10) {
          return cE(this, void 0, void 0, function* () {
            try {
              return { data: yield cu(this.fetch, `${this.url}/bucket/${a10}`, { headers: this.headers }), error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (cm(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        createBucket(a10, b10 = { public: false }) {
          return cE(this, void 0, void 0, function* () {
            try {
              return { data: yield cv(this.fetch, `${this.url}/bucket`, { id: a10, name: a10, type: b10.type, public: b10.public, file_size_limit: b10.fileSizeLimit, allowed_mime_types: b10.allowedMimeTypes }, { headers: this.headers }), error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (cm(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        updateBucket(a10, b10) {
          return cE(this, void 0, void 0, function* () {
            try {
              return { data: yield cw(this.fetch, `${this.url}/bucket/${a10}`, { id: a10, name: a10, public: b10.public, file_size_limit: b10.fileSizeLimit, allowed_mime_types: b10.allowedMimeTypes }, { headers: this.headers }), error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (cm(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        emptyBucket(a10) {
          return cE(this, void 0, void 0, function* () {
            try {
              return { data: yield cv(this.fetch, `${this.url}/bucket/${a10}/empty`, {}, { headers: this.headers }), error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (cm(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        deleteBucket(a10) {
          return cE(this, void 0, void 0, function* () {
            try {
              return { data: yield cx(this.fetch, `${this.url}/bucket/${a10}`, {}, { headers: this.headers }), error: null };
            } catch (a11) {
              if (this.shouldThrowOnError) throw a11;
              if (cm(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
      }
      class cG extends cF {
        constructor(a10, b10 = {}, c10, d10) {
          super(a10, b10, c10, d10);
        }
        from(a10) {
          return new cC(this.url, this.headers, a10, this.fetch);
        }
      }
      let cH = "";
      cH = "undefined" != typeof Deno ? "deno" : "undefined" != typeof document ? "web" : "undefined" != typeof navigator && "ReactNative" === navigator.product ? "react-native" : "node";
      let cI = { headers: { "X-Client-Info": `supabase-js-${cH}/2.57.4` } }, cJ = { schema: "public" }, cK = { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true, flowType: "implicit" }, cL = {};
      var cM = c(506);
      let cN = "2.71.1", cO = { "X-Client-Info": `gotrue-js/${cN}` }, cP = "X-Supabase-Api-Version", cQ = { "2024-01-01": { timestamp: Date.parse("2024-01-01T00:00:00.0Z"), name: "2024-01-01" } }, cR = /^([a-z0-9_-]{4})*($|[a-z0-9_-]{3}$|[a-z0-9_-]{2}$)$/i;
      class cS extends Error {
        constructor(a10, b10, c10) {
          super(a10), this.__isAuthError = true, this.name = "AuthError", this.status = b10, this.code = c10;
        }
      }
      function cT(a10) {
        return "object" == typeof a10 && null !== a10 && "__isAuthError" in a10;
      }
      class cU extends cS {
        constructor(a10, b10, c10) {
          super(a10, b10, c10), this.name = "AuthApiError", this.status = b10, this.code = c10;
        }
      }
      class cV extends cS {
        constructor(a10, b10) {
          super(a10), this.name = "AuthUnknownError", this.originalError = b10;
        }
      }
      class cW extends cS {
        constructor(a10, b10, c10, d10) {
          super(a10, c10, d10), this.name = b10, this.status = c10;
        }
      }
      class cX extends cW {
        constructor() {
          super("Auth session missing!", "AuthSessionMissingError", 400, void 0);
        }
      }
      class cY extends cW {
        constructor() {
          super("Auth session or user missing", "AuthInvalidTokenResponseError", 500, void 0);
        }
      }
      class cZ extends cW {
        constructor(a10) {
          super(a10, "AuthInvalidCredentialsError", 400, void 0);
        }
      }
      class c$ extends cW {
        constructor(a10, b10 = null) {
          super(a10, "AuthImplicitGrantRedirectError", 500, void 0), this.details = null, this.details = b10;
        }
        toJSON() {
          return { name: this.name, message: this.message, status: this.status, details: this.details };
        }
      }
      class c_ extends cW {
        constructor(a10, b10 = null) {
          super(a10, "AuthPKCEGrantCodeExchangeError", 500, void 0), this.details = null, this.details = b10;
        }
        toJSON() {
          return { name: this.name, message: this.message, status: this.status, details: this.details };
        }
      }
      class c0 extends cW {
        constructor(a10, b10) {
          super(a10, "AuthRetryableFetchError", b10, void 0);
        }
      }
      function c1(a10) {
        return cT(a10) && "AuthRetryableFetchError" === a10.name;
      }
      class c2 extends cW {
        constructor(a10, b10, c10) {
          super(a10, "AuthWeakPasswordError", b10, "weak_password"), this.reasons = c10;
        }
      }
      class c3 extends cW {
        constructor(a10) {
          super(a10, "AuthInvalidJwtError", 400, "invalid_jwt");
        }
      }
      let c4 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".split(""), c5 = " 	\n\r=".split(""), c6 = (() => {
        let a10 = Array(128);
        for (let b10 = 0; b10 < a10.length; b10 += 1) a10[b10] = -1;
        for (let b10 = 0; b10 < c5.length; b10 += 1) a10[c5[b10].charCodeAt(0)] = -2;
        for (let b10 = 0; b10 < c4.length; b10 += 1) a10[c4[b10].charCodeAt(0)] = b10;
        return a10;
      })();
      function c7(a10, b10, c10) {
        if (null !== a10) for (b10.queue = b10.queue << 8 | a10, b10.queuedBits += 8; b10.queuedBits >= 6; ) c10(c4[b10.queue >> b10.queuedBits - 6 & 63]), b10.queuedBits -= 6;
        else if (b10.queuedBits > 0) for (b10.queue = b10.queue << 6 - b10.queuedBits, b10.queuedBits = 6; b10.queuedBits >= 6; ) c10(c4[b10.queue >> b10.queuedBits - 6 & 63]), b10.queuedBits -= 6;
      }
      function c8(a10, b10, c10) {
        let d10 = c6[a10];
        if (d10 > -1) for (b10.queue = b10.queue << 6 | d10, b10.queuedBits += 6; b10.queuedBits >= 8; ) c10(b10.queue >> b10.queuedBits - 8 & 255), b10.queuedBits -= 8;
        else if (-2 === d10) return;
        else throw Error(`Invalid Base64-URL character "${String.fromCharCode(a10)}"`);
      }
      function c9(a10) {
        let b10 = [], c10 = (a11) => {
          b10.push(String.fromCodePoint(a11));
        }, d10 = { utf8seq: 0, codepoint: 0 }, e2 = { queue: 0, queuedBits: 0 }, f2 = (a11) => {
          !function(a12, b11, c11) {
            if (0 === b11.utf8seq) {
              if (a12 <= 127) return c11(a12);
              for (let c12 = 1; c12 < 6; c12 += 1) if ((a12 >> 7 - c12 & 1) == 0) {
                b11.utf8seq = c12;
                break;
              }
              if (2 === b11.utf8seq) b11.codepoint = 31 & a12;
              else if (3 === b11.utf8seq) b11.codepoint = 15 & a12;
              else if (4 === b11.utf8seq) b11.codepoint = 7 & a12;
              else throw Error("Invalid UTF-8 sequence");
              b11.utf8seq -= 1;
            } else if (b11.utf8seq > 0) {
              if (a12 <= 127) throw Error("Invalid UTF-8 sequence");
              b11.codepoint = b11.codepoint << 6 | 63 & a12, b11.utf8seq -= 1, 0 === b11.utf8seq && c11(b11.codepoint);
            }
          }(a11, d10, c10);
        };
        for (let b11 = 0; b11 < a10.length; b11 += 1) c8(a10.charCodeAt(b11), e2, f2);
        return b10.join("");
      }
      let da = () => "undefined" != typeof window && "undefined" != typeof document, db = { tested: false, writable: false }, dc = () => {
        if (!da()) return false;
        try {
          if ("object" != typeof globalThis.localStorage) return false;
        } catch (a11) {
          return false;
        }
        if (db.tested) return db.writable;
        let a10 = `lswt-${Math.random()}${Math.random()}`;
        try {
          globalThis.localStorage.setItem(a10, a10), globalThis.localStorage.removeItem(a10), db.tested = true, db.writable = true;
        } catch (a11) {
          db.tested = true, db.writable = false;
        }
        return db.writable;
      }, dd = (a10) => {
        let b10;
        return b10 = a10 || ("undefined" == typeof fetch ? (...a11) => Promise.resolve().then(c.bind(c, 506)).then(({ default: b11 }) => b11(...a11)) : fetch), (...a11) => b10(...a11);
      }, de = async (a10, b10, c10) => {
        await a10.setItem(b10, JSON.stringify(c10));
      }, df = async (a10, b10) => {
        let c10 = await a10.getItem(b10);
        if (!c10) return null;
        try {
          return JSON.parse(c10);
        } catch (a11) {
          return c10;
        }
      }, dg = async (a10, b10) => {
        await a10.removeItem(b10);
      };
      class dh {
        constructor() {
          this.promise = new dh.promiseConstructor((a10, b10) => {
            this.resolve = a10, this.reject = b10;
          });
        }
      }
      function di(a10) {
        let b10 = a10.split(".");
        if (3 !== b10.length) throw new c3("Invalid JWT structure");
        for (let a11 = 0; a11 < b10.length; a11++) if (!cR.test(b10[a11])) throw new c3("JWT not in base64url format");
        return { header: JSON.parse(c9(b10[0])), payload: JSON.parse(c9(b10[1])), signature: function(a11) {
          let b11 = [], c10 = { queue: 0, queuedBits: 0 }, d10 = (a12) => {
            b11.push(a12);
          };
          for (let b12 = 0; b12 < a11.length; b12 += 1) c8(a11.charCodeAt(b12), c10, d10);
          return new Uint8Array(b11);
        }(b10[2]), raw: { header: b10[0], payload: b10[1] } };
      }
      async function dj(a10) {
        return await new Promise((b10) => {
          setTimeout(() => b10(null), a10);
        });
      }
      function dk(a10) {
        return ("0" + a10.toString(16)).substr(-2);
      }
      async function dl(a10) {
        let b10 = new TextEncoder().encode(a10);
        return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", b10))).map((a11) => String.fromCharCode(a11)).join("");
      }
      async function dm(a10) {
        return "undefined" == typeof crypto || void 0 === crypto.subtle || "undefined" == typeof TextEncoder ? (console.warn("WebCrypto API is not supported. Code challenge method will default to use plain instead of sha256."), a10) : btoa(await dl(a10)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
      }
      async function dn(a10, b10, c10 = false) {
        let d10 = function() {
          let a11 = new Uint32Array(56);
          if ("undefined" == typeof crypto) {
            let a12 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~", b11 = a12.length, c11 = "";
            for (let d11 = 0; d11 < 56; d11++) c11 += a12.charAt(Math.floor(Math.random() * b11));
            return c11;
          }
          return crypto.getRandomValues(a11), Array.from(a11, dk).join("");
        }(), e2 = d10;
        c10 && (e2 += "/PASSWORD_RECOVERY"), await de(a10, `${b10}-code-verifier`, e2);
        let f2 = await dm(d10), g2 = d10 === f2 ? "plain" : "s256";
        return [f2, g2];
      }
      dh.promiseConstructor = Promise;
      let dp = /^2[0-9]{3}-(0[1-9]|1[0-2])-(0[1-9]|1[0-9]|2[0-9]|3[0-1])$/i, dq = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
      function dr(a10) {
        if (!dq.test(a10)) throw Error("@supabase/auth-js: Expected parameter to be UUID but is not");
      }
      function ds() {
        return new Proxy({}, { get: (a10, b10) => {
          if ("__isUserNotAvailableProxy" === b10) return true;
          if ("symbol" == typeof b10) {
            let a11 = b10.toString();
            if ("Symbol(Symbol.toPrimitive)" === a11 || "Symbol(Symbol.toStringTag)" === a11 || "Symbol(util.inspect.custom)" === a11) return;
          }
          throw Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Accessing the "${b10}" property of the session object is not supported. Please use getUser() instead.`);
        }, set: (a10, b10) => {
          throw Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Setting the "${b10}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
        }, deleteProperty: (a10, b10) => {
          throw Error(`@supabase/auth-js: client was created with userStorage option and there was no user stored in the user storage. Deleting the "${b10}" property of the session object is not supported. Please use getUser() to fetch a user object you can manipulate.`);
        } });
      }
      function dt(a10) {
        return JSON.parse(JSON.stringify(a10));
      }
      var du = function(a10, b10) {
        var c10 = {};
        for (var d10 in a10) Object.prototype.hasOwnProperty.call(a10, d10) && 0 > b10.indexOf(d10) && (c10[d10] = a10[d10]);
        if (null != a10 && "function" == typeof Object.getOwnPropertySymbols) for (var e2 = 0, d10 = Object.getOwnPropertySymbols(a10); e2 < d10.length; e2++) 0 > b10.indexOf(d10[e2]) && Object.prototype.propertyIsEnumerable.call(a10, d10[e2]) && (c10[d10[e2]] = a10[d10[e2]]);
        return c10;
      };
      let dv = (a10) => a10.msg || a10.message || a10.error_description || a10.error || JSON.stringify(a10), dw = [502, 503, 504];
      async function dx(a10) {
        var b10;
        let c10, d10;
        if (!("object" == typeof a10 && null !== a10 && "status" in a10 && "ok" in a10 && "json" in a10 && "function" == typeof a10.json)) throw new c0(dv(a10), 0);
        if (dw.includes(a10.status)) throw new c0(dv(a10), a10.status);
        try {
          c10 = await a10.json();
        } catch (a11) {
          throw new cV(dv(a11), a11);
        }
        let e2 = function(a11) {
          let b11 = a11.headers.get(cP);
          if (!b11 || !b11.match(dp)) return null;
          try {
            return /* @__PURE__ */ new Date(`${b11}T00:00:00.0Z`);
          } catch (a12) {
            return null;
          }
        }(a10);
        if (e2 && e2.getTime() >= cQ["2024-01-01"].timestamp && "object" == typeof c10 && c10 && "string" == typeof c10.code ? d10 = c10.code : "object" == typeof c10 && c10 && "string" == typeof c10.error_code && (d10 = c10.error_code), d10) {
          if ("weak_password" === d10) throw new c2(dv(c10), a10.status, (null == (b10 = c10.weak_password) ? void 0 : b10.reasons) || []);
          else if ("session_not_found" === d10) throw new cX();
        } else if ("object" == typeof c10 && c10 && "object" == typeof c10.weak_password && c10.weak_password && Array.isArray(c10.weak_password.reasons) && c10.weak_password.reasons.length && c10.weak_password.reasons.reduce((a11, b11) => a11 && "string" == typeof b11, true)) throw new c2(dv(c10), a10.status, c10.weak_password.reasons);
        throw new cU(dv(c10), a10.status || 500, d10);
      }
      async function dy(a10, b10, c10, d10) {
        var e2;
        let f2 = Object.assign({}, null == d10 ? void 0 : d10.headers);
        f2[cP] || (f2[cP] = cQ["2024-01-01"].name), (null == d10 ? void 0 : d10.jwt) && (f2.Authorization = `Bearer ${d10.jwt}`);
        let g2 = null != (e2 = null == d10 ? void 0 : d10.query) ? e2 : {};
        (null == d10 ? void 0 : d10.redirectTo) && (g2.redirect_to = d10.redirectTo);
        let h2 = Object.keys(g2).length ? "?" + new URLSearchParams(g2).toString() : "", i2 = await dz(a10, b10, c10 + h2, { headers: f2, noResolveJson: null == d10 ? void 0 : d10.noResolveJson }, {}, null == d10 ? void 0 : d10.body);
        return (null == d10 ? void 0 : d10.xform) ? null == d10 ? void 0 : d10.xform(i2) : { data: Object.assign({}, i2), error: null };
      }
      async function dz(a10, b10, c10, d10, e2, f2) {
        let g2, h2 = ((a11, b11, c11, d11) => {
          let e3 = { method: a11, headers: (null == b11 ? void 0 : b11.headers) || {} };
          return "GET" === a11 ? e3 : (e3.headers = Object.assign({ "Content-Type": "application/json;charset=UTF-8" }, null == b11 ? void 0 : b11.headers), e3.body = JSON.stringify(d11), Object.assign(Object.assign({}, e3), c11));
        })(b10, d10, e2, f2);
        try {
          g2 = await a10(c10, Object.assign({}, h2));
        } catch (a11) {
          throw console.error(a11), new c0(dv(a11), 0);
        }
        if (g2.ok || await dx(g2), null == d10 ? void 0 : d10.noResolveJson) return g2;
        try {
          return await g2.json();
        } catch (a11) {
          await dx(a11);
        }
      }
      function dA(a10) {
        var b10, c10, d10;
        let e2 = null;
        (d10 = a10).access_token && d10.refresh_token && d10.expires_in && (e2 = Object.assign({}, a10), a10.expires_at || (e2.expires_at = (c10 = a10.expires_in, Math.round(Date.now() / 1e3) + c10)));
        return { data: { session: e2, user: null != (b10 = a10.user) ? b10 : a10 }, error: null };
      }
      function dB(a10) {
        let b10 = dA(a10);
        return !b10.error && a10.weak_password && "object" == typeof a10.weak_password && Array.isArray(a10.weak_password.reasons) && a10.weak_password.reasons.length && a10.weak_password.message && "string" == typeof a10.weak_password.message && a10.weak_password.reasons.reduce((a11, b11) => a11 && "string" == typeof b11, true) && (b10.data.weak_password = a10.weak_password), b10;
      }
      function dC(a10) {
        var b10;
        return { data: { user: null != (b10 = a10.user) ? b10 : a10 }, error: null };
      }
      function dD(a10) {
        return { data: a10, error: null };
      }
      function dE(a10) {
        let { action_link: b10, email_otp: c10, hashed_token: d10, redirect_to: e2, verification_type: f2 } = a10;
        return { data: { properties: { action_link: b10, email_otp: c10, hashed_token: d10, redirect_to: e2, verification_type: f2 }, user: Object.assign({}, du(a10, ["action_link", "email_otp", "hashed_token", "redirect_to", "verification_type"])) }, error: null };
      }
      function dF(a10) {
        return a10;
      }
      let dG = ["global", "local", "others"];
      var dH = function(a10, b10) {
        var c10 = {};
        for (var d10 in a10) Object.prototype.hasOwnProperty.call(a10, d10) && 0 > b10.indexOf(d10) && (c10[d10] = a10[d10]);
        if (null != a10 && "function" == typeof Object.getOwnPropertySymbols) for (var e2 = 0, d10 = Object.getOwnPropertySymbols(a10); e2 < d10.length; e2++) 0 > b10.indexOf(d10[e2]) && Object.prototype.propertyIsEnumerable.call(a10, d10[e2]) && (c10[d10[e2]] = a10[d10[e2]]);
        return c10;
      };
      class dI {
        constructor({ url: a10 = "", headers: b10 = {}, fetch: c10 }) {
          this.url = a10, this.headers = b10, this.fetch = dd(c10), this.mfa = { listFactors: this._listFactors.bind(this), deleteFactor: this._deleteFactor.bind(this) };
        }
        async signOut(a10, b10 = dG[0]) {
          if (0 > dG.indexOf(b10)) throw Error(`@supabase/auth-js: Parameter scope must be one of ${dG.join(", ")}`);
          try {
            return await dy(this.fetch, "POST", `${this.url}/logout?scope=${b10}`, { headers: this.headers, jwt: a10, noResolveJson: true }), { data: null, error: null };
          } catch (a11) {
            if (cT(a11)) return { data: null, error: a11 };
            throw a11;
          }
        }
        async inviteUserByEmail(a10, b10 = {}) {
          try {
            return await dy(this.fetch, "POST", `${this.url}/invite`, { body: { email: a10, data: b10.data }, headers: this.headers, redirectTo: b10.redirectTo, xform: dC });
          } catch (a11) {
            if (cT(a11)) return { data: { user: null }, error: a11 };
            throw a11;
          }
        }
        async generateLink(a10) {
          try {
            let { options: b10 } = a10, c10 = dH(a10, ["options"]), d10 = Object.assign(Object.assign({}, c10), b10);
            return "newEmail" in c10 && (d10.new_email = null == c10 ? void 0 : c10.newEmail, delete d10.newEmail), await dy(this.fetch, "POST", `${this.url}/admin/generate_link`, { body: d10, headers: this.headers, xform: dE, redirectTo: null == b10 ? void 0 : b10.redirectTo });
          } catch (a11) {
            if (cT(a11)) return { data: { properties: null, user: null }, error: a11 };
            throw a11;
          }
        }
        async createUser(a10) {
          try {
            return await dy(this.fetch, "POST", `${this.url}/admin/users`, { body: a10, headers: this.headers, xform: dC });
          } catch (a11) {
            if (cT(a11)) return { data: { user: null }, error: a11 };
            throw a11;
          }
        }
        async listUsers(a10) {
          var b10, c10, d10, e2, f2, g2, h2;
          try {
            let i2 = { nextPage: null, lastPage: 0, total: 0 }, j2 = await dy(this.fetch, "GET", `${this.url}/admin/users`, { headers: this.headers, noResolveJson: true, query: { page: null != (c10 = null == (b10 = null == a10 ? void 0 : a10.page) ? void 0 : b10.toString()) ? c10 : "", per_page: null != (e2 = null == (d10 = null == a10 ? void 0 : a10.perPage) ? void 0 : d10.toString()) ? e2 : "" }, xform: dF });
            if (j2.error) throw j2.error;
            let k2 = await j2.json(), l2 = null != (f2 = j2.headers.get("x-total-count")) ? f2 : 0, m2 = null != (h2 = null == (g2 = j2.headers.get("link")) ? void 0 : g2.split(",")) ? h2 : [];
            return m2.length > 0 && (m2.forEach((a11) => {
              let b11 = parseInt(a11.split(";")[0].split("=")[1].substring(0, 1)), c11 = JSON.parse(a11.split(";")[1].split("=")[1]);
              i2[`${c11}Page`] = b11;
            }), i2.total = parseInt(l2)), { data: Object.assign(Object.assign({}, k2), i2), error: null };
          } catch (a11) {
            if (cT(a11)) return { data: { users: [] }, error: a11 };
            throw a11;
          }
        }
        async getUserById(a10) {
          dr(a10);
          try {
            return await dy(this.fetch, "GET", `${this.url}/admin/users/${a10}`, { headers: this.headers, xform: dC });
          } catch (a11) {
            if (cT(a11)) return { data: { user: null }, error: a11 };
            throw a11;
          }
        }
        async updateUserById(a10, b10) {
          dr(a10);
          try {
            return await dy(this.fetch, "PUT", `${this.url}/admin/users/${a10}`, { body: b10, headers: this.headers, xform: dC });
          } catch (a11) {
            if (cT(a11)) return { data: { user: null }, error: a11 };
            throw a11;
          }
        }
        async deleteUser(a10, b10 = false) {
          dr(a10);
          try {
            return await dy(this.fetch, "DELETE", `${this.url}/admin/users/${a10}`, { headers: this.headers, body: { should_soft_delete: b10 }, xform: dC });
          } catch (a11) {
            if (cT(a11)) return { data: { user: null }, error: a11 };
            throw a11;
          }
        }
        async _listFactors(a10) {
          dr(a10.userId);
          try {
            let { data: b10, error: c10 } = await dy(this.fetch, "GET", `${this.url}/admin/users/${a10.userId}/factors`, { headers: this.headers, xform: (a11) => ({ data: { factors: a11 }, error: null }) });
            return { data: b10, error: c10 };
          } catch (a11) {
            if (cT(a11)) return { data: null, error: a11 };
            throw a11;
          }
        }
        async _deleteFactor(a10) {
          dr(a10.userId), dr(a10.id);
          try {
            return { data: await dy(this.fetch, "DELETE", `${this.url}/admin/users/${a10.userId}/factors/${a10.id}`, { headers: this.headers }), error: null };
          } catch (a11) {
            if (cT(a11)) return { data: null, error: a11 };
            throw a11;
          }
        }
      }
      function dJ(a10 = {}) {
        return { getItem: (b10) => a10[b10] || null, setItem: (b10, c10) => {
          a10[b10] = c10;
        }, removeItem: (b10) => {
          delete a10[b10];
        } };
      }
      let dK = { debug: !!(globalThis && dc() && globalThis.localStorage && "true" === globalThis.localStorage.getItem("supabase.gotrue-js.locks.debug")) };
      class dL extends Error {
        constructor(a10) {
          super(a10), this.isAcquireTimeout = true;
        }
      }
      class dM extends dL {
      }
      async function dN(a10, b10, c10) {
        dK.debug && console.log("@supabase/gotrue-js: navigatorLock: acquire lock", a10, b10);
        let d10 = new globalThis.AbortController();
        return b10 > 0 && setTimeout(() => {
          d10.abort(), dK.debug && console.log("@supabase/gotrue-js: navigatorLock acquire timed out", a10);
        }, b10), await Promise.resolve().then(() => globalThis.navigator.locks.request(a10, 0 === b10 ? { mode: "exclusive", ifAvailable: true } : { mode: "exclusive", signal: d10.signal }, async (d11) => {
          if (d11) {
            dK.debug && console.log("@supabase/gotrue-js: navigatorLock: acquired", a10, d11.name);
            try {
              return await c10();
            } finally {
              dK.debug && console.log("@supabase/gotrue-js: navigatorLock: released", a10, d11.name);
            }
          }
          if (0 === b10) throw dK.debug && console.log("@supabase/gotrue-js: navigatorLock: not immediately available", a10), new dM(`Acquiring an exclusive Navigator LockManager lock "${a10}" immediately failed`);
          if (dK.debug) try {
            let a11 = await globalThis.navigator.locks.query();
            console.log("@supabase/gotrue-js: Navigator LockManager state", JSON.stringify(a11, null, "  "));
          } catch (a11) {
            console.warn("@supabase/gotrue-js: Error when querying Navigator LockManager state", a11);
          }
          return console.warn("@supabase/gotrue-js: Navigator LockManager returned a null lock when using #request without ifAvailable set to true, it appears this browser is not following the LockManager spec https://developer.mozilla.org/en-US/docs/Web/API/LockManager/request"), await c10();
        }));
      }
      if ("object" != typeof globalThis) try {
        Object.defineProperty(Object.prototype, "__magic__", { get: function() {
          return this;
        }, configurable: true }), __magic__.globalThis = __magic__, delete Object.prototype.__magic__;
      } catch (a10) {
        "undefined" != typeof self && (self.globalThis = self);
      }
      let dO = { url: "http://localhost:9999", storageKey: "supabase.auth.token", autoRefreshToken: true, persistSession: true, detectSessionInUrl: true, headers: cO, flowType: "implicit", debug: false, hasCustomAuthorizationHeader: false };
      async function dP(a10, b10, c10) {
        return await c10();
      }
      let dQ = {};
      class dR {
        constructor(a10) {
          var b10, c10;
          this.userStorage = null, this.memoryStorage = null, this.stateChangeEmitters = /* @__PURE__ */ new Map(), this.autoRefreshTicker = null, this.visibilityChangedCallback = null, this.refreshingDeferred = null, this.initializePromise = null, this.detectSessionInUrl = true, this.hasCustomAuthorizationHeader = false, this.suppressGetSessionWarning = false, this.lockAcquired = false, this.pendingInLock = [], this.broadcastChannel = null, this.logger = console.log, this.instanceID = dR.nextInstanceID, dR.nextInstanceID += 1, this.instanceID > 0 && da() && console.warn("Multiple GoTrueClient instances detected in the same browser context. It is not an error, but this should be avoided as it may produce undefined behavior when used concurrently under the same storage key.");
          let d10 = Object.assign(Object.assign({}, dO), a10);
          if (this.logDebugMessages = !!d10.debug, "function" == typeof d10.debug && (this.logger = d10.debug), this.persistSession = d10.persistSession, this.storageKey = d10.storageKey, this.autoRefreshToken = d10.autoRefreshToken, this.admin = new dI({ url: d10.url, headers: d10.headers, fetch: d10.fetch }), this.url = d10.url, this.headers = d10.headers, this.fetch = dd(d10.fetch), this.lock = d10.lock || dP, this.detectSessionInUrl = d10.detectSessionInUrl, this.flowType = d10.flowType, this.hasCustomAuthorizationHeader = d10.hasCustomAuthorizationHeader, d10.lock ? this.lock = d10.lock : da() && (null == (b10 = null == globalThis ? void 0 : globalThis.navigator) ? void 0 : b10.locks) ? this.lock = dN : this.lock = dP, this.jwks || (this.jwks = { keys: [] }, this.jwks_cached_at = Number.MIN_SAFE_INTEGER), this.mfa = { verify: this._verify.bind(this), enroll: this._enroll.bind(this), unenroll: this._unenroll.bind(this), challenge: this._challenge.bind(this), listFactors: this._listFactors.bind(this), challengeAndVerify: this._challengeAndVerify.bind(this), getAuthenticatorAssuranceLevel: this._getAuthenticatorAssuranceLevel.bind(this) }, this.persistSession ? (d10.storage ? this.storage = d10.storage : dc() ? this.storage = globalThis.localStorage : (this.memoryStorage = {}, this.storage = dJ(this.memoryStorage)), d10.userStorage && (this.userStorage = d10.userStorage)) : (this.memoryStorage = {}, this.storage = dJ(this.memoryStorage)), da() && globalThis.BroadcastChannel && this.persistSession && this.storageKey) {
            try {
              this.broadcastChannel = new globalThis.BroadcastChannel(this.storageKey);
            } catch (a11) {
              console.error("Failed to create a new BroadcastChannel, multi-tab state changes will not be available", a11);
            }
            null == (c10 = this.broadcastChannel) || c10.addEventListener("message", async (a11) => {
              this._debug("received broadcast notification from other tab or client", a11), await this._notifyAllSubscribers(a11.data.event, a11.data.session, false);
            });
          }
          this.initialize();
        }
        get jwks() {
          var a10, b10;
          return null != (b10 = null == (a10 = dQ[this.storageKey]) ? void 0 : a10.jwks) ? b10 : { keys: [] };
        }
        set jwks(a10) {
          dQ[this.storageKey] = Object.assign(Object.assign({}, dQ[this.storageKey]), { jwks: a10 });
        }
        get jwks_cached_at() {
          var a10, b10;
          return null != (b10 = null == (a10 = dQ[this.storageKey]) ? void 0 : a10.cachedAt) ? b10 : Number.MIN_SAFE_INTEGER;
        }
        set jwks_cached_at(a10) {
          dQ[this.storageKey] = Object.assign(Object.assign({}, dQ[this.storageKey]), { cachedAt: a10 });
        }
        _debug(...a10) {
          return this.logDebugMessages && this.logger(`GoTrueClient@${this.instanceID} (${cN}) ${(/* @__PURE__ */ new Date()).toISOString()}`, ...a10), this;
        }
        async initialize() {
          return this.initializePromise || (this.initializePromise = (async () => await this._acquireLock(-1, async () => await this._initialize()))()), await this.initializePromise;
        }
        async _initialize() {
          var a10;
          try {
            let b10 = function(a11) {
              let b11 = {}, c11 = new URL(a11);
              if (c11.hash && "#" === c11.hash[0]) try {
                new URLSearchParams(c11.hash.substring(1)).forEach((a12, c12) => {
                  b11[c12] = a12;
                });
              } catch (a12) {
              }
              return c11.searchParams.forEach((a12, c12) => {
                b11[c12] = a12;
              }), b11;
            }(window.location.href), c10 = "none";
            if (this._isImplicitGrantCallback(b10) ? c10 = "implicit" : await this._isPKCECallback(b10) && (c10 = "pkce"), da() && this.detectSessionInUrl && "none" !== c10) {
              let { data: d10, error: e2 } = await this._getSessionFromURL(b10, c10);
              if (e2) {
                if (this._debug("#_initialize()", "error detecting session from URL", e2), cT(e2) && "AuthImplicitGrantRedirectError" === e2.name) {
                  let b11 = null == (a10 = e2.details) ? void 0 : a10.code;
                  if ("identity_already_exists" === b11 || "identity_not_found" === b11 || "single_identity_not_deletable" === b11) return { error: e2 };
                }
                return await this._removeSession(), { error: e2 };
              }
              let { session: f2, redirectType: g2 } = d10;
              return this._debug("#_initialize()", "detected session in URL", f2, "redirect type", g2), await this._saveSession(f2), setTimeout(async () => {
                "recovery" === g2 ? await this._notifyAllSubscribers("PASSWORD_RECOVERY", f2) : await this._notifyAllSubscribers("SIGNED_IN", f2);
              }, 0), { error: null };
            }
            return await this._recoverAndRefresh(), { error: null };
          } catch (a11) {
            if (cT(a11)) return { error: a11 };
            return { error: new cV("Unexpected error during initialization", a11) };
          } finally {
            await this._handleVisibilityChange(), this._debug("#_initialize()", "end");
          }
        }
        async signInAnonymously(a10) {
          var b10, c10, d10;
          try {
            let { data: e2, error: f2 } = await dy(this.fetch, "POST", `${this.url}/signup`, { headers: this.headers, body: { data: null != (c10 = null == (b10 = null == a10 ? void 0 : a10.options) ? void 0 : b10.data) ? c10 : {}, gotrue_meta_security: { captcha_token: null == (d10 = null == a10 ? void 0 : a10.options) ? void 0 : d10.captchaToken } }, xform: dA });
            if (f2 || !e2) return { data: { user: null, session: null }, error: f2 };
            let g2 = e2.session, h2 = e2.user;
            return e2.session && (await this._saveSession(e2.session), await this._notifyAllSubscribers("SIGNED_IN", g2)), { data: { user: h2, session: g2 }, error: null };
          } catch (a11) {
            if (cT(a11)) return { data: { user: null, session: null }, error: a11 };
            throw a11;
          }
        }
        async signUp(a10) {
          var b10, c10, d10;
          try {
            let e2;
            if ("email" in a10) {
              let { email: c11, password: d11, options: f3 } = a10, g3 = null, h3 = null;
              "pkce" === this.flowType && ([g3, h3] = await dn(this.storage, this.storageKey)), e2 = await dy(this.fetch, "POST", `${this.url}/signup`, { headers: this.headers, redirectTo: null == f3 ? void 0 : f3.emailRedirectTo, body: { email: c11, password: d11, data: null != (b10 = null == f3 ? void 0 : f3.data) ? b10 : {}, gotrue_meta_security: { captcha_token: null == f3 ? void 0 : f3.captchaToken }, code_challenge: g3, code_challenge_method: h3 }, xform: dA });
            } else if ("phone" in a10) {
              let { phone: b11, password: f3, options: g3 } = a10;
              e2 = await dy(this.fetch, "POST", `${this.url}/signup`, { headers: this.headers, body: { phone: b11, password: f3, data: null != (c10 = null == g3 ? void 0 : g3.data) ? c10 : {}, channel: null != (d10 = null == g3 ? void 0 : g3.channel) ? d10 : "sms", gotrue_meta_security: { captcha_token: null == g3 ? void 0 : g3.captchaToken } }, xform: dA });
            } else throw new cZ("You must provide either an email or phone number and a password");
            let { data: f2, error: g2 } = e2;
            if (g2 || !f2) return { data: { user: null, session: null }, error: g2 };
            let h2 = f2.session, i2 = f2.user;
            return f2.session && (await this._saveSession(f2.session), await this._notifyAllSubscribers("SIGNED_IN", h2)), { data: { user: i2, session: h2 }, error: null };
          } catch (a11) {
            if (cT(a11)) return { data: { user: null, session: null }, error: a11 };
            throw a11;
          }
        }
        async signInWithPassword(a10) {
          try {
            let b10;
            if ("email" in a10) {
              let { email: c11, password: d11, options: e2 } = a10;
              b10 = await dy(this.fetch, "POST", `${this.url}/token?grant_type=password`, { headers: this.headers, body: { email: c11, password: d11, gotrue_meta_security: { captcha_token: null == e2 ? void 0 : e2.captchaToken } }, xform: dB });
            } else if ("phone" in a10) {
              let { phone: c11, password: d11, options: e2 } = a10;
              b10 = await dy(this.fetch, "POST", `${this.url}/token?grant_type=password`, { headers: this.headers, body: { phone: c11, password: d11, gotrue_meta_security: { captcha_token: null == e2 ? void 0 : e2.captchaToken } }, xform: dB });
            } else throw new cZ("You must provide either an email or phone number and a password");
            let { data: c10, error: d10 } = b10;
            if (d10) return { data: { user: null, session: null }, error: d10 };
            if (!c10 || !c10.session || !c10.user) return { data: { user: null, session: null }, error: new cY() };
            return c10.session && (await this._saveSession(c10.session), await this._notifyAllSubscribers("SIGNED_IN", c10.session)), { data: Object.assign({ user: c10.user, session: c10.session }, c10.weak_password ? { weakPassword: c10.weak_password } : null), error: d10 };
          } catch (a11) {
            if (cT(a11)) return { data: { user: null, session: null }, error: a11 };
            throw a11;
          }
        }
        async signInWithOAuth(a10) {
          var b10, c10, d10, e2;
          return await this._handleProviderSignIn(a10.provider, { redirectTo: null == (b10 = a10.options) ? void 0 : b10.redirectTo, scopes: null == (c10 = a10.options) ? void 0 : c10.scopes, queryParams: null == (d10 = a10.options) ? void 0 : d10.queryParams, skipBrowserRedirect: null == (e2 = a10.options) ? void 0 : e2.skipBrowserRedirect });
        }
        async exchangeCodeForSession(a10) {
          return await this.initializePromise, this._acquireLock(-1, async () => this._exchangeCodeForSession(a10));
        }
        async signInWithWeb3(a10) {
          let { chain: b10 } = a10;
          if ("solana" === b10) return await this.signInWithSolana(a10);
          throw Error(`@supabase/auth-js: Unsupported chain "${b10}"`);
        }
        async signInWithSolana(a10) {
          var b10, c10, d10, e2, f2, g2, h2, i2, j2, k2, l2, m2;
          let n2, o2;
          if ("message" in a10) n2 = a10.message, o2 = a10.signature;
          else {
            let l3, { chain: m3, wallet: p2, statement: q2, options: r2 } = a10;
            if (da()) if ("object" == typeof p2) l3 = p2;
            else {
              let a11 = window;
              if ("solana" in a11 && "object" == typeof a11.solana && ("signIn" in a11.solana && "function" == typeof a11.solana.signIn || "signMessage" in a11.solana && "function" == typeof a11.solana.signMessage)) l3 = a11.solana;
              else throw Error("@supabase/auth-js: No compatible Solana wallet interface on the window object (window.solana) detected. Make sure the user already has a wallet installed and connected for this app. Prefer passing the wallet interface object directly to signInWithWeb3({ chain: 'solana', wallet: resolvedUserWallet }) instead.");
            }
            else {
              if ("object" != typeof p2 || !(null == r2 ? void 0 : r2.url)) throw Error("@supabase/auth-js: Both wallet and url must be specified in non-browser environments.");
              l3 = p2;
            }
            let s2 = new URL(null != (b10 = null == r2 ? void 0 : r2.url) ? b10 : window.location.href);
            if ("signIn" in l3 && l3.signIn) {
              let a11, b11 = await l3.signIn(Object.assign(Object.assign(Object.assign({ issuedAt: (/* @__PURE__ */ new Date()).toISOString() }, null == r2 ? void 0 : r2.signInWithSolana), { version: "1", domain: s2.host, uri: s2.href }), q2 ? { statement: q2 } : null));
              if (Array.isArray(b11) && b11[0] && "object" == typeof b11[0]) a11 = b11[0];
              else if (b11 && "object" == typeof b11 && "signedMessage" in b11 && "signature" in b11) a11 = b11;
              else throw Error("@supabase/auth-js: Wallet method signIn() returned unrecognized value");
              if ("signedMessage" in a11 && "signature" in a11 && ("string" == typeof a11.signedMessage || a11.signedMessage instanceof Uint8Array) && a11.signature instanceof Uint8Array) n2 = "string" == typeof a11.signedMessage ? a11.signedMessage : new TextDecoder().decode(a11.signedMessage), o2 = a11.signature;
              else throw Error("@supabase/auth-js: Wallet method signIn() API returned object without signedMessage and signature fields");
            } else {
              if (!("signMessage" in l3) || "function" != typeof l3.signMessage || !("publicKey" in l3) || "object" != typeof l3 || !l3.publicKey || !("toBase58" in l3.publicKey) || "function" != typeof l3.publicKey.toBase58) throw Error("@supabase/auth-js: Wallet does not have a compatible signMessage() and publicKey.toBase58() API");
              n2 = [`${s2.host} wants you to sign in with your Solana account:`, l3.publicKey.toBase58(), ...q2 ? ["", q2, ""] : [""], "Version: 1", `URI: ${s2.href}`, `Issued At: ${null != (d10 = null == (c10 = null == r2 ? void 0 : r2.signInWithSolana) ? void 0 : c10.issuedAt) ? d10 : (/* @__PURE__ */ new Date()).toISOString()}`, ...(null == (e2 = null == r2 ? void 0 : r2.signInWithSolana) ? void 0 : e2.notBefore) ? [`Not Before: ${r2.signInWithSolana.notBefore}`] : [], ...(null == (f2 = null == r2 ? void 0 : r2.signInWithSolana) ? void 0 : f2.expirationTime) ? [`Expiration Time: ${r2.signInWithSolana.expirationTime}`] : [], ...(null == (g2 = null == r2 ? void 0 : r2.signInWithSolana) ? void 0 : g2.chainId) ? [`Chain ID: ${r2.signInWithSolana.chainId}`] : [], ...(null == (h2 = null == r2 ? void 0 : r2.signInWithSolana) ? void 0 : h2.nonce) ? [`Nonce: ${r2.signInWithSolana.nonce}`] : [], ...(null == (i2 = null == r2 ? void 0 : r2.signInWithSolana) ? void 0 : i2.requestId) ? [`Request ID: ${r2.signInWithSolana.requestId}`] : [], ...(null == (k2 = null == (j2 = null == r2 ? void 0 : r2.signInWithSolana) ? void 0 : j2.resources) ? void 0 : k2.length) ? ["Resources", ...r2.signInWithSolana.resources.map((a12) => `- ${a12}`)] : []].join("\n");
              let a11 = await l3.signMessage(new TextEncoder().encode(n2), "utf8");
              if (!a11 || !(a11 instanceof Uint8Array)) throw Error("@supabase/auth-js: Wallet signMessage() API returned an recognized value");
              o2 = a11;
            }
          }
          try {
            let { data: b11, error: c11 } = await dy(this.fetch, "POST", `${this.url}/token?grant_type=web3`, { headers: this.headers, body: Object.assign({ chain: "solana", message: n2, signature: function(a11) {
              let b12 = [], c12 = { queue: 0, queuedBits: 0 }, d11 = (a12) => {
                b12.push(a12);
              };
              return a11.forEach((a12) => c7(a12, c12, d11)), c7(null, c12, d11), b12.join("");
            }(o2) }, (null == (l2 = a10.options) ? void 0 : l2.captchaToken) ? { gotrue_meta_security: { captcha_token: null == (m2 = a10.options) ? void 0 : m2.captchaToken } } : null), xform: dA });
            if (c11) throw c11;
            if (!b11 || !b11.session || !b11.user) return { data: { user: null, session: null }, error: new cY() };
            return b11.session && (await this._saveSession(b11.session), await this._notifyAllSubscribers("SIGNED_IN", b11.session)), { data: Object.assign({}, b11), error: c11 };
          } catch (a11) {
            if (cT(a11)) return { data: { user: null, session: null }, error: a11 };
            throw a11;
          }
        }
        async _exchangeCodeForSession(a10) {
          let b10 = await df(this.storage, `${this.storageKey}-code-verifier`), [c10, d10] = (null != b10 ? b10 : "").split("/");
          try {
            let { data: b11, error: e2 } = await dy(this.fetch, "POST", `${this.url}/token?grant_type=pkce`, { headers: this.headers, body: { auth_code: a10, code_verifier: c10 }, xform: dA });
            if (await dg(this.storage, `${this.storageKey}-code-verifier`), e2) throw e2;
            if (!b11 || !b11.session || !b11.user) return { data: { user: null, session: null, redirectType: null }, error: new cY() };
            return b11.session && (await this._saveSession(b11.session), await this._notifyAllSubscribers("SIGNED_IN", b11.session)), { data: Object.assign(Object.assign({}, b11), { redirectType: null != d10 ? d10 : null }), error: e2 };
          } catch (a11) {
            if (cT(a11)) return { data: { user: null, session: null, redirectType: null }, error: a11 };
            throw a11;
          }
        }
        async signInWithIdToken(a10) {
          try {
            let { options: b10, provider: c10, token: d10, access_token: e2, nonce: f2 } = a10, { data: g2, error: h2 } = await dy(this.fetch, "POST", `${this.url}/token?grant_type=id_token`, { headers: this.headers, body: { provider: c10, id_token: d10, access_token: e2, nonce: f2, gotrue_meta_security: { captcha_token: null == b10 ? void 0 : b10.captchaToken } }, xform: dA });
            if (h2) return { data: { user: null, session: null }, error: h2 };
            if (!g2 || !g2.session || !g2.user) return { data: { user: null, session: null }, error: new cY() };
            return g2.session && (await this._saveSession(g2.session), await this._notifyAllSubscribers("SIGNED_IN", g2.session)), { data: g2, error: h2 };
          } catch (a11) {
            if (cT(a11)) return { data: { user: null, session: null }, error: a11 };
            throw a11;
          }
        }
        async signInWithOtp(a10) {
          var b10, c10, d10, e2, f2;
          try {
            if ("email" in a10) {
              let { email: d11, options: e3 } = a10, f3 = null, g2 = null;
              "pkce" === this.flowType && ([f3, g2] = await dn(this.storage, this.storageKey));
              let { error: h2 } = await dy(this.fetch, "POST", `${this.url}/otp`, { headers: this.headers, body: { email: d11, data: null != (b10 = null == e3 ? void 0 : e3.data) ? b10 : {}, create_user: null == (c10 = null == e3 ? void 0 : e3.shouldCreateUser) || c10, gotrue_meta_security: { captcha_token: null == e3 ? void 0 : e3.captchaToken }, code_challenge: f3, code_challenge_method: g2 }, redirectTo: null == e3 ? void 0 : e3.emailRedirectTo });
              return { data: { user: null, session: null }, error: h2 };
            }
            if ("phone" in a10) {
              let { phone: b11, options: c11 } = a10, { data: g2, error: h2 } = await dy(this.fetch, "POST", `${this.url}/otp`, { headers: this.headers, body: { phone: b11, data: null != (d10 = null == c11 ? void 0 : c11.data) ? d10 : {}, create_user: null == (e2 = null == c11 ? void 0 : c11.shouldCreateUser) || e2, gotrue_meta_security: { captcha_token: null == c11 ? void 0 : c11.captchaToken }, channel: null != (f2 = null == c11 ? void 0 : c11.channel) ? f2 : "sms" } });
              return { data: { user: null, session: null, messageId: null == g2 ? void 0 : g2.message_id }, error: h2 };
            }
            throw new cZ("You must provide either an email or phone number.");
          } catch (a11) {
            if (cT(a11)) return { data: { user: null, session: null }, error: a11 };
            throw a11;
          }
        }
        async verifyOtp(a10) {
          var b10, c10;
          try {
            let d10, e2;
            "options" in a10 && (d10 = null == (b10 = a10.options) ? void 0 : b10.redirectTo, e2 = null == (c10 = a10.options) ? void 0 : c10.captchaToken);
            let { data: f2, error: g2 } = await dy(this.fetch, "POST", `${this.url}/verify`, { headers: this.headers, body: Object.assign(Object.assign({}, a10), { gotrue_meta_security: { captcha_token: e2 } }), redirectTo: d10, xform: dA });
            if (g2) throw g2;
            if (!f2) throw Error("An error occurred on token verification.");
            let h2 = f2.session, i2 = f2.user;
            return (null == h2 ? void 0 : h2.access_token) && (await this._saveSession(h2), await this._notifyAllSubscribers("recovery" == a10.type ? "PASSWORD_RECOVERY" : "SIGNED_IN", h2)), { data: { user: i2, session: h2 }, error: null };
          } catch (a11) {
            if (cT(a11)) return { data: { user: null, session: null }, error: a11 };
            throw a11;
          }
        }
        async signInWithSSO(a10) {
          var b10, c10, d10;
          try {
            let e2 = null, f2 = null;
            return "pkce" === this.flowType && ([e2, f2] = await dn(this.storage, this.storageKey)), await dy(this.fetch, "POST", `${this.url}/sso`, { body: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, "providerId" in a10 ? { provider_id: a10.providerId } : null), "domain" in a10 ? { domain: a10.domain } : null), { redirect_to: null != (c10 = null == (b10 = a10.options) ? void 0 : b10.redirectTo) ? c10 : void 0 }), (null == (d10 = null == a10 ? void 0 : a10.options) ? void 0 : d10.captchaToken) ? { gotrue_meta_security: { captcha_token: a10.options.captchaToken } } : null), { skip_http_redirect: true, code_challenge: e2, code_challenge_method: f2 }), headers: this.headers, xform: dD });
          } catch (a11) {
            if (cT(a11)) return { data: null, error: a11 };
            throw a11;
          }
        }
        async reauthenticate() {
          return await this.initializePromise, await this._acquireLock(-1, async () => await this._reauthenticate());
        }
        async _reauthenticate() {
          try {
            return await this._useSession(async (a10) => {
              let { data: { session: b10 }, error: c10 } = a10;
              if (c10) throw c10;
              if (!b10) throw new cX();
              let { error: d10 } = await dy(this.fetch, "GET", `${this.url}/reauthenticate`, { headers: this.headers, jwt: b10.access_token });
              return { data: { user: null, session: null }, error: d10 };
            });
          } catch (a10) {
            if (cT(a10)) return { data: { user: null, session: null }, error: a10 };
            throw a10;
          }
        }
        async resend(a10) {
          try {
            let b10 = `${this.url}/resend`;
            if ("email" in a10) {
              let { email: c10, type: d10, options: e2 } = a10, { error: f2 } = await dy(this.fetch, "POST", b10, { headers: this.headers, body: { email: c10, type: d10, gotrue_meta_security: { captcha_token: null == e2 ? void 0 : e2.captchaToken } }, redirectTo: null == e2 ? void 0 : e2.emailRedirectTo });
              return { data: { user: null, session: null }, error: f2 };
            }
            if ("phone" in a10) {
              let { phone: c10, type: d10, options: e2 } = a10, { data: f2, error: g2 } = await dy(this.fetch, "POST", b10, { headers: this.headers, body: { phone: c10, type: d10, gotrue_meta_security: { captcha_token: null == e2 ? void 0 : e2.captchaToken } } });
              return { data: { user: null, session: null, messageId: null == f2 ? void 0 : f2.message_id }, error: g2 };
            }
            throw new cZ("You must provide either an email or phone number and a type");
          } catch (a11) {
            if (cT(a11)) return { data: { user: null, session: null }, error: a11 };
            throw a11;
          }
        }
        async getSession() {
          return await this.initializePromise, await this._acquireLock(-1, async () => this._useSession(async (a10) => a10));
        }
        async _acquireLock(a10, b10) {
          this._debug("#_acquireLock", "begin", a10);
          try {
            if (this.lockAcquired) {
              let a11 = this.pendingInLock.length ? this.pendingInLock[this.pendingInLock.length - 1] : Promise.resolve(), c10 = (async () => (await a11, await b10()))();
              return this.pendingInLock.push((async () => {
                try {
                  await c10;
                } catch (a12) {
                }
              })()), c10;
            }
            return await this.lock(`lock:${this.storageKey}`, a10, async () => {
              this._debug("#_acquireLock", "lock acquired for storage key", this.storageKey);
              try {
                this.lockAcquired = true;
                let a11 = b10();
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
            let b10 = await this.__loadSession();
            return await a10(b10);
          } finally {
            this._debug("#_useSession", "end");
          }
        }
        async __loadSession() {
          this._debug("#__loadSession()", "begin"), this.lockAcquired || this._debug("#__loadSession()", "used outside of an acquired lock!", Error().stack);
          try {
            let a10 = null, b10 = await df(this.storage, this.storageKey);
            if (this._debug("#getSession()", "session from storage", b10), null !== b10 && (this._isValidSession(b10) ? a10 = b10 : (this._debug("#getSession()", "session from storage is not valid"), await this._removeSession())), !a10) return { data: { session: null }, error: null };
            let c10 = !!a10.expires_at && 1e3 * a10.expires_at - Date.now() < 9e4;
            if (this._debug("#__loadSession()", `session has${c10 ? "" : " not"} expired`, "expires_at", a10.expires_at), !c10) {
              if (this.userStorage) {
                let b11 = await df(this.userStorage, this.storageKey + "-user");
                (null == b11 ? void 0 : b11.user) ? a10.user = b11.user : a10.user = ds();
              }
              if (this.storage.isServer && a10.user) {
                let b11 = this.suppressGetSessionWarning;
                a10 = new Proxy(a10, { get: (a11, c11, d11) => (b11 || "user" !== c11 || (console.warn("Using the user object as returned from supabase.auth.getSession() or from some supabase.auth.onAuthStateChange() events could be insecure! This value comes directly from the storage medium (usually cookies on the server) and may not be authentic. Use supabase.auth.getUser() instead which authenticates the data by contacting the Supabase Auth server."), b11 = true, this.suppressGetSessionWarning = true), Reflect.get(a11, c11, d11)) });
              }
              return { data: { session: a10 }, error: null };
            }
            let { session: d10, error: e2 } = await this._callRefreshToken(a10.refresh_token);
            if (e2) return { data: { session: null }, error: e2 };
            return { data: { session: d10 }, error: null };
          } finally {
            this._debug("#__loadSession()", "end");
          }
        }
        async getUser(a10) {
          return a10 ? await this._getUser(a10) : (await this.initializePromise, await this._acquireLock(-1, async () => await this._getUser()));
        }
        async _getUser(a10) {
          try {
            if (a10) return await dy(this.fetch, "GET", `${this.url}/user`, { headers: this.headers, jwt: a10, xform: dC });
            return await this._useSession(async (a11) => {
              var b10, c10, d10;
              let { data: e2, error: f2 } = a11;
              if (f2) throw f2;
              return (null == (b10 = e2.session) ? void 0 : b10.access_token) || this.hasCustomAuthorizationHeader ? await dy(this.fetch, "GET", `${this.url}/user`, { headers: this.headers, jwt: null != (d10 = null == (c10 = e2.session) ? void 0 : c10.access_token) ? d10 : void 0, xform: dC }) : { data: { user: null }, error: new cX() };
            });
          } catch (a11) {
            if (cT(a11)) return cT(a11) && "AuthSessionMissingError" === a11.name && (await this._removeSession(), await dg(this.storage, `${this.storageKey}-code-verifier`)), { data: { user: null }, error: a11 };
            throw a11;
          }
        }
        async updateUser(a10, b10 = {}) {
          return await this.initializePromise, await this._acquireLock(-1, async () => await this._updateUser(a10, b10));
        }
        async _updateUser(a10, b10 = {}) {
          try {
            return await this._useSession(async (c10) => {
              let { data: d10, error: e2 } = c10;
              if (e2) throw e2;
              if (!d10.session) throw new cX();
              let f2 = d10.session, g2 = null, h2 = null;
              "pkce" === this.flowType && null != a10.email && ([g2, h2] = await dn(this.storage, this.storageKey));
              let { data: i2, error: j2 } = await dy(this.fetch, "PUT", `${this.url}/user`, { headers: this.headers, redirectTo: null == b10 ? void 0 : b10.emailRedirectTo, body: Object.assign(Object.assign({}, a10), { code_challenge: g2, code_challenge_method: h2 }), jwt: f2.access_token, xform: dC });
              if (j2) throw j2;
              return f2.user = i2.user, await this._saveSession(f2), await this._notifyAllSubscribers("USER_UPDATED", f2), { data: { user: f2.user }, error: null };
            });
          } catch (a11) {
            if (cT(a11)) return { data: { user: null }, error: a11 };
            throw a11;
          }
        }
        async setSession(a10) {
          return await this.initializePromise, await this._acquireLock(-1, async () => await this._setSession(a10));
        }
        async _setSession(a10) {
          try {
            if (!a10.access_token || !a10.refresh_token) throw new cX();
            let b10 = Date.now() / 1e3, c10 = b10, d10 = true, e2 = null, { payload: f2 } = di(a10.access_token);
            if (f2.exp && (d10 = (c10 = f2.exp) <= b10), d10) {
              let { session: b11, error: c11 } = await this._callRefreshToken(a10.refresh_token);
              if (c11) return { data: { user: null, session: null }, error: c11 };
              if (!b11) return { data: { user: null, session: null }, error: null };
              e2 = b11;
            } else {
              let { data: d11, error: f3 } = await this._getUser(a10.access_token);
              if (f3) throw f3;
              e2 = { access_token: a10.access_token, refresh_token: a10.refresh_token, user: d11.user, token_type: "bearer", expires_in: c10 - b10, expires_at: c10 }, await this._saveSession(e2), await this._notifyAllSubscribers("SIGNED_IN", e2);
            }
            return { data: { user: e2.user, session: e2 }, error: null };
          } catch (a11) {
            if (cT(a11)) return { data: { session: null, user: null }, error: a11 };
            throw a11;
          }
        }
        async refreshSession(a10) {
          return await this.initializePromise, await this._acquireLock(-1, async () => await this._refreshSession(a10));
        }
        async _refreshSession(a10) {
          try {
            return await this._useSession(async (b10) => {
              var c10;
              if (!a10) {
                let { data: d11, error: e3 } = b10;
                if (e3) throw e3;
                a10 = null != (c10 = d11.session) ? c10 : void 0;
              }
              if (!(null == a10 ? void 0 : a10.refresh_token)) throw new cX();
              let { session: d10, error: e2 } = await this._callRefreshToken(a10.refresh_token);
              return e2 ? { data: { user: null, session: null }, error: e2 } : d10 ? { data: { user: d10.user, session: d10 }, error: null } : { data: { user: null, session: null }, error: null };
            });
          } catch (a11) {
            if (cT(a11)) return { data: { user: null, session: null }, error: a11 };
            throw a11;
          }
        }
        async _getSessionFromURL(a10, b10) {
          try {
            if (!da()) throw new c$("No browser detected.");
            if (a10.error || a10.error_description || a10.error_code) throw new c$(a10.error_description || "Error in URL with unspecified error_description", { error: a10.error || "unspecified_error", code: a10.error_code || "unspecified_code" });
            switch (b10) {
              case "implicit":
                if ("pkce" === this.flowType) throw new c_("Not a valid PKCE flow url.");
                break;
              case "pkce":
                if ("implicit" === this.flowType) throw new c$("Not a valid implicit grant flow url.");
            }
            if ("pkce" === b10) {
              if (this._debug("#_initialize()", "begin", "is PKCE flow", true), !a10.code) throw new c_("No code detected.");
              let { data: b11, error: c11 } = await this._exchangeCodeForSession(a10.code);
              if (c11) throw c11;
              let d11 = new URL(window.location.href);
              return d11.searchParams.delete("code"), window.history.replaceState(window.history.state, "", d11.toString()), { data: { session: b11.session, redirectType: null }, error: null };
            }
            let { provider_token: c10, provider_refresh_token: d10, access_token: e2, refresh_token: f2, expires_in: g2, expires_at: h2, token_type: i2 } = a10;
            if (!e2 || !g2 || !f2 || !i2) throw new c$("No session defined in URL");
            let j2 = Math.round(Date.now() / 1e3), k2 = parseInt(g2), l2 = j2 + k2;
            h2 && (l2 = parseInt(h2));
            let m2 = l2 - j2;
            1e3 * m2 <= 3e4 && console.warn(`@supabase/gotrue-js: Session as retrieved from URL expires in ${m2}s, should have been closer to ${k2}s`);
            let n2 = l2 - k2;
            j2 - n2 >= 120 ? console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued over 120s ago, URL could be stale", n2, l2, j2) : j2 - n2 < 0 && console.warn("@supabase/gotrue-js: Session as retrieved from URL was issued in the future? Check the device clock for skew", n2, l2, j2);
            let { data: o2, error: p2 } = await this._getUser(e2);
            if (p2) throw p2;
            let q2 = { provider_token: c10, provider_refresh_token: d10, access_token: e2, expires_in: k2, expires_at: l2, refresh_token: f2, token_type: i2, user: o2.user };
            return window.location.hash = "", this._debug("#_getSessionFromURL()", "clearing window.location.hash"), { data: { session: q2, redirectType: a10.type }, error: null };
          } catch (a11) {
            if (cT(a11)) return { data: { session: null, redirectType: null }, error: a11 };
            throw a11;
          }
        }
        _isImplicitGrantCallback(a10) {
          return !!(a10.access_token || a10.error_description);
        }
        async _isPKCECallback(a10) {
          let b10 = await df(this.storage, `${this.storageKey}-code-verifier`);
          return !!(a10.code && b10);
        }
        async signOut(a10 = { scope: "global" }) {
          return await this.initializePromise, await this._acquireLock(-1, async () => await this._signOut(a10));
        }
        async _signOut({ scope: a10 } = { scope: "global" }) {
          return await this._useSession(async (b10) => {
            var c10;
            let { data: d10, error: e2 } = b10;
            if (e2) return { error: e2 };
            let f2 = null == (c10 = d10.session) ? void 0 : c10.access_token;
            if (f2) {
              let { error: b11 } = await this.admin.signOut(f2, a10);
              if (b11 && !(cT(b11) && "AuthApiError" === b11.name && (404 === b11.status || 401 === b11.status || 403 === b11.status))) return { error: b11 };
            }
            return "others" !== a10 && (await this._removeSession(), await dg(this.storage, `${this.storageKey}-code-verifier`)), { error: null };
          });
        }
        onAuthStateChange(a10) {
          let b10 = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(a11) {
            let b11 = 16 * Math.random() | 0;
            return ("x" == a11 ? b11 : 3 & b11 | 8).toString(16);
          }), c10 = { id: b10, callback: a10, unsubscribe: () => {
            this._debug("#unsubscribe()", "state change callback with id removed", b10), this.stateChangeEmitters.delete(b10);
          } };
          return this._debug("#onAuthStateChange()", "registered callback with id", b10), this.stateChangeEmitters.set(b10, c10), (async () => {
            await this.initializePromise, await this._acquireLock(-1, async () => {
              this._emitInitialSession(b10);
            });
          })(), { data: { subscription: c10 } };
        }
        async _emitInitialSession(a10) {
          return await this._useSession(async (b10) => {
            var c10, d10;
            try {
              let { data: { session: d11 }, error: e2 } = b10;
              if (e2) throw e2;
              await (null == (c10 = this.stateChangeEmitters.get(a10)) ? void 0 : c10.callback("INITIAL_SESSION", d11)), this._debug("INITIAL_SESSION", "callback id", a10, "session", d11);
            } catch (b11) {
              await (null == (d10 = this.stateChangeEmitters.get(a10)) ? void 0 : d10.callback("INITIAL_SESSION", null)), this._debug("INITIAL_SESSION", "callback id", a10, "error", b11), console.error(b11);
            }
          });
        }
        async resetPasswordForEmail(a10, b10 = {}) {
          let c10 = null, d10 = null;
          "pkce" === this.flowType && ([c10, d10] = await dn(this.storage, this.storageKey, true));
          try {
            return await dy(this.fetch, "POST", `${this.url}/recover`, { body: { email: a10, code_challenge: c10, code_challenge_method: d10, gotrue_meta_security: { captcha_token: b10.captchaToken } }, headers: this.headers, redirectTo: b10.redirectTo });
          } catch (a11) {
            if (cT(a11)) return { data: null, error: a11 };
            throw a11;
          }
        }
        async getUserIdentities() {
          var a10;
          try {
            let { data: b10, error: c10 } = await this.getUser();
            if (c10) throw c10;
            return { data: { identities: null != (a10 = b10.user.identities) ? a10 : [] }, error: null };
          } catch (a11) {
            if (cT(a11)) return { data: null, error: a11 };
            throw a11;
          }
        }
        async linkIdentity(a10) {
          var b10;
          try {
            let { data: c10, error: d10 } = await this._useSession(async (b11) => {
              var c11, d11, e2, f2, g2;
              let { data: h2, error: i2 } = b11;
              if (i2) throw i2;
              let j2 = await this._getUrlForProvider(`${this.url}/user/identities/authorize`, a10.provider, { redirectTo: null == (c11 = a10.options) ? void 0 : c11.redirectTo, scopes: null == (d11 = a10.options) ? void 0 : d11.scopes, queryParams: null == (e2 = a10.options) ? void 0 : e2.queryParams, skipBrowserRedirect: true });
              return await dy(this.fetch, "GET", j2, { headers: this.headers, jwt: null != (g2 = null == (f2 = h2.session) ? void 0 : f2.access_token) ? g2 : void 0 });
            });
            if (d10) throw d10;
            return !da() || (null == (b10 = a10.options) ? void 0 : b10.skipBrowserRedirect) || window.location.assign(null == c10 ? void 0 : c10.url), { data: { provider: a10.provider, url: null == c10 ? void 0 : c10.url }, error: null };
          } catch (b11) {
            if (cT(b11)) return { data: { provider: a10.provider, url: null }, error: b11 };
            throw b11;
          }
        }
        async unlinkIdentity(a10) {
          try {
            return await this._useSession(async (b10) => {
              var c10, d10;
              let { data: e2, error: f2 } = b10;
              if (f2) throw f2;
              return await dy(this.fetch, "DELETE", `${this.url}/user/identities/${a10.identity_id}`, { headers: this.headers, jwt: null != (d10 = null == (c10 = e2.session) ? void 0 : c10.access_token) ? d10 : void 0 });
            });
          } catch (a11) {
            if (cT(a11)) return { data: null, error: a11 };
            throw a11;
          }
        }
        async _refreshAccessToken(a10) {
          let b10 = `#_refreshAccessToken(${a10.substring(0, 5)}...)`;
          this._debug(b10, "begin");
          try {
            var c10, d10;
            let e2 = Date.now();
            return await (c10 = async (c11) => (c11 > 0 && await dj(200 * Math.pow(2, c11 - 1)), this._debug(b10, "refreshing attempt", c11), await dy(this.fetch, "POST", `${this.url}/token?grant_type=refresh_token`, { body: { refresh_token: a10 }, headers: this.headers, xform: dA })), d10 = (a11, b11) => {
              let c11 = 200 * Math.pow(2, a11);
              return b11 && c1(b11) && Date.now() + c11 - e2 < 3e4;
            }, new Promise((a11, b11) => {
              (async () => {
                for (let e3 = 0; e3 < 1 / 0; e3++) try {
                  let b12 = await c10(e3);
                  if (!d10(e3, null, b12)) return void a11(b12);
                } catch (a12) {
                  if (!d10(e3, a12)) return void b11(a12);
                }
              })();
            }));
          } catch (a11) {
            if (this._debug(b10, "error", a11), cT(a11)) return { data: { session: null, user: null }, error: a11 };
            throw a11;
          } finally {
            this._debug(b10, "end");
          }
        }
        _isValidSession(a10) {
          return "object" == typeof a10 && null !== a10 && "access_token" in a10 && "refresh_token" in a10 && "expires_at" in a10;
        }
        async _handleProviderSignIn(a10, b10) {
          let c10 = await this._getUrlForProvider(`${this.url}/authorize`, a10, { redirectTo: b10.redirectTo, scopes: b10.scopes, queryParams: b10.queryParams });
          return this._debug("#_handleProviderSignIn()", "provider", a10, "options", b10, "url", c10), da() && !b10.skipBrowserRedirect && window.location.assign(c10), { data: { provider: a10, url: c10 }, error: null };
        }
        async _recoverAndRefresh() {
          var a10, b10;
          let c10 = "#_recoverAndRefresh()";
          this._debug(c10, "begin");
          try {
            let d10 = await df(this.storage, this.storageKey);
            if (d10 && this.userStorage) {
              let b11 = await df(this.userStorage, this.storageKey + "-user");
              !this.storage.isServer && Object.is(this.storage, this.userStorage) && !b11 && (b11 = { user: d10.user }, await de(this.userStorage, this.storageKey + "-user", b11)), d10.user = null != (a10 = null == b11 ? void 0 : b11.user) ? a10 : ds();
            } else if (d10 && !d10.user && !d10.user) {
              let a11 = await df(this.storage, this.storageKey + "-user");
              a11 && (null == a11 ? void 0 : a11.user) ? (d10.user = a11.user, await dg(this.storage, this.storageKey + "-user"), await de(this.storage, this.storageKey, d10)) : d10.user = ds();
            }
            if (this._debug(c10, "session from storage", d10), !this._isValidSession(d10)) {
              this._debug(c10, "session is not valid"), null !== d10 && await this._removeSession();
              return;
            }
            let e2 = (null != (b10 = d10.expires_at) ? b10 : 1 / 0) * 1e3 - Date.now() < 9e4;
            if (this._debug(c10, `session has${e2 ? "" : " not"} expired with margin of 90000s`), e2) {
              if (this.autoRefreshToken && d10.refresh_token) {
                let { error: a11 } = await this._callRefreshToken(d10.refresh_token);
                a11 && (console.error(a11), c1(a11) || (this._debug(c10, "refresh failed with a non-retryable error, removing the session", a11), await this._removeSession()));
              }
            } else if (d10.user && true === d10.user.__isUserNotAvailableProxy) try {
              let { data: a11, error: b11 } = await this._getUser(d10.access_token);
              !b11 && (null == a11 ? void 0 : a11.user) ? (d10.user = a11.user, await this._saveSession(d10), await this._notifyAllSubscribers("SIGNED_IN", d10)) : this._debug(c10, "could not get user data, skipping SIGNED_IN notification");
            } catch (a11) {
              console.error("Error getting user data:", a11), this._debug(c10, "error getting user data, skipping SIGNED_IN notification", a11);
            }
            else await this._notifyAllSubscribers("SIGNED_IN", d10);
          } catch (a11) {
            this._debug(c10, "error", a11), console.error(a11);
            return;
          } finally {
            this._debug(c10, "end");
          }
        }
        async _callRefreshToken(a10) {
          var b10, c10;
          if (!a10) throw new cX();
          if (this.refreshingDeferred) return this.refreshingDeferred.promise;
          let d10 = `#_callRefreshToken(${a10.substring(0, 5)}...)`;
          this._debug(d10, "begin");
          try {
            this.refreshingDeferred = new dh();
            let { data: b11, error: c11 } = await this._refreshAccessToken(a10);
            if (c11) throw c11;
            if (!b11.session) throw new cX();
            await this._saveSession(b11.session), await this._notifyAllSubscribers("TOKEN_REFRESHED", b11.session);
            let d11 = { session: b11.session, error: null };
            return this.refreshingDeferred.resolve(d11), d11;
          } catch (a11) {
            if (this._debug(d10, "error", a11), cT(a11)) {
              let c11 = { session: null, error: a11 };
              return c1(a11) || await this._removeSession(), null == (b10 = this.refreshingDeferred) || b10.resolve(c11), c11;
            }
            throw null == (c10 = this.refreshingDeferred) || c10.reject(a11), a11;
          } finally {
            this.refreshingDeferred = null, this._debug(d10, "end");
          }
        }
        async _notifyAllSubscribers(a10, b10, c10 = true) {
          let d10 = `#_notifyAllSubscribers(${a10})`;
          this._debug(d10, "begin", b10, `broadcast = ${c10}`);
          try {
            this.broadcastChannel && c10 && this.broadcastChannel.postMessage({ event: a10, session: b10 });
            let d11 = [], e2 = Array.from(this.stateChangeEmitters.values()).map(async (c11) => {
              try {
                await c11.callback(a10, b10);
              } catch (a11) {
                d11.push(a11);
              }
            });
            if (await Promise.all(e2), d11.length > 0) {
              for (let a11 = 0; a11 < d11.length; a11 += 1) console.error(d11[a11]);
              throw d11[0];
            }
          } finally {
            this._debug(d10, "end");
          }
        }
        async _saveSession(a10) {
          this._debug("#_saveSession()", a10), this.suppressGetSessionWarning = true;
          let b10 = Object.assign({}, a10), c10 = b10.user && true === b10.user.__isUserNotAvailableProxy;
          if (this.userStorage) {
            !c10 && b10.user && await de(this.userStorage, this.storageKey + "-user", { user: b10.user });
            let a11 = Object.assign({}, b10);
            delete a11.user;
            let d10 = dt(a11);
            await de(this.storage, this.storageKey, d10);
          } else {
            let a11 = dt(b10);
            await de(this.storage, this.storageKey, a11);
          }
        }
        async _removeSession() {
          this._debug("#_removeSession()"), await dg(this.storage, this.storageKey), await dg(this.storage, this.storageKey + "-code-verifier"), await dg(this.storage, this.storageKey + "-user"), this.userStorage && await dg(this.userStorage, this.storageKey + "-user"), await this._notifyAllSubscribers("SIGNED_OUT", null);
        }
        _removeVisibilityChangedCallback() {
          this._debug("#_removeVisibilityChangedCallback()");
          let a10 = this.visibilityChangedCallback;
          this.visibilityChangedCallback = null;
          try {
            a10 && da() && (null == window ? void 0 : window.removeEventListener) && window.removeEventListener("visibilitychange", a10);
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
                  return await this._useSession(async (b10) => {
                    let { data: { session: c10 } } = b10;
                    if (!c10 || !c10.refresh_token || !c10.expires_at) return void this._debug("#_autoRefreshTokenTick()", "no session");
                    let d10 = Math.floor((1e3 * c10.expires_at - a10) / 3e4);
                    this._debug("#_autoRefreshTokenTick()", `access token expires in ${d10} ticks, a tick lasts 30000ms, refresh threshold is 3 ticks`), d10 <= 3 && await this._callRefreshToken(c10.refresh_token);
                  });
                } catch (a11) {
                  console.error("Auto refresh tick failed with error. This is likely a transient error.", a11);
                }
              } finally {
                this._debug("#_autoRefreshTokenTick()", "end");
              }
            });
          } catch (a10) {
            if (a10.isAcquireTimeout || a10 instanceof dL) this._debug("auto refresh token tick lock not available");
            else throw a10;
          }
        }
        async _handleVisibilityChange() {
          if (this._debug("#_handleVisibilityChange()"), !da() || !(null == window ? void 0 : window.addEventListener)) return this.autoRefreshToken && this.startAutoRefresh(), false;
          try {
            this.visibilityChangedCallback = async () => await this._onVisibilityChanged(false), null == window || window.addEventListener("visibilitychange", this.visibilityChangedCallback), await this._onVisibilityChanged(true);
          } catch (a10) {
            console.error("_handleVisibilityChange", a10);
          }
        }
        async _onVisibilityChanged(a10) {
          let b10 = `#_onVisibilityChanged(${a10})`;
          this._debug(b10, "visibilityState", document.visibilityState), "visible" === document.visibilityState ? (this.autoRefreshToken && this._startAutoRefresh(), a10 || (await this.initializePromise, await this._acquireLock(-1, async () => {
            if ("visible" !== document.visibilityState) return void this._debug(b10, "acquired the lock to recover the session, but the browser visibilityState is no longer visible, aborting");
            await this._recoverAndRefresh();
          }))) : "hidden" === document.visibilityState && this.autoRefreshToken && this._stopAutoRefresh();
        }
        async _getUrlForProvider(a10, b10, c10) {
          let d10 = [`provider=${encodeURIComponent(b10)}`];
          if ((null == c10 ? void 0 : c10.redirectTo) && d10.push(`redirect_to=${encodeURIComponent(c10.redirectTo)}`), (null == c10 ? void 0 : c10.scopes) && d10.push(`scopes=${encodeURIComponent(c10.scopes)}`), "pkce" === this.flowType) {
            let [a11, b11] = await dn(this.storage, this.storageKey), c11 = new URLSearchParams({ code_challenge: `${encodeURIComponent(a11)}`, code_challenge_method: `${encodeURIComponent(b11)}` });
            d10.push(c11.toString());
          }
          if (null == c10 ? void 0 : c10.queryParams) {
            let a11 = new URLSearchParams(c10.queryParams);
            d10.push(a11.toString());
          }
          return (null == c10 ? void 0 : c10.skipBrowserRedirect) && d10.push(`skip_http_redirect=${c10.skipBrowserRedirect}`), `${a10}?${d10.join("&")}`;
        }
        async _unenroll(a10) {
          try {
            return await this._useSession(async (b10) => {
              var c10;
              let { data: d10, error: e2 } = b10;
              return e2 ? { data: null, error: e2 } : await dy(this.fetch, "DELETE", `${this.url}/factors/${a10.factorId}`, { headers: this.headers, jwt: null == (c10 = null == d10 ? void 0 : d10.session) ? void 0 : c10.access_token });
            });
          } catch (a11) {
            if (cT(a11)) return { data: null, error: a11 };
            throw a11;
          }
        }
        async _enroll(a10) {
          try {
            return await this._useSession(async (b10) => {
              var c10, d10;
              let { data: e2, error: f2 } = b10;
              if (f2) return { data: null, error: f2 };
              let g2 = Object.assign({ friendly_name: a10.friendlyName, factor_type: a10.factorType }, "phone" === a10.factorType ? { phone: a10.phone } : { issuer: a10.issuer }), { data: h2, error: i2 } = await dy(this.fetch, "POST", `${this.url}/factors`, { body: g2, headers: this.headers, jwt: null == (c10 = null == e2 ? void 0 : e2.session) ? void 0 : c10.access_token });
              return i2 ? { data: null, error: i2 } : ("totp" === a10.factorType && (null == (d10 = null == h2 ? void 0 : h2.totp) ? void 0 : d10.qr_code) && (h2.totp.qr_code = `data:image/svg+xml;utf-8,${h2.totp.qr_code}`), { data: h2, error: null });
            });
          } catch (a11) {
            if (cT(a11)) return { data: null, error: a11 };
            throw a11;
          }
        }
        async _verify(a10) {
          return this._acquireLock(-1, async () => {
            try {
              return await this._useSession(async (b10) => {
                var c10;
                let { data: d10, error: e2 } = b10;
                if (e2) return { data: null, error: e2 };
                let { data: f2, error: g2 } = await dy(this.fetch, "POST", `${this.url}/factors/${a10.factorId}/verify`, { body: { code: a10.code, challenge_id: a10.challengeId }, headers: this.headers, jwt: null == (c10 = null == d10 ? void 0 : d10.session) ? void 0 : c10.access_token });
                return g2 ? { data: null, error: g2 } : (await this._saveSession(Object.assign({ expires_at: Math.round(Date.now() / 1e3) + f2.expires_in }, f2)), await this._notifyAllSubscribers("MFA_CHALLENGE_VERIFIED", f2), { data: f2, error: g2 });
              });
            } catch (a11) {
              if (cT(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        async _challenge(a10) {
          return this._acquireLock(-1, async () => {
            try {
              return await this._useSession(async (b10) => {
                var c10;
                let { data: d10, error: e2 } = b10;
                return e2 ? { data: null, error: e2 } : await dy(this.fetch, "POST", `${this.url}/factors/${a10.factorId}/challenge`, { body: { channel: a10.channel }, headers: this.headers, jwt: null == (c10 = null == d10 ? void 0 : d10.session) ? void 0 : c10.access_token });
              });
            } catch (a11) {
              if (cT(a11)) return { data: null, error: a11 };
              throw a11;
            }
          });
        }
        async _challengeAndVerify(a10) {
          let { data: b10, error: c10 } = await this._challenge({ factorId: a10.factorId });
          return c10 ? { data: null, error: c10 } : await this._verify({ factorId: a10.factorId, challengeId: b10.id, code: a10.code });
        }
        async _listFactors() {
          let { data: { user: a10 }, error: b10 } = await this.getUser();
          if (b10) return { data: null, error: b10 };
          let c10 = (null == a10 ? void 0 : a10.factors) || [], d10 = c10.filter((a11) => "totp" === a11.factor_type && "verified" === a11.status), e2 = c10.filter((a11) => "phone" === a11.factor_type && "verified" === a11.status);
          return { data: { all: c10, totp: d10, phone: e2 }, error: null };
        }
        async _getAuthenticatorAssuranceLevel() {
          return this._acquireLock(-1, async () => await this._useSession(async (a10) => {
            var b10, c10;
            let { data: { session: d10 }, error: e2 } = a10;
            if (e2) return { data: null, error: e2 };
            if (!d10) return { data: { currentLevel: null, nextLevel: null, currentAuthenticationMethods: [] }, error: null };
            let { payload: f2 } = di(d10.access_token), g2 = null;
            f2.aal && (g2 = f2.aal);
            let h2 = g2;
            return (null != (c10 = null == (b10 = d10.user.factors) ? void 0 : b10.filter((a11) => "verified" === a11.status)) ? c10 : []).length > 0 && (h2 = "aal2"), { data: { currentLevel: g2, nextLevel: h2, currentAuthenticationMethods: f2.amr || [] }, error: null };
          }));
        }
        async fetchJwk(a10, b10 = { keys: [] }) {
          let c10 = b10.keys.find((b11) => b11.kid === a10);
          if (c10) return c10;
          let d10 = Date.now();
          if ((c10 = this.jwks.keys.find((b11) => b11.kid === a10)) && this.jwks_cached_at + 6e5 > d10) return c10;
          let { data: e2, error: f2 } = await dy(this.fetch, "GET", `${this.url}/.well-known/jwks.json`, { headers: this.headers });
          if (f2) throw f2;
          return e2.keys && 0 !== e2.keys.length && (this.jwks = e2, this.jwks_cached_at = d10, c10 = e2.keys.find((b11) => b11.kid === a10)) ? c10 : null;
        }
        async getClaims(a10, b10 = {}) {
          try {
            let c10 = a10;
            if (!c10) {
              let { data: a11, error: b11 } = await this.getSession();
              if (b11 || !a11.session) return { data: null, error: b11 };
              c10 = a11.session.access_token;
            }
            let { header: d10, payload: e2, signature: f2, raw: { header: g2, payload: h2 } } = di(c10);
            (null == b10 ? void 0 : b10.allowExpired) || function(a11) {
              if (!a11) throw Error("Missing exp claim");
              if (a11 <= Math.floor(Date.now() / 1e3)) throw Error("JWT has expired");
            }(e2.exp);
            let i2 = !d10.alg || d10.alg.startsWith("HS") || !d10.kid || !("crypto" in globalThis && "subtle" in globalThis.crypto) ? null : await this.fetchJwk(d10.kid, (null == b10 ? void 0 : b10.keys) ? { keys: b10.keys } : null == b10 ? void 0 : b10.jwks);
            if (!i2) {
              let { error: a11 } = await this.getUser(c10);
              if (a11) throw a11;
              return { data: { claims: e2, header: d10, signature: f2 }, error: null };
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
            }(d10.alg), k2 = await crypto.subtle.importKey("jwk", i2, j2, true, ["verify"]);
            if (!await crypto.subtle.verify(j2, k2, f2, function(a11) {
              let b11 = [];
              return !function(a12, b12) {
                for (let c11 = 0; c11 < a12.length; c11 += 1) {
                  let d11 = a12.charCodeAt(c11);
                  if (d11 > 55295 && d11 <= 56319) {
                    let b13 = (d11 - 55296) * 1024 & 65535;
                    d11 = (a12.charCodeAt(c11 + 1) - 56320 & 65535 | b13) + 65536, c11 += 1;
                  }
                  !function(a13, b13) {
                    if (a13 <= 127) return b13(a13);
                    if (a13 <= 2047) {
                      b13(192 | a13 >> 6), b13(128 | 63 & a13);
                      return;
                    }
                    if (a13 <= 65535) {
                      b13(224 | a13 >> 12), b13(128 | a13 >> 6 & 63), b13(128 | 63 & a13);
                      return;
                    }
                    if (a13 <= 1114111) {
                      b13(240 | a13 >> 18), b13(128 | a13 >> 12 & 63), b13(128 | a13 >> 6 & 63), b13(128 | 63 & a13);
                      return;
                    }
                    throw Error(`Unrecognized Unicode codepoint: ${a13.toString(16)}`);
                  }(d11, b12);
                }
              }(a11, (a12) => b11.push(a12)), new Uint8Array(b11);
            }(`${g2}.${h2}`))) throw new c3("Invalid JWT signature");
            return { data: { claims: e2, header: d10, signature: f2 }, error: null };
          } catch (a11) {
            if (cT(a11)) return { data: null, error: a11 };
            throw a11;
          }
        }
      }
      dR.nextInstanceID = 0;
      let dS = dR;
      class dT extends dS {
        constructor(a10) {
          super(a10);
        }
      }
      class dU {
        constructor(a10, b10, c10) {
          var d10, e2, f2;
          this.supabaseUrl = a10, this.supabaseKey = b10;
          let g2 = function(a11) {
            let b11 = null == a11 ? void 0 : a11.trim();
            if (!b11) throw Error("supabaseUrl is required.");
            if (!b11.match(/^https?:\/\//i)) throw Error("Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL.");
            try {
              return new URL(b11.endsWith("/") ? b11 : b11 + "/");
            } catch (a12) {
              throw Error("Invalid supabaseUrl: Provided URL is malformed.");
            }
          }(a10);
          if (!b10) throw Error("supabaseKey is required.");
          this.realtimeUrl = new URL("realtime/v1", g2), this.realtimeUrl.protocol = this.realtimeUrl.protocol.replace("http", "ws"), this.authUrl = new URL("auth/v1", g2), this.storageUrl = new URL("storage/v1", g2), this.functionsUrl = new URL("functions/v1", g2);
          let h2 = `sb-${g2.hostname.split(".")[0]}-auth-token`, i2 = function(a11, b11) {
            var c11, d11;
            let { db: e3, auth: f3, realtime: g3, global: h3 } = a11, { db: i3, auth: j2, realtime: k2, global: l2 } = b11, m2 = { db: Object.assign(Object.assign({}, i3), e3), auth: Object.assign(Object.assign({}, j2), f3), realtime: Object.assign(Object.assign({}, k2), g3), storage: {}, global: Object.assign(Object.assign(Object.assign({}, l2), h3), { headers: Object.assign(Object.assign({}, null != (c11 = null == l2 ? void 0 : l2.headers) ? c11 : {}), null != (d11 = null == h3 ? void 0 : h3.headers) ? d11 : {}) }), accessToken: () => {
              var a12, b12, c12, d12;
              return a12 = this, b12 = void 0, d12 = function* () {
                return "";
              }, new (c12 = void 0, c12 = Promise)(function(e4, f4) {
                function g4(a13) {
                  try {
                    i4(d12.next(a13));
                  } catch (a14) {
                    f4(a14);
                  }
                }
                function h4(a13) {
                  try {
                    i4(d12.throw(a13));
                  } catch (a14) {
                    f4(a14);
                  }
                }
                function i4(a13) {
                  var b13;
                  a13.done ? e4(a13.value) : ((b13 = a13.value) instanceof c12 ? b13 : new c12(function(a14) {
                    a14(b13);
                  })).then(g4, h4);
                }
                i4((d12 = d12.apply(a12, b12 || [])).next());
              });
            } };
            return a11.accessToken ? m2.accessToken = a11.accessToken : delete m2.accessToken, m2;
          }(null != c10 ? c10 : {}, { db: cJ, realtime: cL, auth: Object.assign(Object.assign({}, cK), { storageKey: h2 }), global: cI });
          this.storageKey = null != (d10 = i2.auth.storageKey) ? d10 : "", this.headers = null != (e2 = i2.global.headers) ? e2 : {}, i2.accessToken ? (this.accessToken = i2.accessToken, this.auth = new Proxy({}, { get: (a11, b11) => {
            throw Error(`@supabase/supabase-js: Supabase Client is configured with the accessToken option, accessing supabase.auth.${String(b11)} is not possible`);
          } })) : this.auth = this._initSupabaseAuthClient(null != (f2 = i2.auth) ? f2 : {}, this.headers, i2.global.fetch), this.fetch = ((a11, b11, c11) => {
            let d11 = ((a12) => {
              let b12;
              return b12 = a12 || ("undefined" == typeof fetch ? cM.default : fetch), (...a13) => b12(...a13);
            })(c11), e3 = "undefined" == typeof Headers ? cM.Headers : Headers;
            return (c12, f3) => function(a12, b12, c13, d12) {
              return new (c13 || (c13 = Promise))(function(e4, f4) {
                function g3(a13) {
                  try {
                    i3(d12.next(a13));
                  } catch (a14) {
                    f4(a14);
                  }
                }
                function h3(a13) {
                  try {
                    i3(d12.throw(a13));
                  } catch (a14) {
                    f4(a14);
                  }
                }
                function i3(a13) {
                  var b13;
                  a13.done ? e4(a13.value) : ((b13 = a13.value) instanceof c13 ? b13 : new c13(function(a14) {
                    a14(b13);
                  })).then(g3, h3);
                }
                i3((d12 = d12.apply(a12, b12 || [])).next());
              });
            }(void 0, void 0, void 0, function* () {
              var g3;
              let h3 = null != (g3 = yield b11()) ? g3 : a11, i3 = new e3(null == f3 ? void 0 : f3.headers);
              return i3.has("apikey") || i3.set("apikey", a11), i3.has("Authorization") || i3.set("Authorization", `Bearer ${h3}`), d11(c12, Object.assign(Object.assign({}, f3), { headers: i3 }));
            });
          })(b10, this._getAccessToken.bind(this), i2.global.fetch), this.realtime = this._initRealtimeClient(Object.assign({ headers: this.headers, accessToken: this._getAccessToken.bind(this) }, i2.realtime)), this.rest = new bW(new URL("rest/v1", g2).href, { headers: this.headers, schema: i2.db.schema, fetch: this.fetch }), this.storage = new cG(this.storageUrl.href, this.headers, this.fetch, null == c10 ? void 0 : c10.storage), i2.accessToken || this._listenForAuthEvents();
        }
        get functions() {
          return new bV(this.functionsUrl.href, { headers: this.headers, customFetch: this.fetch });
        }
        from(a10) {
          return this.rest.from(a10);
        }
        schema(a10) {
          return this.rest.schema(a10);
        }
        rpc(a10, b10 = {}, c10 = {}) {
          return this.rest.rpc(a10, b10, c10);
        }
        channel(a10, b10 = { config: {} }) {
          return this.realtime.channel(a10, b10);
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
          var a10, b10, c10, d10, e2, f2;
          return c10 = this, d10 = void 0, e2 = void 0, f2 = function* () {
            if (this.accessToken) return yield this.accessToken();
            let { data: c11 } = yield this.auth.getSession();
            return null != (b10 = null == (a10 = c11.session) ? void 0 : a10.access_token) ? b10 : this.supabaseKey;
          }, new (e2 || (e2 = Promise))(function(a11, b11) {
            function g2(a12) {
              try {
                i2(f2.next(a12));
              } catch (a13) {
                b11(a13);
              }
            }
            function h2(a12) {
              try {
                i2(f2.throw(a12));
              } catch (a13) {
                b11(a13);
              }
            }
            function i2(b12) {
              var c11;
              b12.done ? a11(b12.value) : ((c11 = b12.value) instanceof e2 ? c11 : new e2(function(a12) {
                a12(c11);
              })).then(g2, h2);
            }
            i2((f2 = f2.apply(c10, d10 || [])).next());
          });
        }
        _initSupabaseAuthClient({ autoRefreshToken: a10, persistSession: b10, detectSessionInUrl: c10, storage: d10, userStorage: e2, storageKey: f2, flowType: g2, lock: h2, debug: i2 }, j2, k2) {
          let l2 = { Authorization: `Bearer ${this.supabaseKey}`, apikey: `${this.supabaseKey}` };
          return new dT({ url: this.authUrl.href, headers: Object.assign(Object.assign({}, l2), j2), storageKey: f2, autoRefreshToken: a10, persistSession: b10, detectSessionInUrl: c10, storage: d10, userStorage: e2, flowType: g2, lock: h2, debug: i2, fetch: k2, hasCustomAuthorizationHeader: Object.keys(this.headers).some((a11) => "authorization" === a11.toLowerCase()) });
        }
        _initRealtimeClient(a10) {
          return new ck(this.realtimeUrl.href, Object.assign(Object.assign({}, a10), { params: Object.assign({ apikey: this.supabaseKey }, null == a10 ? void 0 : a10.params) }));
        }
        _listenForAuthEvents() {
          return this.auth.onAuthStateChange((a10, b10) => {
            this._handleTokenChanged(a10, "CLIENT", null == b10 ? void 0 : b10.access_token);
          });
        }
        _handleTokenChanged(a10, b10, c10) {
          ("TOKEN_REFRESHED" === a10 || "SIGNED_IN" === a10) && this.changedAccessToken !== c10 ? this.changedAccessToken = c10 : "SIGNED_OUT" === a10 && (this.realtime.setAuth(), "STORAGE" == b10 && this.auth.signOut(), this.changedAccessToken = void 0);
        }
      }
      let dV = (a10, b10, c10) => new dU(a10, b10, c10);
      (function() {
        if ("undefined" != typeof window || "undefined" == typeof process) return false;
        let a10 = process.version;
        if (null == a10) return false;
        let b10 = a10.match(/^v(\d+)\./);
        return !!b10 && 18 >= parseInt(b10[1], 10);
      })() && console.warn(`\u26A0\uFE0F  Node.js 18 and below are deprecated and will no longer be supported in future versions of @supabase/supabase-js. Please upgrade to Node.js 20 or later. For more information, visit: https://github.com/orgs/supabase/discussions/37217`);
      let dW = { fatal: 0, error: 0, warn: 1, log: 2, info: 3, success: 3, fail: 3, debug: 4, trace: 5, verbose: 1 / 0 }, dX = { silent: { level: -1 }, fatal: { level: dW.fatal }, error: { level: dW.error }, warn: { level: dW.warn }, log: { level: dW.log }, info: { level: dW.info }, success: { level: dW.success }, fail: { level: dW.fail }, ready: { level: dW.info }, start: { level: dW.info }, box: { level: dW.info }, debug: { level: dW.debug }, trace: { level: dW.trace }, verbose: { level: dW.verbose } };
      function dY(a10) {
        if (null === a10 || "object" != typeof a10) return false;
        let b10 = Object.getPrototypeOf(a10);
        return (null === b10 || b10 === Object.prototype || null === Object.getPrototypeOf(b10)) && !(Symbol.iterator in a10) && (!(Symbol.toStringTag in a10) || "[object Module]" === Object.prototype.toString.call(a10));
      }
      let dZ = false, d$ = [];
      class d_ {
        options;
        _lastLog;
        _mockFn;
        constructor(a10 = {}) {
          let b10 = a10.types || dX;
          for (let c10 in this.options = ((...a11) => a11.reduce((a12, b11) => function a13(b12, c11, d10 = ".", e2) {
            if (!dY(c11)) return a13(b12, {}, d10, e2);
            let f2 = Object.assign({}, c11);
            for (let c12 in b12) {
              if ("__proto__" === c12 || "constructor" === c12) continue;
              let g2 = b12[c12];
              null != g2 && (e2 && e2(f2, c12, g2, d10) || (Array.isArray(g2) && Array.isArray(f2[c12]) ? f2[c12] = [...g2, ...f2[c12]] : dY(g2) && dY(f2[c12]) ? f2[c12] = a13(g2, f2[c12], (d10 ? `${d10}.` : "") + c12.toString(), e2) : f2[c12] = g2));
            }
            return f2;
          }(a12, b11, "", void 0), {}))({ ...a10, defaults: { ...a10.defaults }, level: d0(a10.level, b10), reporters: [...a10.reporters || []] }, { types: dX, throttle: 1e3, throttleMin: 5, formatOptions: { date: true, colors: false, compact: true } }), b10) {
            let a11 = { type: c10, ...this.options.defaults, ...b10[c10] };
            this[c10] = this._wrapLogFn(a11), this[c10].raw = this._wrapLogFn(a11, true);
          }
          this.options.mockFn && this.mockTypes(), this._lastLog = {};
        }
        get level() {
          return this.options.level;
        }
        set level(a10) {
          this.options.level = d0(a10, this.options.types, this.options.level);
        }
        prompt(a10, b10) {
          if (!this.options.prompt) throw Error("prompt is not supported!");
          return this.options.prompt(a10, b10);
        }
        create(a10) {
          let b10 = new d_({ ...this.options, ...a10 });
          return this._mockFn && b10.mockTypes(this._mockFn), b10;
        }
        withDefaults(a10) {
          return this.create({ ...this.options, defaults: { ...this.options.defaults, ...a10 } });
        }
        withTag(a10) {
          return this.withDefaults({ tag: this.options.defaults.tag ? this.options.defaults.tag + ":" + a10 : a10 });
        }
        addReporter(a10) {
          return this.options.reporters.push(a10), this;
        }
        removeReporter(a10) {
          if (a10) {
            let b10 = this.options.reporters.indexOf(a10);
            if (-1 !== b10) return this.options.reporters.splice(b10, 1);
          } else this.options.reporters.splice(0);
          return this;
        }
        setReporters(a10) {
          return this.options.reporters = Array.isArray(a10) ? a10 : [a10], this;
        }
        wrapAll() {
          this.wrapConsole(), this.wrapStd();
        }
        restoreAll() {
          this.restoreConsole(), this.restoreStd();
        }
        wrapConsole() {
          for (let a10 in this.options.types) console["__" + a10] || (console["__" + a10] = console[a10]), console[a10] = this[a10].raw;
        }
        restoreConsole() {
          for (let a10 in this.options.types) console["__" + a10] && (console[a10] = console["__" + a10], delete console["__" + a10]);
        }
        wrapStd() {
          this._wrapStream(this.options.stdout, "log"), this._wrapStream(this.options.stderr, "log");
        }
        _wrapStream(a10, b10) {
          a10 && (a10.__write || (a10.__write = a10.write), a10.write = (a11) => {
            this[b10].raw(String(a11).trim());
          });
        }
        restoreStd() {
          this._restoreStream(this.options.stdout), this._restoreStream(this.options.stderr);
        }
        _restoreStream(a10) {
          a10 && a10.__write && (a10.write = a10.__write, delete a10.__write);
        }
        pauseLogs() {
          dZ = true;
        }
        resumeLogs() {
          for (let a10 of (dZ = false, d$.splice(0))) a10[0]._logFn(a10[1], a10[2]);
        }
        mockTypes(a10) {
          let b10 = a10 || this.options.mockFn;
          if (this._mockFn = b10, "function" == typeof b10) for (let a11 in this.options.types) this[a11] = b10(a11, this.options.types[a11]) || this[a11], this[a11].raw = this[a11];
        }
        _wrapLogFn(a10, b10) {
          return (...c10) => dZ ? void d$.push([this, a10, c10, b10]) : this._logFn(a10, c10, b10);
        }
        _logFn(a10, b10, c10) {
          var d10, e2;
          if ((a10.level || 0) > this.level) return false;
          let f2 = { date: /* @__PURE__ */ new Date(), args: [], ...a10, level: d0(a10.level, this.options.types) };
          c10 || 1 !== b10.length || +(e2 = d10 = b10[0], "[object Object]" !== Object.prototype.toString.call(e2) || !d10.message && !d10.args || !!d10.stack) ? f2.args = [...b10] : Object.assign(f2, b10[0]), f2.message && (f2.args.unshift(f2.message), delete f2.message), f2.additional && (Array.isArray(f2.additional) || (f2.additional = f2.additional.split("\n")), f2.args.push("\n" + f2.additional.join("\n")), delete f2.additional), f2.type = "string" == typeof f2.type ? f2.type.toLowerCase() : "log", f2.tag = "string" == typeof f2.tag ? f2.tag : "";
          let g2 = (a11 = false) => {
            let b11 = (this._lastLog.count || 0) - this.options.throttleMin;
            if (this._lastLog.object && b11 > 0) {
              let a12 = [...this._lastLog.object.args];
              b11 > 1 && a12.push(`(repeated ${b11} times)`), this._log({ ...this._lastLog.object, args: a12 }), this._lastLog.count = 1;
            }
            a11 && (this._lastLog.object = f2, this._log(f2));
          };
          clearTimeout(this._lastLog.timeout);
          let h2 = this._lastLog.time && f2.date ? f2.date.getTime() - this._lastLog.time.getTime() : 0;
          if (this._lastLog.time = f2.date, h2 < this.options.throttle) try {
            let a11 = JSON.stringify([f2.type, f2.tag, f2.args]), b11 = this._lastLog.serialized === a11;
            if (this._lastLog.serialized = a11, b11 && (this._lastLog.count = (this._lastLog.count || 0) + 1, this._lastLog.count > this.options.throttleMin)) {
              this._lastLog.timeout = setTimeout(g2, this.options.throttle);
              return;
            }
          } catch {
          }
          g2(true);
        }
        _log(a10) {
          for (let b10 of this.options.reporters) b10.log(a10, { options: this.options });
        }
      }
      function d0(a10, b10 = {}, c10 = 3) {
        return void 0 === a10 ? c10 : "number" == typeof a10 ? a10 : b10[a10] && void 0 !== b10[a10].level ? b10[a10].level : c10;
      }
      d_.prototype.add = d_.prototype.addReporter, d_.prototype.remove = d_.prototype.removeReporter, d_.prototype.clear = d_.prototype.removeReporter, d_.prototype.withScope = d_.prototype.withTag, d_.prototype.mock = d_.prototype.mockTypes, d_.prototype.pause = d_.prototype.pauseLogs, d_.prototype.resume = d_.prototype.resumeLogs;
      class d1 {
        options;
        defaultColor;
        levelColorMap;
        typeColorMap;
        constructor(a10) {
          this.options = { ...a10 }, this.defaultColor = "#7f8c8d", this.levelColorMap = { 0: "#c0392b", 1: "#f39c12", 3: "#00BCD4" }, this.typeColorMap = { success: "#2ecc71" };
        }
        _getLogFn(a10) {
          return a10 < 1 ? console.__error || console.error : 1 === a10 ? console.__warn || console.warn : console.__log || console.log;
        }
        log(a10) {
          let b10 = this._getLogFn(a10.level), c10 = "log" === a10.type ? "" : a10.type, d10 = a10.tag || "", e2 = this.typeColorMap[a10.type] || this.levelColorMap[a10.level] || this.defaultColor, f2 = `
      background: ${e2};
      border-radius: 0.5em;
      color: white;
      font-weight: bold;
      padding: 2px 0.5em;
    `, g2 = `%c${[d10, c10].filter(Boolean).join(":")}`;
          "string" == typeof a10.args[0] ? b10(`${g2}%c ${a10.args[0]}`, f2, "", ...a10.args.slice(1)) : b10(g2, f2, ...a10.args);
        }
      }
      let d2 = function(a10 = {}) {
        return function(a11 = {}) {
          return new d_(a11);
        }({ reporters: a10.reporters || [new d1({})], prompt: (a11, b10 = {}) => "confirm" === b10.type ? Promise.resolve(confirm(a11)) : Promise.resolve(prompt(a11)), ...a10 });
      }(), d3 = { ERROR: "error", WARN: "warn", INFO: "info", DEBUG: "debug" }, d4 = [d3.ERROR, d3.WARN, d3.INFO, d3.DEBUG], d5 = "undefined" != typeof process ? process : void 0, d6 = d5?.env?.LOG_LEVEL, d7 = d5?.env?.NODE_ENV ?? "development", d8 = function() {
        let a10 = d6?.toLowerCase();
        if (a10) {
          let b10 = d4.find((b11) => b11 === a10);
          if (b10) return b10;
        }
        return "production" === d7 ? d3.INFO : d3.DEBUG;
      }();
      class d9 {
        constructor(a10, b10 = {}, c10 = d8) {
          this.instance = a10, this.context = b10;
          let d10 = d4.includes(c10) ? c10 : d8;
          this.minLevel = d10, this.thresholdIndex = d4.indexOf(d10);
        }
        error(a10, ...b10) {
          this.log(d3.ERROR, a10, b10);
        }
        warn(a10, ...b10) {
          this.log(d3.WARN, a10, b10);
        }
        info(a10, ...b10) {
          this.log(d3.INFO, a10, b10);
        }
        debug(a10, ...b10) {
          this.log(d3.DEBUG, a10, b10);
        }
        child(a10) {
          let b10 = { ...this.context, ...a10 };
          return new d9(this.instance, b10, this.minLevel);
        }
        log(a10, b10, c10) {
          if (!this.shouldLog(a10)) return;
          let d10 = this.prepareParts(b10, c10);
          switch (a10) {
            case d3.ERROR:
              this.instance.error(...d10);
              break;
            case d3.WARN:
              this.instance.warn(...d10);
              break;
            case d3.DEBUG:
              this.instance.debug(...d10);
              break;
            default:
              this.instance.info(...d10);
          }
        }
        shouldLog(a10) {
          return d4.indexOf(a10) <= this.thresholdIndex;
        }
        prepareParts(a10, b10) {
          let c10 = [a10], [d10, ...e2] = b10, f2 = null, g2 = [];
          if ("object" != typeof d10 || null === d10 || Array.isArray(d10) ? void 0 !== d10 && g2.push(d10) : f2 = { ...d10 }, g2.push(...e2), Object.keys(this.context).length > 0 && (f2 = { ...f2 ?? {}, context: { ...this.context } }), f2 && c10.push(f2), g2.length > 0) {
            let a11 = g2.map((a12) => "symbol" == typeof a12 ? a12.toString() : a12);
            c10.push(...a11);
          }
          return c10;
        }
      }
      let ea = new d9(d2), eb = "undefined" != typeof process ? process : null;
      class ec {
        static {
          this.DEFAULT_RETRY_CONFIG = { maxRetries: 3, initialDelay: 1e3, backoffMultiplier: 2, maxDelay: 1e4 };
        }
        static {
          this.FALLBACK_CONSTRAINTS = [{ video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 }, facingMode: "user" }, audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } }, { video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 24 } }, audio: { echoCancellation: true } }, { video: { width: { max: 320 }, height: { max: 240 } }, audio: true }, { video: false, audio: true }];
        }
        static async getUserMediaWithRetry(a10 = {}) {
          let b10 = { ...this.DEFAULT_RETRY_CONFIG, ...a10 };
          for (let a11 of this.FALLBACK_CONSTRAINTS) try {
            ea.info("\u{1F3A5} Intentando getUserMedia con:", a11);
            let c10 = await this.attemptGetUserMedia(a11, b10);
            return ea.info("\u2705 getUserMedia exitoso:", { video: c10.getVideoTracks().length > 0, audio: c10.getAudioTracks().length > 0, videoTrack: c10.getVideoTracks()[0]?.getSettings(), audioTrack: c10.getAudioTracks()[0]?.getSettings() }), c10;
          } catch (b11) {
            ea.warn("\u26A0\uFE0F getUserMedia fall\xF3 con constraints:", a11, b11);
            continue;
          }
          throw Error("No se pudo acceder a c\xE1mara/micr\xF3fono con ninguna configuraci\xF3n");
        }
        static async attemptGetUserMedia(a10, b10) {
          let c10 = null;
          for (let d10 = 0; d10 <= b10.maxRetries; d10++) try {
            return await navigator.mediaDevices.getUserMedia(a10);
          } catch (a11) {
            if (c10 = a11, a11 instanceof DOMException && ("NotAllowedError" === a11.name || "NotFoundError" === a11.name)) throw a11;
            if (d10 < b10.maxRetries) {
              let a12 = Math.min(b10.initialDelay * Math.pow(b10.backoffMultiplier, d10), b10.maxDelay);
              ea.info(`\u{1F504} Reintentando getUserMedia en ${a12}ms (intento ${d10 + 1}/${b10.maxRetries})`), await this.delay(a12);
            }
          }
          throw c10 || Error("getUserMedia fall\xF3 despu\xE9s de todos los reintentos");
        }
        static setupICEConnectionMonitoring(a10, b10) {
          let c10 = null, d10 = false, e2 = () => {
            let e3 = a10.iceConnectionState;
            switch (ea.info("\u{1F517} ICE Connection State:", e3), c10 && (clearTimeout(c10), c10 = null), e3) {
              case "connected":
              case "completed":
                ea.info("\u2705 Conexi\xF3n WebRTC establecida"), d10 = false;
                break;
              case "disconnected":
                ea.warn("\u26A0\uFE0F Conexi\xF3n WebRTC desconectada, esperando reconexi\xF3n..."), c10 = setTimeout(() => {
                  "disconnected" !== a10.iceConnectionState || d10 || (ea.info("\u{1F504} Iniciando reconexi\xF3n WebRTC..."), d10 = true, b10?.());
                }, 5e3);
                break;
              case "failed":
                ea.error("\u274C Conexi\xF3n WebRTC fall\xF3"), d10 || (d10 = true, b10?.());
                break;
              case "closed":
                ea.info("\u{1F510} Conexi\xF3n WebRTC cerrada");
            }
          };
          return a10.addEventListener("iceconnectionstatechange", e2), () => {
            a10.removeEventListener("iceconnectionstatechange", e2), c10 && clearTimeout(c10);
          };
        }
        static async getConnectionStats(a10) {
          let b10 = await a10.getStats(), c10 = 0, d10 = 0, e2 = 0, f2 = 0;
          return b10.forEach((a11) => {
            "inbound-rtp" === a11.type && (c10 += a11.bytesReceived || 0, e2 += a11.packetsReceived || 0), "outbound-rtp" === a11.type && (d10 += a11.bytesSent || 0, f2 += a11.packetsSent || 0);
          }), { bytesReceived: c10, bytesSent: d10, packetsReceived: e2, packetsSent: f2, connectionState: a10.connectionState, iceConnectionState: a10.iceConnectionState, timestamp: Date.now() };
        }
        static async testICEServers(a10) {
          try {
            let b10 = new RTCPeerConnection({ iceServers: a10 });
            return b10.createDataChannel("test"), await b10.createOffer(), new Promise((a11) => {
              let c10 = false;
              b10.onicecandidate = (d10) => {
                d10.candidate ? (ea.info("\u{1F9CA} ICE Candidate encontrado:", d10.candidate.candidate), c10 = true) : (ea.info("\u{1F9CA} ICE gathering completado, v\xE1lido:", c10), b10.close(), a11(c10));
              }, setTimeout(() => {
                ea.info("\u23F0 Timeout en test ICE servers"), b10.close(), a11(false);
              }, 1e4);
            });
          } catch (a11) {
            return ea.error("\u274C Error testing ICE servers:", a11), false;
          }
        }
        static createICEServers() {
          let a10 = [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }], b10 = process.env.NEXT_PUBLIC_TURN_URLS, c10 = process.env.NEXT_PUBLIC_TURN_USERNAME, d10 = process.env.NEXT_PUBLIC_TURN_CREDENTIAL;
          return b10 && c10 && d10 && a10.push({ urls: b10.split(","), username: c10, credential: d10 }), a10;
        }
        static diagnoseGetUserMediaError(a10) {
          if (a10 instanceof DOMException) switch (a10.name) {
            case "NotAllowedError":
              return "Permisos de c\xE1mara/micr\xF3fono denegados. Por favor, habilita los permisos en tu navegador.";
            case "NotFoundError":
              return "No se encontr\xF3 c\xE1mara o micr\xF3fono. Verifica que los dispositivos est\xE9n conectados.";
            case "NotReadableError":
              return "C\xE1mara o micr\xF3fono en uso por otra aplicaci\xF3n. Cierra otras apps que puedan estar us\xE1ndolos.";
            case "OverconstrainedError":
              return "La configuraci\xF3n solicitada no es compatible con tu dispositivo.";
            case "NotSupportedError":
              return "Tu navegador no soporta acceso a c\xE1mara/micr\xF3fono.";
            case "AbortError":
              return "Acceso a c\xE1mara/micr\xF3fono fue cancelado.";
            default:
              return `Error de c\xE1mara/micr\xF3fono: ${a10.message}`;
          }
          return `Error desconocido: ${a10.message}`;
        }
        static async diagnose() {
          ea.info("\u{1F50D} Starting WebRTC diagnostics...");
          let a10 = await navigator.mediaDevices.enumerateDevices();
          ea.info("\u{1F4F1} Available devices:", a10.map((a11) => ({ kind: a11.kind, label: a11.label || "Unknown device", deviceId: a11.deviceId.substring(0, 8) + "..." })));
          let b10 = { camera: await this.checkPermission("camera"), microphone: await this.checkPermission("microphone") };
          return ea.info("\u{1F510} Permissions:", b10), { devices: a10, permissions: b10, capabilities: { video: null, audio: null } };
        }
        static async checkPermission(a10) {
          try {
            return (await navigator.permissions.query({ name: a10 })).state;
          } catch {
            return "prompt";
          }
        }
        static delay(a10) {
          return new Promise((b10) => setTimeout(b10, a10));
        }
      }
      dV("https://ewpsepaieakqbywxnidu.supabase.co", "sb_publishable_Koq4PaA5lOihpU6m4UoiqA_pdi0rZsk");
      let ed = ["/auth/login", "/auth/register", "/auth/select-role", "/auth/forgot-password", "/auth/reset-password", "/auth/callback", "/api"];
      async function ee(a10) {
        var b10;
        let c10 = new URL(a10.url);
        if ("auth.autamedica.com" !== c10.hostname && "localhost" !== c10.hostname && eb?.env?.NODE_ENV === "production") return c10.hostname = "auth.autamedica.com", ab.redirect(c10, 301);
        let d10 = ab.next();
        if (b10 = c10.pathname, !ed.some((a11) => b10.startsWith(a11))) try {
          let b11 = function(a11, b12, c11) {
            if (!a11 || !b12) throw Error(`Your project's URL and Key are required to create a Supabase client!

Check your Supabase project's API settings to find these values

https://supabase.com/dashboard/project/_/settings/api`);
            let { storage: d11, getAll: e4, setAll: f3, setItems: g3, removedItems: h2 } = function(a12, b13) {
              let c12, d12, e5 = a12.cookies ?? null, f4 = a12.cookieEncoding, g4 = {}, h3 = {};
              if (e5) if ("get" in e5) {
                let a13 = async (a14) => {
                  let b14 = a14.flatMap((a15) => [a15, ...Array.from({ length: 5 }).map((b15, c14) => `${a15}.${c14}`)]), c13 = [];
                  for (let a15 = 0; a15 < b14.length; a15 += 1) {
                    let d13 = await e5.get(b14[a15]);
                    (d13 || "string" == typeof d13) && c13.push({ name: b14[a15], value: d13 });
                  }
                  return c13;
                };
                if (c12 = async (b14) => await a13(b14), "set" in e5 && "remove" in e5) d12 = async (a14) => {
                  for (let b14 = 0; b14 < a14.length; b14 += 1) {
                    let { name: c13, value: d13, options: f5 } = a14[b14];
                    d13 ? await e5.set(c13, d13, f5) : await e5.remove(c13, f5);
                  }
                };
                else if (b13) d12 = async () => {
                  console.warn("@supabase/ssr: createServerClient was configured without set and remove cookie methods, but the client needs to set cookies. This can lead to issues such as random logouts, early session termination or increased token refresh requests. If in NextJS, check your middleware.ts file, route handlers and server actions for correctness. Consider switching to the getAll and setAll cookie methods instead of get, set and remove which are deprecated and can be difficult to use correctly.");
                };
                else throw Error("@supabase/ssr: createBrowserClient requires configuring a getAll and setAll cookie method (deprecated: alternatively both get, set and remove can be used)");
              } else if ("getAll" in e5) if (c12 = async () => await e5.getAll(), "setAll" in e5) d12 = e5.setAll;
              else if (b13) d12 = async () => {
                console.warn("@supabase/ssr: createServerClient was configured without the setAll cookie method, but the client needs to set cookies. This can lead to issues such as random logouts, early session termination or increased token refresh requests. If in NextJS, check your middleware.ts file, route handlers and server actions for correctness.");
              };
              else throw Error("@supabase/ssr: createBrowserClient requires configuring both getAll and setAll cookie methods (deprecated: alternatively both get, set and remove can be used)");
              else throw Error(`@supabase/ssr: ${b13 ? "createServerClient" : "createBrowserClient"} requires configuring getAll and setAll cookie methods (deprecated: alternatively use get, set and remove).${bE() ? " As this is called in a browser runtime, consider removing the cookies option object to use the document.cookie API automatically." : ""}`);
              else if (!b13 && bE()) c12 = () => (() => {
                let a13 = (0, bD.q)(document.cookie);
                return Object.keys(a13).map((b14) => ({ name: b14, value: a13[b14] }));
              })(), d12 = (a13) => {
                a13.forEach(({ name: a14, value: b14, options: c13 }) => {
                  document.cookie = (0, bD.l)(a14, b14, c13);
                });
              };
              else if (b13) throw Error("@supabase/ssr: createServerClient must be initialized with cookie options that specify getAll and setAll functions (deprecated, not recommended: alternatively use get, set and remove)");
              else c12 = () => [], d12 = () => {
                throw Error("@supabase/ssr: createBrowserClient in non-browser runtimes (including Next.js pre-rendering mode) was not initialized cookie options that specify getAll and setAll functions (deprecated: alternatively use get, set and remove), but they were needed");
              };
              return b13 ? { getAll: c12, setAll: d12, setItems: g4, removedItems: h3, storage: { isServer: true, getItem: async (a13) => {
                if ("string" == typeof g4[a13]) return g4[a13];
                if (h3[a13]) return null;
                let b14 = await c12([a13]), d13 = await bJ(a13, async (a14) => {
                  let c13 = b14?.find(({ name: b15 }) => b15 === a14) || null;
                  return c13 ? c13.value : null;
                });
                if (!d13) return null;
                let e6 = d13;
                return "string" == typeof d13 && d13.startsWith(bP) && (e6 = bO(d13.substring(bP.length))), e6;
              }, setItem: async (b14, e6) => {
                b14.endsWith("-code-verifier") && await bQ({ getAll: c12, setAll: d12, setItems: { [b14]: e6 }, removedItems: {} }, { cookieOptions: a12?.cookieOptions ?? null, cookieEncoding: f4 }), g4[b14] = e6, delete h3[b14];
              }, removeItem: async (a13) => {
                delete g4[a13], h3[a13] = true;
              } } } : { getAll: c12, setAll: d12, setItems: g4, removedItems: h3, storage: { isServer: false, getItem: async (a13) => {
                let b14 = await c12([a13]), d13 = await bJ(a13, async (a14) => {
                  let c13 = b14?.find(({ name: b15 }) => b15 === a14) || null;
                  return c13 ? c13.value : null;
                });
                if (!d13) return null;
                let e6 = d13;
                return d13.startsWith(bP) && (e6 = bO(d13.substring(bP.length))), e6;
              }, setItem: async (b14, e6) => {
                let g5 = await c12([b14]), h4 = new Set((g5?.map(({ name: a13 }) => a13) || []).filter((a13) => bH(a13, b14))), i3 = e6;
                "base64url" === f4 && (i3 = bP + bN(e6));
                let j2 = bI(b14, i3);
                j2.forEach(({ name: a13 }) => {
                  h4.delete(a13);
                });
                let k2 = { ...bF, ...a12?.cookieOptions, maxAge: 0 }, l2 = { ...bF, ...a12?.cookieOptions, maxAge: bF.maxAge };
                delete k2.name, delete l2.name;
                let m2 = [...[...h4].map((a13) => ({ name: a13, value: "", options: k2 })), ...j2.map(({ name: a13, value: b15 }) => ({ name: a13, value: b15, options: l2 }))];
                m2.length > 0 && await d12(m2);
              }, removeItem: async (b14) => {
                let e6 = await c12([b14]), f5 = (e6?.map(({ name: a13 }) => a13) || []).filter((a13) => bH(a13, b14)), g5 = { ...bF, ...a12?.cookieOptions, maxAge: 0 };
                delete g5.name, f5.length > 0 && await d12(f5.map((a13) => ({ name: a13, value: "", options: g5 })));
              } } };
            }({ ...c11, cookieEncoding: c11?.cookieEncoding ?? "base64url" }, true), i2 = dV(a11, b12, { ...c11, global: { ...c11?.global, headers: { ...c11?.global?.headers, "X-Client-Info": "supabase-ssr/0.5.2" } }, auth: { ...c11?.cookieOptions?.name ? { storageKey: c11.cookieOptions.name } : null, ...c11?.auth, flowType: "pkce", autoRefreshToken: false, detectSessionInUrl: false, persistSession: true, storage: d11 } });
            return i2.auth.onAuthStateChange(async (a12) => {
              (Object.keys(g3).length > 0 || Object.keys(h2).length > 0) && ("SIGNED_IN" === a12 || "TOKEN_REFRESHED" === a12 || "USER_UPDATED" === a12 || "PASSWORD_RECOVERY" === a12 || "SIGNED_OUT" === a12 || "MFA_CHALLENGE_VERIFIED" === a12) && await bQ({ getAll: e4, setAll: f3, setItems: g3, removedItems: h2 }, { cookieOptions: c11?.cookieOptions ?? null, cookieEncoding: c11?.cookieEncoding ?? "base64url" });
            }), i2;
          }("https://ewpsepaieakqbywxnidu.supabase.co", "sb_publishable_Koq4PaA5lOihpU6m4UoiqA_pdi0rZsk", { cookies: { get: (b12) => a10.cookies.get(b12)?.value, set(b12, c11, e4) {
            a10.cookies.set({ name: b12, value: c11, ...e4 }), d10.cookies.set({ name: b12, value: c11, ...e4 });
          }, remove(b12, c11) {
            a10.cookies.set({ name: b12, value: "", ...c11, maxAge: 0 }), d10.cookies.set({ name: b12, value: "", ...c11, maxAge: 0 });
          } } }), { data: { session: e3 }, error: f2 } = await b11.auth.getSession();
          if (f2 || !e3) {
            let b12 = new URL("/auth/select-role", a10.url);
            return b12.searchParams.set("returnTo", c10.pathname), ab.redirect(b12);
          }
          let { error: g2 } = await b11.auth.refreshSession();
          if (g2) {
            let b12 = new URL("/auth/select-role", a10.url);
            return b12.searchParams.set("returnTo", c10.pathname), ab.redirect(b12);
          }
        } catch (d11) {
          let b11 = new URL("/auth/select-role", a10.url);
          return b11.searchParams.set("returnTo", c10.pathname), ab.redirect(b11);
        }
        let e2 = c10.pathname.startsWith("/api/");
        if (e2 || d10.headers.set("X-Frame-Options", "DENY"), d10.headers.set("X-Content-Type-Options", "nosniff"), d10.headers.set("Referrer-Policy", "strict-origin-when-cross-origin"), d10.headers.set("X-Auth-Hub", "true"), e2 || d10.headers.set("Content-Security-Policy", "frame-ancestors 'none'; connect-src 'self' https://*.autamedica.com https://*.supabase.co wss: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.autamedica.com; object-src 'none'; base-uri 'self'"), !e2) {
          let b11 = a10.headers.get("origin");
          b11 && ["https://autamedica.com", "https://www.autamedica.com", "https://patients.autamedica.com", "https://doctors.autamedica.com", "https://companies.autamedica.com", "http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003"].includes(b11) && (d10.headers.set("Access-Control-Allow-Origin", b11), d10.headers.set("Access-Control-Allow-Credentials", "true"), d10.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS"), d10.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With"));
        }
        return d10;
      }
      let ef = { matcher: ["/((?!_next/static|_next/image|favicon.ico|public|icon-).*)"] };
      Object.values({ NOT_FOUND: 404, FORBIDDEN: 403, UNAUTHORIZED: 401 });
      let eg = { ...q }, eh = eg.middleware || eg.default, ei = "/src/middleware";
      if ("function" != typeof eh) throw Object.defineProperty(Error(`The Middleware "${ei}" must export a \`middleware\` or a \`default\` function`), "__NEXT_ERROR_CODE", { value: "E120", enumerable: false, configurable: true });
      function ej(a10) {
        return bq({ ...a10, page: ei, handler: async (...a11) => {
          try {
            return await eh(...a11);
          } catch (e2) {
            let b10 = a11[0], c10 = new URL(b10.url), d10 = c10.pathname + c10.search;
            throw await u(e2, { path: d10, method: b10.method, headers: Object.fromEntries(b10.headers.entries()) }, { routerKind: "Pages Router", routePath: "/middleware", routeType: "middleware", revalidateReason: void 0 }), e2;
          }
        } });
      }
    }, 266: (a, b) => {
      "use strict";
      Symbol.for("react.transitional.element"), Symbol.for("react.portal"), Symbol.for("react.fragment"), Symbol.for("react.strict_mode"), Symbol.for("react.profiler"), Symbol.for("react.forward_ref"), Symbol.for("react.suspense"), Symbol.for("react.memo"), Symbol.for("react.lazy"), Symbol.iterator;
      Object.prototype.hasOwnProperty, Object.assign;
    }, 351: (a, b, c) => {
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
      let e = c(718), f = { url: (a2) => a2.url, header: (a2, b2) => a2.headers.get(b2) };
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
    }, 356: (a) => {
      "use strict";
      a.exports = (init_node_buffer(), __toCommonJS(node_buffer_exports));
    }, 374: (a, b, c) => {
      "use strict";
      Object.defineProperty(b, "__esModule", { value: true }), !function(a2, b2) {
        for (var c2 in b2) Object.defineProperty(a2, c2, { enumerable: true, get: b2[c2] });
      }(b, { interceptTestApis: function() {
        return f;
      }, wrapRequestHandler: function() {
        return g;
      } });
      let d = c(718), e = c(351);
      function f() {
        return (0, e.interceptFetch)(c.g.fetch);
      }
      function g(a2) {
        return (b2, c2) => (0, d.withRequest)(b2, e.reader, () => a2(b2, c2));
      }
    }, 401: (a, b) => {
      "use strict";
      Object.defineProperty(b, "__esModule", { value: true });
      class c extends Error {
        constructor(a2) {
          super(a2.message), this.name = "PostgrestError", this.details = a2.details, this.hint = a2.hint, this.code = a2.code;
        }
      }
      b.default = c;
    }, 465: (a, b) => {
      "use strict";
      b.q = function(a2, b2) {
        if ("string" != typeof a2) throw TypeError("argument str must be a string");
        var c2 = {}, e2 = a2.length;
        if (e2 < 2) return c2;
        var f2 = b2 && b2.decode || k, g2 = 0, h2 = 0, l = 0;
        do {
          if (-1 === (h2 = a2.indexOf("=", g2))) break;
          if (-1 === (l = a2.indexOf(";", g2))) l = e2;
          else if (h2 > l) {
            g2 = a2.lastIndexOf(";", h2 - 1) + 1;
            continue;
          }
          var m = i(a2, g2, h2), n = j(a2, h2, m), o = a2.slice(m, n);
          if (!d.call(c2, o)) {
            var p = i(a2, h2 + 1, l), q = j(a2, l, p);
            34 === a2.charCodeAt(p) && 34 === a2.charCodeAt(q - 1) && (p++, q--);
            var r = a2.slice(p, q);
            c2[o] = function(a3, b3) {
              try {
                return b3(a3);
              } catch (b4) {
                return a3;
              }
            }(r, f2);
          }
          g2 = l + 1;
        } while (g2 < e2);
        return c2;
      }, b.l = function(a2, b2, d2) {
        var i2 = d2 && d2.encode || encodeURIComponent;
        if ("function" != typeof i2) throw TypeError("option encode is invalid");
        if (!e.test(a2)) throw TypeError("argument name is invalid");
        var j2 = i2(b2);
        if (!f.test(j2)) throw TypeError("argument val is invalid");
        var k2 = a2 + "=" + j2;
        if (!d2) return k2;
        if (null != d2.maxAge) {
          var l = Math.floor(d2.maxAge);
          if (!isFinite(l)) throw TypeError("option maxAge is invalid");
          k2 += "; Max-Age=" + l;
        }
        if (d2.domain) {
          if (!g.test(d2.domain)) throw TypeError("option domain is invalid");
          k2 += "; Domain=" + d2.domain;
        }
        if (d2.path) {
          if (!h.test(d2.path)) throw TypeError("option path is invalid");
          k2 += "; Path=" + d2.path;
        }
        if (d2.expires) {
          var m, n = d2.expires;
          if (m = n, "[object Date]" !== c.call(m) || isNaN(n.valueOf())) throw TypeError("option expires is invalid");
          k2 += "; Expires=" + n.toUTCString();
        }
        if (d2.httpOnly && (k2 += "; HttpOnly"), d2.secure && (k2 += "; Secure"), d2.partitioned && (k2 += "; Partitioned"), d2.priority) switch ("string" == typeof d2.priority ? d2.priority.toLowerCase() : d2.priority) {
          case "low":
            k2 += "; Priority=Low";
            break;
          case "medium":
            k2 += "; Priority=Medium";
            break;
          case "high":
            k2 += "; Priority=High";
            break;
          default:
            throw TypeError("option priority is invalid");
        }
        if (d2.sameSite) switch ("string" == typeof d2.sameSite ? d2.sameSite.toLowerCase() : d2.sameSite) {
          case true:
          case "strict":
            k2 += "; SameSite=Strict";
            break;
          case "lax":
            k2 += "; SameSite=Lax";
            break;
          case "none":
            k2 += "; SameSite=None";
            break;
          default:
            throw TypeError("option sameSite is invalid");
        }
        return k2;
      };
      var c = Object.prototype.toString, d = Object.prototype.hasOwnProperty, e = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/, f = /^("?)[\u0021\u0023-\u002B\u002D-\u003A\u003C-\u005B\u005D-\u007E]*\1$/, g = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i, h = /^[\u0020-\u003A\u003D-\u007E]*$/;
      function i(a2, b2, c2) {
        do {
          var d2 = a2.charCodeAt(b2);
          if (32 !== d2 && 9 !== d2) return b2;
        } while (++b2 < c2);
        return c2;
      }
      function j(a2, b2, c2) {
        for (; b2 > c2; ) {
          var d2 = a2.charCodeAt(--b2);
          if (32 !== d2 && 9 !== d2) return b2 + 1;
        }
        return c2;
      }
      function k(a2) {
        return -1 !== a2.indexOf("%") ? decodeURIComponent(a2) : a2;
      }
    }, 484: (a, b, c) => {
      "use strict";
      a.exports = c(266);
    }, 487: (a, b, c) => {
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
    }, 506: (a, b, c) => {
      "use strict";
      c.r(b), c.d(b, { Headers: () => g, Request: () => h, Response: () => i, default: () => f, fetch: () => e });
      var d = function() {
        if ("undefined" != typeof self) return self;
        if ("undefined" != typeof window) return window;
        if (void 0 !== c.g) return c.g;
        throw Error("unable to locate global object");
      }();
      let e = d.fetch, f = d.fetch.bind(d), g = d.Headers, h = d.Request, i = d.Response;
    }, 518: function(a, b, c) {
      "use strict";
      var d = this && this.__importDefault || function(a2) {
        return a2 && a2.__esModule ? a2 : { default: a2 };
      };
      Object.defineProperty(b, "__esModule", { value: true });
      let e = d(c(784));
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
    }, 521: (a) => {
      "use strict";
      a.exports = (init_node_async_hooks(), __toCommonJS(node_async_hooks_exports));
    }, 533: (a) => {
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
    }, 698: function(a, b, c) {
      "use strict";
      var d = this && this.__importDefault || function(a2) {
        return a2 && a2.__esModule ? a2 : { default: a2 };
      };
      Object.defineProperty(b, "__esModule", { value: true });
      let e = d(c(506)), f = d(c(401));
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
    }, 718: (a, b, c) => {
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
    }, 784: function(a, b, c) {
      "use strict";
      var d = this && this.__importDefault || function(a2) {
        return a2 && a2.__esModule ? a2 : { default: a2 };
      };
      Object.defineProperty(b, "__esModule", { value: true });
      let e = d(c(82));
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
    }, 899: (a, b, c) => {
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
    }, 975: (a) => {
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
    } }, (a) => {
      var b = a(a.s = 253);
      (_ENTRIES = "undefined" == typeof _ENTRIES ? {} : _ENTRIES)["middleware_src/middleware"] = b;
    }]);
  }
});

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js
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
  "../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/core/edgeFunctionHandler.js"() {
    globalThis._ENTRIES = {};
    globalThis.self = globalThis;
    globalThis._ROUTES = [{ "name": "src/middleware", "page": "/", "regex": ["^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/((?!_next\\/static|_next\\/image|favicon.ico|public|icon-).*))(\\.json)?[\\/#\\?]?$"] }];
    require_edge_runtime_webpack();
    require_middleware();
  }
});

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/utils/promise.js
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

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/adapters/middleware.js
init_logger();

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/core/createGenericHandler.js
init_logger();

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/core/resolve.js
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

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/core/createGenericHandler.js
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

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/core/routing/util.js
import crypto2 from "node:crypto";
import { parse as parseQs, stringify as stringifyQs } from "node:querystring";
import { Readable as Readable2 } from "node:stream";

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/adapters/config/index.js
init_logger();
import path from "node:path";
globalThis.__dirname ??= "";
var NEXT_DIR = path.join(__dirname, ".next");
var OPEN_NEXT_DIR = path.join(__dirname, ".open-next");
debug({ NEXT_DIR, OPEN_NEXT_DIR });
var NextConfig = { "env": {}, "webpack": null, "eslint": { "ignoreDuringBuilds": true }, "typescript": { "ignoreBuildErrors": true, "tsconfigPath": "tsconfig.json" }, "typedRoutes": false, "distDir": ".next", "cleanDistDir": true, "assetPrefix": "", "cacheMaxMemorySize": 52428800, "configOrigin": "next.config.mjs", "useFileSystemPublicRoutes": true, "generateEtags": true, "pageExtensions": ["tsx", "ts", "jsx", "js"], "poweredByHeader": false, "compress": true, "images": { "deviceSizes": [640, 750, 828, 1080, 1200, 1920, 2048, 3840], "imageSizes": [16, 32, 48, 64, 96, 128, 256, 384], "path": "/_next/image", "loader": "default", "loaderFile": "", "domains": ["ewpsepaieakqbywxnidu.supabase.co"], "disableStaticImages": false, "minimumCacheTTL": 60, "formats": ["image/avif", "image/webp"], "dangerouslyAllowSVG": false, "contentSecurityPolicy": "script-src 'none'; frame-src 'none'; sandbox;", "contentDispositionType": "attachment", "remotePatterns": [], "unoptimized": true }, "devIndicators": { "position": "bottom-left" }, "onDemandEntries": { "maxInactiveAge": 6e4, "pagesBufferLength": 5 }, "amp": { "canonicalBase": "" }, "basePath": "", "sassOptions": {}, "trailingSlash": false, "i18n": null, "productionBrowserSourceMaps": false, "excludeDefaultMomentLocales": true, "serverRuntimeConfig": {}, "publicRuntimeConfig": {}, "reactProductionProfiling": false, "reactStrictMode": true, "reactMaxHeadersLength": 6e3, "httpAgentOptions": { "keepAlive": true }, "logging": {}, "compiler": { "removeConsole": { "exclude": ["error", "warn"] } }, "expireTime": 31536e3, "staticPageGenerationTimeout": 60, "output": "standalone", "modularizeImports": { "@mui/icons-material": { "transform": "@mui/icons-material/{{member}}" }, "lodash": { "transform": "lodash/{{member}}" } }, "outputFileTracingRoot": "/home/edu/Autamedica", "experimental": { "useSkewCookie": false, "cacheLife": { "default": { "stale": 300, "revalidate": 900, "expire": 4294967294 }, "seconds": { "stale": 30, "revalidate": 1, "expire": 60 }, "minutes": { "stale": 300, "revalidate": 60, "expire": 3600 }, "hours": { "stale": 300, "revalidate": 3600, "expire": 86400 }, "days": { "stale": 300, "revalidate": 86400, "expire": 604800 }, "weeks": { "stale": 300, "revalidate": 604800, "expire": 2592e3 }, "max": { "stale": 300, "revalidate": 2592e3, "expire": 4294967294 } }, "cacheHandlers": {}, "cssChunking": true, "multiZoneDraftMode": false, "appNavFailHandling": false, "prerenderEarlyExit": true, "serverMinification": true, "serverSourceMaps": false, "linkNoTouchStart": false, "caseSensitiveRoutes": false, "clientSegmentCache": false, "clientParamParsing": false, "dynamicOnHover": false, "preloadEntriesOnStart": true, "clientRouterFilter": true, "clientRouterFilterRedirects": false, "fetchCacheKeyPrefix": "", "middlewarePrefetch": "flexible", "optimisticClientCache": true, "manualClientBasePath": false, "cpus": 3, "memoryBasedWorkersCount": false, "imgOptConcurrency": null, "imgOptTimeoutInSeconds": 7, "imgOptMaxInputPixels": 268402689, "imgOptSequentialRead": null, "imgOptSkipMetadata": null, "isrFlushToDisk": true, "workerThreads": false, "optimizeCss": false, "nextScriptWorkers": false, "scrollRestoration": false, "externalDir": true, "disableOptimizedLoading": false, "gzipSize": true, "craCompat": false, "esmExternals": true, "fullySpecified": false, "swcTraceProfiling": false, "forceSwcTransforms": false, "largePageDataBytes": 128e3, "typedEnv": false, "parallelServerCompiles": false, "parallelServerBuildTraces": false, "ppr": false, "authInterrupts": false, "webpackMemoryOptimizations": false, "optimizeServerReact": true, "viewTransition": false, "routerBFCache": false, "removeUncaughtErrorAndRejectionListeners": false, "validateRSCRequestHeaders": false, "staleTimes": { "dynamic": 0, "static": 300 }, "serverComponentsHmrCache": true, "staticGenerationMaxConcurrency": 8, "staticGenerationMinPagesPerWorker": 25, "cacheComponents": false, "inlineCss": false, "useCache": false, "globalNotFound": false, "devtoolSegmentExplorer": true, "browserDebugInfoInTerminal": false, "optimizeRouterScrolling": false, "optimizePackageImports": ["lucide-react", "date-fns", "lodash-es", "ramda", "antd", "react-bootstrap", "ahooks", "@ant-design/icons", "@headlessui/react", "@headlessui-float/react", "@heroicons/react/20/solid", "@heroicons/react/24/solid", "@heroicons/react/24/outline", "@visx/visx", "@tremor/react", "rxjs", "@mui/material", "@mui/icons-material", "recharts", "react-use", "effect", "@effect/schema", "@effect/platform", "@effect/platform-node", "@effect/platform-browser", "@effect/platform-bun", "@effect/sql", "@effect/sql-mssql", "@effect/sql-mysql2", "@effect/sql-pg", "@effect/sql-sqlite-node", "@effect/sql-sqlite-bun", "@effect/sql-sqlite-wasm", "@effect/sql-sqlite-react-native", "@effect/rpc", "@effect/rpc-http", "@effect/typeclass", "@effect/experimental", "@effect/opentelemetry", "@material-ui/core", "@material-ui/icons", "@tabler/icons-react", "mui-core", "react-icons/ai", "react-icons/bi", "react-icons/bs", "react-icons/cg", "react-icons/ci", "react-icons/di", "react-icons/fa", "react-icons/fa6", "react-icons/fc", "react-icons/fi", "react-icons/gi", "react-icons/go", "react-icons/gr", "react-icons/hi", "react-icons/hi2", "react-icons/im", "react-icons/io", "react-icons/io5", "react-icons/lia", "react-icons/lib", "react-icons/lu", "react-icons/md", "react-icons/pi", "react-icons/ri", "react-icons/rx", "react-icons/si", "react-icons/sl", "react-icons/tb", "react-icons/tfi", "react-icons/ti", "react-icons/vsc", "react-icons/wi"], "trustHostHeader": false, "isExperimentalCompile": false }, "htmlLimitedBots": "[\\w-]+-Google|Google-[\\w-]+|Chrome-Lighthouse|Slurp|DuckDuckBot|baiduspider|yandex|sogou|bitlybot|tumblr|vkShare|quora link preview|redditbot|ia_archiver|Bingbot|BingPreview|applebot|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|Yeti|googleweblight", "bundlePagesRouterDependencies": false, "configFileName": "next.config.mjs", "transpilePackages": ["@autamedica/types", "@autamedica/shared", "@autamedica/auth"], "turbopack": { "root": "/home/edu/Autamedica" } };
var BuildId = "0rdgyjjYan0qh544gyh15";
var RoutesManifest = { "basePath": "", "rewrites": { "beforeFiles": [], "afterFiles": [], "fallback": [] }, "redirects": [{ "source": "/:path+/", "destination": "/:path+", "internal": true, "statusCode": 308, "regex": "^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))/$" }], "routes": { "static": [{ "page": "/", "regex": "^/(?:/)?$", "routeKeys": {}, "namedRegex": "^/(?:/)?$" }, { "page": "/_not-found", "regex": "^/_not\\-found(?:/)?$", "routeKeys": {}, "namedRegex": "^/_not\\-found(?:/)?$" }, { "page": "/auth/callback", "regex": "^/auth/callback(?:/)?$", "routeKeys": {}, "namedRegex": "^/auth/callback(?:/)?$" }, { "page": "/auth/forgot-password", "regex": "^/auth/forgot\\-password(?:/)?$", "routeKeys": {}, "namedRegex": "^/auth/forgot\\-password(?:/)?$" }, { "page": "/auth/login", "regex": "^/auth/login(?:/)?$", "routeKeys": {}, "namedRegex": "^/auth/login(?:/)?$" }, { "page": "/auth/register", "regex": "^/auth/register(?:/)?$", "routeKeys": {}, "namedRegex": "^/auth/register(?:/)?$" }, { "page": "/auth/reset-password", "regex": "^/auth/reset\\-password(?:/)?$", "routeKeys": {}, "namedRegex": "^/auth/reset\\-password(?:/)?$" }, { "page": "/auth/select-role", "regex": "^/auth/select\\-role(?:/)?$", "routeKeys": {}, "namedRegex": "^/auth/select\\-role(?:/)?$" }, { "page": "/login", "regex": "^/login(?:/)?$", "routeKeys": {}, "namedRegex": "^/login(?:/)?$" }, { "page": "/profile", "regex": "^/profile(?:/)?$", "routeKeys": {}, "namedRegex": "^/profile(?:/)?$" }, { "page": "/register", "regex": "^/register(?:/)?$", "routeKeys": {}, "namedRegex": "^/register(?:/)?$" }], "dynamic": [], "data": { "static": [], "dynamic": [] } }, "locales": [] };
var ConfigHeaders = [{ "source": "/api/(.*)", "headers": [{ "key": "X-Content-Type-Options", "value": "nosniff" }], "regex": "^/api(?:/(.*))(?:/)?$" }, { "source": "/((?!api).*)", "headers": [{ "key": "X-Frame-Options", "value": "SAMEORIGIN" }, { "key": "X-Content-Type-Options", "value": "nosniff" }, { "key": "X-XSS-Protection", "value": "1; mode=block" }, { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }, { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }, { "key": "Content-Security-Policy", "value": "frame-ancestors 'self' https://*.autamedica.com; connect-src 'self' https://*.autamedica.com https://*.supabase.co wss: https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.autamedica.com" }, { "key": "Access-Control-Allow-Origin", "value": "https://autamedica.com" }, { "key": "Access-Control-Allow-Credentials", "value": "true" }, { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }], "regex": "^(?:/((?!api).*))(?:/)?$" }];
var PrerenderManifest = { "version": 4, "routes": { "/_not-found": { "initialStatus": 404, "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/_not-found", "dataRoute": "/_not-found.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/auth/login": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/auth/login", "dataRoute": "/auth/login.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/auth/register": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/auth/register", "dataRoute": "/auth/register.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/auth/reset-password": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/auth/reset-password", "dataRoute": "/auth/reset-password.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/auth/forgot-password": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/auth/forgot-password", "dataRoute": "/auth/forgot-password.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/auth/select-role": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/auth/select-role", "dataRoute": "/auth/select-role.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/login": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/login", "dataRoute": "/login.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/", "dataRoute": "/index.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/register": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/register", "dataRoute": "/register.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] }, "/profile": { "experimentalBypassFor": [{ "type": "header", "key": "next-action" }, { "type": "header", "key": "content-type", "value": "multipart/form-data;.*" }], "initialRevalidateSeconds": false, "srcRoute": "/profile", "dataRoute": "/profile.rsc", "allowHeader": ["host", "x-matched-path", "x-prerender-revalidate", "x-prerender-revalidate-if-generated", "x-next-revalidated-tags", "x-next-revalidate-tag-token"] } }, "dynamicRoutes": {}, "notFoundRoutes": [], "preview": { "previewModeId": "9bdc43615f86d336a89248052c6a5f66", "previewModeSigningKey": "0df036a2530d3cbcc6f20923910447dc9a4492cf1d89866cdff31a6190cadb9a", "previewModeEncryptionKey": "9fe839728eb2b188bac448cf159c551276da079c7eaf1a0b633f56771196edd8" } };
var MiddlewareManifest = { "version": 3, "middleware": { "/": { "files": ["server/edge-runtime-webpack.js", "server/src/middleware.js"], "name": "src/middleware", "page": "/", "matchers": [{ "regexp": "^(?:\\/(_next\\/data\\/[^/]{1,}))?(?:\\/((?!_next\\/static|_next\\/image|favicon.ico|public|icon-).*))(\\.json)?[\\/#\\?]?$", "originalSource": "/((?!_next/static|_next/image|favicon.ico|public|icon-).*)" }], "wasm": [], "assets": [], "env": { "__NEXT_BUILD_ID": "0rdgyjjYan0qh544gyh15", "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY": "hqStc8bsct2fY816v+wdDRYL1b88EZIsFXSae5vFjOk=", "__NEXT_PREVIEW_MODE_ID": "9bdc43615f86d336a89248052c6a5f66", "__NEXT_PREVIEW_MODE_SIGNING_KEY": "0df036a2530d3cbcc6f20923910447dc9a4492cf1d89866cdff31a6190cadb9a", "__NEXT_PREVIEW_MODE_ENCRYPTION_KEY": "9fe839728eb2b188bac448cf159c551276da079c7eaf1a0b633f56771196edd8" } } }, "functions": {}, "sortedMiddleware": ["/"] };
var AppPathRoutesManifest = { "/_not-found/page": "/_not-found", "/api/session-sync/route": "/api/session-sync", "/auth/callback/route": "/auth/callback", "/auth/forgot-password/page": "/auth/forgot-password", "/auth/register/page": "/auth/register", "/auth/reset-password/page": "/auth/reset-password", "/auth/login/page": "/auth/login", "/auth/select-role/page": "/auth/select-role", "/login/page": "/login", "/page": "/", "/register/page": "/register", "/profile/page": "/profile" };
var FunctionsConfigManifest = { "version": 1, "functions": {} };
var PagesManifest = { "/_app": "pages/_app.js", "/_error": "pages/_error.js", "/_document": "pages/_document.js", "/404": "pages/404.html" };
process.env.NEXT_BUILD_ID = BuildId;

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/http/openNextResponse.js
init_logger();
init_util();
import { Transform } from "node:stream";

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/core/routing/util.js
init_util();
init_logger();

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/utils/binary.js
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

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js
init_stream();
init_logger();

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/core/routing/i18n/accept-header.js
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

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/core/routing/i18n/index.js
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

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/core/routing/queue.js
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

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/core/routing/util.js
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

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/core/routingHandler.js
init_logger();

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
import { createHash } from "node:crypto";
init_stream();

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/utils/cache.js
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
    return tags.length === 0 ? false : await globalThis.tagCache.hasBeenRevalidated(tags, lastModified);
  }
  const _lastModified = await globalThis.tagCache.getLastModified(key, lastModified);
  return _lastModified === -1;
}
function getTagsFromValue(value) {
  if (!value) {
    return [];
  }
  try {
    const cacheTags = value.meta?.headers?.["x-next-cache-tags"]?.split(",") ?? [];
    delete value.meta?.headers?.["x-next-cache-tags"];
    return cacheTags;
  } catch (e) {
    return [];
  }
}

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/core/routing/cacheInterceptor.js
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
    // Sometimes other status codes can be cached, like 404. For these cases, we should return the correct status code
    // Also set the status code to the rewriteStatusCode if defined
    // This can happen in handleMiddleware in routingHandler.
    // `NextResponse.rewrite(url, { status: xxx})
    // The rewrite status code should take precedence over the cached one
    statusCode: event.rewriteStatusCode ?? cachedValue.meta?.status ?? 200,
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
            statusCode: event.rewriteStatusCode ?? cachedData.value.meta?.status ?? 200,
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

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/utils/normalize-path.js
import path2 from "node:path";
function normalizeRepeatedSlashes(url) {
  const urlNoQuery = url.host + url.pathname;
  return `${url.protocol}//${urlNoQuery.replace(/\\/g, "/").replace(/\/\/+/g, "/")}${url.search}`;
}

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/core/routing/matcher.js
init_stream();
init_logger();

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/core/routing/routeMatcher.js
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

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/core/routing/matcher.js
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

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/core/routing/middleware.js
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
    rewriteStatusCode: rewriteUrl && !isExternalRewrite ? statusCode : void 0
  };
}

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/core/routingHandler.js
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
    const middlewareHeadersPrioritized = globalThis.openNextConfig.dangerous?.middlewareHeadersOverrideNextConfigHeaders ?? false;
    if (middlewareHeadersPrioritized) {
      headers = {
        ...headers,
        ...middlewareEventOrResult.responseHeaders
      };
    } else {
      headers = {
        ...middlewareEventOrResult.responseHeaders,
        ...headers
      };
    }
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

// ../../node_modules/.pnpm/@opennextjs+aws@3.8.0/node_modules/@opennextjs/aws/dist/adapters/middleware.js
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
    if (process.env.OPEN_NEXT_REQUEST_ID_HEADER || globalThis.openNextDebug) {
      result.headers[INTERNAL_EVENT_REQUEST_ID] = requestId;
    }
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
/*! Bundled license information:

cookie/index.js:
  (*!
   * cookie
   * Copyright(c) 2012-2014 Roman Shtylman
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/
