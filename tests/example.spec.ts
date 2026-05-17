import { test, request, expect} from '@playwright/test';
import newPet from '../test_data/post_new_pet.json';
import petSchema from '../schema/pet_store_schema.json';
import { GET_PET_BYSTATUS_ENDPOINT, BASE_URL } from '../service/pet.service';


['available', 'pending', 'sold'].forEach((status)=>{
  test(`get pet by status ${status}`, async ({ request }) => {
    const res = await request.get(`${GET_PET_BYSTATUS_ENDPOINT}${status}`);
    expect(res).toBeStatus("ok");
    const data = await res.json();
    expect(data).toBeInstanceOf(Array);
    if (data.length === 0) {
      console.log(`No pet with status ${status} found.`);
      return;
    }
    for (let pet of data) {
      expect(pet).toValidateSchema(petSchema);
      expect(pet.status).toBe(status);
    }
  });
});


test('post new pet into store', async ({ request }) => {
  const data = JSON.parse(JSON.stringify(newPet));
  data.id = Math.floor(Math.random() * 1000000) + 1; // Random ID between 1 and 1000000
  const res = await request.post(`${BASE_URL}`, { data: data });
  const resData = await res.json()
  expect(res).toBeStatus('ok')
  expect(resData).toValidateSchema(petSchema)
});

test('put update existing pet', async ({ request }) => {
  const data = JSON.parse(JSON.stringify(newPet));
  data.id = Math.floor(Math.random() * 1000000) + 1; // Random ID between 1 and 1000000
  const res = await request.post(`${BASE_URL}`, { data: data });
  expect(res).toBeStatus('ok')
  let responseData = await res.json()
  data.name = "Updated Pet Name";
  let responseFromFinding = await request.put(`${BASE_URL}`, { data: data });
  expect(responseFromFinding).toBeStatus('ok')
  const responseFromFindingAfterUpdate = await request.get(`${BASE_URL}${responseData.id}`);
  let updatedData = await responseFromFindingAfterUpdate.json()
  expect(updatedData).toValidateSchema(petSchema)
  expect(updatedData).toCompareFields({name:"Updated Pet Name"})
  const deleteRes = await request.delete(`${BASE_URL}${responseData.id}`);
  expect(deleteRes).toBeStatus('ok')
  responseFromFinding = await request.get(`${BASE_URL}${responseData.id}`);
  expect(responseFromFinding).toBeStatus('notFound')
});
