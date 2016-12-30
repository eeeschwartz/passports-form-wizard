var url = require('url'),
    path = require('path'),
    debug = require('debug')('hmpo:back-links'),
    _ = require('underscore'),
    helpers = require('../helpers');

path = path.posix || path;

var checkReferrer = function (backLinks, referrer, baseUrl) {
    debug('Check Referrer', referrer);
    var referrerPath = path.normalize(url.parse(referrer).path);
    return _.chain(backLinks)
        .map(function (link) {
            return helpers.resolvePath(baseUrl, link);
        })
        .find(function (link) {
            return (link === referrer) || (link === referrerPath);
        })
        .value();
};

module.exports = {
    getBackLink: function (req, res) {
        debug('Get Back Link');

        if (req.isEditing) {
            return this.getEditBackLink(req, res);
        }

        var backLink = this.options.backLink || this.options.backLinks;

        if (backLink === false || backLink === null) {
            return false;
        }

        if (typeof backLink === 'string') {
            return helpers.resolvePath(req.baseUrl, backLink);
        }

        if (_.isArray(backLink) && req.get('referrer')) {
            return checkReferrer(backLink, req.get('referrer'), req.baseUrl);
        }

        var previousStep = _.last(req.sessionModel.get('journeysteps'));
        if (previousStep) {
            return helpers.resolvePath(req.baseUrl, previousStep, true);
        }

        return false;
    },

    isBackLink: function (req, res) {
        debug('Is Back Link');

        var previousStep = _.last(req.sessionModel.get('journeysteps'));
        var lastVisitedStep = _.last(req.sessionModel.get('steps'));

        return previousStep !== lastVisitedStep;
    },

    middlewareBackLinks: function (req, res, next) {
        if (req.method === 'GET') {
            req.isBackLink = res.locals.isBackLink = this.isBackLink(req, res);
            req.backLink = res.locals.backLink = this.getBackLink(req, res);
        }
        next();
    }

};
