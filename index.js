const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const Port = process.env.PORT || 8000;

app.use(bodyParser());
app.use(cors());
app.use(express());

//===Mongo//
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://mongodb1:4VySxSVM7QhQu3xp@mycluster0.exc7x.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

//===Connect to DB===//
async function run() {
  try {
    await client.connect();
    console.log("Connected to mongo");
  } catch (error) {
    console.log(error.message);
  }
}
run().catch((error) => console.error(error.message));

//=== DataBase Collections ===//
const Services = client.db("finalProject").collection("services");
const Users = client.db("finalProject").collection("users");
const ordersCollections = client.db("finalProject").collection("orders");

//=== Get Services ===///
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
    console.log(error);
  }
});

//==== Order Specific Service ====//
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

//=== Post User Data ===//
app.post("/users", async (req, res) => {
  try {
    await Users.insertOne(req.body);
    res.send({
      success: true,
      message: "Successfully created account!",
    });
  } catch (error) {
    res.send({
      success: false,
      message: error?.message,
    });
    console.log(error);
  }
});

//=== Get All User Information ===//
app.get("/users", async (req, res) => {
  try {
    const email = req.query.email;
    const admin = await Users.findOne({ email });
    const result = await Users.find({}).toArray();
    if (admin?.role !== "admin") {
      return res.send({ message: "Unauthorized request!" });
    }
    res.send(result);
  } catch (error) {
    console.error(error);
  }
});

//===Get Specific User===//
app.get("/users/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const result = await Users.findOne({ email: email });
    res.send({ data: result, success: true });
  } catch (error) {
    res.send({ success: false, error: "Coudn't get user information!" });
  }
});

//=== Get customer info ===//
app.get("/users-list", async (req, res) => {
  try {
    const allUsers = await Users.find({}).toArray();

    const customers = allUsers.filter((user) => user?.role === "User");

    res.send({ data: customers, success: true });
  } catch (error) {
    res.send({ success: false, error: "Coundn't get user information!" });
  }
});

//=== Delete Customer ===//
app.delete("/user-delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await Users.deleteOne({ _id: ObjectId(id) });

    res.send({ success: true, message: "Deleted successfully!" });
  } catch (error) {
    res.send({ seccess: false, error: "Couldn't Delete it!" });
  }
});

//=== Delete Service Provider ===//
app.delete("/provider-delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await Users.deleteOne({ _id: ObjectId(id) });

    res.send({ success: true, message: "Deleted successfully!" });
  } catch (error) {
    res.send({ success: false, error: "Couldn't Delete it!" });
  }
});

//=== Get Service providers info ===//
app.get("/providers-list", async (req, res) => {
  try {
    const allUsers = await Users.find({}).toArray();

    const providers = allUsers.filter((user) => user?.role === "Provider");

    res.send({ data: providers, success: true });
  } catch (error) {
    res.send({ success: false, error: "Coundn't get providers information!" });
  }
});

//=== Post Order details ===///
app.post("/orders", async (req, res) => {
  try {
    const data = req.body;
    const result = await ordersCollections.insertOne(data);
    res.send({ success: true, message: "Searching For a Service Provider!" });
  } catch (error) {
    console.log(error);
    res.send({ success: false, message: "Couldn't make order!" });
  }
});

//=== Get users orders ===//
app.get("/user-orders/:email", async (req, res) => {
  try {
    const allOrders = await ordersCollections
      .find({ user_email: req.params.email })
      .toArray();
    const orders = allOrders.filter((order) => order.status !== "completed");

    res.send({ data: orders, success: true });
  } catch (error) {
    res.send({ success: false, error: "Orders Couldn't load!" });
  }
});

//=== Delete order ===//
app.delete("/order-delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await ordersCollections.deleteOne({ _id: ObjectId(id) });

    res.send({ success: true, message: "Deleted successfully!" });
  } catch (error) {
    res.send({ seccess: false, error: "Couldn't Delete it!" });
  }
});

//=== User histry ===//
app.get("/user-histry/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const userInfo = await ordersCollections
      .find({ user_email: email })
      .toArray();

    const orders = userInfo.filter((order) => order.status === "completed");

    res.send({ success: true, data: orders });
  } catch (error) {
    res.send({ success: false, error: "Couldn't get any Orders!" });
  }
});

//==== Get Available Orders for provider====//
app.get("/available-orders/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const userInfo = await Users.findOne({ email: email });
    const serviceId = userInfo?.serviceId;

    const ordersInfo = await ordersCollections
      .find({ serviceId: serviceId })
      .toArray();

    const orders = ordersInfo.filter((order) => order.status === "pending");

    res.send({ success: true, data: orders });
  } catch (error) {
    res.send({ success: false, error: "Couldn't get any Orders!" });
  }
});

//=== Accept Order ===//
app.patch("/accept-order/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await ordersCollections.updateOne(
      { _id: ObjectId(id) },
      { $set: req.body }
    );

    res.send({ success: true, message: "You booked the order" });
  } catch (error) {
    res.send({ success: false, message: "This is not able to order!" });
  }
});

//=== My Orders Provider ===//
app.get("/my-orders/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const userInfo = await Users.findOne({ email: email });
    const serviceId = userInfo?.serviceId;

    const ordersInfo = await ordersCollections
      .find({ serviceId: serviceId })
      .toArray();

    const orders = ordersInfo.filter((order) => order.status === "working");

    res.send({ success: true, data: orders });
  } catch (error) {
    res.send({ success: false, error: "Couldn't get any Orders!" });
  }
});

//=== Provider histry ===//
app.get("/provider-histry/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const userInfo = await ordersCollections
      .find({ provider_email: email })
      .toArray();

    const orders = userInfo.filter((order) => order.status === "completed");

    res.send({ success: true, data: orders });
  } catch (error) {
    res.send({ success: false, error: "Couldn't get any Orders!" });
  }
});

app.patch("/complete-orders/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await ordersCollections.updateOne(
      { _id: ObjectId(id) },
      { $set: { status: "completed" } }
    );

    res.send({ success: true, message: "You booked the order" });
  } catch (error) {
    res.send({ success: false, message: "This is not able to order!" });
  }
});

//=== Initial Part ===///
app.listen(Port, () => {
  console.log("server is running", Port);
});
app.get("/", (req, res) => {
  res.send("Got your data");
});

module.exports = app;
