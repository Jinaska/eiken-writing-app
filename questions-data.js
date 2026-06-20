/* ============================================================
   英検ライティング 問題データ
   - 級ごとに問題を定義
   - id は採点キャッシュ等に使う一意のキー
   - words は目安の語数（採点プロンプトで使用）
   - type: "opinion" 意見論述 / "qa" 質問応答（3級など）
   ============================================================ */

const LEVELS = [
  { id: "grade-1",     label: "1級",   words: "200〜240語", type: "opinion" },
  { id: "grade-pre-1", label: "準1級", words: "120〜150語", type: "opinion" },
  { id: "grade-2",     label: "2級",   words: "80〜100語",  type: "opinion" },
  { id: "grade-pre-2", label: "準2級", words: "50〜60語",   type: "opinion" },
  { id: "grade-3",     label: "3級",   words: "25〜35語",   type: "qa" },
];

const QUESTIONS = {
  "grade-1": [
    { id: "g1-1", topic: "Should developed nations accept more immigrants to address labor shortages?",
      points: ["Economy", "Culture", "Public services", "Social integration"] },
    { id: "g1-2", topic: "Is space exploration a worthwhile use of public funds?",
      points: ["Scientific progress", "National prestige", "Cost", "Earthly priorities"] },
    { id: "g1-3", topic: "Should governments do more to regulate the development of artificial intelligence?",
      points: ["Safety", "Innovation", "Employment", "Privacy"] },
    { id: "g1-4", topic: "Will renewable energy completely replace fossil fuels in the future?",
      points: ["Technology", "Cost", "Infrastructure", "Politics"] },
    { id: "g1-5", topic: "Should nuclear power be part of the world's energy future?",
      points: ["Climate change", "Safety", "Waste disposal", "Cost"] },
    { id: "g1-6", topic: "Is globalization beneficial to developing countries?",
      points: ["Economic growth", "Cultural identity", "Inequality", "Labor rights"] },
  ],
  "grade-pre-1": [
    { id: "p1-1", topic: "Should companies actively encourage employees to work remotely?",
      points: ["Productivity", "Work-life balance", "Urban congestion", "Mental health"] },
    { id: "p1-2", topic: "Should governments impose higher taxes on single-use plastics?",
      points: ["Environment", "Cost to consumers", "Business impact", "Waste reduction"] },
    { id: "p1-3", topic: "Should public transportation be made free in large cities?",
      points: ["Pollution", "Government spending", "Mobility", "Tourism"] },
    { id: "p1-4", topic: "Should schools replace traditional textbooks with digital devices?",
      points: ["Cost", "Student health", "Learning effectiveness", "Sustainability"] },
    { id: "p1-5", topic: "Should artificial intelligence take over most customer-service jobs?",
      points: ["Efficiency", "Employment", "Customer satisfaction", "Innovation"] },
    { id: "p1-6", topic: "Should employers adopt a four-day workweek?",
      points: ["Productivity", "Employee satisfaction", "Business costs", "Competitiveness"] },
  ],
  "grade-2": [
    { id: "g2-1", topic: "Do you think students should have a part-time job while in school?",
      points: ["Money", "Time", "Experience"] },
    { id: "g2-2", topic: "Do you think it is better to live in a city than in the countryside?",
      points: ["Convenience", "Nature", "Cost of living"] },
    { id: "g2-3", topic: "Do you think people should use cashless payment instead of cash?",
      points: ["Convenience", "Security", "Spending habits"] },
    { id: "g2-4", topic: "Do you think schools should give students more homework?",
      points: ["Study skills", "Free time", "Stress"] },
    { id: "g2-5", topic: "Do you think it is good for children to have their own smartphones?",
      points: ["Safety", "Communication", "Health"] },
    { id: "g2-6", topic: "Do you think more people will work from home in the future?",
      points: ["Technology", "Commuting", "Communication"] },
  ],
  "grade-pre-2": [
    { id: "pp2-1", topic: "Which do you like better, studying in the morning or at night?",
      points: ["Concentration", "Free time"] },
    { id: "pp2-2", topic: "Do you think it is good to play sports on weekends?",
      points: ["Health", "Friends"] },
    { id: "pp2-3", topic: "Which do you prefer, reading books or watching movies?",
      points: ["Imagination", "Time"] },
    { id: "pp2-4", topic: "Do you think students should wear school uniforms?",
      points: ["Cost", "Freedom"] },
    { id: "pp2-5", topic: "Which do you like better, traveling in Japan or abroad?",
      points: ["Language", "Culture"] },
    { id: "pp2-6", topic: "Do you think it is important to eat breakfast every day?",
      points: ["Energy", "Health"] },
  ],
  "grade-3": [
    { id: "g3-1", topic: "Which season do you like the best?", points: [] },
    { id: "g3-2", topic: "What is your favorite subject at school?", points: [] },
    { id: "g3-3", topic: "Do you like to cook?", points: [] },
    { id: "g3-4", topic: "Where do you want to go on your next holiday?", points: [] },
    { id: "g3-5", topic: "What do you usually do on weekends?", points: [] },
    { id: "g3-6", topic: "Do you enjoy studying English?", points: [] },
  ],
};

// 級idからメタ情報を引く
function getLevel(id) {
  return LEVELS.find((l) => l.id === id) || LEVELS[1];
}
