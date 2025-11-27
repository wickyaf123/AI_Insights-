import { motion } from "framer-motion";

interface ZoneData {
  zone: string;
  off: number;
  line: number;
  leg: number;
}

interface StrikeRateZonesProps {
  playerName: string;
  zones: ZoneData[];
}

const getZoneColor = (strikeRate: number): string => {
  if (strikeRate >= 140) return "bg-success text-success-foreground";
  if (strikeRate >= 120) return "bg-success/70 text-success-foreground";
  if (strikeRate >= 100) return "bg-warning/70 text-warning-foreground";
  if (strikeRate >= 80) return "bg-warning text-warning-foreground";
  return "bg-danger text-danger-foreground";
};

export const StrikeRateZones = ({ playerName, zones }: StrikeRateZonesProps) => {
  const zoneLabels = ["Bouncer", "Short", "Back of length", "Length", "Full", "Yorker"];
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Strike Rate Zones</h3>
        <span className="text-sm text-muted-foreground px-3 py-1 bg-wicky-green/20 rounded-full border border-wicky-green/30">
          Showing stats for: {playerName}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="py-3 px-4 text-left font-semibold bg-secondary/30"></th>
              <th className="py-3 px-4 text-center font-semibold bg-secondary/30">Off</th>
              <th className="py-3 px-4 text-center font-semibold bg-secondary/30">Line</th>
              <th className="py-3 px-4 text-center font-semibold bg-secondary/30">Leg</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone, index) => (
              <motion.tr
                key={zone.zone}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border-b border-border/30"
              >
                <td className="py-4 px-4 font-semibold bg-secondary/20">
                  {zoneLabels[index] || zone.zone}
                </td>
                <td className="py-4 px-4 text-center">
                  <div className={`inline-block px-4 py-2 rounded-md font-bold min-w-[80px] ${getZoneColor(zone.off)}`}>
                    {zone.off}
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className={`inline-block px-4 py-2 rounded-md font-bold min-w-[80px] ${getZoneColor(zone.line)}`}>
                    {zone.line}
                  </div>
                </td>
                <td className="py-4 px-4 text-center">
                  <div className={`inline-block px-4 py-2 rounded-md font-bold min-w-[80px] ${getZoneColor(zone.leg)}`}>
                    {zone.leg}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h4 className="text-sm font-semibold mb-3">Performance Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success"></div>
            <span>Best 6 zones</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-warning"></div>
            <span>Middle 6 zones</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-danger"></div>
            <span>Worst 6 zones</span>
          </div>
        </div>
      </div>
    </div>
  );
};
