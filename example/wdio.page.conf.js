'use strict';

let defaults = require('./wdio.conf.js').config;
let _ = require('lodash');

let overrides = {
    cucumberOpts: {
        require: ['./test/component/wdio-page/step-definitions']
    }
};

exports.config = _.defaultsDeep(overrides, defaults);
