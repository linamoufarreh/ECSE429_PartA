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

describe('interoperability', () => {

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
        expect(response.data).toEqual(expected);

    });

    test('should post relationship between category with id 2 and todo with id 1, todo->categories', async () => {

        const body = 
        {
            "id": "2"
        }

        const response = await axios.post(apiUrl + "/todos/1/categories", body);
        expect(response.status).toBe(201);
        await axios.delete(apiUrl + "/todos/1/categories/2");

    });

    test('should delete relationship between category with id 2 and todo with id 1', async () => {

        const body = 
        {
            "id": "2"
        }
        await axios.post(apiUrl + "/todos/1/categories", body);

        const response = await axios.delete(apiUrl + "/todos/1/categories/2");
        expect(response.status).toBe(200);

    });

    test('should return error when attempting to delete nonexistant relationship between category with id 2 and todo with id 1', async () => {

        try{
            const response = await axios.delete(apiUrl + "/todos/1/categories/2");
        } catch (error) {
            expect(error.response.status).toBe(404);
            return;
        }
        throw new Error("Should have returned error code 404");

    });

    test('should return error when trying to link nonexistent category to a todo', async () => {

        const body = 
        {
            "id": "2345"
        }

        try{
            const response = await axios.post(apiUrl + "/todos/1/categories", body);
        } catch (error) {
            expect(error.response.status).toBe(404);
            return;
        }
        throw new Error("Should have returned error code 404");

    });

    test('[BUG] should return error code 200 when we get relationship between todo with unexistant id and all categories', async () => {
        const response = await axios.get(apiUrl + "/todos/3433/categories");
        const expected = require('./res/interoperability/categoryTodo.json')

        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();

    });

    test('[BUG] should return error code 404 when we get relationship between todo with unexistant id and all categories', async () => {
        const response = await axios.get(apiUrl + "/todos/3433/categories");
        const expected = require('./res/interoperability/categoryTodo.json')

        expect(response.status).toBe(404);
        expect(response.data).toBeUndefined();

    });

    test('should return error with malformed json payload', async () => {

        const malformedJson = '{"id": "2}'

        try{
            const response = await axios.post(apiUrl + "/todos/1/categories", malformedJson,{
                headers: {
                  'Content-Type': 'application/json',
                }});

        } catch (error) {
            expect(error.response.status).toBe(400);
            return;
        }
    });

    test('should return error with malformed xml payload', async () => {

        //malformed xml
        const malformedXml = '<id>2'

        try{
            const response = await axios.post(apiUrl + "/todos/1/categories", malformedXml,{
                headers: {
                  'Content-Type': 'application/xml',
                }});
                
        } catch (error) {
            expect(error.response.status).toBe(400);
            return;
        }
    });

    test("can generate XML payload", async () => {
        
    });




});


