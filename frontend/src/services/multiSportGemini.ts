import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/files';
import path from 'path';
import fs from 'fs';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey || '');
const fileManager = new GoogleAIFileManager(apiKey || '');

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

// Store file URIs for each sport
interface SportFiles {
  [key: string]: string[];
}

const sportFileUris: SportFiles = {
  nba: [],
  afl: [],
  nrl: [],
  epl: [],
  ipl: []
};

// File paths for each sport - using process.cwd() for Vercel
function getSportFilePaths(sport: string): string[] {
  const basePath = process.cwd();
  
  const sportFilePaths: SportFiles = {
    nba: [
      path.join(basePath, 'data/NBA_PlayerStats.csv'),
      path.join(basePath, 'data/NBA_Team_Stats.csv')
    ],
    afl: [
      path.join(basePath, 'data/AFL_players_1711.csv'),
      path.join(basePath, 'data/AFL_teams_1711.csv')
    ],
    nrl: [
      path.join(basePath, 'data/NRL_Players_recent_try_form141125.csv'),
      path.join(basePath, 'data/NRL_TeamAnalysis.csv')
    ],
    epl: [
      path.join(basePath, 'data/EPL_TeamData_121125.csv')
    ],
    ipl: [
      path.join(basePath, 'data/IPL/Batters_StrikeRateVSBowlerTypeNew.csv'),
      path.join(basePath, 'data/IPL/IPL_21_24_Batting.csv'),
      path.join(basePath, 'data/IPL/IPL_Venue_details.csv'),
      path.join(basePath, 'data/IPL/VenueTossDecisions.csv'),
      path.join(basePath, 'data/IPL/VenueToss_Situation_Details.csv')
    ]
  };
  
  return sportFilePaths[sport] || [];
}

async function uploadSportFiles(sport: string) {
  try {
    const files = getSportFilePaths(sport);
    if (!files.length) {
      throw new Error(`Unknown sport: ${sport}`);
    }

    console.log(`Uploading ${sport.toUpperCase()} files...`);
    console.log(`Working directory: ${process.cwd()}`);
    console.log(`Files to upload:`, files);
    
    sportFileUris[sport] = [];

    for (const filePath of files) {
      console.log(`Attempting to upload: ${filePath}`);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        throw new Error(`File not found: ${filePath}`);
      }
      
      const uploadResult = await fileManager.uploadFile(filePath, {
        mimeType: "text/csv",
        displayName: `${sport.toUpperCase()} - ${path.basename(filePath)}`,
      });

      sportFileUris[sport].push(uploadResult.file.uri);
      console.log(`Uploaded ${sport.toUpperCase()}: ${uploadResult.file.uri}`);
    }

    // Wait for files to be active
    let allActive = false;
    while (!allActive) {
      const fileStates = await Promise.all(
        sportFileUris[sport].map(async (uri) => {
          const fileName = uri.split('/').pop() || '';
          const file = await fileManager.getFile(fileName);
          return file.state === "ACTIVE";
        })
      );

      allActive = fileStates.every(state => state);

      if (!allActive) {
        console.log(`Waiting for ${sport.toUpperCase()} files to process...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log(`${sport.toUpperCase()} files are active and ready.`);
  } catch (error) {
    console.error(`Error uploading ${sport} files:`, error);
    throw error;
  }
}

function getSportPrompt(sport: string, query: any): string {
  const basePrompt = `
    SYSTEM PROMPT — ${sport.toUpperCase()} Insight Generation Engine

    You are an AI that generates SPECIFIC, DATA-DRIVEN insights for ${sport.toUpperCase()} using ACTUAL STATISTICS from the provided CSV files.

    CRITICAL REQUIREMENTS:
    1. **USE REAL DATA ONLY** - Every insight MUST include specific numbers from the CSV files
    2. **NO GENERIC TEXT** - Avoid phrases like "strong performance" without exact stats
    3. **CITE ACTUAL STATISTICS** - Include exact averages, percentages, and recent data
    4. **BE ULTRA-CONCISE** - Maximum 1-2 short sentences per insight
    5. **FOCUS ON ACTIONABLE DATA** - Highlight trends, recent form, and matchup-specific stats
    `;

  switch (sport) {
    case 'nba':
      return `${basePrompt}
    
    Selected Players: ${query.selectedPlayers?.join(', ') || 'N/A'}
    Team 1: ${query.team1 || 'N/A'}
    Team 2: ${query.team2 || 'N/A'}

    DATA ANALYSIS INSTRUCTIONS:
    For EACH PLAYER, analyze from NBA_PlayerStats.csv:
    - Quarter-by-quarter scoring patterns (avg_points_q1, q2, q3, q4)
    - Recent form: last 5, 10, 15 games (points_per_game_last5, last10, last15)
    - Rebounds, assists, 3-pointers made per game
    - First half vs second half performance

    For EACH TEAM, analyze from NBA_Team_Stats.csv:
    - Quarter-by-quarter offensive/defensive performance
    - Win percentages when leading/trailing
    - Average win/loss margins
    - Scoring differentials by quarter

    OUTPUT FORMAT - Return ONLY valid JSON (no markdown):
    {
      "players": {
        "Player Name": {
          "insights": ["Stat with numbers", "Another data point"],
          "strengths": ["Data-backed strength"],
          "weaknesses": ["Weakness with stats"]
        }
      },
      "team1": {
        "insights": ["Team stat with numbers"],
        "strengths": ["Strength with data"],
        "weaknesses": ["Weakness with stats"]
      },
      "team2": {
        "insights": ["Team stat with numbers"],
        "strengths": ["Strength with data"],
        "weaknesses": ["Weakness with stats"]
      }
    }`;

    case 'afl':
      return `${basePrompt}
    
    Selected Players: ${query.selectedPlayers?.join(', ') || 'N/A'}
    Team 1: ${query.team1 || 'N/A'}
    Team 2: ${query.team2 || 'N/A'}

    DATA ANALYSIS INSTRUCTIONS:
    For EACH PLAYER, analyze from AFL_players_1711.csv:
    - Goals scored in last 5 matches (total_goals_scored_last_5_matches)
    - Matches with at least 1 goal (matches_with_at_least_1_goal_last_5_matches)
    - Average disposals per game (average_disposals_per_game_last_5_matches)
    - Matches with 20+ disposals (matches_with_20_or_more_disposals_last_5_matches)

    For EACH TEAM, analyze from AFL_teams_1711.csv:
    - Points scored/conceded in last 5 matches
    - Average score margin
    - Home vs away performance
    - Win percentages at home and away

    OUTPUT FORMAT - Return ONLY valid JSON (no markdown):
    {
      "players": {
        "Player Name": {
          "insights": ["Stat with numbers"],
          "strengths": ["Data-backed strength"],
          "weaknesses": ["Weakness with stats"]
        }
      },
      "team1": {
        "insights": ["Team stat with numbers"],
        "strengths": ["Strength with data"],
        "weaknesses": ["Weakness with stats"]
      },
      "team2": {
        "insights": ["Team stat with numbers"],
        "strengths": ["Strength with data"],
        "weaknesses": ["Weakness with stats"]
      }
    }`;

    case 'nrl':
      return `${basePrompt}
    
    Selected Players: ${query.selectedPlayers?.join(', ') || 'N/A'}
    Team 1: ${query.team1 || 'N/A'}
    Team 2: ${query.team2 || 'N/A'}

    DATA ANALYSIS INSTRUCTIONS:
    For EACH PLAYER, analyze from NRL_Players_recent_try_form141125.csv:
    - Tries in last 5 games (tries_last_5_games)
    - Try assists in last 5 games (try_assists_last_5_games)
    - Games with try (games_with_try_last_5_games)
    - Tries per game average (tries_per_game_last_5_games)
    - Try assists per game (try_assists_per_game_last_5_games)

    For EACH TEAM, analyze from NRL_TeamAnalysis.csv:
    - Points scored/conceded in last 5 matches
    - Average points per match
    - Home vs away win percentages
    - Venue-specific performance

    OUTPUT FORMAT - Return ONLY valid JSON (no markdown):
    {
      "players": {
        "Player Name": {
          "insights": ["Stat with numbers"],
          "strengths": ["Data-backed strength"],
          "weaknesses": ["Weakness with stats"]
        }
      },
      "team1": {
        "insights": ["Team stat with numbers"],
        "strengths": ["Strength with data"],
        "weaknesses": ["Weakness with stats"]
      },
      "team2": {
        "insights": ["Team stat with numbers"],
        "strengths": ["Strength with data"],
        "weaknesses": ["Weakness with stats"]
      }
    }`;

    case 'epl':
      return `${basePrompt}
    
    Team 1: ${query.team1 || 'N/A'}
    Team 2: ${query.team2 || 'N/A'}

    DATA ANALYSIS INSTRUCTIONS:
    For EACH TEAM, analyze from EPL_TeamData_121125.csv:
    - Goals per half (avg_goals_first_half_per_match, avg_goals_second_half_per_match)
    - Home vs away points (avg_points_per_home_match, avg_points_per_away_match)
    - Recent form (wins_in_last_5_games, points_per_game_last_5_games)
    - Win rates when leading/trailing at halftime
    - Average winning/losing margins
    - Shots, fouls, cards statistics

    OUTPUT FORMAT - Return ONLY valid JSON (no markdown):
    {
      "team1": {
        "insights": ["Team stat with numbers"],
        "strengths": ["Strength with data"],
        "weaknesses": ["Weakness with stats"]
      },
      "team2": {
        "insights": ["Team stat with numbers"],
        "strengths": ["Strength with data"],
        "weaknesses": ["Weakness with stats"]
      }
    }`;

    case 'ipl':
      return `${basePrompt}
    
    Selected Players: ${query.selectedPlayers?.join(', ') || 'N/A'}
    Team 1: ${query.team1 || 'N/A'}
    Team 2: ${query.team2 || 'N/A'}
    Venue: ${query.venue || 'N/A'}

    DATA ANALYSIS INSTRUCTIONS:
    For EACH PLAYER, analyze from IPL batting data:
    - Strike rates vs different bowler types
    - Recent batting performance (IPL_21_24_Batting.csv)
    - Venue-specific performance

    For VENUE analysis:
    - Toss decisions and outcomes (VenueTossDecisions.csv)
    - Venue characteristics (IPL_Venue_details.csv)
    - Batting/bowling advantages

    OUTPUT FORMAT - Return ONLY valid JSON (no markdown):
    {
      "players": {
        "Player Name": {
          "insights": ["Stat with numbers"],
          "strengths": ["Data-backed strength"],
          "weaknesses": ["Weakness with stats"]
        }
      },
      "team1": {
        "insights": ["Team stat with numbers"],
        "strengths": ["Strength with data"],
        "weaknesses": ["Weakness with stats"]
      },
      "team2": {
        "insights": ["Team stat with numbers"],
        "strengths": ["Strength with data"],
        "weaknesses": ["Weakness with stats"]
      },
      "venue": {
        "insights": ["Venue stat with numbers"],
        "characteristics": ["Venue characteristic with data"]
      }
    }`;

    default:
      return basePrompt;
  }
}

export async function generateSportInsights(sport: string, query: any) {
  // Ensure files are uploaded
  if (sportFileUris[sport].length === 0) {
    await uploadSportFiles(sport);
  }

  const prompt = getSportPrompt(sport, query);

  try {
    // Prepare file references
    const fileReferences = sportFileUris[sport].map(uri => ({
      fileData: {
        mimeType: "text/csv",
        fileUri: uri
      }
    }));

    // Generate content with file context
    const result = await model.generateContent([
      ...fileReferences,
      { text: prompt }
    ] as any);

    const response = result.response;
    const text = response.text();

    // Clean up JSON response
    const jsonString = text.replace(/```json\n|\n```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error(`Error generating ${sport} insights:`, error);
    throw error;
  }
}

