
# YoudaoTranslate | 有道翻译

![screenshot_1](screenshots/screenshot_1.png)

## ⚠️ V3 更新说明
该版本使用 TS 重构，自带运行环境，不再依赖 PHP。同时支持多个平台的 API。

macOS Monterey 请使用 V3 版本！

标记为施工中 (🚧) 特性 V3 尚未支持，如果需要使用，请切换到 V2 使用。

## 此 Fork 的改进

- 内置同时支持 Apple Silicon (`arm64`) 和 Intel (`x86_64`) 的 macOS 运行时，无需 Rosetta。
- 修复翻译 API 返回中文时的乱码问题。
- 补齐 Alfred Workflow 配置和打包脚本，提供可直接导入的 `.alfredworkflow` 文件。

## 特性
- 🌟 [**无系统环境依赖**]() - 自带 [txiki](https://github.com/saghul/txiki.js) 运行环境，不再需要 PHP
- 🌟 [**多平台支持**]() - 支持百度的翻译API
- 🌐 [**中英文自动互翻**]() - 支持 `CamelCase` 驼峰短语翻译，长句自动换行
- 🎭 [**多语言支持**](screenshots/multi.jpg) - 可以识别中文、英文、日文、韩文、法文、俄文等
- 🎹 [**快捷键支持**]() - 双击 `⌥ Alt`  直接翻译选中内容
- 📢 [**英文发音**](screenshots/screenshot_3.png) - `⌘ Command` + `↩︎ Enter` 本地发音，`⌥ Alt` + `↩︎ Enter`  调用有道在线语音发音
- 🚧 [**有道翻译生词本**](screenshots/word-book.jpg) - 可以将陌生单词加入有道生词本
- 📃 [**回车复制**]() - 在选项上 `↩︎ Enter` 回车复制翻译结果
- 🚧 [**查询历史**](screenshots/translate_history.gif) -  `yd *` 查询最近的翻译记录
- 🔮 [**网页预览**](screenshots/screenshot_4.gif) - 翻译结果上按 `⇧ Shift` 直接预览有道网页
- 🚧 [**自动更新**](screenshots/update.png) - 输入 `update` 检查更新 Workflow

## 🚀 开始使用

### 1. 下载并安装

下载 [YoudaoTranslator.alfredworkflow](https://github.com/liyongjian5179/YoudaoTranslator/releases/download/v3.1.1/YoudaoTranslator.alfredworkflow)，双击导入 Alfred。内置运行时支持 Apple Silicon 和 Intel Mac。

也可以从源码构建：

```bash
npx -y pnpm@7.33.7 install --frozen-lockfile
npm run package
```

### 2. 配置 Workflow

在 Alfred 的 Workflow Variables 中填写 `key`（应用 ID）、`secret`（应用密钥）和 `platform`（`Youdao` 或 `Baidu`），然后输入 `yd` 加空格和要翻译的内容。

原项目的配置说明见 [Wiki](https://github.com/wensonsmith/YoudaoTranslator/wiki)。

## Contributors

<a href="https://iwenson.com" target="_blank"><img src="https://avatars1.githubusercontent.com/u/2544185?s=120&v=4" height="60"/></a> 
<a href="https://blog.zthxxx.me" target="_blank"><img src="https://avatars0.githubusercontent.com/u/15135943?s=120&v=4" height="60"/></a> 
<a href="https://www.zzaning.com/#/" target="_blank"><img src="https://avatars2.githubusercontent.com/u/12035097?s=88&u=7e419cd2eb7b9fec5ba061d8135c4875a4c32323&v=4" height="60"/></a> 
<a href="https://github.com/liyongjian5179" target="_blank"><img src="https://github.com/liyongjian5179.png" alt="liyongjian5179" height="60"/></a>

## 使用库和参考资料

- https://github.com/joetannenbaum/alfred-workflow
- https://www.alfredapp.com/help/workflows/inputs/script-filter/json/
- https://www.alfredapp.com/help/workflows/
