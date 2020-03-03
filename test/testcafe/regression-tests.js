import minimist from 'minimist';
import {ClientFunction, RequestLogger, Selector} from 'testcafe';
import fs from 'fs';
import { v4 } from 'uuid';

const args = minimist(process.argv.slice(2));
const localTesting = args.local ? true : false;
const betaTesting = args.beta ? true : false;

let testSuiteRunId = undefined;
const getLocation = ClientFunction(() => document.location.href);
const script_loader_function = (localTesting, betaTesting) => {
  if (localTesting) {
    return new Function(fs.readFileSync('./test/testcafe/test-snippet-local.js').toString());
  } else if (betaTesting) {
    return new Function(fs.readFileSync('./test/testcafe/test-snippet-beta.js').toString());
  } else {
    return new Function(fs.readFileSync('./test/testcafe/test-snippet-prod.js').toString());
  }
};
const setProdPerfectCookie = ClientFunction( (id, name, testSuiteRunId, env) => {
  const data = {
    test_run_data: {
      cli_command: env.npm_lifecycle_script,
      test_script_run_id: id,
      test_suite_run_id: testSuiteRunId,
      test_script: name,
      test_suite: env.npm_package_name,
      version: env.npm_package_version
    }
  }
  const jsonData = JSON.stringify(data)
  document.cookie = `prodperfect_test=${jsonData}; path=/`;
});


fixture `Test Page`
  .page `https://cbracco.github.io/html5-test-page/`
  .before( async ctx => {
    testSuiteRunId = v4();
  })
  .beforeEach( async t => {
    const testRun = t.testRun;
    await setProdPerfectCookie(testRun.id, testRun.test.name, testSuiteRunId, process.env);
  })
  .afterEach( async t => {
    const { error, warn, log, info } = await t.getBrowserConsoleMessages();

    await t
      .expect(error.length).eql(0)
      .expect(warn.length).eql(0)
      .expect(log.length).eql(0)
      .expect(info.length).eql(0)
  });

const logger = RequestLogger(/test.datapipe.prodperfect.com/);

test.requestHooks(logger)('0 Pageview', async t => {
  await t.expect(getLocation()).contains('/html5-test-page/');
  await t.eval(script_loader_function(localTesting, betaTesting));
  await t.wait(2000);

  await t
    .expect(logger.requests.length).eql(1)
    .expect(await logger.count((record) => /pageviews/.test(record.request.url) && record.response.statusCode === 204)).eql(1);
});

test.requestHooks(logger)('1 Click', async t => {
  await t.expect(getLocation()).contains('/html5-test-page/');
  await t.eval(script_loader_function(localTesting, betaTesting));
  await t.wait(2000);
  await t.click('a[href="#text"]');

  await t.wait(2000);
  await t.click('input[value="<input type=button>"]');
  await t.wait(1000);
  await t
    .expect(logger.requests.length).eql(3)
    .expect(await logger.count((record) => /pageviews/.test(record.request.url) && record.response.statusCode === 204)).eql(1)
    .expect(await logger.count((record) => /clicks/.test(record.request.url) && record.response.statusCode === 204)).eql(2);
});

test.requestHooks(logger)('2 Form submission', async t => {
  await t.expect(getLocation()).contains('/html5-test-page/');

  await t.eval(script_loader_function(localTesting, betaTesting));
  await t.wait(2000);
  await t.click('input[value="<input type=submit>"]');
  await t.wait(1000);

  await t
    .expect(logger.requests.length).eql(4)
    .expect(await logger.count(record => /pageviews/.test(record.request.url) && record.response.statusCode === 204)).eql(1)
    .expect(await logger.count(record => /clicks/.test(record.request.url) && record.response.statusCode === 204)).eql(1)
    .expect(await logger.count(record => /form_submissions/.test(record.request.url) && record.response.statusCode === 204)).eql(1)
    .expect(await logger.count(record => /pageunloads/.test(record.request.url) && record.response.statusCode === 204)).eql(1);
});

test.requestHooks(logger)('3 Input change', async t => {
  await t.expect(getLocation()).contains('/html5-test-page/');

  await t.eval(script_loader_function(localTesting, betaTesting));
  await t.wait(2000);
  await t.typeText('#input__text', 'text');
  await t.typeText('#textarea', 'text');
  await t.wait(1000);

  await t
    .expect(logger.requests.length).eql(4)
    .expect(await logger.count(record => /pageviews/.test(record.request.url) && record.response.statusCode === 204)).eql(1)
    .expect(await logger.count(record => /clicks/.test(record.request.url) && record.response.statusCode === 204)).eql(2)
    .expect(await logger.count(record => /changes/.test(record.request.url) && record.response.statusCode === 204)).eql(1);
});
