export type QuizTemplateOption = {
  label: string;
  optionText: string;
  isCorrect: boolean;
};

export type QuizTemplateQuestion = {
  order: number;
  questionType: 'single_choice' | 'multiple_choice';
  questionText: string;
  explanation: string;
  options: QuizTemplateOption[];
};

export const defaultQuizTemplate: QuizTemplateQuestion[] = [
  {
    order: 1,
    questionType: 'single_choice',
    questionText: '次の中で、フィッシングメールの特徴として正しいものはどれですか？',
    explanation: 'フィッシング詐欺は偽のページに誘導して認証情報を盗み取ります。',
    options: [
      { label: 'A', optionText: '正規のログインページへ誘導する', isCorrect: false },
      { label: 'B', optionText: '偽のログインフォームに誘導して情報を盗む', isCorrect: true },
      { label: 'C', optionText: '必ず社内アドレスから送られる', isCorrect: false },
    ],
  },
  {
    order: 2,
    questionType: 'multiple_choice',
    questionText: 'フィッシングメール対策として有効なものをすべて選んでください。',
    explanation: '送信者確認や公式サイトからのアクセスが有効です。',
    options: [
      { label: 'A', optionText: '送信者アドレスを確認する', isCorrect: true },
      { label: 'B', optionText: 'リンクを直接クリックせず公式サイトにアクセスする', isCorrect: true },
      { label: 'C', optionText: '不審な添付ファイルを開く', isCorrect: false },
      { label: 'D', optionText: '二要素認証を有効にする', isCorrect: true },
    ],
  },
];
