export const targetLanguages = ['zh', 'en', 'ja', 'ko', 'fr', 'ru', 'de', 'es'] as const;
export type TargetLanguage = typeof targetLanguages[number];

export interface Result {
  title: string;
  subtitle: string;
  arg: string;
  pronounce: string;
  quicklookurl?: string;
}

export interface Adapter {
  key: string;

  secret: string;

  word: string;

  isChinese: boolean;

  url: (word: string, target?: TargetLanguage) => string;

  parse: (response: any) => Result[]
}
