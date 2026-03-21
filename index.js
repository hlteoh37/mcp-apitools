#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import crypto from "crypto";

const server = new Server(
  { name: "mcp-apitools", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// ---------- HTTP Status Codes ----------
const HTTP_STATUSES = {
  100: ["Continue", "Server received request headers; client should proceed to send body."],
  101: ["Switching Protocols", "Server is switching protocols as requested (e.g. WebSocket upgrade)."],
  200: ["OK", "Request succeeded."],
  201: ["Created", "Request succeeded and a new resource was created."],
  202: ["Accepted", "Request accepted for processing, but not yet completed."],
  204: ["No Content", "Request succeeded but there is no content to return."],
  206: ["Partial Content", "Server is delivering part of the resource due to a Range header."],
  301: ["Moved Permanently", "Resource has been permanently moved to a new URL."],
  302: ["Found", "Resource temporarily resides at a different URL."],
  304: ["Not Modified", "Resource has not been modified since last request (caching)."],
  307: ["Temporary Redirect", "Request should be repeated with another URL, preserving method."],
  308: ["Permanent Redirect", "Like 301 but preserves HTTP method."],
  400: ["Bad Request", "Server cannot process the request due to client error (malformed syntax, invalid parameters)."],
  401: ["Unauthorized", "Authentication is required and has failed or not been provided."],
  403: ["Forbidden", "Server understood the request but refuses to authorize it."],
  404: ["Not Found", "Requested resource could not be found."],
  405: ["Method Not Allowed", "HTTP method is not allowed for this resource."],
  406: ["Not Acceptable", "Server cannot produce a response matching the Accept headers."],
  408: ["Request Timeout", "Server timed out waiting for the request."],
  409: ["Conflict", "Request conflicts with current state of the resource."],
  410: ["Gone", "Resource is no longer available and will not be available again."],
  413: ["Payload Too Large", "Request entity is larger than server is willing to process."],
  415: ["Unsupported Media Type", "Media type of the request is not supported."],
  418: ["I'm a Teapot", "RFC 2324 — server refuses to brew coffee because it is a teapot."],
  422: ["Unprocessable Entity", "Request was well-formed but contained semantic errors."],
  429: ["Too Many Requests", "User has sent too many requests (rate limiting)."],
  451: ["Unavailable For Legal Reasons", "Resource unavailable due to legal demands."],
  500: ["Internal Server Error", "Server encountered an unexpected condition."],
  502: ["Bad Gateway", "Server received an invalid response from upstream server."],
  503: ["Service Unavailable", "Server is temporarily unavailable (overloaded or maintenance)."],
  504: ["Gateway Timeout", "Server did not receive a timely response from upstream."],
};

// ---------- MIME Types ----------
const MIME_MAP = {
  html: "text/html", htm: "text/html", css: "text/css", js: "application/javascript",
  mjs: "application/javascript", json: "application/json", xml: "application/xml",
  csv: "text/csv", txt: "text/plain", md: "text/markdown",
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif",
  svg: "image/svg+xml", webp: "image/webp", ico: "image/x-icon", avif: "image/avif",
  mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", mp4: "video/mp4",
  webm: "video/webm", pdf: "application/pdf", zip: "application/zip",
  gz: "application/gzip", tar: "application/x-tar",
  woff: "font/woff", woff2: "font/woff2", ttf: "font/ttf", otf: "font/otf",
  wasm: "application/wasm", yaml: "application/x-yaml", yml: "application/x-yaml",
  toml: "application/toml", ts: "application/typescript", tsx: "application/typescript",
  jsx: "application/javascript", graphql: "application/graphql",
};

// ---------- Mock Data Helpers ----------
const FIRST_NAMES = ["Alice","Bob","Charlie","Diana","Eve","Frank","Grace","Hank","Ivy","Jack","Karen","Leo","Mia","Noah","Olivia","Pete","Quinn","Rosa","Sam","Tina"];
const LAST_NAMES = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Wilson","Moore","Taylor","Anderson","Thomas","Jackson","White","Harris","Martin","Clark","Lewis","Lee"];
const DOMAINS = ["example.com","test.org","demo.io","mail.test","sample.net"];
const STREETS = ["Main St","Oak Ave","Elm Dr","Park Blvd","Cedar Ln","Pine Rd","Maple Way","Lake Dr"];
const CITIES = ["Springfield","Portland","Madison","Georgetown","Fairview","Salem","Riverside","Clinton"];
const STATES = ["CA","NY","TX","FL","WA","IL","PA","OH"];

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function makePerson() {
  const first = pick(FIRST_NAMES), last = pick(LAST_NAMES);
  return {
    id: crypto.randomUUID(),
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@${pick(DOMAINS)}`,
    phone: `+1-${randInt(200,999)}-${randInt(100,999)}-${randInt(1000,9999)}`,
    address: {
      street: `${randInt(1,9999)} ${pick(STREETS)}`,
      city: pick(CITIES),
      state: pick(STATES),
      zip: String(randInt(10000,99999)),
    },
  };
}

// ---------- Tool Definitions ----------
const TOOLS = [
  {
    name: "http_status",
    description: "Look up an HTTP status code — returns phrase, category, and description",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "number", description: "HTTP status code (e.g. 404)" }
      },
      required: ["code"]
    }
  },
  {
    name: "mime_lookup",
    description: "Get the MIME type for a file extension, or find extensions for a MIME type",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "File extension (e.g. 'png') or MIME type (e.g. 'application/json')" }
      },
      required: ["query"]
    }
  },
  {
    name: "jwt_create",
    description: "Create an unsigned JWT token for testing with custom payload claims",
    inputSchema: {
      type: "object",
      properties: {
        payload: { type: "object", description: "JWT payload claims as key-value pairs" },
        expiresInSeconds: { type: "number", description: "Optional expiration in seconds from now" }
      },
      required: ["payload"]
    }
  },
  {
    name: "mock_data",
    description: "Generate mock/fake people with names, emails, phones, and addresses for testing",
    inputSchema: {
      type: "object",
      properties: {
        count: { type: "number", description: "Number of records to generate (1-50, default 5)" }
      }
    }
  },
  {
    name: "cors_headers",
    description: "Generate CORS response headers for a given origin and methods",
    inputSchema: {
      type: "object",
      properties: {
        origin: { type: "string", description: "Allowed origin (default '*')" },
        methods: { type: "array", items: { type: "string" }, description: "Allowed HTTP methods" },
        allowCredentials: { type: "boolean", description: "Allow credentials (default false)" },
        maxAge: { type: "number", description: "Preflight cache seconds (default 86400)" }
      }
    }
  },
  {
    name: "cookie_parse",
    description: "Parse a Cookie or Set-Cookie header string into structured key-value data",
    inputSchema: {
      type: "object",
      properties: {
        header: { type: "string", description: "Cookie header string (e.g. 'name=value; name2=value2')" }
      },
      required: ["header"]
    }
  },
  {
    name: "basic_auth",
    description: "Generate a Basic Authorization header from username and password",
    inputSchema: {
      type: "object",
      properties: {
        username: { type: "string", description: "Username" },
        password: { type: "string", description: "Password" }
      },
      required: ["username", "password"]
    }
  },
  {
    name: "query_string",
    description: "Parse a URL query string into key-value pairs, or build one from a JSON object",
    inputSchema: {
      type: "object",
      properties: {
        input: { type: "string", description: "URL/query string to parse, or JSON object to encode" }
      },
      required: ["input"]
    }
  }
];

// ---------- Handlers ----------
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "http_status": {
      const code = args.code;
      const cat = code < 200 ? "Informational" : code < 300 ? "Success" : code < 400 ? "Redirection" : code < 500 ? "Client Error" : "Server Error";
      const info = HTTP_STATUSES[code];
      const text = info
        ? `${code} ${info[0]}\nCategory: ${cat}\n${info[1]}`
        : `${code} — ${cat} (no standard definition for this code)`;
      return { content: [{ type: "text", text }] };
    }

    case "mime_lookup": {
      const q = (args.query || "").replace(/^\./, "").toLowerCase();
      if (MIME_MAP[q]) {
        return { content: [{ type: "text", text: `.${q} → ${MIME_MAP[q]}` }] };
      }
      const exts = Object.entries(MIME_MAP).filter(([, m]) => m === q).map(([e]) => `.${e}`);
      if (exts.length) {
        return { content: [{ type: "text", text: `${q} → ${exts.join(", ")}` }] };
      }
      return { content: [{ type: "text", text: `No match for "${args.query}". Try extension (e.g. 'png') or MIME type (e.g. 'image/png').` }] };
    }

    case "jwt_create": {
      const header = { alg: "none", typ: "JWT" };
      const now = Math.floor(Date.now() / 1000);
      const claims = { iat: now, ...args.payload };
      if (args.expiresInSeconds) claims.exp = now + args.expiresInSeconds;
      const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
      const token = `${b64(header)}.${b64(claims)}.`;
      return { content: [{ type: "text", text: `${token}\n\nHeader: ${JSON.stringify(header)}\nPayload: ${JSON.stringify(claims, null, 2)}\n\n⚠️ Unsigned token (alg: none) — for testing only.` }] };
    }

    case "mock_data": {
      const count = Math.max(1, Math.min(50, args.count || 5));
      const people = Array.from({ length: count }, makePerson);
      return { content: [{ type: "text", text: JSON.stringify(people, null, 2) }] };
    }

    case "cors_headers": {
      const origin = args.origin || "*";
      const methods = args.methods || ["GET", "POST", "PUT", "DELETE", "OPTIONS"];
      const creds = args.allowCredentials || false;
      const maxAge = args.maxAge || 86400;
      if (creds && origin === "*") {
        return { content: [{ type: "text", text: "⚠️ Cannot use Access-Control-Allow-Credentials with origin '*'. Specify an explicit origin." }] };
      }
      const h = {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": methods.join(", "),
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Max-Age": String(maxAge),
      };
      if (creds) h["Access-Control-Allow-Credentials"] = "true";
      const lines = Object.entries(h).map(([k, v]) => `${k}: ${v}`).join("\n");
      return { content: [{ type: "text", text: `CORS Response Headers:\n\n${lines}` }] };
    }

    case "cookie_parse": {
      const hdr = args.header;
      const isSetCookie = /;\s*(expires|max-age|domain|path|secure|httponly|samesite)\s*[=;]/i.test(hdr);
      if (isSetCookie) {
        const parts = hdr.split(";").map((s) => s.trim());
        const [nameVal, ...attrs] = parts;
        const eq = nameVal.indexOf("=");
        const cName = eq > -1 ? nameVal.slice(0, eq) : nameVal;
        const cValue = eq > -1 ? nameVal.slice(eq + 1) : "";
        const attributes = {};
        for (const a of attrs) {
          const aEq = a.indexOf("=");
          if (aEq > -1) attributes[a.slice(0, aEq).trim().toLowerCase()] = a.slice(aEq + 1).trim();
          else attributes[a.toLowerCase()] = true;
        }
        return { content: [{ type: "text", text: JSON.stringify({ name: cName, value: cValue, attributes }, null, 2) }] };
      }
      const cookies = {};
      for (const pair of hdr.split(";")) {
        const eq = pair.indexOf("=");
        if (eq > -1) cookies[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim();
      }
      return { content: [{ type: "text", text: JSON.stringify(cookies, null, 2) }] };
    }

    case "basic_auth": {
      const encoded = Buffer.from(`${args.username}:${args.password}`).toString("base64");
      return { content: [{ type: "text", text: `Authorization: Basic ${encoded}\n\nDecoded: ${args.username}:${args.password}\n\n⚠️ Basic auth transmits credentials in base64 (NOT encrypted). Always use HTTPS.` }] };
    }

    case "query_string": {
      const input = args.input;
      try {
        const obj = JSON.parse(input);
        if (typeof obj === "object" && obj !== null) {
          const params = new URLSearchParams();
          for (const [k, v] of Object.entries(obj)) params.append(k, String(v));
          return { content: [{ type: "text", text: `Query string: ?${params.toString()}\n\nParams:\n${JSON.stringify(obj, null, 2)}` }] };
        }
      } catch { /* parse as query string */ }
      const qIdx = input.indexOf("?");
      const qs = qIdx > -1 ? input.slice(qIdx + 1) : input;
      const params = new URLSearchParams(qs);
      const result = {};
      for (const [k, v] of params) {
        if (result[k]) result[k] = Array.isArray(result[k]) ? [...result[k], v] : [result[k], v];
        else result[k] = v;
      }
      return { content: [{ type: "text", text: `Parsed query parameters:\n${JSON.stringify(result, null, 2)}` }] };
    }

    default:
      return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
  }
});

// ---------- Start ----------
const transport = new StdioServerTransport();
await server.connect(transport);
