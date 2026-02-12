import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to avoid leaking whether an account exists
    if (!user || user.emailVerified) {
      return NextResponse.json({
        message: "If an account exists with that email, a verification link has been sent.",
      });
    }

    // Generate a fresh token
    const verifyToken = crypto.randomBytes(32).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: { verifyToken },
    });

    await sendVerificationEmail(user.email, verifyToken);

    return NextResponse.json({
      message: "If an account exists with that email, a verification link has been sent.",
    });
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Could not send verification email. Please try again later." },
      { status: 500 }
    );
  }
}
