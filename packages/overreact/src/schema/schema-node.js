export class SchemaNode {
  constructor(name, modelName, parentNode, modelSchema) {
    this.name = name;
    this.childNodes = [];
    this.parentNode = parentNode;
    this.modelName = modelName;
    this.modelSchema = modelSchema;

    // extensions will serve as an extension point
    // where we can attach arbitrary information to
    // a schema node.
    // this is useful when we want to extend the schema
    // tree to include data.
    this.extensions = {};

    this.append = this.append.bind(this);
    this.setExtension = this.setExtension.bind(this);
    this.getExtension = this.getExtension.bind(this);
  }

  append(node) {
    this.childNodes.push(node);
  }

  setExtension(name, ext) {
    this.extensions[name] = ext;
  }

  getExtension(name) {
    return this.extensions[name];
  }

  toJson() {
    return ({
      name: this.name,
      modelName: this.modelName,
      modelSchema: this.modelSchema,
      childNodes: this.childNodes.length > 0 ? this.childNodes.map(c => c.toJson()) : undefined,
      extensions: Object.keys(this.extensions).length > 0
        ? Object.keys(this.extensions).map(k => this.extensions[k].toJson()) : undefined,
    });
  }
}
