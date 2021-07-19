const core = require('@actions/core');
const github = require('@actions/github');

try {
    async function run() {
        const token = core.getInput('repo-token');
        const columnName = core.getInput('column');
        const label = core.getInput('label');
        const octokit = github.getOctokit(token);
        const { eventName, payload } = github.context;

        var labelIsPresent = false;

        if (payload.label.name == label) {
            labelIsPresent = true;
        }
        /*
        payload.issue.labels.forEach(item => {
            if (item.name === label) {
                labelIsPresent = true;
            }
        })
        */

        if (eventName !== "issues") {
            throw new Error("Only issues event accepting at the moment");
        }

        // get required information for graphql query
        url = payload.issue.html_url;

        if (labelIsPresent) {
            console.log(labelIsPresent);
            console.log(label);
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
            const {resource} = await octokit.graphql(get_which_projects_it_is_in_currently); 
            
            var projectCards = resource.projectCards.nodes;
            var columnsID = {}
            
            for (const projectCard of projectCards) {
                columns = projectCard.project.columns.nodes;
                for (const col of columns) {
                    if (columnName === col.name) {
                        columnsID[projectCard.id] = col.id;
                    }
                }
                
            }
           
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
            
        } else {
            console.log("Ignoring because provided label does not match");
        }
    }
    run()
    
} catch (error) {
    console.log("failed but why ", error.message)
    core.setFailed(error.message)
}
