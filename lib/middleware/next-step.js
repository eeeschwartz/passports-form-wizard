'use strict';

module.exports = {
    getNextStep: function (req, res) {
        if (req.isEditing) {
            return this.getEditNextStep(req, res);
        }

        var nextStep = this.decodeConditions(req, res, this.options.next);

        nextStep = nextStep.url || req.originalUrl;

        return this.resolvePath(req.baseUrl, nextStep);
    },

    middlewareNextStep: function (req, res, next) {
        res.locals.nextPage = this.getNextStep(req, res);
        next();
    }
};
