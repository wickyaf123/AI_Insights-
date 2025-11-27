import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Trophy, Target, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnomalousMatterHero } from "@/components/ui/anomalous-matter-hero";

const Index = () => {
  const sports = [
    {
      title: "Cricket",
      icon: Trophy,
      description: "Opposition planning, player analysis, and pitch insights",
      link: "/cricket",
      color: "wicky-green",
    },
    {
      title: "NBA",
      icon: Activity,
      description: "Player matchups, team analysis, and performance metrics",
      link: "/nba",
      color: "warning",
    },
    {
      title: "EPL",
      icon: Target,
      description: "Match analysis, team stats, and tactical breakdowns",
      link: "/epl",
      color: "success",
    },
    {
      title: "AFL",
      icon: Trophy,
      description: "Player analysis, contested possessions, and match insights",
      link: "/afl",
      color: "wicky-green",
    },
    {
      title: "NRL",
      icon: Activity,
      description: "Player statistics, defensive patterns, and attacking plays",
      link: "/nrl",
      color: "warning",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with 3D Animation */}
      <AnomalousMatterHero
        title="Wicky Sports Analytics"
        subtitle="Advanced AI-powered analytics in constant evolution"
        description="Make data-driven decisions with comprehensive player and team insights across Cricket, NBA, and EPL."
      />

      <div className="container mx-auto px-6 py-12 relative z-10">

        {/* Sports Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8 max-w-7xl mx-auto">
          {sports.map((sport, index) => (
            <motion.div
              key={sport.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={sport.link}>
                <Card className="p-8 h-full bg-card border-border hover:border-wicky-green transition-all duration-300 cursor-pointer group hover:glow-green">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 rounded-full bg-wicky-green/10 group-hover:bg-wicky-green/20 transition-colors">
                      <sport.icon className="w-12 h-12 text-wicky-green" />
                    </div>
                    <h3 className="text-2xl font-bold text-wicky-green">{sport.title}</h3>
                    <p className="text-muted-foreground">{sport.description}</p>
                    <Button className="w-full bg-wicky-green hover:bg-wicky-green-dark text-wicky-navy font-semibold gradient-primary">
                      Explore {sport.title}
                    </Button>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-20 max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-bold text-center text-wicky-green mb-8">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-card border-border">
              <h3 className="text-xl font-semibold mb-2 text-wicky-green">AI-Powered Insights</h3>
              <p className="text-muted-foreground">
                Advanced algorithms analyze player performance, team dynamics, and match statistics to provide actionable insights.
              </p>
            </Card>
            <Card className="p-6 bg-card border-border">
              <h3 className="text-xl font-semibold mb-2 text-wicky-green">Interactive Visualizations</h3>
              <p className="text-muted-foreground">
                Dynamic charts, heat maps, and performance tables make complex data easy to understand at a glance.
              </p>
            </Card>
            <Card className="p-6 bg-card border-border">
              <h3 className="text-xl font-semibold mb-2 text-wicky-green">Real-Time Analysis</h3>
              <p className="text-muted-foreground">
                Access up-to-date statistics and trends to stay ahead of the game with the latest performance data.
              </p>
            </Card>
            <Card className="p-6 bg-card border-border">
              <h3 className="text-xl font-semibold mb-2 text-wicky-green">Multi-Sport Coverage</h3>
              <p className="text-muted-foreground">
                Comprehensive analytics across Cricket, NBA, and EPL with sport-specific metrics and visualizations.
              </p>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
