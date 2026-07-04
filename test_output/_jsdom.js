/* jsdom の解決ヘルパー: プロジェクトの node_modules（npm i で導入）を優先し、
 * 無ければ旧来の %TEMP%\mahjong-test\node_modules にフォールバックする */
const path = require('path');
let jsdom;
try {
  jsdom = require('jsdom');
} catch {
  jsdom = require(path.join(process.env.TEMP, 'mahjong-test', 'node_modules', 'jsdom'));
}
module.exports = jsdom;
