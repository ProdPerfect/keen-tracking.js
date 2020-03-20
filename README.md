# ProdPerfect Keen Tracking Library

This repository is not just our tracking library code, but also documentation and dependency info. 

## Release History

We have recently back-filled our last few code releases in the oft-underused "Releases" tab, so you can see a few of the revisions we've put out as well.

https://github.com/ProdPerfect/prodperfect-keen-tracking.js/releases

## Tracking Library code

This is the un-minified code for our tracking library. We generally serve the minified version for our customers since it loads more quickly.

**Un-minified:**

https://github.com/ProdPerfect/prodperfect-keen-tracking.js/blob/master/dist/keen-tracking.js

**Minified:**

https://github.com/ProdPerfect/prodperfect-keen-tracking.js/blob/master/dist/keen-tracking.min.js

## Browser-Compatible JS Transformation

When we spin you up your own version of this code, it will be a little different - this is due to Webpack and Babel changing this into browser-compatible JS. 

https://github.com/ProdPerfect/prodperfect-keen-tracking.js/blob/master/webpack.config.js
https://github.com/ProdPerfect/prodperfect-keen-tracking.js/blob/master/.babelrc

## Master vs. Production Version

The Master version of this code may also be different, even post-transformation, from what you see on your version. This is because we do gradual rollouts of Tracking Library changes, including two canary tiers to make sure there are no side effects. The Production branch in this repo will have the version of the code that you are using, also available as the "Latest release" in the Releases tab linked above.

https://github.com/ProdPerfect/prodperfect-keen-tracking.js/tree/production

## Tracking Snippet

If you're interested in the tracking snippet that we ask you to install on your site, that is also available in this repo:

https://github.com/ProdPerfect/prodperfect-keen-tracking.js/blob/master/test/testcafe/test-snippet-prod.js

## Customer-Specific Variables

The parts that are unique per customer are as follows:

Line 4: `test` is replaced with customer name

`'https://test.trackinglibrary.prodperfect.com/keen-tracking.min.js'`

Line 10: the `projectId` is unique

`projectId: '5a3188a2c9e77c000154bef7',`

Line 11: the `writeKey` is unique

`writeKey: 'D88D34AB1044DCF5DDCE...'`

Line 13: `test` is replaced with customer name

`host: 'test.datapipe.prodperfect.com/v1'`

------------------------------------------

## ProdPerfect Internal Documentation

These documents are inaccessible to the public, but are crucial to our developers. They have to do with how we deploy changes to the Tracking Library, including our processes on code review, security checks, style conventions, test coverage, canary stepped-rollouts and rollbacks. If you're curious about their contents, send us your resume and we'll let you know :)

[Developer Workflow](https://docs.google.com/document/d/1dftRP4kEHfd4I2QzgePO5XB1Mzz5J--hpdLy5ky_7vc) | [Style Guide](https://docs.google.com/document/d/1HHhCFOMY2ZF6whiF-L-xy9wzUUPQz8zZ_o_YZEJCOmg)
