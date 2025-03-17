// const fs = require("fs");

// const monitoredDomains = JSON.parse(
//   fs.readFileSync("monitoredDomains.json")
// ).domains;

// module.exports = { monitoredDomains };

// require("dotenv").config();

// const VERCEL_API_TOKEN = process.env.VERCEL_API_TOKEN;
// const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID; // Opcional
// console.log('vercel', VERCEL_TEAM_ID)
// // Função que busca os domínios
// async function monitoredDomains() {
//   try {

//     const fetch = (await import('node-fetch')).default;

//     const url = new URL("https://api.vercel.com/v9/domains");
//     if (VERCEL_TEAM_ID) {
//       url.searchParams.append("teamId", VERCEL_TEAM_ID);
//     }

//     const response = await fetch(url, {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${VERCEL_API_TOKEN}`,
//         "Content-Type": "application/json",
//       },
//     });

//     if (!response.ok) {
//       const errorMessage = await response.text();
//       console.error(`Erro: ${response.statusText}, ${errorMessage}`);
//       throw new Error(`${response.statusText}`);
//     }

//     const data = await response.json();
//     console.log("teste", data)
//     // Retorna só os nomes dos domínios
//     const domains = data.domains.map((domain) => domain.name);
    
//     return domains;
//   } catch (error) {
//     console.error("Erro ao buscar domínios:", error);
//     return [];
//   }
// }

// module.exports = { monitoredDomains };

const knex = require("../../database/index");

const monitoredDomains = async () => {
  try {
    const domains = await knex("domains").select("name");
    return domains.map((domain) => domain.name);
  } catch (error) {
    console.error("Erro ao buscar domínios:", error);
    return [];
  }
};

module.exports = { monitoredDomains };
