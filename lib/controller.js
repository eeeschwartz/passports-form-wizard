var util = require('util'),
    _ = require('underscore'),
    ErrorClass = require('./error'),
    Form = require('hmpo-form-controller'),
    helpers = require('./helpers');

function Controller() {
    Form.apply(this, arguments);
    this.Error = ErrorClass;
}

util.inherits(Controller, Form);

Controller.prototype.getValues = function (req, res, callback) {
    var json = req.sessionModel.toJSON();
    delete json.errorValues;
    var myErrorValues = req.sessionModel.get('errorValues');
    myErrorValues = _.pick(myErrorValues, Object.keys(this.options.fields));
    callback(null, _.extend({}, json, myErrorValues));
};

Controller.prototype.saveValues = function (req, res, callback) {
    var newValues = _.pick(req.form.values, Object.keys(this.options.fields));
    req.sessionModel.set(newValues);
    req.sessionModel.unset('errorValues');
    callback();
};

Controller.prototype.getErrors = function (req, res) {
    var errs = req.sessionModel.get('errors');
    errs = _.pick(errs, Object.keys(this.options.fields));
    errs = _.pick(errs, function (err) {
        return !err.redirect;
    });
    return errs;
};

Controller.prototype.setErrors = function (err, req, res) {
    if (req.form) {
        req.sessionModel.set('errorValues', req.form.values);
    }
    req.sessionModel.set('errors', err);
};

_.extend(Controller.prototype, require('./middleware/base-url'));
_.extend(Controller.prototype, require('./middleware/session-model'));
_.extend(Controller.prototype, require('./middleware/translations'));
_.extend(Controller.prototype, require('./middleware/check-session'));
_.extend(Controller.prototype, require('./middleware/check-progress'));
_.extend(Controller.prototype, require('./middleware/check-csrf'));
_.extend(Controller.prototype, require('./middleware/edit-step'));
_.extend(Controller.prototype, require('./middleware/next-step'));
_.extend(Controller.prototype, require('./middleware/back-links'));

Controller.prototype.middleware = function () {
    this.router.use([
        this.middlewareBaseUrl.bind(this),
        this.middlewareSessionModel.bind(this),
        this.middlewareTranslations.bind(this),
        this.middlewareCheckSession.bind(this),
        this.middlewareCheckProgress().bind(this),
        this.middlewareCheckCSRF.bind(this),
        this.middlewareEditStep.bind(this),
        this.middlewareNextStep.bind(this),
        this.middlewareBackLinks.bind(this)
    ]);
};

Controller.prototype.requestHandler = function () {
    this.middleware();
    return Form.prototype.requestHandler.call(this);
};

Controller.prototype.errorHandler = function (err, req, res, next) {
    if (err.code === 'MISSING_PREREQ') {
        res.redirect(helpers.resolvePath(req.baseUrl, err.missingStep));
    } else {
        Form.prototype.errorHandler.call(this, err, req, res, next);
    }
};

Controller.Error = ErrorClass;
Controller.validators = Form.validators;
Controller.formatters = Form.formatters;

module.exports = Controller;
