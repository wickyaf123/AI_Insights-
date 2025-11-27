import { useState } from "react";
import { motion } from "framer-motion";
import { PlayerCard } from "@/components/nba/PlayerCard";
import { SportLayout } from "@/components/layouts/SportLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BentoCard } from "@/components/ui/bento-card";
import { useSidebar } from "@/components/ui/animated-sidebar";
import { Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateNBAPPT } from "@/lib/pptGenerator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [insightsData, setInsightsData] = useState<any>(null);
  const { toast } = useToast();

  const handlePlayerToggle = (playerName: string) => {
    setSelectedPlayers((prev) =>
      prev.includes(playerName)
        ? prev.filter((p) => p !== playerName)
        : [...prev, playerName]
    );
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-insights', {
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

      const data = await response.json();
      setInsightsData(data);

      toast({
        title: "Insights Generated",
        description: "AI has successfully analyzed the data.",
      });
    } catch (error) {
      console.error("Error generating insights:", error);
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
        ...insightsData.players[selectedPlayers[0]]
      };

      const player2Data = {
        playerName: selectedPlayers[1],
        teamName: "Mavericks", // This should ideally come from data or be dynamic
        ...insightsData.players[selectedPlayers[1]]
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

          {insightsData ? (
            <>
              {/* Team Analysis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">
                <BentoCard delay={0.3} enableTilt={false}>
                  <h2 className="text-2xl font-bold text-wicky-green mb-4">Lakers</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-wicky-green-light mb-2">Team Analysis</h3>
                      <p className="text-sm text-muted-foreground mb-3">AI Insights</p>
                      <ul className="space-y-2">
                        {insightsData.team1.insights.map((insight: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-wicky-green">•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-success font-semibold mb-2">Strengths</h4>
                      <ul className="space-y-1">
                        {insightsData.team1.strengths.map((strength: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-success">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-warning font-semibold mb-2">Weaknesses</h4>
                      <ul className="space-y-1">
                        {insightsData.team1.weaknesses.map((weakness: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-warning">⚠</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </BentoCard>

                <BentoCard delay={0.4} enableTilt={false}>
                  <h2 className="text-2xl font-bold text-wicky-green mb-4">Mavericks</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-wicky-green-light mb-2">Team Analysis</h3>
                      <p className="text-sm text-muted-foreground mb-3">AI Insights</p>
                      <ul className="space-y-2">
                        {insightsData.team2.insights.map((insight: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-wicky-green">•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-success font-semibold mb-2">Strengths</h4>
                      <ul className="space-y-1">
                        {insightsData.team2.strengths.map((strength: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-success">✓</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-warning font-semibold mb-2">Weaknesses</h4>
                      <ul className="space-y-1">
                        {insightsData.team2.weaknesses.map((weakness: string, i: number) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <span className="text-warning">⚠</span>
                            <span>{weakness}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </BentoCard>
              </div>

              {/* Player Comparison */}
              {selectedPlayers.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">
                  {selectedPlayers.map((playerName, index) => (
                    <motion.div
                      key={playerName}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <PlayerCard
                        playerName={playerName}
                        teamName={index % 2 === 0 ? "Lakers" : "Mavericks"} // Placeholder logic for team assignment
                        {...insightsData.players[playerName]}
                      />
                    </motion.div>
                  ))}
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
