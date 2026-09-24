import { Adapter } from "./adapters/adapter";
import Adapters from "./adapters";
import redaxios from './libs/redaxios'
import Workflow from './workflow/workflow'

interface ITranslator {
  adapter: Adapter;
  translate: (word: string) => Promise<any>;
}

class Translator implements ITranslator{

  adapter: Adapter;

  constructor(key: string, secret: string, platform: string) {
    this.adapter = new Adapters[platform](key, secret);
  }

  public async translate(query: string): Promise<any> {
    // camel case to space case
    const word = query.replace(/([A-Z])/g, ' $1').toLowerCase();
    // url
    const url = this.adapter.url(word);
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
