const core = require('@actions/core');
const github = require('@actions/github');

try {
    const token = core.getInput('repo-token');
    const project = core.getInput('project');
    const column = core.getInput('column');
    const octokit = github.getOctokit(token);
    // console.log("the github context ", github.context)

    // get name of event and payload
    const { eventName, payload } = github.context;

    if (eventName !== "issues") {
        throw new Error("Only issues event accepting ath the moment");
    } 

    // get required information for graphql query
    url = payload.issue.html_url;
    nodeId = payload.issue.node_id;


     
} catch (error) {
    console.log("failed but why ", error.message)
    core.setFailed(error.message)
}
