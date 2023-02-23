//* eslint-disable import/no-unresolved */

require('dotenv').config();

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const test = require('ava').default;
const got = require('got');
const listen = require('test-listen');
const {mongoose} = require('../src/config');

const Source = require('../src/models/source');
const app = require('../src/index');
const {jwtSign} = require('../src/utilities/authentication/helpers');
const Dashboard = require('../src/models/dashboard');


const authToken = {id: "63a1cd674211b05e99f5b7a2"};
var SourceName = "Source" + Math.floor(Math.random() * 10000);
var ChangeName = "Change Source" + Math.floor(Math.random() * 10000);

test.before(async (t) => {
  t.context.server = http.createServer(app);
  t.context.prefixUrl = await listen(t.context.server);
  t.context.got = got.extend({http2: true, throwHttpErrors: false, responseType: 'json', prefixUrl: t.context.prefixUrl});

});

function errorFunction(err){
  if(err) console.log(err);
  console.log("Successful deletion");
}

//After all the tests have been executed we delete all the sources and dashboards we created for the tests.
test.after.always((t) => {
  t.context.server.close();
  Source.deleteMany({}).then(errorFunction);
  Dashboard.deleteMany({}).then(errorFunction);
});


test('GET /statistics returns correct response and status code', async (t) => {
  const {body, statusCode} = await t.context.got('general/statistics');
  
  t.assert(body.success);
  t.is(statusCode, 200);
});

//================================Sources=============================

//We see if we can create a source with a name that doesn't exist in the database.
test("post /create-source returns correct response and status code when the source with this name doesn't exists", async (t) => {

  const token = jwtSign(authToken);
  const newSource ={
      json:{
          name: SourceName,
          type: 'stomp',
          url: 'ws://<DOMAIN>:<WEB_STOMP_PORT>/ws',
          login:'Test',
          passcode:'Test',
          vhost:''
      }
  }
  const {body,statusCode} = await t.context.got.post(`sources/create-source?token=${token}`,newSource);
  t.is(statusCode, 200);
  t.assert(body.success);
})

//We see if we get an error response if we try to create a source with a name that already exists.
test("post /create-source returns correct response and status code when the source with this name exists", async (t) => {

  const token = jwtSign(authToken);
  NewSource= await Source({name: 'Source', type: '', url: '', login:'', passcode:'', vhost:'',owner: '63a1cd674211b05e99f5b7a2'}).save();

  const newSource ={
      json:{
          name: 'Source'
         
      }
  }
  const {body,statusCode} = await t.context.got.post(`sources/create-source?token=${token}`,newSource);


  t.is(statusCode, 200);
  t.is(body.status,409);
  t.is(body.message,'A source with that name already exists.');
})


//We see if we get an error response by trying to change a source with an id that doesn't exist.
test("post /change-source returns correct response and status code when the source with this id doesn't exists", async (t) => {

  const token = jwtSign(authToken);
  const SourceToChange ={
      json:{
          id:1
      }
  }
  const {body,statusCode} = await t.context.got.post(`sources/change-source?token=${token}`,SourceToChange);
  t.is(statusCode, 200);
  t.is(body.status,409);
  t.is(body.message,'The selected source has not been found.');
})

//We see if we get the right response by trying to change a source with an id that does exist.
test("post /change-source returns correct response and status code when the source with this id does exists", async (t) => {

  const token = jwtSign(authToken);
  
  
  source1 = await Source({name:'sourceName1',type: '',url:'',login:'',passcode:'',vhost: '',owner: '63a1cd674211b05e99f5b7a2'}).save();
  const SourceToChange ={
      json:{
        id:source1._id,
        name:ChangeName
      }
  }
  const {body,statusCode} = await t.context.got.post(`sources/create-source?token=${token}`,SourceToChange);
  t.is(statusCode, 200);
  t.assert(body.success)
})

//We see if we get the right response by trying to delete a source with an id that does exist.
test("post  /delete-source returns correct response and status code when the source with this id does exists", async (t) => {
  mongoose();
  const token = jwtSign(authToken);
  
  NewSource= await Source({name: "SourceToDelete", type: '', url: '', login:'', passcode:'', vhost:'',owner: '63a1cd674211b05e99f5b7a2'}).save();
  
  const SourceToDelete ={
      json:{
        id:NewSource._id,
      }
  }

  const {body,statusCode} = await t.context.got.post(`sources/delete-source?token=${token}`,SourceToDelete);
  t.is(statusCode, 200);
  t.assert(body.success)

})

//We see if we get an error response by trying to delete a source with an id that doesn't exist.
test("post /delete-source returns correct response and status code when the source with this id doesn't exists", async (t) => {

  const token = jwtSign(authToken);
  const newSource ={
      json:{
          id: 1
      }
  }
  const {body,statusCode} = await t.context.got.post(`sources/delete-source?token=${token}`,newSource);
  t.is(statusCode, 200);
  t.is(body.status,409);
  t.is(body.message,'The selected source has not been found.');
})

//We see if we get all the sources that exist to the database of this account.
test("get /sources returns correct response and status code ", async (t) => {

  const token = jwtSign(authToken);
  const {body,statusCode} = await t.context.got(`sources/sources?token=${token}`);

  t.is(statusCode, 200);
  t.assert(body.success);
  t.assert(body.sources);
  
})

//================================ Dashboards =============================

//We see if we get all the dashboards that exist to the database of this account.
test("get /dashboards returns correct response and status code ", async (t) => {

  const token = jwtSign(authToken);
  const {body,statusCode} = await t.context.got(`dashboards/dashboards?token=${token}`);
  t.is(statusCode, 200);
  t.assert(body.success);
  t.assert(body.dashboards);

})

//We see if we can create a dashboard with a name that doesn't exist in the database.
test("post /create-dashboard returns correct response and status code when the dashboard with this name doesn't exists", async (t) => {
  
  const token = jwtSign(authToken);
  const newDashboard ={
      json:{name: 'DashboardName1'}
  }
  const {body,statusCode} = await t.context.got.post(`dashboards/create-dashboard?token=${token}`,newDashboard);
  

  t.is(statusCode, 200);
  t.assert(body.success);
})

//We see if we can create a dashboard with a name that does exist in the database.
test("post /create-dashboard returns correct response and status code when the dashboard with this name exists", async (t) => {

  
  const token = jwtSign(authToken);

  const newDashboard ={
    json:{name: "DashboardName2"}
  }
  await Dashboard({owner: "63a1cd674211b05e99f5b7a2",
                   name: "DashboardName2"}).save();

  const {body,statusCode} = await t.context.got.post(`dashboards/create-dashboard?token=${token}`,newDashboard);


  t.is(statusCode, 200);
  t.is(body.status,409);
  t.is(body.message,'A dashboard with that name already exists.');
})

//We see if we can delete a dashboard with an id that does exist in the database.
test("post  /delete-dashboard returns correct response and status code when the dashboard with this id does exists", async (t) => {
  mongoose();
  const token = jwtSign(authToken);
  
  newDashboard= await Dashboard({name: "DashboardToDelete", owner: '63a1cd674211b05e99f5b7a2'}).save();

  const newDashboard2 ={
      json:{
        id:newDashboard._id,
      }
  }

  const {body,statusCode} = await t.context.got.post(`dashboards/delete-dashboard?token=${token}`,newDashboard2);


  t.is(statusCode, 200);
  t.assert(body.success)

})

//We see if we can delete a dashboard with an id that doesn't exist in the database.
test("post /delete-dashboard returns correct response and status code when the dashboard with this id doesn't exists", async (t) => {

  const token = jwtSign(authToken);
  const newDashboard ={
      json:{
          id: 1
      }
  }
  const {body,statusCode} = await t.context.got.post(`dashboards/delete-dashboard?token=${token}`,newDashboard);
  t.is(statusCode, 200);
  t.is(body.status,409);
  t.is(body.message,'The selected dashboard has not been found.');
})


//We see if we can clone a dashboard and putting an name that doesn't exist in the database.
test("post /clone-dashboard returns correct response and status code when the dashboard with this name doesn't exists", async (t) => {
  
  const token = jwtSign(authToken);


  existingDashboard = await Dashboard({owner: "63a1cd674211b05e99f5b7a2",
                                       name: "DashboardName3"}).save();

  const clonePayload ={
      json:{dashboardId: existingDashboard.id, name: 'DashboardName4'}
  }
  const {body,statusCode} = await t.context.got.post(`dashboards/clone-dashboard?token=${token}`,clonePayload);

  t.is(statusCode, 200);
  t.assert(body.success);
})

//We see if we can clone a dashboard and putting an name that does exist in the database.
test("post /clone-dashboard returns correct response and status code when the dashboard with this name exists", async (t) => {

  const token = jwtSign(authToken);

  existingDashboard = await Dashboard({owner: "63a1cd674211b05e99f5b7a2",
                   name: "DashboardName5"}).save();

  const clonePayload ={
      json:{dashboardId: existingDashboard.id, name: 'DashboardName5'}
  }

  const {body,statusCode} = await t.context.got.post(`dashboards/clone-dashboard?token=${token}`,clonePayload);


  t.is(statusCode, 200);
  t.is(body.status,409);
  t.is(body.message,'A dashboard with that name already exists.');
})

//We see if we can save a dashboard with an id that doesn't exist in the database.
test("post /save-dashboard returns correct response and status code when the dashboard with this id doesn't exist", async (t) => {
  
  const token = jwtSign(authToken);

  const savePayload ={
    json:{id: 2, layout: [], items: {}, nextId: 2}
  }

  const {body,statusCode} = await t.context.got.post(`dashboards/save-dashboard?token=${token}`,savePayload);
  
  t.is(statusCode, 200);
  t.is(body.status,409);
  t.is(body.message,'The selected dashboard has not been found.');

})

//We see if we can save a dashboard with an id that does exist in the database.
test("post /save-dashboard returns correct response and status code when the dashboard with this id exists", async (t) => {

  const token = jwtSign(authToken);

  existingDashboard = await Dashboard({owner: "63a1cd674211b05e99f5b7a2",
                   name: "DashboardName6"}).save();

  const savePayload ={
    json:{id: existingDashboard.id, layout: [], items: {}, nextId: 2}
  }

  const {body,statusCode} = await t.context.got.post(`dashboards/save-dashboard?token=${token}`,savePayload);

  t.is(statusCode, 200);
  t.assert(body.success);
})

//We see if we can share a dashboard with an id that doesn't exist in the database.
test("post /share-dashboard returns correct response and status code when the dashboard with this id doesn't exist", async (t) => {
  
  const token = jwtSign(authToken);

  const sharePayload ={
    json:{dashboardId: 3}
  }

  const {body,statusCode} = await t.context.got.post(`dashboards/share-dashboard?token=${token}`, sharePayload);
  
  t.is(statusCode, 200);
  t.is(body.status,409);
  t.is(body.message,'The specified dashboard has not been found.');

})

//We see if we can share a dashboard with an id that does exist in the database.
test("post /share-dashboard returns correct response and status code when the dashboard with this id exists", async (t) => {

  const token = jwtSign(authToken);

  existingDashboard = await Dashboard({owner: "63a1cd674211b05e99f5b7a2",
                   name: "DashboardName7"}).save();

  const sharePayload ={
    json:{dashboardId: existingDashboard.id}
  }

  const {body: b1, statusCode: sc1} = await t.context.got.post(`dashboards/share-dashboard?token=${token}`, sharePayload);
  const {body: b2, statusCode: sc2} = await t.context.got.post(`dashboards/share-dashboard?token=${token}`, sharePayload);

  t.is(sc1, 200);
  t.assert(b1.success);
  t.assert(b1.shared);
  t.is(sc2, 200);
  t.assert(b2.success);
  t.assert(!b2.shared);
})

//We see if we can change the password of a dashboard with an id that doesn't exist in the database.
test("post /dashboards/change-password returns correct response and status code when the dashboard with this id doesn't exist", async (t) => {
  
  const token = jwtSign(authToken);

  const passwordPayload ={
    json:{dashboardId: 4, password: "1"}
  }

  const {body,statusCode} = await t.context.got.post(`dashboards/change-password?token=${token}`, passwordPayload);
  
  t.is(statusCode, 200);
  t.is(body.status,409);
  t.is(body.message,'The specified dashboard has not been found.');

})

//We see if we can change the password of a dashboard with an id that does exist in the database.
test("post /dashboards/change-password returns correct response and status code when the dashboard with this id exists", async (t) => {

  const token = jwtSign(authToken);

  existingDashboard = await Dashboard({owner: "63a1cd674211b05e99f5b7a2",
                                       name: "DashboardName8"}).save();

  const passwordPayload ={
    json:{dashboardId: existingDashboard.id, password: "1"}
  }

  const {body,statusCode} = await t.context.got.post(`dashboards/change-password?token=${token}`, passwordPayload);

  t.is(statusCode, 200);
  t.assert(body.success);
})