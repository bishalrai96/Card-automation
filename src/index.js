const core = require('@actions/core');
const github = require('@actions/github');

try {
    async function run() {
        var removeLabels = ""
        const token = core.getInput('repo-token');
        const columnName = core.getInput('column');
        const label = core.getInput('label').split(",").map(label => label.trim());
        const octokit = github.getOctokit(token);
        const { eventName, payload } = github.context;
        removeLabels = core.getInput('remove-label');

        var repoUrl = payload.issue.repository_url;
        console.log("repo url", repoUrl);

        var labelIsPresent = false;
        console.log(removeLabels);
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
              issue: resource(url:"${url}") {
                ... on Issue {
                  id
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
                labels: resource(url: "${repoUrl}") {
                    ... on Repository {
                            labels(first: 10) {
                            nodes {
                                name
                                id
                            }
                        }
                    }
                }
            }`;

            
            const { issue, allLabels } = await octokit.graphql(get_which_projects_it_is_in_currently);
            console.log("---labels ",allLabels)
            console.log("---issue ", issue)
            var LabelIDPair = {}
            const labelID = issue.id;
            allLabels.labels.nodes.forEach(function (item) {
                LabelIDPair[item.name] = item.id; 
            })

            var LabelsToRemove = []

            console.log("Label ID Pair", LabelIDPair);
            var projectCards = issue.projectCards.nodes;
            var columnsID = {}
            
            for (const projectCard of projectCards) {
                columns = projectCard.project.columns.nodes;
                for (const col of columns) {
                    if (columnName === col.name) {
                        columnsID[projectCard.id] = col.id;
                    }
                }
            }

            if (Object.keys(columnsID).length == 0) {
                console.log(columnName + " does not match with any columns in the assigned project");
                return 
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

            for (const label of Labels) {
                if (LabelIDPair[label] === undefined) {
                    console.log(label + " is not available");
                } else {
                    removeLabel = `mutation {
                        removeLabelsFromLabelable(input: { labelableId: "${labelID}", labelIds: "${LabelIDPair[label]}" }) {
                            clientMutationId
                        }
                    }`
                    console.log("label removed " + label);
                }
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
