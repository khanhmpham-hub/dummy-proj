export {};

declare global {
  namespace PlaywrightTest {
    interface Matchers<R> {
      toBeStatus( expectStatus: string): Promise<R>,
      toValidateSchema(schema: any):Promise<R>,
      toCompareFields(fields_to_compare: any): Promise<R>
    }
  }
}
