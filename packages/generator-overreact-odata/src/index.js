/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
const path = require('path');
const Generator = require('yeoman-generator');

const {
  makeSpecMetadata,

  specMetadataScope,
  specMetadataType,
} = require('@microsoft/overreact-odata');

const {
  odataUriFactory,
  generateDescriptorList,
} = require('./utils/uri-factory');

module.exports = class extends Generator {
  initializing() {
    this.log('Initializing');

    this.packageJsonConfigs = this.packageJson.getAll();
  }

  async prompting() {
    this.answers = await this.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Your package name',
        default: this.packageJsonConfigs.name || this.appname,
      },
      {
        type: 'input',
        name: 'url',
        message: 'OData metadata endpoint URL',
        default: this.packageJsonConfigs.url,
      },
      {
        type: 'input',
        name: 'rootPropertyName',
        message: 'What is the name of the root property?',
        default: this.packageJsonConfigs.rootPropertyName,
      },
      {
        type: 'input',
        name: 'rootPropertyModelName',
        message: 'Please provide the model name for the root property',
        default: this.packageJsonConfigs.rootPropertyModelName,
      },
      {
        type: 'confirm',
        name: 'isPascalCased',
        message: 'Is the model names in Pascal Case?',
        default: true,
      },
    ]);

    /*
    this.log('package name', answers.name);
    this.log('package url', answers.url);
    */

    this.packageJson.set({
      ...this.answers,
    });
  }

  async configuring() {
    this.specMetadata = await makeSpecMetadata({
      ...this.answers,
      schemaExtensions: {},
    });
  }

  writing() {
    this.generatedSpecs = [];
    Object.keys(this.specMetadata).forEach(k => {
      this.log(k);

      const specPath = path.join(...k.split(':'));
      const destDir = this.destinationPath('specs', specPath, '__specs');

      this.log(destDir);

      // 4 subfolders
      // 1 - entity
      // 2 - coll
      // 3 - calls
      // 4 - hooks

      const { type, scope, metadata } = this.specMetadata[k];

      switch (type) {
        case specMetadataType.MODEL:
          this._write_entity_specs(k, metadata, destDir);
          this._write_coll_specs(k, metadata, destDir);
          break;
        case specMetadataType.ACTION:
          this._write_action_spec(k, metadata, scope, destDir);
          break;
        case specMetadataType.FUNC:
          this._write_func_spec(k, metadata, scope, destDir);
          break;
        default:
          break;
      }

      this.generatedSpecs.push(k);
    });

    this.packageJson.set({
      generatedSpecs: this.generatedSpecs,
    });
  }

  _write_entity_specs(dataPath, metadata, destDir) {
    const {
      schemaNameMapper, visitedSchemas, rootSchema,
    } = metadata;
    const odataUri = odataUriFactory(visitedSchemas, schemaNameMapper, false);
    const descriptorList = generateDescriptorList(visitedSchemas, schemaNameMapper, false);
    const { $$ODataExtension } = rootSchema;

    this.fs.copyTpl(
      this.templatePath('entity/fetch-spec.ejs'),
      path.join(destDir, 'entity', 'fetch-spec.js'),
      {
        edmLocation: './edm',
        descriptorList,
        odataUri,
        dataPath,
        key: $$ODataExtension.Key[0],
      },
    );
  }

  _write_coll_specs(dataPath, metadata, destDir) {
    const {
      schemaNameMapper, visitedSchemas, rootSchema,
    } = metadata;
    const odataUri = odataUriFactory(visitedSchemas, schemaNameMapper, true);
    const descriptorList = generateDescriptorList(visitedSchemas, schemaNameMapper, true);
    const { $$ODataExtension } = rootSchema;

    this.fs.copyTpl(
      this.templatePath(path.join('coll', 'fetch-spec.ejs')),
      path.join(destDir, 'coll', 'fetch-spec.js'),
      {
        edmLocation: './edm',
        descriptorList,
        odataUri,
        dataPath,
        key: $$ODataExtension.Key[0],
      },
    );
  }

  _write_func_spec(dataPath, metadata, scope, destDir) {

  }

  _write_action_spec(dataPath, metadata, scope, destDir) {

  }
};
