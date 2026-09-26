import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken } from "@/lib/auth";
import { signupSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validationResult = signupSchema.safeParse(body);

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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    const token = signToken({ userId: user.id, email: user.email });

    return NextResponse.json(
      {
        message: "Account created successfully",
        user,
        token,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    // Provide a helpful error if database is not reachable yet
    if (error?.code?.startsWith?.("P") || error?.message?.includes?.("connect")) {
      return NextResponse.json(
        {
          error: "Database unavailable. Please configure DATABASE_URL in your .env file and run 'npx prisma db push'.",
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: error?.message || "Internal server error during signup" },
      { status: 500 }
    );
  }
}
