import uuid from 'uuid';

import {
    getInventorySource,
    getJobTemplate,
    getProject,
    getWorkflowTemplate
} from '../fixtures';

import {
    AWX_E2E_URL,
} from '../settings';

let data;
const spinny = "//*[contains(@class, 'spinny')]";
const workflowVisualizerBtn = "//button[contains(@id, 'workflow_job_template_workflow_visualizer_btn')]";
const workflowSearchBar = "//input[contains(@class, 'SmartSearch-input')]";

const startNodeId = '1';
let initialJobNodeId;
let initialProjectNodeId;
let initialInventoryNodeId;
let newChildNodeId;
let leafNodeId;
const nodeAdd = "//*[contains(@class, 'WorkflowChart-nodeAddIcon')]";
const nodeRemove = "//*[contains(@class, 'WorkflowChart-nodeRemoveIcon')]";

// search bar for visualizer templates
const jobSearchBar = "//*[contains(@id, 'workflow-jobs-list')]//input[contains(@class, 'SmartSearch-input')]";

// dropdown bar which lets you select edge type
const edgeTypeDropdownBar = "//span[contains(@id, 'select2-workflow_node_edge-container')]";
const alwaysDropdown = "//li[contains(@id, 'select2-workflow_node_edge') and text()='Always']";
const successDropdown = "//li[contains(@id, 'select2-workflow_node_edge') and text()='On Success']";
const failureDropdown = "//li[contains(@id, 'select2-workflow_node_edge') and text()='On Failure']";
const linkEdgeTypeDropdownBar = "//span[contains(@id, 'select2-workflow_link_edge-container')]";
const linkAlwaysDropdown = "//li[contains(@id, 'select2-workflow_link_edge') and text()='Always']";
const linkSuccessDropdown = "//li[contains(@id, 'select2-workflow_link_edge') and text()='On Success']";
const linkFailureDropdown = "//li[contains(@id, 'select2-workflow_link_edge') and text()='On Failure']";
const nodeSelectButton = "//*[@id='workflow_maker_select_node_btn']";
const linkSelectButton = "//*[@id='workflow_maker_select_link_btn']";
const nodeCancelButton = "//*[@id='workflow_maker_cancel_node_btn']";
const deleteConfirmation = "//button[@ng-click='confirmDeleteNode()']";

const xPathNodeById = (id) => `//*[@id='node-${id}']`;
const xPathLinkById = (sourceId, targetId) => `//*[@id='link-${sourceId}-${targetId}']//*[contains(@class, 'WorkflowChart-linkPath')]`;
const xPathNodeByName = (name) => `//*[contains(@class, "WorkflowChart-nameText") and contains(text(), "${name}")]/..`;

module.exports = {
    before: (client, done) => {
        // Ensure deterministic state on retries
        const testID = uuid().substr(0, 8);
        const namespace = `test-actions-${testID}`;
        const resources = [
            getInventorySource(namespace),
            getJobTemplate(namespace),
            getProject(namespace),
            getWorkflowTemplate(namespace),
        ];

        Promise.all(resources)
            .then(([inventory, template, project, workflow]) => {
                data = { inventory, template, project, workflow };
                client
                    .login()
                    .waitForAngular()
                    .resizeWindow(1200, 1000)
                    .navigateTo(`${AWX_E2E_URL}/#/templates`, false)
                    .useXpath()
                    .waitForElementVisible(workflowSearchBar)
                    .setValue(workflowSearchBar, [`name.iexact:"${data.workflow.name}"`])
                    .click('//*[contains(@class, "SmartSearch-searchButton")]')
                    .waitForSpinny(true)
                    .click(`//a[text()="${namespace}-workflow-template"]`)
                    .waitForElementVisible(workflowVisualizerBtn)
                    .click(workflowVisualizerBtn)
                    .waitForSpinny(true);
                client.waitForElementVisible(xPathNodeByName(`${namespace}-job`));
                // Grab the ids of the nodes
                client.getAttribute(xPathNodeByName(`${namespace}-job`), 'id', (res) => {
                    initialJobNodeId = res.value.split('-')[1];
                });
                client.getAttribute(xPathNodeByName(`${namespace}-pro`), 'id', (res) => {
                    initialProjectNodeId = res.value.split('-')[1];
                });
                client.getAttribute(xPathNodeByName(`${namespace}-inv`), 'id', (res) => {
                    initialInventoryNodeId = res.value.split('-')[1];
                });
                done();
            });
    },
    'verify that any changes made to a WFJT creates a dialogue for warning unsaved changes': client => {
        client
            .useXpath()
            .findThenClick(xPathNodeById(startNodeId))
            .waitForElementPresent(edgeTypeDropdownBar)
            .findThenClick(edgeTypeDropdownBar)
            .waitForElementNotPresent(successDropdown)
            .waitForElementNotPresent(failureDropdown)
            .waitForElementPresent(alwaysDropdown)
            .click(nodeCancelButton)
            // Make sure that the animation finishes before moving on to the next test
            .pause(500);
    },
    'verify that the user can hit the EXIT button to navigate out of the WFJT without saving changes': client => {
        client
            .useXpath()
            .moveToElement(xPathLinkById(initialJobNodeId, initialInventoryNodeId), 20, 0, () => {
                client.waitForElementNotVisible(spinny);
                client.mouseButtonClick(0);
            })
            .waitForElementPresent(linkEdgeTypeDropdownBar)
            .findThenClick(linkEdgeTypeDropdownBar)
            .waitForElementPresent(linkSuccessDropdown)
            .waitForElementPresent(linkFailureDropdown)
            .waitForElementPresent(linkAlwaysDropdown)
            .findThenClick(linkSuccessDropdown)
            .click(linkSelectButton);
    },