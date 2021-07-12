/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
const path = require('path');
const Generator = require('yeoman-generator');

const {
  makeSpecMetadata,
  makeSchemaModel,

  specMetadataScope,
  specMetadataType,
} = require('@microsoft/overreact-odata');

const {
  writeActionSpec,
  writeFuncSpec,
} = require('./writers/calls');

const { writeEntitySpec } = require('./writers/entity');
const { writeCollSpec } = require('./writers/coll');

// Below defines a set of stages that the generated packages could be in.
// The generator shall use the stage info to determine what config shall be
// updated and generated related data only.
const packageStage = {
  // FIRST_RUN - no previous metadata/schema has been generated.
  // At this stage, the generator will typically fetch metadata from server,
  // and ONLY generate the "modelAliases" section of the config.
  // Once generated, the generator shall instruct the user to modify the section
  // per their needs and ask the user to run the generator again.
  FIRST_RUN: 'FIRST_RUN',

  // MODEL_GENERATED - only "modelAliases" section is present, need to enumerate
  // possible data paths.
  // At this stage, the generator enumerates all possible data paths based on
  // metadata, and fills the "dataPaths" section in the config file.
  // Once complete, the generator shall instruct the user to cherry-pick necessary
  // data paths and remove unwanted ones in the config file.
  // The generator shall stop before the edits are done. Users will be prompted to
  // run the generator again.
  MODEL_GENERATED: 'MODEL_GENERATED',

  // SPEC_GENERATED - only after "modelAliases" and "dataPaths" are both present,
  // shall the generator enter this stage, and generate the actual spec files
  // according to dataPaths.
  SPEC_GENERATED: 'SPEC_GENERATED',
};
module.exports = class extends Generator {
  initializing() {
    this.packageJsonConfigs = this.packageJson.getAll();

    this.overreactJson = this.createStorage(this.destinationPath('.overreactrc.json'));
    this.overreactJsonConfigs = this.overreactJson.getAll();

    const { modelAliases, dataPaths } = this.overreactJsonConfigs;

    this.stage = packageStage.FIRST_RUN;

    if (modelAliases && !dataPaths) {
      this.stage = packageStage.MODEL_GENERATED;
    } else if (modelAliases && dataPaths) {
      this.stage = packageStage.SPEC_GENERATED;
    }
  }

  async prompting() {
    if (this.stage === packageStage.FIRST_RUN) {
      this.log('Looks like this is the first time you\'re generating this package.');
      this.log('Let\'s start with gathering some basic information.');

      this.packageJsonAnswers = await this.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Your package name',
          default: this.packageJsonConfigs.name || this.appname,
        },
      ]);

      this.packageJson.set({
        ...this.packageJsonAnswers,
      });

      this.overreactJsonAnswers = await this.prompt([
        {
          type: 'input',
          name: 'url',
          message: 'OData metadata endpoint URL',
          default: this.overreactJsonConfigs.url,
        },
      ]);
    } else if (this.stage === packageStage.MODEL_GENERATED) {
      this.overreactJsonAnswers = await this.prompt([
        {
          type: 'input',
          name: 'environmentTag',
          message: 'Enviroment tag',
          default: this.overreactJsonConfigs.environmentTag || this.appname,
        },
        {
          type: 'input',
          name: 'rootPropertyName',
          message: 'What is the name of the root property?',
          default: this.overreactJsonConfigs.rootPropertyName,
        },
        {
          type: 'input',
          name: 'rootPropertyModelName',
          message: 'Please provide the model name for the root property',
          default: this.overreactJsonConfigs.rootPropertyModelName,
        },
      ]);
    } else if (this.stage === packageStage.SPEC_GENERATED) {

    }

    this.overreactJson.set({
      ...this.overreactJsonAnswers,
    });
  }

  async configuring() {
    const { url } = this.overreactJsonAnswers;
    try {
      this.log(`Fetching metadata from ${url}`);
      this.model = await makeSchemaModel(url);
    } catch (e) {
      this.log('Cannot fetch metadata. Please check your network and try again');
      throw e;
    }

    this.log('Metadata fetched.');

    if (this.stage === packageStage.FIRST_RUN) {
      const MODEL_PREFIX = 'Model/';
      const pascalToSnakeCase = str => str.split(/(?=[A-Z])/).join('_').toLowerCase();
      const modelAliases = {};
      Object.keys(this.model).forEach(key => {
        if (key.startsWith(MODEL_PREFIX)) {
          const modelName = key.substring(MODEL_PREFIX.length);
          const alias = pascalToSnakeCase(modelName);

          modelAliases[alias] = key;
        }
      });

      if (modelAliases) {
        this.overreactJson.set({
          modelAliases,
        });
      }
    }
  }

  writing() {
    if (this.stage === packageStage.FIRST_RUN) {

    } else if (this.stage === packageStage.MODEL_GENERATED) {

    } else if (this.stage === packageStage.SPEC_GENERATED) {
      this._write_env();

      this.generatedSpecs = [];
      Object.keys(this.specMetadata).forEach(k => {
        const specPath = path.join(...k.split(':'));
        const destDir = this.destinationPath('specs', specPath, '__specs');

        const { type, scope, metadata } = this.specMetadata[k];

        switch (type) {
          case specMetadataType.MODEL:
            this._write_entity_specs(k, metadata, scope, destDir);
            this._write_coll_specs(k, metadata, scope, destDir);
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
    }
  }

  end() {
    if (this.stage === packageStage.FIRST_RUN) {
      this.log('Please modify "modelAliases" in .overreactrc.json, and run "yo overreact-odata" again.');
    } else if (this.stage === packageStage.MODEL_GENERATED) {

    } else if (this.stage === packageStage.SPEC_GENERATED) {
    }
  }

  _write_env() {
    this.fs.copyTpl(
      this.templatePath(path.join('env', 'edm.ejs')),
      this.destinationPath('env', 'edm.js'),
      {
        ...this.answers,
      },
    );

    this.fs.copyTpl(
      this.templatePath(path.join('env', 'envLookup.ejs')),
      this.destinationPath('env', 'envLookup.js'),
      {
        ...this.answers,
      },
    );
  }

  _write_entity_specs(dataPath, metadata, scope, destDir) {
    writeEntitySpec(this, dataPath, metadata, scope, destDir);
  }

  _write_coll_specs(dataPath, metadata, scope, destDir) {
    writeCollSpec(this, dataPath, metadata, scope, destDir);
  }

  _write_func_spec(dataPath, metadata, scope, destDir) {
    writeFuncSpec(this, dataPath, metadata, scope, destDir);
  }

  _write_action_spec(dataPath, metadata, scope, destDir) {
    writeActionSpec(this, dataPath, metadata, scope, destDir);
  }
};
