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
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu"],
    });

    const page = await browser.newPage();

    let gtmLoaded = false;
    let gtmLoadType = null;

    let converteAIFound = false;
    let converteAIRequests = {};

    let currentPagePathname = "";  

    // Intercepta as requisições para verificar o carregamento do GTM
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      request.continue();
    });

    page.on("response", (response) => {
      const url = response.url();

      if (
        url.includes("googletagmanager.com/gtm.js") &&
        response.ok()
      ) {
        gtmLoaded = true;
      }

      // Verifica as requisições do ConverteAI e as agrupa por pathname da página
      if (url.includes("https://scripts.converteai.net/817bd58d-9ef6-4339-97a6-a374233fe748/players/")) {
        converteAIFound = true;

        // Agrupa as requisições do ConverteAI pelo pathname da página atual onde o script foi encontrado
        if (!converteAIRequests[currentPagePathname]) {
          converteAIRequests[currentPagePathname] = [];
        }

        converteAIRequests[currentPagePathname].push(url);
        console.log(`ConverteAI request found on page: ${currentPagePathname}`);
      }
    });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
    );

    // Acessa o domínio com os pathnames /pv, /pve, /pva, /pvb
    await page.goto(domain, { waitUntil: "networkidle2", timeout: 60000 });

    // Função para introduzir um delay, se necessário
    function delay(time) {
      return new Promise(function(resolve) {
        setTimeout(resolve, time);
      });
    }

    // Verifica a presença do script do GTM no HTML
    const gtmScriptExists = await page.evaluate(() => {
      return (
        document.querySelectorAll('script[src*="googletagmanager.com/gtm.js"]').length > 0
      );
    });

    // Procura por qualquer ocorrência de GTM-ID no HTML
    const gtmCode = await page.evaluate(() => {
      const matches = document.documentElement.innerHTML.match(/GTM-[A-Z0-9]+/g);
      return matches ? matches[0] : null;
    });

    // Define o tipo de carregamento do GTM
    if (gtmScriptExists && gtmLoaded) {
      gtmLoadType = "Encontrado no HTML e Carregado via Requisição";
    } else if (gtmScriptExists && !gtmLoaded) {
      gtmLoadType = "Encontrado no HTML (sem confirmação de carregamento)";
    } else if (!gtmScriptExists && gtmLoaded) {
      gtmLoadType = "Carregado via Requisição (não encontrado no HTML)";
    } else {
      gtmLoadType = "GTM Não Encontrado";
    }

    const pathnames = ["/pv", "/pve", "/pva", "/pvb"];
    for (const pathname of pathnames) {
      const fullUrl = domain + pathname;
      console.log(`Verificando: ${fullUrl}`);

      await page.goto(fullUrl, { waitUntil: "networkidle2", timeout: 60000 });

      await delay(4000);

      // Armazena o pathname da página atual
      currentPagePathname = pathname;

      if (converteAIFound) {
        console.log(`[${domain}] - ConverteAI: Encontrado em ${Object.keys(converteAIRequests).length} requisições`);
        for (const p in converteAIRequests) {
          console.log(`${pathname}: ${p}`);
          converteAIRequests[p].forEach((req) => console.log(req));
        }
      } else {
        console.log(`[${domain}] - ConverteAI: Não encontrado`);
      }
    }

    // Salva o status do domínio
    domainStatus[domain] = {
      status: "OK",
      lastChecked: new Date().toISOString(),
      gtmInstalled: gtmScriptExists || gtmLoaded,
      gtmLoadType,
      gtmCode,
      converteAIInstalled: converteAIFound,
      converteAIRequests: converteAIRequests // Salva as requisições de ConverteAI por pathname
    };

    console.log(
      `[${domain}] - GTM: ${gtmCode || "Não encontrado"} (${gtmLoadType})`
    );

  } catch (error) {
    // Em caso de erro
    domainStatus[domain] = {
      status: "ERRO",
      error: error.message,
      lastChecked: new Date().toISOString(),
      gtmInstalled: false,
      gtmLoadType: "Erro ao acessar a página",
      gtmCode: null,
      converteAIInstalled: false,
      converteAIRequests: null
    };
    console.error(`[${domain}] - Erro: ${error.message}`);
  } finally {
    // Fecha o navegador
    if (browser) await browser.close();
  }
}


// Função para verificar todos os domínios
async function checkAllDomains() {
  console.log(`[${new Date().toLocaleString()}] Iniciando verificação dos domínios...`);
  // Executa a verificação para cada domínio
  for (const domain of monitoredDomains) {
    await checkGTM(domain);
  }

  // Salva o status dos domínios no arquivo JSON
  // fs.writeFileSync("status.json", JSON.stringify(domainStatus, null, 2));
  // console.log(`[${new Date().toLocaleString()}] Verificação finalizada. Status salvo em status.json\n`);
}

// Roda a verificação a cada 5 minutos
setInterval(checkAllDomains, 5 * 60 * 1000);

// Chama a verificação inicialmente
checkAllDomains();

// Exporta funções, se necessário
module.exports = {
  checkAllDomains,
  domainStatus,
};
