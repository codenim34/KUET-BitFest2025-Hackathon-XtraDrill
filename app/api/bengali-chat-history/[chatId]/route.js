import { NextResponse } from "next/server";
import { connect } from "@/lib/mongodb/mongoose";
import Chat from "@/lib/models/chat";

export async function GET(request, { params }) {
  try {
    const { chatId } = params;

    await connect();
    const chat = await Chat.findById(chatId).lean();

    if (!chat) {
      return NextResponse.json({ error: 'চ্যাট পাওয়া যায়নি' }, { status: 404 });
    }

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    return NextResponse.json(
      { error: 'চ্যাট লোড করতে ব্যর্থ' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { chatId } = params;

    await connect();
    const chat = await Chat.findByIdAndDelete(chatId);

    if (!chat) {
      return NextResponse.json({ error: 'চ্যাট পাওয়া যায়নি' }, { status: 404 });
    }

    return NextResponse.json({ message: 'চ্যাট মুছে ফেলা হয়েছে' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    return NextResponse.json(
      { error: 'চ্যাট মুছতে ব্যর্থ' },
      { status: 500 }
    );
  }
}
