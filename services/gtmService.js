const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");

puppeteer.use(StealthPlugin());

const monitoredDomains = JSON.parse(fs.readFileSync("monitoredDomains.json")).domains;

let domainStatus = {};

async function checkGTM(domain) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"]
    });

    const page = await browser.newPage();

    let gtmLoaded = false;
    let gtmScriptExists = false;
    let gtmCode = null;
    let gtmLoadType = null;

    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (request.url().includes("googletagmanager.com/")) {
        gtmLoaded = true;
      }
      request.continue();
    });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    );

    await page.goto(domain, { waitUntil: "networkidle2", timeout: 60000 });

    gtmScriptExists = await page.evaluate(() => {
      return document.querySelectorAll('script[src*="googletagmanager.com"]').length > 0;
    });

    gtmCode = await page.evaluate(() => {
      const match = document.documentElement.innerHTML.match(/GTM-[A-Z0-9]+/);
      return match ? match[0] : null;
    });

    if (gtmScriptExists) {
      gtmLoadType = "Encontrado no HTML";
    } else if (gtmLoaded) {
      gtmLoadType = "Carregado via Requisição";
    } else {
      gtmLoadType = "GTM Não Encontrado";
    }

    domainStatus[domain] = {
      status: "OK",
      lastChecked: new Date().toISOString(),
      gtmInstalled: gtmScriptExists || gtmLoaded,
      gtmLoadType,
      gtmCode
    };

    console.log(`[${domain}] - GTM: ${gtmCode || "Não encontrado"} (${gtmLoadType})`);
  } catch (error) {
    domainStatus[domain] = {
      status: "ERRO",
      error: error.message,
      lastChecked: new Date().toISOString(),
      gtmInstalled: false,
      gtmLoadType: "Erro ao acessar a página",
      gtmCode: null
    };
    console.error(`[${domain}] - Erro: ${error.message}`);
  } finally {
    if (browser) await browser.close();
  }
}

async function checkAllDomains() {
  for (const domain of monitoredDomains) {
    await checkGTM(domain);
  }
}

setInterval(checkAllDomains, 5 * 60 * 1000);
checkAllDomains();

module.exports = {
  checkAllDomains,
  domainStatus
};
