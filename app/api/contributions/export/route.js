import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Contribution from '@/lib/models/contribution';

export async function GET() {
  try {
    await connectToDatabase();

    // Get all approved contributions
    const contributions = await Contribution.find({ status: 'approved' })
      .select('banglishText banglaText createdAt -_id')
      .lean();

    // Format the data as key-value pairs
    const formattedData = {
      total: contributions.length,
      pairs: contributions.map(c => ({
        banglish: c.banglishText,
        bangla: c.banglaText,
        timestamp: c.createdAt
      }))
    };

    // Return as JSON file
    return new NextResponse(JSON.stringify(formattedData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename=approved_contributions.json'
      }
    });

  } catch (error) {
    console.error('Error exporting contributions:', error);
    return NextResponse.json({ error: 'Failed to export contributions' }, { status: 500 });
  }
}
