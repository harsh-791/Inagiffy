import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const ai = new GoogleGenAI({});

export interface LearningResource {
  type: 'Article' | 'Video' | 'Book' | 'Course';
  title: string;
  url: string;
}

export interface Subtopic {
  name: string;
  description: string;
  resources: LearningResource[];
}

export interface Branch {
  name: string;
  description: string;
  subtopics: Subtopic[];
}

export interface LearningRoadmap {
  topic: string;
  branches: Branch[];
}

export interface RelatedTopic {
  topic: string;
  description: string;
  reason: string;
}

export interface RelatedTopicsResponse {
  relatedTopics: RelatedTopic[];
  nextLearningPaths: RelatedTopic[];
}

const SYSTEM_PROMPT = `You are an expert educational content planner and topic mapper. Given a subject, you generate a structured, hierarchical roadmap breaking it into subtopics, with short descriptions and 1–2 recommended resources per subtopic.

Always respond in strict JSON following this exact schema:
{
  "topic": "string",
  "branches": [
    {
      "name": "string",
      "description": "string",
      "subtopics": [
        {
          "name": "string",
          "description": "string",
          "resources": [
            {
              "type": "Article" | "Video" | "Book" | "Course",
              "title": "string",
              "url": "string"
            }
          ]
        }
      ]
    }
  ]
}

CRITICAL REQUIREMENTS FOR URLS:
- ONLY use real, existing, and accessible URLs from well-known educational platforms
- Use official documentation sites (e.g., developer.mozilla.org, docs.python.org, react.dev)
- Use popular learning platforms (e.g., freecodecamp.org, coursera.org, udemy.com, youtube.com)
- Use official GitHub repositories (github.com)
- Use official documentation for frameworks and libraries
- NEVER create fake URLs or placeholder URLs
- NEVER use example.com, placeholder.com, or any dummy domains
- Verify URLs are from reputable sources before including them
- For books, use Amazon, Goodreads, or official publisher websites
- For videos, use YouTube, Vimeo, or official channel links

Valid URL examples:
- https://developer.mozilla.org/en-US/docs/Web/HTML
- https://react.dev/learn
- https://www.freecodecamp.org/learn
- https://docs.python.org/3/tutorial/
- https://github.com/facebook/react
- https://www.youtube.com/watch?v=...
- https://www.coursera.org/learn/...

Invalid URL examples (DO NOT USE):
- https://example.com/tutorial
- https://placeholder.com/resource
- https://learn-x.com (fake domains)
- Any URL you cannot verify exists

Other Important Rules:
- Return ONLY valid JSON, no markdown, no code blocks
- Include 3-6 main branches
- Each branch should have 3-5 subtopics
- Each subtopic should have 1-2 learning resources
- Descriptions should be concise (1-2 sentences)
- All URLs MUST be real and accessible`;

export async function generateLearningRoadmap(
  topic: string,
  level: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): Promise<LearningRoadmap> {
  const userPrompt = `Generate a learning roadmap for: ${topic}.
Tailor it for ${level} learners.
Include 3–6 main branches, each with 3–5 subtopics and 1–2 learning resources (article/video/book).

CRITICAL: Only include REAL, VERIFIED URLs from:
- Official documentation (MDN, official docs sites)
- Reputable learning platforms (freeCodeCamp, Coursera, Udemy, Khan Academy)
- Official GitHub repositories
- YouTube channels (with real video IDs)
- Official websites and blogs

DO NOT create fake URLs. Every URL must be a real, accessible link that exists on the internet.
Respond only with valid JSON.`;

  try {
    const fullPrompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;

    console.log(`Sending request to Gemini API for: ${topic}`);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    const content = response.text;

    if (!content) {
      throw new Error('No response from Gemini');
    }

    console.log('Received response from Gemini, parsing...');

    let roadmap: LearningRoadmap;
    try {
      roadmap = JSON.parse(content);
    } catch (parseError) {
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || content.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        roadmap = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse JSON response from Gemini');
      }
    }

    if (!roadmap.topic || !roadmap.branches || !Array.isArray(roadmap.branches)) {
      throw new Error('Invalid roadmap structure received from Gemini');
    }

    console.log(`Validating ${roadmap.branches.length} branches and their resources...`);
    let filteredCount = 0;

    roadmap.branches.forEach((branch) => {
      branch.subtopics.forEach((subtopic) => {
        const originalCount = subtopic.resources.length;
        subtopic.resources = subtopic.resources.filter((resource) => {
          try {
            const url = new URL(resource.url);
            const invalidDomains = [
              'example.com',
              'placeholder.com',
              'test.com',
              'dummy.com',
              'fake.com',
            ];
            const hostname = url.hostname.toLowerCase();
            
            if (invalidDomains.some((domain) => hostname.includes(domain))) {
              filteredCount++;
              return false;
            }
            
            if (!['http:', 'https:'].includes(url.protocol)) {
              filteredCount++;
              return false;
            }
            
            return true;
          } catch (e) {
            filteredCount++;
            return false;
          }
        });
      });
    });

    if (filteredCount > 0) {
      console.log(`Filtered out ${filteredCount} invalid resource URLs`);
    }

    console.log('Roadmap validation complete');
    return roadmap;
  } catch (error: any) {
    console.error('Gemini API error:', error);
    throw new Error(`Failed to generate roadmap: ${error.message}`);
  }
}

export async function generateRelatedTopics(
  currentTopic: string,
  roadmap: LearningRoadmap,
  level: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): Promise<RelatedTopicsResponse> {
  const systemPrompt = `You are an expert educational advisor. Given a learning roadmap, suggest:
1. Related topics that complement or expand on the current topic
2. Next learning paths that logically follow after mastering the current topic

Always respond in strict JSON following this exact schema:
{
  "relatedTopics": [
    {
      "topic": "string",
      "description": "string (1-2 sentences)",
      "reason": "string (why this topic is related)"
    }
  ],
  "nextLearningPaths": [
    {
      "topic": "string",
      "description": "string (1-2 sentences)",
      "reason": "string (why this is a good next step)"
    }
  ]
}

Guidelines:
- Suggest 4-6 related topics that are complementary or adjacent to the current topic
- Suggest 3-5 next learning paths that represent logical progression after mastering the current topic
- Make suggestions relevant to ${level} level learners
- Be specific and actionable
- Return ONLY valid JSON, no markdown, no code blocks`;

  const branchNames = roadmap.branches.map(b => b.name).join(', ');
  const userPrompt = `Current learning topic: ${currentTopic}
Current roadmap branches: ${branchNames}

Generate related topics and next learning paths for a ${level} level learner.
Related topics should complement or expand on ${currentTopic}.
Next learning paths should represent what to learn AFTER mastering ${currentTopic}.

Respond only with valid JSON.`;

  try {
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    const content = response.text;

    if (!content) {
      throw new Error('No response from Gemini');
    }

    let relatedTopicsData: RelatedTopicsResponse;
    try {
      relatedTopicsData = JSON.parse(content);
    } catch (parseError) {
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || content.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        relatedTopicsData = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse JSON response from Gemini');
      }
    }

    if (!relatedTopicsData.relatedTopics || !Array.isArray(relatedTopicsData.relatedTopics) ||
        !relatedTopicsData.nextLearningPaths || !Array.isArray(relatedTopicsData.nextLearningPaths)) {
      throw new Error('Invalid related topics structure received from Gemini');
    }

    relatedTopicsData.relatedTopics = relatedTopicsData.relatedTopics.slice(0, 6);
    relatedTopicsData.nextLearningPaths = relatedTopicsData.nextLearningPaths.slice(0, 5);

    return relatedTopicsData;
  } catch (error: any) {
    console.error('Gemini API error generating related topics:', error);
    return {
      relatedTopics: [],
      nextLearningPaths: [],
    };
  }
}

