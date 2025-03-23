const express = require("express");
const cors = require("cors");
const gtmRoutes = require("./routes/gtmRoutes");

const app = express();
const PORT = 5500;

app.use(cors());

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}))

app.use(express.json());
app.use("/api", gtmRoutes);

app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
});
