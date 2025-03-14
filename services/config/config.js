const fs = require("fs");

const monitoredDomains = JSON.parse(
  fs.readFileSync("monitoredDomains.json")
).domains;

module.exports = { monitoredDomains };