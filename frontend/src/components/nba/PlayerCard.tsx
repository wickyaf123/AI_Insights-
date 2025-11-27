import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface PlayerCardProps {
  playerName: string;
  teamName: string;
  insights: string[];
  strengths: string[];
  weaknesses: string[];
}

export const PlayerCard = ({ playerName, teamName, insights, strengths, weaknesses }: PlayerCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-xl p-6 space-y-6 h-full flex flex-col"
    >
      <div>
        <h2 className="text-2xl font-bold text-wicky-green mb-1">Player Analysis: {playerName}</h2>
        <p className="text-sm text-muted-foreground">{teamName}</p>
      </div>

      {/* AI Insights */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-wicky-green-light flex items-center gap-2">
          AI Insights
        </h3>
        <ul className="space-y-2">
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

      {/* Strengths */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-success flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Strengths
        </h3>
        <ul className="space-y-2">
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

      {/* Weaknesses */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-warning flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Areas for Improvement
        </h3>
        <ul className="space-y-2">
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
  );
};
