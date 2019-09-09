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
		getJobTemplateAdmin(namespace),
		getJobTemplate(namespace),
		getOrganization(namespace),
		getUser(namespace),
		getUser(namespace),
		getUser(namespace+'3'),
		getTeam(namespace+'1'),
		getTeam(namespace+'2')
        ]
        Promise.all(resources)
        .then(([job_template_admin, job_template, org, user1, user2, user3, team1, team2]) => {
        data = { job_template_admin, job_template, org, user1, user2, user3, team1, team2 };
        post(`/api/v2/teams/${team1.id}/users/`, { id: user1.id });
        post(`/api/v2/teams/${team2.id}/users/`, { id: user2.id });
        post(`/api/v2/teams/${team1.id}/users/`, { id: job_template_admin.id });
        post(`/api/v2/organizations/${org.id}/teams/`, { id: team2.id })
        client
            .login(job_template_admin.username)
            .waitForAngular()
            .navigateTo(`${AWX_E2E_URL}/#/templates/job_template/${data.job_template.id}`)
            .waitForElementPresent('#job_template_save_btn:enabled')
            .waitForElementPresent('#job_template_become_enabled_chbox_0:enabled')
            .waitForElementPresent('#permissions_tab')
            .pause(1000)
            .click('#permissions_tab')
            .pause(1000)
            .waitForElementPresent('[class="list-actions ng-scope"] #button-add:enabled')
            .waitForElementPresent('[class="BreadCrumb-item ng-scope ng-isolate-scope"] [href*="templates/job_template/"]:enabled')
            .pause(1000);
            done();
            });
    },
    'test a template admin can add permissions to user in same org': client => {
        client
            .click('[class="list-actions ng-scope"] #button-add:enabled')
            .waitForElementVisible('#add-permissions-modal .Form-saveButton:enabled')
            .pause(1000)
            .clearValue('#add-permissions-modal .SmartSearch-input')
            .setValue('#add-permissions-modal .SmartSearch-input', [`username.iexact:${data.user1.username}`, client.Keys.ENTER])
            .waitForElementVisible(`#add-permissions-modal a[href$="${data.user1.id}"]:enabled`)
            .waitForElementVisible(`#add-permissions-modal [id="${data.user1.id}"] [type="checkbox"]:enabled`)
            .pause(1000)
            .click(`#add-permissions-modal [id="${data.user1.id}"] [type="checkbox"]:enabled`)
            .waitForElementVisible('.AddPermissions-roleRemove:enabled')
            .pause(1000)
            .click('#add-permissions-modal .select2-search__field')
            .setValue('#add-permissions-modal .select2-search__field', ["Read", client.Keys.ENTER])
            .waitForElementVisible('#add-permissions-modal .select2-selection__choice__remove')
            .click('#add-permissions-modal .Form-saveButton:enabled')
            .waitForSpinny()
            .pause(1000)
            .waitForElementVisible(`a[href$="${data.user1.id}"]:enabled`);
    },
    'test a template admin can add permissions to user in different team but same org': client => {
        client
            .waitForElementVisible('[class="list-actions ng-scope"] #button-add:enabled')
            .waitForElementVisible('[class="BreadCrumb-item ng-scope ng-isolate-scope"] [href*="templates/job_template/"]:enabled')
            .pause(1000)
            .click('[class="list-actions ng-scope"] #button-add:enabled')
            .waitForElementVisible('#add-permissions-modal .Form-saveButton:enabled')
            .clearValue('#add-permissions-modal .SmartSearch-input')
            .setValue('#add-permissions-modal .SmartSearch-input', [`username.iexact:${data.user2.username}`, client.Keys.ENTER])
            .pause(1000)
            .waitForElementVisible(`#add-permissions-modal a[href$="${data.user2.id}"]:enabled`)
            .waitForElementVisible(`#add-permissions-modal [id="${data.user2.id}"] [type="checkbox"]:enabled`)
            .pause(1000)
            .click(`#add-permissions-modal [id="${data.user2.id}"] [type="checkbox"]:enabled`)            
            .waitForElementVisible('.AddPermissions-roleRemove:enabled')
            .click('#add-permissions-modal .select2-search__field')
            .setValue('#add-permissions-modal .select2-search__field', ["Read", client.Keys.ENTER])
            .waitForElementVisible('#add-permissions-modal .select2-selection__choice__remove')
            .click('#add-permissions-modal .Form-saveButton:enabled')
            .waitForSpinny()
            .pause(1000)
            .waitForElementVisible(`a[href$="${data.user2.id}"]:enabled`);
    },
    'test a template admin can not add permissions to a user in different org': client => {
            client
            .pause(1000)
            .waitForElementVisible('[class="list-actions ng-scope"] #button-add:enabled')
            .waitForElementVisible('[class="BreadCrumb-item ng-scope ng-isolate-scope"] [href*="templates/job_template/"]:enabled')
            .click('[class="list-actions ng-scope"] #button-add:enabled')
            .pause(1000)
            .waitForElementVisible('#add-permissions-modal .Form-saveButton:enabled')
            .clearValue('#add-permissions-modal .SmartSearch-input')
            .setValue('#add-permissions-modal .SmartSearch-input', [`username.iexact:${data.user3.username}`, client.Keys.ENTER])
            .pause(1000)
            .waitForElementPresent("#add-permissions-modal .TagComponent-name")
            .waitForElementPresent('#add-permissions-modal .List-searchNoResults');
    },
    'test a template admin can add permissions to the team he belongs to': client => {
            client
            .click('#teams_tab')
            .waitForElementPresent('.AddPermissions-footer .Form-saveButton:enabled')
            .clearValue('#AddPermissions-teams .SmartSearch-input')
            .setValue('#AddPermissions-teams .SmartSearch-input', [`name.iexact:${data.team1.name}`, client.Keys.ENTER])
            .pause(1000)
            .waitForElementPresent(`#AddPermissions-teams a[href$="${data.team1.id}"]:enabled`)
            .click(`#teams_table [id='${data.team1.id}'] [type="checkbox"]:enabled`)
            .pause(2000)
            //.click('#users_tab')
            //.pause(1000)
            .waitForElementVisible('#add-permissions-modal span li > input')
            .pause(2000)
            .click('#add-permissions-modal span li > input')
            .pause(1000)
            .setValue('#add-permissions-modal span li > input', ["Read", client.Keys.ENTER])
            .waitForElementVisible('#add-permissions-modal .select2-selection__choice__remove')
            .pause(1000)
            .click('#add-permissions-modal .Form-saveButton')
            .waitForSpinny()
            .pause(1000);
    },
    'test a template admin can add permissions to another team in the same org': client => {
            client
            .waitForElementVisible('[class="list-actions ng-scope"] #button-add:enabled')
            .waitForElementVisible('[class="BreadCrumb-item ng-scope ng-isolate-scope"] [href*="templates/job_template/"]:enabled')
            .click('[class="list-actions ng-scope"] #button-add:enabled')
            .pause(1000)
            .waitForElementVisible('#add-permissions-modal .Form-saveButton:enabled')
            .click('#teams_tab')
            .waitForElementPresent('.AddPermissions-footer .Form-saveButton:enabled')
            .clearValue('#AddPermissions-teams .SmartSearch-input')
            .setValue('#AddPermissions-teams .SmartSearch-input', [`name.iexact:${data.team2.name}`, client.Keys.ENTER])
            .pause(1000)
            .waitForElementPresent(`#AddPermissions-teams a[href$="${data.team2.id}"]:enabled`)
            .click(`#teams_table [id='${data.team2.id}'] [type="checkbox"]:enabled`)
            .pause(1000)
            .click('#users_tab')
            .pause(1000)
            .waitForElementVisible('.AddPermissions-roleRemove:enabled')
            .click('#add-permissions-modal .select2-search__field')
            .setValue('#add-permissions-modal .select2-search__field', ["Read", client.Keys.ENTER])
            .pause(1000)
            .click('#add-permissions-modal .Form-saveButton')
            .waitForSpinny()
            .pause(1000);

    },
    after: client => {
        client.end();
    }
};
