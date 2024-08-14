const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
var cors = require("cors");
require("dotenv").config();

// create express app
const app = express();

// port
const port = process.env.PORT || 5003;

// express middleware start here
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://phjt.netlify.app"],
    credentials: true,
  })
);
// express middleware end here

// mongodb uri
const uri = process.env.MONGODB_URI;

// create a mongoclient with a mongoclientoptions object to set the stable api version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // ..........
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    // ..........
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.log);

// create a route for the root url
app.get("/", (req, res) => {
  res.send("phJT server is running...");
});

// start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
