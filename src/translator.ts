import { Adapter, TargetLanguage } from "./adapters/adapter";
import Adapters from "./adapters";
import redaxios from './libs/redaxios'
import Workflow from './workflow/workflow'

interface ITranslator {
  adapter: Adapter;
  translate: (word: string, target?: TargetLanguage) => Promise<string>;
}

class Translator implements ITranslator{

  adapter: Adapter;

  constructor(key: string, secret: string, platform: 'Youdao' | 'Baidu') {
    this.adapter = new Adapters[platform](key, secret);
  }

  public async translate(query: string, target?: TargetLanguage): Promise<string> {
    const word = query.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase();
    // url
    const url = this.adapter.url(word, target);
    // fetch
    // txiki's response.text() misdecodes UTF-8, so decode the bytes explicitly.
    const response = await redaxios.create().get(url, { responseType: 'arrayBuffer' });
    // parse
    const data = JSON.parse(new TextDecoder('utf-8').decode(response.data));
    const result = this.adapter.parse(data);
    // compose
    return new Workflow().compose(result).output();
  }
}

export default Translator;
