'use strict';

const Model = require('../../model');
const _ = require('underscore');

module.exports = Controller => class extends Controller {

    middlewareSetup() {
        super.middlewareSetup();
        this.use(this.createSessionModel);
    }

    createSessionModel(req, res, next) {
        if (typeof req.session === 'undefined') {
            throw new Error('Session is undefined');
        }

        if (req.sessionModel) {
            req.sessionModel.destroy();
        }

        /* field.js
            'name': {
                storage: 'personal.name' // save to req.session.[journeyModel].personal.name
            },
            'custom-storage-name': {
                storage: {
                    ignoreDefault: true,
                    key: 'custom.name' // req.session.custom.name
                }
            } */

        let wizardFields = this.getFieldsFromSteps(req.form.options.steps);
        let journeyKey = this.journeyModelKey(req);

        req.sessionModel = new Model(null, {
            session: req.session,
            key: 'hmpo-wizard-' + req.form.options.name,
            customStorage: this.getStorageKeys(wizardFields, journeyKey)
        });

        if (req.form.options.reset && req.method === 'GET') {
            req.sessionModel.reset();
        }

        next();
    }

    journeyModelKey(req) {
        return 'hmpo-journey-' + req.form.options.journeyName;
    }

    // returns all fields on the wizard
    getFieldsFromSteps(steps) {
        let fields = {};
        _.each(steps, (step) => {
            _.each(step.fields, (field, key) => {
                fields[key] = field;
            });
        });
        return fields;
    }

    // returns storage keys, if set
    getStorageKeys(obj, defaultKey) {
        let keys = {};
        _.each(obj, (item, key) => {
            if (item.storage) {
                // use ignoreDefault flag to store value outside of journeyModel
                keys[key] = (!defaultKey || item.storage.ignoreDefault) ? item.storage.key : defaultKey[item.storage];
            }
        });
        return keys;
    }

};
