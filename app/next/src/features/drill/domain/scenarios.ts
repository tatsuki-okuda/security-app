export type Scenario = {
  value: string;
  label: string;
};

export const scenarios: Scenario[] = [
  { value: 'password_reset', label: 'パスワード再設定' },
  { value: 'invoice', label: '請求・見積' },
  { value: 'account_alert', label: 'アカウント警告' },
  { value: 'internal_tool', label: '社内ツール通知' },
];
