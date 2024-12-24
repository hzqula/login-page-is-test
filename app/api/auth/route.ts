// app/api/auth/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendOTPEmail } from "@/lib/nodemailer";

const SECRET_KEY = process.env.JWT_SECRET_KEY;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

export async function POST(req: NextRequest) {
  const { action, email, password, otp } = await req.json();

  if (action === "register") {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered!" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });
  

    // Generate and send OTP for email verification
    const otpCode = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await prisma.oTP.create({
      data: { code: otpCode, expiresAt, userId: user.id },
    });

    const emailSent = await sendOTPEmail(email, otpCode);

    return NextResponse.json({
      message: emailSent
        ? "Registration successful! Please check your email for OTP verification."
        : "Registration successful but failed to send OTP email. Please try again.",
      user,
    });
  }

  if (action === "login") {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return NextResponse.json({ message: "User not found!" }, { status: 400 });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return NextResponse.json(
        { message: "Invalid password!" },
        { status: 401 }
      );

    const otpCode = Math.floor(100000 + Math.random() * 900000);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Delete any existing OTP for this user
    await prisma.oTP.deleteMany({ where: { userId: user.id } });

    // Create new OTP
    await prisma.oTP.create({
      data: { code: otpCode, expiresAt, userId: user.id },
    });

    const emailSent = await sendOTPEmail(email, otpCode);

    return NextResponse.json({
      message: emailSent
        ? "OTP sent to your email!"
        : "Failed to send OTP email. Please try again.",
      success: emailSent,
    });
  }

  if (action === "verify") {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return NextResponse.json({ message: "User not found!" }, { status: 400 });

    const validOtp = await prisma.oTP.findFirst({
      where: {
        code: Number(otp),
        userId: user.id,
        expiresAt: { gte: new Date() },
      },
    });

    if (validOtp) {
      const token = jwt.sign({ userId: user.id, email }, SECRET_KEY, {
        expiresIn: "1h",
      });
      await prisma.oTP.delete({ where: { id: validOtp.id } });
      return NextResponse.json({
        message: "OTP verified successfully!",
        token,
        user: { id: user.id, email: user.email },
      });
    }

    return NextResponse.json(
      { message: "Invalid or expired OTP!" },
      { status: 400 }
    );
  }

  return NextResponse.json({ message: "Invalid action!" }, { status: 400 });
}
