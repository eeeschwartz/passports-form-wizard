'use strict';

var _ = require('underscore'),
    debug = require('debug')('hmpo:invalidate-fields');

module.exports = {
    middlewareInvalidateFields: function () {
        var invalidatingFields = _.pick(this.options.fields, function (f) {
            return f && f.invalidates && f.invalidates.length;
        });

        return function (req, res, next) {
            _.each(invalidatingFields, function (field, key) {
                req.sessionModel.on('change:' + key, function () {
                    debug('Unsetting fields', field.invalidates);
                    req.sessionModel.unset(field.invalidates);
                });
            });

            next();
        };
    }
};
