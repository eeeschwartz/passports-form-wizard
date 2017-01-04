'use strict';

var util = require('util'),
    _ = require('underscore'),
    ErrorClass = require('./error'),
    Form = require('hmpo-form-controller');

function Controller(options) {
    _.defaults(
        options,
        {
            template: options.route.replace(/^\//, ''), // default template is the same as the pathname
            journeyName: 'default',
            checkJourney: true,
            completeStep: true,
            checkSession: true,
            csrf: true,
            editSuffix: 'edit',
            editBackStep: 'confirm'
        }
    );

    if (options.templatePath) {
        options.template = options.templatePath + '/' + options.template;
    }

    Form.call(this, options);
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
    req.sessionModel.set(req.form.values);
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

_.extend(Controller.prototype, require('./middleware/branching'));
_.extend(Controller.prototype, require('./middleware/base-url'));
_.extend(Controller.prototype, require('./middleware/journey-model'));
_.extend(Controller.prototype, require('./middleware/session-model'));
_.extend(Controller.prototype, require('./middleware/translations'));
_.extend(Controller.prototype, require('./middleware/check-session'));
_.extend(Controller.prototype, require('./middleware/check-progress'));
_.extend(Controller.prototype, require('./middleware/check-csrf'));
_.extend(Controller.prototype, require('./middleware/invalidate-fields'));
_.extend(Controller.prototype, require('./middleware/import-fields'));
_.extend(Controller.prototype, require('./middleware/edit-step'));
_.extend(Controller.prototype, require('./middleware/next-step'));
_.extend(Controller.prototype, require('./middleware/back-links'));

Controller.prototype.middlewareSetup = function () {
    this.use([
        this.middlewareBaseUrl.bind(this),
        this.middlewareTranslations.bind(this),
        this.middlewareJourneyModel.bind(this),
        this.middlewareSessionModel.bind(this)
    ]);
};

Controller.prototype.middlewareChecks = function () {
    this.use([
        this.middlewareCheckSession.bind(this),
        this.middlewareCheckProgress().bind(this),
        this.middlewareCheckCSRF.bind(this)
    ]);
};

Controller.prototype.middlewareActions = function () {
    this.use([
        this.middlewareInvalidateFields().bind(this),
        this.middlewareImportFields.bind(this)
    ]);
};

Controller.prototype.middlewareLocals = function () {
    this.use([
        this.middlewareEditStep.bind(this),
        this.middlewareNextStep.bind(this),
        this.middlewareBackLinks.bind(this)
    ]);
};

Controller.prototype.middleware = function () {
    this.middlewareSetup();
    this.middlewareChecks();
    this.middlewareActions();
    this.middlewareLocals();
};

Controller.prototype.requestHandler = function () {
    this.middleware();
    return Form.prototype.requestHandler.call(this);
};

Controller.prototype.get = function (req, res, next) {
    if (this.options.skip) {
        return this.successHandler(req, res, next);
    }
    return Form.prototype.get.call(this, req, res, next);
};

Controller.prototype.errorHandler = function (err, req, res, next) {
    if (err.code === 'MISSING_PREREQ' && err.redirect) {
        res.redirect(err.redirect);
    } else {
        Form.prototype.errorHandler.call(this, err, req, res, next);
    }
};

Controller.Error = ErrorClass;
Controller.validators = Form.validators;
Controller.formatters = Form.formatters;

module.exports = Controller;
