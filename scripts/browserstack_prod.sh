#!/bin/bash

err=0
trap 'err=1' ERR

node_modules/.bin/testcafe 'browserstack:chrome:Windows 10,browserstack:firefox:Windows 10' test/testcafe/regression-tests.js

node_modules/.bin/testcafe 'browserstack:edge@17.0:Windows 10,browserstack:chrome:Windows 8.1' test/testcafe/regression-tests.js


node_modules/.bin/testcafe 'browserstack:firefox:Windows 8.1,browserstack:ie@11.0:Windows 8.1' test/testcafe/regression-tests.js

node_modules/.bin/testcafe 'browserstack:chrome:Windows 8,browserstack:firefox:Windows 8' test/testcafe/regression-tests.js

node_modules/.bin/testcafe 'browserstack:chrome:OS X High Sierra,browserstack:firefox:OS X High Sierra' test/testcafe/regression-tests.js
node_modules/.bin/testcafe 'browserstack:safari:OS X High Sierra,browserstack:chrome:OS X Sierra' test/testcafe/regression-tests.js

node_modules/.bin/testcafe 'browserstack:firefox:OS X Sierra,browserstack:chrome:OS X El Capitan' test/testcafe/regression-tests.js

node_modules/.bin/testcafe 'browserstack:firefox:OS X El Capitan' test/testcafe/regression-tests.js

test $err = 0
