const core = require('@actions/core');
const github = require('@actions/github');

try {
    async function run() {
        var removeLabels = ""
        const token = core.getInput('repo-token');
        const columnName = core.getInput('column');
        const label = core.getInput('label');
        const octokit = github.getOctokit(token);
        const { eventName, payload } = github.context;
        removeLabels = core.getInput('remove-label').split(",").map(label => label.trim());

        if (eventName !== "issues") {
            throw new Error("Only issues event accepting at the moment");
        }

        // get required information for graphql query
        url = payload.issue.html_url;

        if (payload.label.name == label) {
            console.log(labelIsPresent);
            console.log(label);
            get_which_projects_it_is_in_currently = `query { 
              resource(url:"${url}") {
                ... on Issue {
                  id
                  repository {
                    url
                  }
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
            var LabelIDPair = {}
            const labelID = resource.id;
            var repoUrl = resource.repository.url;

            var labelsQuery = `query {               
                        resource(url: "${repoUrl}") {
                        ... on Repository {
                                labels(first: 100) {
                                nodes {
                                    name
                                    id
                                }
                            }
                        }
                    }
                }`

            var allLabels = await octokit.graphql(labelsQuery);


            allLabels.resource.labels.nodes.forEach(function (item) {
                LabelIDPair[item.name] = item.id;
            })


            console.log("Label ID Pair", LabelIDPair);
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

            if (Object.keys(columnsID).length == 0) {
                console.log(columnName + " does not match with any columns in the assigned project");
                return 
            }

            mutationQueryRemoveLabels(octokit, columnsID);


            for (const label of removeLabels) {
                if (LabelIDPair[label] === undefined) {
                    console.log(label + " is not available");
                } else {
                    removeLabel = `mutation {
                        removeLabelsFromLabelable(input: { labelableId: "${labelID}", labelIds: "${LabelIDPair[label]}" }) {
                            clientMutationId
                        }
                    }`
                    await octokit.graphql(removeLabel);
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

async function mutationQueryRemoveLabels(octokit, columnsID) {
    Object.keys(columnsID).forEach(async function (key) {
        mutate_query = `mutation {
                  moveProjectCard(input: {
                    cardId: "${key}"
                    columnId: "${columnsID[key]}"
                    }) {clientMutationId}
                }`
        await octokit.graphql(temp);
    });
}
