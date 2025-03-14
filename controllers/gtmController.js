const { domainStatus } = require("../services/index");

const getGTMStatus = (req, res) => {
  res.json(domainStatus);
};

module.exports = {
  getGTMStatus
};
