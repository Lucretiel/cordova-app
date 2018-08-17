#!/bin/sh

set -ex

npx cordova plugin rm firebase-analytics-cordova
npx cordova plugin add https://github.com/googleanalytics/firebase-analytics-cordova.git
