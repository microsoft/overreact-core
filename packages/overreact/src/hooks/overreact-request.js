export class OverreactRequest {
  constructor(options) {
    Object.assign(this, options);

    if (!this.id || !this.requestContract) {
      throw new Error('id and requestContract are required fields to build request object');
    }
  }
}
