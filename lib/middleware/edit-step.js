'use strict';

var _ = require('underscore');

module.exports = {
    getEditBackLink: function (req, res) {
        var previousStep = _.last(req.sessionModel.get('journeysteps'));
        if (previousStep) {
            var step = this.options.steps[previousStep];
            if (step && step.continueOnEdit) {
                return this.resolvePath(req.baseUrl, previousStep + '/' + this.options.editSuffix, true);
            }
        }

        return this.resolvePath(req.baseUrl, this.options.editBackStep);
    },

    getEditNextStep: function (req, res) {
        var nextStep = this.decodeConditions(req, res, this.options.next);

        var continueOnEdit = false;
        if (nextStep.condition) {
            continueOnEdit = nextStep.condition.continueOnEdit;
        } else {
            continueOnEdit = this.options.continueOnEdit;
        }

        if (continueOnEdit) {
            nextStep = nextStep.url + '/' + this.options.editSuffix;
        } else {
            nextStep = this.options.editBackStep;
        }

        return this.resolvePath(req.baseUrl, nextStep);
    },

    middlewareEditStep: function (req, res, next) {
        if (this.options.editable && req.params.edit === this.options.editSuffix) {
            res.locals.editSuffix = '/' + this.options.editSuffix;
            res.locals.isEditing = req.isEditing = true;
        }
        next();
    }
};
