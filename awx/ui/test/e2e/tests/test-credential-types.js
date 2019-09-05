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
const namespace = `credential-types-${testID}`;
let data;

module.exports = {
    'login': client => {
        // initializeData();   
        client.login();
        client.waitForAngular();
    },
    'test that Credential Types appear on the lefthand nav bar': client => {
        client
            .waitForElementVisible('[ui-sref="credentialTypes"]:enabled')
            .click('[ui-sref="credentialTypes"]:enabled')
            .waitForElementVisible('[aw-tool-tip="Create a new credential type"][id="button-add"]:enabled')
            .pause(1000);
    },
    'test that Credential Type can be created and can refer to multiple files': client => {
        client   
            .click('[aw-tool-tip="Create a new credential type"][id="button-add"]:enabled')
            .waitForElementVisible('#credential_type_name:enabled')
            .setValue('#credential_type_name:enabled', [`${namespace}-multi-file`])
            .click('#cm-inputs-container [class="CodeMirror-scroll"]')
            .sendKeys('#cm-inputs-container textarea', client.Keys.ENTER)
            .sendKeys('#cm-inputs-container textarea', '{"fields": [{"id": "cert","label": "Certificate","type": "string"},{"id": "key","label": "Key","type": "string"}]}')           
            .pause(1000)
            .click('#cm-injectors-container [class="CodeMirror-scroll"]')
            .sendKeys('#cm-injectors-container textarea', client.Keys.ENTER)
            .sendKeys('#cm-injectors-container textarea', '{"file": {"template.cert_file": "[mycert]\n{{ cert }}","template.key_file": "[mykey]\n{{ key }}"},"env": {"MY_CERT_INI_FILE": "{{ tower.filename.cert_file }}","MY_KEY_INI_FILE": "{{ tower.filename.key_file }}"}}')
            .waitForElementVisible('#credential_type_save_btn:enabled')
            .click('#credential_type_save_btn:enabled')
            .pause(1000)
            .useXpath()
            .waitForElementVisible(`//*[@id="credential_types_table"]//a[text()="${namespace}-multi-file"]`)
            .useCss()
    },
    'test that incorrect input/injector configuration creates a warning': client => {
        client 
            .click('[aw-tool-tip="Create a new credential type"][id="button-add"]:enabled')
            .waitForElementVisible('#credential_type_name:enabled')
            .setValue('#credential_type_name:enabled', [`${namespace}-single-file`])
            .click('#cm-inputs-container [class="CodeMirror-scroll"]')
            .sendKeys('#cm-inputs-container textarea', client.Keys.ENTER)
            .sendKeys('#cm-inputs-container textarea', '{"fields": [{"id": "cert","label": "Certificate","type": "string"}]')           
            .pause(1000)
            .waitForElementVisible('#credential_type_save_btn:enabled')
            .click('#credential_type_save_btn:enabled')
            .waitForElementVisible('[id="alert-modal"] [id="alertHeader"]')
            .click('[id="alert-modal"] [id="alert_ok_btn"]:enabled')
            .pause(1000)
            .click('#cm-inputs-container [class="CodeMirror-scroll"]')
            .sendKeys('#cm-inputs-container textarea', '}')           
            .click('#cm-injectors-container [class="CodeMirror-scroll"]')
            .sendKeys('#cm-injectors-container textarea', client.Keys.ENTER)
            .sendKeys('#cm-injectors-container textarea', '{"file": {"template.cert_file": "[mycert]\n{{ cert }}"},"env": {"MY_CERT_INI_FILE": "{{ tower.filename.cert_file }}"}')
            .waitForElementVisible('#credential_type_save_btn:enabled')
            .click('#credential_type_save_btn:enabled')
            .waitForElementVisible('[id="alert-modal"] [id="alertHeader"]')
            .click('[id="alert-modal"] [id="alert_ok_btn"]:enabled')
            .pause(1000)
            .click('#cm-injectors-container [class="CodeMirror-scroll"]')
            .sendKeys('#cm-injectors-container textarea', '}')
            .pause(1000)
            .waitForElementVisible('#credential_type_save_btn:enabled')
            .click('#credential_type_save_btn:enabled')
            .pause(1000)
            .useXpath()
            .waitForElementVisible(`//*[@id="credential_types_table"]//a[text()="${namespace}-single-file"]`)
            .useCss()
            .pause(1000)
    },
    'test that the credential type can be sourced during the “New Credential” flows': client => {
        client 
        .navigateTo(`${AWX_E2E_URL}/#/credentials/add/`)
        .waitForElementVisible('#credential_name_group [type="text"]:enabled')
        .setValue('#credential_name_group [type="text"]', [`${namespace}`])
        .click('#credential_credential_type_group .at-InputLookup-button')
        .waitForElementVisible('#form-modal .SmartSearch-keyToggle')
        .clearValue('#form-modal .SmartSearch-input')
        .setValue('#form-modal .SmartSearch-input', [`name.iexact:${namespace}-multi-file`, client.Keys.ENTER])
        .pause(1000)
        .click('#form-modal [type="radio"]')
        .pause(500)
        .click('#form-modal .Lookup-save')
        .pause(500)
        .click('.at-Button--success')
        .pause(1000)
        .useXpath()
        .waitForElementVisible(`//*[@id="content-container"]/div[1]/div/div[3]/div/div[2]//a[text()="${namespace}"]`)
        .useCss()
    },
    after: client => {
        client.end();
    }
};
