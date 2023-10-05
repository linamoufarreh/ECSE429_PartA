const axios = require('axios');

apiUrl = "http://localhost:4567/"

test('should return data from API', async () => {
    const response = await axios.get(apiUrl);
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
});

test('should post data', async () => {
    todoJson = {
        "title": "testTodo",
    }
    const response = await axios.post(apiUrl + "todos", todoJson);
    expect(response.status).toBe(201);
    expect(response.data).toBeDefined();
});
