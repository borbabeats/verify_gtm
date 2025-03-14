const { delay } = require("../utils/utils");

async function checkCheckoutLinks(page, domain) {
    let checkoutLinkFound = false;
    let checkoutLinkPV = null;
    let checkoutLinkPVE = null;
    let checkoutLinkPVA = null;
    let checkoutLinkPVB = null;
  
    const pathnames = ["/pv", "/pve", "/pva", "/pvb"];
    for (const pathname of pathnames) {
      await page.goto(domain + pathname, { waitUntil: "networkidle2", timeout: 60000 });
      await delay(4000);
  
      const salduuLinks = await page.evaluate(() => {
        return Array.from(
          document.querySelectorAll('a[href^="https://imm.salduu.com/p"]')
        ).map((link) => link.href);
      });
  
      if (salduuLinks.length > 0) checkoutLinkFound = true;
  
      if (pathname === "/pv") checkoutLinkPV = salduuLinks[0] || null;
      if (pathname === "/pve") checkoutLinkPVE = salduuLinks[0] || null;
      if (pathname === "/pva") checkoutLinkPVA = salduuLinks[0] || null;
      if (pathname === "/pvb") checkoutLinkPVB = salduuLinks[0] || null;
    }
  
    return {
      checkoutLinkFound,
      checkoutLinkPV,
      checkoutLinkPVE,
      checkoutLinkPVA,
      checkoutLinkPVB,
    };
  }
  
  module.exports = { checkCheckoutLinks };