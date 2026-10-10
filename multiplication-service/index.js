const express = require('express');
const app = express();
const PORT = 3003

app.use(express.json());

app.post('/multiply', (req, res) => {
    const { a, b } = req.body;

    if (typeof a !== 'number' || typeof b !== 'number') {
        return res.status(400).json({ error: 'a und b müssen Zahlen sein!' });
    }

    const result = a * b;
    res.json({ result });
});

const server = app.listen(PORT, () => {
    console.log(`Multiplication service running on port ${PORT}`);
})

module.exports = { app, server };