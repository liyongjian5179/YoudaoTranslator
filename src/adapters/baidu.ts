import { Adapter, Result, TargetLanguage } from "./adapter";
import md5 from "../libs/md5";
import { TranslationError } from "../errors";

const languageCodes: Record<TargetLanguage, string> = {
  zh: 'zh', en: 'en', ja: 'jp', ko: 'kor',
  fr: 'fra', ru: 'ru', de: 'de', es: 'spa',
};

class Baidu implements Adapter {
  key: string;

  secret: string;

  word: string = "";

  isChinese: boolean = false;

  results: Result[] = [];

  phonetic: string = "";

  constructor(key: string, secret: string) {
    this.key = key;
    this.secret = secret;
  }

  url(word: string, target?: TargetLanguage): string {
    this.isChinese = this.detectChinese(word);
    this.word = word;

    const from = this.isChinese ? "zh" : "auto";
    const to = target ? languageCodes[target] : (this.isChinese ? "en" : "zh");
    const salt = Math.floor(Math.random() * 10000).toString();
    const sign = md5(`${this.key}${word}${salt}${this.secret}`);

    const params = new URLSearchParams({
      q: word,
      from,
      to,
      appid: this.key,
      salt,
      sign,
      dict: '1',
      action: '1',
    });

    return "https://fanyi-api.baidu.com/api/trans/vip/translate?" + params.toString();
  }

  parse(data: any): Result[] {
    if (data.error_code) {
      return this.parseError(data.error_code);
    }

    const { trans_result:result } = data;
    result.forEach(item => {
      const pronounce = this.isChinese ? item.dst : this.word;
      this.addResult(item.dst, item.src, pronounce, pronounce);
    });

    return this.results;
  }

  private parseError(code: number | string): never {
    const messages = {
      54000: "缺少必填的参数",
      58001: "不支持的语言类型",
      54005: "翻译文本过长",
      52003: "应用ID无效",
      58002: "无相关服务的有效实例",
      90107: "开发者账号无效",
      54001: "签名检验失败,检查 KEY 和 SECRET",
      54004: "账户已经欠费",
      54003: "访问频率受限",
    };

    const message = messages[code] || "请参考错误码：" + code;

    throw new TranslationError(message);
  }

  private addResult( title: string, subtitle: string, arg: string = "", pronounce: string = ""): Result[] {
    const quicklookurl = "https://fanyi.baidu.com/#auto/auto/" + this.word;

    const maxLength = this.detectChinese(title) ? 27 : 60;
    
    if (title.length > maxLength) {
      const copy = title;
      title = copy.slice(0, maxLength);
      subtitle = copy.slice(maxLength);
    }

    this.results.push({ title, subtitle, arg, pronounce, quicklookurl });
    return this.results;
  }

  private detectChinese(word: string): boolean {
    return /^[\u4e00-\u9fa5]+$/.test(word);
  }
}

export default Baidu;
