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

Important:
- Return ONLY valid JSON, no markdown, no code blocks
- Include 3-6 main branches
- Each branch should have 3-5 subtopics
- Each subtopic should have 1-2 learning resources
- Ensure all URLs are valid and accessible
- Descriptions should be concise (1-2 sentences)`;

export async function generateLearningRoadmap(
  topic: string,
  level: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'
): Promise<LearningRoadmap> {
  const userPrompt = `Generate a learning roadmap for: ${topic}.
Tailor it for ${level} learners.
Include 3–6 main branches, each with 3–5 subtopics and 1–2 learning resources (article/video/book).
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

    return roadmap;
  } catch (error: any) {
    console.error('Gemini API error:', error);
    throw new Error(`Failed to generate roadmap: ${error.message}`);
  }
}

