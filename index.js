const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const Port = process.env.PORT || 5000;

app.use(bodyParser());
app.use(cors());
app.use(express());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://mongodb1:4VySxSVM7QhQu3xp@mycluster0.exc7x.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to mongo");
  } catch (error) {
    console.log(error.message);
  }
}
run().catch((error) => console.error(error.message));

const Services = client.db("finalProject").collection("services");
const Provider = client.db("finalProject").collection("provider");

app.get("/services", async (req, res) => {
  try {
    const cursor = Services.find({});
    const result = await cursor.toArray();
    res.send({
      success: true,
      message: "Got all data",
      datas: result,
    });
  } catch (error) {
    res.send({
      success: false,
      message: error.message,
    });
  }
});

app.get("/services/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const result = await Services.findOne(query);
    res.send({
      success: true,
      message: "got single data",
      datas: result,
    });
  } catch (error) {
    res.send({ seccess: false, message: error.message });
  }
});

app.post("/provider", async (req, res) => {
  try {
    await Provider.insertOne(req.body);
    res.send({
      success: true,
      message: "Successfully created account!",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error,
    });
    console.log(error);
  }
});

app.listen(Port, () => {
  console.log("server is running", Port);
});
app.get("/", (req, res) => {
  res.send("Got your data");
});

module.exports = app;
