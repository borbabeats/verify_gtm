const { launchBrowser, closeBrowser } = require("../browser/browser");
const { checkGTM } = require("../gtm/gtmChecker");
const { domains } = require("../config/config"); // Lista de domínios cadastrados

async function getGTMid(req, res) {
  const { gtm } = req.query;

  if (!gtm) {
    return res.status(400).json({ error: "Parâmetro 'gtm' é obrigatório. Ex: /api/id?gtm=GTM-XXXXXX" });
  }

  const browser = await launchBrowser();
  const matchingDomains = [];

  try {
    for (const domain of domains) {
      console.log(`Verificando domínio: ${domain}`);
      const page = await browser.newPage();
      const gtmResult = await checkGTM(page, domain);

      console.log(`Dominio: ${domain}, GTM Encontrado: ${gtmResult.gtmCode}`);

      if (gtmResult.gtmCode === gtm) {
        matchingDomains.push({
          domain,
          gtmCode: gtmResult.gtmCode,
          gtmLoadType: gtmResult.gtmLoadType,
          gtmInstalled: gtmResult.gtmInstalled,
        });
      }

      await page.close();
    }

    return res.json({
      searchedGTM: gtm,
      found: matchingDomains.length,
      domains: matchingDomains,
    });
  } catch (error) {
    console.error("Erro ao verificar os domínios:", error);
    return res.status(500).json({ error: "Erro ao verificar os domínios", detail: error.message });
  } finally {
    await closeBrowser(browser);
  }
}

module.exports = { getGTMid };
