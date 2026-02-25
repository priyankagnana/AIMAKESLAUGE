import Groq from 'groq-sdk';

export async function generateJoke({ mode, comedian, situation, topic, apiKey }) {
  const client = new Groq({ apiKey, dangerouslyAllowBrowser: true });

  let systemPrompt = '';
  let userPrompt = '';

  if (mode === 'comedian') {
    const styles = {
      'Dave Chappelle': 'Dave Chappelle — raw, street-smart, socially sharp, uses personal stories, code-switches, punches up at power with dark humor and surprising twists.',
      'John Mulaney': 'John Mulaney — wholesome yet absurd, storytelling-driven, self-deprecating, uses theatrical build-ups and perfectly timed punchlines.',
      'Bo Burnham': 'Bo Burnham — meta, cerebral, darkly comedic, self-aware, plays with form and expectation, mixes wit with existential dread.',
      'Hannah Gadsby': 'Hannah Gadsby — subversive, narrative-defying, challenges the joke structure itself, blends humor with emotional truth.',
      'Mitch Hedberg': 'Mitch Hedberg — one-liner king, non-sequitur observations, bizarre lateral thinking, deadpan delivery.',
      'Ali Wong': "Ali Wong — bold, taboo-breaking, intensely personal, uses shock and vulnerability together, women's experiences with raw honesty.",
      'Gabriel Iglesias': 'Gabriel Iglesias (Fluffy) — warm, story-based, character voices, family and culture jokes, big personality.',
      'Norm Macdonald': 'Norm Macdonald — deliberately anti-joke, anti-comedy, absurdist long-form, purposely bad on the surface then devastatingly funny.',
      'Desi Lydic': 'sharp political satire, wit, and incisive social commentary with a feminist lens.',
      'Trevor Noah': 'Trevor Noah — observational cross-cultural comedy, comparing American and global absurdities, charming delivery.',
    };

    systemPrompt = `You are a master comedy writer channeling the exact voice and style of ${comedian}. Style profile: ${styles[comedian] || comedian}. Write exactly ONE joke — setup + punchline — that could realistically appear in their stand-up special. Make it sharp, funny, and unmistakably in their voice. No intro, no explanation, no commentary — just the joke.`;
    userPrompt = topic
      ? `Write a ${comedian}-style joke about: "${topic}"`
      : `Write one killer ${comedian}-style joke on any topic you feel fits their voice best.`;
  } else {
    systemPrompt = `You are a brilliantly funny comedy writer. When given a real-life situation, you write a hilarious, relatable, and punchy joke or comedic bit about it. Use wit, irony, exaggeration, or absurdism — whatever makes it funniest. Output only the joke, no meta-commentary.`;
    userPrompt = `Write a funny joke or comedic bit about this situation: "${situation}"`;
  }

  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 1.1,
    max_tokens: 400,
  });

  return response.choices[0].message.content.trim();
}
