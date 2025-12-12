import { useState } from "react";
import { motion } from "framer-motion";
import { PlayerCard } from "@/components/nba/PlayerCard";
import { SportLayout } from "@/components/layouts/SportLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BentoCard } from "@/components/ui/bento-card";
import { StreamingStatus } from "@/components/ui/streaming-status";
import { useSidebar } from "@/components/ui/animated-sidebar";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateNBAPPT } from "@/lib/pptGenerator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getApiUrl, insightsApi } from "@/lib/api";
import { EditableInsightsList } from "@/components/insights/EditableInsightsList";

const NBASidebar = ({
  selectedPlayers,
  onPlayerToggle,
  onGenerate,
  onDownload,
  isDownloading,
  isGenerating
}: any) => {
  const { open } = useSidebar();

  if (!open) return null;

  const allPlayers = [
    "Dalton Knecht",
    "LeBron James",
    "Anthony Davis",
    "Austin Reaves",
    "Caleb Martin",
    "Luka Doncic",
    "Kyrie Irving",
    "Dereck Lively II"
  ];

  return (
    <div className="space-y-4 animate-in fade-in-50 duration-300">
      <div>
        <h3 className="text-sm font-semibold text-wicky-green mb-3">Lakers vs Mavericks</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Select Players</label>
            <Select
              value={selectedPlayers[selectedPlayers.length - 1] || ""}
              onValueChange={(value) => {
                if (!selectedPlayers.includes(value)) {
                  onPlayerToggle(value);
                }
              }}
            >
              <SelectTrigger className="bg-secondary/50 border-border h-9">
                <SelectValue placeholder="Add a player" />
              </SelectTrigger>
              <SelectContent className="z-[200] bg-card border-border">
                {allPlayers.map((player) => (
                  <SelectItem
                    key={player}
                    value={player}
                    disabled={selectedPlayers.includes(player)}
                  >
                    {player}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPlayers.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Selected Players</label>
              <div className="space-y-1">
                {selectedPlayers.map((player: string) => (
                  <div key={player} className="flex items-center justify-between bg-secondary/30 px-3 py-2 rounded-md">
                    <span className="text-sm">{player}</span>
                    <button
                      onClick={() => onPlayerToggle(player)}
                      className="text-xs text-danger hover:text-danger/80"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={onGenerate}
        disabled={isGenerating}
        className="w-full bg-wicky-green hover:bg-wicky-green-dark text-wicky-navy font-semibold gradient-primary h-9"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          "Generate Insights"
        )}
      </Button>

      <Button
        onClick={onDownload}
        disabled={isDownloading}
        variant="outline"
        className="w-full border-wicky-green/50 hover:bg-wicky-green/10 text-wicky-green hover:text-wicky-green h-9"
      >
        {isDownloading ? (
          <>
            <div className="w-4 h-4 border-2 border-wicky-green border-t-transparent rounded-full animate-spin mr-2" />
            Downloading...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Download PPT
          </>
        )}
      </Button>
    </div>
  );
};

const NBA = () => {
  const [selectedPlayers, setSelectedPlayers] = useState(["LeBron James", "Anthony Davis"]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingStep, setStreamingStep] = useState(0);
  const [insightsData, setInsightsData] = useState<any>(null);
  const [streamedText, setStreamedText] = useState("");
  const [editedInsights, setEditedInsights] = useState<any>({});
  const { toast } = useToast();

  const handlePlayerToggle = (playerName: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerName)
        ? prev.filter((p) => p !== playerName)
        : [...prev, playerName]
    );
  };

  const parsePartialJSON = (text: string) => {
    if (!text || !text.trim()) {
      return null;
    }

    // Remove markdown code fences (multiple variations)
    let cleaned = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .replace(/^\s*json\s*/i, '')
      .trim();
    
    // Try to find JSON object boundaries
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }
    
    // Fix common JSON issues from AI responses
    cleaned = cleaned
      .replace(/[\u2018\u2019]/g, "'")  // Smart single quotes to straight quotes
      .replace(/[\u201C\u201D]/g, '"')  // Smart double quotes to straight quotes
      .replace(/[\u2013\u2014]/g, '-')  // Em/en dashes to hyphens
      .replace(/\u2026/g, '...')        // Ellipsis to three dots
      .replace(/[\u00A0]/g, ' ');       // Non-breaking spaces to regular spaces
    
    // Attempt 1: Parse as-is
    try {
      const parsed = JSON.parse(cleaned);
      console.log('[NBA Parse Success] Parsed data structure:', Object.keys(parsed));
      return parsed;
    } catch (e) {
      console.error('[NBA Parse Error] Initial parse failed:', e);
    }
    
    // Attempt 2: Remove trailing commas
    try {
      const fixed = cleaned.replace(/,(\s*[}\]])/g, '$1');
      const parsed = JSON.parse(fixed);
      console.log('[NBA Parse Success] ✅ Fixed with trailing comma removal');
      return parsed;
    } catch (e2) {
      console.error('[NBA Parse Error] Trailing comma fix failed');
      
      // Try to identify the specific error position and fix it
      if (e2 instanceof SyntaxError && e2.message.includes('position')) {
        try {
          const posMatch = e2.message.match(/position (\d+)/);
          if (posMatch) {
            const errorPos = parseInt(posMatch[1]);
            console.log(`[NBA Repair] Attempting targeted fix at position ${errorPos}`);
            
            // Try adding a comma at the error position
            const withComma = fixed.substring(0, errorPos) + ',' + fixed.substring(errorPos);
            const commaFixed = withComma.replace(/,(\s*[}\]])/g, '$1'); // Clean up any double commas
            const parsed = JSON.parse(commaFixed);
            console.log('[NBA Parse Success] ✅ Fixed with targeted comma insertion');
            return parsed;
          }
        } catch (e2b) {
          console.error('[NBA Parse Error] Targeted comma fix failed');
        }
      }
    }
    
    // Attempt 3: Fix missing closing braces
    try {
      let repaired = cleaned;
      const openBraces = (repaired.match(/\{/g) || []).length;
      const closeBraces = (repaired.match(/\}/g) || []).length;
      
      if (openBraces > closeBraces) {
        const missing = openBraces - closeBraces;
        console.log(`[NBA Repair] Adding ${missing} missing closing braces`);
        repaired += '\n  '.repeat(Math.max(0, missing - 1)) + '}'.repeat(missing);
        
        // Also remove trailing commas after adding braces
        repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
        
        const parsed = JSON.parse(repaired);
        console.log('[NBA Parse Success] ✅ Fixed with brace repair');
        return parsed;
      }
    } catch (e3) {
      console.error('[NBA Parse Error] Brace repair failed:', e3);
    }
    
    // Attempt 4: Try to fix the specific error by looking at context
    try {
      console.log('[NBA Repair] Attempting contextual repair');
      let repaired = cleaned;
      
      // Look for common patterns that break JSON:
      // 1. String values that aren't properly closed before next element
      // 2. Missing commas between array elements or object properties
      
      // Fix pattern: "text"  \n  "text" (missing comma between strings)
      repaired = repaired.replace(/("\s*)\n(\s*")/g, '",\n$2');
      
      // Fix pattern: }  \n  { (missing comma between objects)
      repaired = repaired.replace(/(\})\s*\n\s*(\{)/g, '$1,\n$2');
      
      // Fix pattern: ]  \n  "key": (missing comma after array)
      repaired = repaired.replace(/(\])\s*\n\s*(")/g, '$1,\n$2');
      
      // Clean up trailing commas again
      repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
      
      const parsed = JSON.parse(repaired);
      console.log('[NBA Parse Success] ✅ Fixed with contextual repair');
      return parsed;
    } catch (e4) {
      console.error('[NBA Parse Error] Contextual repair failed:', e4);
    }
    
    // Attempt 5: Fix unclosed strings and close everything (preserve as much as possible)
    try {
      let repaired = cleaned;
      
      // Try to close unclosed strings by finding the last complete quote pair
      const quoteCount = (repaired.match(/"/g) || []).length - (repaired.match(/\\"/g) || []).length;
      
      if (quoteCount % 2 === 1) {
        console.log('[NBA Repair] Attempting to close unclosed string and preserve structure');
        // Find last quote and close it properly
        const lastQuoteIndex = repaired.lastIndexOf('"');
        if (lastQuoteIndex > 0 && repaired[lastQuoteIndex - 1] !== '\\') {
          // Instead of truncating, close the string and continue
          let after = repaired.substring(lastQuoteIndex + 1);
          
          // Try to find where we are in the structure
          if (after.includes('team1') || after.includes('team2')) {
            // We still have team data, try to preserve it
            repaired = repaired.substring(0, lastQuoteIndex + 1) + '"' + after;
          } else {
            // Close the array and object, then add team structures
            repaired = repaired.substring(0, lastQuoteIndex + 1) + '"\n      ]\n    }\n  },\n  "team1": {},\n  "team2": {}\n}';
          }
        }
      }
      
      // Ensure proper closing
      const openBraces = (repaired.match(/\{/g) || []).length;
      const closeBraces = (repaired.match(/\}/g) || []).length;
      
      if (openBraces > closeBraces) {
        const missing = openBraces - closeBraces;
        repaired += '\n}'.repeat(missing);
      }
      
      repaired = repaired.replace(/,(\s*[}\]])/g, '$1');
      const parsed = JSON.parse(repaired);
      console.log('[NBA Parse Success] ✅ Fixed with string closure repair');
      return parsed;
    } catch (e5) {
      console.error('[NBA Parse Error] String closure repair failed:', e5);
    }
    
    // Attempt 6: Last resort - truncate to preserve player data (but lose team data)
    try {
      console.warn('[NBA Repair] ⚠️ Using last resort truncation - team data may be lost');
      let repaired = cleaned;
      
      // Find the last complete closing of an array followed by object closing
      const lastCompletePattern = repaired.lastIndexOf(']\n    }\n  }');
      if (lastCompletePattern > 100) {
        repaired = repaired.substring(0, lastCompletePattern + 11); // Include the pattern
        
        // Ensure proper closing for the entire JSON
        repaired += ',\n  "team1": {\n    "insights": [],\n    "strengths": [],\n    "weaknesses": []\n  },\n  "team2": {\n    "insights": [],\n    "strengths": [],\n    "weaknesses": []\n  }\n}';
        
        const parsed = JSON.parse(repaired);
        console.warn('[NBA Parse Success] ⚠️ Fixed with truncation (team data lost)');
        return parsed;
      }
    } catch (e6) {
      console.error('[NBA Parse Error] Truncation repair failed:', e6);
    }
    
    console.error('[NBA Parse Error] ❌ All repair attempts failed');
    console.error('[NBA Parse Error] First 500 chars:', text.substring(0, 500));
    console.error('[NBA Parse Error] Last 500 chars:', text.substring(Math.max(0, text.length - 500)));
    return null;
  };

  const hasUsefulFinalPayload = (payload: any) => {
    if (!payload || typeof payload !== 'object') return false;
    const playersCount = payload.players && typeof payload.players === 'object'
      ? Object.keys(payload.players).length
      : 0;
    const team1Count = payload.team1?.insights?.length || payload.team1?.strengths?.length || payload.team1?.weaknesses?.length || 0;
    const team2Count = payload.team2?.insights?.length || payload.team2?.strengths?.length || payload.team2?.weaknesses?.length || 0;
    return playersCount > 0 || team1Count > 0 || team2Count > 0;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setIsStreaming(true);
    setStreamingStep(0);
    setStreamedText("");
    setInsightsData(null);
    
    try {
      // Step 0: Initializing
      setStreamingStep(0);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Step 1: Loading data
      setStreamingStep(1);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Use streaming endpoint
      const response = await fetch(getApiUrl('/api/nba/generate-insights?stream=true'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedPlayers,
          team1: "Lakers",
          team2: "Mavericks"
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      // Read the stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      // Step 2: Processing with Gemini
      setStreamingStep(2);
      await new Promise(resolve => setTimeout(resolve, 300));

      let accumulatedText = '';
      let finalPayload: any = null;
      console.log('[Frontend] Starting to read stream...');

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('[Frontend] Stream done');
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        console.log('[Frontend] Received raw chunk:', chunk.substring(0, 100));
        
        // Step 3: Streaming insights (set once when we start receiving data)
        if (streamingStep < 3) {
          setStreamingStep(3);
        }
        
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              console.log('[NBA] Received [DONE] signal');
              console.log('[NBA] Accumulated text length:', accumulatedText.length);
              console.log('[NBA] Has final payload from server:', !!finalPayload);
              
              const finalData = hasUsefulFinalPayload(finalPayload)
                ? finalPayload
                : parsePartialJSON(accumulatedText);
              
              if (hasUsefulFinalPayload(finalPayload)) {
                console.log('[NBA] ✅ Using final payload from server (bypassing client-side parsing)');
              } else {
                console.log('[NBA] ⚠️ Final payload not useful, attempting client-side parsing...');
              }
              
              if (finalData) {
                console.log('[NBA] ✅ Successfully parsed final data');
                
                // Handle case where Gemini uses team names instead of team1/team2
                if (!finalData.team1 || !finalData.team2) {
                  const keys = Object.keys(finalData);
                  const teamKeys = keys.filter(k => k !== 'players' && k !== 'venue');
                  if (teamKeys.length >= 2) {
                    console.log('[NBA] Mapping team names to team1/team2:', teamKeys);
                    // Try to match team names to correct positions
                    const lakersKey = teamKeys.find(k => k.toLowerCase().includes('lakers'));
                    const mavericksKey = teamKeys.find(k => k.toLowerCase().includes('mavericks') || k.toLowerCase().includes('mavs'));
                    
                    if (lakersKey) {
                      finalData.team1 = finalData[lakersKey];
                      console.log('[NBA] Mapped Lakers to team1');
                    } else {
                      finalData.team1 = finalData[teamKeys[0]];
                    }
                    
                    if (mavericksKey) {
                      finalData.team2 = finalData[mavericksKey];
                      console.log('[NBA] Mapped Mavericks to team2');
                    } else {
                      finalData.team2 = finalData[teamKeys[1]];
                    }
                  }
                }
                
                setInsightsData(finalData);
                setStreamedText(""); // Clear only if we successfully parsed
                
                // Load any existing edited insights
                loadEditedInsights(finalData);
                
                toast({
                  title: "Insights Generated",
                  description: "AI has successfully analyzed the NBA data.",
                });
              } else {
                console.error('[NBA] Failed to parse JSON. Keeping streaming text visible.');
                // Don't clear streamedText - let user see what was returned
                
                toast({
                  title: "Parse Error",
                  description: "Failed to parse AI response. Check the raw output below.",
                  variant: "destructive",
                });
              }
              
              setIsStreaming(false);
              setStreamingStep(4);
              
              // Hide the streaming status after a brief moment
              setTimeout(() => setStreamingStep(0), 2000);
              return;
            }

            try {
              const parsed = JSON.parse(data);

              // Prefer server-provided final repaired JSON payload
              if (parsed.final) {
                console.log('[NBA] ✅ Received final repaired payload from server');
                console.log('[NBA] Final payload structure:', {
                  players: Object.keys(parsed.final.players || {}).length,
                  team1: parsed.final.team1 ? 'present' : 'missing',
                  team2: parsed.final.team2 ? 'present' : 'missing'
                });
                finalPayload = parsed.final;
                continue;
              }
              
              // Accumulate chunks for real-time display
              if (parsed.chunk) {
                console.log('[Frontend] Received chunk:', parsed.chunk.substring(0, 50));
                accumulatedText += parsed.chunk;
                setStreamedText(accumulatedText);
              }
            } catch (e) {
              console.log('[Frontend] Parse error:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error generating insights:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate insights. Please try again.",
        variant: "destructive",
      });
      setIsStreaming(false);
      setStreamingStep(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadEditedInsights = async (data: any) => {
    try {
      const entities = [
        ...selectedPlayers.map(p => ({ type: 'player', name: p })),
        { type: 'team1', name: 'Lakers' },
        { type: 'team2', name: 'Mavericks' }
      ];

      for (const entity of entities) {
        const edited = await insightsApi.load("nba", entity.type, entity.name);
        if (edited) {
          console.log('[NBA] Loaded edited insights for', entity.name);
          setEditedInsights((prev: any) => ({
            ...prev,
            [`${entity.type}_${entity.name}`]: edited
          }));
        }
      }
    } catch (error) {
      console.error('[NBA] Failed to load edited insights:', error);
    }
  };

  const handleInsightsChange = async (
    entityType: string,
    entityName: string,
    field: 'insights' | 'strengths' | 'weaknesses',
    newValue: string[]
  ) => {
    try {
      const key = `${entityType}_${entityName}`;
      const currentEdited = editedInsights[key] || {
        insights: entityType === 'player' 
          ? insightsData?.players?.[entityName]?.insights || []
          : insightsData?.[entityType]?.insights || [],
        strengths: entityType === 'player'
          ? insightsData?.players?.[entityName]?.strengths || []
          : insightsData?.[entityType]?.strengths || [],
        weaknesses: entityType === 'player'
          ? insightsData?.players?.[entityName]?.weaknesses || []
          : insightsData?.[entityType]?.weaknesses || []
      };

      const updatedData = {
        ...currentEdited,
        [field]: newValue
      };

      await insightsApi.save("nba", entityType, entityName, updatedData);

      setEditedInsights((prev: any) => ({
        ...prev,
        [key]: updatedData
      }));

      console.log('[NBA] Saved edited insights for', entityName);
    } catch (error) {
      console.error('[NBA] Failed to save edited insights:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = async () => {
    if (selectedPlayers.length < 2) {
      toast({
        title: "Select Players",
        description: "Please select at least 2 players to download the presentation.",
        variant: "destructive",
      });
      return;
    }

    if (!insightsData) {
      toast({
        title: "No Data",
        description: "Please generate insights first.",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);

    try {
      console.log("Starting PPT generation for NBA...");

      // Map API response to PPT generator format
      const player1Data = {
        playerName: selectedPlayers[0],
        teamName: "Lakers", // This should ideally come from data or be dynamic
        ...(insightsData.players?.[selectedPlayers[0]] || {})
      };

      const player2Data = {
        playerName: selectedPlayers[1],
        teamName: "Mavericks", // This should ideally come from data or be dynamic
        ...(insightsData.players?.[selectedPlayers[1]] || {})
      };

      const pptx = generateNBAPPT({
        player1: player1Data,
        player2: player2Data,
        team1Analysis: insightsData.team1,
        team2Analysis: insightsData.team2,
      });

      console.log("PPT object created, starting download...");

      const fileName = `NBA_Analysis_${selectedPlayers[0].replace(/\s+/g, '_')}_vs_${selectedPlayers[1].replace(/\s+/g, '_')}_${Date.now()}.pptx`;
      await pptx.writeFile({ fileName });

      console.log("PPT download completed successfully");

      toast({
        title: "Download Complete",
        description: "Your presentation has been downloaded successfully.",
      });
    } catch (error) {
      console.error("PPT generation error:", error);
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "There was an error generating the presentation.",
        variant: "destructive",
      });
    }

    setIsDownloading(false);
  };

  const sidebar = (
    <NBASidebar
      selectedPlayers={selectedPlayers}
      onPlayerToggle={handlePlayerToggle}
      onGenerate={handleGenerate}
      onDownload={handleDownload}
      isDownloading={isDownloading}
      isGenerating={isGenerating}
    />
  );

  return (
    <SportLayout sidebar={sidebar}>
      <div className="h-full overflow-auto">
        <div className="container mx-auto p-6 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h1 className="text-4xl font-bold text-wicky-green glow-green">NBA Matchup Analysis</h1>
            <p className="text-muted-foreground">Compare players and teams head-to-head</p>
          </motion.div>

          {/* Streaming Status Component */}
          <StreamingStatus 
            isStreaming={isStreaming || streamingStep > 0} 
            currentStep={streamingStep}
            sportName="NBA"
          />

          {/* Show streaming JSON in real-time */}
          {isStreaming && streamedText && !insightsData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              <BentoCard>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-wicky-green flex items-center gap-2">
                    <span className="animate-pulse">●</span> AI Generating Insights...
                  </h2>
                  <span className="text-sm text-muted-foreground">{streamedText.length} chars</span>
                </div>
                <div className="p-4 bg-black/30 rounded-lg font-mono text-xs text-green-400 whitespace-pre-wrap max-h-96 overflow-y-auto border border-wicky-green/20">
                  {streamedText}
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Parsing complete JSON when finished...
                </p>
              </BentoCard>
            </motion.div>
          )}

          {/* Show parsing error with raw JSON */}
          {!isStreaming && streamedText && !insightsData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              <BentoCard>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-red-500">⚠️ Parsing Failed</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  The AI response couldn't be parsed as JSON. Raw response is shown below. Check the browser console for details.
                </p>
                <div className="p-4 bg-black/30 rounded-lg font-mono text-xs text-red-400 whitespace-pre-wrap max-h-96 overflow-y-auto border border-red-500/20">
                  {streamedText}
                </div>
              </BentoCard>
            </motion.div>
          )}

          {insightsData ? (
            <>
              {/* Team Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">
                <BentoCard delay={0.3} enableTilt={false}>
                  <h2 className="text-2xl font-bold text-wicky-green mb-4">Lakers</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-wicky-green-light mb-2">Team Analysis</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        AI Insights {isStreaming && <span className="animate-pulse text-wicky-green ml-2">● Streaming...</span>}
                      </p>
                      <EditableInsightsList
                        items={editedInsights['team1_Lakers']?.insights || insightsData.team1?.insights || []}
                        onChange={(newItems) => handleInsightsChange('team1', 'Lakers', 'insights', newItems)}
                        category="insights"
                        bulletSymbol="•"
                        bulletColor="text-wicky-green"
                      />
                    </div>
                    <div>
                      <h4 className="text-success font-semibold mb-2">Strengths</h4>
                      <EditableInsightsList
                        items={editedInsights['team1_Lakers']?.strengths || insightsData.team1?.strengths || []}
                        onChange={(newItems) => handleInsightsChange('team1', 'Lakers', 'strengths', newItems)}
                        category="strengths"
                        bulletSymbol="✓"
                        bulletColor="text-success"
                      />
                    </div>
                    <div>
                      <h4 className="text-warning font-semibold mb-2">Weaknesses</h4>
                      <EditableInsightsList
                        items={editedInsights['team1_Lakers']?.weaknesses || insightsData.team1?.weaknesses || []}
                        onChange={(newItems) => handleInsightsChange('team1', 'Lakers', 'weaknesses', newItems)}
                        category="weaknesses"
                        bulletSymbol="⚠"
                        bulletColor="text-warning"
                      />
                    </div>
                  </div>
                </BentoCard>

                <BentoCard delay={0.4} enableTilt={false}>
                  <h2 className="text-2xl font-bold text-wicky-green mb-4">Mavericks</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-wicky-green-light mb-2">Team Analysis</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        AI Insights {isStreaming && <span className="animate-pulse text-wicky-green ml-2">● Streaming...</span>}
                      </p>
                      <EditableInsightsList
                        items={editedInsights['team2_Mavericks']?.insights || insightsData.team2?.insights || []}
                        onChange={(newItems) => handleInsightsChange('team2', 'Mavericks', 'insights', newItems)}
                        category="insights"
                        bulletSymbol="•"
                        bulletColor="text-wicky-green"
                      />
                    </div>
                    <div>
                      <h4 className="text-success font-semibold mb-2">Strengths</h4>
                      <EditableInsightsList
                        items={editedInsights['team2_Mavericks']?.strengths || insightsData.team2?.strengths || []}
                        onChange={(newItems) => handleInsightsChange('team2', 'Mavericks', 'strengths', newItems)}
                        category="strengths"
                        bulletSymbol="✓"
                        bulletColor="text-success"
                      />
                    </div>
                    <div>
                      <h4 className="text-warning font-semibold mb-2">Weaknesses</h4>
                      <EditableInsightsList
                        items={editedInsights['team2_Mavericks']?.weaknesses || insightsData.team2?.weaknesses || []}
                        onChange={(newItems) => handleInsightsChange('team2', 'Mavericks', 'weaknesses', newItems)}
                        category="weaknesses"
                        bulletSymbol="⚠"
                        bulletColor="text-warning"
                      />
                    </div>
                  </div>
                </BentoCard>
              </div>

              {/* Player Comparison */}
              {selectedPlayers.length > 0 && insightsData.players && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">
                  {selectedPlayers.map((playerName, index) => {
                    const playerData = insightsData.players?.[playerName];
                    if (!playerData) return null; // Skip if player data not available yet
                    
                    return (
                      <PlayerCard
                        key={playerName}
                        playerName={playerName}
                        teamName={index % 2 === 0 ? "Lakers" : "Mavericks"}
                        insights={editedInsights[`player_${playerName}`]?.insights || playerData.insights || []}
                        strengths={editedInsights[`player_${playerName}`]?.strengths || playerData.strengths || []}
                        weaknesses={editedInsights[`player_${playerName}`]?.weaknesses || playerData.weaknesses || []}
                        onInsightsChange={(newItems) => handleInsightsChange('player', playerName, 'insights', newItems)}
                        onStrengthsChange={(newItems) => handleInsightsChange('player', playerName, 'strengths', newItems)}
                        onWeaknessesChange={(newItems) => handleInsightsChange('player', playerName, 'weaknesses', newItems)}
                      />
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
              <p>Select players and click "Generate Insights" to see the analysis.</p>
            </div>
          )}
        </div>
      </div>
    </SportLayout>
  );
};

export default NBA;
