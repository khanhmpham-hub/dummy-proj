import { APIResponse, expect } from "@playwright/test";
import Ajv from "ajv";

export class KAssert {
    public validate_schema(objectA: any,schema: any):any{
        try {
            const ajv = new Ajv();
            const validate = ajv.compile(schema);
            const valid = validate(objectA);
            return expect(valid).toBe(true)
        } catch (error) {            
            console.error("Error validating schema:", error);
            console.log("Object being validated:", objectA);
            throw error;
        }    
    }
    public compare_fields(objectA: any, expectValue: any = {}): any {
        const commonKeys = Object.keys(objectA).filter(key => key in expectValue);
        if(!commonKeys){
            return false
        } else {
            for(let key of commonKeys){
                if(objectA.key != expectValue.key){
                    return false
                }
            }
            return true
        }
    }

    public async validate_response_status(params:APIResponse, expected_status: string): Promise<any> {
        try {
            switch (expected_status) {
                case "ok": return await expect(params).toBeOK()
                case "not_ok": return await expect(params).not.toBeOK()
        }
        } catch (error) {
            console.error(`Expected status: ${expected_status}, but got: ${params.status()}`);
            throw error;
        }
    }
}