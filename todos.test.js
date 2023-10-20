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

describe('todos', () => {

    beforeAll(async () => {
        startApi();
        //wait 2 seconds for the server to start
        await new Promise(resolve => setTimeout(resolve, 2000));
    }, 10000);
    
    afterAll(async () => {
    try {
        stopApi();
        //wait 2 seconds for the server to stop
        await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
    }
    }, 10000);

    //add tests here

    test('should return data from API', async () => {
        const response = await axios.get(apiUrl);
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
    });

    test('should post data', async () => {
        todoJson = {
            "title": "testTodo",
        }
        const response = await axios.post(apiUrl + "/todos", todoJson);
        expect(response.status).toBe(201);
        expect(response.data).toBeDefined();
    });

    describe("API Docs Test", () => {
        const docsUrl = apiUrl + "/docs";

        test("GET /docs returns status 200 and 'pass!'", async () => {
            const response = await axios.get(docsUrl);
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('text/html');
        });
    });

    describe("API Todo Test", () => {
        const todoUrl = apiUrl + "/todos";

        // test GET /todos
        test("GET /todos returns status 200 and the following JSON", async () => {
            let response = await axios.get(todoUrl);
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('application/json');
            
            let expected = require('./res/todos/get_todos.json');

            response = response.data.todos;
            expected = expected.todos;

            expect(response.length).toBe(expected.length);
            expect(response).toIncludeSameMembers(expected);
        });

        // test GET /todos?title=scan paperwork
        test("GET /todos?title=scan paperwork returns status 200 and the following JSON", async () => {
            const response = await axios.get(todoUrl + "?title=scan paperwork");
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('application/json');
            
            const expected = require('./res/todos/get_todos_title_scan_paperwork.json');
            expect(response.data).toMatchObject(expected);
        });

        // test GET /todos?doneStatus=true
        test("GET /todos?doneStatus=true returns status 200 and the following JSON", async () => {
            const response = await axios.get(todoUrl + "?doneStatus=true");
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('application/json');
            
            const expected = require('./res/todos/get_todos_doneStatus_true.json');
            expect(response.data).toMatchObject(expected);
        });

        // test HEAD /todos
        test("HEAD /todos returns status 200 and no body", async () => {
            const response = await axios.head(todoUrl);
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('application/json');
            expect(response.data).toEqual("");
        });

        // test POST /todos with existing ID
        test("POST /todos with existing ID returns status 400 and an error message", async () => {
            try {
                const req = require('./res/todos/post_todos_existing_id_req.json');
                await axios.post(todoUrl, req);

                // Fail if the request succeeds
                throw new Error('It should not reach here.');
                
            } catch (error) {
                if (error.response === undefined) {
                    throw error;
                }

                const response = error.response;
                
                expect(response.status).toBe(400);
                expect(response.headers['content-type']).toBe('application/json');

                const expected = require('./res/todos/post_todos_existing_id_res.json');
                expect(response.data).toMatchObject(expected);
            }

        });

        // test POST /todos with unique ID
        test("POST /todos with unique ID returns status 400 and an error message", async () => {
            try {
                const req = require('./res/todos/post_todos_unique_id_req.json');
                await axios.post(todoUrl, req);

                // Fail if the request succeeds
                throw new Error('It should not reach here.');
                
            } catch (error) {
                if (error.response === undefined) {
                    throw error;
                }

                const response = error.response;
                
                expect(response.status).toBe(400);
                expect(response.headers['content-type']).toBe('application/json');

                const expected = require('./res/todos/post_todos_existing_id_res.json');
                expect(response.data).toMatchObject(expected);
            }
        });

        // test POST /todos with valid body
        let newTodoId = 0;
        test("POST /todos with valid body returns status 201 and the following JSON", async () => {
            const req = require('./res/todos/post_todos_req.json');
            const response = await axios.post(todoUrl, req);

            expect(response.status).toBe(201);
            expect(response.headers['content-type']).toBe('application/json');

            const expected = require('./res/todos/post_todos_res.json');
            expect(response.data.title).toEqual(expected.title);
            expect(response.data.description).toEqual(expected.description);
            expect(response.data.doneStatus).toEqual(expected.doneStatus);

            console.log("ID created: " + response.data.id);

            newTodoId = response.data.id;
        });

        // test GET /todos:id after POST
        test("GET /todos/:id after POST returns status 200 and the following JSON", async () => {
            let response = await axios.get(todoUrl + "/" + newTodoId);
            
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('application/json');

            const expected = require('./res/todos/get_todos_id.json');

            response = response.data.todos;
            expect(response.length).toBe(1);

            response = response[0];
            expect(response.id).toEqual(newTodoId);
            expect(response.title).toEqual(expected.todos[0].title);
            expect(response.description).toEqual(expected.todos[0].description);
            expect(response.doneStatus).toEqual(expected.todos[0].doneStatus);
        });

        // test POST modifying /todos:id with id input as a string, returns 400 with erroe message
        // test("POST /todos/:id to modify with id input as a string returns status 400 and an error message", async () => {
        //     try {
        //         const req = require('./res/todos/post_todos_modify_req.json');
        //         req.id = newTodoId.toString();
        //         const response = await axios.post(todoUrl + "/" + newTodoId, req);
        //         console.log(JSON.stringify(req) + ": " + response);

        //         // Fail if the request succeeds
        //         throw new Error('It should not reach here.');
                
        //     } catch (error) {
        //         if (error.response === undefined) {
        //             throw error;
        //         }

        //         const response = error.response;
                
        //         expect(response.status).toBe(400);
        //         expect(response.headers['content-type']).toBe('application/json');

        //         const expected = require('./res/todos/post_todos_modify_id_string_res.json');
        //         expect(response.data).toEqual(expected);
        //     }
        // });

        // test POST modifying /todos:id (success)
        test("POST /todos/:id to modify returns status 200 and the following JSON", async () => {
            const req = require('./res/todos/post_todos_modify_req.json');
            const response = await axios.post(todoUrl + "/" + newTodoId, req);

            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('application/json');

            const expected = require('./res/todos/post_todos_modify_res.json');
            expect(response.data.id).toEqual(newTodoId);
            expect(response.data.title).toEqual(expected.title);
            expect(response.data.description).toEqual(expected.description);
            expect(response.data.doneStatus).toEqual(expected.doneStatus);
        });

        // test DELETE /todos/:id
        test("DELETE /todos/:id returns status 200 and the following JSON", async () => {
            const response = await axios.delete(todoUrl + "/" + newTodoId);

            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('application/json');
        });

        // test GET /todos/:id/tasksof
        test("GET /todos/:id/tasksof returns status 200 and the following JSON", async () => {
            let response = await axios.get(todoUrl + "/1/tasksof");

            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('application/json');

            let expected = require('./res/todos/get_todos_id_tasksof_res.json');

            response = response.data.projects[0];
            expected = expected.projects[0];
            expect(response.id).toEqual(expected.id);
            expect(response.title).toEqual(expected.title);
            expect(response.completed).toEqual(expected.completed);
            expect(response.active).toEqual(expected.active);
            expect(response.description).toEqual(expected.description);
            expect(response.tasks).toIncludeSameMembers(expected.tasks);
        });

        // test GET /todos/:id/tasksof
        test("GET /todos/:id/tasksof returns status 200 and the following JSON", async () => {
            let response = await axios.get(todoUrl + "/2/tasksof");

            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('application/json');

            let expected = require('./res/todos/get_todos_id_tasksof_res.json');

            response = response.data.projects[0];
            expected = expected.projects[0];
            expect(response.id).toEqual(expected.id);
            expect(response.title).toEqual(expected.title);
            expect(response.completed).toEqual(expected.completed);
            expect(response.active).toEqual(expected.active);
            expect(response.description).toEqual(expected.description);
            expect(response.tasks).toIncludeSameMembers(expected.tasks);
        });
    });
});

// describe('test projects', () => {

//     beforeAll(async () => {
//         startApi();
//         //wait 2 seconds for the server to start
//         await new Promise(resolve => setTimeout(resolve, 2000));
//     }, 10000);
    
//     afterAll(async () => {
//     try {
//         stopApi();
//         //wait 2 seconds for the server to stop
//         await new Promise(resolve => setTimeout(resolve, 2000));
//     } catch (error) {
//     }
//     }, 10000);

//     //Add tests here
//     test('should return data from API', async () => {
//         const response = await axios.get(apiUrl);
//         expect(response.status).toBe(200);
//         expect(response.data).toBeDefined();
//     });
// });
