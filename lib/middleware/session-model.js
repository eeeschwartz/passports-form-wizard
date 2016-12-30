var Model = require('../model');

module.exports = {
    middlewareSessionModel: function (req, res, next) {
        req.sessionModel = new Model({}, {
            session: req.session,
            key: this.options.name
        });
        next();
    }
};
