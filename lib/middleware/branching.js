'use strict';

var _ = require('underscore');
var path = require('path');
var moment = require('moment');

path = path.posix || path;

var reURL = /^https?:\/\//i;

module.exports = {
    _defaultConditionFunction: function (req, res, condition) {
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
        case 'before':
            var pastDate;
            if (condition.unit) {
                pastDate = moment().add(condition.value, condition.unit);
            } else {
                pastDate = moment(condition.value, 'YYY-MM-DD');
            }
            return moment(val, 'YYYY-MM-DD').isBefore(pastDate);
        case 'after':
            var futureDate;
            if (condition.unit) {
                futureDate = moment().add(condition.value, condition.unit);
            } else {
                futureDate = moment(condition.value, 'YYY-MM-DD');
            }
            return moment(val, 'YYYY-MM-DD').isAfter(futureDate);
        case '=':
        case '===':
        default:
            return val === condition.value;
        }
    },

    decodeConditions: function (req, res, nextStep) {
        var fieldsUsed = [];
        var successfulCondition = null;
        while (_.isArray(nextStep)) {
            var conditions = nextStep;
            nextStep = null;
            _.find(conditions, function (condition) {
                if (typeof condition === 'string') {
                    nextStep = condition;
                    return true;
                }

                var fn = condition.fn || this._defaultConditionFunction;

                if (condition.field) {
                    fieldsUsed.push(condition.field);
                }

                if (fn.call(this, req, res, condition)) {
                    nextStep = condition.next;
                    successfulCondition = condition;
                    return true;
                }
            }.bind(this));
        }

        return {
            url: nextStep,
            condition: successfulCondition,
            fields: _.uniq(_.flatten(fieldsUsed))
        };
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

