const express = require('express');
const app = express();
const PORT = 3002;

app.use(express.json());

app.post('/subtract', (req, res) =>{
    const { a, b } = req.body

    if (typeof a !== 'number' || typeof b !== 'number') {
        return res.status(400).json({ error: 'a und b müssen Zahlen sein!'});
    }

    const result = a - b;
    res.json({ result })
});

app.listen(PORT, () => {
    console.log(`Subtraction service running on Port ${PORT}`);

});