import uuid from 'uuid';

import {
    getJobTemplateAdmin,
	getUser,
	getTeam,
    getOrganization,
    getJobTemplate
} from '../fixtures';

import {
    AWX_E2E_URL
} from '../settings';

import {
    post
} from '../api';

const testID = uuid().substr(0, 8);
const namespace = `template-admin-permissions-${testID}`;
let data;


module.exports = {
    before: (client, done) => {
        const resources = [
		getOrganization(namespace),
		getUser(namespace+'1'),
		getUser(namespace+'1'),
		getUser(namespace),
		getUser(namespace+'1'),
		getUser(namespace+'1'),
		getUser(namespace+'1'),
        ];
        Promise.all(resources)
        .then(([org, user1, user2, user3, user4, user5, user6]) => {
        data = { org, user1, user2, user3, user4, user5, user6 };
        /*post(`/api/v2/teams/${team1.id}/users/`, { id: user1.id });
        post(`/api/v2/teams/${team2.id}/users/`, { id: user2.id });
        post(`/api/v2/teams/${team1.id}/users/`, { id: job_template_admin.id });
        post(`/api/v2/organizations/${org.id}/teams/`, { id: team2.id })*/
        client
                    .login()
                    .waitForAngular();
            done();
            });
    },
    'test that admin can add users to organization': client => {
        // job template page
        console.log(data)
        client
            .navigateTo(`${AWX_E2E_URL}/#/organizations/${data.org.id}`)
            .waitForElementPresent('#organization_save_btn:enabled')
            .waitForElementPresent('#users_tab')
            .click('#users_tab')
            .waitForElementPresent('[aw-tool-tip*="Add Users to this organization"][id="button-add"]:enabled')
            .pause(1000)
            .click('[aw-tool-tip*="Add Users to this organization"][id="button-add"]:enabled')
            .pause(1000)
            // 1. Verify that  Multiple users can be added to an organization at one time.
            .useXpath()
            .click('//div[1]/div[2]/select-list-item/input')
            .click('//div[2]/div[2]/select-list-item/input')
            .useCss()
            .click('#add-permissions-modal .Form-saveButton:enabled')
            .waitForSpinny()
            // 2. User can not be added if they are already part of the organization
            .waitForElementPresent('[aw-tool-tip*="Add Users to this organization"][id="button-add"]:enabled')
            .pause(2000)
            .click('[aw-tool-tip*="Add Users to this organization"][id="button-add"]:enabled')
            .waitForElementVisible('#add-permissions-modal')
            .clearValue('#add-permissions-modal .SmartSearch-input')
            .setValue('#add-permissions-modal .SmartSearch-input', [`username.iexact:${data.user3.username}`, client.Keys.ENTER])
            .waitForElementVisible('.usersList .List-searchNoResults')
            .pause(2000)
            .click('#add-permissions-modal .Form-cancelButton')
            // 3. User can be added via search
            .waitForElementPresent('[aw-tool-tip*="Add Users to this organization"][id="button-add"]:enabled')
            .pause(2000)
            .click('[aw-tool-tip*="Add Users to this organization"][id="button-add"]:enabled')
            .waitForElementVisible('#add-permissions-modal')
            .clearValue('#add-permissions-modal .SmartSearch-input')
            .setValue('#add-permissions-modal .SmartSearch-input', [`username.iexact:${data.user4.username}`, client.Keys.ENTER])
            .waitForElementVisible('#add-permissions-modal a[href*="#/users/"]:enabled')
            .pause(2000)
            .click('#add-permissions-modal [type="checkbox"]:enabled')
            .click('#add-permissions-modal .Form-saveButton:enabled')
            .waitForSpinny()
            .waitForElementVisible(`a[href$="${data.user4.id}"]:enabled`)
            // 4.  If there are no users available to add to an organization, then the user modal will display ‘NO USERS TO ADD”

    },
    after: client => {
        client.end();
    }
};
