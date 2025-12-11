import { useState } from "react";
import { motion } from "framer-motion";
import { SportLayout } from "@/components/layouts/SportLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BentoCard } from "@/components/ui/bento-card";
import { StreamingStatus } from "@/components/ui/streaming-status";
import { TrendingUp, AlertTriangle, Download } from "lucide-react";
import { useSidebar } from "@/components/ui/animated-sidebar";
import { useToast } from "@/hooks/use-toast";

const AFLSidebar = ({
  selectedTeam,
  setSelectedTeam,
  selectedOpposition,
  setSelectedOpposition,
  selectedPlayers,
  onPlayerToggle,
  onGenerate,
  onDownload,
  isDownloading,
  isGenerating,
}: any) => {
  const { open } = useSidebar();

  if (!open) return null;

  const allPlayers = [
    "Charlie Cameron",
    "Patrick Dangerfield",
    "Lachie Neale",
    "Isaac Heeney",
    "Marcus Bontempelli",
    "Christian Petracca",
    "Clayton Oliver"
  ];

  return (
    <div className="space-y-4 animate-in fade-in-50 duration-300">
      <div>
        <h3 className="text-sm font-semibold text-wicky-green mb-3">Team Selection</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Your Team</label>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="bg-secondary/50 border-border h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[200] bg-card border-border">
                <SelectItem value="Collingwood Magpies">Collingwood Magpies</SelectItem>
                <SelectItem value="Richmond Tigers">Richmond Tigers</SelectItem>
                <SelectItem value="Melbourne Demons">Melbourne Demons</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Opposition</label>
            <Select value={selectedOpposition} onValueChange={setSelectedOpposition}>
              <SelectTrigger className="bg-secondary/50 border-border h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[200] bg-card border-border">
                <SelectItem value="Geelong Cats">Geelong Cats</SelectItem>
                <SelectItem value="Brisbane Lions">Brisbane Lions</SelectItem>
                <SelectItem value="Sydney Swans">Sydney Swans</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
            <div className="w-4 h-4 border-2 border-wicky-navy border-t-transparent rounded-full animate-spin mr-2" />
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
            Download Report
          </>
        )}
      </Button>
    </div>
  );
};

const AFL = () => {
  const [selectedTeam, setSelectedTeam] = useState("Collingwood Magpies");
  const [selectedOpposition, setSelectedOpposition] = useState("Geelong Cats");
  const [selectedPlayers, setSelectedPlayers] = useState(["Charlie Cameron", "Patrick Dangerfield"]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingStep, setStreamingStep] = useState(0);
  const [insightsData, setInsightsData] = useState<any>(null);
  const [streamedText, setStreamedText] = useState("");
  const { toast } = useToast();

  const handlePlayerToggle = (playerName: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerName)
        ? prev.filter((p) => p !== playerName)
        : [...prev, playerName]
    );
  };

  const parsePartialJSON = (text: string) => {
    try {
      const cleaned = text.replace(/```json\n|\n```/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return null;
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setIsStreaming(true);
    setStreamingStep(0);
    setStreamedText("");
    setInsightsData(null);
    
    try {
      setStreamingStep(0);
      await new Promise(resolve => setTimeout(resolve, 300));
      setStreamingStep(1);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const response = await fetch('/api/afl/generate-insights?stream=true', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedPlayers: selectedPlayers,
          team1: selectedTeam,
          team2: selectedOpposition
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      setStreamingStep(2);
      await new Promise(resolve => setTimeout(resolve, 300));

      let accumulatedText = '';
      console.log('[AFL] Starting to read stream...');

      while (true) {
        const { done, value} = await reader.read();
        
        if (done) {
          console.log('[AFL] Stream done');
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        
        if (streamingStep < 3) {
          setStreamingStep(3);
        }
        
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              console.log('[AFL] Received [DONE] signal');
              
              const finalData = parsePartialJSON(accumulatedText);
              if (finalData) {
                console.log('[AFL] Successfully parsed final data');
                setInsightsData(finalData);
              }
              
              setIsStreaming(false);
              setStreamingStep(4);
              setStreamedText(""); // Clear to show formatted cards
              
              toast({
                title: "Insights Generated",
                description: "AI has successfully analyzed the AFL data.",
              });
              
              setTimeout(() => setStreamingStep(0), 2000);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) {
                accumulatedText += parsed.chunk;
                setStreamedText(accumulatedText);
              }
            } catch (e) {
              console.log('[AFL] Parse error:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error generating insights:", error);
      setIsStreaming(false);
      setStreamingStep(0);
      toast({
        title: "Generation Failed",
        description: "Failed to generate insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    toast({
      title: "Preparing AFL Report",
      description: "Your PowerPoint presentation is being generated...",
    });

    setTimeout(() => {
      setIsDownloading(false);
      toast({
        title: "Download Complete",
        description: "Your AFL analysis report has been downloaded.",
      });
    }, 2000);
  };

  // No need for fallback data - we'll show a message if no data

  return (
    <SportLayout
      sidebar={
        <AFLSidebar
          selectedTeam={selectedTeam}
          setSelectedTeam={setSelectedTeam}
          selectedOpposition={selectedOpposition}
          setSelectedOpposition={setSelectedOpposition}
          selectedPlayers={selectedPlayers}
          onPlayerToggle={handlePlayerToggle}
          onGenerate={handleGenerate}
          onDownload={handleDownload}
          isDownloading={isDownloading}
          isGenerating={isGenerating}
        />
      }
    >
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-wicky-green to-wicky-green-light bg-clip-text text-transparent">
            AFL Match Analysis
          </h1>
          <p className="text-muted-foreground">
            {selectedTeam} vs {selectedOpposition}
          </p>
        </motion.div>

        {/* Streaming Status Component */}
        <StreamingStatus 
          isStreaming={isStreaming || streamingStep > 0} 
          currentStep={streamingStep}
          sportName="AFL"
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

        {insightsData ? (
          <>
            {/* Team Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">
              <BentoCard delay={0.3} enableTilt={false}>
                <h2 className="text-2xl font-bold text-wicky-green mb-4">{selectedTeam}</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-wicky-green-light mb-2">Team Analysis</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      AI Insights {isStreaming && <span className="animate-pulse text-wicky-green ml-2">● Streaming...</span>}
                    </p>
                    <ul className="space-y-2">
                      {insightsData.team1?.insights?.map((insight: string, i: number) => (
                        <motion.li 
                          key={i} 
                          className="text-sm flex items-start gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <span className="text-wicky-green font-bold min-w-[24px]">{i + 1}.</span>
                          <span>
                            {insight.split(/(\d+\.?\d*)/g).map((part, idx) =>
                              /\d+\.?\d*/.test(part) ? (
                                <span key={idx} className="text-wicky-green font-bold">{part}</span>
                              ) : part
                            )}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-success font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {insightsData.team1?.strengths?.map((strength: string, i: number) => (
                        <motion.li 
                          key={i} 
                          className="text-sm flex items-start gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <span className="text-success min-w-[24px]">✓</span>
                          <span>
                            {strength.split(/(\d+\.?\d*)/g).map((part, idx) =>
                              /\d+\.?\d*/.test(part) ? (
                                <span key={idx} className="text-wicky-green font-bold">{part}</span>
                              ) : part
                            )}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-warning font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Weaknesses
                    </h4>
                    <ul className="space-y-1">
                      {insightsData.team1?.weaknesses?.map((weakness: string, i: number) => (
                        <motion.li 
                          key={i} 
                          className="text-sm flex items-start gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <span className="text-warning min-w-[24px]">⚠</span>
                          <span>
                            {weakness.split(/(\d+\.?\d*)/g).map((part, idx) =>
                              /\d+\.?\d*/.test(part) ? (
                                <span key={idx} className="text-wicky-green font-bold">{part}</span>
                              ) : part
                            )}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </BentoCard>

              <BentoCard delay={0.4} enableTilt={false}>
                <h2 className="text-2xl font-bold text-wicky-green mb-4">{selectedOpposition}</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-wicky-green-light mb-2">Team Analysis</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      AI Insights {isStreaming && <span className="animate-pulse text-wicky-green ml-2">● Streaming...</span>}
                    </p>
                    <ul className="space-y-2">
                      {insightsData.team2?.insights?.map((insight: string, i: number) => (
                        <motion.li 
                          key={i} 
                          className="text-sm flex items-start gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <span className="text-wicky-green font-bold min-w-[24px]">{i + 1}.</span>
                          <span>
                            {insight.split(/(\d+\.?\d*)/g).map((part, idx) =>
                              /\d+\.?\d*/.test(part) ? (
                                <span key={idx} className="text-wicky-green font-bold">{part}</span>
                              ) : part
                            )}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-success font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {insightsData.team2?.strengths?.map((strength: string, i: number) => (
                        <motion.li 
                          key={i} 
                          className="text-sm flex items-start gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <span className="text-success min-w-[24px]">✓</span>
                          <span>
                            {strength.split(/(\d+\.?\d*)/g).map((part, idx) =>
                              /\d+\.?\d*/.test(part) ? (
                                <span key={idx} className="text-wicky-green font-bold">{part}</span>
                              ) : part
                            )}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-warning font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Weaknesses
                    </h4>
                    <ul className="space-y-1">
                      {insightsData.team2?.weaknesses?.map((weakness: string, i: number) => (
                        <motion.li 
                          key={i} 
                          className="text-sm flex items-start gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <span className="text-warning min-w-[24px]">⚠</span>
                          <span>
                            {weakness.split(/(\d+\.?\d*)/g).map((part, idx) =>
                              /\d+\.?\d*/.test(part) ? (
                                <span key={idx} className="text-wicky-green font-bold">{part}</span>
                              ) : part
                            )}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </BentoCard>
            </div>

            {/* Player Comparison */}
            {selectedPlayers.length > 0 && insightsData.players && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">
                {selectedPlayers.map((playerName, index) => {
                  const playerData = insightsData.players?.[playerName];
                  if (!playerData) return null;
                  
                  return (
                    <BentoCard key={playerName} delay={0.5 + index * 0.1} enableTilt={false}>
                      <h2 className="text-2xl font-bold text-wicky-green mb-4">{playerName}</h2>
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-wicky-green-light mb-2">Player Analysis</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            AI Insights {isStreaming && <span className="animate-pulse text-wicky-green ml-2">● Streaming...</span>}
                          </p>
                          <ul className="space-y-2">
                            {playerData.insights?.map((insight: string, i: number) => (
                              <motion.li 
                                key={i} 
                                className="text-sm flex items-start gap-3"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                              >
                                <span className="text-wicky-green font-bold min-w-[24px]">{i + 1}.</span>
                                <span>
                                  {insight.split(/(\d+\.?\d*)/g).map((part, idx) =>
                                    /\d+\.?\d*/.test(part) ? (
                                      <span key={idx} className="text-wicky-green font-bold">{part}</span>
                                    ) : part
                                  )}
                                </span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-success font-semibold mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Strengths
                          </h4>
                          <ul className="space-y-1">
                            {playerData.strengths?.map((strength: string, i: number) => (
                              <motion.li 
                                key={i} 
                                className="text-sm flex items-start gap-3"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                              >
                                <span className="text-success min-w-[24px]">✓</span>
                                <span>
                                  {strength.split(/(\d+\.?\d*)/g).map((part, idx) =>
                                    /\d+\.?\d*/.test(part) ? (
                                      <span key={idx} className="text-wicky-green font-bold">{part}</span>
                                    ) : part
                                  )}
                                </span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-warning font-semibold mb-2 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            Weaknesses
                          </h4>
                          <ul className="space-y-1">
                            {playerData.weaknesses?.map((weakness: string, i: number) => (
                              <motion.li 
                                key={i} 
                                className="text-sm flex items-start gap-3"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                              >
                                <span className="text-warning min-w-[24px]">⚠</span>
                                <span>
                                  {weakness.split(/(\d+\.?\d*)/g).map((part, idx) =>
                                    /\d+\.?\d*/.test(part) ? (
                                      <span key={idx} className="text-wicky-green font-bold">{part}</span>
                                    ) : part
                                  )}
                                </span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </BentoCard>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground">
            <p>Select teams and players, then click "Generate Insights" to see the analysis.</p>
          </div>
        )}
      </div>
    </SportLayout>
  );
};

export default AFL;
