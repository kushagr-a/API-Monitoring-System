import express from "express";
import dns from "node:dns"

dns.setServers(['1.1.1.1', '8.8.8.8'])

const app = express();

const PORT = 4000

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});