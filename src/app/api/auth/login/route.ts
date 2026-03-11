import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { verifyPassword, createSessionToken, AUTH_COOKIE } from "@/lib/auth";

const SESSION_MAX_AGE_SECONDS = 24 * 60 * 60; // ✅ 24 horas, consistente con middleware

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || !(await verifyPassword(password))) {
      return NextResponse.json(
        { error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    const token = await createSessionToken(); // ✅ Bug #1 corregido: await

    const response = NextResponse.json({ success: true });
    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS, // ✅ Bug #2 corregido: 24h = token lifetime
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
