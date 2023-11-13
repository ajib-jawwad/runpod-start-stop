const crypto = require('crypto');
const qs = require('qs');
const axios = require('axios');
const App = require('@slack/bolt');

exports.initSlackClient = () => {
    const app = new App({
        token: process.env.SLACK_BOT_TOKEN,
        signingSecret: process.env.SLACK_SIGNING_SECRET
    });

    return app.client;
}

exports.replySlackToChannel = async (client, msg) => {
    const channelID = process.env.CHANNEL_ID;
    try {
        const res = await client.chat.postMessage({
            channel: channelID,
            text: msg
        });
        console.log(JSON.stringify(res));
    } catch (err) {
        console.log(JSON.stringify(err));
    }
}

exports.verifySignature = (req) => {
    const slackSignature = req.headers['x-slack-signature'];
    const requestBody = qs.stringify(req.body,{ format:'RFC1738' });
    const timestamp = req.headers['x-slack-request-timestamp'];

    let sigBasestring = 'v0=' + timestamp + ':' + requestBody;
    const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;

    let mySignature = 'v0=' + crypto.createHmac('sha256', slackSigningSecret).update(sigBasestring, 'utf8').digest('hex');

    return crypto.timingSafeEqual(Buffer.from(mySignature, 'utf8'),Buffer.from(slackSignature, 'utf8'));
}

exports.replyToSlackCommand = (msq, res_type, url) => {
    console.log('sent: ', msg);
    axios.post(url, {
        response_type: res_type == undefined ? "in_channel" : res_type,
        text: msg,
    })
}
