import _ from 'underscore';
import { Subject } from '../../utils/observer-pattern';

export class DataRef extends Subject {
  constructor(key) {
    super();
    this.key = key;
    this.idRefs = [];
    this.status = {
      previousVariables: undefined,
      lastUpdateTimestamp: Date.now(),
      error: undefined,
    };

    this.includes = this.includes.bind(this);
    this.push = this.push.bind(this);
    this.add = this.add.bind(this);
    this.delete = this.delete.bind(this);
    this.onUpdate = this.onUpdate.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
    this.onError = this.onError.bind(this);
    this.clearError = this.clearError.bind(this);
    this.onEntitiesCreated = this.onEntitiesCreated.bind(this);
    this.onEntitiesDeleted = this.onEntitiesDeleted.bind(this);
    this.reset = this.reset.bind(this);

    // TODO: use "cursor" for specific pagination needs
    this.cursor = {};

    this.UiComponents = [];
  }

  registerComponent({
    componentName,
  }) {
    this.UiComponents = _.uniq([...this.UiComponents, componentName]);
    this.updateDevTools();
  }

  unregisterComponent({
    componentName,
  }) {
    this.UiComponents = _.without(this.UiComponents, componentName);
    this.updateDevTools();
  }

  updateDevTools() {
    if (window.__OVERREACT_DEVTOOLS__) {
      const { onDataRefChange } = window.__OVERREACT_DEVTOOLS__;
      onDataRefChange({
        components: this.UiComponents,
        key: this.key,
        idRefs: this.idRefs,
      });
    }
  }

  includes(id) {
    return this.idRefs.includes(id);
  }

  push(id) {
    const ret = this.idRefs.push(id);

    return ret;
  }

  add(id) {
    // add/merge an id. If id exists in idRefs, do nothing
    if (this.includes(id)) {
      return;
    }

    this.push(id);
  }

  delete(ids) {
    if (_.intersection(this.idRefs, ids).length > 0) {
      this.idRefs = _.difference(this.idRefs, ids);
    }
  }

  onError(error, ...args) {
    this.status.error = error;
    this.notify('onError', error, ...args);
  }

  clearError() {
    this.onError(undefined);
  }

  // currently, we will always add something to this data ref after clear, and trigger event then
  // so here we don't trigger a notification anymore: this.notify('update', []);
  // otherwise UI component will get a incorrect empty status for short time
  clear() {
    this.idRefs = [];
    this.clearError();
  }

  reset(ids) {
    this.idRefs = ids;
    this.notify('update', ids);
  }

  updateStatus(newStatus) {
    this.status = {
      ...this.status,
      ...newStatus,
    };
  }

  onUpdate(updatedIds, request) {
    if (_.intersection(this.idRefs, updatedIds).length > 0) {
      this.notify('update', updatedIds, request);
    }
  }

  onEntitiesCreated(ids) {
    this.notify('onEntitiesCreated', ids);
  }

  onEntitiesDeleted(ids) {
    if (_.intersection(this.idRefs, ids).length > 0) {
      this.delete(ids);
      this.notify('update', this.idRefs);
    }
  }

  toJson() {
    return ({
      key: this.key,
      idRefs: this.idRefs,
      status: this.status,
    });
  }
}
