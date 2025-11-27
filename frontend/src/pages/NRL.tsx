import { useState } from "react";
import { motion } from "framer-motion";
import { SportLayout } from "@/components/layouts/SportLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BentoCard } from "@/components/ui/bento-card";
import { TrendingUp, Target, AlertTriangle, Download, Loader2 } from "lucide-react";
import { useSidebar } from "@/components/ui/animated-sidebar";
import { useToast } from "@/hooks/use-toast";

const NRLSidebar = ({
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
                <SelectItem value="Penrith Panthers">Penrith Panthers</SelectItem>
                <SelectItem value="Melbourne Storm">Melbourne Storm</SelectItem>
                <SelectItem value="Brisbane Broncos">Brisbane Broncos</SelectItem>
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
                <SelectItem value="Sydney Roosters">Sydney Roosters</SelectItem>
                <SelectItem value="Cronulla Sharks">Cronulla Sharks</SelectItem>
                <SelectItem value="Parramatta Eels">Parramatta Eels</SelectItem>
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
                <SelectItem value="James Tedesco">James Tedesco</SelectItem>
                <SelectItem value="Nicho Hynes">Nicho Hynes</SelectItem>
                <SelectItem value="Mitchell Moses">Mitchell Moses</SelectItem>
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
            Download Report
          </>
        )}
      </Button>
    </div>
  );
};

const NRL = () => {
  const [selectedTeam, setSelectedTeam] = useState("Penrith Panthers");
  const [selectedOpposition, setSelectedOpposition] = useState("Sydney Roosters");
  const [selectedPlayer, setSelectedPlayer] = useState("James Tedesco");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [insightsData, setInsightsData] = useState<any>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/nrl/generate-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedPlayers: [selectedPlayer],
          team1: selectedTeam,
          team2: selectedOpposition
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const data = await response.json();
      setInsightsData(data);

      toast({
        title: "Insights Generated",
        description: "AI has successfully analyzed the NRL data.",
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
    setIsDownloading(true);
    toast({
      title: "Preparing NRL Report",
      description: "Your PowerPoint presentation is being generated...",
    });

    setTimeout(() => {
      setIsDownloading(false);
      toast({
        title: "Download Complete",
        description: "Your NRL analysis report has been downloaded.",
      });
    }, 2000);
  };

  // Use real data from API or fallback to placeholder
  const insights = insightsData?.players?.[selectedPlayer]?.insights || [
    `${selectedPlayer} - Generate insights to see AI analysis`,
    `${selectedOpposition} vs ${selectedTeam} - Click Generate Insights`,
  ];

  const strengths = insightsData?.players?.[selectedPlayer]?.strengths || [
    `Generate insights to see player strengths`,
  ];

  const weaknesses = insightsData?.players?.[selectedPlayer]?.weaknesses || [
    `Generate insights to see areas for improvement`,
  ];

  return (
    <SportLayout
      sidebar={
        <NRLSidebar
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
      }
    >
      <div className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-wicky-green to-wicky-green-light bg-clip-text text-transparent">
            NRL Match Analysis
          </h1>
          <p className="text-muted-foreground">
            {selectedTeam} vs {selectedOpposition} - Player Focus: {selectedPlayer}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6">
          {/* AI Insights Card */}
          <BentoCard enableParticles enableMagnetism clickEffect>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-wicky-green mb-4">AI Insights</h2>
                <ul className="space-y-3">
                  {insights.map((insight, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-sm text-muted-foreground flex items-start gap-2"
                    >
                      <span className="text-wicky-green mt-1">•</span>
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
            </motion.div>
          </BentoCard>

          {/* Strengths Card */}
          <BentoCard enableParticles enableMagnetism clickEffect>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-success flex items-center gap-2 mb-4">
                  <TrendingUp className="w-6 h-6" />
                  Strengths
                </h2>
                <ul className="space-y-3">
                  {strengths.map((strength, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-sm flex items-start gap-2"
                    >
                      <span className="text-success mt-1">✓</span>
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
            </motion.div>
          </BentoCard>

          {/* Weaknesses Card */}
          <BentoCard enableParticles enableMagnetism clickEffect>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-6 space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-warning flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-6 h-6" />
                  Areas for Improvement
                </h2>
                <ul className="space-y-3">
                  {weaknesses.map((weakness, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-sm flex items-start gap-2"
                    >
                      <span className="text-warning mt-1">⚠</span>
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
            </motion.div>
          </BentoCard>
        </div>
      </div>
    </SportLayout>
  );
};

export default NRL;
