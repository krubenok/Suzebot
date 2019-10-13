const axios = require("axios");
const debug = require("debug")("slash-command-template:ticket");
const qs = require("querystring");
const users = require("./users");
const MongoClient = require("mongodb").MongoClient;
const uri = process.env.MONGODB_URL;
const assert = require("assert");
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

/*
 *  Send ticket creation confirmation via
 *  chat.postMessage to the user who created it
 */
const sendConfirmation = points => {
    if (parseInt(points.number) <= 50) {
        // Log the bonus points in the database
        client.connect(err => {
            var pointObject = {
                team: points.team,
                points: parseInt(points.number, 10),
                description: points.description,
                committee: points.userEmail,
                timestamp: new Date(Date.now())
            };
            const BonusPointCollection = client
                .db(process.env.EVENT_NAME)
                .collection("BonusPoints");
            BonusPointCollection.aggregate(
                [
                    {
                        $match: {
                            committee: points.userEmail,
                            team: points.team
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
                ],
                function(err, cursor) {
                    assert.equal(err, null);
                    cursor.toArray(function(err, documents) {
                        try {
                            // console.log(documents[0].totalPoints);
                            if (
                                typeof documents[0] === "undefined" ||
                                documents[0].totalPoints <= 50 - points.number
                            ) {
                                BonusPointCollection.aggregate(
                                    [
                                        {
                                            $match: {
                                                committee: points.userEmail
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
                                    ],
                                    function(err, cursor) {
                                        assert.equal(err, null);
                                        cursor.toArray(function(
                                            err,
                                            documents
                                        ) {
                                            try {
                                                // console.log(
                                                //     documents[0].totalPoints
                                                // );
                                                if (
                                                    typeof documents[0] ===
                                                        "undefined" ||
                                                    documents[0].totalPoints <=
                                                        200 - points.number
                                                ) {
                                                    BonusPointCollection.insertOne(
                                                        pointObject,
                                                        function(err, res) {
                                                            if (err) throw err;
                                                            console.log(
                                                                "1 document inserted"
                                                            );
                                                        }
                                                    );
                                                    client.close();
                                                    // Post the confirmation message in the slack channel.
                                                    axios
                                                        .post(
                                                            "https://slack.com/api/chat.postMessage",
                                                            qs.stringify({
                                                                token:
                                                                    process.env
                                                                        .SLACK_ACCESS_TOKEN,
                                                                channel:
                                                                    process.env
                                                                        .SLACK_POINTS_CHANNEL,
                                                                // as_user: false,
                                                                text:
                                                                    "Points submitted!",
                                                                attachments: JSON.stringify(
                                                                    [
                                                                        {
                                                                            title: `Points submitted by ${points.userEmail}`,
                                                                            text:
                                                                                points.text,
                                                                            fields: [
                                                                                {
                                                                                    title:
                                                                                        "Team Name",
                                                                                    value:
                                                                                        points.team,
                                                                                    short: true
                                                                                },
                                                                                {
                                                                                    title:
                                                                                        "Number",
                                                                                    value:
                                                                                        points.number
                                                                                },
                                                                                {
                                                                                    title:
                                                                                        "Description",
                                                                                    value:
                                                                                        points.description ||
                                                                                        "None provided"
                                                                                }
                                                                            ]
                                                                        }
                                                                    ]
                                                                )
                                                            })
                                                        )
                                                        .then(result => {
                                                            debug(
                                                                "sendConfirmation: %o",
                                                                result.data
                                                            );
                                                        })
                                                        .catch(err => {
                                                            debug(
                                                                "sendConfirmation error: %o",
                                                                err
                                                            );
                                                            console.error(err);
                                                        });
                                                } else {
                                                    {
                                                        axios
                                                            .post(
                                                                "https://slack.com/api/chat.postMessage",
                                                                qs.stringify({
                                                                    token:
                                                                        process
                                                                            .env
                                                                            .SLACK_ACCESS_TOKEN,
                                                                    channel:
                                                                        process
                                                                            .env
                                                                            .SLACK_POINTS_CHANNEL,
                                                                    text:
                                                                        "Error Submitting Points! You've already give out your daily maximum points!.",
                                                                    response_type:
                                                                        "ephemeral"
                                                                })
                                                            )
                                                            .then(result => {
                                                                debug(
                                                                    "sendConfirmation: %o",
                                                                    result.data
                                                                );
                                                            })
                                                            .catch(err => {
                                                                debug(
                                                                    "sendConfirmation error: %o",
                                                                    err
                                                                );
                                                                console.error(
                                                                    err
                                                                );
                                                            });
                                                    }
                                                }
                                            } catch (error) {
                                                console.error("No points yet.");
                                                console.error(error);
                                            }
                                        });
                                    }
                                );
                            } else {
                                {
                                    axios
                                        .post(
                                            "https://slack.com/api/chat.postMessage",
                                            qs.stringify({
                                                token:
                                                    process.env
                                                        .SLACK_ACCESS_TOKEN,
                                                channel:
                                                    process.env
                                                        .SLACK_POINTS_CHANNEL,
                                                text:
                                                    "Error Submitting Points! You've already given this team the maximum allowed points for the day.",
                                                response_type: "ephemeral"
                                            })
                                        )
                                        .then(result => {
                                            debug(
                                                "sendConfirmation: %o",
                                                result.data
                                            );
                                        })
                                        .catch(err => {
                                            debug(
                                                "sendConfirmation error: %o",
                                                err
                                            );
                                            console.error(err);
                                        });
                                }
                            }
                        } catch (error) {
                            console.error("No points yet.");
                            console.error(error);
                        }
                    });
                }
            );
        });
    } else {
        axios
            .post(
                "https://slack.com/api/chat.postMessage",
                qs.stringify({
                    token: process.env.SLACK_ACCESS_TOKEN,
                    channel: process.env.SLACK_POINTS_CHANNEL,
                    text: "Error Submitting Points! Invalid data.",
                    response_type: "ephemeral"
                })
            )
            .then(result => {
                debug("sendConfirmation: %o", result.data);
            })
            .catch(err => {
                debug("sendConfirmation error: %o", err);
                console.error(err);
            });
    }
};

// Create helpdesk ticket. Call users.find to get the user's email address
// from their user ID
const create = (userId, submission) => {
    const points = {};

    const fetchUserEmail = new Promise((resolve, reject) => {
        users
            .find(userId)
            .then(result => {
                debug(`Find user: ${userId}`);
                resolve(result.data.user.profile.email);
            })
            .catch(err => {
                reject(err);
            });
    });

    fetchUserEmail
        .then(result => {
            points.userId = userId;
            points.userEmail = result;
            points.number = submission.number;
            points.description = submission.description;
            points.team = submission.team;
            sendConfirmation(points);

            return points;
        })
        .catch(err => {
            console.error(err);
        });
};

module.exports = { create, sendConfirmation };
