const Generator = require('yeoman-generator');

const { makeSpecs } = require('@microsoft/overreact-odata');

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
    this.specs = await makeSpecs({
      ...this.answers,
      schemaExtensions: {},
    });

    this.log(this.specs);
  }

  writing() {
    Object.keys(this.specs).forEach(k => {
      this.log(k);

      // TODO: use path
      const specPath = k.split(':').join('/');
      const destPath = this.destinationPath('specs', specPath, 'index.js');

      this.log(destPath);

      this.fs.copy(this.templatePath('index.js'), destPath);
    });
  }
};
