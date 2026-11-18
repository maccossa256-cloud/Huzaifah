// Cloudflare Worker: connects your AI Tutor page to Claude without exposing your API key.
// 1. In Cloudflare, create a Worker and paste this code.
// 2. Add a secret named ANTHROPIC_API_KEY with your key (Settings -> Variables and Secrets).
// 3. Copy the Worker link into TUTOR_API_URL in tutor.html.
export default {
  async fetch(req, env) {
    const cors = {
      "Access-Control-Allow-Origin": "https://maccossa256-cloud.github.io",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    };
    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });
    const { messages } = await req.json();
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 800,
        system: "You are a friendly, patient programming tutor on a developer's portfolio site. Explain simply, give short code examples, and keep answers under 250 words. Use plain text only, and put code between ~~~ lines.",
        messages: (messages || []).slice(-12)
      })
    });
    const d = await r.json();
    const reply = (d.content || []).map(c => c.text || "").join("");
    return new Response(JSON.stringify({ reply }), { headers: { ...cors, "content-type": "application/json" } });
  }
};
