#!/bin/bash

err=0
trap 'err=1' ERR

node_modules/.bin/testcafe 'browserstack:chrome:Windows 10,browserstack:firefox:Windows 10' test/testcafe/regression-tests.js --beta
node_modules/.bin/testcafe 'browserstack:edge@17.0:Windows 10,browserstack:chrome:OS X High Sierra' test/testcafe/regression-tests.js --beta
node_modules/.bin/testcafe 'browserstack:safari:OS X High Sierra' test/testcafe/regression-tests.js --beta

test $err = 0
