import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { createNoteSchema } from "@/lib/validations";

export async function GET(req: Request) {
  try {
    const auth = verifyAuth(req);

    const notes = await prisma.note.findMany({
      where: { userId: auth.userId },
      orderBy: { zIndex: "asc" },
    });

    return NextResponse.json({ notes });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json(
      { error: error?.message || "Failed to fetch notes" },
      { status }
    );
  }
}

export async function POST(req: Request) {
  try {
    const auth = verifyAuth(req);
    const body = await req.json();

    const validationResult = createNoteSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { title, content, category, posX, posY, color } = validationResult.data;

    // Calculate next zIndex: (max existing zIndex + 1)
    const highestNote = await prisma.note.findFirst({
      where: { userId: auth.userId },
      orderBy: { zIndex: "desc" },
      select: { zIndex: true },
    });

    const zIndex = (highestNote?.zIndex ?? 0) + 1;

    const note = await prisma.note.create({
      data: {
        userId: auth.userId,
        title: title || null,
        content,
        category: category || null,
        posX,
        posY,
        zIndex,
        color: color || "#FEF08A",
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json(
      { error: error?.message || "Failed to create note" },
      { status }
    );
  }
}
