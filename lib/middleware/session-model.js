'use strict';

var Model = require('../model');

module.exports = {
    middlewareSessionModel: function (req, res, next) {
        req.sessionModel = new Model({}, {
            session: req.session,
            key: 'hmpo-wizard-' + this.options.wizardName
        });
        if (this.options.reset) {
            req.sessionModel.reset();
        }
        next();
    }
};
