const express = require("express");

const app = express();
const cors = require("cors");
app.use(cors());

const Port = process.env.PORT || 5000;
const data = require("./data/services.json");

app.listen(Port, () => {
  console.log("server is running", Port);
});
app.get("/", (req, res) => {
  res.send("Got your data");
});

app.get("/services", (req, res) => {
  res.send(data);
});
app.get("/services/:id", (req, res) => {
  const id = req.params.id;
  const singledata = data.filter((n) => n.id == id);
  res.send(singledata);
});

module.exports = app;
