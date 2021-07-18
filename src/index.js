const core = require('@actions/core');
const github = require('@actions/github');

try {
    async function run() {
        const token = core.getInput('repo-token');
        const project = core.getInput('project');
        const column = core.getInput('column');
        const label = core.getInput('label');
        const octokit = github.getOctokit(token);
        // console.log("the github context ", github.context)
        // get url
        const { eventName, payload } = github.context;

        var labelIsPresent = true;


        payload.issue.labels.forEach(item => {
            if (item.name === label) {
                labelIsPresent = true;
            }
        })



        //console.log("eventName", eventName);
        //console.log("payload", payload);
        //console.log(typeof github.context);

        if (eventName !== "issues") {
            throw new Error("Only issues event accepting ath the moment");
        }

        // get required information for graphql query
        url = payload.issue.html_url;
        nodeId = payload.issue.node_id;


        if (labelIsPresent) {
            console.log("before");
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
            console.log("query", get_which_projects_it_is_in_currently);

            const {resource} = await octokit.graphql(get_which_projects_it_is_in_currently); 
            console.log("test", resource.projectCards.nodes);
            var test = resource.projectCards.nodes;
            var list_of_projects = resource.projectCards.nodes.map(node => {
                node.project.name;
                console.log("inside", node);
                console.log("inside", node.project);
                console.log("inside", node.project.name);
                console.log("\n");
            });
            console.log("list of projects", list_of_projects)
            
        } else {
            return "Ignoring because provided label does not match"
        }
    }
    run()
    
} catch (error) {
    console.log("failed but why ", error.message)
    core.setFailed(error.message)
}
