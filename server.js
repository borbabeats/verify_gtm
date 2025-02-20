const express = require("express");
const gtmRoutes = require("./routes/gtmRoutes");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use("/api", gtmRoutes);

app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
});
