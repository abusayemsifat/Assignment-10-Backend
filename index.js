const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = 3000;

const app = express();
app.use(cors());
app.use(express.json())



const uri = "mongodb+srv://missionSCIC:6JlQx33fBfynfuZV@cluster0.nsup1w5.mongodb.net/?appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    await client.connect();

    const database = client.db('petService');
    const petServices = database.collection('services');

    // post or save service to DB
    app.post('/services', async (req, res) => {
      const data = req.body;
      const date = new Date();
      data.createdAt = date;
      console.log(data);
      const result = await petServices.insertOne(data);
      res.send(result)
    })

    app.get('/services/:id', async (req, res) => {
      const id = req.params
      console.log(id);

      const query = {_id: new ObjectId(id)}
      const result = await petServices.findOne(query)
      res.send(result)
    })


    // Get services from DB
    app.get('/services', async (req, res) => {
      const result = await petServices.find().toArray();
      res.send(result)
    })


    app.get('/my-services', async(req, res)=>{
      
      const {email} = req.query 
      const query = {email: email}
      const result = await petServices.find(query).toArray()
      res.send(result)

    })

    app.put('/update', async(req, res)=>{
      const data = req.body;
      console.log(data)
    })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello, Developers')
})

app.listen(port, () => {
  console.log(`server is running on ${port}`);
})