import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const EXAMPLES = [
  { input: "ami", output: "আমি" },
  { input: "tumi", output: "তুমি" },
  { input: "bhalo", output: "ভালো" },
  { input: "kemon acho", output: "কেমন আছো" },
  { input: "meye", output: "মেয়ে" },
  { input: "bole", output: "বলে" },
  { input: "kotha", output: "কথা" },
  { input: "sathe", output: "সাথে" },
  { input: "amar", output: "আমার" },
  { input: "tobe", output: "তবে" },
  { input: "she", output: "সে" },
  { input: "je", output: "যে" },
  { input: "ki", output: "কি" },
  { input: "keno", output: "কেন" },
  { input: "hoy", output: "হয়" },
  { input: "hoye", output: "হয়ে" },
  { input: "kore", output: "করে" },
  { input: "korche", output: "করছে" },
  { input: "korlo", output: "করলো" },
  { input: "korbe", output: "করবে" }
];

const formatExamples = EXAMPLES.map(ex => `Input: "${ex.input}" -> "${ex.output}"`).join("\n");

const COMMON_MISTAKES = {
  "bole": "বলে (not বোলে)",
  "kore": "করে (not কোরে)",
  "meye": "মেয়ে (not মেয়)",
  "hoye": "হয়ে (not হোয়ে)",
  "kotha": "কথা (not কোথা)",
  "tobe": "তবে (not তোবে)"
};

const formatMistakes = Object.entries(COMMON_MISTAKES)
  .map(([input, output]) => `Note: "${input}" should be ${output}`)
  .join("\n");

export async function POST(req) {
  try {
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not defined');
      return NextResponse.json({ error: 'GROQ API key not configured' }, { status: 500 });
    }

    const { text } = await req.json();
    console.log('Received text:', text);
    
    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a Banglish to Bangla transliteration system. Your ONLY task is to convert the given Banglish (romanized Bangla) text to Bangla Unicode. 

STRICT OUTPUT RULES:
1. ONLY output the transliterated Bangla text
2. NO explanations
3. NO suggestions
4. NO corrections
5. NO English text
6. NO punctuation
7. NO spaces before or after
8. If unsure, make your best attempt at transliteration
9. NEVER explain what you're doing
10. NEVER ask for clarification

For compound words (multiple words joined), treat them as a single word and transliterate accordingly.

Examples of CORRECT responses:
Input: "ami" -> "আমি"
Input: "tumio" -> "তুমিও"
Input: "kotha" -> "কথা"
Input: "bole" -> "বলে"
Input: "hoye" -> "হয়ে"
Input: "meye" -> "মেয়ে"

Remember: Just output the Bangla text, nothing else.`
        },
        {
          role: "user",
          content: "tumio"
        },
        {
          role: "assistant",
          content: "তুমিও"
        },
        {
          role: "user",
          content: "amio"
        },
        {
          role: "assistant",
          content: "আমিও"
        },
        {
          role: "user",
          content: text
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.1,
      max_tokens: 100,
      stream: false
    });

    let transliteratedText = completion.choices[0]?.message?.content?.trim();
    console.log('Raw GROQ response:', transliteratedText);

    // Clean up the response - remove any explanatory text
    if (transliteratedText) {
      // Remove any text within parentheses
      transliteratedText = transliteratedText.replace(/\(.*?\)/g, '');
      
      // Remove any text after common markers
      transliteratedText = transliteratedText.split(/note:|translation:|meaning:|explanation:|or/i)[0];
      
      // Remove any lines that contain common English words or patterns
      transliteratedText = transliteratedText
        .split('\n')
        .filter(line => !line.match(/^(Input|Output|Note|Here|Sure|I can|This|The|In)/i))[0] || transliteratedText;
      
      // Remove quotes and extra whitespace
      transliteratedText = transliteratedText.replace(/["']/g, '').trim();
      
      // Remove any remaining English text
      transliteratedText = transliteratedText.replace(/[a-zA-Z\s].*$/g, '');
    }

    console.log('Cleaned response:', transliteratedText);

    if (!transliteratedText) {
      console.error('No valid transliteration result from GROQ');
      return NextResponse.json({ error: 'Failed to get transliteration' }, { status: 500 });
    }

    return NextResponse.json({ transliteratedText });
  } catch (error) {
    console.error('Transliteration error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to transliterate text' }, 
      { status: 500 }
    );
  }
}
