'use strict';

let seleniumServer = require('selenium-server');
let chromedriver = require('chromedriver');
let geckodriver = require('geckodriver');

require('nightwatch-cucumber')({
    featureFiles: ['./test/component/features'],
    supportFiles: ['./test/component/nightwatch/support-files/hooks.js'],
    stepDefinitions: ['./test/component/nightwatch/step-definitions'],
    jsonReport: 'reports/cucumber.json',
    htmlReport: 'reports/cucumber.html'
});

module.exports = {
    custom_commands_path: '',
    custom_assertions_path: '',
    page_objects_path: './test/component/nightwatch/page-objects',
    globals_path: './test/component/nightwatch/support-files/globals.js',
    output_folder: 'reports',
    live_output: false,
    disable_colors: false,

    // multi-process testing
    // test_workers: true,

    selenium: {
        start_process: true,
        server_path: seleniumServer.path,
        log_path: '',
        host: '127.0.0.1',
        port: 4444,
        cli_args: {
            'webdriver.chrome.driver': chromedriver.path,
            'webdriver.gecko.driver': geckodriver.path
        }
    },

    test_settings: {
        default: {
            launch_url: 'http://localhost:3000',
            selenium_port: 4444,
            selenium_host: 'localhost',
            silent: true,
            screenshots: {
                enabled: true,
                on_failure: true,
                on_error: false,
                path: 'reports/screenshots/default'
            },
            desiredCapabilities: {
                browserName: 'chrome',
                javascriptEnabled: true,
                acceptSslCerts: true
            }
        },
        chrome: {
            desiredCapabilities: {
                browserName: 'chrome'
            }
        },
        chrome_headless: {
            desiredCapabilities: {
                browserName: 'chrome',
                chromeOptions: {
                    args: ['headless']
                }
            }
        },
        firefox: {
            desiredCapabilities: {
                browserName: 'firefox',
                marionette: true,
                javascriptEnabled: true,
                acceptSslCerts: true
            }
        }
    }
};
