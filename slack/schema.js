exports.slackRequestStartSchema = {
    action: {
        label: "action",
        type: "enum",
        values: ["on"],
        lowercase: true
    },

    platformID: {
        label: "Plaform ID",
        type: "enum",
        values: ["paperless", "ekyc", "planogram", "exploration"]
    },

    podID: {
        label: "pod ID",
        type: "string"
    },

    gpuCount: {
        label: "GPU Count",
        type: "string"
    }
}

exports.slackRequestStopSchema = {
    action: {
        label: "action",
        type: "enum",
        values: ["off"],
        lowercase: true
    },

    platformID: {
        label: "Plaform ID",
        type: "enum",
        values: ["paperless", "ekyc", "planogram", "exploration"]
    },

    podID: {
        label: "pod ID",
        type: "string"
    }
}
