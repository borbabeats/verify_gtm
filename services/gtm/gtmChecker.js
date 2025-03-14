async function checkGTM(page, domain) {
    let gtmLoaded = false;
    let gtmLoadType = null;
  
    await page.setRequestInterception(true);
    page.on("request", (request) => request.continue());
  
    page.on("response", (response) => {
      if (response.url().includes("googletagmanager.com/gtm.js") && response.ok()) {
        gtmLoaded = true;
      }
    });
  
    await page.goto(domain, { waitUntil: "networkidle2", timeout: 60000 });
  
    const gtmScriptExists = await page.evaluate(() => {
      return (
        document.querySelectorAll('script[src*="googletagmanager.com/gtm.js"]')
          .length > 0
      );
    });
  
    const gtmCode = await page.evaluate(() => {
      const matches = document.documentElement.innerHTML.match(/GTM-[A-Z0-9]+/g);
      return matches ? matches[0] : null;
    });
  
    if (gtmScriptExists && gtmLoaded) {
      gtmLoadType = "Encontrado no HTML e Carregado via Requisição";
    } else if (gtmScriptExists && !gtmLoaded) {
      gtmLoadType = "Encontrado no HTML (sem confirmação de carregamento)";
    } else if (!gtmScriptExists && gtmLoaded) {
      gtmLoadType = "Carregado via Requisição (não encontrado no HTML)";
    } else {
      gtmLoadType = "GTM Não Encontrado";
    }
  
    return {
      gtmInstalled: gtmScriptExists || gtmLoaded,
      gtmLoadType,
      gtmCode,
    };
  }
  
  module.exports = { checkGTM };