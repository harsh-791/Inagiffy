import { Request, Response } from 'express';
import { z } from 'zod';
import { generateLearningRoadmap } from '../services/llmService';

const requestSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional().default('intermediate'),
});

export async function generateMap(req: Request, res: Response) {
  try {
    // Validate request
    const validationResult = requestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request',
        details: validationResult.error.errors,
      });
    }

    const { topic, level } = validationResult.data;

    // Check for Gemini API key
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Gemini API key not configured',
        message: 'Please set GEMINI_API_KEY in your environment variables',
      });
    }

    // Generate roadmap using LLM
    const roadmap = await generateLearningRoadmap(topic, level);

    res.json({
      success: true,
      data: roadmap,
    });
  } catch (error: any) {
    console.error('Error generating map:', error);
    res.status(500).json({
      error: 'Failed to generate learning map',
      message: error.message || 'An unexpected error occurred',
    });
  }
}

