declare var tjs

import Translator from './translator';

const getEnv = (name: string): string => {
  // txiki before v24 exposed getenv(); newer releases expose tjs.env.
  if (typeof tjs.getenv === 'function') {
    return tjs.getenv(name);
  }

  return tjs.env?.[name];
};

const main = async () => {
  const translator = new Translator(getEnv('key'), getEnv('secret'), getEnv('platform'));

  const word: string = Array.from(tjs.args).pop() as string;

  const result = await translator.translate(word);

  console.log(result);
}

main();
