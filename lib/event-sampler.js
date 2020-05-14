const projectIdThrottleBlacklist = {
  // 'PROJECT_ID': THROTTLE_RATE (between 0.00 - 1.00)
  xijiKKCqPQzOl0EKa9ta0vmD: 0.10,
  G6kGCgdy9JzppocYlPmUGpXU: 0.02,
  NIKxOIAk2dsmlD88wgvNEK5S: 0.8,
  PmRZvwxxI0dSzlOkvdy1fZH2: 0.10,
  Khg4AhRTwqdcEqBqpSRUonIG: 0.60,
};

export default class Sampler {
  constructor(Keen) {
    this.config = Keen.config;
    this.projectIdThrottleBlacklist = projectIdThrottleBlacklist;
  }

  static convertIdToInt(uniqueId) {
    let hash = String(uniqueId).replace(/[^a-fA-F0-9]/g, '').toLowerCase();
    hash = String(`ffffffff${hash}`).slice(-8); // left-pad the hash and trim

    return parseInt(hash, 16);
  }

  shouldSample(uniqueId) {
    if (!this.canBeThrottled()) {
      return true;
    }

    const hashValue = Sampler.convertIdToInt(uniqueId);
    const desiredSampleRate = this.desiredSampleRateForProjectId();
    const divisor = 0xffffffff;
    const isBelowThreshold = (hashValue / divisor) < desiredSampleRate;

    return isBelowThreshold;
  }

  desiredSampleRateForProjectId() {
    const throttleRate = this.projectIdThrottleBlacklist[this.config.projectId];

    return throttleRate === undefined ? 1 : throttleRate;
  }

  canBeThrottled() {
    const isTestEnvironment = document.cookie.indexOf('prodperfect_test') !== -1;
    if (isTestEnvironment) {
      return false;
    }

    return this.desiredSampleRateForProjectId() !== 1.00;
  }
}
