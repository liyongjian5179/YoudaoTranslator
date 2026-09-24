declare var tjs

import Translator from './translator';
import { TranslationError } from './errors';
import { TargetLanguage, targetLanguages } from './adapters/adapter';

const getEnv = (name: string): string | undefined => {
  // txiki before v24 exposed getenv(); newer releases expose tjs.env.
  if (typeof tjs.getenv === 'function') {
    return tjs.getenv(name);
  }

  return tjs.env?.[name];
};

const errorOutput = (message: string): string => JSON.stringify({
  items: [{ title: '翻译失败', subtitle: message, valid: false, icon: { path: 'assets/translate.png' } }],
});

const errorMessage = (error: any): string => {
  if (error instanceof TranslationError) return error.message;
  if (typeof error?.status === 'number') return `翻译服务返回 HTTP ${error.status}`;
  if (error instanceof SyntaxError) return '翻译服务返回的数据格式有误';
  return '请求失败，请检查网络连接后重试';
};

const main = async (): Promise<string> => {
  let word = String(Array.from(tjs.args).pop() ?? '').trim();
  if (!word) return errorOutput('请输入要翻译的内容');

  let target: TargetLanguage | undefined;
  const prefix = word.match(/^\/(\S+)(?:\s+|$)/);
  if (prefix) {
    const language = prefix[1].toLowerCase();
    if (!targetLanguages.includes(language as TargetLanguage)) {
      return errorOutput(`不支持 /${language}，可用语言：${targetLanguages.join(', ')}`);
    }
    target = language as TargetLanguage;
    word = word.slice(prefix[0].length).trim();
    if (!word) return errorOutput('请输入要翻译的内容');
  }

  const key = getEnv('key')?.trim();
  const secret = getEnv('secret')?.trim();
  const platform = getEnv('platform')?.trim();

  if (!key || !secret) return errorOutput('请在 Workflow Variables 中填写 key 和 secret');
  if (platform !== 'Youdao' && platform !== 'Baidu') {
    return errorOutput('platform 需设置为 Youdao 或 Baidu');
  }

  return new Translator(key, secret, platform).translate(word, target);
};

main().then(
  result => console.log(result),
  error => console.log(errorOutput(errorMessage(error))),
);
