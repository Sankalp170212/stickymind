import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAuth } from "@/lib/auth";
import { updateNoteSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const auth = verifyAuth(req);
    const { id } = await params;
    const body = await req.json();

    const validationResult = updateNoteSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingNote = await prisma.note.findUnique({
      where: { id },
    });

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (existingNote.userId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden: Not your note" }, { status: 403 });
    }

    const updatedData: Record<string, any> = {};
    const { title, content, category, posX, posY, zIndex, color } = validationResult.data;

    if (title !== undefined) updatedData.title = title;
    if (content !== undefined) updatedData.content = content;
    if (category !== undefined) updatedData.category = category;
    if (posX !== undefined) updatedData.posX = posX;
    if (posY !== undefined) updatedData.posY = posY;
    if (zIndex !== undefined) updatedData.zIndex = zIndex;
    if (color !== undefined) updatedData.color = color;

    const note = await prisma.note.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json({ note });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json(
      { error: error?.message || "Failed to update note" },
      { status }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const auth = verifyAuth(req);
    const { id } = await params;

    const existingNote = await prisma.note.findUnique({
      where: { id },
    });

    if (!existingNote) {
      return NextResponse.json({ error: "Note not found" }, { status: 404 });
    }

    if (existingNote.userId !== auth.userId) {
      return NextResponse.json({ error: "Forbidden: Not your note" }, { status: 403 });
    }

    await prisma.note.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Note deleted successfully",
      id,
    });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return NextResponse.json(
      { error: error?.message || "Failed to delete note" },
      { status }
    );
  }
}
