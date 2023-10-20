const axios = require('axios');
const exec = require('await-exec');
const jestExtended = require('jest-extended');
expect.extend(jestExtended);

const apiUrl = "http://localhost:4567";

function startApi() {
    exec('java -jar runTodoManagerRestAPI-1.5.5.jar');
}

async function stopApi() {
    try{
        const response = await axios.get(apiUrl + "/shutdown");
    } catch (error) {
    }
}

beforeAll(async () => {
    startApi();
    await new Promise(resolve => setTimeout(resolve, 2000));
});

afterAll(async () => {
    stopApi();
    await new Promise(resolve => setTimeout(resolve, 2000));  
});

describe('interperability', () => {

    //Add tests here
    test('should return data from API', async () => {
        const response = await axios.get(apiUrl);
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
    });

    test('should get relationship between todo with id 1 and all categories', async () => {
        const response = await axios.get(apiUrl + "/todos/1/categories");
        const expected = require('./res/interoperability/categoryTodo.json')

        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
        expect(response.data).toEqual(expected)

    });

    test('should post relationship between category with id 2 and todo with id 1', async () => {

        const body = 
        {
            "id": 2
        }

        const response = await axios.post(apiUrl + "/todos/1/categories", body);
        expect(response.status).toBe(201);

    });

    test('should delete relationship between category with id 2 and todo with id 1', async () => {

        const response = await axios.delete(apiUrl + "/todos/1/categories/2");
        expect(response.status).toBe(200);

    });


});


