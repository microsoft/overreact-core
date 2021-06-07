export class Record {
  constructor(id, type, data) {
    this.id = id;
    this.type = type;
    this.data = data;

    this.setValue = this.setValue.bind(this);
    this.getValue = this.getValue.bind(this);
    this.setData = this.setData.bind(this);
    this.getData = this.getData.bind(this);
  }

  setValue(key, value) {
    this.data = {
      ...this.data,
      [key]: value,
    };
  }

  getValue(key) {
    return this.data[key];
  }

  setData(data) {
    this.data = {
      ...this.data,
      ...data,
    };
  }

  getData() {
    return this.data;
  }
}
