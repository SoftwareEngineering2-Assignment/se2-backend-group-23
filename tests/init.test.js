//* eslint-disable import/no-unresolved */
require('dotenv').config();

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const test = require('ava').default;
const got = require('got');
const listen = require('test-listen');
const Source = require('../src/models/source');
const mongoose = require('mongoose');
const app = require('../src/index');
const {jwtSign} = require('../src/utilities/authentication/helpers');


const authToken = { username: "ecchanos", id: "63a1cd674211b05e99f5b7a2", email: "vaggelichanos@outlook.com" };
var SourceName = "Source" + Math.floor(Math.random() * 10000);


test.before(async (t) => {
  t.context.server = http.createServer(app);
  t.context.prefixUrl = await listen(t.context.server);
  t.context.got = got.extend({http2: true, throwHttpErrors: false, responseType: 'json', prefixUrl: t.context.prefixUrl});
});

test.after.always((t) => {
  t.context.server.close();
});

test('GET /statistics returns correct response and status code', async (t) => {
  const {body, statusCode} = await t.context.got('general/statistics');
  
  t.assert(body.success);
  t.is(statusCode, 200);
});

//================================Sources=============================
test("get /sources returns correct response and status code ", async (t) => {

  const token = jwtSign(authToken);
  const {body,statusCode} = await t.context.got(`sources/sources?token=${token}`);
  Sources=body.sources;
  t.is(statusCode, 200);
  t.assert(body.success);
  t.assert(body.sources);
  
})

test("post /create-source returns correct response and status code when the source with this name exists", async (t) => {

  const token = jwtSign(authToken);
  const newSource ={
      json:{
          name:'Source',
          type: 'stomp',
          url: 'ws://<DOMAIN>:<WEB_STOMP_PORT>/ws',
          login:'Test',
          passcode:'Test',
          vhost:''
      }
  }
  const {body,statusCode} = await t.context.got.post(`sources/create-source?token=${token}`,newSource);
  t.is(statusCode, 200);
  t.is(body.status,409);
  t.is(body.message,'A source with that name already exists.');
})

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

test("post /change-source returns correct response and status code when the source with this id doesn't exists", async (t) => {

  const token = jwtSign(authToken);
  const SourceToChange ={
      json:{
          id:1
      }
  }
  const {body,statusCode} = await t.context.got.post(`sources/create-source?token=${token}`,SourceToChange);
  t.is(statusCode, 404);
})

test("post /change-source returns correct response and status code when the source with this id does exists", async (t) => {

  const token = jwtSign(authToken);
  
  
  
  const SourceToChange ={
      json:{
        id:"63c553d029952c248c57b77f",
        name:"Changed Name"
      }
  }
  const {body,statusCode} = await t.context.got.post(`sources/create-source?token=${token}`,SourceToChange);
  t.is(statusCode, 200);
})