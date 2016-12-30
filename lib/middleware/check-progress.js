var _ = require('underscore'),
    debug = require('debug')('hmpo:progress-check'),
    path = require('path'),
    helpers = require('../helpers');

path = path.posix || path;

module.exports = {
    middlewareCheckProgress: function () {
        var invalidatingFields = _.pick(this.options.fields, function (f) {
            return f && f.invalidates && f.invalidates.length;
        });

        this.on('complete', function (req, res, path) {
            var sessionsteps = req.sessionModel.get('steps') || [];
            path = path || this.options.route;
            debug('Marking path complete ', path);
            sessionsteps = _.without(sessionsteps, path);
            sessionsteps.push(path);
            req.sessionModel.set('steps', sessionsteps);
        });

        return function (req, res, next) {
            _.each(invalidatingFields, function (field, key) {
                req.sessionModel.on('change:' + key, function () {
                    debug('Unsetting fields', field.invalidates);
                    req.sessionModel.unset(field.invalidates);
                });
            });

            if (this.options.checkProgress === false) {
                next();
            }

            var completedSteps = req.sessionModel.get('steps') || [];
            debug('Completed Steps ', completedSteps);

            // check the current route to the current step
            var err;
            var currentRoute = [];
            var nextStep = this.options.first;
            while (nextStep) {
                var step = this.options.steps[nextStep];
                if (!step) {
                    // step not found
                    break;
                }

                if (nextStep === this.options.route) {
                    // This step is allowed as part of the current journey
                    req.sessionModel.set('journeysteps', currentRoute);
                    return next();
                }

                if (completedSteps.indexOf(nextStep) === -1) {
                    // route step missing from visited steps
                    break;
                }

                if (currentRoute.indexOf(nextStep) !== -1) {
                    err = new Error('Route loop ' + nextStep);
                    err.code = 'PREREQ_LOOP';
                    err.currentRoute = currentRoute;
                    return next(err);
                }

                debug('Visited route step ', nextStep, ' on way to ', this.options.route);

                currentRoute.push(nextStep);

                nextStep = helpers.decodeConditions(req, res, step.next);

                // add slash to match step name
                if (nextStep && this.options.steps['/' + nextStep]) {
                    nextStep = '/' + nextStep;
                }
            }

            debug('Missing step ', nextStep, currentRoute);

            req.sessionModel.set('journeysteps', currentRoute);

            err = new Error('Missing route step ' + nextStep);
            err.code = 'MISSING_PREREQ';
            err.currentRoute = currentRoute;
            err.missingStep = nextStep;
            next(err);
        };
    }
};
