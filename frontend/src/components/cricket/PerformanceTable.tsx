import { motion } from "framer-motion";

interface PerformanceRow {
  bowlerType: string;
  ballsFaced: number;
  strikeRate: number;
  average: number;
  dotBall: number;
  boundary: number;
}

interface PerformanceTableProps {
  playerName: string;
  data: PerformanceRow[];
}

const getPerformanceColor = (value: number, metric: "strikeRate" | "average" | "dotBall" | "boundary"): string => {
  if (metric === "strikeRate") {
    if (value > 150) return "stat-excellent";
    if (value > 130) return "stat-good";
    if (value > 100) return "stat-average";
    return "stat-poor";
  }
  if (metric === "average") {
    if (value > 35) return "stat-excellent";
    if (value > 25) return "stat-good";
    if (value > 20) return "stat-average";
    return "stat-poor";
  }
  if (metric === "dotBall") {
    if (value > 40) return "stat-poor";
    if (value > 30) return "stat-average";
    if (value > 20) return "stat-good";
    return "stat-excellent";
  }
  if (metric === "boundary") {
    if (value > 15) return "stat-excellent";
    if (value > 10) return "stat-good";
    if (value > 5) return "stat-average";
    return "stat-poor";
  }
  return "";
};

export const PerformanceTable = ({ playerName, data }: PerformanceTableProps) => {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Performance vs Bowling Types</h3>
      <p className="text-sm text-muted-foreground">
        Performance statistics for <span className="text-wicky-green font-medium">{playerName}</span> against different bowling types
      </p>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold bg-secondary/30">Bowler Type</th>
              <th className="text-center py-3 px-4 font-semibold bg-secondary/30">Balls Faced</th>
              <th className="text-center py-3 px-4 font-semibold bg-secondary/30">Strike Rate</th>
              <th className="text-center py-3 px-4 font-semibold bg-secondary/30">Average</th>
              <th className="text-center py-3 px-4 font-semibold bg-secondary/30">Dot Ball %</th>
              <th className="text-center py-3 px-4 font-semibold bg-secondary/30">Boundary %</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <motion.tr
                key={row.bowlerType}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-border/50 hover:bg-secondary/20 transition-colors"
              >
                <td className="py-3 px-4 font-medium">{row.bowlerType}</td>
                <td className="py-3 px-4 text-center">{row.ballsFaced}</td>
                <td className={`py-3 px-4 text-center font-semibold rounded-md ${getPerformanceColor(row.strikeRate, "strikeRate")}`}>
                  {row.strikeRate.toFixed(1)}
                </td>
                <td className={`py-3 px-4 text-center font-semibold rounded-md ${getPerformanceColor(row.average, "average")}`}>
                  {row.average.toFixed(1)}
                </td>
                <td className={`py-3 px-4 text-center font-semibold rounded-md ${getPerformanceColor(row.dotBall, "dotBall")}`}>
                  {row.dotBall.toFixed(1)}%
                </td>
                <td className={`py-3 px-4 text-center font-semibold rounded-md ${getPerformanceColor(row.boundary, "boundary")}`}>
                  {row.boundary.toFixed(1)}%
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-muted-foreground italic">
        Data Context: Performance statistics for {playerName} against different bowling types
      </div>
    </div>
  );
};
