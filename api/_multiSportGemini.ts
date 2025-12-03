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

// File paths for each sport - using path.join for Vercel
function getSportFilePaths(sport: string): string[] {
  // In Vercel, process.cwd() points to the root directory
  // Data folder is at frontend/data/
  const basePath = path.join(process.cwd(), 'frontend/data');
  
  const sportFilePaths: SportFiles = {
    nba: [
      path.join(basePath, 'NBA_PlayerStats.csv'),
      path.join(basePath, 'NBA_Team_Stats.csv')
    ],
    afl: [
      path.join(basePath, 'AFL_players_1711.csv'),
      path.join(basePath, 'AFL_teams_1711.csv')
    ],
    nrl: [
      path.join(basePath, 'NRL_Players_recent_try_form141125.csv'),
      path.join(basePath, 'NRL_TeamAnalysis.csv')
    ],
    epl: [
      path.join(basePath, 'EPL_TeamData_121125.csv')
    ],
    ipl: [
      path.join(basePath, 'IPL/Batters_StrikeRateVSBowlerTypeNew.csv'),
      path.join(basePath, 'IPL/IPL_21_24_Batting.csv'),
      path.join(basePath, 'IPL/IPL_Venue_details.csv'),
      path.join(basePath, 'IPL/VenueTossDecisions.csv'),
      path.join(basePath, 'IPL/VenueToss_Situation_Details.csv')
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
    1. **USE REAL DATA WITH CONTEXT** - Every insight MUST include specific numbers AND their league ranking/percentile
    2. **FORM ANALYSIS IS KEY** - Compare recent form windows (L5 vs L10 vs L15 where available) to identify significant changes
    3. **ONLY HIGHLIGHT SIGNIFICANT CHANGES** - Ignore small differentials; focus on top/bottom performers and notable trends
    4. **BE ULTRA-SPECIFIC** - Include rankings (e.g., "2nd in league", "top 10%", "ranks 18th out of 20")
    5. **NO DUPLICATION** - Each section (insights, strengths, weaknesses) must have UNIQUE information
    6. **ACTIONABLE DATA** - Focus on stats that matter for betting, fantasy, or genuine fan interest
    `;

  switch (sport) {
    case 'nba':
      return `${basePrompt}
    
    Selected Players: ${query.selectedPlayers?.join(', ') || 'N/A'}
    Team 1: ${query.team1 || 'N/A'}
    Team 2: ${query.team2 || 'N/A'}

    DATA ANALYSIS INSTRUCTIONS:

    For EACH PLAYER from NBA_PlayerStats.csv:
    
    **AI INSIGHTS (3-4 points):**
    - Form trends: Compare L5 vs L10 vs L15 (e.g., "PPG: 28.4 (L5) vs 24.1 (L10) vs 22.8 (L15) - hot streak")
    - Current hot/cold shooting with league context (e.g., "42% from 3PT (L5), ranks 3rd among guards")
    - Usage/efficiency metrics with league ranking
    - Key matchup advantages (e.g., "12.5 RPG vs West teams, top 5 in league")

    **STRENGTHS (2 points):**
    - Dominant statistical categories with league rankings (e.g., "32.1 PPG ranks 2nd in NBA")
    - Elite efficiency metrics with percentiles (e.g., "TS% 67.2%, top 8% in league")

    **WEAKNESSES (2 points):**
    - Significant drops in key stats with rankings (e.g., "FT% 68.5%, ranks 147th")
    - Notable form decline: L5 significantly worse than L10/L15 (e.g., "Assists down 27% from season avg")

    For EACH TEAM from NBA_Team_Stats.csv:
    
    **AI INSIGHTS (3-5 points):**
    - Offensive/defensive rating with league ranking (e.g., "115.2 ORTG, 3rd in NBA")
    - Home/away splits (e.g., "12-2 at home vs 6-8 on road")
    - Recent form with W-L (e.g., "Won 8 of last 10, averaging 118.5 PPG")
    - Clutch performance (e.g., "7-3 in close games, 2nd in conference")
    - Key matchup edges (e.g., "2nd in 3PT% vs opponent's 24th ranked 3PT defense")

    **STRENGTHS (2-3 points):**
    - Elite statistical rankings (e.g., "1st in pace, 3rd in 3PT%, 5th in rebounds")
    - Dominant trends (e.g., "Winning by 14.2 pts at home, highest in division")

    **WEAKNESSES (2-3 points):**
    - Poor rankings in key categories (e.g., "28th in turnovers per game")
    - Exploitable matchups (e.g., "Allow 118.5 PPG to top-10 offenses, worst in conference")

    CRITICAL RULES:
    ✅ ALWAYS include league rankings/percentiles
    ✅ ALWAYS compare L5 vs L10 vs L15 for form analysis
    ✅ ONLY mention significant changes (2+ pts, 5+ %, or top/bottom 25%)
    ✅ Each section MUST be unique - no repeating stats
    
    ❌ NEVER use generic phrases without rankings
    ❌ NEVER mention small differentials (< 2 pts or < 5%)
    ❌ NEVER analyze quarter-by-quarter scoring
    ❌ NEVER duplicate info between sections

    OUTPUT FORMAT - Return ONLY valid JSON (no markdown):
    {
      "players": {
        "Player Name": {
          "insights": ["Stat with ranking", "Form comparison L5 vs L10 vs L15", "Key matchup stat with rank"],
          "strengths": ["Elite stat with league ranking", "Another dominant category"],
          "weaknesses": ["Poor stat with ranking", "Significant form drop"]
        }
      },
      "team1": {
        "insights": ["Key stat with rank", "Recent form W-L", "Matchup advantage"],
        "strengths": ["Elite ranking", "Dominant trend"],
        "weaknesses": ["Poor ranking", "Exploitable weakness"]
      },
      "team2": {
        "insights": ["Key stat with rank", "Recent form W-L", "Matchup advantage"],
        "strengths": ["Elite ranking", "Dominant trend"],
        "weaknesses": ["Poor ranking", "Exploitable weakness"]
      }
    }`;

    case 'afl':
      return `${basePrompt}
    
    Selected Players: ${query.selectedPlayers?.join(', ') || 'N/A'}
    Team 1: ${query.team1 || 'N/A'}
    Team 2: ${query.team2 || 'N/A'}

    DATA ANALYSIS INSTRUCTIONS:
    
    For EACH PLAYER from AFL_players_1711.csv:
    
    **AI INSIGHTS (3-4 points):**
    - Goal scoring form (e.g., "6 goals in L5 matches, scoring in 4 of 5 games")
    - Disposal efficiency with ranking if available (e.g., "28.4 disposals/game in L5")
    - Key trends in recent matches (e.g., "20+ disposals in 4 of L5 matches")
    - Position-specific dominance (e.g., "Most goals by a midfielder in L5 rounds")

    **STRENGTHS (2 points):**
    - Elite statistical categories (e.g., "Averaging 2.1 goals/game, top 5 in league")
    - Consistent performance metrics (e.g., "20+ disposals in 12 of 15 matches")

    **WEAKNESSES (2 points):**
    - Scoring droughts or inconsistency (e.g., "Goalless in 3 of L5 matches")
    - Below-average metrics (e.g., "14.2 disposals/game, below team average of 19.5")

    For EACH TEAM from AFL_teams_1711.csv:
    
    **AI INSIGHTS (3-5 points):**
    - Scoring average with context (e.g., "94.2 pts/game in L5, up from 86.1 season avg")
    - Recent form (e.g., "4-1 in L5 matches, won last 3 straight")
    - Home/away performance (e.g., "8-2 at home vs 3-7 away")
    - Defensive metrics (e.g., "Conceding 78.4 pts/game, 3rd best defense")
    - Scoring margins (e.g., "Winning by avg 22.6 pts, dominant form")

    **STRENGTHS (2-3 points):**
    - Elite rankings (e.g., "1st in scoring, 2nd in disposals")
    - Strong home fortress (e.g., "Unbeaten in 9 home games")

    **WEAKNESSES (2-3 points):**
    - Poor away record (e.g., "1-6 away from home")
    - Defensive concerns (e.g., "Conceding 95+ pts in L4 matches")

    CRITICAL RULES:
    ✅ ALWAYS provide context and rankings where possible
    ✅ Focus on recent form (L5 matches is standard for AFL)
    ✅ Home/away splits are crucial
    ✅ Each section MUST be unique
    
    ❌ NEVER use generic phrases without specific numbers
    ❌ NEVER mention insignificant changes
    ❌ NEVER duplicate info between sections

    OUTPUT FORMAT - Return ONLY valid JSON (no markdown):
    {
      "players": {
        "Player Name": {
          "insights": ["Goal form with numbers", "Disposal stats", "Recent trend", "Position dominance"],
          "strengths": ["Elite category with ranking", "Consistent metric"],
          "weaknesses": ["Inconsistency with data", "Below-average stat"]
        }
      },
      "team1": {
        "insights": ["Scoring avg with context", "Recent form W-L", "Home/away split", "Defensive metric"],
        "strengths": ["Elite ranking", "Strong home record"],
        "weaknesses": ["Poor away record", "Defensive concern"]
      },
      "team2": {
        "insights": ["Scoring avg with context", "Recent form W-L", "Home/away split", "Defensive metric"],
        "strengths": ["Elite ranking", "Strong home record"],
        "weaknesses": ["Poor away record", "Defensive concern"]
      }
    }`;

    case 'nrl':
      return `${basePrompt}
    
    Selected Players: ${query.selectedPlayers?.join(', ') || 'N/A'}
    Team 1: ${query.team1 || 'N/A'}
    Team 2: ${query.team2 || 'N/A'}

    DATA ANALYSIS INSTRUCTIONS:
    
    For EACH PLAYER from NRL_Players_recent_try_form141125.csv:
    
    **AI INSIGHTS (3-4 points):**
    - Try scoring form (e.g., "5 tries in L5 games, scoring in 4 of 5 matches")
    - Try assist production (e.g., "7 try assists in L5, leading playmaker form")
    - Scoring consistency (e.g., "Scored in 4 of L5 games vs 6 of L10")
    - Position ranking if evident (e.g., "Most tries by a winger in last 5 rounds")

    **STRENGTHS (2 points):**
    - Elite try-scoring with numbers (e.g., "1.2 tries/game in L5, top 5 in NRL")
    - Playmaking ability (e.g., "1.4 try assists/game, leading all halfbacks")

    **WEAKNESSES (2 points):**
    - Try drought (e.g., "0 tries in L3 games after hot streak")
    - Inconsistent production (e.g., "Only 2 tries in L5 vs 6 in previous 5")

    For EACH TEAM from NRL_TeamAnalysis.csv:
    
    **AI INSIGHTS (3-5 points):**
    - Points scored with context (e.g., "28.4 pts/game in L5, 4th highest in NRL")
    - Recent form (e.g., "4-1 in L5, riding 4-game winning streak")
    - Home/away splits (e.g., "9-2 at home vs 4-7 away")
    - Defensive strength (e.g., "Conceding 16.2 pts/game, 2nd best defense")
    - Venue-specific dominance (e.g., "7-0 at home venue, fortress mentality")

    **STRENGTHS (2-3 points):**
    - Elite rankings (e.g., "1st in points scored, 3rd in defense")
    - Strong home record (e.g., "Unbeaten at home in 2024")

    **WEAKNESSES (2-3 points):**
    - Poor away form (e.g., "2-8 away from home, worst road record in top 8")
    - Defensive lapses (e.g., "Conceded 30+ pts in 4 of L6 games")

    CRITICAL RULES:
    ✅ ALWAYS provide context and rankings where possible
    ✅ Focus on recent form (L5 games is standard for NRL)
    ✅ Try-scoring and try assists are the key metrics
    ✅ Home/away and venue splits are crucial
    ✅ Each section MUST be unique
    
    ❌ NEVER use generic phrases without specific numbers
    ❌ NEVER mention insignificant changes
    ❌ NEVER duplicate info between sections

    OUTPUT FORMAT - Return ONLY valid JSON (no markdown):
    {
      "players": {
        "Player Name": {
          "insights": ["Try form with numbers", "Try assist production", "Scoring consistency", "Position ranking"],
          "strengths": ["Elite try-scoring with numbers", "Playmaking ability"],
          "weaknesses": ["Try drought with data", "Inconsistent production"]
        }
      },
      "team1": {
        "insights": ["Points with context", "Recent form W-L", "Home/away split", "Defensive strength"],
        "strengths": ["Elite ranking", "Strong home record"],
        "weaknesses": ["Poor away form", "Defensive lapse"]
      },
      "team2": {
        "insights": ["Points with context", "Recent form W-L", "Home/away split", "Defensive strength"],
        "strengths": ["Elite ranking", "Strong home record"],
        "weaknesses": ["Poor away form", "Defensive lapse"]
      }
    }`;

    case 'epl':
      return `${basePrompt}
    
    Team 1: ${query.team1 || 'N/A'}
    Team 2: ${query.team2 || 'N/A'}

    DATA ANALYSIS INSTRUCTIONS:
    For EACH TEAM, analyze from EPL_TeamData_121125.csv:

    **AI INSIGHTS (4-5 points):**
    - Goals scored with league ranking (e.g., "2.4 goals/game, 3rd in EPL")
    - First half vs second half performance with context (e.g., "1.6 goals in 2nd half vs 0.8 in 1st, ranks 2nd for 2nd half goals")
    - Recent form with context (e.g., "4 wins in L5, unbeaten in 8, currently on 6-game winning streak")
    - Home/away splits with rankings (e.g., "2.1 pts/game at home (4th) vs 1.3 away (14th)")
    - Key attacking/defensive metrics with rankings (e.g., "72% possession avg, 1st in league")
    - Halftime leading/trailing performance (e.g., "Won 14 of 15 when leading at HT, 93% conversion rate")

    **STRENGTHS (2-3 points):**
    - Elite attacking metrics with rankings (e.g., "5.2 shots on target/game, 1st in EPL")
    - Strong defensive stats with context (e.g., "0.6 goals conceded/game, 2nd best defense")
    - Dominant home record or winning margins (e.g., "Won 12 of 14 home games, +24 goal diff")

    **WEAKNESSES (2-3 points):**
    - Poor rankings in key areas (e.g., "4.2 fouls/game, 18th in discipline")
    - Exploitable defensive/offensive issues with rankings (e.g., "Concede 1.8 goals/game away, 16th worst")
    - Form concerns (e.g., "0 wins in L5 away games, scored only 2 goals")

    CRITICAL RULES FOR EPL:
    ✅ ALWAYS include league rankings (e.g., "1st in EPL", "ranks 12th out of 20")
    ✅ First/second half analysis IS relevant for soccer (unlike quarters in NBA)
    ✅ Recent form (L5, L10) and current streaks are crucial
    ✅ Home/away splits are very important - always include with context
    ✅ Halftime leading/trailing stats provide great betting context
    ✅ Each section MUST be unique - no repeating stats
    
    ❌ NEVER use generic phrases without rankings
    ❌ NEVER mention insignificant differentials (< 0.3 goals or < 10%)
    ❌ NEVER duplicate information between sections
    ❌ NEVER omit league context/rankings

    EXAMPLES:
    ✅ "Averaging 2.6 goals/game (2nd in EPL), with 1.8 coming in 2nd half (1st in league for 2nd half goals)"
    ✅ "Won 12 of 14 home games (86%, 3rd best) vs only 4 of 13 away (31%, 15th)"
    ✅ "4 wins in L5 games, currently on 6-game winning streak, best form in last 10 years"
    ✅ "14-1-0 record when leading at halftime (93% win rate, 2nd in EPL)"
    ❌ "Good attacking team" (no numbers, no context)
    ❌ "Slightly better at home" (too vague)
    ❌ "Scores 0.2 more goals in 2nd half" (differential too small)

    OUTPUT FORMAT - Return ONLY valid JSON (no markdown):
    {
      "team1": {
        "insights": ["Goal scoring with rank", "Half performance with context", "Recent form streak", "Home/away split with ranks", "Key metric with ranking"],
        "strengths": ["Elite attacking stat with rank", "Strong defensive stat with rank", "Dominant record"],
        "weaknesses": ["Poor ranking in key area", "Exploitable issue with context", "Form concern with data"]
      },
      "team2": {
        "insights": ["Goal scoring with rank", "Half performance with context", "Recent form streak", "Home/away split with ranks", "Key metric with ranking"],
        "strengths": ["Elite attacking stat with rank", "Strong defensive stat with rank", "Dominant record"],
        "weaknesses": ["Poor ranking in key area", "Exploitable issue with context", "Form concern with data"]
      }
    }`;

    case 'ipl':
      return `${basePrompt}
    
    Selected Players: ${query.selectedPlayers?.join(', ') || 'N/A'}
    Team 1: ${query.team1 || 'N/A'}
    Team 2: ${query.team2 || 'N/A'}
    Venue: ${query.venue || 'N/A'}

    DATA ANALYSIS INSTRUCTIONS:
    
    For EACH PLAYER from IPL batting data:
    
    **AI INSIGHTS (3-4 points):**
    - Recent strike rate with context (e.g., "SR 165 in last 5 innings, up from 142 season avg")
    - Performance vs bowler types (e.g., "SR 180 vs pace, 125 vs spin - targets pace bowling")
    - Venue-specific dominance (e.g., "Averages 52 at this venue vs 38 overall")
    - Recent form comparison (e.g., "Scored 280 runs in L5 vs 180 in previous 5")

    **STRENGTHS (2 points):**
    - Elite strike rate or average with ranking (e.g., "SR 158, 3rd highest among openers")
    - Dominance vs specific bowling (e.g., "SR 195 vs pace, highest in tournament")

    **WEAKNESSES (2 points):**
    - Struggle vs bowler type (e.g., "SR 98 vs spin, 15th percentile")
    - Poor venue record (e.g., "Averages 18 at this venue in 8 innings")

    For TEAMS and VENUE:
    
    **TEAM INSIGHTS (3-4 points each):**
    - Team scoring rate at venue (e.g., "180.5 avg score at this venue, 2nd highest")
    - Recent form (e.g., "Won 4 of L5 matches, chasing successfully in all 4")
    - Batting/bowling lineup strengths with rankings
    - Head-to-head record (e.g., "Won 7 of last 10 against opponent")

    **VENUE INSIGHTS (3-4 points):**
    - Average scores (e.g., "1st innings avg 185, 2nd innings avg 172 - batting first advantage")
    - Toss significance (e.g., "Toss winners win 68% of matches, bat first 82% of time")
    - Pace vs spin effectiveness (e.g., "Pace avg 26.5, spin avg 32.1 - pacers dominate")
    - Recent trends (e.g., "Last 5 matches averaged 195 runs, up from 178 season avg")

    CRITICAL RULES FOR IPL:
    ✅ Strike rate is the key metric - always include with context
    ✅ Bowler type matchups are crucial (pace vs spin)
    ✅ Venue characteristics heavily influence outcomes
    ✅ Toss and batting order decisions are very significant
    ✅ Recent form windows matter (L5 vs season avg)
    ✅ Each section MUST be unique
    
    ❌ NEVER use generic phrases without specific numbers
    ❌ NEVER ignore venue context
    ❌ NEVER duplicate info between sections

    EXAMPLES:
    ✅ "SR 172 in L5 innings vs 145 season avg - hot form with bat"
    ✅ "SR 188 vs pace (2nd in IPL) but 112 vs spin (below avg) - targets pacers"
    ✅ "Averages 58 at Wankhede in 12 innings, highest among active players"
    ✅ "Toss winners bat first 85% of time and win 72% - toss crucial at this venue"

    OUTPUT FORMAT - Return ONLY valid JSON (no markdown):
    {
      "players": {
        "Player Name": {
          "insights": ["Recent SR with context", "Bowler type matchup", "Venue performance", "Form comparison"],
          "strengths": ["Elite SR with ranking", "Dominance vs bowling type"],
          "weaknesses": ["Struggle vs type", "Poor venue record"]
        }
      },
      "team1": {
        "insights": ["Venue scoring rate", "Recent form", "Lineup strengths", "H2H record"],
        "strengths": ["Elite ranking", "Strong record"],
        "weaknesses": ["Poor matchup", "Weakness at venue"]
      },
      "team2": {
        "insights": ["Venue scoring rate", "Recent form", "Lineup strengths", "H2H record"],
        "strengths": ["Elite ranking", "Strong record"],
        "weaknesses": ["Poor matchup", "Weakness at venue"]
      },
      "venue": {
        "insights": ["Average scores", "Toss significance", "Pace vs spin", "Recent trends"],
        "characteristics": ["Batting/bowling advantage", "Key tactical factor"]
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

