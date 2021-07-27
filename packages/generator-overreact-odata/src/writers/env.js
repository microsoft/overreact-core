const path = require('path');

function buildEnvRelativePath(length) {
  return path.join(
    ...Array(length + 3).fill('..'),
    'env',
  );
}

function writeEnv(context, config) {
  context.fs.copyTpl(
    context.templatePath(path.join('env', 'edm.ejs')),
    context.destinationPath('env', 'edm.js'),
    {
      ...config,
    },
  );

  context.fs.copyTpl(
    context.templatePath(path.join('env', 'env-instance.ejs')),
    context.destinationPath('env', 'env-instance.js'),
    {
      ...config,
    },
  );

  context.fs.copyTpl(
    context.templatePath(path.join('env', 'schema.ejs')),
    context.destinationPath('env', 'schema.js'),
    {
      ...config,
    },
  );

  context.fs.copyTpl(
    context.templatePath(path.join('env', 'requestor.ejs')),
    context.destinationPath('env', 'requestor.js'),
    {
      ...config,
    },
  );
}

module.exports = {
  buildEnvRelativePath,
  writeEnv,
};
