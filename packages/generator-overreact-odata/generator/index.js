const path = require('path');
const Generator = require('yeoman-generator');

const { makeSchemaModel } = require('./bundler/make-schema-model');
const { makeSpecMetadataFromList } = require('./bundler/make-spec-metadata-from-list');
const { createSpecList } = require('./bundler/create-spec-list');
const { createModelAliasHash } = require('./bundler/create-model-alias-hash');
const { specMetadataScope, specMetadataType } = require('./bundler/consts');

const { writeEnv } = require('./writers/env');

const { writeEntitySpec } = require('./writers/entity');
const { writeCollSpec } = require('./writers/coll');

const { writeActionSpec, writeFuncSpec } = require('./writers/calls');
const {
  writeActionHook,
  writeFuncHook,
  writeCollHook,
  writeEntityHook,
} = require('./writers/hooks');

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
  // metadata, and fills the "specList" section in the config file.
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
  constructor(args, opts) {
    super(args, opts);

    this.option('decorator', { default: true });

    this.generateDecorators = this.options.decorators;
  }

  initializing() {
    this.packageJsonConfigs = this.packageJson.getAll();

    this.overreactJson = this.createStorage(this.destinationPath('.overreactrc.json'));
    this.overreactJsonConfigs = this.overreactJson.getAll();

    const { modelAliases, specList } = this.overreactJsonConfigs;

    this.stage = packageStage.FIRST_RUN;

    if (modelAliases) {
      this.aliasHashMap = createModelAliasHash(modelAliases);
      if (!specList) {
        this.stage = packageStage.MODEL_GENERATED;
      } else if (specList) {
        this.stage = packageStage.SPEC_GENERATED;
      }
    }
  }

  async prompting() {
    if (this.stage === packageStage.FIRST_RUN) {
      this.log('Looks like this is the first time you\'re generating this package.');
      this.log('Let\'s start with gathering some basic information.');

      const packageJsonAnswers = await this.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Your package name',
          default: this.packageJsonConfigs.name || this.appname,
        },
      ]);

      this.packageJsonConfigs = {
        ...this.packageJsonConfigs,
        ...packageJsonAnswers,
      };

      const answers = await this.prompt([
        {
          type: 'input',
          name: 'url',
          message: 'OData metadata endpoint URL',
          default: this.overreactJsonConfigs.url,
        },
      ]);

      this.overreactJsonConfigs = {
        ...this.overreactJsonConfigs,
        ...answers,
      };
    } else if (this.stage === packageStage.MODEL_GENERATED) {
      const answers = await this.prompt([
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

      this.overreactJsonConfigs = {
        ...this.overreactJsonConfigs,
        ...answers,
      };
    } /* else if (this.stage === packageStage.SPEC_GENERATED) {

    } */

    this.overreactJson.set({
      ...this.overreactJsonConfigs,
    });
  }

  async configuring() {
    this.packageJson.set(this.packageJsonConfigs);
    const { url } = this.overreactJsonConfigs;
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
    } else if (this.stage === packageStage.MODEL_GENERATED) {
      const specList = createSpecList(this.model, this.overreactJsonConfigs);
      this.overreactJson.set({ specList });
    } else if (this.stage === packageStage.SPEC_GENERATED) {
      this.specMetadata = makeSpecMetadataFromList(
        this.model,
        this.overreactJsonConfigs,
      );
    }
  }

  writing() {
    if (this.stage === packageStage.FIRST_RUN) {
      this.fs.copyTpl(
        this.templatePath(path.join('root', 'package.json')),
        this.destinationPath('package.json'),
        {
          ...this.packageJsonConfigs,
        },
      );
    }

    if (this.stage === packageStage.SPEC_GENERATED) {
      writeEnv(this, this.overreactJsonConfigs);

      this.generatedSpecs = [];
      this.hookPaths = [];
      Object.keys(this.specMetadata).forEach(k => {
        const specPath = path.join(...k.split(':'));
        const specDestDir = this.destinationPath('specs', specPath, '__specs');
        const hookDestDir = this.destinationPath('specs', specPath, '__hooks');

        const specMetadata = this.specMetadata[k];
        specMetadata.forEach(spec => {
          const {
            type,
            scope,
            metadata: {
              config: { name: hookName, dataPath: hookDataPath },
            },
          } = spec;

          const actualDataPath = hookDataPath ?? k;

          let hookPath;
          if (type === specMetadataType.MODEL) {
            if (scope === specMetadataScope.COLL) {
              writeCollSpec(this, actualDataPath, spec, this.aliasHashMap, specDestDir);
              writeCollHook(this, actualDataPath, spec, hookDestDir);

              hookPath = path.join('specs', specPath, '__hooks', 'coll', 'coll-hook');
            }
            if (scope === specMetadataScope.ENTITY) {
              writeEntitySpec(this, actualDataPath, spec, this.aliasHashMap, specDestDir);
              writeEntityHook(this, actualDataPath, spec, hookDestDir);

              hookPath = path.join('specs', specPath, '__hooks', 'entity', 'entity-hook');
            }
          }

          if (type === specMetadataType.ACTION) {
            writeActionSpec(this, actualDataPath, spec, this.aliasHashMap, specDestDir);
            writeActionHook(this, actualDataPath, spec, hookDestDir);
            hookPath = path.join('specs', specPath, '__hooks', 'calls', 'action-hook');
          }
          if (type === specMetadataType.FUNC) {
            writeFuncSpec(this, actualDataPath, spec, this.aliasHashMap, specDestDir);
            writeFuncHook(this, actualDataPath, spec, hookDestDir);
            hookPath = path.join('specs', specPath, '__hooks', 'calls', 'func-hook');
          }
          this.hookPaths.push(
            `export { ${hookName} } from './${hookPath}';`,
          );
        });

        this.generatedSpecs.push(k);
      });

      this.fs.copyTpl(
        this.templatePath(path.join('root', 'index.ejs')),
        this.destinationPath('index.js'),
        {
          exports: this.hookPaths,
        },
      );
    }
  }

  end() {
    if (this.stage === packageStage.FIRST_RUN) {
      this.log('Please modify "modelAliases" in .overreactrc.json, and run "yo overreact-odata" again.');
    } else if (this.stage === packageStage.MODEL_GENERATED) {
      this.log('Please modify "specList" in .overreactrc.json, and run "yo overreact-odata" again to generate spec files.');
    } else if (this.stage === packageStage.SPEC_GENERATED) {
      this.log('Spec files generated.');
    }
  }
};
