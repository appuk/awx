import uuid from 'uuid';

import {
    getJobTemplate
} from '../fixtures';

import {
    AWX_E2E_URL
} from '../settings';

import {
    patch,
    post
} from '../api';

const testID = uuid().substr(0, 8);
const namespace = `extra-vars-${testID}`;
let data;
const survey_spec = { "name": "", "description": "", "spec": [{"question_name": "survey1", "required": true, "type": "text","variable": "survey1", "default": "survey1"}]};

module.exports = {
    before: (client, done) => {
        const resources = [
        getJobTemplate(namespace+'1'),
        getJobTemplate(namespace+'2'),
        getJobTemplate(namespace+'3'),
        getJobTemplate(namespace+'4'),      
        ]
        Promise.all(resources)
        .then(([job_template1, job_template2, job_template3, job_template4]) => {
        data = { job_template1, job_template2, job_template3, job_template4 };
        post(`/api/v2/job_templates/${job_template1.id}/survey_spec/`, survey_spec);
        patch(`/api/v2/job_templates/${job_template1.id}/`, { "extra_vars": "---\ngit_branch: production",
        "ask_variables_on_launch": true, "survey_enabled": true});
        patch(`/api/v2/job_templates/${job_template2.id}/`, { "survey_enabled": true });
        post(`/api/v2/job_templates/${job_template2.id}/survey_spec/`, survey_spec);
        patch(`/api/v2/job_templates/${job_template3.id}/`, { "extra_vars": "---\ngit_branch: production",
        "ask_variables_on_launch": true});
        client
            .login()
            .waitForAngular()
            done();
            });
    },
    'test the schedules page for a job template that has ask_variables_on_launch set to true and has survey questions': client => {
        client
        .pause(1000)    
        .navigateTo(`${AWX_E2E_URL}/#/templates/job_template/${data.job_template1.id}/schedules/add`)
            .pause(1000)
            // the extra vars codemirror and the prompt button should be shown
            .waitForElementVisible('[for="Scheduler-extraVars"]')
            .waitForElementVisible('.CodeMirror-code [style="position: relative;"]:nth-of-type(2)')
            .waitForElementVisible('#schedule_prompt_btn:enabled')
            .pause(1000)
            .setValue('#schedulerName', [`${namespace}1`])
            .pause(1000)
            .click('#schedule_prompt_btn:enabled')
            .pause(1000)
            .waitForElementVisible('#prompt_survey_step #survey_question_0:enabled')
            .click('#prompt_cancel:enabled')
            .pause(1000)
            .click('#schedule_save_btn:enabled')
    },
    'test that after saving the schedule, it can be edited and the changes are reflected accordingly': client => {
        client
            .waitForElementVisible(`[href*="#/templates/job_template/${data.job_template1.id}/schedules/"]`)
            .pause(1000)
            .click('#edit-action:enabled')
            .pause(1000)
            .waitForElementVisible('#cm-extraVars-container [class="CodeMirror-scroll"]')
            .click('#cm-extraVars-container [class="CodeMirror-scroll"]')
            .sendKeys('#cm-extraVars-container textarea', 'release_version: 1.5')
            .pause(1000)
            .click('#schedule_save_btn:enabled')
            .pause(1000)
            .waitForElementVisible(`[href*="#/templates/job_template/${data.job_template1.id}/schedules/"]`)
            .pause(2000)
            .click(`[href*="#/templates/job_template/${data.job_template1.id}/schedules/"]`)
            .pause(1000)
            .waitForElementVisible('[for="Scheduler-extraVars"]')
            .waitForElementVisible('.CodeMirror-code [style="position: relative;"]:nth-of-type(3)')
    },     
    'test the schedules page for a job template that has ask_variables_on_launch set to false and has survey questions': client => {
        client
            .navigateTo(`${AWX_E2E_URL}/#/templates/job_template/${data.job_template2.id}/schedules/add`)
            .pause(1000)
            // the extra vars codemirror should not be visible but the prompt button should be
            .waitForElementNotVisible('[for="Scheduler-extraVars"]')
            .waitForElementVisible('#schedule_prompt_btn:enabled')
    },
    'test the schedules page for a job template that has ask_variables_on_launch set to true and no survey questions': client => {
        client
            .navigateTo(`${AWX_E2E_URL}/#/templates/job_template/${data.job_template3.id}/schedules/add`)
            .pause(1000)
            // the extra vars codemirror and the prompt button should be shown
            .waitForElementVisible('[for="Scheduler-extraVars"]')
            .waitForElementVisible('.CodeMirror-code [style="position: relative;"]:nth-of-type(2)')
            .waitForElementVisible('#schedule_prompt_btn:enabled')
    },
    'test the schedules page for a job template that has ask_variables_on_launch set to false and no survey questions': client => {
        client
            .navigateTo(`${AWX_E2E_URL}/#/templates/job_template/${data.job_template4.id}/schedules/add`)
            .pause(1000)
            // the extra vars codemirror and the prompt button should not be shown
            .waitForElementNotVisible('[for="Scheduler-extraVars"]')
            .waitForElementNotVisible('#schedule_prompt_btn:enabled')
    },
    after: client => {
        client.end();
    }
};