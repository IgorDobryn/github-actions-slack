const context = require("../context");
const { apiPostMessage } = require("../integration/slack-api");
const buildMessage = require("./build-message");
const core = require("@actions/core");

const jsonPretty = (data) => JSON.stringify(data, undefined, 2);

const postMessage = async () => {
  context.debug("debug: Before try");
  context.info("info: Before try");
  context.debugExtra("debugExtra: Before try");
  context.warning("warning: Before try");
  // try {
  const token = context.getRequired("slack-bot-user-oauth-access-token");
  const channels = context.getRequired("slack-channel");
  const text = context.getRequired("slack-text");

  context.debug("Prepare");

  const results = [];
  for (let channel of channels.split(",")) {
    channel = channel.trim();

    context.debug("Building the message");
    context.debug("Optional", optional());
    console.log("Building the message");
    console.info("Optional", optional());
    const payload = buildMessage(channel, text, optional());

    context.debug("Post Message PAYLOAD", payload);
    const result = await apiPostMessage(token, payload);
    context.debug("Post Message RESULT", result);

    results.push(result);
  }

  // To not break backward compatibility
  const resultAsJson = jsonPretty(results[0]);
  context.setOutput("slack-result", resultAsJson);

  const resultsAsJson = jsonPretty(results);
  context.setOutput("slack-results", resultsAsJson);
  // } catch (error) {
  //   context.setFailed(jsonPretty(error));
  // }
};

const tryParseJSON = (string) => {
  try {
    return JSON.parse(string);
  } catch (e) {
    return string;
  }
};

const optional = () => {
  let opt = {};

  const env = context.getEnv();
  Object.keys(env)
    .filter((key) => !!env[key])
    .filter((key) => key.toUpperCase().startsWith("INPUT_SLACK-OPTIONAL-"))
    .forEach((key) => {
      const slackKey = key.replace("INPUT_SLACK-OPTIONAL-", "").toLowerCase();
      opt[slackKey] = tryParseJSON(env[key]);
    });

  return opt;
};

module.exports = { postMessage };
