import { Request, Response } from 'express';
import { z } from 'zod';
import { generateLearningRoadmap, generateRelatedTopics } from '../services/llmService';

const requestSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('intermediate'),
});

export async function generateMap(req: Request, res: Response) {
  try {
    const validationResult = requestSchema.safeParse(req.body);
    if (!validationResult.success) {
      console.log('Invalid request received');
      return res.status(400).json({
        error: 'Invalid request',
        details: validationResult.error.errors,
      });
    }

    const { topic, level } = validationResult.data;
    console.log(`New request: Generating roadmap for "${topic}" (${level} level)`);

    if (!process.env.GEMINI_API_KEY) {
      console.error('Gemini API key not configured');
      return res.status(500).json({
        error: 'Gemini API key not configured',
        message: 'Please set GEMINI_API_KEY in your environment variables',
      });
    }

    console.log('Calling AI to generate roadmap...');
    const roadmap = await generateLearningRoadmap(topic, level);
    console.log(`Roadmap generated: ${roadmap.branches.length} branches`);

    let relatedTopics = { relatedTopics: [], nextLearningPaths: [] };
    try {
      console.log('Generating related topics...');
      relatedTopics = await generateRelatedTopics(topic, roadmap, level);
      console.log(`Generated ${relatedTopics.relatedTopics.length} related topics and ${relatedTopics.nextLearningPaths.length} next paths`);
    } catch (error) {
      console.warn('Couldn't generate related topics, but roadmap is ready');
    }

    console.log('Sending response to client');
    res.json({
      success: true,
      data: {
        ...roadmap,
        relatedTopics: relatedTopics.relatedTopics,
        nextLearningPaths: relatedTopics.nextLearningPaths,
      },
    });
  } catch (error: any) {
    console.error('Error generating map:', error.message);
    res.status(500).json({
      error: 'Failed to generate learning map',
      message: error.message || 'An unexpected error occurred',
    });
  }
}

