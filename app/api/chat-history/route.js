import { connect } from "@/lib/mongodb/mongoose";
import Chat from "@/lib/models/chat";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await connect();
    const chats = await Chat.find({ userId })
      .sort({ updatedAt: -1 })
      .select('title messages.timestamp storyContext updatedAt');

    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await connect();
    const newChat = await Chat.create({
      userId,
      title: 'New Chat',
      messages: []
    });

    return NextResponse.json(newChat);
  } catch (error) {
    console.error('Error creating new chat:', error);
    return NextResponse.json(
      { error: 'Failed to create new chat' },
      { status: 500 }
    );
  }
}
