const { launchBrowser, closeBrowser } = require("../browser/browser");
const { checkGTM } = require("../gtm/gtmChecker");
const { checkConverteAI } = require("../converteai/converteaiChecker");
const { checkCheckoutLinks } = require("../checkout/checkoutChecker");

async function checkDomain(domain) {
  let browser;

  try {
    browser = await launchBrowser();
    const page = await browser.newPage();
    const gtmStatus = await checkGTM(page, domain);
    const converteAIStatus = await checkConverteAI(page, domain);
    const checkoutStatus = await checkCheckoutLinks(page, domain);
    
    return {
      status: "OK",
      lastChecked: new Date().toISOString(),
      ...gtmStatus,
      ...converteAIStatus,
      ...checkoutStatus,
    };
  } catch (error) {
    return {
      status: "ERRO",
      error: error.message,
      lastChecked: new Date().toISOString(),
      gtmInstalled: false,
      gtmLoadType: "Erro ao acessar a página",
      gtmCode: null,
      converteAIInstalled: false,
      pv: null,
      pve: null,
      pva: null,
      pvb: null,
      hasABTest: null,
      checkoutLinkFound: false,
      checkoutLinkPV: null,
      checkoutLinkPVE: null,
      checkoutLinkPVA: null,
      checkoutLinkPVB: null,
    };
  } finally {
    await closeBrowser(browser);
  }
}

module.exports = { checkDomain };