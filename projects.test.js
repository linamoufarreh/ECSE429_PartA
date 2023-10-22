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
            let response = await axios.get(projectUrl);
        
            expect(response.status).toBe(200);
            expect(response.headers['content-type']).toBe('application/json');
        
            let expected = require('./res/projects/get_projects.json');
            response = response.data.projects;
            expected = expected.projects;

            expect(response.length).toBe(expected.length);
            expect(response).toIncludeSameMembers(expected);
    });
    

    test(" [BUG] POST /projects with valid body returns status 201 and random project IDs", async () => {
        const req1 = require('./res/projects/post_projects_req.json');
        const req2 = require('./res/projects/post_projects_req.json');
       
        // POST the first project
        let response1 = await axios.post(projectUrl, req1);
        expect(response1.status).toBe(201);
        expect(response1.headers['content-type']).toBe('application/json');
      
        // POST the second project
        let response2 = await axios.post(projectUrl, req2);
        expect(response2.status).toBe(201);
        expect(response2.headers['content-type']).toBe('application/json');
      
        // Ensure both projects have random IDs
        const projectId1 = response1.data.id;
        const projectId2 = response2.data.id;

        try{
        expect(projectId1).toEqual(projectId2-1);
      
        //Delete the first project
        response1 = await axios.delete(projectUrl + "/" + projectId1);
        expect(response1.status).toBe(200);
        expect(response1.headers['content-type']).toBe('application/json');
      
        //Delete the second project
        response2 = await axios.delete(projectUrl + "/" + projectId2);
        expect(response2.status).toBe(200);
        expect(response2.headers['content-type']).toBe('application/json');

        } catch (error){
            throw new Error(`Test failed due to bug: Project IDs are not in natural order`)

        } finally {
            // Delete the first project, if it was created
              const response1 = await axios.delete(projectUrl + "/" + projectId1);
              expect(response1.status).toBe(200);
              expect(response1.headers['content-type']).toBe('application/json');
            
        
            // Delete the second project
              const response2 = await axios.delete(projectUrl + "/" + projectId2);
              expect(response2.status).toBe(200);
              expect(response2.headers['content-type']).toBe('application/json');
            
        }
      });

    //Behavior of Bug #1: Project IDs  generated in random order.

    test(" [BUG BEHAVIOR] POST /projects with valid body returns status 201 and random project IDs", async () => {
        const req1 = require('./res/projects/post_projects_req.json');
        const req2 = require('./res/projects/post_projects_req.json');
      
        // POST the first project
        let response1 = await axios.post(projectUrl, req1);
        expect(response1.status).toBe(201);
        expect(response1.headers['content-type']).toBe('application/json');
      
        // POST the second project
        let response2 = await axios.post(projectUrl, req2);
        expect(response2.status).toBe(201);
        expect(response2.headers['content-type']).toBe('application/json');
      
        // Ensure both projects have random IDs
        const projectId1 = response1.data.id;
        const projectId2 = response2.data.id;
        expect(projectId1).not.toEqual(projectId2-1);
      
        //Delete the first project
        response1 = await axios.delete(projectUrl + "/" + projectId1);
        expect(response1.status).toBe(200);
        expect(response1.headers['content-type']).toBe('application/json');
      
        //Delete the second project
        response2 = await axios.delete(projectUrl + "/" + projectId2);
        expect(response2.status).toBe(200);
        expect(response2.headers['content-type']).toBe('application/json');
      });


    // test GET /projects?title=Office Work
    test("GET /projects?title=Office Work returns status 200 and the following JSON", async () => {
        const response = await axios.get(projectUrl + "?title=Office Work");
        
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json');

        const expected = require('./res/projects/get_projects_title_office_work.json');
        expect(response.data).toMatchObject(expected);
        
    });
    
    // test GET /projects?completed=false
    test("GET /projects?completed=false returns status 200 and the following JSON", async () => {
        const response = await axios.get(projectUrl + "?completed=false");
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json');
        
        const expected = require('./res/projects/get_projects_completed_false.json');
     
        expect(response.data).toMatchObject(expected);
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

     
    
    // test POST /projects with valid body
    
    test("POST /projects with valid body returns status 201 and the following JSON", async () => {
        const req = require('./res/projects/post_projects_req.json');
        let response = await axios.post(projectUrl, req);

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
        
        const newProjectId = response.data.id;

        // Delete the new todo and test if it was sucessfully deleted
        response = await axios.delete(projectUrl + "/" + newProjectId);
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json');
    });




// Test POST /projects with valid body and then GET /projects/:id after POST
test("POST /projects with valid body returns status 201 and GET /projects/:id returns status 200 with the expected JSON", async () => {
    // Test POST
    const postRequest = require('./res/projects/post_projects_req.json');
    let postResponse = await axios.post(projectUrl, postRequest);

    expect(postResponse.status).toBe(201);
    expect(postResponse.headers['content-type']).toBe('application/json');

    const expectedPostResponse = {
        title: "project X",
        completed: "false",
        active: "true",
        description: "",
        tasks: []
    };

    expect(postResponse.data.title).toEqual(expectedPostResponse.title);
    expect(postResponse.data.completed).toEqual(expectedPostResponse.completed);
    expect(postResponse.data.active).toEqual(expectedPostResponse.active);
    expect(postResponse.data.description).toEqual(expectedPostResponse.description);

    const thisProjectId = postResponse.data.id;

    // Test GET
    let getRequest = await axios.get(projectUrl + "/" + thisProjectId);

    expect(getRequest.status).toBe(200);
    expect(getRequest.headers['content-type']).toBe('application/json');

    const expectedGetResponse = require('./res/projects/get_projects_id.json');

    getRequest = getRequest.data.projects;
    expect(getRequest.length).toBe(1);

    getRequest = getRequest[0];
    expect(getRequest.id).toEqual(thisProjectId);
    expect(getRequest.title).toEqual(expectedGetResponse.projects[0].title);
    expect(getRequest.description).toEqual(expectedGetResponse.projects[0].description);
    expect(getRequest.completed).toEqual(expectedGetResponse.projects[0].completed);
    expect(getRequest.active).toEqual(expectedGetResponse.projects[0].active);
    expect(getRequest.tasks).toEqual(expectedGetResponse.projects[0].tasks);

    postResponse = await axios.delete(projectUrl + "/" + thisProjectId);
    expect(postResponse.status).toBe(200);
    expect(postResponse.headers['content-type']).toBe('application/json');
});


     // test POST modifying /projects:id (success)
    test("POST /projects/:id to modify returns status 200 and the following JSON", async () => {
        let req = require('./res/projects/post_projects_req.json');

        let response = await axios.post(projectUrl, req);
        const newProjectId= response.data.id;

        expect(response.status).toBe(201);
        expect(response.headers['content-type']).toBe('application/json');

        req = require('./res/projects/post_projects_modify_req.json');
        response = await axios.post(projectUrl + "/" + newProjectId, req);
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json');

        const expected = require('./res/projects/post_projects_modify_res.json');
        expect(response.data.id).toEqual(newProjectId);
        expect(response.data.title).toEqual(expected.title);
        expect(response.data.description).toEqual(expected.description);
        expect(response.data.completed).toEqual(expected.completed);
        expect(response.data.active).toEqual(expected.active);
        expect(response.data.tasks).toEqual(expected.tasks);

         // Delete the new project and test if it was sucessfully deleted
         response = await axios.delete(projectUrl + "/" + newProjectId);
         expect(response.status).toBe(200);
         expect(response.headers['content-type']).toBe('application/json');
    });

    //test DELETE/projects/:id
    test("DELETE /projects/:id returns status 200 and the following JSON", async () => {
        // Create a new project and test if it was sucessfully created
        const req = require('./res/projects/post_projects_req.json');
        let response = await axios.post(projectUrl, req);
        const newProjectId = response.data.id;
        expect(response.status).toBe(201);
        expect(response.headers['content-type']).toBe('application/json');

        // Test DELETE /todos/:id
        response = await axios.delete(projectUrl + "/" + newProjectId);
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json');
    });

    // test GET /projects/:id/tasks
    test(" GET /projects/:id/tasks returns status 200 and the following JSON", async () => {
        let response = await axios.get(projectUrl + "/1/tasks");
    
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json');
    
        let expected = require('./res/projects/get_projects_id_tasks_res.json');
        // response = response.data
        // expected = expected.data;

        expect(response.length).toEqual(expected.length);  
});

    // test GET /projects/:id/tasks with nonexistent project ID
    test(" [BUG] GET /projects/:id/tasks returns status 200 and the following JSON", async () => {
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
    //Behavior of Bug #2: Tasks of other projects received while Project ID nonexistent
    test(" [BUG BEHAVIOR] GET /projects with tasks returns status 201 and GET project with invalid ID", async () => {
        //GET tasks of a project with random ID
        const invalidId = Math.floor(Math.random() * 10);
        response =  await axios.get(projectUrl + "/" + invalidId+ '/tasks');

        if (invalidId!= 1){
            expect(response.status).toBe(200);
        }
    });


    //test GET /projects/:id/categories with nonexistent project ID
    test(" [BUG] GET /projects/:id/tasks returns status 200 and the following JSON", async () => {
        try {
        const invalidId= Math.floor(Math.random() * 10);
        if (invalidId.toEqual(1)){
            invalidId= Math.floor(Math.random() * 10);
        }
        let response = await axios.get(projectUrl + "/" + invalidId+ "/categories");

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json');

        response = response.data.categories;

        expect(response).toBeNull();

    } catch (error) {
        throw new Error(`Test failed due to bug: categories objects are still received while project inexistent`)
    }
    });

    //Behavior of Bug #3: Categories of other projects received while Project ID nonexistent
    test(" [BUG BEHAVIOR] POST /projects with categories returns status 201 and GET project with invalid ID", async () => {
        const req = require('./res/projects/post_projects_with_category.json');
        let response = await axios.post(projectUrl, req);
        expect(response.status).toBe(201);
        expect(response.headers['content-type']).toBe('application/json');
        const projectId = response.data.id;

        //GET categories of a project with random ID

        const invalidId = Math.floor(Math.random() * 10);
        response =  await axios.get(projectUrl + "/" + invalidId+ '/categories');

        if (invalidId!=projectId){
            expect(response.status).toBe(200);
        }

        //DELETE project that was created
        response = await axios.delete(projectUrl + "/" + projectId);
        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe('application/json');

    });


    test('should return data from API', async () => {
        const response = await axios.get(apiUrl);
        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();
    });
});


