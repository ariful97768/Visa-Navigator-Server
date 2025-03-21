require('dotenv').config()
const express = require('express');
const cors = require('cors')
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())


// console.log(process.env.DB_user, process.env.DB_pass)

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// "mongodb+srv://<db_username>:<db_password>@cluster0.wwjbp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wwjbp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const visaCollection = client.db("Visa-Agency").collection("Visa");
    const userCollection = client.db('Visa-Agency').collection("User")

    app.get('/', async (req, res) => {
      const cursor = visaCollection.find().sort({ $natural: -1 }).limit(6)
      const result = await cursor.toArray()
      res.send(result)
    })

    app.get('/all_visa', async (req, res) => {
      const cursor = visaCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.post('/add_visa/:id', async (req, res) => {
      const data = req.body
      const result = await visaCollection.insertOne(data)
      res.send(result)
    })

    app.get('/my_visa/:id', async (req, res) => {
      const id = req.params.id
      const query = { userUid: id }
      // console.log(id)
      const cursor = visaCollection.find(query)
      const result = await cursor.toArray()

      res.send(result)
    })

    app.delete('/my_visa/delete/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await visaCollection.deleteOne(query)
      res.send(result)
    })

    // const { ageRestriction, applicationMethod, description, fee, image, name, processingTime, requiredDoc, validity, visaType, _id } = updatedData


    app.put('/update_visa/:id', async(req,res)=>{
      const id= req.params.id
      const filter={_id:new ObjectId(id)}
      const options= {upsert: true}
      const data= req.body
      const { userUid, name, image, processingTime, ageRestriction, fee, validity, applicationMethod, description, visaType, requiredDoc
    } = data
      const updatedDoc={
        $set:{
          userUid, name, image, processingTime, ageRestriction, fee, validity, applicationMethod, description, visaType,requiredDoc
        }
      }
      // console.log(id, data)
      const result= await visaCollection.updateOne(filter, updatedDoc, options)
      res.send(result)
      // console.log(result)
    })

    app.post('/apply_visa', async (req, res)=>{
      const data= req.body
      const result= await userCollection.insertOne(data)
      // console.log(data)
      res.send(result)
    })

    app.get('/applied_visa/:id',async (req, res)=>{
      const id= req.params.id
      const query = { userUid: id }
      const cursor = userCollection.find(query)
      const result = await cursor.toArray()
      const visaQueryIds= result.map(d=>new ObjectId(d.visaId))
      // console.log(id);
      const queryForVisa = { _id:  { $in: visaQueryIds }  }
      const cursorForVisa =await visaCollection.find(queryForVisa).toArray()
      const sendData={result, cursorForVisa}
      // console.log(visaQueryIds, cursorForVisa)
      res.send(sendData)
    })

    app.delete('/delete_visa/:id', async(req, res)=>{
      const id= req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await userCollection.deleteOne(query)
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");



  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send("Visa  server is running")
})
app.listen(port, () => {
  console.log('Visa server is running on port:', port)
})