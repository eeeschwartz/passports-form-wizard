'use strict';

var debug = require('debug')('hmpo:import-fields'),
    _ = require('underscore');

module.exports = {
    middlewareImportFields: function (req, res, next) {
        if (!this.options.import) {
            return next();
        }

        var data = {};
        _.each(this.options.import, function (fields, wizard) {
            var wizardName = 'hmpo-wizard-' + wizard;
            var wizardModel = req.session[wizardName];
            if (wizardModel) {
                debug('Fields to import', this.options.route, wizardName, fields);
                var importedData = _.pick(wizardModel, fields);
                debug('Found fields', this.options.route, wizardName, Object.keys(importedData));
                _.extend(data, importedData);
            }
        }.bind(this));

        var keys = _.keys(data);
        if (keys.length) {
            req.sessionModel.set(data);
            debug('Imported fields', this.options.route, keys);
        }

        next();
    }
};
