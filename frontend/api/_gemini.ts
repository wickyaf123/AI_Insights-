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
        const playerStatsPath = path.join(process.cwd(), 'data/NBA_PlayerStats.csv');
        const teamStatsPath = path.join(process.cwd(), 'data/NBA_Team_Stats.csv');

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
    1. **USE REAL DATA ONLY** - Every insight MUST include specific numbers from the CSV files
    2. **NO GENERIC TEXT** - Avoid phrases like "strong performance" or "good shooter" without exact stats
    3. **CITE ACTUAL STATISTICS** - Include exact averages, percentages, and recent game data
    4. **BE ULTRA-CONCISE** - Maximum 1-2 short sentences per insight
    5. **FOCUS ON ACTIONABLE DATA** - Highlight quarter-by-quarter trends, recent form (last 5/10/15 games), and matchup-specific stats

    Selected Players: ${selectedPlayers.join(', ')}
    Team 1: ${team1}
    Team 2: ${team2}

    DATA ANALYSIS INSTRUCTIONS:
    For EACH PLAYER, analyze from NBA_PlayerStats.csv:
    - Quarter-by-quarter scoring patterns (avg_points_q1, q2, q3, q4)
    - Recent form: last 5, 10, 15 games (points_per_game_last5, last10, last15)
    - Rebounds, assists, 3-pointers made per game in recent windows
    - First half vs second half performance (avg_points_first_half_per_game vs avg_points_second_half_per_game)

    For EACH TEAM, analyze from NBA_Team_Stats.csv:
    - Quarter-by-quarter offensive/defensive performance (avg_pts_q1-q4, avg_pts_conc_q1-q4)
    - Win percentages when leading/trailing at different quarters
    - Average win/loss margins
    - Scoring differentials by quarter

    EXAMPLE FORMAT (USE REAL DATA LIKE THIS):
    ✅ GOOD: "LeBron averages 12.5 pts in Q1 vs 6.2 in Q4 (6.3 pt drop-off)"
    ✅ GOOD: "Lakers win 85% (17/20) of games when leading after Q3"
    ✅ GOOD: "Doncic shooting 28% from 3PT over last 5 games (down from 35% season avg)"
    ❌ BAD: "LeBron is a strong scorer" (too generic, no numbers)
    ❌ BAD: "Lakers perform well in close games" (vague, no data)

    OUTPUT FORMAT - Return ONLY valid JSON (no markdown):
    {
      "players": {
        "Player Name": {
          "insights": ["Specific stat with numbers", "Another data point with exact figures", "Recent trend with actual percentages"],
          "strengths": ["Data-backed strength with numbers", "Another strength with stats"],
          "weaknesses": ["Weakness supported by data", "Another weakness with numbers"]
        }
      },
      "team1": {
        "insights": ["Team stat with exact numbers", "Quarter performance data", "Win/loss pattern with percentages"],
        "strengths": ["Strength with supporting data", "Another strength with numbers"],
        "weaknesses": ["Weakness with stats", "Another weakness with data"]
      },
      "team2": {
        "insights": ["Team stat with exact numbers", "Quarter performance data", "Win/loss pattern with percentages"],
        "strengths": ["Strength with supporting data", "Another strength with numbers"],
        "weaknesses": ["Weakness with stats", "Another weakness with data"]
      }
    }

    REMEMBER: Every single insight, strength, and weakness MUST contain specific numbers, percentages, or statistics from the CSV data. NO GENERIC STATEMENTS ALLOWED.
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

