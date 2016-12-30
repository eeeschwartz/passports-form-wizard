var express = require('express'),
    _ = require('underscore'),
    Form = require('./controller');

var count = 0;

var Wizard = function (steps, fields, settings) {

    var first = _.findKey(steps, function (options) { return options.firstStep; }) || '/';

    // default wizard settings
    settings = _.extend({
        first: first
    }, settings);

    // prevent potentially conflicting session namespaces
    if (!settings.name) {
        settings.name = count;
        count++;
    }

    settings.name = 'hmpo-wizard-' + settings.name;

    var app = express.Router();

    app.use(require('./middleware/session'));

    _.each(steps, function (options, route) {

        options = _.extend(
            { // default controller settings
                controller: Form,
                params: '',
                editable: false,
                editSuffix: 'edit',
                editBackStep: 'confirm'
            },
            settings, // inherit from wizard settings
            options // overwrite with step options
        );

        options.route = route;
        options.steps = steps;
        options.fields = _.object(options.fields, _.map(options.fields, function (f) { return fields[f] || {}; }));

        // default template is the same as the pathname
        options.template = options.template || route.replace(/^\//, '');
        if (settings.templatePath) {
            options.template = settings.templatePath + '/' + options.template;
        }

        var Controller = options.controller;
        var controller = new Controller(options);

        var params = options.params || '';
        if (options.editable) {
            params = '/:edit?' + params;
        }

        app.route(route + params)
            .all(controller.requestHandler());
    });

    return app;

};

Wizard.Controller = Form;
Wizard.Error = Form.Error;

module.exports = Wizard;
