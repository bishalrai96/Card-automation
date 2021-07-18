const core = require('@actions/core');
const github = require('@actions/github');

try {
    const token = core.getInput('repo-token');
    const project = core.getInput('project');
    const column = core.getInput('column');
    const label = core.getInput('label');
    const octokit = github.getOctokit(token);
    // console.log("the github context ", github.context)

    // get url
    const { eventName, payload } = github.context;

    console.log("Labels!!", payload.issue.labels);

    console.log("eventName", eventName);
    console.log("payload", payload);
    console.log(typeof github.context);

    if (eventName !== "issues") {
        throw new Error("Only issues event accepting ath the moment");
    }

    // get required information for graphql query
    url = payload.issue.html_url;
    nodeId = payload.issue.node_id;

    

    get_which_projects_it_is_in_currently = `query { 
  resource(url:"${url}") {
  	... on Issue {
      projectCards {
      	nodes {
          project {
            name
          }
        }
      }
    }
  }
}`;



     
} catch (error) {
    console.log("failed but why ", error.message)
    core.setFailed(error.message)
}
