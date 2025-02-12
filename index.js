const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = 5000;

const monitoredDomains = [
  "https://avaliadordemusicas.com",
  "https://outrosite.com"
];

let domainStatus = {};

async function checkGTM(domain) {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    await page.setRequestInterception(true);
    let gtmLoaded = false;

    page.on("request", (request) => {
      const url = request.url();
      if (url.includes("googletagmanager.com/gtm.js") || url.includes("googletagmanager.com/gtag/js")) {
        gtmLoaded = true;
      }
    });
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36");

    await page.goto(domain, { waitUntil: "networkidle2", timeout: 10000 });

    domainStatus[domain] = {
      status: gtmLoaded ? "OK" : "GTM NÃO ENCONTRADO",
      lastChecked: new Date().toISOString()
    };

    console.log(`[${domain}] - GTM ${gtmLoaded ? "encontrado ✅" : "NÃO encontrado ❌"}`);
  } catch (error) {
    domainStatus[domain] = {
      status: "FALHA NA REQUISIÇÃO",
      error: error.message,
      lastChecked: new Date().toISOString()
    };
    console.error(`[${domain}] - Erro ao acessar: ${error.message}`);
  } finally {
    if (browser) await browser.close();
  }
}

// Verifica todos os domínios a cada 5 minutos
async function checkAllDomains() {
  for (const domain of monitoredDomains) {
    await checkGTM(domain);
  }
}
setInterval(checkAllDomains, 5 * 60 * 1000);
checkAllDomains(); // Executa na inicialização

// Endpoint para consultar o status do GTM nos domínios
app.get("/status", (req, res) => {
  res.json(domainStatus);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
