import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const auth = verifyAuth(req);

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    const status = error.statusCode || 401;
    return NextResponse.json(
      { error: error?.message || "Unauthorized" },
      { status }
    );
  }
}
