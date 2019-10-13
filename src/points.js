const axios = require('axios');
const debug = require('debug')('slash-command-template:ticket');
const qs = require('querystring');
const users = require('./users');

/*
 *  Send ticket creation confirmation via
 *  chat.postMessage to the user who created it
 */
const sendConfirmation = (points) => {
  axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: process.env.SLACK_POINTS_CHANNEL,
    // as_user: false,
    text: 'Points submitted!',
    attachments: JSON.stringify([
      {
        title: `Points submitted by ${points.userEmail}`,
        // Get this from the 3rd party helpdesk system
        // TODO: need to get the URL for the google sheet in here somehow
        // title_link: 'http://example.com',
        text: points.text,
        fields: [
          {
            title: 'Team Name',
            value: points.team,
            short: true,
          },
          {
            title: 'Number',
            value: points.number,
          },
          {
            title: 'Description',
            value: points.description || 'None provided',
          },
        ],
      },
    ]),
  })).then((result) => {
    debug('sendConfirmation: %o', result.data);
  }).catch((err) => {
    debug('sendConfirmation error: %o', err);
    console.error(err);
  });
};

// Create helpdesk ticket. Call users.find to get the user's email address
// from their user ID
const create = (userId, submission) => {
  const points = {};

  const fetchUserEmail = new Promise((resolve, reject) => {
    users.find(userId).then((result) => {
      debug(`Find user: ${userId}`);
      resolve(result.data.user.profile.email);
    }).catch((err) => { reject(err); });
  });

  fetchUserEmail.then((result) => {
    points.userId = userId;
    points.userEmail = result;
    points.number = submission.number;
    points.description = submission.description;
    points.team = submission.team;
    sendConfirmation(points);

    return points;
  }).catch((err) => { console.error(err); });
};

module.exports = { create, sendConfirmation };
