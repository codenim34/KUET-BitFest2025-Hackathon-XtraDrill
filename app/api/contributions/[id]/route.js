import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Contribution from '@/lib/models/contribution';

export async function PUT(req, { params }) {
  try {
    await connectToDatabase();
    const { id } = params;
    const { status, adminFeedback } = await req.json();

    const contribution = await Contribution.findById(id);

    if (!contribution) {
      return NextResponse.json({ error: 'Contribution not found' }, { status: 404 });
    }

    // Update the contribution
    contribution.status = status;
    contribution.adminFeedback = adminFeedback;
    contribution.updatedAt = new Date();

    // If approving, store as key-value pair
    if (status === 'approved') {
      contribution.banglishText = contribution.banglishText.trim();
      contribution.banglaText = contribution.banglaText.trim();
    }

    await contribution.save();

    return NextResponse.json({
      success: true,
      contribution
    });

  } catch (error) {
    console.error('Error updating contribution:', error);
    return NextResponse.json({ error: 'Failed to update contribution' }, { status: 500 });
  }
}
