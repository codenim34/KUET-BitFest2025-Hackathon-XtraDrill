import { connect } from "@/lib/mongodb/mongoose";
import Chat from "@/lib/models/chat";
import { NextResponse } from "next/server";

export async function DELETE(request, { params }) {
  try {
    const { chatId } = params;
    
    await connect();
    const deletedChat = await Chat.findByIdAndDelete(chatId);
    
    if (!deletedChat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat' },
      { status: 500 }
    );
  }
}

export async function GET(request, { params }) {
  try {
    const { chatId } = params;
    
    await connect();
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat' },
      { status: 500 }
    );
  }
}
