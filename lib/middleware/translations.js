
module.exports = {
    middlewareTranslations: function (req, res, next) {
        if (this.options.translate) {
            req.translate = this.options.translate;
        }
        next();
    }
};
