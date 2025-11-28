import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const cwd = process.cwd();
    const hasGeminiKey = !!process.env.GEMINI_API_KEY;
    const keyLength = process.env.GEMINI_API_KEY?.length || 0;
    
    // Check if CSV files exist
    const csvPaths = [
      'frontend/data/NBA_PlayerStats.csv',
      'frontend/data/NBA_Team_Stats.csv',
      'frontend/data/IPL/IPL_21_24_Batting.csv',
      'frontend/data/EPL_TeamData_121125.csv'
    ];
    
    const fileChecks = csvPaths.map(csvPath => {
      const fullPath = path.join(cwd, csvPath);
      return {
        path: csvPath,
        fullPath,
        exists: fs.existsSync(fullPath),
        isFile: fs.existsSync(fullPath) ? fs.statSync(fullPath).isFile() : false
      };
    });
    
    // List what's in the root directory
    let rootContents: string[] = [];
    try {
      rootContents = fs.readdirSync(cwd);
    } catch (e) {
      rootContents = [`Error: ${e}`];
    }
    
    res.status(200).json({
      cwd,
      hasGeminiKey,
      keyLength: hasGeminiKey ? keyLength : 0,
      fileChecks,
      rootContents,
      nodeVersion: process.version,
      platform: process.platform
    });
  } catch (error) {
    res.status(500).json({
      error: 'Debug endpoint failed',
      message: error instanceof Error ? error.message : String(error)
    });
  }
}

