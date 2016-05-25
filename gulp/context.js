'use strict';


var gulp = require('gulp');
var help = require('gulp-help');
var debug = require('gulp-debug');
var sequence = require('gulp-sequence');
var watch = require('gulp-watch');
var liveReload = require('gulp-livereload');
//var exec = require('child_process').exec;
var mocha = require('gulp-mocha');
var jasmine = require('gulp-jasmine');


var config = require('./config.js');
var cacheManager = require('./cacheManager.js');

gulp = help(gulp);

module.exports = {
    gulp: gulp,
    debug: debug,
    sequence: sequence.use(gulp),
    liveReload: liveReload,
    watch: watch,
    config: config,
    cacheManager: cacheManager,
    //exec: exec,
    mocha: mocha,
    jasmine: jasmine
};