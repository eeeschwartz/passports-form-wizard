'use strict';

var _ = require('underscore');
var path = require('path');

path = path.posix || path;

var reURL = /^https?:\/\//i;

var helpers = {
    defaultConditionFunction: function (req, res, condition) {
        var val = req.sessionModel.get(condition.field);
        switch (condition.op) {
        case '>':
            return val > condition.value;
        case '>=':
            return val >= condition.value;
        case '<':
            return val < condition.value;
        case '<=':
            return val <= condition.value;
        case '==':
            return val == condition.value;
        case '!=':
            return val != condition.value;
        case '=':
        case '===':
        default:
            return val === condition.value;
        }
    },

    decodeConditions: function (req, res, nextStep) {
        while (_.isArray(nextStep)) {
            var conditions = nextStep;
            nextStep = null;
            _.find(conditions, function (condition) {
                if (typeof condition === 'string') {
                    nextStep = condition;
                    return true;
                }

                var fn = condition.fn || helpers.defaultConditionFunction;

                if (fn(req, res, condition)) {
                    nextStep = condition.next;
                    return true;
                }
            });
        }

        return nextStep;
    },

    resolvePath: function (baseUrl, url, relative) {
        if (typeof url !== 'string') {
            return url;
        }
        if (reURL.test(url)) {
            return url;
        }
        if (relative) {
            return path.resolve('/', baseUrl, './' + url);
        }
        return path.resolve('/', baseUrl, url);
    }
};

module.exports = helpers;
