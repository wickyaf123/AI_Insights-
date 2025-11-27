import { motion } from "framer-motion";

interface DismissalPoint {
  x: number;
  y: number;
  count: number;
  category: "highest" | "high" | "medium" | "low" | "lowest";
}

interface PitchMapProps {
  playerName: string;
  dismissals: DismissalPoint[];
}

const categoryColors = {
  highest: "hsl(var(--danger))",
  high: "hsl(var(--warning))",
  medium: "hsl(38 92% 60%)",
  low: "hsl(var(--success))",
  lowest: "hsl(var(--wicky-green))",
};

const categorySize = {
  highest: 40,
  high: 32,
  medium: 24,
  low: 20,
  lowest: 16,
};

export const PitchMap = ({ playerName, dismissals }: PitchMapProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-xl font-semibold text-wicky-green">Dismissal Locations for {playerName}</h3>
        <span className="text-sm text-muted-foreground px-4 py-1.5 bg-gradient-to-r from-wicky-green/20 to-wicky-green-light/10 rounded-full border border-wicky-green/30 shadow-sm shadow-wicky-green/20">
          Showing stats for: {playerName}
        </span>
      </div>

      <div className="relative aspect-square max-w-2xl mx-auto">
        {/* Glow effect background */}
        <div className="absolute inset-0 bg-gradient-radial from-wicky-green/5 via-transparent to-transparent rounded-full blur-2xl" />
        
        {/* Cricket Field Circle */}
        <svg viewBox="0 0 400 400" className="w-full h-full relative z-10">
          {/* Outer boundary with gradient */}
          <defs>
            <linearGradient id="fieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(142 76% 36% / 0.4)" />
              <stop offset="50%" stopColor="hsl(142 76% 36% / 0.25)" />
              <stop offset="100%" stopColor="hsl(142 76% 36% / 0.3)" />
            </linearGradient>
            <radialGradient id="pitchGradient" cx="50%" cy="50%">
              <stop offset="0%" stopColor="hsl(30 100% 45%)" />
              <stop offset="100%" stopColor="hsl(30 100% 35%)" />
            </radialGradient>
          </defs>
          
          <circle
            cx="200"
            cy="200"
            r="195"
            fill="url(#fieldGradient)"
            stroke="hsl(var(--wicky-green))"
            strokeWidth="4"
            className="drop-shadow-lg"
          />
          
          {/* Inner circle */}
          <circle
            cx="200"
            cy="200"
            r="150"
            fill="hsl(142 76% 36% / 0.15)"
            stroke="hsl(var(--wicky-green) / 0.4)"
            strokeWidth="2"
            strokeDasharray="8,4"
          />

          {/* Pitch with gradient */}
          <rect
            x="185"
            y="50"
            width="30"
            height="300"
            fill="url(#pitchGradient)"
            stroke="hsl(30 100% 25%)"
            strokeWidth="2"
            rx="2"
            className="drop-shadow-md"
          />

          {/* Labels with better styling */}
          <text x="200" y="30" textAnchor="middle" fill="hsl(var(--wicky-green))" fontSize="14" fontWeight="700" className="drop-shadow">
            Bowler's End
          </text>
          <text x="200" y="385" textAnchor="middle" fill="hsl(var(--wicky-green))" fontSize="14" fontWeight="700" className="drop-shadow">
            Striker's End
          </text>
          <text x="30" y="205" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="14" fontWeight="600">
            Off-side
          </text>
          <text x="370" y="205" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="14" fontWeight="600">
            On/leg-side
          </text>

          {/* Dismissal points with improved styling */}
          {dismissals.map((point, index) => (
            <g key={index}>
              {/* Glow effect for dismissal points */}
              <motion.circle
                cx={point.x}
                cy={point.y}
                r={categorySize[point.category] + 4}
                fill={categoryColors[point.category]}
                opacity={0.2}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.2 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="blur-sm"
              />
              {/* Main dismissal point */}
              <motion.circle
                cx={point.x}
                cy={point.y}
                r={categorySize[point.category]}
                fill={categoryColors[point.category]}
                opacity={0.85}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.2, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="drop-shadow-lg cursor-pointer"
              >
                <title>{`${point.count} dismissal${point.count > 1 ? 's' : ''} - ${point.category}`}</title>
              </motion.circle>
            </g>
          ))}
        </svg>
      </div>

      {/* Legend with improved styling */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-border/50">
        <span className="text-sm font-semibold text-wicky-green">Legend (Dismissal Count):</span>
        {Object.entries(categoryColors).map(([category, color]) => (
          <div key={category} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/50 border border-border/30 hover:border-wicky-green/40 transition-colors">
            <div
              className="w-4 h-4 rounded-full shadow-sm"
              style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}40` }}
            />
            <span className="text-sm capitalize font-medium">{category}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
