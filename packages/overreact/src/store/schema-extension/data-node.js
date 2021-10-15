import { DataRef } from './data-ref';

// this will be attached to the schema node as an extension
// and represent all data stored under the data path given by the schema node
// each data node contains an array of data IDs
// which refers to the actual data record in the store.
export class DataNode {
  constructor() {
    this.dataRefs = {};

    this.getDataRef = this.getDataRef.bind(this);
    this.dataRefIdsUpdate = this.dataRefIdsUpdate.bind(this);
    this.entitiesCreated = this.entitiesCreated.bind(this);
    this.entitiesDeleted = this.entitiesDeleted.bind(this);
  }

  getDataRef(key) {
    if (!this.dataRefs[key]) {
      this.dataRefs[key] = new DataRef(key);
    }

    return this.dataRefs[key];
  }

  dataRefIdsUpdate(recordGroup, updatedIds, request) {
    Object.keys(this.dataRefs).forEach(key => this.dataRefs[key].onUpdate(updatedIds, request));
  }

  entitiesCreated(recordGroup, ids) {
    Object.keys(this.dataRefs).forEach(key => this.dataRefs[key].onEntitiesCreated(ids));
  }

  entitiesDeleted(recordGroup, ids) {
    Object.keys(this.dataRefs).forEach(key => this.dataRefs[key].onEntitiesDeleted(ids));
  }

  toJson() {
    return ({
      dataRefs: Object.keys(this.dataRefs).map(k => this.dataRefs[k].toJson()),
    });
  }
}
