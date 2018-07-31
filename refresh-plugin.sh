#!/bin/sh

set -ex

npx cordova plugin rm cordova-plugin-firebase-analytics
npx cordova plugin add https://github.com/Lucretiel/cordova-plugin-firebase-analytics.git
