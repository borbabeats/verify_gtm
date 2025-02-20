const { domainStatus } = require("../services/gtmService");

const getGTMStatus = (req, res) => {
  res.json(domainStatus);
};

module.exports = {
  getGTMStatus
};
