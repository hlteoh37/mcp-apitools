# mcp-apitools

MCP server with 8 API & web development utilities for Claude, Cursor, and other MCP-compatible AI assistants.

## Quick Start

```bash
npx mcp-apitools
```

### Claude Desktop

Add to `claude_desktop_config.json`:

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

### Cursor

Add to MCP settings:

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

## Tools (8)

| Tool | Description |
|------|-------------|
| `http_status` | Look up any HTTP status code — phrase, category, description |
| `mime_lookup` | Get MIME type for file extension or find extensions for a MIME type |
| `jwt_create` | Create unsigned JWTs for testing with custom claims |
| `mock_data` | Generate fake people with names, emails, phones, addresses |
| `cors_headers` | Generate CORS response headers for your API |
| `cookie_parse` | Parse Cookie or Set-Cookie headers into structured data |
| `basic_auth` | Generate Basic Authorization headers |
| `query_string` | Parse or build URL query strings |

## Examples

**Look up HTTP 429:**
> "What does HTTP 429 mean?" → `Too Many Requests — User has sent too many requests (rate limiting).`

**Generate test data:**
> "Generate 3 fake users for testing" → Returns 3 people with realistic names, emails, addresses

**Create a test JWT:**
> "Make a JWT with sub=123 and role=admin" → Returns unsigned JWT token

**Parse cookies:**
> "Parse this cookie header: session=abc123; theme=dark" → `{"session": "abc123", "theme": "dark"}`

## See Also

- [mcp-devutils](https://www.npmjs.com/package/mcp-devutils) — UUID, hash, base64, timestamps, JWT decode, and more

## License

MIT

---

☕ If this saves you time, [buy me a coffee](https://buymeacoffee.com/gl89tu25lp)
