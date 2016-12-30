
module.exports = {
    middlewareCheckSession: function (req, res, next) {
        if (this.options.checkSession !== false && (req.method === 'POST' || req.path !== this.options.first)) {
            if (req.cookies['hmpo-wizard-sc'] && req.session.exists !== true) {
                var err = new Error('Session expired');
                err.code = 'SESSION_TIMEOUT';
                return next(err);
            }
        }
        req.session.exists = true;
        res.cookie('hmpo-wizard-sc', 1);
        next();
    }
};
