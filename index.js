const express = require("express");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require('fs');
puppeteer.use(StealthPlugin());

const app = express();
const PORT = 5000;

// Carregar domínios monitorados do arquivo JSON
const monitoredDomains = JSON.parse(fs.readFileSync('monitoredDomains.json')).domains;

let domainStatus = {};

async function checkGTM(domain) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,  // Modo headless
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });

    const page = await browser.newPage();

    // Configurar a interceptação de requisições para monitorar o carregamento do GTM
    let gtmLoaded = false;
    let gtmScriptExists = false;
    let gtmCode = null;
    let gtmLoadType = null; // Variável para armazenar o tipo de carregamento do GTM

    // Interceptação de requisições de rede
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      const url = request.url();
      if (url.includes("googletagmanager.com/gtm.js") || url.includes("googletagmanager.com/gtag/js")) {
        gtmLoaded = true;  // Se a requisição for para o GTM, marcou que o GTM foi carregado
        request.continue();
      } else {
        request.continue();  // Permite outras requisições
      }
    });

    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36");

    await page.goto(domain, { waitUntil: 'networkidle2', timeout: 60000 });  // Timeout de 60 segundos

    // Verificar se o GTM está presente no HTML
    gtmScriptExists = await page.evaluate(() => {
      const gtmScripts = Array.from(document.querySelectorAll('script[src*="googletagmanager.com/gtm.js"]'));
      const gtmIframes = Array.from(document.querySelectorAll('iframe[src*="googletagmanager.com/ns.html"]'));
      return gtmScripts.length > 0 || gtmIframes.length > 0;
    });

    // Verificar se o GTM foi carregado dinamicamente via dataLayer
    const dataLayerExists = await page.evaluate(() => {
      if (window.dataLayer && Array.isArray(window.dataLayer)) {
        return true;
      }
      return false;
    });
    console.log(dataLayerExists)
    // Determinar o tipo de carregamento do GTM
    if (gtmScriptExists) {
      gtmCode = gtmScriptExists
      gtmLoadType = "Encontrado no HTML";
    } else if (gtmLoaded) {
      gtmLoadType = "Carregado via Requisição";
    } else if (dataLayerExists) {
      gtmLoadType = "dataLayer Existente (indica GTM Dinâmico)";
    } else {
      gtmLoadType = "GTM Não Encontrado";
    }

    domainStatus[domain] = {
      status: "OK",
      lastChecked: new Date().toISOString(),
      gtmInstalled: gtmScriptExists || gtmLoaded || dataLayerExists,
      gtmLoadType: gtmLoadType,
      gtmCode: gtmCode
  
    };

    // Log detalhado
    console.log(`[${domain}] - GTM Load Type: ${gtmLoadType}`);

  } catch (error) {
    domainStatus[domain] = {
      status: "FALHA NA REQUISIÇÃO",
      error: error.message,
      lastChecked: new Date().toISOString(),
      gtmInstalled: false,
      gtmLoadType: "Erro ao acessar a página",
      gtmCode: null
    };
    console.error(`[${domain}] - Erro ao acessar: ${error.message}`);
  } finally {
    if (browser) await browser.close();
  }
}

async function checkAllDomains() {
  for (const domain of monitoredDomains) {
    await checkGTM(domain);
  }
}

setInterval(checkAllDomains, 5 * 60 * 1000); // Verificar a cada 5 minutos
checkAllDomains(); // Verificar imediatamente ao iniciar

// Endpoint para consultar o status do GTM nos domínios
app.get("/status", (req, res) => {
  res.json(domainStatus);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
