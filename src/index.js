const core = require('@actions/core');
const github = require('@actions/github');

try {
    const token = core.getInput('repo-token');
    const project = core.getInput('project');
    const column = core.getInput('column');
    const octokit = github.getOctokit(token);
    // console.log("the github context ", github.context)

    // get url
    const { eventName, payload } = githubContext;
    console.log("eventName", eventName);
    console.log("payload", payload);

    // with is not getting executed in
} catch (error) {
    console.log("failed but why ", error.message)
    core.setFailed(error.message)
}
