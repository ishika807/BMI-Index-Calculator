const cors = require('cors');
app.use(cors());

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

// GET route for testing
app.get('/sample-bmi', (req, res) => {
  res.json({ height: 170, weight: 65, bmi: 22.5 });
});

app.post('/calculate-bmi', (req, res) => {
  const { height, weight } = req.body;

  if (!height || !weight) {
    return res.status(400).json({ error: "Missing height or weight" });
  }

  const bmi = (weight / ((height / 100) ** 2)).toFixed(2);

  let category = "";
  if (bmi < 18.5) category = "Underweight";
  else if (bmi < 24.9) category = "Normal weight";
  else if (bmi < 29.9) category = "Overweight";
  else category = "Obese";

  res.json({ bmi, category });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
