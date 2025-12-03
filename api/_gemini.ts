import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/files';
import path from 'path';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey || '');
const fileManager = new GoogleAIFileManager(apiKey || '');

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});

let playerStatsFileUri: string | null = null;
let teamStatsFileUri: string | null = null;

async function uploadFiles() {
    try {
        // Paths to the CSV files - for Vercel, these need to be relative to the project root
        const playerStatsPath = path.join(process.cwd(), 'frontend/data/NBA_PlayerStats.csv');
        const teamStatsPath = path.join(process.cwd(), 'frontend/data/NBA_Team_Stats.csv');

        console.log('Uploading NBA files...');

        const playerStatsUpload = await fileManager.uploadFile(playerStatsPath, {
            mimeType: "text/csv",
            displayName: "NBA Player Stats",
        });
        playerStatsFileUri = playerStatsUpload.file.uri;
        console.log(`Uploaded Player Stats: ${playerStatsUpload.file.uri}`);

        const teamStatsUpload = await fileManager.uploadFile(teamStatsPath, {
            mimeType: "text/csv",
            displayName: "NBA Team Stats",
        });
        teamStatsFileUri = teamStatsUpload.file.uri;
        console.log(`Uploaded Team Stats: ${teamStatsUpload.file.uri}`);

        // Wait for files to be active
        let active = false;
        while (!active) {
            const playerFile = await fileManager.getFile(playerStatsUpload.file.name);
            const teamFile = await fileManager.getFile(teamStatsUpload.file.name);
            if (playerFile.state === "ACTIVE" && teamFile.state === "ACTIVE") {
                active = true;
            } else {
                console.log("Waiting for files to process...");
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        console.log("Files are active and ready for use.");

    } catch (error) {
        console.error('Error uploading files:', error);
        throw error;
    }
}

export async function generateInsights(selectedPlayers: string[], team1: string, team2: string) {
    if (!playerStatsFileUri || !teamStatsFileUri) {
        await uploadFiles();
    }

    const prompt = `
    SYSTEM PROMPT — NBA Insight Generation Engine

    You are an AI that generates SPECIFIC, DATA-DRIVEN insights for NBA teams and players using ACTUAL STATISTICS from the provided CSV files.

    CRITICAL REQUIREMENTS:
    1. **USE REAL DATA WITH CONTEXT** - Every insight MUST include specific numbers AND their league ranking/percentile
    2. **FORM ANALYSIS IS KEY** - Compare L5 vs L10 vs L15 stats to identify significant form changes
    3. **ONLY HIGHLIGHT SIGNIFICANT CHANGES** - Ignore differentials under 2.0 points or 5% changes
    4. **BE ULTRA-SPECIFIC** - Include rankings (e.g., "2nd in league", "top 10%", "ranks 23rd out of 30")
    5. **NO QUARTER-BY-QUARTER ANALYSIS** - Focus on overall performance, recent form, and key matchup stats
    6. **NO DUPLICATION** - Each section (insights, strengths, weaknesses) must have UNIQUE information

    Selected Players: ${selectedPlayers.join(', ')}
    Team 1: ${team1}
    Team 2: ${team2}

    DATA ANALYSIS INSTRUCTIONS:

    For EACH PLAYER from NBA_PlayerStats.csv:
    
    **AI INSIGHTS (3-4 points):**
    - Form trends: Compare L5 vs L10 vs L15 (e.g., "PPG: 28.4 (L5) vs 24.1 (L10) vs 22.8 (L15) - hot streak")
    - Current hot/cold shooting with context (e.g., "42% from 3PT (L5), ranks 3rd among guards")
    - Usage rate or efficiency changes with league ranking
    - Key matchup stats relevant to betting/fantasy (e.g., "averages 12.5 rebounds vs Western Conference teams, top 5 in league")

    **STRENGTHS (2 points):**
    - Dominant statistical categories with league rankings (e.g., "32.1 PPG ranks 2nd in NBA")
    - Elite efficiency metrics with percentiles (e.g., "TS% 67.2%, top 8% in league")

    **WEAKNESSES (2 points):**
    - Significant drops in key stats with rankings (e.g., "FT% 68.5%, ranks 147th among rotation players")
    - Notable form decline if L5 significantly worse than L10/L15 (e.g., "Assists down 27% from season avg")

    For EACH TEAM from NBA_Team_Stats.csv:
    
    **AI INSIGHTS (3-5 points):**
    - Offensive/defensive rating with league ranking (e.g., "115.2 ORTG, 3rd in NBA")
    - Home/away splits with context (e.g., "12-2 at home vs 6-8 on road")
    - Recent form with W-L record (e.g., "Won 8 of last 10, averaging 118.5 PPG in wins")
    - Clutch performance (e.g., "7-3 in games decided by 5 or less, 2nd best in conference")
    - Key statistical edges vs opponent (e.g., "Rank 2nd in 3PT% vs opponent's 24th ranked 3PT defense")

    **STRENGTHS (2-3 points):**
    - Elite statistical rankings (e.g., "1st in pace, 3rd in 3PT%, 5th in rebounds")
    - Dominant trends (e.g., "Winning by avg 14.2 pts at home, highest in division")

    **WEAKNESSES (2-3 points):**
    - Poor rankings in key categories (e.g., "28th in turnovers per game")
    - Exploitable matchup disadvantages (e.g., "Allow 118.5 PPG to top-10 offenses, worst in conference")

    CRITICAL RULES:
    ✅ ALWAYS include league rankings/percentiles (e.g., "2nd in NBA", "top 15%", "ranks 24th")
    ✅ ALWAYS compare L5 vs L10 vs L15 for form analysis
    ✅ ONLY mention changes of 2+ points, 5+ percent, or top/bottom 25% rankings
    ✅ Each section MUST be unique - no repeating stats across insights/strengths/weaknesses
    
    ❌ NEVER use generic phrases without rankings (e.g., "good scorer" → "26.8 PPG, 4th in league")
    ❌ NEVER mention small differentials (e.g., "0.13 PPG difference")
    ❌ NEVER analyze quarter-by-quarter scoring patterns
    ❌ NEVER duplicate information between sections

    EXAMPLES:
    ✅ "Averaging 29.3 PPG over L5 vs 24.1 over L15 (21% increase), ranks 3rd in league during hot streak"
    ✅ "3PT shooting 45.2% (L5), jumped from 37.1% (L10) - now 2nd among qualified shooters"
    ✅ "Lakers rank 2nd in offensive rating (118.4) but 19th in defensive rating (114.7)"
    ❌ "Strong recent performance" (no numbers, no context)
    ❌ "Scores more in Q1 than Q4" (quarter analysis not allowed)
    ❌ "Team is 0.13 PPG better at home" (differential too small)

    OUTPUT FORMAT - Return ONLY valid JSON (no markdown):
    {
      "players": {
        "Player Name": {
          "insights": ["Stat with ranking/context", "Form comparison L5 vs L10 vs L15", "Key matchup stat with league rank"],
          "strengths": ["Elite stat with league ranking", "Another dominant category with percentile"],
          "weaknesses": ["Poor stat with ranking", "Significant form drop with numbers"]
        }
      },
      "team1": {
        "insights": ["Key stat with league rank", "Recent form with W-L", "Matchup advantage with context"],
        "strengths": ["Elite ranking with numbers", "Dominant trend with data"],
        "weaknesses": ["Poor ranking with numbers", "Exploitable weakness with context"]
      },
      "team2": {
        "insights": ["Key stat with league rank", "Recent form with W-L", "Matchup advantage with context"],
        "strengths": ["Elite ranking with numbers", "Dominant trend with data"],
        "weaknesses": ["Poor ranking with numbers", "Exploitable weakness with context"]
      }
    }
  `;

    try {
        // Cast to any to avoid type issues with fileData if types are outdated
        const result = await model.generateContent([
            {
                fileData: {
                    mimeType: "text/csv",
                    fileUri: playerStatsFileUri!
                }
            },
            {
                fileData: {
                    mimeType: "text/csv",
                    fileUri: teamStatsFileUri!
                }
            },
            { text: prompt }
        ] as any);

        const response = result.response;
        const text = response.text();

        // Clean up the response to ensure it's valid JSON
        const jsonString = text.replace(/```json\n|\n```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error('Error generating content:', error);
        throw error;
    }
}

