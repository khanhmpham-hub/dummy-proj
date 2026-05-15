import { test, expect, request, APIRequest} from '@playwright/test';
import newPet from '../test_data/post_new_pet.json';
import petSchema from '../schema/pet_store_schema.json';
import Ajv from 'ajv';
import { GET_PET_BYSTATUS_ENDPOINT, BASE_URL } from '../service/pet.service';
import { KAssert } from '../utils/validate_utils';

const kAssert = new KAssert();


['available', 'pending', 'sold'].forEach((status)=>{
  test(`get pet by status ${status}`, async ({ request }) => {
    const res = await request.get(`${GET_PET_BYSTATUS_ENDPOINT}${status}`);
    await kAssert.validate_response_status(res, "ok");
    const data = await res.json();
    expect(data).toBeInstanceOf(Array);
    if (data.length === 0) {
      console.log(`No pet with status ${status} found.`);
      return;
    }
    for (let pet of data) {
      kAssert.validate_schema(pet, petSchema);
      kAssert.compare_fields(pet, { status: status });
    }

  });
});


test('post new pet into store', async ({ request }) => {
  const data = JSON.parse(JSON.stringify(newPet));
  data.id = Math.floor(Math.random() * 1000000) + 1; // Random ID between 1 and 1000000
  const res = await request.post(`${BASE_URL}`, { data: data });
  await kAssert.validate_response_status(res, "ok");
  let responseData = await res.json();
  kAssert.validate_schema(responseData, petSchema);
});

test('put update existing pet', async ({ request }) => {
  const data = JSON.parse(JSON.stringify(newPet));
  data.id = Math.floor(Math.random() * 1000000) + 1; // Random ID between 1 and 1000000
  const res = await request.post(`${BASE_URL}`, { data: data });
  await kAssert.validate_response_status(res, "ok");
  let responseData = await res.json()
  data.name = "Updated Pet Name";
  let responseFromFinding = await request.put(`${BASE_URL}`, { data: data });
  await kAssert.validate_response_status(responseFromFinding, "ok");
  const responseFromFindingAfterUpdate = await request.get(`${BASE_URL}${responseData.id}`);
  let updatedData = await responseFromFindingAfterUpdate.json()
  kAssert.validate_schema(updatedData, petSchema);
  kAssert.compare_fields(updatedData, data);
  const deleteRes = await request.delete(`${BASE_URL}${responseData.id}`);
  await kAssert.validate_response_status(deleteRes, "ok");
  responseFromFinding = await request.get(`${BASE_URL}${responseData.id}`);
  await kAssert.validate_response_status(responseFromFinding, "not_ok");
});
