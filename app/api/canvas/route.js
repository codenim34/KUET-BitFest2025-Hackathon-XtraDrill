import { NextResponse } from "next/server";
import { createCanvas, updateCanvas } from "@/lib/actions/canvas.actions";

export async function POST(req) {
  try {
    const { content, authorId, authorName } = await req.json();

    const result = await createCanvas({
      content,
      authorId,
      authorName,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const { id, content } = await req.json();

    const result = await updateCanvas(id, { content });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
