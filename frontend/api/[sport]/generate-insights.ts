import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateSportInsights } from '../_multiSportGemini.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sport } = req.query;
    const validSports = ['nba', 'afl', 'nrl', 'epl', 'ipl'];

    if (!sport || typeof sport !== 'string') {
      return res.status(400).json({ error: 'Sport parameter is required' });
    }

    if (!validSports.includes(sport.toLowerCase())) {
      return res.status(400).json({ 
        error: `Invalid sport. Must be one of: ${validSports.join(', ')}` 
      });
    }

    const insights = await generateSportInsights(sport.toLowerCase(), req.body);
    res.status(200).json(insights);
  } catch (error) {
    console.error(`Error generating ${req.query.sport} insights:`, error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
}

