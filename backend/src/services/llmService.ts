import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables before creating Gemini client
dotenv.config();

// The client gets the API key from the environment variable GEMINI_API_KEY
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
    // Combine system prompt and user prompt for Gemini
    const fullPrompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;

    // Use the official API format with gemini-2.5-flash
    // Alternative models: 'gemini-2.5-pro' for better quality
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: fullPrompt,
    });

    const content = response.text;

    if (!content) {
      throw new Error('No response from Gemini');
    }

    // Parse JSON response
    let roadmap: LearningRoadmap;
    try {
      roadmap = JSON.parse(content);
    } catch (parseError) {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/) || content.match(/(\{[\s\S]*\})/);
      if (jsonMatch) {
        roadmap = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Failed to parse JSON response from Gemini');
      }
    }

    // Validate structure
    if (!roadmap.topic || !roadmap.branches || !Array.isArray(roadmap.branches)) {
      throw new Error('Invalid roadmap structure received from Gemini');
    }

    // Validate and filter out invalid URLs
    roadmap.branches.forEach((branch) => {
      branch.subtopics.forEach((subtopic) => {
        subtopic.resources = subtopic.resources.filter((resource) => {
          // Basic URL validation
          try {
            const url = new URL(resource.url);
            // Check for common invalid domains
            const invalidDomains = [
              'example.com',
              'placeholder.com',
              'test.com',
              'dummy.com',
              'fake.com',
            ];
            const hostname = url.hostname.toLowerCase();
            
            // Filter out invalid domains
            if (invalidDomains.some((domain) => hostname.includes(domain))) {
              console.warn(`Filtered out invalid URL: ${resource.url}`);
              return false;
            }
            
            // Ensure URL has a valid protocol
            if (!['http:', 'https:'].includes(url.protocol)) {
              return false;
            }
            
            return true;
          } catch (e) {
            // Invalid URL format
            console.warn(`Filtered out malformed URL: ${resource.url}`);
            return false;
          }
        });
      });
    });

    return roadmap;
  } catch (error: any) {
    console.error('Gemini API error:', error);
    throw new Error(`Failed to generate roadmap: ${error.message}`);
  }
}

