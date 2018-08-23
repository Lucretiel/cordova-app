#!/bin/sh

set -ex

npx cordova plugin rm cordova-gtag-support
npx cordova plugin add ~/Documents/cordova-gtag-support
