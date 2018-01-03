if (typeof process === 'object' && !process.browser) {
  module.exports = require('./lib/src/index');
} else {
  module.exports = require('./build/js/bundle-web');
}
