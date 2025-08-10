import { GoogleGenerativeAI } from '@google/generative-ai';

export function getGemini() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  if (!apiKey) throw new Error('GEMINI_API_KEY missing');
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelId = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  return genAI.getGenerativeModel({ model: modelId });
}

export async function generateSeoArticle({ title, description, transcript }:{ title:string; description?:string; transcript?:string }) {
  const model = getGemini();
  const prompt = `You are writing an SEO-rich blog article to accompany a YouTube video by Mayukh Bagchi, an astronomy researcher specializing in VLBI and black hole imaging.

Video Title: ${title}
Video Description: ${description||''}
Transcript (may be partial): ${transcript?.slice(0, 8000)||''}

Write a comprehensive, factual, and engaging article with:

1. **Hook Introduction** (2-3 sentences): Start with an intriguing fact or question that draws readers in
2. **Main Content** with H2 sections covering:
   - Key concepts explained in accessible language
   - Scientific background and context
   - Real-world applications or implications
   - Latest research or discoveries mentioned
3. **Key Takeaways** (bullet points): 4-6 main insights readers should remember
4. **FAQ Section**: 4-5 common questions with clear, concise answers
5. **Related Topics**: Brief mentions of 2-3 related astronomy concepts with internal link suggestions
6. **Call to Action**: Encourage watching the full video for detailed explanations

Writing Style:
- Academic but accessible, suitable for science enthusiasts and students
- Use proper scientific terminology but explain complex concepts
- Include specific numbers, facts, and research references when available
- Maintain an educational and authoritative tone
- Focus on VLBI, radio astronomy, black holes, and astrophysics themes

SEO Requirements:
- Use the video title as H1 (don't include # in response)
- Include relevant keywords naturally: astronomy, astrophysics, radio astronomy, VLBI, black holes
- Write for featured snippets with clear, definitive answers
- Include semantic keywords related to space science

Return valid Markdown only. No frontmatter. Start directly with content, not the H1 title.`;
  
  const res = await model.generateContent(prompt);
  const text = res.response.text();
  return text?.trim() || `## About This Video

This video covers important concepts in astronomy and astrophysics. 

## Key Points

- Explores fundamental principles of space science
- Discusses current research and discoveries
- Provides educational insights for astronomy enthusiasts

## Watch the Full Video

For a detailed explanation of these concepts, watch the complete video above where I break down the science in an accessible way.

## Related Topics

- Radio Astronomy Fundamentals
- VLBI Technology and Applications
- Black Hole Research Methods

Have questions about this topic? Feel free to reach out through the contact page or leave comments on the YouTube video.`;
}


