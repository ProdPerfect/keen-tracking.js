import md5 from './utils/md5';

const projectIdThrottleBlacklist = {
  // 'PROJECT_ID': THROTTLE_RATE (0.00 - 1.00)
  xijiKKCqPQzOl0EKa9ta0vmD: 0.10,
  G6kGCgdy9JzppocYlPmUGpXU: 0.02,
};

export default class Sampler {
  constructor(Keen) {
    this.config = Keen.config;
    this.projectIdThrottleBlacklist = projectIdThrottleBlacklist;
  }

  shouldSample(uniqueId) {
    if (!this.canBeThrottled()) {
      return true;
    }

    const id = uniqueId;
    const hash = md5(id);
    const desiredSampleRate = this.desiredSampleRateForProjectId();
    const lastEightAsInt = parseInt(hash.substr(hash.length - 8), 16);
    const divisor = 0xffffffff;

    const isBelowThreshold = (lastEightAsInt / divisor) < desiredSampleRate;

    return isBelowThreshold;
  }

  desiredSampleRateForProjectId() {
    const throttleRate = this.projectIdThrottleBlacklist[this.config.projectId];

    return throttleRate === undefined ? 1 : throttleRate;
  }

  canBeThrottled() {
    const desiredThrottleValue = this.projectIdThrottleBlacklist[this.config.projectId];
    const isProjectInBlacklist = (desiredThrottleValue !== undefined);
    const isTestEnvironment = document.cookie.indexOf('prodperfect_test') !== -1;

    return !isTestEnvironment && isProjectInBlacklist;
  }
}
