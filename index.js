// `cp _env .env` then modify it
// See https://github.com/motdotla/dotenv
const config = require("dotenv").config().parsed;
// Overwrite env variables anyways
for (const k in config) {
    process.env[k] = config[k];
}

const MongoClient = require("mongodb").MongoClient;
const uri = process.env.MONGODB_URL;

const { LogLevel } = require("@slack/logger");
const logLevel = process.env.SLACK_LOG_LEVEL || LogLevel.DEBUG;

const { App, ExpressReceiver } = require("@slack/bolt");
// Manually instantiate to add external routes afterwards
const receiver = new ExpressReceiver({
    signingSecret: process.env.SLACK_SIGNING_SECRET
});
const app = new App({
    logLevel: logLevel,
    token: process.env.SLACK_BOT_TOKEN,
    receiver: receiver
});

var team_points;
var committee_points;

// ---------------------------------------------------------------
// Start coding here..
// see https://slack.dev/bolt/

// https://api.slack.com/apps/{APP_ID}/event-subscriptions
app.event("app_mention", ({ logger, event, say }) => {
    logger.debug(
        "app_mention event payload:\n\n" + JSON.stringify(event, null, 2) + "\n"
    );
    say({
        text: `:wave: <@${event.user}> Hi there!`
    });
});

// https://api.slack.com/apps/{APP_ID}/slash-commands
// https://api.slack.com/apps/{APP_ID}/interactive-messages
app.command("/points", ({ logger, client, ack, body, context }) => {
    client.views
        .open({
            token: context.botToken,
            trigger_id: body.trigger_id,
            // Block Kit Builder - http://j.mp/bolt-starter-modal-json
            view: {
                type: "modal",
                callback_id: "task-modal",
                private_metadata: JSON.stringify(body), // Remove this when pasting this in Block Kit Builder
                title: {
                    type: "plain_text",
                    text: "Award some bonus points!",
                    emoji: true
                },
                submit: {
                    type: "plain_text",
                    text: "Submit",
                    emoji: true
                },
                close: {
                    type: "plain_text",
                    text: "Cancel",
                    emoji: true
                },
                blocks: [
                    {
                        type: "input",
                        block_id: "input-team",
                        element: {
                            action_id: "input",
                            type: "static_select",
                            placeholder: {
                                type: "plain_text",
                                emoji: true,
                                text: "Select a team"
                            },
                            options: [
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "Arts 1"
                                    },
                                    value: "Arts 1"
                                },
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "Arts 2"
                                    },
                                    value: "Arts 2"
                                },
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "Arts 3"
                                    },
                                    value: "Arts 3"
                                },
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "Arts 4"
                                    },
                                    value: "Arts 4"
                                },
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "Arts 5"
                                    },
                                    value: "Arts 5"
                                },
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "Education 1"
                                    },
                                    value: "Education 1"
                                },
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "Education 2"
                                    },
                                    value: "Education 2"
                                },
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "Engineering"
                                    },
                                    value: "Engineering"
                                },
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "Law"
                                    },
                                    value: "Law"
                                },
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "Management 1"
                                    },
                                    value: "Management 1"
                                },
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "Management 2"
                                    },
                                    value: "Management 2"
                                },
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "Medicine"
                                    },
                                    value: "Medicine"
                                },
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "Music"
                                    },
                                    value: "Music"
                                },
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "PTOT"
                                    },
                                    value: "PTOT"
                                },
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "Science 1"
                                    },
                                    value: "Science 1"
                                },
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "Science 2"
                                    },
                                    value: "Science 2"
                                }
                            ]
                        },
                        label: {
                            type: "plain_text",
                            text: "Team",
                            emoji: true
                        }
                    },
                    {
                        type: "input",
                        block_id: "input-points",
                        element: {
                            type: "static_select",
                            action_id: "input",
                            placeholder: {
                                type: "plain_text",
                                emoji: true,
                                text: "Points"
                            },
                            options: [
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "5"
                                    },
                                    value: "5"
                                },
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "10"
                                    },
                                    value: "10"
                                },
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "15"
                                    },
                                    value: "15"
                                },
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "20"
                                    },
                                    value: "20"
                                },
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "25"
                                    },
                                    value: "25"
                                },
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "30"
                                    },
                                    value: "30"
                                },
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "35"
                                    },
                                    value: "35"
                                },
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "40"
                                    },
                                    value: "40"
                                },
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "45"
                                    },
                                    value: "45"
                                },
                                {
                                    text: {
                                        type: "plain_text",
                                        text: "50"
                                    },
                                    value: "50"
                                }
                            ]
                        },
                        label: {
                            type: "plain_text",
                            text: "How many points",
                            emoji: true
                        }
                    },
                    {
                        type: "input",
                        block_id: "input-description",
                        element: {
                            action_id: "input",
                            type: "plain_text_input",
                            multiline: true
                        },
                        label: {
                            type: "plain_text",
                            text: "Description",
                            emoji: true
                        }
                    }
                ]
            }
        })
        .then(res => {
            logger.debug(
                "views.open response:\n\n" + JSON.stringify(res, null, 2) + "\n"
            );
            ack();
        })
        .catch(e => {
            logger.error(
                "views.open error:\n\n" + JSON.stringify(e, null, 2) + "\n"
            );
            ack(`:x: Failed to open a modal due to *${e.code}* ...`);
        });
});

app.view("task-modal", async ({ logger, body, ack }) => {
    logger.debug(
        "view_submission view payload:\n\n" +
            JSON.stringify(body.view, null, 2) +
            "\n"
    );

    const committeee = JSON.parse(body.view.private_metadata).user_name;
    const stateValues = body.view.state.values;
    const team = stateValues["input-team"]["input"].selected_option.value;
    const points = parseInt(
        stateValues["input-points"]["input"].selected_option.value
    );
    const description = stateValues["input-description"]["input"].value;

    var pointObject = {
        team: team,
        points: points,
        description: description,
        committee: committeee,
        timestamp: new Date(Date.now())
    };

    var today = new Date();

    MongoClient.connect(
        uri,
        { useNewUrlParser: true, useUnifiedTopology: true },
        (err, client) => {
            if (err) throw err;

            const BonusPointCollection = client
                .db(process.env.EVENT_NAME)
                .collection("BonusPoints");

            let team_agg = [
                {
                    $match: {
                        committee: pointObject.committee,
                        team: pointObject.team,
                        timestamp: {
                            $gte: new Date(
                                today.getFullYear(),
                                today.getMonth(),
                                today.getDate() - 1,
                                10,
                                0,
                                0
                            )
                        }
                    }
                },
                {
                    $group: {
                        _id: "$team",
                        totalPoints: {
                            $sum: "$points"
                        }
                    }
                }
            ];

            BonusPointCollection.aggregate(team_agg)
                .toArray()
                .then(sum => {
                    console.log("HERE1");
                    if (sum.length == 0) {
                        team_points = 0;
                    } else {
                        team_points = sum[0].totalPoints + pointObject.points;
                    }
                    console.log(sum);
                    console.log(team_points);
                })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    client.close();
                });

            let committee_agg = [
                {
                    $match: {
                        committee: pointObject.committee,
                        timestamp: {
                            $gte: new Date(
                                today.getFullYear(),
                                today.getMonth(),
                                today.getDate() - 1,
                                10,
                                0,
                                0
                            )
                        }
                    }
                },
                {
                    $group: {
                        _id: "$committee",
                        totalPoints: {
                            $sum: "$points"
                        }
                    }
                }
            ];

            BonusPointCollection.aggregate(committee_agg)
                .toArray()
                .then(sum => {
                    console.log("HERE2");
                    if (sum.length == 0) {
                        committee_points = 0;
                    } else {
                        committee_points =
                            sum[0].totalPoints + pointObject.points;
                    }
                    console.log(sum);
                    console.log(committee_points);
                })
                .catch(err => {
                    console.log(err);
                })
                .finally(() => {
                    client.close();
                    const command = JSON.parse(body.view.private_metadata);

                    // Cannot use respond here as the response_url is not given here
                    if (team_points >= 50 || committee_points >= 150) {
                        postViaResponseUrl(
                            command.response_url, // available for 30 minutes
                            {
                                response_type: "ephemeral", // or "in_channel" || "ephemeral"
                                text: "Bonus points failed",
                                // Block Kit Builder - http://j.mp/bolt-starter-msg-json
                                blocks: [
                                    {
                                        type: "section",
                                        text: {
                                            type: "mrkdwn",
                                            text:
                                                "*You've already given too many points for the day or to this team!* Sad. :cry:"
                                        }
                                    },
                                    {
                                        type: "section",
                                        fields: [
                                            {
                                                type: "mrkdwn",
                                                text: `*Team:*\n${team}`
                                            },
                                            {
                                                type: "mrkdwn",
                                                text: `*Points:*\n${points}`
                                            },
                                            {
                                                type: "mrkdwn",
                                                text: `*Description:*\n${description}`
                                            },
                                            {
                                                type: "mrkdwn",
                                                text: `*Committee:*\n${committeee}`
                                            },
                                            {
                                                type: "mrkdwn",
                                                text: `*(Attempted) Points to this team from you today:*\n${team_points}        `
                                            },
                                            {
                                                type: "mrkdwn",
                                                text: `*Your (attemtped) points awarded today:*\n${committee_points}`
                                            }
                                        ]
                                    }
                                ]
                            }
                        );
                        ack();
                    } else {
                        postViaResponseUrl(
                            command.response_url, // available for 30 minutes
                            {
                                response_type: "in_channel", // or "in_channel" || "ephemeral"
                                text: "New bonus points!",
                                // Block Kit Builder - http://j.mp/bolt-starter-msg-json
                                blocks: [
                                    {
                                        type: "section",
                                        text: {
                                            type: "mrkdwn",
                                            text:
                                                "*Your points were successfully recorded! :rocket:*"
                                        }
                                    },
                                    {
                                        type: "section",
                                        fields: [
                                            {
                                                type: "mrkdwn",
                                                text: `*Team:*\n${team}`
                                            },
                                            {
                                                type: "mrkdwn",
                                                text: `*Points:*\n${points}`
                                            },
                                            {
                                                type: "mrkdwn",
                                                text: `*Description:*\n${description}`
                                            },
                                            {
                                                type: "mrkdwn",
                                                text: `*Committee:*\n${committeee}`
                                            },
                                            {
                                                type: "mrkdwn",
                                                text: `*Points to this team from you today:*\n${team_points}        `
                                            },
                                            {
                                                type: "mrkdwn",
                                                text: `*Your points awarded today:*\n${committee_points}`
                                            }
                                        ]
                                    }
                                ]
                            }
                        );
                        ack();
                        MongoClient.connect(
                            uri,
                            { useNewUrlParser: true, useUnifiedTopology: true },
                            (err, client) => {
                                if (err) throw err;

                                const BonusPointCollection = client
                                    .db(process.env.EVENT_NAME)
                                    .collection("BonusPoints");

                                BonusPointCollection.insertOne(pointObject)
                                    .then(pointObject => {
                                        console.log("Points Inserted");
                                        console.log(pointObject);
                                    })
                                    .catch(err => {
                                        console.log(err);
                                    })
                                    .finally(() => {
                                        client.close();
                                    });
                            }
                        );
                    }
                });
        }
    );

    // Save the input to somewhere
    logger.info(
        `Valid response:\nteam: ${team}\npoints: ${points}\ndescription: ${description}\nCommitteee: ${committeee}`
    );
});

// ---------------------------------------------------------------

// Utility to post a message using response_url
const axios = require("axios");
function postViaResponseUrl(responseUrl, response) {
    return axios.post(responseUrl, response);
}

// Request dumper middleware for easier debugging
if (process.env.SLACK_REQUEST_LOG_ENABLED === "1") {
    app.use(args => {
        const copiedArgs = JSON.parse(JSON.stringify(args));
        copiedArgs.context.botToken = "xoxb-***";
        if (copiedArgs.context.userToken) {
            copiedArgs.context.userToken = "xoxp-***";
        }
        copiedArgs.client = {};
        copiedArgs.logger = {};
        args.logger.debug(
            "Dumping request data for debugging...\n\n" +
                JSON.stringify(copiedArgs, null, 2) +
                "\n"
        );
        args.next();
    });
}

receiver.app.get("/", (_req, res) => {
    res.send("Your Bolt ⚡️ App is running!");
});

(async () => {
    await app.start(process.env.PORT || 3000);
    console.log("⚡️ Bolt app is running!");
})();
