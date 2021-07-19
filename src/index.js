const core = require('@actions/core');
const github = require('@actions/github');

try {
    async function run() {
        const token = core.getInput('repo-token');
        const project = core.getInput('project');
        const columnName = "Second";//core.getInput('column');
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
                      id
                      project {
                        name
                        columns(first: 100) {
              	            nodes {
                                name,
                                id
                            }
                        }
                      }
                      column {
                        id
                      }
                    }
                  }
                }
              }
            }`;
            console.log("query", get_which_projects_it_is_in_currently);

            const {resource} = await octokit.graphql(get_which_projects_it_is_in_currently); 
            
            var test = resource.projectCards.nodes;

            var projects = []
            for (const val of test) {
                projects.push(val.project.name);
            }
            
            var columnsID = {}
            
            for (const val of test) {
                columns = val.project.columns.nodes;
                for (const col of columns) {
                    if (columnName === col.name) {
                        columnsID[val.id] = col.id;
                    }
                }
                
            }
           
            console.log("test", columnsID);
            console.log("list of projects", projects)
            var Queries = []

            Object.keys(columnsID).forEach(function (key) {
                mutate_query = `mutation {
                  moveProjectCard(input: {
                    cardId: "${key}"
                    columnId: "${columnsID[key]}"
                    }) {clientMutationId}
                }`
                Queries.push(mutate_query);
            });
            for (const temp of Queries) {
                await octokit.graphql(temp);
            }
            // now push the card based on label
            
        } else {
            return "Ignoring because provided label does not match"
        }
    }
    run()
    
} catch (error) {
    console.log("failed but why ", error.message)
    core.setFailed(error.message)
}

async function moveCard(octokit, cardID, columnID) {
    await octokit.projects.moveCard({
        card_id: cardID,
        column_id: columnID
    })
}
