# System Prompt Improvements - Fan-Oriented Match Previews

## Overview
Transformed system prompts from technical analytical reports into engaging, fan-oriented match previews that are catchy, interesting, and exciting while maintaining data accuracy.

---

## Key Changes Implemented

### 1. **Identity Shift**
- **Before:** "AI that generates SPECIFIC, DATA-DRIVEN insights"
- **After:** "SPORTS STORYTELLER creating ENGAGING MATCH PREVIEWS for passionate fans"

### 2. **Writing Style Requirements**

#### Before:
- "BE ULTRA-CONCISE - Maximum 1-2 short sentences per insight"
- "NO GENERIC TEXT"
- Focus on listing stats

#### After:
- **ENGAGING & CATCHY** - Build excitement like hyping up friends
- **NARRATIVE-DRIVEN** - Tell stories with data, create storylines
- **PAINT A PICTURE** - Use descriptive, vivid language
- **BUILD DRAMA** - Highlight contrasts, matchup battles
- **2-4 sentences per insight** - Room to tell compelling stories

### 3. **Insight Limit**
- **EXACTLY 5 INSIGHTS** per player/team
- **EXACTLY 5 STRENGTHS** per player/team
- **EXACTLY 5 WEAKNESSES** per player/team
- Quality over quantity approach

### 4. **Power Language Added**

#### Action Words:
✅ dominates, crushes, struggles, explodes, locks down, bleeds, surges

#### Descriptive Terms:
✅ clinical, explosive, vulnerable, ominous, lethal, ice-cold, red-hot

#### Fan-Friendly Phrases:
✅ "owns", "torches", "shutdown artist", "nightmare matchup", "cooking"

#### Build Suspense:
✅ lurking threat, dangerous trend, warning signs, prime territory

### 5. **Before/After Examples Provided**

**NBA Example:**
- ❌ BORING: "LeBron averages 7.44 points in Q2, above league avg of 5.2"
- ✅ ENGAGING: "LeBron owns the second quarter, pouring in 7.44 points while most of the league struggles to crack 5.2—Q2 is his personal scoring clinic where he takes over games"

**EPL Example:**
- ❌ BORING: "Team averages 2.3 goals first half, 1.8 second half"
- ✅ ENGAGING: "They're fast starters who light up the scoreboard early, averaging 2.3 first-half goals, but the engine cools down after the break—just 1.8 in the second half suggests stamina concerns or tactical adjustments by opponents"

---

## Sport-Specific Fan Language Guides

### NBA
- "Fourth quarter assassin", "clutch time killer"
- "Slow starter who heats up", "fades in the second half"
- "Can't protect leads", "comeback kings"
- "Red-hot streak", "ice-cold slump"

### AFL
- "Disposal king", "ball magnet", "midfield beast"
- "Goalkicking machine", "sharpshooter"
- "Home fortress", "road warriors"
- "Bleeding points", "lockdown backline"

### NRL
- "Try-scoring machine", "line-breaker", "finisher"
- "Leaking points", "defensive frailty"
- "Red-hot form", "try-scoring drought"
- "Attacking juggernaut", "defensive steel"

### EPL
- "Clinical finishers", "toothless attack"
- "Leaky defense", "clean sheet merchants"
- "Fast starters", "second-half monsters"
- "Home fortress", "away day warriors"
- "Protect leads like Fort Knox", "bottlers from winning positions"

### IPL/Cricket
- "Powerplay marauder", "death overs specialist"
- "Spin destroyer", "pace merchant's bunny"
- "Boundary hunter", "dot ball accumulator"
- "Accelerates like a rocket", "explodes at the death"
- "Six-hitting monster", "finds gaps beautifully"

---

## Quality Check Requirements

Before outputting, every insight must:
✅ Make a fan say "oh wow, that's interesting!"
✅ Create a mental picture of how they play
✅ Avoid generic phrases
✅ Have personality and punch—not robotic
✅ Tell a mini-story, not just state facts
✅ Make the matchup exciting to watch
✅ Be backed by real data from CSV files

---

## What Was Removed

❌ "Ultra-concise" 1-2 sentence limit (too restrictive)
❌ Robotic stat reporting patterns
❌ Generic corporate language
❌ "Generate as many relevant insights as data supports" (unlimited insights led to basic repetition)
❌ Dry technical tone

---

## What Was Kept

✅ Real data requirements (every claim backed by CSV numbers)
✅ No predictions policy
✅ League average comparisons (but woven naturally into narratives)
✅ Matchup analysis focus
✅ Factual accuracy requirements

---

## Expected Impact

### Before:
"Player X averages 25.3 PPG (league avg: 18.5), 7.2 RPG, 6.8 APG. Strong Q4 performance at 8.2 points."

### After:
"Player X is an offensive juggernaut, dropping 25.3 PPG while the league struggles to average 18.5—he's a top-tier scorer who demoralizes defenses. But here's where it gets dangerous: in the fourth quarter, when games are won and lost, he elevates to another level with 8.2 points, earning his reputation as a clutch-time killer. Teams fear him most when the lights are brightest."

---

## File Modified
- `/Users/np1991/Desktop/data/backend/services/gemini_service.py`

All sports updated: NBA, AFL, NRL, EPL, IPL/Cricket



