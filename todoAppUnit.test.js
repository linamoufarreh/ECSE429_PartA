const axios = require('axios');

apiUrl= "http://localhost:4567/gui";

test('should return data from API', async () => {
    const response = await axios.get(apiUrl);
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
});
