'use strict';

var _ = require('underscore'),
    debug = require('debug')('hmpo:progress-check'),
    path = require('path');

path = path.posix || path;

module.exports = {
    addJourneyHistoryStep: function (req, res, step) {
        var journeyHistory = req.journeyModel.get('history') || [];

        var historyIndex = _.findIndex(journeyHistory, { path: step.path });
        var item = journeyHistory[historyIndex];
        if (item && step.next === item.next) {
            // replace step
            journeyHistory.splice(historyIndex, 1, step);
        } else {
            if (item) {
                // truncate
                journeyHistory.splice(historyIndex);
            }

            // append step
            journeyHistory.push(step);
        }

        debug('Journey step added', step);

        req.journeyModel.set('history', journeyHistory);
    },

    _completeStep: function (req, res, path) {
        var nextStep = this.decodeConditions(req, res, this.options.next);

        var fields = _.uniq(_.flatten([
            nextStep.fields,
            _.values(this.options.import)
        ]));

        var links = _.map(this.options.links, function (link) {
            return this.resolvePath(req.baseUrl, link);
        }.bind(this));

        var newItem = {
            path: path || this.resolvePath(req.baseUrl, this.options.route, true),
            next: this.resolvePath(req.baseUrl, nextStep.url),
            fields: fields.length ? fields : undefined,
            skip: this.options.skip ? true : undefined,
            links: links.length ? links : undefined
        };

        this.addJourneyHistoryStep(req, res, newItem);

        debug('Journey step complete', path);
    },

    _invalidateJourney: function (req, res, changes) {
        changes = _.keys(_.omit(changes, ['steps', 'csrf-secret']));
        if (!changes.length) {
            return;
        }

        var journeyHistory = req.journeyModel.get('history') || [];

        var path = this.resolvePath(req.baseUrl, this.options.route, true);
        var itemIndex = _.findIndex(journeyHistory, { path: path });

        if (itemIndex < 0) {
            return;
        }

        var historyIndex = _.findIndex(journeyHistory, function (item, index) {
            if (index < itemIndex) {
                return false;
            }
            var fields = _.intersection(item.fields, changes);
            return !_.isEmpty(fields);
        });

        if (historyIndex >= 0) {
            var invalidated = journeyHistory.splice(historyIndex);
            debug('Journey truncated', this.options.route, changes, invalidated[0]);
            req.journeyModel.set('history', journeyHistory);
        }
    },

    _checkJourney: function (req, res, next) {
        // don't check this step
        if (this.options.entryPoint || this.options.checkJourney === false) {
            return next();
        }

        var journeyHistory = req.journeyModel.get('history') || [];

        var path = this.resolvePath(req.baseUrl, this.options.route, true);

        // this is an allowed next step
        var item = _.findWhere(journeyHistory, { next: path });
        if (item) {
            debug('Step is allowed next step', this.options.route, item.path);
            return next();
        }

        // this is an allowed link
        item = _.find(journeyHistory, function (step) {
            return _.contains(step.links, path);
        });
        if (item) {
            debug('Step is allowed link', this.options.route, item.path);
            return next();
        }

        debug('Step missing prereq', this.options.route);

        var err = new Error('Missing prereq for this step');
        err.code = 'MISSING_PREREQ';
        var lastStep = _.last(journeyHistory);
        if (lastStep) {
            err.redirect = lastStep.next || lastStep.path;
        }

        next(err);
    },

    middlewareCheckProgress: function () {
        if (this.options.completeStep !== false) {
            this.on('complete', this._completeStep.bind(this));
        }

        return function (req, res, next) {
            // truncate journey history if a field is changed
            req.sessionModel.on('change', function (changes) {
                this._invalidateJourney(req, res, changes);
            }.bind(this));

            return this._checkJourney(req, res, next);
        };
    }
};
