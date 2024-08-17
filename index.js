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
    // database
    const database = client.db("shopO");

    // collection one
    const productsCollection = database.collection("products");

    // products api
    app.get("/products", async (req, res) => {
      const { search, page, size, sort, priceRange, category, brand } =
        req?.query;

      const perPageProducts = parseInt(size);
      const skipProducts = parseInt(page) * parseInt(size);

      const categorys = JSON.parse(category || []);
      const brands = JSON.parse(brand || []);

      const query = {};

      // query product with search text
      if (search) {
        query.title = { $regex: search, $options: "i" };
      }

      // query product with price range
      if (priceRange) {
        const [min, max] = priceRange.split("-").map((value) => Number(value));

        query.price = { $gte: min, $lte: max };
      }

      // query product with categorys
      if (categorys?.length) {
        query.category = { $in: categorys };
      }

      // query product with brands
      if (brands?.length) {
        query.brand = { $in: brands };
      }

      // product sort
      const sortOptions = {};

      if (sort) {
        if (sort === "Default") {
        }
        if (sort === "Newest") {
          sortOptions.date = -1;
        }
        if (sort === "Oldest") {
          sortOptions.date = 1;
        }
        if (sort === "Price: Low to High") {
          sortOptions.price = 1;
        }
        if (sort === "Price: High to Low") {
          sortOptions.price = -1;
        }
      }

      // count all products by query
      const totalProcutsNumber = await productsCollection.countDocuments(query);

      // find all products by bottom conditon
      const result = await productsCollection
        .find(query)
        .sort(sortOptions)
        .skip(skipProducts)
        .limit(perPageProducts)
        .toArray();

      return res.send({ result, totalProcutsNumber });
    });

    // ..........
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
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
  console.log(`Server is running on port: ${port}`);
});
