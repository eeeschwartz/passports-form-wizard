var helpers = require('../helpers');

module.exports = {
    getNextStep: function (req, res) {
        var nextStep = helpers.decodeConditions(req, res, this.options.next);

        nextStep = nextStep || req.originalUrl;

        if (req.isEditing) {
            return this.getEditNextStep(req, res, nextStep);
        }

        return helpers.resolvePath(req.baseUrl, nextStep);
    },

    middlewareNextStep: function (req, res, next) {
        res.locals.nextPage = this.getNextStep(req, res);
        next();
    }
};
