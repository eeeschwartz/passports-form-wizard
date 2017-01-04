'use strict';

var Model = require('../model');

module.exports = {
    middlewareJourneyModel: function (req, res, next) {
        req.journeyModel = new Model({}, {
            session: req.session,
            key: 'hmpo-journey-' + this.options.journeyName
        });
        if (this.options.resetJourney) {
            req.journeyModel.reset();
        }
        next();
    }
};
