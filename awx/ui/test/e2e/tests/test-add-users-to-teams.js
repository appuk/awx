import uuid from 'uuid';

import {
	getUser,
    getOrganization,
} from '../fixtures';

import {
    AWX_E2E_URL
} from '../settings';


const testID = uuid().substr(0, 8);
const namespace = `add-users-to-org-${testID}`;
let data;


module.exports = {
    before: (client, done) => {
        const resources = [
		getOrganization(namespace),
		getUser(namespace+'1'),
		getUser(namespace+'1'),
        ];
        Promise.all(resources)
        .then(([org, user1, user2]) => {
        data = { org, user1, user2 };
        client
            .login()
            .waitForAngular()
            .navigateTo(`${AWX_E2E_URL}/#/organizations/${data.org.id}`)
            .waitForElementPresent('#organization_save_btn:enabled')
            .waitForElementPresent('#users_tab')
            .click('#users_tab');
            done();
            });
    },
    'test that multiple users can be added to an organization at one time': client => {
        client
            .waitForElementPresent('[aw-tool-tip*="Add Users to this organization"][id="button-add"]:enabled')
            .pause(1000)
            .click('[aw-tool-tip*="Add Users to this organization"][id="button-add"]:enabled')
            .pause(1000)
            .clearValue('#add-permissions-modal .SmartSearch-input')
            .setValue('#add-permissions-modal .SmartSearch-input', [`username.iexact:${data.user1.username}`, client.Keys.ENTER])
            .waitForElementVisible(`#add-permissions-modal [id="${data.user1.id}"] [type="checkbox"]:enabled`)
            .pause(1000)
            .click(`#add-permissions-modal [id="${data.user1.id}"] [type="checkbox"]:enabled`)
            .pause(1000)
            .click('.TagComponent-button__delete')
            .pause(1000)
            .clearValue('#add-permissions-modal .SmartSearch-input')
            .setValue('#add-permissions-modal .SmartSearch-input', [`username.iexact:${data.user2.username}`, client.Keys.ENTER])
            .waitForElementVisible(`#add-permissions-modal [id="${data.user2.id}"] [type="checkbox"]:enabled`)
            .pause(1000)
            .click(`#add-permissions-modal [id="${data.user2.id}"] [type="checkbox"]:enabled`)
            .pause(1000)
            .click('#add-permissions-modal .Form-saveButton:enabled')
            .waitForSpinny()
            .waitForElementVisible(`a[href$="${data.user1.id}"]:enabled`)
            .waitForElementVisible(`a[href$="${data.user2.id}"]:enabled`);

    },
    'test that user can not be added if they are already part of the organization': client => {
        client
            .waitForElementPresent('[aw-tool-tip*="Add Users to this organization"][id="button-add"]:enabled')
            .pause(1000)
            .click('[aw-tool-tip*="Add Users to this organization"][id="button-add"]:enabled')
            .waitForElementVisible('#add-permissions-modal')
            .clearValue('#add-permissions-modal .SmartSearch-input')
            .setValue('#add-permissions-modal .SmartSearch-input', [`username.iexact:${data.user2.username}`, client.Keys.ENTER])
            .waitForElementVisible('.usersList .List-searchNoResults')
            .pause(1000)
            .click('#add-permissions-modal .Form-cancelButton');
    },
    'test that if there are no users available to add to an organization, then the user modal will display ‘NO USERS TO ADD”': client => {
        client    
            .pause(1000);

    },
    after: client => {
        client.end();
    }
};
