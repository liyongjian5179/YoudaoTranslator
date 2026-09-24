declare var tjs: any;

import { TargetLanguage } from './adapters/adapter';

interface HistoryEntry {
  query: string;
  result: string;
  target?: TargetLanguage;
  createdAt: number;
}

const maxEntries = 20;
const fileName = 'history.json';

const dataDir = (): string | undefined => tjs.env?.alfred_workflow_data;

const filePath = (): string | undefined => {
  const dir = dataDir();
  return dir ? `${dir}/${fileName}` : undefined;
};

const readText = async (path: string): Promise<string> => {
  const file = await tjs.open(path, 'r');
  try {
    const size = (await file.stat()).size;
    const bytes = new Uint8Array(size);
    await file.read(bytes);
    return new TextDecoder('utf-8').decode(bytes);
  } finally {
    await file.close();
  }
};

const writeText = async (path: string, value: string): Promise<void> => {
  const file = await tjs.open(path, 'w');
  try {
    await file.write(new TextEncoder().encode(value));
  } finally {
    await file.close();
  }
};

const load = async (): Promise<HistoryEntry[]> => {
  const path = filePath();
  if (!path) return [];

  try {
    const value = JSON.parse(await readText(path));
    return Array.isArray(value) ? value : [];
  } catch (_) {
    return [];
  }
};

export const addHistory = async (query: string, result: string, target?: TargetLanguage): Promise<void> => {
  const path = filePath();
  if (!path || !result) return;

  try {
    await tjs.makeDir(dataDir());
  } catch (_) {
    // The directory normally exists when Alfred launches a workflow.
  }

  const entries = await load();
  const next = entries.filter(entry => !(entry.query === query && entry.target === target));
  next.unshift({ query, result, target, createdAt: Date.now() });
  await writeText(path, JSON.stringify(next.slice(0, maxEntries)));
};

export const historyOutput = async (): Promise<string> => {
  const entries = await load();
  if (!entries.length) {
    return JSON.stringify({ items: [{ title: '暂无翻译历史', subtitle: '完成一次翻译后，历史会显示在这里', valid: false, icon: { path: 'assets/translate.png' } }] });
  }

  return JSON.stringify({
    items: entries.map(entry => ({
      title: entry.result,
      subtitle: entry.query + (entry.target ? ` · /${entry.target}` : ''),
      arg: entry.result,
      valid: true,
      icon: { path: 'assets/translate.png' },
      text: { copy: entry.result },
    })),
  });
};
