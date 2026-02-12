import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to avoid leaking whether an account exists
    if (!user) {
      return NextResponse.json({
        message: "If an account exists with that email, you'll receive a reset link shortly.",
      });
    }

    // Generate a reset token valid for 1 hour
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExp = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExp },
    });

    await sendPasswordResetEmail(user.email, resetToken);

    return NextResponse.json({
      message: "If an account exists with that email, you'll receive a reset link shortly.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Could not send reset email. Please try again later." },
      { status: 500 }
    );
  }
}
