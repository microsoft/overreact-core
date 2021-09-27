const { pathJoin } = require('../utils/path-join');

function buildEnvRelativePath(length) {
  return pathJoin(
    ...Array(length + 3).fill('..'),
    'env',
  );
}

function writeEnv(context, config) {
  context.fs.copyTpl(
    context.templatePath(pathJoin('env', 'edm.ejs')),
    context.destinationPath('env', 'edm.js'),
    {
      ...config,
    },
  );

  context.fs.copyTpl(
    context.templatePath(pathJoin('env', 'env-instance.ejs')),
    context.destinationPath('env', 'env-instance.js'),
    {
      ...config,
    },
  );

  context.fs.copyTpl(
    context.templatePath(pathJoin('env', 'schema.ejs')),
    context.destinationPath('env', 'schema.js'),
    {
      ...config,
    },
  );

  context.fs.copyTpl(
    context.templatePath(pathJoin('env', 'requestor.ejs')),
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
