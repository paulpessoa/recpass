import { applyAction, getState, storageMode, type StateAction } from "@/lib/server-store";

export async function GET() {
  return Response.json({ state: await getState(), serverNow: Date.now(), storage: storageMode() });
}

export async function POST(request: Request) {
  const action = (await request.json()) as StateAction;
  return Response.json({ state: await applyAction(action), serverNow: Date.now(), storage: storageMode() });
}
