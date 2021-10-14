import _ from 'underscore';
// Use the basic APIs of ES6 Map. If your site supports browsers not
// having Map natively, you should use a polyfill
import { RecordGroup } from './record-group';

export class Store {
  constructor(uniqueId) {
    this.uniqueId = uniqueId || _.uniqueId('Overreact_store_');
    this.recordGroups = {};
    this.preemptiveRecords = new Map();

    this.getRecordGroup = this.getRecordGroup.bind(this);

    if (window.__OVERREACT_DEVTOOLS__) {
      window.__OVERREACT_DEVTOOLS__.store = this;
      window.__OVERREACT_DEVTOOLS__.getStore(this);
    }
  }

  getRecordGroup(modelName) {
    if (!this.recordGroups[modelName]) {
      this.recordGroups[modelName] = new RecordGroup({
        schemaType: modelName,
        store: this,
      });
    }
    return this.recordGroups[modelName];
  }

  addPreemptiveRecords(key, records) {
    this.preemptiveRecords.set(key, records);
  }

  removePreemptiveRecords(key) {
    const records = this.preemptiveRecords.get(key);
    this.preemptiveRecords.delete(key);
    return records;
  }
}
