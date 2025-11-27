import { motion } from "framer-motion";

interface HeatmapZone {
  zone: string;
  intensity: number; // 0-100
}

interface FieldMapProps {
  teamName: string;
  metric: "possession" | "shots" | "passes";
  zones: HeatmapZone[];
}

const getIntensityColor = (intensity: number): string => {
  if (intensity >= 80) return "hsl(var(--danger))";
  if (intensity >= 60) return "hsl(var(--warning))";
  if (intensity >= 40) return "hsl(38 92% 60%)";
  if (intensity >= 20) return "hsl(var(--success))";
  return "hsl(var(--wicky-green))";
};

export const FieldMap = ({ teamName, metric, zones }: FieldMapProps) => {
  const metricLabels = {
    possession: "Ball Possession Heat Map",
    shots: "Shot Locations",
    passes: "Passing Density"
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-semibold">{metricLabels[metric]}</h3>
        <p className="text-sm text-muted-foreground">{teamName}</p>
      </div>

      <div className="relative aspect-[1.5/1] max-w-3xl mx-auto bg-success/20 rounded-lg overflow-hidden border-2 border-foreground/20">
        {/* Football Pitch */}
        <svg viewBox="0 0 600 400" className="w-full h-full">
          {/* Pitch outline */}
          <rect x="10" y="10" width="580" height="380" fill="hsl(142 76% 36% / 0.2)" stroke="hsl(var(--foreground))" strokeWidth="2" />
          
          {/* Center line */}
          <line x1="300" y1="10" x2="300" y2="390" stroke="hsl(var(--foreground))" strokeWidth="2" />
          
          {/* Center circle */}
          <circle cx="300" cy="200" r="50" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
          <circle cx="300" cy="200" r="3" fill="hsl(var(--foreground))" />
          
          {/* Penalty areas */}
          <rect x="10" y="120" width="80" height="160" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
          <rect x="510" y="120" width="80" height="160" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
          
          {/* Goal areas */}
          <rect x="10" y="160" width="30" height="80" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
          <rect x="560" y="160" width="30" height="80" fill="none" stroke="hsl(var(--foreground))" strokeWidth="2" />
          
          {/* Goals */}
          <rect x="0" y="180" width="10" height="40" fill="hsl(var(--foreground) / 0.3)" stroke="hsl(var(--foreground))" strokeWidth="2" />
          <rect x="590" y="180" width="10" height="40" fill="hsl(var(--foreground) / 0.3)" stroke="hsl(var(--foreground))" strokeWidth="2" />

          {/* Heat zones (simplified grid) */}
          {zones.map((zone, index) => {
            const row = Math.floor(index / 6);
            const col = index % 6;
            const x = 10 + col * 97;
            const y = 10 + row * 95;
            
            return (
              <motion.rect
                key={index}
                x={x}
                y={y}
                width="97"
                height="95"
                fill={getIntensityColor(zone.intensity)}
                opacity={zone.intensity / 100}
                initial={{ opacity: 0 }}
                animate={{ opacity: zone.intensity / 100 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
              >
                <title>{`${zone.zone}: ${zone.intensity}%`}</title>
              </motion.rect>
            );
          })}
        </svg>

        {/* Labels */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-semibold bg-background/80 px-2 py-1 rounded">
          Attacking Direction →
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <span className="text-sm font-medium text-muted-foreground">Intensity:</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(var(--wicky-green))" }} />
          <span className="text-sm">Low (0-20%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(var(--success))" }} />
          <span className="text-sm">Medium (20-40%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(38 92% 60%)" }} />
          <span className="text-sm">High (40-60%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(var(--warning))" }} />
          <span className="text-sm">Very High (60-80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: "hsl(var(--danger))" }} />
          <span className="text-sm">Extreme (80-100%)</span>
        </div>
      </div>
    </div>
  );
};
