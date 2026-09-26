import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = signToken({ userId: user.id, email: user.email });

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    if (error?.code?.startsWith?.("P") || error?.message?.includes?.("connect")) {
      return NextResponse.json(
        {
          error: "Database unavailable. Please configure DATABASE_URL in your .env file and run 'npx prisma db push'.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: error?.message || "Internal server error during login" },
      { status: 500 }
    );
  }
}
