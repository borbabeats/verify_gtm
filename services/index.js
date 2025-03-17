const { checkDomain } = require("./domains/domainChecker");
const { monitoredDomains } = require("./config/config");

let domainStatus = {};

async function checkAllDomains() {
  console.log('Iniciando verificação dos domínios...');

  const domains = await monitoredDomains()

  for (const domain of domains) {
    domainStatus[domain] = await checkDomain(domain);
  }
  console.log(`[${new Date().toLocaleString()}] Verificação finalizada.`);
}


setInterval(checkAllDomains, 5 * 60 * 1000);
checkAllDomains();

module.exports = { checkAllDomains, domainStatus };