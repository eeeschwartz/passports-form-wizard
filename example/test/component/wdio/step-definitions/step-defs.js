'use strict';

const chai = require('chai');
chai.should();

const chaiWebdriver = require('chai-webdriverio').default;
chai.use(chaiWebdriver(browser));

const _ = require('lodash');

module.exports = function () {
    this.Given(/^I am an adult user$/, function () {
        browser.hmpo = {};

        browser.hmpo.user = {
            'name': 'Name',
            'age': '18',
            'color': 'Red'
        };
    });
    this.Given(/^I (have) open(ed) the (.*) website$/, function (have, opened, websiteName) {
        if (websiteName === 'Example') {
            websiteName = '';
        }

        browser.url(`http://localhost:3000/${websiteName}`);
    });

    this.When(/^I click continue$/, function () {
        let selector = 'input[type="submit"]';
        selector.should.be.there();

        let continueBtn = browser.element(selector);
        continueBtn.click();
    });


    this.Given(/^I should be on the (.*) page$/, function (pageName) {
        let selector = `[data-name='${_.kebabCase(pageName)}']`;
        selector.should.be.there();
    });

    this.Given(/^I enter (a|an) (.*)/, function (a, property) {
        let selector = `#${property}`;
        selector.should.be.there();

        let field = browser.element(selector);
        field.setValue(browser.hmpo.user[_.camelCase(property)]);
    });

    this.Given(/^I choose (a|an) (.*)/, function (a, property) {
        let selector = `#${property}`;
        selector.should.be.there();

        browser.selectByVisibleText(selector, browser.hmpo.user[_.camelCase(property)]);
    });
};
