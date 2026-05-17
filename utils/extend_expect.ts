import { APIResponse, expect as baseExpect } from "@playwright/test";
import Ajv from "ajv";

const statusCodes: Record<string, number> = {
  ok: 200,
  created: 201,
  accepted: 202,
  noContent: 204,

  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notFound: 404,
  methodNotAllowed: 405,
  conflict: 409,
  unprocessableEntity: 422,
  tooManyRequests: 429,

  internalServerError: 500,
  badGateway: 502,
  serviceUnavailable: 503,
  gatewayTimeout: 504,
};

export const expect = baseExpect.extend({
  async toBeStatus(apiRes: APIResponse, expectStatus: string) {
    const expectedCode = statusCodes[expectStatus];
    const actualCode = apiRes.status();

    const pass = expectedCode === actualCode;

    return {
      pass,
      message: () =>
        pass
          ? `Expected response not to be ${expectStatus}`
          : `Expected status ${expectedCode}, but got ${actualCode}`,
    };
  },
  async toValidateSchema(data: any, schema: any){
    const adj = new Ajv()
    const validate = adj.compile(schema)
    const check = validate(data)
    if (check){
      return {
        message:()=>"passed",
        pass: true,
      };
    } else {
      let error_messages = ""
      validate.errors?.forEach((err)=>{
        error_messages+=`\n Field: ${err.instancePath} \n Error: ${err.message}`
      })

      return {
        message: ()=>`Validate Schema failed\n${error_messages}, `,
        pass: false
      }
    }
  },
  async toCompareFields(data: any, fields_to_compare: any) {
    const matches = Object.entries(fields_to_compare).every(
      ([key, value]) => data[key as keyof typeof data] === value
    );
    if(matches){
      return{
        message: () => "passed",
        pass: true
      };
    }
    else {
      return{
        message: () => `Compare fields failed \n ${data} \n is not equal with: \n ${fields_to_compare}`,
        pass:false
      }
    }
  }
});

(globalThis as any).expect = expect;
