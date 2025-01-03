'use server'

export async function transliterateText(text) {
  if (!text || typeof text !== 'string') {
    console.error('Invalid text input:', text);
    return null;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/transliterate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: text.trim() }),
    });

    if (response.status === 401) {
      console.error('Authentication error: API route requires authentication');
      return null;
    }

    const data = await response.json().catch(() => null);
    
    if (!response.ok || !data) {
      console.error('Transliteration failed:', data?.error || 'Unknown error');
      return null;
    }

    return data.transliteratedText;
  } catch (error) {
    console.error('Transliteration action error:', error);
    return null;
  }
}
