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

describe('test categories', () => {

    const categoryUrl = apiUrl + "/categories";

    //Add tests here
    test('should return data from API', async () => {
        const response = await axios.get(apiUrl);
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
    });

    test("GET /categories?title=Home returns status 200 and the following JSON", async () => {
        const response = await axios.get(categoryUrl + "?title=Home");
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json');
        const expected = require('./res/categories/get_category_title_home.json');
        expect(response.data).toMatchObject(expected);
    });

    // test HEAD /categories
    test("HEAD /categories returns status 200 and no body", async () => {
        const response = await axios.head(categoryUrl);
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json');
        expect(response.data).toEqual("");
    }); 

     // test GET /categories
    test("GET /categories returns status 200 and the following JSON", async () => {
        let response = await axios.get(categoryUrl);
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json');
        let expected = require('./res/categories/get_categories.json');
        response = response.data.categories;
        expected = expected.categories;
        expect(response.length).toBe(expected.length);
        expect(response).toIncludeSameMembers(expected);
    });

// test POST /categories with existing ID
    // test("POST /categories with existing ID returns status 400 and an error message", async () => {
    //     try {
    //         const req = require('./res/categories/post_categories_existing_id_req.json');
    //         await axios.post(categoryUrl, req);
    //         // Fail if the request succeeds
    //         throw new Error('It should not reach here.');
    //     } catch (error) {
    //         if (error.response === undefined) {
    //             throw error;
    //         }
    //         const response = error.response;
    //         expect(response.status).toBe(400);
    //         expect(response.headers['content-type']).toBe('application/json');

    //         const expected = require('./res/categories/post_cateogires_existing_id_res.json');
    //         expect(response.data).toMatchObject(expected);
    //     }
    // });

    // test POST /categories with valid body
    let newCategoryID = 0;
    test("POST /category with valid body returns status 201 and the following JSON", async () => {
        const req = require('./res/categories/post_category_req.json');
        const response = await axios.post(categoryUrl, req);
        expect(response.status).toBe(201);
        expect(response.headers['content-type']).toBe('application/json');
        const expected = require('./res/categories/post_category_res.json');
        expect(response.data.title).toEqual(expected.title);
        expect(response.data.description).toEqual(expected.description);
        newCategoryID = response.data.id;
    });

    // test GET /projects/:id/todos with inexistent ID
    test("GET /categories/:id/todos returns status 200 and the following JSON", async () => {
        try {
        let response = await axios.get(categoryUrl + "/30/todos");
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json');
        response = response.data.tasks;
        expect(response).toBeNull();
    } catch (error) {
        throw new Error(`Test failed due to bug: todo objects are still received while category inexistent`)
    }
});
    // test DELETE /categories/:id
    test("DELETE /todos/:id returns status 200 and the following JSON", async () => {
        const response = await axios.delete(categoryUrl + "/" + newCategoryID);
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json');
    });

});


