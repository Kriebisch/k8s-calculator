const express = require('express');
const app = express();
const PORT = 3001;

app.use(express.json());

app.post('/add', (req, res)=>{
    const {a,b} = req.body;

    if (typeof a !== 'number' || typeof b !== 'number') {
        return res.status(400).json({ error: 'a und b müssen Zahlen sein!'})
    }

    const result = a + b;
    res.json({ result })
})

const server = app.listen(PORT, () => {
    console.log(`Addition service running on port ${PORT}`)
});

module.exports = { app, server };