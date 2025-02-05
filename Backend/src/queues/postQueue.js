const Bull = require('bull');
const { redis } = require('../config/bullConfig');

const postQueue = new Bull('postQueue', {
  redis,
});

module.exports = postQueue;