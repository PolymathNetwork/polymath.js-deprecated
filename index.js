if (typeof process === 'object' && !process.browser) {
  module.exports = require('./build/js/bundle-node');
} else {
  module.exports = require('./build/js/bundle-web');
}
