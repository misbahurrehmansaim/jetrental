'use strict';
/** Video used in the home hero. Free-licence footage from Pexels (no attribution required). */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '../../..');

const remote = {
  hd: 'https://videos.pexels.com/video-files/16127328/16127328-hd_1280_720_30fps.mp4', // about 3.3 MB
  sd: 'https://videos.pexels.com/video-files/16127328/16127328-sd_960_540_30fps.mp4', // about 2.2 MB
};
const hasLocal = fs.existsSync(path.join(ROOT, 'assets/video/hero-720.mp4'));

module.exports = {
  heroVideo: hasLocal
    ? { hd: '~/assets/video/hero-720.mp4', sd: '~/assets/video/hero-540.mp4' }
    : remote,
  remoteHeroVideo: remote,
};
