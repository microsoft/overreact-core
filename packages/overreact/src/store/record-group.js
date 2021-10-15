import _ from 'underscore';
import { Record } from './record';
import { OVERREACT_ID_FIELD_NAME } from './consts';
import { Subject } from '../utils/observer-pattern';

export class RecordGroup extends Subject {
  constructor({
    schemaType,
    store,
  }) {
    super();

    this.schemaType = schemaType;
    this.store = store;

    // records will be kept in chronological order
    // new records will always be kept at the end of the list
    this.records = [];

    this.addOrUpdateRecords = this.addOrUpdateRecords.bind(this);

    this.getRecords = this.getRecords.bind(this);
    this.getRecordsByEntityKeys = this.getRecordsByEntityKeys.bind(this);
  }

  findIndex(dataId) {
    return this.records.findIndex(r => r.id === dataId);
  }

  addOrUpdateRecordInternal(data) {
    const dataId = data[OVERREACT_ID_FIELD_NAME];
    const recordId = this.findIndex(dataId);

    if (recordId > -1) {
      // we're updating
      this.records[recordId].setData(data);
    } else {
      // "add" record - because we'll be appending
      const newRecord = new Record(dataId, this.schemaType, data);
      this.records.push(newRecord);
    }

    return dataId;
  }

  addOrUpdateRecords(dataItems, request) {
    const updatedDataIDs = dataItems.map(data => this.addOrUpdateRecordInternal(data));
    this.notify('dataRefIdsUpdate', updatedDataIDs, request);
    this.notifyUpdate();
  }

  deleteRecords(ids) {
    this.records = this.records.filter(record => !_.contains(ids, record.id));
    this.notifyUpdate();
  }

  getRecords(ids) {
    return ids.map(id => this.records.find(r => r.id === id));
  }

  getRecordsByEntityKeys(keySelector, keys) {
    return _.chain(keys)
      .map(key => this.records.find(r => keySelector(r.getData()) === key))
      .compact()
      .value();
  }

  notifyUpdate() {
    if (window.__OVERREACT_DEVTOOLS__) {
      const { onRecordGroupChange } = window.__OVERREACT_DEVTOOLS__;
      onRecordGroupChange({
        storeId: this.store.uniqueId,
        schemaType: this.schemaType,
        records: JSON.parse(JSON.stringify(this.records)),
      });
    }
  }
}
