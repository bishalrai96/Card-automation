const core = require('@actions/core');
const github = require('@actions/github');

try {
    const token = core.getInput('repo-token');
    const project = core.getInput('project');
    const column = core.getInput('column');

	const octokit = new github.GitHub(token);
	core.debug(github.context)

} catch (error) {
    core.setFailed(error.message)
}