import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Chat from "@/lib/models/chat";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'ইউজার আইডি প্রয়োজন' }, { status: 400 });
    }

    await connect();
    const chats = await Chat.find({ userId })
      .sort({ updatedAt: -1 })
      .select('title storyContext updatedAt')
      .lean();

    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      { error: 'চ্যাট ইতিহাস লোড করতে ব্যর্থ' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'ইউজার আইডি প্রয়োজন' }, { status: 400 });
    }

    await connect();
    const chat = await Chat.create({
      userId,
      title: 'নতুন চ্যাট',
      messages: []
    });

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'নতুন চ্যাট তৈরি করতে ব্যর্থ' },
      { status: 500 }
    );
  }
}
