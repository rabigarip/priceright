const GROQ_API_KEY = process.env.GROQ_API_KEY;

/* ─── RATE LIMITER (in-memory, per IP) ─────────────────────────── */
const ipRequests = new Map();
const RATE_LIMIT = 10;       // requests allowed per window
const WINDOW_MS  = 60 * 1000; // 1 minute

function isRateLimited(ip) {
  const now      = Date.now();
  const requests = (ipRequests.get(ip) || []).filter(t => now - t < WINDOW_MS);
  ipRequests.set(ip, requests);
  if (requests.length >= RATE_LIMIT) return true;
  requests.push(now);
  return false;
}

/* ─── PROMPT BUILDER ──────────────────────────────────────────── */
function buildPrompt({ medium, w, h, unit, year, career, shows, solo, market, followers, sales, site }) {
  return `You are PriceRight, an expert AI pricing engine for the art market. Analyze this working artist's profile and return a data-informed pricing recommendation.

ARTIST PROFILE:
- Medium: ${medium}
- Dimensions: ${w} × ${h} ${unit === "in" ? "inches" : "cm"}
- Year Created: ${year || "Recent"}
- Career Stage: ${career}
- Total Exhibitions: ${shows || "0"}
- Solo Shows: ${solo || "0"}
- Primary Market: ${market}
- Social Following: ${followers}
- Pieces Sold Per Year: ${sales}
- Has Portfolio Website: ${site ? "Yes" : "No"}

Return ONLY a valid JSON object. Do not include any text before or after the JSON. Do not wrap it in markdown code fences. No preamble. No explanation. Just the raw JSON object matching this exact shape:

{"priceLow":<integer>,"priceMid":<integer>,"priceHigh":<integer>,"marketContext":"<2-3 sentences about what artists at this career stage selling this medium typically charge in this market, and what key factors drive pricing in this segment>","positiveFactors":[{"factor":"<title, max 4 words>","detail":"<1 concise sentence>"}],"developmentAreas":[{"area":"<title, max 4 words>","suggestion":"<1 concise actionable sentence>"}],"tips":["<actionable tip>","<actionable tip>","<actionable tip>"],"confidence":"<low|medium|high>"}

CONSTRAINTS:
- positiveFactors: 3 to 5 items
- developmentAreas: 2 to 4 items
- tips: exactly 3 items
- All prices in USD. Be realistic for the actual art market in ${market}.
- Do NOT undersell. Exhibition history and consistent sales are real market signals — price reflects that.
- Factor in: medium-specific market rates, size as a multiplier (larger work = higher price), career-stage credibility, exhibition count as social proof, sales frequency as demand validation, market location premium (NYC/London command higher prices than smaller markets), online presence as a reach signal.
- priceLow: conservative but fair floor — what the work would reliably sell for.
- priceMid: the recommended sweet spot — best balance of confidence and value.
- priceHigh: realistic ceiling the market will bear given all signals.
- confidence: "high" if artist has strong sales + exhibitions, "medium" if some signals present, "low" if minimal data.`;
}

/* ─── HANDLER ─────────────────────────────────────────────────── */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limit by IP
  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress;
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
  }

  // Check API key
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: "Server not configured. Please try again later." });
  }

  // Validate required fields
  const { medium, w, h, career, market, followers, sales } = req.body || {};
  if (!medium || !w || !h || !career || !market || !followers || !sales) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  // Build prompt and call Groq
  const prompt = buildPrompt(req.body);

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a pricing expert. You output ONLY a single valid JSON object. No text before or after. No markdown. No code fences. Just raw JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1024,
        temperature: 0.2
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", JSON.stringify(data));
      return res.status(500).json({ error: "AI analysis failed. Please try again." });
    }

    // Extract and parse JSON from model response
    let content = data.choices[0].message.content.trim();
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // Isolate the JSON object (first { to last })
    const start = content.indexOf("{");
    const end   = content.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      content = content.substring(start, end + 1);
    }

    const parsed = JSON.parse(content);

    // Sanity check
    if (!parsed.priceLow || !parsed.priceMid || !parsed.priceHigh) {
      return res.status(500).json({ error: "Invalid analysis result. Please try again." });
    }

    return res.status(200).json(parsed);

  } catch (error) {
    console.error("Analysis error:", error);
    return res.status(500).json({ error: "Pricing analysis failed. Please try again." });
  }
}
