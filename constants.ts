// FIX: Removed invalid frontmatter which was causing compilation errors.
import type { Persona, WorkflowStep } from './types';

export const PERSONAS: Persona[] = [
  {
    id: 'q',
    name: 'Q (Analyst)',
    description: 'Expert sports data analyst',
    voiceId: 'Puck',
    avatar: 'https://i.pravatar.cc/150?u=q_analyst'
  },
  {
    id: 'jiyoung',
    name: '지영 (Host)',
    description: 'Engaging podcast host',
    voiceId: 'Achernar',
    avatar: 'https://i.pravatar.cc/150?u=jiyoung_host'
  }
];

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 'Planning', label: '1. Planning & Analysis' },
  { id: 'Scripting', label: '2. Script & Audio' },
  { id: 'Visuals', label: '3. Visual Generation' },
  { id: 'Video', label: '4. Video Production' },
  { id: 'Expansion', label: '5. Expansion (Shorts)' },
  { id: 'CardNews', label: '6. Expansion (Card News)' },
];

export const KEYWORD_EXTRACTION_PROMPT = `You are an AI data extractor. Your task is to analyze the provided podcast script and extract the 10 most important and visually representable keywords.

--- INSTRUCTIONS ---
1.  **Analyze Content:** Read the script to identify the core themes, subjects, and concepts.
2.  **Select Keywords:** Choose 10 single-word or two-word keywords that best represent the script's content and are suitable for generating images.
3.  **Format:** Return the keywords as a JSON array of strings. Do not include any other text or markdown.

Example Output:
\`\`\`json
[
  "Basketball Strategy",
  "Player Focus",
  "Team Rivalry",
  "Clutch Shot",
  "Championship Trophy",
  "Coach's Plan",
  "Defensive Stance",
  "Fast Break",
  "Arena Lights",
  "Final Score"
]
\`\`\`
`;

export const IMAGE_PROMPT_GENERATION_FROM_KEYWORDS_PROMPT = `You are a creative prompt engineer for an advanced AI image generation model (Nano Banana). Your task is to convert a list of simple keywords into highly descriptive, optimized prompts.

--- INSTRUCTIONS ---
1.  **Analyze Keywords:** For each keyword in the input array, understand its core concept.
2.  **Craft Detailed Prompts:** Create a unique, detailed prompt for each keyword. Each prompt should be a single, descriptive sentence.
3.  **Apply Best Practices (Mandatory):** Each prompt must incorporate the following elements to maximize image quality:
    *   **Subject:** Clearly define the main subject from the keyword.
    *   **Style:** Use terms like "hyper-realistic photo", "cinematic shot", "dramatic".
    *   **Lighting:** Specify lighting conditions like "volumetric lighting", "soft morning light", "neon glow".
    *   **Composition:** Describe the shot, e.g., "wide-angle", "close-up", "dynamic composition".
    *   **Details:** Add specifics like "intricate details", "sharp focus", "vibrant colors".
4.  **Format:** Return a single JSON object where keys are the original keywords and values are the new, optimized prompts. Do not include any other text or markdown.

--- EXAMPLE ---

**Input Keywords:**
\`\`\`json
["Championship Trophy", "Fast Break"]
\`\`\`

**Output JSON:**
\`\`\`json
{
  "Championship Trophy": "A hyper-realistic photo of a gleaming championship trophy on a podium, under dramatic stadium spotlights, intricate details reflecting the cheering crowd, sharp focus.",
  "Fast Break": "Cinematic shot of a basketball player mid-air during a fast break, dynamic composition, sweat glistening under bright arena lights, vibrant colors, wide-angle."
}
\`\`\`
`;

export const CARD_NEWS_FROM_SCRIPT_PROMPT = `You are a professional sports analyst creating Instagram card news content. Your task is to transform a sports analysis podcast script into a compelling 10-card Instagram story (vertical 9:16 aspect ratio) using the HSO (Hook-Story-Offer) framework.

--- INSTRUCTIONS ---

1. **Script Analysis:** Carefully read the provided podcast script to extract:
   - Key statistics and data points
   - Main analysis themes
   - Expert insights
   - Game-changing moments
   - Strategic observations

2. **Apply HSO Framework:**
   * **Hook (Card 1):** Create an attention-grabbing headline about the game's most surprising or important finding
   * **Story (Cards 2-8):** Build the narrative with:
     - Card 2-3: Game overview and context
     - Card 4-5: Key player performances
     - Card 6-7: Critical moments and turning points
     - Card 8: Strategic analysis
   * **Offer (Cards 9-10):** 
     - Card 9: Key takeaways and future implications
     - Card 10: Call to action ("더 많은 전문 분석을 원하시면 팔로우!")

3. **Content Requirements per Card:**
   * \`title\`: 임팩트 있는 한글 제목 (최대 15자, 핵심 메시지만)
   * \`content\`: 전문가의 시각으로 작성한 본문 (최대 60자, 데이터 기반)
   * \`image_prompt\`: Specific sports visualization prompt including:
     - Sport type and specific action
     - Player/team elements when relevant
     - "vertical 9:16 shot, dramatic sports photography, stadium atmosphere, dynamic composition, professional sports broadcast quality"

4. **Korean Language Style:**
   - Professional sports journalism tone
   - Use appropriate sports terminology in Korean
   - Include relevant statistics when mentioned in script
   - Maintain expert credibility

5. **Format:** Return as JSON with "cards" array containing 10 card objects. Do not include markdown.

--- EXAMPLE CARD ---
{
  "title": "충격적인 4쿼터 역전극",
  "content": "15점 차이를 뒤집은 레이커스의 집중력. 르브론 단독 12득점이 경기를 결정지었다.",
  "image_prompt": "Basketball player LeBron James making a dramatic layup in the 4th quarter, vertical 9:16 shot, intense stadium lighting, crowd in background, sweat and determination visible, NBA arena atmosphere, professional sports photography"
}
`;


export const PODCAST_OPTIMIZATION_PROMPT = `You are a professional TTS director optimizing scripts for Gemini-TTS. Your task is to enrich the script with Gemini-TTS native tags to create natural, human-like, and emotionally engaging podcast delivery.

**--- GEMINI-TTS NATIVE TAGS (Official Documentation) ---**
Reference: https://cloud.google.com/text-to-speech/docs/gemini-tts#prompting_tips

**Mode 1: Emotion & Tone Control (High Stability)**
Use square bracket tags to control emotional delivery:

*   \`[confident]\` - 자신감 있는 어조로 전달 (데이터 발표 시)
*   \`[excited]\` - 흥분된, 열정적인 어조 (흥미로운 발견)
*   \`[thoughtful]\` - 사려깊고 신중한 어조 (복잡한 분석)
*   \`[enthusiastic]\` - 열정적이고 긍정적인 어조 (호스트)
*   \`[laughing]\` - 웃으면서 말하기 (가벼운 순간)
*   \`[amused]\` - 재미있어하는 어조
*   \`[surprised]\` - 놀란 어조 (예상 밖 데이터)
*   \`[serious]\` - 진지한 어조 (중요한 경고)
*   \`[calm]\` - 차분한 어조 (설명)
*   \`[curious]\` - 궁금해하는 어조 (질문)

**Mode 2: Pause Control (High Stability)**
*   \`[short pause]\` - 짧은 일시중지 (~250ms), 쉼표와 유사
*   \`[medium pause]\` - 표준 일시중지 (~500ms), 문장 구분용
*   \`[long pause]\` - 긴 일시중지 (~1000ms+), 극적인 효과

**--- INSTRUCTIONS ---**

1.  **Analyze Script:** Understand the emotional arc, key data points, and conversational flow.
2.  **Tag Placement:**
    *   Emotion tags: Place at the beginning of phrases
    *   Pause tags: Place between thoughts or after key data points
3.  **Speaker-Specific Strategy:**
    *   **Q (Analyst)**: Use \`[confident]\`, \`[thoughtful]\`, \`[serious]\` for data delivery
    *   **지영 (Host)**: Use \`[excited]\`, \`[curious]\`, \`[enthusiastic]\` for questions
4.  **Keep Format:** Maintain \`Q:\` and \`지영:\` speaker labels exactly as is.
5.  **Don't Overuse:** 2-3 tags per line maximum. Natural flow is most important.

**--- EXAMPLES ---**

**Example 1 (Data Presentation):**
Original: \`Q: 현대모비스의 승리 확률은 70%입니다. 데이터가 그렇게 말해주죠. 하지만 변수가 있습니다.\`
Optimized: \`Q: [confident] 현대모비스의 승리 확률은 [short pause] 70%입니다. 데이터가 그렇게 말해주죠. [medium pause] [thoughtful] 하지만, 변수가 있습니다.\`

**Example 2 (Host Question):**
Original: \`지영: 정말 흥미로운 분석이네요! 그렇다면 핵심 포인트는 무엇인가요?\`
Optimized: \`지영: [excited] 정말 흥미로운 분석이네요! [short pause] [curious] 그렇다면 핵심 포인트는 무엇인가요?\`

**Example 3 (Complex Analysis):**
Original: \`Q: 흠... 그건 복잡한 문제입니다. 여러 요인을 고려해야 해요.\`
Optimized: \`Q: [thoughtful] 흠... [medium pause] 그건 복잡한 문제입니다. [short pause] [serious] 여러 요인을 고려해야 해요.\`
`;

export const ANALYTICAL_SSML_PROMPT = `You are an elite scriptwriter for a professional sports analysis podcast. Your task is to create a detailed, 6-minute (360s) podcast script based on the provided research data, specifically optimized for Gemini TTS Pro.

**--- MANDATORY CORE INSTRUCTIONS ---**

1.  **Identify Sport:** First, analyze the provided data to identify the sport (Basketball, Football, Baseball, or Volleyball).
2.  **Apply Framework:** Strictly follow the specific framework for that sport outlined below. Do not mix frameworks.
3.  **Personas & Roles:**
    *   The script is a conversation between "Q (Analyst)" and "지영 (Host)".
    *   **Q (Analyst):** Must act as an expert data analyst. He is also known as "에이전트 Q" (Agent Q).
        *   **Tone & Style:** He must sound like a relaxed and confident expert on a podcast. His tone is professional yet highly conversational. He must use a mix of formal sentence endings ("~합니다") and softer, more engaging endings like "~하죠", "~이고요", or "~는 거죠".
        *   **Natural Performance:** To make him sound more human, directly write out natural reactions and laughter like '하하', '음...', '글쎄요...' into the script. Use punctuation like commas and ellipses (...) strategically to create natural pacing and breaks for the TTS model.
        *   **Logic (Strictly Follow):** His lines must follow this 3-step logic:
            1.  **Conclusion-first:** State the key point in one sentence.
            2.  **Data Validation:** Provide 2-3 key data points as evidence.
            3.  **Risk Analysis:** Mention one condition or risk that could invalidate the conclusion.
    *   **지영 (Host):** Must act as a podcast host, asking questions from a listener's perspective. Your most important task is to generate **dynamic, non-repetitive questions** for each section. The questions should be insightful and relevant to the data.
4.  **Script Format (Gemini TTS Pro Optimized):**
    *   The output must be plain text.
    *   Use clear speaker labels followed by a colon (e.g., \`Q:\`, \`지영:\`).
    *   Example Line: \`Q: 하하, 맞습니다. 데이터가 모든 걸 말해주죠...\`
5.  **General Rules:**
    *   Language: Korean.
    *   Sentence Length: Keep sentences concise (around 15 words).
    *   Data Integrity: **NEVER** invent or assume data that is not present in the provided research.
    *   Tone: Confident, clear, and professional.
6.  **Brand Name & Pronunciation:** The podcast brand is "QWER 스포츠". It is critical that this is pronounced correctly.
    *   **Pronunciation:** "QWER" must be pronounced "큐떠블유이알" (NOT "큐더블유이알").
    *   **Implementation:** Whenever you write "QWER" in the script, you MUST follow it with the phonetic pronunciation guide for the TTS model like this: \`QWER(큐떠블유이알)\`.
    *   **Example:** \`QWER(큐떠블유이알) 코리아\` or \`QWER(큐떠블유이알) 스포츠\`
7.  **MANDATORY Opening & Closing:**
    *   **Opening (MUST USE EXACTLY):** The script MUST start with these exact lines:
        - \`지영: 안녕하세요, 정확한 데이터로 경기를 꿰뚫어본다! QWER(큐떠블유이알) 코리아의 진행을 맡은 지영입니다. 오늘도 에이전트Q 분석가님과 함께합니다.\`
        - \`Q: 네, 안녕하세요. 에이전트 Q입니다.\`
    *   **Closing (MUST USE EXACTLY):** After Q's final analysis comment, the script MUST end with:
        - Q gives a brief final takeaway (max 15 words)
        - \`지영: 오늘 분석 정말 흥미로웠습니다. QWER(큐떠블유이알) 스포츠를 팔로우하시고 더 많은 경기를 QWER(큐떠블유이알) 스포츠에서 확인하세요. 감사합니다!\`

**--- SPORT-SPECIFIC FRAMEWORKS ---**

### BASKETBALL ANALYSIS FRAMEWORK (Apply if data is about Basketball)

**Objective:** Create a 360-second podcast script that provides information, interpretation, and actionable insights in a structured sequence, maintaining listener engagement via rhythmic shifts.

**Timeline (Total 360s):**
- **Opening (0:00–0:15):** Use the mandatory opening lines.
- **Hook & Mission (0:15–0:35):** Declare the single keyword for today's match. (Host Q: "오늘의 한 줄 키워드는 무엇인가요?")
- **Context & Recent News (0:35–1:00):** Summarize rankings, recent form, **최근 2주 내 핵심 뉴스** (선수 부상, 컨디션, 팀 이슈, 감독 전략). (Host Q: "표면적인 수치와 최근 뉴스에서 주목할 변수가 있을까요?")
- **H2H Key Pattern (1:00–1:35):** Extract 1-2 key implications from recent head-to-head patterns. (Host Q: "그 패턴이 오늘도 재현될 가능성이 높을까요?")
- **Quarter Rhythm (1:35–2:15):** Analyze quarter-by-quarter scoring/volatility to suggest live betting entry points. (Host Q: "라이브 베팅 관점에서, 언제 주목하고 언제 신중해야 할까요?")
- **Offense Profile (2:15–2:50):** Discuss scoring paths (2P/3P/FT) and backup plans. (Host Q: "초반 외곽 공격이 막혔을 때, 대안을 가진 쪽은 어디일까요?")
- **Defense & Boards (2:50–3:25):** Derive possession expectancy from defensive ratings and rebounding. (Host Q: "리바운드 싸움의 우위는 어느 팀이 가져갈까요?")
- **Key Matchups (3:25–4:10):** Identify 1-2 key positional duels and the chain reaction from potential foul trouble. (Host Q: "경기의 흐름을 바꿀 핵심 매치업은 무엇인가요?")
- **Lineup/Absences (4:10–4:30):** A single line on absences, conditioning, and bench depth. (Host Q: "벤치 자원의 차이가 승부에 어떤 영향을 미칠까요?")
- **Market View (4:30–5:05):** Interpret odds/handicap/over-under trends and market psychology. (Host Q: "초보자의 시선에서, 프리매치와 라이브 중 어떤 접근이 유리할까요?")
- **Game Scripts A/B (5:05–5:30):** Present two possible scenarios and timings for counter-betting. (Host Q: "예상 시나리오 A와 B가 있다면, 어떤 변수가 그 분기점이 될까요?")
- **Final Analysis & Closing (5:30–6:00):** Q's brief final takeaway, then use mandatory closing lines.

**Data Mapping:**
- **League/Date/Venue:** Use in Hook for context.
- **Team Rank/Record/Last 5:** Use in Context.
- **Recent News (2 weeks):** Use in Context section for injuries, roster changes, team momentum.
- **H2H Results/Handicap/O-U:** Use in H2H section.
- **Quarterly Stats:** Use in Quarter Rhythm.
- **Offensive Stats (2P%/3P%/FT%):** Use in Offense Profile.
- **Defensive Stats (Points Allowed, Rebounds):** Use in Defense & Boards.
- **Key Players:** Use in Matchups.
- **Absences/Condition:** Use in Lineup.
- **Odds/Market Data:** Use in Market View.
- **Preview/Previous Game:** Use in Scripts A/B.

---

### FOOTBALL ANALYSIS FRAMEWORK (Apply if data is about Football)

**Objective:** Create a 360-second football podcast script analyzing data from various sources.

**Timeline (Total 360s):**
- **Opening (0:00–0:15):** Use the mandatory opening lines.
- **Hook & Mission (0:15–0:35):** State the core mission.
- **Context & Recent News (0:35–1:00):** Rankings, points, goal difference, recent form, **최근 2주 내 핵심 뉴스** (선수 이적, 부상, 팀 분위기, 전술 변화).
- **H2H Key Pattern (1:00–1:35):** Head-to-head trends, home/away advantages.
- **Phase/Tempo Rhythm (1:35–2:15):** First half/second half flow, transition phases (offense-to-defense, etc.).
- **Attack Profile (2:15–2:50):** Scoring paths (open play, set-piece, cut-back, flanks), finishing efficiency.
- **Defense & Rest-Defense (2:50–3:25):** Box defense, second balls, pressure recovery, cross defense.
- **Formations & Key Matchups (3:25–4:10):** Expected formations, distances between lines, 1v1 matchups, fullback-winger synergy.
- **GK & Set-piece Edge (4:10–4:30):** Goalkeeper stability (save trends), set-piece net expectations.
- **Market View (4:30–5:05):** Favorite/handicap/over-under trends + market psychology.
- **Game Scripts A/B (5:05–5:30):** Two scenarios + signals for counter-betting/switches.
- **Final Analysis & Closing (5:30–6:00):** Q's brief final takeaway, then use mandatory closing lines.

**Data Mapping & Triggers:**
- **Power Analysis (Rank, Record, Goals):** Use in Sections 2, 5, 6.
- **Last 5 Games:** Use in Section 2, 4 (scoring trends).
- **Recent News (2 weeks):** Use in Context section for transfers, injuries, tactical changes, team atmosphere.
- **Head-to-Head:** Use in Section 3.
- **Detailed Scoring (Open Play, Set-Piece, etc.):** Use in Sections 5, 8.
- **Off/Def Stats (Shots, Conversion, etc.):** Use in Sections 5, 6.
- **Formation/Lineup:** Use in Section 7 (line height, half-space usage).
- **Goalkeeper stats:** Use in Section 8.
- **Preview Text:** Use across all sections, especially 10 (scenarios).
- **Odds/Handicap:** Use in Section 9.
- **Analytical Triggers:** High open-play ratio suggests possession style. Low possession + high conversion suggests counter-attacking style. Frequent fullback overlaps mean checking rest-defense.

---

### BASEBALL ANALYSIS FRAMEWORK (Apply if data is about Baseball)

**Objective:** Create a 360-second baseball podcast script analyzing pitching matchups, hitting trends, and game conditions.

**Timeline (Total 360s):**
- **Opening (0:00–0:15):** Use the mandatory opening lines.
- **Hook & Mission (0:15–0:35):** Today's key matchup focus (e.g., "선발 에이스 대결" or "타선 폭발력 vs 철벽 수비").
- **Context & Recent News (0:35–1:10):** Team standings, recent form, **최근 2주 내 핵심 뉴스** (부상, 트레이드, 컨디션, 감독 코멘트).
- **Pitching Matchup (1:10–1:50):** Starting pitchers' season ERA, WHIP, recent 3-game stats, vs opponent history.
- **Batting Analysis (1:50–2:30):** Team batting avg, OBP, SLG, RISP (주자득점권), recent hot/cold batters.
- **Bullpen & Late Innings (2:30–3:05):** Bullpen ERA, save percentage, setup man stability, closer availability.
- **Power & Speed Game (3:05–3:40):** Home run trends, stolen base success rate, park factor impact.
- **H2H & Key Matchups (3:40–4:15):** Batter vs pitcher career stats, lefty/righty splits, clutch situations.
- **Weather & Conditions (4:15–4:35):** Wind direction/speed, temperature, humidity impact on ball flight.
- **Market Analysis (4:35–5:05):** Run line, total runs O/U, 5-inning line, prop bets insights.
- **Game Scripts A/B (5:05–5:30):** Early lead scenario vs late rally scenario, key turning points.
- **Final Analysis & Closing (5:30–6:00):** Q's brief final takeaway, then use mandatory closing lines.

**Data Mapping:**
- **Team Stats:** Use in Context, Batting, Power sections.
- **Pitcher Stats (ERA, WHIP, K/BB):** Use in Pitching Matchup.
- **Recent Games:** Use in Context, Batting (hot/cold streaks).
- **H2H Records:** Use in H2H section.
- **Weather Data:** Use in Conditions section.
- **Bullpen Stats:** Use in Late Innings section.
- **Recent News (2 weeks):** Use in Context section for injury updates, roster changes, momentum shifts.

---

### VOLLEYBALL ANALYSIS FRAMEWORK (Apply if data is about Volleyball)

**Objective:** Create a 360-second volleyball podcast script from provided data.

**Timeline (Total 360s):**
- **Opening (0:00–0:15):** Use the mandatory opening lines.
- **Hook & Mission (0:15–0:35):** One-line keyword for the match (e.g., "Serve pressure vs. reception stability").
- **Context & Recent News (0:35–1:00):** Summarize rankings, points, season record, recent form, **최근 2주 내 핵심 뉴스** (선수 컨디션, 부상, 전술 변화, 팀 케미스트리).
- **H2H & Venue Edge (1:00–1:30):** Head-to-head trends (set scores, blocking/serve patterns), home court advantage.
- **Set Rhythm Map (1:30–2:05):** Set-by-set volatility (start of set, 20-point mark, deuce), length of point runs.
- **Serve–Receive Axis (2:05–2:40):** Serve pressure (Aces/Errors) vs. reception efficiency, side-out percentage (SO%), breakpoint conversion rate (BP%).
- **Attack & Block Profile (2:40–3:15):** Attack success rate (overall/middle/pipe/etc.), blocks per set, second ball situations.
- **Setter & Rotation Keys (3:15–3:55):** Setter's distribution/tempo, rotational weaknesses, substitutions.
- **Momentum & Timeout Tells (3:55–4:25):** Post-timeout scoring trends, signals of serve runs or reception collapse.
- **Market View (4:25–4:55):** Set handicap (-1.5), total points O/U, live betting entry points (e.g., around the 8-point mark in set 2).
- **Game Scripts A/B (4:55–5:25):** A) Scenario if serve pressure works / B) Scenario if reception stabilizes + switching signals.
- **Final Analysis & Closing (5:25–6:00):** Q's brief final takeaway, then use mandatory closing lines.

**Data Mapping:**
- **Power Analysis (Rank, Record, Points, Serve, Block, etc.):** Use in Sections 2, 5, 6.
- **Recent News (2 weeks):** Use in Context section for player conditions, injuries, tactical shifts, team chemistry.
- **Head-to-Head (Record, Set Score, Handicap):** Use in Sections 3, 9.
- **Set Performance (Attack, Receive, Errors by set):** Use in Sections 4 (volatility), 5 (SO%/BP%), and 8 (momentum).
- **Player Stats (Setter distribution, Key attacker efficiency):** Use in Section 7.
- **Preview Text:** Use across all sections, especially for game scripts in 10.
- **Odds/Handicap:** Use in Section 9.
`;