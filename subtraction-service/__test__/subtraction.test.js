const request = require('supertest');
const { app, server } = require('../index');

afterAll((done) => {
server.close(done);
});

test('POST /subtract returns the difference of two numbers', async () => {
const response = await request(app)
.post('/subtract')
.send({ a: 5, b: 3 });

expect(response.status).toBe(200);
expect(response.body).toEqual({ result: 2 });

});

test('POST /subtract returns 400 when an input is not a number', async () => {
const response = await request(app)
.post('/subtract')
.send({ a: '5', b: 3 });

expect(response.status).toBe(400);
expect(response.body).toEqual({
    error: 'a und b müssen Zahlen sein!'
});

});