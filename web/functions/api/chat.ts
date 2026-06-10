// Cloudflare Pages Function — POST /api/chat
//
// Proxy ke LLM GRATIS & TANPA API KEY (Pollinations, text.pollinations.ai).
// Dipanggil dari server (edge) sehingga tidak ada masalah CORS dan tidak perlu
// kunci apa pun. Jika layanan gratis sedang sibuk/gagal, klien akan otomatis
// memakai basis pengetahuan lokal (stunting-knowledge.ts) sebagai cadangan.

interface PagesContext {
  request: Request;
}

const SYSTEM_PROMPT = `Kamu adalah "Asisten Edukasi StuntCare AI", asisten berbahasa Indonesia yang ramah dan membantu, dengan fokus utama pada stunting, gizi anak, kehamilan, dan kesehatan keluarga.

Aturan:
- Jawab dalam Bahasa Indonesia, ringkas, jelas, dan praktis (maksimal ~150 kata). Pakai poin bila perlu.
- Untuk topik stunting/gizi/kesehatan anak, beri tips konkret berbasis pedoman WHO dan Kemenkes RI.
- Kamu boleh menjawab pertanyaan umum lain secara membantu, tetapi tetap sopan dan aman.
- JANGAN memberi diagnosis medis, resep, atau dosis obat. Untuk gejala/kondisi spesifik, sarankan konsultasi ke posyandu, puskesmas, dokter anak, atau ahli gizi.
- Jangan mengarang fakta atau angka. Jika tidak yakin, katakan dengan jujur.`;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export const onRequestPost = async (context: PagesContext): Promise<Response> => {
  let body: any;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  const incoming: any[] = Array.isArray(body?.messages) ? body.messages : [];
  const messages = incoming
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0
    )
    .slice(-10)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 1500) }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return json({ error: "empty" }, 400);
  }

  const withTimeout = (ms: number) => {
    const c = new AbortController();
    const id = setTimeout(() => c.abort(), ms);
    return { signal: c.signal, clear: () => clearTimeout(id) };
  };

  // Attempt 1 — OpenAI-compatible chat endpoint (multi-turn).
  try {
    const t = withTimeout(22000);
    const r = await fetch("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: t.signal,
      body: JSON.stringify({
        model: "openai",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        referrer: "stuntcare-ai",
        private: true,
      }),
    });
    t.clear();
    if (r.ok) {
      const data: any = await r.json();
      const text: string | undefined = data?.choices?.[0]?.message?.content?.trim();
      if (text) return json({ text });
    }
  } catch {
    /* fall through to attempt 2 */
  }

  // Attempt 2 — simple GET text endpoint (single prompt).
  try {
    const lastUser = messages[messages.length - 1].content;
    const t = withTimeout(22000);
    const url =
      "https://text.pollinations.ai/" +
      encodeURIComponent(lastUser) +
      "?model=openai&private=true&system=" +
      encodeURIComponent(SYSTEM_PROMPT);
    const r = await fetch(url, { signal: t.signal });
    t.clear();
    if (r.ok) {
      const text = (await r.text()).trim();
      if (text && !text.startsWith("{")) return json({ text });
    }
  } catch {
    /* fall through */
  }

  // Both attempts failed — tell the client to use its local knowledge base.
  return json({ error: "upstream" }, 502);
};
