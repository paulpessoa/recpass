import { saveFeedback, type Feedback } from "@/lib/server-store";

const str = (v: unknown, max: number) => (typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null);
const int = (v: unknown, min: number, max: number) =>
  typeof v === "number" && Number.isInteger(v) && v >= min && v <= max ? v : null;

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "json inválido" }, { status: 400 });
  }

  const rating = int(body.rating, 1, 5);
  if (rating === null) return Response.json({ ok: false, error: "nota obrigatória (1 a 5)" }, { status: 400 });

  const wouldUse = ["sim", "talvez", "nao"].includes(body.wouldUse as string) ? (body.wouldUse as Feedback["wouldUse"]) : null;
  const liked = Array.isArray(body.liked) ? body.liked.filter((x): x is string => typeof x === "string").slice(0, 12).map((x) => x.slice(0, 40)) : [];
  const ctx = (typeof body.context === "object" && body.context ? body.context : {}) as Record<string, unknown>;
  const context = {
    path: str(ctx.path, 200),
    venueId: str(ctx.venueId, 60),
    tagId: str(ctx.tagId, 60),
    archetypeId: str(ctx.archetypeId, 60),
    personaId: str(ctx.personaId, 60),
    mobilities: Array.isArray(ctx.mobilities) ? ctx.mobilities.filter((x) => typeof x === "string").slice(0, 8) : [],
    usedSeconds: int(ctx.usedSeconds, 0, 86400),
  };

  const fb: Feedback = {
    rating,
    recommend: int(body.recommend, 0, 10),
    wouldUse,
    liked,
    missing: str(body.missing, 2000),
    area: str(body.area, 60),
    role: str(body.role, 120),
    name: str(body.name, 120),
    contact: str(body.contact, 160),
    canContact: body.canContact === true,
    context,
  };

  try {
    const where = await saveFeedback(fb);
    return Response.json({ ok: true, storage: where });
  } catch (e) {
    return Response.json({ ok: false, error: e instanceof Error ? e.message : "falha ao salvar" }, { status: 502 });
  }
}
