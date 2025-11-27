import { useState } from "react";
import { motion } from "framer-motion";
import { SportLayout } from "@/components/layouts/SportLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BentoCard } from "@/components/ui/bento-card";
import { TrendingUp, Target, AlertTriangle, Download } from "lucide-react";
import { useSidebar } from "@/components/ui/animated-sidebar";
import { useToast } from "@/hooks/use-toast";
import { generateCricketPPT } from "@/lib/pptGenerator";

const CricketSidebar = ({
  selectedTeam,
  setSelectedTeam,
  selectedOpposition,
  setSelectedOpposition,
  selectedPlayer,
  setSelectedPlayer,
  onGenerate,
  onDownload,
  isDownloading,
  isGenerating,
}: any) => {
  const { open } = useSidebar();

  if (!open) return null;

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
                <SelectItem value="Chennai Super Kings">Chennai Super Kings</SelectItem>
                <SelectItem value="Mumbai Indians">Mumbai Indians</SelectItem>
                <SelectItem value="Royal Challengers Bangalore">Royal Challengers Bangalore</SelectItem>
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
                <SelectItem value="Kolkata Knight Riders">Kolkata Knight Riders</SelectItem>
                <SelectItem value="Delhi Capitals">Delhi Capitals</SelectItem>
                <SelectItem value="Punjab Kings">Punjab Kings</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Opposition Player</label>
            <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
              <SelectTrigger className="bg-secondary/50 border-border h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[200] bg-card border-border">
                <SelectItem value="Venkatesh Iyer">Venkatesh Iyer</SelectItem>
                <SelectItem value="Shreyas Iyer">Shreyas Iyer</SelectItem>
                <SelectItem value="Andre Russell">Andre Russell</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
            Download PPT
          </>
        )}
      </Button>
    </div>
  );
};

const Cricket = () => {
  const [selectedTeam, setSelectedTeam] = useState("Chennai Super Kings");
  const [selectedOpposition, setSelectedOpposition] = useState("Kolkata Knight Riders");
  const [selectedPlayer, setSelectedPlayer] = useState("Venkatesh Iyer");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [insightsData, setInsightsData] = useState<any>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ipl/generate-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedPlayers: [selectedPlayer],
          team1: selectedTeam,
          team2: selectedOpposition,
          venue: "Wankhede Stadium" // You can make this dynamic
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const data = await response.json();
      setInsightsData(data);

      toast({
        title: "Insights Generated",
        description: "AI has successfully analyzed the IPL data.",
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

  // Use real data from API or fallback to placeholder
  const aiInsights = insightsData?.players?.[selectedPlayer]?.insights || [
    `${selectedPlayer} - Generate insights to see AI analysis`,
    `${selectedOpposition} vs ${selectedTeam} - Click Generate Insights`,
  ];

  const strengths = insightsData?.players?.[selectedPlayer]?.strengths || [
    `Generate insights to see player strengths`,
  ];

  const weaknesses = insightsData?.players?.[selectedPlayer]?.weaknesses || [
    `Generate insights to see areas for improvement`,
  ];

  const performanceData = [
    {
      bowlerType: "Left arm wrist spin",
      ballsFaced: 16,
      strikeRate: 75.0,
      average: 0.0,
      dotBall: 50.0,
      boundary: 6.3,
    },
    {
      bowlerType: "Left arm pace",
      ballsFaced: 174,
      strikeRate: 139.7,
      average: 22.1,
      dotBall: 37.9,
      boundary: 20.1,
    },
    {
      bowlerType: "Leg spin",
      ballsFaced: 117,
      strikeRate: 136.8,
      average: 26.7,
      dotBall: 31.6,
      boundary: 16.2,
    },
    {
      bowlerType: "Off spin",
      ballsFaced: 88,
      strikeRate: 125.0,
      average: 36.7,
      dotBall: 33.0,
      boundary: 13.6,
    },
    {
      bowlerType: "Right arm pace",
      ballsFaced: 315,
      strikeRate: 152.1,
      average: 34.2,
      dotBall: 36.8,
      boundary: 23.2,
    },
    {
      bowlerType: "Slow left arm orthodox",
      ballsFaced: 52,
      strikeRate: 115.4,
      average: 10.0,
      dotBall: 34.6,
      boundary: 9.6,
    },
  ];

  const dismissalPoints = [
    { x: 270, y: 200, count: 5, category: "highest" as const },
    { x: 200, y: 170, count: 3, category: "high" as const },
    { x: 310, y: 250, count: 3, category: "high" as const },
    { x: 250, y: 280, count: 2, category: "medium" as const },
    { x: 320, y: 220, count: 2, category: "medium" as const },
    { x: 280, y: 300, count: 1, category: "low" as const },
    { x: 330, y: 270, count: 1, category: "lowest" as const },
  ];

  const strikeRateZones = [
    { zone: "Bouncer", off: 135, line: 141, leg: 125 },
    { zone: "Short", off: 132, line: 125, leg: 78 },
    { zone: "Back of length", off: 113, line: 165, leg: 179 },
    { zone: "Length", off: 137, line: 121, leg: 135 },
    { zone: "Full", off: 146, line: 180, leg: 150 },
    { zone: "Yorker", off: 165, line: 148, leg: 162 },
  ];

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      console.log("Starting PPT generation for Cricket...");

      const pptx = generateCricketPPT({
        playerName: selectedPlayer,
        team: selectedTeam,
        opposition: selectedOpposition,
        insights: aiInsights,
        strengths,
        weaknesses,
        performanceData,
        strikeRateZones,
      });

      console.log("PPT object created, starting download...");

      const fileName = `Cricket_Analysis_${selectedPlayer.replace(/\s+/g, '_')}_${Date.now()}.pptx`;
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
    <CricketSidebar
      selectedTeam={selectedTeam}
      setSelectedTeam={setSelectedTeam}
      selectedOpposition={selectedOpposition}
      setSelectedOpposition={setSelectedOpposition}
      selectedPlayer={selectedPlayer}
      setSelectedPlayer={setSelectedPlayer}
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
            <h1 className="text-4xl font-bold text-wicky-green glow-green">Cricket Opposition Planning</h1>
            <p className="text-muted-foreground">Analyze player performance and opposition strategies</p>
          </motion.div>

          {/* Player Analysis Header */}
          <BentoCard delay={0.2} enableTilt={false}>
            <h2 className="text-3xl font-bold text-wicky-green mb-6">Player Analysis: {selectedPlayer}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
              {/* AI Insights */}
              <Card className="p-4 bg-wicky-green/10 border-wicky-green/30 hover:border-wicky-green/50 transition-colors h-full flex flex-col">
                <h3 className="text-lg font-semibold text-wicky-green flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5" />
                  AI Insights
                </h3>
                <ul className="space-y-2 flex-1">
                  {aiInsights.map((insight, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-wicky-green mt-0.5">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Strengths */}
              <Card className="p-4 bg-success/10 border-success/30 hover:border-success/50 transition-colors h-full flex flex-col">
                <h3 className="text-lg font-semibold text-success flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5" />
                  Strengths
                </h3>
                <ul className="space-y-2 flex-1">
                  {strengths.map((strength, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-success mt-0.5">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Weaknesses */}
              <Card className="p-4 bg-warning/10 border-warning/30 hover:border-warning/50 transition-colors h-full flex flex-col">
                <h3 className="text-lg font-semibold text-warning flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5" />
                  Areas for Improvement
                </h3>
                <ul className="space-y-2 flex-1">
                  {weaknesses.map((weakness, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-warning mt-0.5">⚠</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </BentoCard>
        </div>
      </div>
    </SportLayout>
  );
};

export default Cricket;
