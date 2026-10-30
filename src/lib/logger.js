const { isProd } = require('../config/env');
const stamp = () => new Date().toISOString();
module.exports = (scope = '') => ({
  info: (m, x) => console.log(`${stamp()} [INFO]${scope ? ` [${scope}]` : ''} ${m}`, x ?? ''),
  warn: (m, x) => console.warn(`${stamp()} [WARN]${scope ? ` [${scope}]` : ''} ${m}`, x ?? ''),
  error: (m, x) => console.error(`${stamp()} [ERROR]${scope ? ` [${scope}]` : ''} ${m}`, x ?? ''),
  debug: (m, x) => { if (!isProd) console.log(`${stamp()} [DEBUG]${scope ? ` [${scope}]` : ''} ${m}`, x ?? ''); },
});
