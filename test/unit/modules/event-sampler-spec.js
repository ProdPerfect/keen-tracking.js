import Sampler from '../../../lib/event-sampler';
import { getUniqueId } from '../../../lib/helpers/getUniqueId';

describe('Event Sampler', () => {
  Object.defineProperty(window.document, 'cookie', {
    writable: true,
  });

  let client;
  let sampler;

  beforeEach(() => {
    client = {
      config: {
        projectId: 'some_project_id',
      },
    };

    document.cookie = '';

    sampler = new Sampler(client);
  });

  it('Should maintain a hardcoded blacklist of projectIds that will be throttled.', () => {
    expect(sampler.projectIdThrottleBlacklist).toBeDefined();
  });

  it('Should return true for canBeThrottled() when the project is in the blacklist.', () => {
    sampler.projectIdThrottleBlacklist = {
      some_project_id: 0.5,
    };

    expect(sampler.canBeThrottled()).toBe(true);
  });

  it('Should return false for canBeThrottled() when ProdPerfect test cookie is set', () => {
    document.cookie = 'prodperfect_test=foo';

    expect(sampler.canBeThrottled()).toBe(false);
  });

  it('Should always sample the session when the throttle rate is set to 1.0', () => {
    sampler.projectIdThrottleBlacklist = {
      some_project_id: 1.0,
    };

    expect(sampler.shouldSample('fff')).toBe(true);
  });

  it('Should never sample the session when the throttle rate is set to 0.0', () => {
    sampler.projectIdThrottleBlacklist = {
      some_project_id: 0.0,
    };

    expect(sampler.shouldSample('fff')).toBe(false);
  });

  it('Should sample sessions at close to the specified rate', () => {
    const fudgePercent = 0.01;
    const samplePercent = 0.05;
    const iterations = 10000;

    let shouldSampleCount = 0;
    let uuid;

    sampler.projectIdThrottleBlacklist = {
      some_project_id: samplePercent,
    };

    // eslint-disable-next-line
    for (let i = 0; i < iterations; i++) {
      uuid = getUniqueId();
      if (sampler.shouldSample(uuid)) {
        shouldSampleCount += 1;
      }
    }

    expect(shouldSampleCount).toBeLessThan(iterations * (samplePercent + fudgePercent));
    expect(shouldSampleCount).toBeGreaterThan(iterations * (samplePercent - fudgePercent));
  });
});
