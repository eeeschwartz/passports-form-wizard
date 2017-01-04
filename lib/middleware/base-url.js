'use strict';

module.exports = {
    middlewareBaseUrl: function (req, res, next) {
        res.locals.baseUrl = req.baseUrl;
        next();
    }
};
