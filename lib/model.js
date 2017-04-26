'use strict';

const Model = require('hmpo-model');
const _ = require('underscore');

class SessionModel extends Model {
    constructor(attrs, options) {
        options = options || {};
        let session = options.session;
        let key = options.key;
        let storage = {
            key: key || {},
            overrides: options.customStorage || {}
        };

        if (!session || typeof session !== 'object') {
            throw new Error('session-model - session must be defined');
        }

        if (!key || typeof key !== 'string') {
            throw new Error('session-model - key must be defined');
        }

        // setup sessionModel data
        let values = _.extend(session[storage.key], _.each(storage.overrides, (location) => session[location]));
        super(values, options);

        // write changes back to the session
        this.on('change', changes => {
            _.each(changes, (change, field) => {
                let store = storage.overrides[field] || storage.key;
                _.extend(session[store], change);
            });
        });

        // reset wizard
        this.on('resetWizard', () => session[storage.key] = {});

        // reset all stores
        this.on('reset', () => {
            session[storage.key] = {};
            _.each(storage.overrides, (store) => {
                session[store] = {};
            });
        });

        if (attrs) {
            this.set(attrs);
        }
    }

    destroy() {
        this.removeAllListeners();
        this.set = this.unset = this.reset = () => {
            throw new Error('Session Model has been destroyed');
        };
    }
}

module.exports = SessionModel;
