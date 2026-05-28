#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

const server = new McpServer({
  name: "linkedin-mcp",
  version: "1.0.0",
  description: "LinkedIn MCP Server by TrustPulse AI — Read profile, post updates, search jobs, outreach, analytics"
});

// ─────────────────────────────────────────────
// TOOL 1: Get LinkedIn Profile
// ─────────────────────────────────────────────
server.tool(
  "get_linkedin_profile",
  "Get a LinkedIn profile's public information",
  {
    profile_url: z.string().describe("LinkedIn profile URL e.g. https://linkedin.com/in/username"),
    access_token: z.string().optional().describe("LinkedIn OAuth access token (optional for public data)")
  },
  async ({ profile_url, access_token }) => {
    try {
      if (access_token) {
        const res = await axios.get("https://api.linkedin.com/v2/me?projection=(id,firstName,lastName,headline,summary,profilePicture(displayImage~:playableStreams))", {
          headers: { Authorization: `Bearer ${access_token}` }
        });
        return {
          content: [{
            type: "text",
            text: JSON.stringify(res.data, null, 2)
          }]
        };
      }
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            profile_url,
            message: "Public profile data requested. For full profile access, provide an OAuth access_token.",
            tip: "Use the get_auth_url tool to generate a LinkedIn OAuth login link."
          }, null, 2)
        }]
      };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }] };
    }
  }
);

// ─────────────────────────────────────────────
// TOOL 2: Post a LinkedIn Update
// ─────────────────────────────────────────────
server.tool(
  "post_linkedin_update",
  "Post a text update or article to LinkedIn",
  {
    access_token: z.string().describe("LinkedIn OAuth access token"),
    person_urn: z.string().describe("Your LinkedIn person URN e.g. urn:li:person:ABC123"),
    text: z.string().describe("The post content to publish"),
    visibility: z.enum(["PUBLIC", "CONNECTIONS"]).default("PUBLIC").describe("Who can see the post")
  },
  async ({ access_token, person_urn, text, visibility }) => {
    try {
      const payload = {
        author: person_urn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text },
            shareMediaCategory: "NONE"
          }
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": visibility
        }
      };
      const res = await axios.post("https://api.linkedin.com/v2/ugcPosts", payload, {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
          "X-Restli-Protocol-Version": "2.0.0"
        }
      });
      return {
        content: [{
          type: "text",
          text: `✅ Post published successfully!\nPost ID: ${res.data.id}\nVisibility: ${visibility}`
        }]
      };
    } catch (err) {
      return { content: [{ type: "text", text: `Error posting: ${err.response?.data?.message || err.message}` }] };
    }
  }
);

// ─────────────────────────────────────────────
// TOOL 3: Search LinkedIn Jobs
// ─────────────────────────────────────────────
server.tool(
  "search_linkedin_jobs",
  "Search for jobs on LinkedIn by keyword and location",
  {
    keywords: z.string().describe("Job title or keywords e.g. Digital Marketing Manager"),
    location: z.string().describe("Location e.g. London, UK"),
    job_type: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "ANY"]).default("ANY"),
    limit: z.number().default(10).describe("Number of results to return")
  },
  async ({ keywords, location, job_type, limit }) => {
    try {
      const query = encodeURIComponent(keywords);
      const loc = encodeURIComponent(location);
      const jobTypeParam = job_type !== "ANY" ? `&f_JT=${job_type[0]}` : "";
      const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${query}&location=${loc}${jobTypeParam}&count=${limit}`;
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            search_url: searchUrl,
            keywords,
            location,
            job_type,
            message: `Search ready! Open this URL to see ${limit} ${job_type !== "ANY" ? job_type : ""} jobs for "${keywords}" in ${location}.`,
            tip: "For live job data via API, connect LinkedIn Jobs API with an approved partner token.",
            direct_link: searchUrl
          }, null, 2)
        }]
      };
    } catch (err) {
      return { content: [{ type: "text", text: `Error: ${err.message}` }] };
    }
  }
);

// ─────────────────────────────────────────────
// TOOL 4: Draft Outreach Message
// ─────────────────────────────────────────────
server.tool(
  "draft_outreach_message",
  "Draft a personalised LinkedIn connection or outreach message",
  {
    your_name: z.string().describe("Your name"),
    your_role: z.string().describe("Your current role or background"),
    recipient_name: z.string().describe("Name of person you are reaching out to"),
    recipient_role: z.string().describe("Their role or company"),
    purpose: z.enum(["job_opportunity", "networking", "collaboration", "sales", "mentorship"]),
    custom_note: z.string().optional().describe("Any specific detail to personalise the message")
  },
  async ({ your_name, your_role, recipient_name, recipient_role, purpose, custom_note }) => {
    const templates = {
      job_opportunity: `Hi ${recipient_name},\n\nI came across your profile and was impressed by your work at ${recipient_role}. I'm ${your_name}, a ${your_role} with experience in digital marketing, SEO, and AI-powered tools.\n\nI'd love to connect and explore any opportunities that might align with my background.${custom_note ? `\n\n${custom_note}` : ""}\n\nLooking forward to connecting!\n\n${your_name}`,
      networking: `Hi ${recipient_name},\n\nI've been following your work in ${recipient_role} and found it really inspiring. I'm ${your_name}, a ${your_role} passionate about digital marketing and AI.\n\nWould love to connect and exchange ideas!${custom_note ? `\n\n${custom_note}` : ""}\n\nBest,\n${your_name}`,
      collaboration: `Hi ${recipient_name},\n\nI'm ${your_name}, a ${your_role}. I've been building tools in the AI + marketing space and think there could be a great collaboration opportunity with ${recipient_role}.\n\nWould you be open to a quick chat?${custom_note ? `\n\n${custom_note}` : ""}\n\nBest,\n${your_name}`,
      sales: `Hi ${recipient_name},\n\nI noticed ${recipient_role} and thought our solution at TrustPulse AI could add real value to your marketing efforts.\n\nI'm ${your_name} — we help brands improve their online trust scores and conversion rates using AI.\n\nWould love to show you a quick demo!${custom_note ? `\n\n${custom_note}` : ""}\n\nBest,\n${your_name}`,
      mentorship: `Hi ${recipient_name},\n\nYour journey in ${recipient_role} has been really inspiring to follow. I'm ${your_name}, a ${your_role} looking to grow in this space.\n\nWould you be open to a brief virtual coffee chat? I'd love to hear your insights!${custom_note ? `\n\n${custom_note}` : ""}\n\nThank you,\n${your_name}`
    };
    return {
      content: [{
        type: "text",
        text: `✅ Outreach Message (${purpose}):\n\n${templates[purpose]}\n\n---\nCharacter count: ${templates[purpose].length} (LinkedIn limit: 300 for connection requests, 2000 for messages)`
      }]
    };
  }
);

// ─────────────────────────────────────────────
// TOOL 5: Get Profile Analytics Summary
// ─────────────────────────────────────────────
server.tool(
  "get_profile_analytics",
  "Get LinkedIn profile view and post analytics",
  {
    access_token: z.string().describe("LinkedIn OAuth access token"),
    person_urn: z.string().describe("Your LinkedIn person URN")
  },
  async ({ access_token, person_urn }) => {
    try {
      const encodedUrn = encodeURIComponent(person_urn);
      const res = await axios.get(
        `https://api.linkedin.com/v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${encodedUrn}`,
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      return {
        content: [{
          type: "text",
          text: JSON.stringify(res.data, null, 2)
        }]
      };
    } catch (err) {
      return {
        content: [{
          type: "text",
          text: `Analytics note: Full analytics require LinkedIn Marketing Developer Platform access.\nError: ${err.response?.data?.message || err.message}\n\nTip: Apply at https://business.linkedin.com/marketing-solutions/marketing-partners/become-a-partner/marketing-developer-program`
        }]
      };
    }
  }
);

// ─────────────────────────────────────────────
// TOOL 6: Generate OAuth URL
// ─────────────────────────────────────────────
server.tool(
  "get_auth_url",
  "Generate a LinkedIn OAuth 2.0 login URL to get an access token",
  {
    client_id: z.string().describe("Your LinkedIn App Client ID from developer.linkedin.com"),
    redirect_uri: z.string().describe("Your redirect URI registered in LinkedIn app"),
    scopes: z.array(z.string()).default(["r_liteprofile", "r_emailaddress", "w_member_social"]).describe("OAuth scopes needed")
  },
  async ({ client_id, redirect_uri, scopes }) => {
    const scopeStr = scopes.join("%20");
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=${scopeStr}`;
    return {
      content: [{
        type: "text",
        text: `✅ LinkedIn OAuth URL generated!\n\n${authUrl}\n\nSteps:\n1. Open this URL in browser\n2. User logs in and approves\n3. LinkedIn redirects to your redirect_uri with ?code=XXX\n4. Exchange code for access_token at https://www.linkedin.com/oauth/v2/accessToken`
      }]
    };
  }
);

// ─────────────────────────────────────────────
// TOOL 7: Competitor Research
// ─────────────────────────────────────────────
server.tool(
  "competitor_research",
  "Research a competitor company on LinkedIn",
  {
    company_name: z.string().describe("Company name to research"),
    company_linkedin_url: z.string().optional().describe("Their LinkedIn company page URL")
  },
  async ({ company_name, company_linkedin_url }) => {
    const searchUrl = `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(company_name)}`;
    const companyUrl = company_linkedin_url || searchUrl;
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          company: company_name,
          linkedin_search: searchUrl,
          company_page: companyUrl,
          research_tips: [
            "Check their 'People' tab to find decision makers",
            "Check their 'Jobs' tab to understand their growth areas",
            "Check their recent posts to understand their content strategy",
            "Check employee count growth as a proxy for company health",
            "Look at their 'About' section for funding and founding year"
          ],
          outreach_tip: `Use draft_outreach_message tool with purpose='sales' to reach ${company_name} contacts`
        }, null, 2)
      }]
    };
  }
);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("LinkedIn MCP Server running — by TrustPulse AI");
