const { domainStatus } = require("../services/index");


const getGTMStatus = (req, res) => {
  res.json(domainStatus);
  console.log('gtmController', domainStatus)
};


module.exports = {
  getGTMStatus,
};
