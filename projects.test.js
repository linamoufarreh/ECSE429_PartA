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

describe('test projects', () => {
    const projectUrl = apiUrl + "/projects";
    //Add tests here

    // test GET /projects
    test("GET /projects returns status 200 and the following JSON", async () => {

        try{
            let response = await axios.get(projectUrl);
        
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('application/json');
        
            let expected = require('./res/projects/get_projects.json');
            response = response.data.projects;
            expected = expected.projects;

            expect(response.length).toBe(expected.length);
            expect(response).toIncludeSameMembers(expected);

        } catch (error) {
            throw new Error(`Test failed due to bug: task objects are not received with IDs in natural order`)
        }
        // expected.projects.forEach((project) => {
        //     project.tasks = project.tasks.sort((a, b) => a.id.localeCompare(b.id));
        // });
        // response.data.projects.forEach((project) => {
        //     project.tasks = project.tasks.sort((a, b) => a.id.localeCompare(b.id));
        // });
    
        // expect(response.data).toEqual(expected);
    });
    
    

    // test GET /projects?title=Office Work
    test("GET /projects?title=Office Work returns status 200 and the following JSON", async () => {

        try{
        const response = await axios.get(projectUrl + "?title=Office Work");
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json');

        const expected = require('./res/projects/get_projects_title_office_work.json');
        expect(response.data).toMatchObject(expected);
        
    } catch(error){
        throw new Error(`Test failed due to bug: task objects are not received with IDs in natural order`)
    }
        // const expected = require('./res/projects/get_projects_title_office_work.json');
        // expected.projects.forEach((project) => {
        //     project.tasks = project.tasks.sort((a, b) => a.id.localeCompare(b.id));
        // });
        // response.data.projects.forEach((project) => {
        //     project.tasks = project.tasks.sort((a, b) => a.id.localeCompare(b.id));
        // });
    
        // expect(response.data).toEqual(expected);
    });
    
    // test GET /projects?completed=false
    test("GET /projects?completed=false returns status 200 and the following JSON", async () => {
        const response = await axios.get(projectUrl + "?completed=false");
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json');
        
        const expected = require('./res/projects/get_projects_completed_false.json');
        expected.projects.forEach((project) => {
            project.tasks = project.tasks.sort((a, b) => a.id.localeCompare(b.id));
        });
        response.data.projects.forEach((project) => {
            project.tasks = project.tasks.sort((a, b) => a.id.localeCompare(b.id));
        });
    
        expect(response.data).toEqual(expected);
    });

    // test HEAD /projects
    test("HEAD /projects returns status 200 and no body", async () => {
        const response = await axios.head(projectUrl);
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json');
        expect(response.data).toEqual("");
    });

    // test POST /projects with existing ID
    test("POST /projects with existing ID returns status 400 and an error message", async () => {
        try {
            const req = require('./res/projects/post_projects_existing_id_req.json');
            await axios.post(projectUrl, req);

            // Fail if the request succeeds
            throw new Error('It should not reach here.');
            
        } catch (error) {
            if (error.response === undefined) {
                throw error;
            }

            const response = error.response;
            
            expect(response.status).toBe(400);
            expect(response.headers['content-type']).toBe('application/json');

            const expected = require('./res/projects/post_projects_existing_id_res.json');
            expect(response.data).toMatchObject(expected);
        }

    });

    // test POST /projects with unique ID
    test("POST /projects with unique ID returns status 400 and an error message", async () => {
        try {
            const req = require('./res/projects/post_projects_unique_id_req.json');
            await axios.post(projectUrl, req);

            // Fail if the request succeeds
            throw new Error('It should not reach here.');
            
        } catch (error) {
            if (error.response === undefined) {
                throw error;
            }

            const response = error.response;
            
            expect(response.status).toBe(400);
            expect(response.headers['content-type']).toBe('application/json');

            const expected = require('./res/projects/post_projects_existing_id_res.json');
            expect(response.data).toMatchObject(expected);
        }
    });
     
    
    let newProjectId = 0;
    // test POST /projects with valid body
    
    test("POST /projects with valid body returns status 201 and the following JSON", async () => {
        const req = require('./res/projects/post_projects_req.json');
        const response = await axios.post(projectUrl, req);

        expect(response.status).toBe(201);
        expect(response.headers['content-type']).toBe('application/json');

        const expected ={
            title: "project X",
            completed: "false",
            active: "true",
            description: "",
            tasks: []
          };

        expect(response.data.title).toEqual(expected.title);
        expect(response.data.completed).toEqual(expected.completed);
        expect(response.data.active).toEqual(expected.active);
        expect(response.data.description).toEqual(expected.description);
        
        newProjectId = response.data.id;
    });


    // test GET /projects:id after POST
    test("GET /projects/:id after POST returns status 200 and the following JSON", async () => {

        response = await axios.get(projectUrl + "/" + newProjectId);
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json');

        const expected = require('./res/projects/get_projects_id.json');

        response = response.data.projects;
        expect(response.length).toBe(1);

        response = response[0];
        expect(response.id).toEqual(newProjectId);
        expect(response.title).toEqual(expected.projects[0].title);
        expect(response.description).toEqual(expected.projects[0].description);
        expect(response.completed).toEqual(expected.projects[0].completed);
        expect(response.active).toEqual(expected.projects[0].active);
        expect(response.tasks).toEqual(expected.projects[0].tasks);

    });

     // test POST modifying /projects:id (success)
    test("POST /projects/:id to modify returns status 200 and the following JSON", async () => {
        const req = require('./res/projects/post_projects_modify_req.json');
        const response = await axios.post(projectUrl + "/" + newProjectId, req);

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json');

        const expected = require('./res/projects/post_projects_modify_res.json');
        expect(response.data.id).toEqual(newProjectId);
        expect(response.data.title).toEqual(expected.title);
        expect(response.data.description).toEqual(expected.description);
        expect(response.data.completed).toEqual(expected.completed);
        expect(response.data.active).toEqual(expected.active);
        expect(response.data.tasks).toEqual(expected.tasks);

    });

    // test DELETE /projects/:id
    test("DELETE /projects/:id returns status 200 and the following JSON", async () => {
        const response = await axios.delete(projectUrl + "/" + newProjectId);

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json');
    });


     // test GET /projects:id after DELETE
     test("GET /projects/:id after DELETE returns status 200 and the following JSON", async () => {
        try{

        
        let response = await axios.get(projectUrl + "/" + newProjectId);
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json');

        response = response.data.projects;
        expect(response.length).toBe(0);

        response = response[0];
        expect(response.data).toBeNull();

    } catch(error){
        throw new Error(`Test failed due to bug: project was not deleted`)
    }
    });

    // test GET /projects/:id/tasks
    test("GET /projects/:id/tasks returns status 200 and the following JSON", async () => {
        try {
        let response = await axios.get(projectUrl + "/1/tasks");
    
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json');
    
        let expected = require('./res/projects/get_projects_id_tasks_res.json');
        response = response.data.todos[0];
        expected = expected.todos[0];

        expect(response.id).toEqual(expected.id);
        expect(response.title).toEqual(expected.title);
        expect(response.doneStatus).toEqual(expected.doneStatus);
        expect(response.description).toEqual(expected.description);

    } catch (error) {
        throw new Error(`Test failed due to bug: task objects are not received with IDs in natural order`)
    }
});
    // test GET /projects/:id/tasks with inexistent ID
    test("GET /projects/:id/tasks returns status 200 and the following JSON", async () => {
        try {
        let response = await axios.get(projectUrl + "/20/tasks");
    
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json');

        response = response.data.tasks;

        expect(response).toBeNull();

    } catch (error) {
        throw new Error(`Test failed due to bug: task objects are still received while project inexistent`)
    }
});

    //test GET /projects/:id/categories with inexistent ID
    test("GET /projects/:id/tasks returns status 200 and the following JSON", async () => {
        try {
        let response = await axios.get(projectUrl + "/14/categories");

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json');

        response = response.data.categories;

        expect(response).toBeNull();

    } catch (error) {
        throw new Error(`Test failed due to bug: categories objects are still received while project inexistent`)
    }
    });


    test('should return data from API', async () => {
        const response = await axios.get(apiUrl);
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
    });
});


