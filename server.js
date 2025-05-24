const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

//connect to MongoDB Atlas
mongoose.connect('mongodb+srv://bmiuser:bmipass123@cluster0.mongodb.net/bmi-calculator?retryWrites=true&w=majority&appName=Cluster0', {
useNewUrlParser: true,
useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("MongoDB connection error:", err));

//mongoose schema and model
const bmiSchema = new mongoose.Schema({
  name: String,
  height: Number,
  weight: Number,
  bmi: Number,
  category: String,
});

const BMI = mongoose.model('BMI', bmiSchema);

// GET route for testing
app.get('/sample-bmi', (req, res) => {
  res.json({ height: 170, weight: 65, bmi: 22.5 });
});

// POST route to calculate BMI
app.post('/calculate-bmi', async(req, res) => {
  const { name, height, weight } = req.body;

  if (!height || !weight || !name) {
    return res.status(400).json({ error: "Missing name, height, or weight" });
  }

  const bmi = (weight / ((height / 100) ** 2)).toFixed(2);

  let category = "";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 24.9) category = "Normal weight";
  else if (bmi < 29.9) category = "Overweight";
  else category = "Obese";

  const bmiRecord = new BMI({name, height, weight, bmi, category});
  await bmiRecord.save();
  res.json({ bmi, category });
});

//API to get all BMI records
app.get('/bmi-records', async(req,res)=>{
  const records =   await BMI.find().sort({_id:-1}); //latest first 
  res.json(records);
})

app.delete('/bmi-records/:id', async(req,res)=>{
  try{
      await BMI.findByIdAndDelete(req.params.id);
      res.json({messsage: 'Record Deleted'});
  }catch(err){
   res.status(500).json({ error: 'Failed to delete record' });
  }
});

// PUT route to update a BMI record
app.put('/bmi-records/:id', async (req, res) => {
  const { name, height, weight } = req.body;

  if (!name || !height || !weight) {
    return res.status(400).json({ error: 'Missing fields for update' });
  }

  const bmi = (weight / ((height / 100) ** 2)).toFixed(2);
  let category = '';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 24.9) category = 'Normal weight';
  else if (bmi < 29.9) category = 'Overweight';
  else category = 'Obese';

  try {
    const updated = await BMI.findByIdAndUpdate(
      req.params.id,
      { name, height, weight, bmi, category },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update record' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
