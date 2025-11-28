import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateInsights } from './_gemini';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { selectedPlayers, team1, team2 } = req.body;

    if (!selectedPlayers || selectedPlayers.length === 0) {
      return res.status(400).json({ error: 'No players selected' });
    }

    const insights = await generateInsights(selectedPlayers, team1, team2);
    res.status(200).json(insights);
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
}

