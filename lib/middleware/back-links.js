'use strict';

var url = require('url'),
    path = require('path'),
    debug = require('debug')('hmpo:back-links'),
    _ = require('underscore');

path = path.posix || path;

module.exports = {
    _backLinkCheckReferrer: function (backLinks, referrer, baseUrl) {
        debug('Check Referrer', referrer);
        var referrerPath = path.normalize(url.parse(referrer).path);
        return _.chain(backLinks)
            .map(function (link) {
                return this.resolvePath(baseUrl, link);
            }.bind(this))
            .find(function (link) {
                return (link === referrer) || (link === referrerPath);
            })
            .value();
    },

    getBackLink: function (req, res) {
        if (req.isEditing) {
            return this.getEditBackLink(req, res);
        }

        var backLink = this.options.backLink || this.options.backLinks;

        if (backLink === false || backLink === null) {
            return false;
        }

        if (typeof backLink === 'string') {
            return this.resolvePath(req.baseUrl, backLink);
        }

        if (_.isArray(backLink) && req.get('referrer')) {
            return this._backLinkCheckReferrer(backLink, req.get('referrer'), req.baseUrl);
        }

        var path = this.resolvePath(req.baseUrl, this.options.route, true);
        var journeyHistory = req.journeyModel.get('history') || [];
        var item = _.findWhere(journeyHistory, { next: path });
        while (item) {
            debug('Step has previous in history', this.options.route, item.path);
            if (!item.skip) {
                return item.path;
            }
            item = _.findWhere(journeyHistory, { next: item.path });
        }

        return false;
    },

    isBackLink: function (req, res) {
        var path = this.resolvePath(req.baseUrl, this.options.route, true);
        var journeyHistory = req.journeyModel.get('history') || [];
        var item = _.findWhere(journeyHistory, { path: path });
        var last = _.last(journeyHistory);
        if (item && last && item !== last) {
            return true;
        }

        return false;
    },

    middlewareBackLinks: function (req, res, next) {
        if (req.method === 'GET') {
            req.isBackLink = res.locals.isBackLink = this.isBackLink(req, res);
            req.backLink = res.locals.backLink = this.getBackLink(req, res);
            debug('Backlinks', req.backLink, req.isBackLink);
        }
        next();
    }

};
