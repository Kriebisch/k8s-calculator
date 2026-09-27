const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

const ADDITION_SERVICE_URL = process.env.ADDITION_SERVICE_URL || 'http://localhost:3001/add';
const SUBTRACTION_SERVICE_URL = process.env.SUBTRACTION_SERVICE_URL || 'http://localhost:3002/subtract';
const MULTIPLICATION_SERVICE_URL = process.env.MULTIPLICATION_SERVICE_URL || 'http://localhost:3003/multiply';
const DIVISION_SERVICE_URL = process.env.DIVISION_SERVICE_URL || 'http://localhost:3004/divide';

app.post('/calculate', async (req, res)=> {
    try {
        const additionResponse = await axios.post(ADDITION_SERVICE_URL, { a: req.body.num1, b: req.body.num2});
        const additionResult = additionResponse.data.result;

        const subtractionResponse = await axios.post(SUBTRACTION_SERVICE_URL, { a: req.body.num3, b: req.body.num4} )
        const subtractionResult = subtractionResponse.data.result;
        
        const multiplicationResponse = await axios.post(MULTIPLICATION_SERVICE_URL, { a: additionResult, b: subtractionResult });
        const multiplicationResult = multiplicationResponse.data.result

        const divisionResponse = await axios.post(DIVISION_SERVICE_URL, { a: multiplicationResult, b: req.body.num5})
        res.json({ additionResult, subtractionResult, multiplicationResult, divisionResult: divisionResponse.data.result });

    } catch (error) {
        console.error('Fehler bei der Berechnung:', error.message);
        res.status(500).json({ error: 'Fehler bei der Berechnung' });
    };

});

app.listen(PORT, () => {
    console.log(`Calculator API running on port ${PORT}`);
});