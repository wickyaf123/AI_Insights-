import pptxgen from "pptxgenjs";

export interface ChartData {
  labels: string[];
  datasets: {
    name: string;
    values: number[];
  }[];
}

export interface TableData {
  headers: string[];
  rows: (string | number)[][];
}

export const generateCricketPPT = (data: {
  playerName: string;
  team: string;
  opposition: string;
  insights: string[];
  strengths: string[];
  weaknesses: string[];
  performanceData: any[];
  strikeRateZones: any[];
}) => {
  const pptx = new pptxgen();
  
  // Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: "1B2838" };
  titleSlide.addText("Cricket Opposition Planning", {
    x: 0.5,
    y: 2.0,
    w: 9,
    h: 1.5,
    fontSize: 44,
    bold: true,
    color: "00D9C0",
    align: "center",
  });
  titleSlide.addText(`Player Analysis: ${data.playerName}`, {
    x: 0.5,
    y: 3.5,
    w: 9,
    h: 0.8,
    fontSize: 28,
    color: "FFFFFF",
    align: "center",
  });
  titleSlide.addText(`${data.team} vs ${data.opposition}`, {
    x: 0.5,
    y: 4.5,
    w: 9,
    h: 0.6,
    fontSize: 20,
    color: "A0A0A0",
    align: "center",
  });

  // AI Insights Slide
  const insightsSlide = pptx.addSlide();
  insightsSlide.background = { color: "1B2838" };
  insightsSlide.addText("AI Insights", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: 36,
    bold: true,
    color: "00D9C0",
  });
  
  data.insights.forEach((insight, i) => {
    insightsSlide.addText(`• ${insight}`, {
      x: 0.8,
      y: 1.5 + i * 0.7,
      w: 8.5,
      h: 0.6,
      fontSize: 16,
      color: "FFFFFF",
    });
  });

  // Strengths & Weaknesses Slide
  const swSlide = pptx.addSlide();
  swSlide.background = { color: "1B2838" };
  swSlide.addText("Strengths & Weaknesses", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: 36,
    bold: true,
    color: "00D9C0",
  });
  
  // Strengths
  swSlide.addText("Strengths", {
    x: 0.5,
    y: 1.5,
    w: 4.5,
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: "22C55E",
  });
  data.strengths.forEach((strength, i) => {
    swSlide.addText(`✓ ${strength}`, {
      x: 0.7,
      y: 2.2 + i * 0.6,
      w: 4,
      h: 0.5,
      fontSize: 14,
      color: "FFFFFF",
    });
  });

  // Weaknesses
  swSlide.addText("Areas for Improvement", {
    x: 5.0,
    y: 1.5,
    w: 4.5,
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: "F59E0B",
  });
  data.weaknesses.forEach((weakness, i) => {
    swSlide.addText(`⚠ ${weakness}`, {
      x: 5.2,
      y: 2.2 + i * 0.6,
      w: 4,
      h: 0.5,
      fontSize: 14,
      color: "FFFFFF",
    });
  });

  // Performance Table Slide
  const perfSlide = pptx.addSlide();
  perfSlide.background = { color: "1B2838" };
  perfSlide.addText("Performance vs Bowler Types", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: 36,
    bold: true,
    color: "00D9C0",
  });

  const tableRows = [
    [
      { text: "Bowler Type", options: { bold: true, color: "00D9C0" } },
      { text: "Balls Faced", options: { bold: true, color: "00D9C0" } },
      { text: "Strike Rate", options: { bold: true, color: "00D9C0" } },
      { text: "Average", options: { bold: true, color: "00D9C0" } },
      { text: "Dot Ball %", options: { bold: true, color: "00D9C0" } },
      { text: "Boundary %", options: { bold: true, color: "00D9C0" } },
    ],
    ...data.performanceData.map(row => [
      { text: row.bowlerType, options: { color: "FFFFFF" } },
      { text: row.ballsFaced.toString(), options: { color: "FFFFFF" } },
      { text: row.strikeRate.toFixed(1), options: { color: "FFFFFF" } },
      { text: row.average.toFixed(1), options: { color: "FFFFFF" } },
      { text: row.dotBall.toFixed(1), options: { color: "FFFFFF" } },
      { text: row.boundary.toFixed(1), options: { color: "FFFFFF" } },
    ])
  ];

  perfSlide.addTable(tableRows, {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 3.5,
    fill: { color: "2D3748" },
    border: { pt: 1, color: "00D9C0" },
    fontSize: 12,
  });

  // Strike Rate Zones Slide
  const zonesSlide = pptx.addSlide();
  zonesSlide.background = { color: "1B2838" };
  zonesSlide.addText("Strike Rate by Zone & Line", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: 36,
    bold: true,
    color: "00D9C0",
  });

  const zoneRows = [
    [
      { text: "Zone", options: { bold: true, color: "00D9C0" } },
      { text: "Off", options: { bold: true, color: "00D9C0" } },
      { text: "Line", options: { bold: true, color: "00D9C0" } },
      { text: "Leg", options: { bold: true, color: "00D9C0" } },
    ],
    ...data.strikeRateZones.map(zone => [
      { text: zone.zone, options: { color: "FFFFFF" } },
      { text: zone.off.toString(), options: { color: "FFFFFF" } },
      { text: zone.line.toString(), options: { color: "FFFFFF" } },
      { text: zone.leg.toString(), options: { color: "FFFFFF" } },
    ])
  ];

  zonesSlide.addTable(zoneRows, {
    x: 2,
    y: 1.5,
    w: 6,
    h: 3.5,
    fill: { color: "2D3748" },
    border: { pt: 1, color: "00D9C0" },
    fontSize: 14,
  });

  return pptx;
};

export const generateNBAPPT = (data: {
  player1: any;
  player2: any;
  team1Analysis: any;
  team2Analysis: any;
}) => {
  const pptx = new pptxgen();
  
  // Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: "1B2838" };
  titleSlide.addText("NBA Matchup Analysis", {
    x: 0.5,
    y: 2.5,
    w: 9,
    h: 1.5,
    fontSize: 44,
    bold: true,
    color: "00D9C0",
    align: "center",
  });
  titleSlide.addText(`${data.player1.playerName} vs ${data.player2.playerName}`, {
    x: 0.5,
    y: 4.0,
    w: 9,
    h: 0.8,
    fontSize: 24,
    color: "FFFFFF",
    align: "center",
  });

  // Player 1 Analysis
  const p1Slide = pptx.addSlide();
  p1Slide.background = { color: "1B2838" };
  p1Slide.addText(`${data.player1.playerName} - ${data.player1.teamName}`, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: 36,
    bold: true,
    color: "00D9C0",
  });
  
  p1Slide.addText("AI Insights:", {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 0.5,
    fontSize: 20,
    bold: true,
    color: "FFFFFF",
  });
  data.player1.insights.forEach((insight: string, i: number) => {
    p1Slide.addText(`• ${insight}`, {
      x: 0.7,
      y: 2.1 + i * 0.5,
      w: 8.5,
      h: 0.4,
      fontSize: 14,
      color: "FFFFFF",
    });
  });

  p1Slide.addText("Strengths:", {
    x: 0.5,
    y: 3.8,
    w: 4,
    h: 0.4,
    fontSize: 18,
    bold: true,
    color: "22C55E",
  });
  data.player1.strengths.forEach((strength: string, i: number) => {
    p1Slide.addText(`✓ ${strength}`, {
      x: 0.7,
      y: 4.3 + i * 0.4,
      w: 4,
      h: 0.3,
      fontSize: 12,
      color: "FFFFFF",
    });
  });

  p1Slide.addText("Weaknesses:", {
    x: 5,
    y: 3.8,
    w: 4.5,
    h: 0.4,
    fontSize: 18,
    bold: true,
    color: "F59E0B",
  });
  data.player1.weaknesses.forEach((weakness: string, i: number) => {
    p1Slide.addText(`⚠ ${weakness}`, {
      x: 5.2,
      y: 4.3 + i * 0.4,
      w: 4,
      h: 0.3,
      fontSize: 12,
      color: "FFFFFF",
    });
  });

  // Player 2 Analysis (similar structure)
  const p2Slide = pptx.addSlide();
  p2Slide.background = { color: "1B2838" };
  p2Slide.addText(`${data.player2.playerName} - ${data.player2.teamName}`, {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: 36,
    bold: true,
    color: "00D9C0",
  });
  
  p2Slide.addText("AI Insights:", {
    x: 0.5,
    y: 1.5,
    w: 9,
    h: 0.5,
    fontSize: 20,
    bold: true,
    color: "FFFFFF",
  });
  data.player2.insights.forEach((insight: string, i: number) => {
    p2Slide.addText(`• ${insight}`, {
      x: 0.7,
      y: 2.1 + i * 0.5,
      w: 8.5,
      h: 0.4,
      fontSize: 14,
      color: "FFFFFF",
    });
  });

  // Team Analysis Slide
  const teamSlide = pptx.addSlide();
  teamSlide.background = { color: "1B2838" };
  teamSlide.addText("Team Analysis Comparison", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: 36,
    bold: true,
    color: "00D9C0",
  });
  
  teamSlide.addText(data.player1.teamName, {
    x: 0.5,
    y: 1.5,
    w: 4.5,
    h: 0.5,
    fontSize: 24,
    bold: true,
    color: "00D9C0",
  });
  data.team1Analysis.insights.forEach((insight: string, i: number) => {
    teamSlide.addText(`• ${insight}`, {
      x: 0.7,
      y: 2.2 + i * 0.5,
      w: 4,
      h: 0.4,
      fontSize: 12,
      color: "FFFFFF",
    });
  });

  teamSlide.addText(data.player2.teamName, {
    x: 5.0,
    y: 1.5,
    w: 4.5,
    h: 0.5,
    fontSize: 24,
    bold: true,
    color: "00D9C0",
  });
  data.team2Analysis.insights.forEach((insight: string, i: number) => {
    teamSlide.addText(`• ${insight}`, {
      x: 5.2,
      y: 2.2 + i * 0.5,
      w: 4,
      h: 0.4,
      fontSize: 12,
      color: "FFFFFF",
    });
  });

  return pptx;
};

export const generateEPLPPT = (data: {
  homeTeam: string;
  awayTeam: string;
  teamComparisonData: any[];
  recentFormData: any[];
}) => {
  const pptx = new pptxgen();
  
  // Title Slide
  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: "1B2838" };
  titleSlide.addText("EPL Match Analysis", {
    x: 0.5,
    y: 2.5,
    w: 9,
    h: 1.5,
    fontSize: 44,
    bold: true,
    color: "00D9C0",
    align: "center",
  });
  titleSlide.addText(`${data.homeTeam} vs ${data.awayTeam}`, {
    x: 0.5,
    y: 4.0,
    w: 9,
    h: 0.8,
    fontSize: 28,
    color: "FFFFFF",
    align: "center",
  });

  // Team Comparison Chart
  const compSlide = pptx.addSlide();
  compSlide.background = { color: "1B2838" };
  compSlide.addText("Team Comparison", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: 36,
    bold: true,
    color: "00D9C0",
  });

  const chartData = data.teamComparisonData.map(item => ({
    name: item.metric,
    labels: [data.homeTeam, data.awayTeam],
    values: [item.home, item.away],
  }));

  compSlide.addChart(pptx.ChartType.bar, chartData, {
    x: 1,
    y: 1.5,
    w: 8,
    h: 4,
    chartColors: ["00D9C0", "F59E0B"],
    showLegend: true,
    showTitle: false,
    valAxisMaxVal: 100,
  });

  // Recent Form Table
  const formSlide = pptx.addSlide();
  formSlide.background = { color: "1B2838" };
  formSlide.addText("Recent Form (Last 5 Games)", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: 36,
    bold: true,
    color: "00D9C0",
  });

  const formRows = [
    [
      { text: "Match", options: { bold: true, color: "00D9C0" } },
      { text: `${data.homeTeam} Goals`, options: { bold: true, color: "00D9C0" } },
      { text: `${data.awayTeam} Goals`, options: { bold: true, color: "00D9C0" } },
    ],
    ...data.recentFormData.map(match => [
      { text: match.match, options: { color: "FFFFFF" } },
      { text: match.home.toString(), options: { color: "FFFFFF" } },
      { text: match.away.toString(), options: { color: "FFFFFF" } },
    ])
  ];

  formSlide.addTable(formRows, {
    x: 2,
    y: 1.5,
    w: 6,
    h: 3,
    fill: { color: "2D3748" },
    border: { pt: 1, color: "00D9C0" },
    fontSize: 16,
  });

  // Key Stats Slide
  const statsSlide = pptx.addSlide();
  statsSlide.background = { color: "1B2838" };
  statsSlide.addText("Key Statistics", {
    x: 0.5,
    y: 0.5,
    w: 9,
    h: 0.8,
    fontSize: 36,
    bold: true,
    color: "00D9C0",
  });

  const stats = [
    { title: "Win Rate", value: "68%", change: "+12%", color: "00D9C0" },
    { title: "Clean Sheets", value: "42%", change: "-5%", color: "F59E0B" },
    { title: "Goals Per Game", value: "2.8", change: "+0.4", color: "22C55E" },
  ];

  stats.forEach((stat, i) => {
    const x = 0.8 + i * 3.2;
    statsSlide.addText(stat.title, {
      x,
      y: 2.5,
      w: 2.5,
      h: 0.5,
      fontSize: 18,
      color: "A0A0A0",
      align: "center",
    });
    statsSlide.addText(stat.value, {
      x,
      y: 3.0,
      w: 2.5,
      h: 0.8,
      fontSize: 32,
      bold: true,
      color: stat.color,
      align: "center",
    });
    statsSlide.addText(stat.change, {
      x,
      y: 3.8,
      w: 2.5,
      h: 0.4,
      fontSize: 16,
      color: "FFFFFF",
      align: "center",
    });
  });

  return pptx;
};
