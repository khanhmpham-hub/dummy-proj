import { test, expect, request, APIRequest} from '@playwright/test';
import newPet from '../test_data/post_new_pet.json';
import petSchema from '../schema/pet_store_schema.json';
import Ajv from 'ajv';

const ajv = new Ajv();
const validate = ajv.compile(petSchema);

test('get pet by status', async ({ request }) => {
  const status = ['available', 'pending', 'sold'];
  for(const sta of status) {
    const res = await request.get(`/v2/pet/findByStatus?status=${sta}`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data).toBeInstanceOf(Array);
    expect(data.every((element: any)=> {
      if (data.length == 0) {
        console.log(`No pet with status ${sta} found.`);
        return false;
      }
      return element.status == sta;
    })).toBeTruthy();
  }
});

test('post new pet into store', async ({ request }) => {
  const data = JSON.parse(JSON.stringify(newPet));
  data.id = Math.floor(Math.random() * 1000000) + 1; // Random ID between 1 and 1000000
  const res = await request.post('/v2/pet', { data: data });
  expect(res.ok()).toBeTruthy();
  let responseData = await res.body();
  responseData= JSON.parse(responseData.toString());
  let responseFromFinding = await request.get(`/v2/pet/${responseData.id}`);
  responseData = await responseFromFinding.body();
  responseData = JSON.parse(responseData.toString());
  console.log(responseData);
  expect(validate(responseData)).toBeTruthy();
  expect(res.ok()).toBeTruthy();
  const deleteRes = await request.delete(`/v2/pet/${responseData.id}`);
  expect(deleteRes.ok()).toBeTruthy();
  responseFromFinding = await request.get(`/v2/pet/${responseData.id}`);
  expect(responseFromFinding.status()).toBe(404);

});

test('put update existing pet', async ({ request }) => {
  const data = JSON.parse(JSON.stringify(newPet));
  data.id = Math.floor(Math.random() * 1000000) + 1; // Random ID between 1 and 1000000
  const res = await request.post('/v2/pet', { data: data });
  expect(res.ok()).toBeTruthy();
  let responseData = await res.body();
  responseData= JSON.parse(responseData.toString());
  data.name = "Updated Pet Name";
  let responseFromFinding = await request.put(`/v2/pet`, { data: data });
  expect(responseFromFinding.ok()).toBeTruthy();
  const responseFromFindingAfterUpdate = await request.get(`/v2/pet/${responseData.id}`);
  let updatedData = await responseFromFindingAfterUpdate.body();
  updatedData = JSON.parse(updatedData.toString());
  console.log(updatedData);
  expect(validate(updatedData)).toBeTruthy();
  expect(updatedData.name).toBe("Updated Pet Name");
  const deleteRes = await request.delete(`/v2/pet/${responseData.id}`);
  expect(deleteRes.ok()).toBeTruthy();
  responseFromFinding = await request.get(`/v2/pet/${responseData.id}`);
  expect(responseFromFinding.status()).toBe(404);
});
