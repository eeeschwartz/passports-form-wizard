'use strict';

var express = require('express'),
    _ = require('underscore'),
    Form = require('./controller');

var count = 0;

var Wizard = function (steps, fields, settings) {

    // backward compatible settings
    settings.wizardName = settings.wizardName || settings.name || count++;
    delete settings.name;

    var app = express.Router();

    _.each(steps, function (options, route) {

        options = _.extend(
            {
                route: route,
                steps: steps,
                controller: Form,
                params: ''
            },
            settings, // overwrite with wizard settings
            options // overwrite with step options
        );

        // convert field list into field objects
        if (_.isArray(options.fields)) {
            options.fields = _.object(options.fields, _.map(options.fields, function (f) { return fields[f] || {}; }));
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
