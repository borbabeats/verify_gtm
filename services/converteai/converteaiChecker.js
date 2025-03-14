const { delay } = require("../utils/utils");

async function checkConverteAI(page, domain) {
    let converteAIFound = false;
    let pvVSLIDFound = null;
    let pveVSLIDFound = null;
    let pvaVSLIDFound = null;
    let pvbVSLIDFound = null;
    let hasABTest = null;
  
    page.on("response", (response) => {
      const url = response.url();
      if (
        url.includes(
          "https://scripts.converteai.net/817bd58d-9ef6-4339-97a6-a374233fe748/players/"
        )
      ) {
        converteAIFound = true;
  
        const currentPagePathname = new URL(page.url()).pathname;
        if (currentPagePathname === "/pv") pvVSLIDFound = url;
        if (currentPagePathname === "/pve") pveVSLIDFound = url;
        if (currentPagePathname === "/pva") pvaVSLIDFound = url;
        if (currentPagePathname === "/pvb") pvbVSLIDFound = url;
      }
    });
  
    const pathnames = ["/pv", "/pve", "/pva", "/pvb"];
    for (const pathname of pathnames) {
      await page.goto(domain + pathname, { waitUntil: "networkidle2", timeout: 60000 });
      await delay(4000);
    }
  
    if (pvaVSLIDFound !== null && pvbVSLIDFound !== null) {
      hasABTest = "Em Execução";
    } else if (pvaVSLIDFound !== null || pvbVSLIDFound !== null) {
      hasABTest = "Problema nas rotas";
    } else {
      hasABTest = "Parado";
    }
  
    return {
      converteAIInstalled: converteAIFound,
      pv: pvVSLIDFound,
      pve: pveVSLIDFound,
      pva: pvaVSLIDFound,
      pvb: pvbVSLIDFound,
      hasABTest,
    };
  }
  
  module.exports = { checkConverteAI };