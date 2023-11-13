exports.slackRequestSchema = {
    action: {
        label: "action",
        type: "enum",
        values: ["on", "off"],
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
