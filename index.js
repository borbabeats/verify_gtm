const express = require("express");
const axios = require("axios");
const cors = require("cors");
const cheerio = require("cheerio");

const app = express();
const PORT = 5000;
app.use(cors());

const monitoredDomains = [
  "https://avaliadordemusicas.com",
  "https://outrosite.com"
];

let domainStatus = {};

async function checkGTM(domain) {
  try {
    const response = await axios.get(domain, { timeout: 5000 });
    const $ = cheerio.load(response.data);
    const scripts = $("script")
      .map((_, el) => $(el).attr("src"))
      .get();
      console.log('teste', scripts);
    const gtmLoaded = scripts.some(src => src && src.includes("googletagmanager.com/gtag/js"));
   
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
