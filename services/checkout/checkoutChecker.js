const { delay } = require("../utils/utils");

async function checkCheckoutLinks(page, domain) {
  const result = {
    checkoutLinkFoundFromVTurb: false,
    checkoutLinkPV: null,
    checkoutLinkPVE: null,
    checkoutLinkPVA: null,
    checkoutLinkPVB: null,
    checkoutPlatformPV: null,
    checkoutPlatformPVE: null,
    checkoutPlatformPVA: null,
    checkoutPlatformPVB: null,
  };

  const pathnames = ["/pv", "/pve", "/pva", "/pvb"];

  for (const pathname of pathnames) {
    await page.goto(domain + pathname, { waitUntil: "networkidle2", timeout: 60000 });
    await delay(4000);

    const allLinks = await page.evaluate(() => {
      const salduu = Array.from(document.querySelectorAll('a[href^="https://imm.salduu.com/p"]')).map((link) => link.href);
      const monettize = Array.from(document.querySelectorAll('a[href^="https://monettize.com"]')).map((link) => link.href);
      const payt = Array.from(document.querySelectorAll('a[href^="https://checkout.payt.com.br"]')).map((link) => link.href);
      return { salduu, monettize, payt };
    });

    let finalLink = null;
    let platform = null;

    if (allLinks.salduu.length > 0) {
      finalLink = allLinks.salduu[0];
      platform = "Salduu";
    } else if (allLinks.monettize.length > 0) {
      finalLink = allLinks.monettize[0];
      platform = "Monettize";
    } else if (allLinks.payt.length > 0) {
      finalLink = allLinks.payt[0];
      platform = "Payt";
    }

    // Se encontrar algum link, marca como encontrado
    if (finalLink) {
      result.checkoutLinkFoundFromVTurb = true;
    }

    // Atribui o link e a plataforma para a página correta
    if (pathname === "/pv") {
      result.checkoutLinkPV = finalLink;
      result.checkoutPlatformPV = platform;
    }
    if (pathname === "/pve") {
      result.checkoutLinkPVE = finalLink;
      result.checkoutPlatformPVE = platform;
    }
    if (pathname === "/pva") {
      result.checkoutLinkPVA = finalLink;
      result.checkoutPlatformPVA = platform;
    }
    if (pathname === "/pvb") {
      result.checkoutLinkPVB = finalLink;
      result.checkoutPlatformPVB = platform;
    }
  }

  return result;
}

module.exports = { checkCheckoutLinks };
