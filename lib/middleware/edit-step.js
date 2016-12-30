var helpers = require('../helpers'),
    _ = require('underscore');

module.exports = {
    getEditBackLink: function (req, res) {
        var previousStep = _.last(req.sessionModel.get('journeysteps'));
        if (previousStep) {
            var step = this.options.steps[previousStep];
            if (step && step.continueOnEdit) {
                return helpers.resolvePath(req.baseUrl, previousStep + '/' + this.options.editSuffix, true);
            }
        }

        return helpers.resolvePath(req.baseUrl, this.options.editBackStep);
    },

    getEditNextStep: function (req, res, nextStep) {
        if (this.options.continueOnEdit) {
            nextStep = nextStep + '/' + this.options.editSuffix;
        } else {
            nextStep = this.options.editBackStep;
        }
        return helpers.resolvePath(req.baseUrl, nextStep);
    },

    middlewareEditStep: function (req, res, next) {
        if (this.options.editable && req.params.edit === this.options.editSuffix) {
            res.locals.isEditing = req.isEditing = true;
        }
        next();
    }
};
