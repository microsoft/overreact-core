import { SchemaNode } from './schema-node';

const PATH_DELIMITER = ':';

export class Schema {
  constructor(schemaToModelMapping, modelGetter) {
    this.root = new SchemaNode('$ROOT', null, null);
    this.schemaToModelMapping = schemaToModelMapping;
    this.modelGetter = modelGetter;

    this.modelToSchemaMapping = {};

    this.buildModelToSchemaMap();

    this.insert = this.insert.bind(this);
    this.getSchemaNames = this.getSchemaNames.bind(this);
  }

  buildModelToSchemaMap() {
    const keys = Object.keys(this.schemaToModelMapping);
    keys.forEach((schemaName) => {
      const modelName = this.schemaToModelMapping[schemaName];
      if (!this.modelToSchemaMapping[modelName]) {
        this.modelToSchemaMapping[modelName] = [];
      }
      this.modelToSchemaMapping[modelName].push(schemaName);
    });
  }

  getSchemaNames(modelName) {
    return this.modelToSchemaMapping[modelName];
  }

  insert(path) {
    const parts = path.split(PATH_DELIMITER);
    let currentNode = this.root;

    for (let i = 0; i < parts.length; i += 1) {
      const partName = parts[i];

      let existingPathFound = false;
      for (let j = 0; j < currentNode.childNodes.length; j += 1) {
        const t = currentNode.childNodes[j];
        if (t.name === partName) {
          currentNode = t;
          existingPathFound = true;
          break;
        }
      }

      if (!existingPathFound) {
        const modelName = this.schemaToModelMapping[partName];
        const modelSchema = this.modelGetter(this.schemaToModelMapping[partName]);
        const newNode = new SchemaNode(partName, modelName, currentNode, modelSchema);

        currentNode.childNodes.push(newNode);
        currentNode = newNode;
      }
    }

    return currentNode;
  }
}
