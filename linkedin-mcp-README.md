# 🔗 LinkedIn MCP Server
### Built by Jayaprakash Reddy Syamala — TrustPulse AI

A full-featured LinkedIn MCP (Model Context Protocol) server that connects Claude AI to LinkedIn. Read profiles, post updates, search jobs, draft outreach messages, get analytics and research competitors.

---

## 🚀 Features

| Tool | What it does |
|---|---|
| `get_linkedin_profile` | Read any LinkedIn profile |
| `post_linkedin_update` | Post updates to LinkedIn |
| `search_linkedin_jobs` | Search jobs by keyword + location |
| `draft_outreach_message` | Generate personalised connection messages |
| `get_profile_analytics` | Get post and profile view stats |
| `get_auth_url` | Generate OAuth login URL |
| `competitor_research` | Research competitor companies |

---

## ⚙️ Setup

### 1. Clone & Install
```bash
git clone https://github.com/syamalajayaprakashreddy-dot/linkedin-mcp
cd linkedin-mcp
npm install
```

### 2. Get LinkedIn API Credentials
1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com)
2. Click **Create App**
3. Fill in your app details (use TrustPulse AI as company)
4. Copy your **Client ID** and **Client Secret**
5. Add your redirect URI

### 3. Connect to Claude Desktop
Add this to your Claude Desktop config file:

**Mac:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "linkedin": {
      "command": "node",
      "args": ["/full/path/to/linkedin-mcp/server.js"]
    }
  }
}
```

### 4. Restart Claude Desktop
LinkedIn tools will now appear in Claude!

---

## 💡 Example Usage in Claude

Once connected, you can say to Claude:
- *"Search for Digital Marketing Manager jobs in London"*
- *"Draft a LinkedIn outreach message to a recruiter at Google"*
- *"Post this update to my LinkedIn"*
- *"Research TrustPulse AI's competitors on LinkedIn"*

---

## 💰 Monetisation Options

1. **SaaS** — charge £9-£99/month for access
2. **Freelance** — build custom versions for clients (£300-£500)
3. **Bundle** — add to TrustPulse AI as a premium feature
4. **List on MCP Directory** — get discovered by Claude users worldwide

---

## ⚠️ Important Notes

- LinkedIn's official API requires **approval** for full access
- Some features need **LinkedIn Marketing Developer Platform** access
- Always comply with LinkedIn's Terms of Service
- OAuth tokens expire — implement token refresh in production

---

## 👨‍💻 Author

**Jayaprakash Reddy Syamala**
- GitHub: [syamalajayaprakashreddy-dot](https://github.com/syamalajayaprakashreddy-dot)
- LinkedIn: [jayaprakash-reddy-syamala](https://www.linkedin.com/in/jayaprakash-reddy-syamala-188754370/)
- Company: TrustPulse AI

---

## 📄 License
MIT — free to use, modify and sell.
