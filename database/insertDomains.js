const fs = require("fs");
const path = require("path");
const knex = require("./index");

const filePath = path.join(__dirname, "../monitoredDomains.json");

const fileContent = fs.readFileSync(filePath, "utf-8");
const data = JSON.parse(fileContent);

const domains = data.domains;

const insertDomains = async () => {
    try {
        await knex("domains").insert(domains.map((domain) => ({ name: domain })));
        console.log("Domínios inseridos com sucesso.");
    } catch (error) {
        console.error("Erro ao inserir domínios:", error);
    } finally {
        await knex.destroy();
    }
};

module.exports = insertDomains;