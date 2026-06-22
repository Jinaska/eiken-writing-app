/* ============================================================
   英検ライティング 問題データ
   - 級ごとに問題を定義
   - id は採点キャッシュ等に使う一意のキー
   - words は目安の語数（採点プロンプトで使用）
   - type: "opinion" 意見論述 / "qa" 質問応答（3級など）
   ============================================================ */

// usePoints: 「POINTSの中から選んで使う数」。0ならPOINTSは参考(任意)扱い。
// reasons:   求められる理由の数（reasonベースの級で使用）。
// instructions: 実際の試験に倣った指示文。1級・準1級は英語、2級以下は日本語。
const LEVELS = [
  {
    id: "grade-1", label: "1級", words: "200〜240語", type: "opinion",
    usePoints: 0, reasons: 3,
    instructions: [
      "Write an essay on the given TOPIC.",
      "Give THREE reasons to support your answer.",
      "Structure: introduction, main body, and conclusion",
      "Suggested length: 200–240 words",
    ],
  },
  {
    id: "grade-pre-1", label: "準1級", words: "120〜150語", type: "opinion",
    usePoints: 2, reasons: 0,
    instructions: [
      "Write an essay on the given TOPIC.",
      "Use TWO of the POINTS below to support your answer.",
      "Structure: introduction, main body, and conclusion",
      "Suggested length: 120–150 words",
    ],
  },
  {
    id: "grade-2", label: "2級", words: "80〜100語", type: "opinion",
    usePoints: 0, reasons: 2,
    instructions: [
      "以下のTOPICについて、あなたの意見とその理由を2つ書きなさい。",
      "POINTSは理由を書く際の参考となる観点を示したものです。ただし、これら以外の観点から理由を書いてもかまいません。",
      "語数の目安は80語〜100語です。",
      "解答がTOPICに示された問いの答えになっていない場合や、TOPICからずれていると判断された場合は、0点と採点されることがあります。TOPICの内容をよく読んでから答えてください。",
    ],
  },
  {
    id: "grade-p2plus", label: "準2級プラス", words: "50〜60語", type: "opinion",
    usePoints: 0, reasons: 2,
    instructions: [
      "あなたは、外国人の知り合いから以下のQUESTIONをされました。",
      "QUESTIONについて、あなたの意見とその理由を2つ英文で書きなさい。",
      "語数の目安は50語〜60語です。",
      "解答がQUESTIONに対応していないと判断された場合は、0点と採点されることがあります。QUESTIONをよく読んでから答えてください。",
    ],
  },
  {
    id: "grade-pre-2", label: "準2級", words: "50〜60語", type: "opinion",
    usePoints: 0, reasons: 2,
    instructions: [
      "あなたは、外国人の知り合いから以下のQUESTIONをされました。",
      "QUESTIONについて、あなたの意見とその理由を2つ英文で書きなさい。",
      "語数の目安は50語〜60語です。",
      "解答がQUESTIONに対応していないと判断された場合は、0点と採点されることがあります。QUESTIONをよく読んでから答えてください。",
    ],
  },
  {
    id: "grade-3", label: "3級", words: "25〜35語", type: "qa",
    usePoints: 0, reasons: 2,
    instructions: [
      "QUESTIONについて、あなたの考えとその理由を2つ書きなさい。",
      "語数の目安は25語〜35語です。",
    ],
  },
];

const QUESTIONS = {
  // 1級はPOINTSの提示なし（TOPICのみ。理由は自分で3つ考える）
  "grade-1": [
    { id: "g1-1", topic: "Should free access to clean water be a fundamental human right?", points: [] },
    { id: "g1-2", topic: "Should developed nations accept more immigrants to address labor shortages?", points: [] },
    { id: "g1-3", topic: "Is space exploration a worthwhile use of public funds?", points: [] },
    { id: "g1-4", topic: "Should governments do more to regulate the development of artificial intelligence?", points: [] },
    { id: "g1-5", topic: "Should nuclear power be part of the world's energy future?", points: [] },
    { id: "g1-6", topic: "Is globalization beneficial to developing countries?", points: [] },
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
    { id: "g2-7", topic: "In some Japanese university programs, students must study abroad for one year. Do you think the number of such programs will increase in the future?",
      points: ["Cost", "Work", "Communication"] },
  ],
  // 準2級プラス（POINTSなし・意見＋理由2つ・50〜60語）。やや社会的な話題。
  "grade-p2plus": [
    { id: "ppp-1", topic: "Do you think translation apps can help people communicate with visitors from other countries?", points: [] },
    { id: "ppp-2", topic: "Do you think it is a good idea for high school students to use AI when they study?", points: [] },
    { id: "ppp-3", topic: "Do you think more people will shop online in the future?", points: [] },
    { id: "ppp-4", topic: "Do you think schools should teach students how to manage money?", points: [] },
    { id: "ppp-5", topic: "Do you think it is better to live in a city than in the countryside?", points: [] },
    { id: "ppp-6", topic: "Do you think people should use public transportation more often?", points: [] },
  ],
  // 準2級（POINTSなし・意見＋理由2つ・50〜60語）。身近な話題。
  "grade-pre-2": [
    { id: "pp2-1", topic: "Do you think robots that can do housework are good for families?", points: [] },
    { id: "pp2-2", topic: "Do you think students should join a club at school?", points: [] },
    { id: "pp2-3", topic: "Do you think it is good to have a pet?", points: [] },
    { id: "pp2-4", topic: "Do you think it is important to eat breakfast every day?", points: [] },
    { id: "pp2-5", topic: "Do you think students should wear school uniforms?", points: [] },
    { id: "pp2-6", topic: "Do you think it is good to study during summer vacation?", points: [] },
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

// ============================================================
//  英文要約（English Summary）データ ※準1級のみ
//  - passage: 要約する本文
//  - officialModel があれば公式の解答例として表示（無ければAI生成）
// ============================================================
const SUMMARY_META = {
  "grade-pre-1": {
    words: "60〜70語",
    instructions: [
      "Read the article below and summarize it in your own words as far as possible in English.",
      "Summarize it between 60 and 70 words.",
      "Write your summary in the space provided.",
    ],
  },
};

const SUMMARIES = {
  "grade-pre-1": [
    {
      id: "sum-p1-1",
      title: "Water Fluoridation（2026年度第1回 過去問）",
      passage:
        "Fluoride is a naturally occurring mineral found in water and soil. In the early twentieth century, researchers observed that people in certain regions had fewer dental problems after drinking water containing fluoride. Based on these findings, governments in several countries introduced water fluoridation as a public health policy, and it is now practiced in many urban areas.\n\nSupporters believe that adding fluoride to water improves dental health in practical ways. In communities where dental clinics are limited, residents may only visit a dentist once every few years due to cost or travel distance. By including fluoride in tap water, protection is provided daily without requiring clinic visits. In addition, fluoride reaches children at school, office workers, and elderly people at home equally, regardless of income or personal routines.\n\nHowever, critics express concerns about possible negative effects. One issue is that individuals consume different amounts of water depending on factors such as age, physical activity, or climate. For example, people working outdoors may drink much more water than others. This makes it difficult to control individual intake. Another concern is that some people may rely too much on fluoridated water and reduce personal dental care, which can result in undetected problems.",
      officialModel:
        "Fluoride has long been added to public water supplies as a health policy to improve dental health. It benefits people with limited access to dental care by reaching them through the water supply without requiring individual effort. However, safe intake levels are difficult to control because water consumption varies among individuals, and relying too much on fluoridated water may reduce personal dental care and lead to oral problems.",
    },
    {
      id: "sum-p1-2",
      title: "Remote Work（練習用）",
      passage:
        "Remote work, in which employees do their jobs from home or other locations outside a central office, has become far more common in recent years. Improvements in internet technology and video communication tools have made it possible for many tasks to be completed without being physically present in an office.\n\nSupporters argue that remote work brings clear benefits. Employees save the time and money that they would otherwise spend commuting, and they can use these hours for rest or family. Companies, too, can reduce the cost of office space and hire talented workers regardless of where they live. Many workers report that they feel more focused when they can design their own working environment.\n\nOn the other hand, some experts point out problems. When team members rarely meet in person, communication can become slower, and new employees may find it harder to learn from experienced colleagues. In addition, the line between work and private life can blur, leading some people to work longer hours than before. Managers may also struggle to evaluate performance fairly when they cannot directly observe how their staff work.",
    },
    {
      id: "sum-p1-3",
      title: "Electric Vehicles（練習用）",
      passage:
        "Electric vehicles, which run on electricity stored in batteries rather than on gasoline, have attracted growing attention as countries try to reduce air pollution. Many governments now encourage their use through tax reductions and the construction of charging stations.\n\nSupporters believe that electric vehicles offer important advantages. Because they produce no exhaust gases while driving, they can improve air quality in crowded cities. They are also generally cheaper to run, since electricity often costs less than gasoline and the motors require less maintenance. As more drivers switch, dependence on imported oil may also decrease.\n\nHowever, critics raise several concerns. Producing the batteries requires rare metals, and mining these materials can damage the environment. The electricity used to charge the cars may also come from power plants that burn coal or gas, which reduces the overall benefit. Furthermore, in many areas there are still too few charging stations, and fully charging a battery takes much longer than filling a tank with fuel, which can be inconvenient on long trips.",
    },
  ],
};

// 級idからメタ情報を引く
function getLevel(id) {
  return LEVELS.find((l) => l.id === id) || LEVELS[1];
}
