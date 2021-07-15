const core = require('@actions/core');
const github = require('@actions/github');

try {
    const token = core.getInput('repo-token');
    const project = core.getInput('project');
    const column = core.getInput('column');

	const octokit = new github.GitHub(token);
    console.log("the github context ", github.context)
    // with is not getting executed in
} catch (error) {
    console.log("failed but why ", error.message)
    core.setFailed(error.message)
}
