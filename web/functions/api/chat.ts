// Cloudflare Pages Function — POST /api/chat
//
// Proxies chat requests to the Anthropic (Claude) Messages API so the API key
// stays server-side and is NEVER shipped to the browser. We use a dependency-
// free `fetch` call: on the Cloudflare edge runtime this is the most robust
// approach (no bundling, no nodejs_compat), and it still calls the official
// Anthropic API with the correct model and request shape.
//
// Setup: add an environment secret named ANTHROPIC_API_KEY in the Cloudflare
// Pages project (Settings -> Environment variables/Secrets), then redeploy.
// See PANDUAN_CHAT_AI.md.

interface Env {
  ANTHROPIC_API_KEY?: string;
}
interface PagesContext {
  request: Request;
  env: Env;
}

const MODEL = "claude-opus-4-8";

const SYSTEM_PROMPT = `Kamu adalah "Asisten Gizi StuntCare AI", asisten edukasi berbahasa Indonesia yang membantu orang tua dan kader memahami serta MENCEGAH stunting pada balita.

Lingkup yang boleh kamu bahas: gizi anak dan ibu, ASI dan MPASI, pencegahan stunting, pola makan seimbang, sanitasi dan air bersih, imunisasi dasar, posyandu, serta faktor risiko (jarak kehamilan, usia ibu, gizi ibu saat hamil, dll).

Aturan menjawab:
- Jawab RINGKAS, jelas, ramah, dan praktis. Gunakan bahasa sederhana untuk orang awam. Maksimal sekitar 5 poin atau 120 kata.
- Fokus pada PENCEGAHAN dan edukasi; berikan tips konkret yang bisa langsung dilakukan.
- JANGAN memberi diagnosis medis, resep, atau dosis obat. Untuk gejala atau kondisi medis tertentu, arahkan ke posyandu, puskesmas, dokter anak, atau ahli gizi.
- Jika pertanyaan di luar topik stunting/gizi/kesehatan anak, tolak dengan sopan dan ajak kembali ke topik.
- Berbasis pedoman umum WHO dan Kemenkes RI. Jangan mengarang fakta atau angka.
- Selalu menjawab dalam Bahasa Indonesia kecuali diminta lain.
- Ingatkan secara singkat bila perlu bahwa ini edukasi, bukan pengganti pemeriksaan tenaga kesehatan.`;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export const onRequestPost = async (context: PagesContext): Promise<Response> => {
  const { request, env } = context;
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return json(
      { error: "not_configured", message: "Fitur chat belum diaktifkan oleh pemilik situs." },
      503
    );
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: "bad_request", message: "Format permintaan tidak valid." }, 400);
  }

  const incoming: any[] = Array.isArray(body?.messages) ? body.messages : [];
  // Sanitize: only user/assistant turns with non-empty string content; keep
  // the last 12 turns and cap each message length.
  const messages = incoming
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .slice(-12)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return json({ error: "bad_request", message: "Pertanyaan kosong." }, 400);
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!upstream.ok) {
      return json(
        {
          error: "upstream",
          status: upstream.status,
          message: "Maaf, asisten sedang tidak tersedia. Coba lagi sebentar lagi.",
        },
        502
      );
    }

    const data: any = await upstream.json();
    const text: string = (data?.content ?? [])
      .filter((b: any) => b?.type === "text")
      .map((b: any) => b.text)
      .join("")
      .trim();

    return json({ text: text || "Maaf, saya belum bisa menjawab pertanyaan itu." });
  } catch {
    return json(
      { error: "exception", message: "Terjadi kesalahan jaringan. Coba lagi." },
      502
    );
  }
};
