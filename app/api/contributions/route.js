import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Contribution from '@/lib/models/contribution';

export async function POST(req) {
  try {
    await connectToDatabase();
    const { banglishText, banglaText, userId, userName } = await req.json();

    if (!banglishText || !banglaText || !userId || !userName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const contribution = await Contribution.create({
      banglishText,
      banglaText,
      userId,
      userName,
    });

    return NextResponse.json({
      success: true,
      contribution
    });

  } catch (error) {
    console.error('Error creating contribution:', error);
    return NextResponse.json({ error: 'Failed to create contribution' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const isAdmin = searchParams.get('isAdmin') === 'true';

    let query = {};
    
    // If not admin, only show user's own contributions
    if (!isAdmin) {
      if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
      }
      query.userId = userId;
    }

    // Filter by status if provided
    if (status) {
      query.status = status;
    }

    const contributions = await Contribution.find(query).sort({ createdAt: -1 });

    return NextResponse.json(contributions);

  } catch (error) {
    console.error('Error fetching contributions:', error);
    return NextResponse.json({ error: 'Failed to fetch contributions' }, { status: 500 });
  }
}
