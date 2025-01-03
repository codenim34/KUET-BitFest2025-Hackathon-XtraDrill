import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { text } = await req.json();
    
    const client = new TextToSpeechClient();
    
    const request = {
      input: { text },
      voice: { languageCode: 'bn-IN', name: 'bn-IN-Standard-A' },
      audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await client.synthesizeSpeech(request);
    
    return new NextResponse(response.audioContent, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  } catch (error) {
    console.error('Text-to-speech error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
