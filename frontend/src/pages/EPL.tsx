import { useState } from "react";
import { motion } from "framer-motion";
import { SportLayout } from "@/components/layouts/SportLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BentoCard } from "@/components/ui/bento-card";
import { useSidebar } from "@/components/ui/animated-sidebar";
import { Download, TrendingUp, Target, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateEPLPPT } from "@/lib/pptGenerator";

const EPLSidebar = ({
  homeTeam,
  setHomeTeam,
  awayTeam,
  setAwayTeam,
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
        <h3 className="text-sm font-semibold text-wicky-green mb-3">Match Selection</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Home Team</label>
            <Select value={homeTeam} onValueChange={setHomeTeam}>
              <SelectTrigger className="bg-secondary/50 border-border h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[200] bg-card border-border">
                <SelectItem value="Manchester City">Manchester City</SelectItem>
                <SelectItem value="Arsenal">Arsenal</SelectItem>
                <SelectItem value="Chelsea">Chelsea</SelectItem>
                <SelectItem value="Manchester United">Manchester United</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Away Team</label>
            <Select value={awayTeam} onValueChange={setAwayTeam}>
              <SelectTrigger className="bg-secondary/50 border-border h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[200] bg-card border-border">
                <SelectItem value="Liverpool">Liverpool</SelectItem>
                <SelectItem value="Tottenham">Tottenham</SelectItem>
                <SelectItem value="Newcastle">Newcastle</SelectItem>
                <SelectItem value="Aston Villa">Aston Villa</SelectItem>
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
          "Generate Analysis"
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

const EPL = () => {
  const [homeTeam, setHomeTeam] = useState("Manchester City");
  const [awayTeam, setAwayTeam] = useState("Liverpool");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [insightsData, setInsightsData] = useState<any>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/epl/generate-insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team1: homeTeam,
          team2: awayTeam
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const data = await response.json();
      setInsightsData(data);

      toast({
        title: "Insights Generated",
        description: "AI has successfully analyzed the EPL data.",
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

    try {
      console.log("Starting PPT generation for EPL...");

      const pptx = generateEPLPPT({
        homeTeam,
        awayTeam,
        teamComparisonData: [],
        recentFormData: [],
      });

      console.log("PPT object created, starting download...");

      const fileName = `EPL_Analysis_${homeTeam.replace(/\s+/g, '_')}_vs_${awayTeam.replace(/\s+/g, '_')}_${Date.now()}.pptx`;
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

  // Use real data from API or fallback to placeholder
  const homeTeamInsights = insightsData?.team1?.insights || [
    `${homeTeam} - Generate insights to see AI analysis`,
  ];

  const homeTeamStrengths = insightsData?.team1?.strengths || [
    `Generate insights to see team strengths`,
  ];

  const homeTeamWeaknesses = insightsData?.team1?.weaknesses || [
    `Generate insights to see areas for improvement`,
  ];

  const awayTeamInsights = insightsData?.team2?.insights || [
    `${awayTeam} - Generate insights to see AI analysis`,
  ];

  const awayTeamStrengths = insightsData?.team2?.strengths || [
    `Generate insights to see team strengths`,
  ];

  const awayTeamWeaknesses = insightsData?.team2?.weaknesses || [
    `Generate insights to see areas for improvement`,
  ];

  const sidebar = (
    <EPLSidebar
      homeTeam={homeTeam}
      setHomeTeam={setHomeTeam}
      awayTeam={awayTeam}
      setAwayTeam={setAwayTeam}
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
            <h1 className="text-4xl font-bold text-wicky-green glow-green">EPL Match Analysis</h1>
            <p className="text-muted-foreground">Analyze team performance and tactical insights</p>
          </motion.div>

          {/* Home Team Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">
            <BentoCard delay={0.3} enableTilt={false}>
              <h2 className="text-2xl font-bold text-wicky-green mb-4">{homeTeam}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-wicky-green-light mb-2">Team Analysis</h3>
                  <p className="text-sm text-muted-foreground mb-3">AI Insights</p>
                  <ul className="space-y-2">
                    {homeTeamInsights.map((insight, i) => (
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
                    {homeTeamStrengths.map((strength, i) => (
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
                    {homeTeamWeaknesses.map((weakness, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-warning">⚠</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </BentoCard>

            {/* Away Team Analysis */}
            <BentoCard delay={0.4} enableTilt={false}>
              <h2 className="text-2xl font-bold text-wicky-green mb-4">{awayTeam}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-wicky-green-light mb-2">Team Analysis</h3>
                  <p className="text-sm text-muted-foreground mb-3">AI Insights</p>
                  <ul className="space-y-2">
                    {awayTeamInsights.map((insight, i) => (
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
                    {awayTeamStrengths.map((strength, i) => (
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
                    {awayTeamWeaknesses.map((weakness, i) => (
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
        </div>
      </div>
    </SportLayout>
  );
};

export default EPL;
