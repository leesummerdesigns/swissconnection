import { NextResponse } from "next/server";

export function validateBotApiKey(request: Request): NextResponse | null {
  const apiKey = process.env.BOT_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Bot API not configured" },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing Authorization header. Use: Bearer <BOT_API_KEY>" },
      { status: 401 }
    );
  }

  const token = authHeader.slice(7);
  if (token !== apiKey) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  return null; // valid
}
