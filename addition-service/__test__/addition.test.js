const request = require('supertest');
const { app, server } = require('../index');

afterAll((done) => {
server.close(done);
});

test('POST /add returns the sum of two numbers', async () => {
const response = await request(app)
.post('/add')
.send({ a: 5, b: 3 });

expect(response.status).toBe(200);
expect(response.body).toEqual({ result: 8 });

});

test('POST /add returns 400 when an input is not a number', async () => {
const response = await request(app)
.post('/add')
.send({ a: '5', b: 3 });

expect(response.status).toBe(400);
expect(response.body).toEqual({
    error: 'a und b müssen Zahlen sein!'
});

});