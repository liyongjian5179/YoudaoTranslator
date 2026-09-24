declare var tjs: any;

const currentVersion = '3.4.1';
const latestReleaseUrl = 'https://github.com/liyongjian5179/YoudaoTranslator/releases/latest';
const cacheFile = 'update-cache.json';

interface UpdateCache {
  version: string;
  url: string;
}

const cachePath = (): string | undefined => {
  const dir = tjs.env?.alfred_workflow_cache;
  return dir ? `${dir}/${cacheFile}` : undefined;
};

const readCache = async (): Promise<UpdateCache | undefined> => {
  const path = cachePath();
  if (!path) return undefined;

  try {
    const file = await tjs.open(path, 'r');
    try {
      const bytes = new Uint8Array((await file.stat()).size);
      await file.read(bytes);
      const value = JSON.parse(new TextDecoder('utf-8').decode(bytes));
      if (typeof value.version === 'string' && typeof value.url === 'string') return value;
    } finally {
      await file.close();
    }
  } catch (_) {
    return undefined;
  }
};

const writeCache = async (value: UpdateCache): Promise<void> => {
  const path = cachePath();
  if (!path) return;

  try {
    await tjs.makeDir(tjs.env.alfred_workflow_cache);
  } catch (_) {
    // Alfred normally creates the cache directory before launching the workflow.
  }

  const temporary = `${path}.${tjs.pid}`;
  const file = await tjs.open(temporary, 'w');
  try {
    await file.write(new TextEncoder().encode(JSON.stringify(value)));
  } finally {
    await file.close();
  }
  await tjs.rename(temporary, path);
};

const compareVersions = (left: string, right: string): number => {
  const parts = (version: string): number[] => version.replace(/^v/, '').split('.').map(Number);
  const a = parts(left);
  const b = parts(right);
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0;
};

const checkLatest = async (): Promise<UpdateCache> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(latestReleaseUrl, { signal: controller.signal });
    const match = response.url.match(/\/releases\/tag\/(v\d+\.\d+\.\d+)\/?$/);
    if (!response.ok || !match) throw new Error('GitHub Release unavailable');

    const value = { version: match[1], url: response.url };
    await writeCache(value);
    return value;
  } finally {
    clearTimeout(timeout);
  }
};

export const checkInBackground = async (): Promise<void> => {
  try {
    await checkLatest();
  } catch (_) {
    // The launcher retries after an hour; translation remains unaffected.
  }
};

export const updateOutput = async (): Promise<string> => {
  try {
    const latest = await checkLatest();
    if (compareVersions(latest.version, currentVersion) > 0) {
      return JSON.stringify({ items: [{
        title: `发现新版本 ${latest.version}`,
        subtitle: '回车打开 GitHub Release 下载 Workflow',
        arg: latest.url,
        icon: { path: 'assets/translate.png' },
      }] });
    }
    return JSON.stringify({ items: [{
      title: `当前版本 ${currentVersion} 已是最新版本`,
      subtitle: `GitHub 最新 Release：${latest.version}`,
      valid: false,
      icon: { path: 'assets/translate.png' },
    }] });
  } catch (_) {
    return JSON.stringify({ items: [{
      title: '检查更新失败',
      subtitle: '无法连接 GitHub，请稍后重试',
      valid: false,
      icon: { path: 'assets/translate.png' },
    }] });
  }
};

export const addUpdateNotice = async (result: string): Promise<string> => {
  const latest = await readCache();
  if (!latest || compareVersions(latest.version, currentVersion) <= 0) return result;

  const output = JSON.parse(result);
  output.items.push({
    title: `发现新版本 ${latest.version}`,
    subtitle: '输入 ydupdate 查看更新',
    valid: false,
    icon: { path: 'assets/translate.png' },
  });
  return JSON.stringify(output);
};
