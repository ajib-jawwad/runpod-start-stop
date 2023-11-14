const { initSlackClient, replySlackToChannel, replyToSlackCommand, verifySignature } = require("./slack/index.js")
const { slackRequestStartSchema, slackRequestStopSchema } = require("./slack/schema.js");
const Validator = require('fastest-validator');
const axios = require('axios');

const PAPERLESS_API_KEY = process.env.PAPERLESS_API_KEY;
const PLANOGRAM_API_KEY = process.env.PLANOGRAM_API_KEY;
const EKYC_API_KEY = process.env.EKYC_API_KEY;
const EXPLORATION_API_KEY = process.env.EXPLORATION_API_KEY;

exports.runpodStartStop = async (req, res) => {
    res.status(200).json({
        response_type: "in_channel",
        text: "Got it!"
    });

    const slackClient = initSlackClient();

    const response_url = req.body.response_url;

    if (await !verifySignature(req)) {
        return replyToSlackCommand(`FAILED: signature verification failed.`, 'in_channel', response_url);
    }

    const params = req.body.text.split(" ");
    const validator = new Validator();
    let slackRequestValidator = null;
    let slackRequest = {};
    slackRequest.action = params[0];
    slackRequest.platformID = params[1];
    slackRequest.podID = params[2];

    if (slackRequest.action == "on") {
        slackRequest.gpuCount = params[3];
        slackRequestValidator = validator.compile(slackRequestStartSchema);
    } else {
        slackRequestValidator = validator.compile(slackRequestStopSchema);
    }

    const resultSlackRequestValidator = slackRequestValidator(slackRequest);

    console.log(`INFO: request /runpod`, slackRequest);
    if (resultSlackRequestValidator == true)
        replyToSlackCommand('SUCCESS: request verified, processing request, estimated time required: 5m', 'ephemeral', response_url);
    else {
        replyToSlackCommand(`FAILED: ${resultSlackRequestValidator[0].message}`, 'ephemeral', response_url);
        return replyToSlackCommand(`FAILED: request verification failed, please check your Slack command again. \nFormat: [on|off] [ekyc|paperless|planogram] [pod ID] [GPU Count]`, 'in_channel', response_url);
    }
    
    let apiKey;
    switch (slackRequest.platformID) {
        case 'planogram':
            apiKey = PLANOGRAM_API_KEY;
            break;
        case 'paperless':
            apiKey = PAPERLESS_API_KEY;
            break;
        case 'ekyc':
            apiKey = EKYC_API_KEY;
            break;
        case 'exploration':
            apiKey = EXPLORATION_API_KEY;
            break;
        default:
            return replyToSlackCommand(`Please check Platform ID`, 'in_channel', response_url)
    }

    const url = `https://api.runpod.io/graphql?api_key=${apiKey}`;

    if (slackRequest.action === 'on') {
        const data = {
            query: `mutation { podResume(input: {podId: "${slackRequest.podID}", gpuCount: ${slackRequest.gpuCount} }) { id desiredStatus imageName env machineId machine { podHostId } }}`,
        };
        console.log(data);

        try {
            await axios.post(url, data);
            await replySlackToChannel(slackClient, `Pod ${slackRequest.podID} has been started.`, 'in_channel', response_url)
        } catch (err) {
            console.error(err);
            await replySlackToChannel(slackClient, `Error starting pod ${slackRequest.podID}`, 'in_channel', response_url)
        }
    } else if (slackRequest.action === 'off') {
        const data = {
            query: `mutation { podStop(input: {podId: "${slackRequest.podID}"}) { id desiredStatus}}`,
        };
        console.log(data);

        try {
            await axios.post(url, data);
            await replySlackToChannel(slackClient, `Pod ${slackRequest.podID} has been stopped.`, 'in_channel', response_url)
        } catch (err) {
            console.error(err);
            await replySlackToChannel(slackClient, `Error stoping pod ${slackRequest.podID}`, 'in_channel', response_url)
        }
    }
};
