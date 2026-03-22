# mcp-apitools

MCP server with **14 API & web development utilities** for Claude Desktop, Cursor, and any MCP-compatible AI assistant.

## Install

```json
{
  "mcpServers": {
    "apitools": {
      "command": "npx",
      "args": ["-y", "mcp-apitools"]
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `http_status` | Look up any HTTP status code — phrase, category, description |
| `mime_lookup` | Get MIME type for file extension, or extensions for MIME type |
| `jwt_create` | Create unsigned JWT tokens for testing with custom claims |
| `mock_data` | Generate fake people with names, emails, phones, addresses |
| `cors_headers` | Generate CORS response headers for any origin/methods |
| `cookie_parse` | Parse Cookie or Set-Cookie headers into structured data |
| `basic_auth` | Generate Basic Authorization header from credentials |
| `query_string` | Parse query strings to JSON, or build query strings from JSON |
| `url_parse` | Parse URLs into components — protocol, host, path, params, hash |
| `bearer_token` | Generate Bearer Authorization header from a token |
| `request_id` | Generate unique request/correlation IDs (UUID, prefixed, short) |
| `api_error` | Generate RFC 7807 Problem Details error response bodies |
| `rate_limit_headers` | Generate standard X-RateLimit-* and Retry-After headers |
| `form_encode` | Encode JSON to application/x-www-form-urlencoded, or decode |

## Why use this?

- **Zero config** — `npx` and go, no API keys needed
- **14 tools** — covers the most common API development tasks
- **Standards-based** — RFC 7807 errors, proper CORS, standard rate limit headers
- **Works everywhere** — Claude Desktop, Cursor, Windsurf, any MCP client

## Support

If this tool saves you time, consider supporting development:

- [Buy me a coffee](https://buymeacoffee.com/gl89tu25lp)
- [Tip via Stripe ($3)](https://buy.stripe.com/dRm8wP8R295Z9VyeN59Zm00)

## Like this? Try mcp-devutils

**[mcp-devutils](https://www.npmjs.com/package/mcp-devutils)** — 44 developer tools in one MCP server. UUID, hash, JWT, JSON diff, AES encryption, and more. 15 free, [unlock all 44 for $5](https://buy.stripe.com/bJe00jgjugyr5Fi5cv9Zm05).

## License

MIT
