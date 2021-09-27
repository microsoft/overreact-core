const { pathJoin } = require('../utils/path-join');

const { buildEnvRelativePath } = require('./env');

function composeSharedContext(spec, isCall) {
  const {
    metadata: {
      visitedSchemas,
      config: {
        name: hookName,
      },
    },
  } = spec;

  const envRelativePath = buildEnvRelativePath(
    isCall ? visitedSchemas.length + 1 : visitedSchemas.length,
  );
  const envLocation = pathJoin(envRelativePath, 'env-instance');

  return {
    envLocation,
    hookName,
  };
}

function writeHookDecorator(context, destDir, folder) {
  if (context.generateDecorators) {
    const decoFile = pathJoin(destDir, folder, 'hook-decorators.js');

    if (!context.fs.exists(decoFile)) {
      context.fs.copy(
        context.templatePath(pathJoin('shared', 'hook-decorators.js')),
        decoFile,
      );
    }
  }
}

function writeActionHook(context, dataPath, spec, destDir) {
  const sharedContext = composeSharedContext(spec, true);

  context.fs.copyTpl(
    context.templatePath(pathJoin('hooks', 'use-action.ejs')),
    pathJoin(destDir, 'calls', 'action-hook.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );

  writeHookDecorator(context, destDir, 'calls');
}

function writeFuncHook(context, dataPath, spec, destDir) {
  const sharedContext = composeSharedContext(spec, true);

  context.fs.copyTpl(
    context.templatePath(pathJoin('hooks', 'use-func.ejs')),
    pathJoin(destDir, 'calls', 'func-hook.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );

  writeHookDecorator(context, destDir, 'calls');
}

function writeCollHook(context, dataPath, spec, destDir) {
  const sharedContext = composeSharedContext(spec, false);

  context.fs.copyTpl(
    context.templatePath(pathJoin('hooks', 'use-coll.ejs')),
    pathJoin(destDir, 'coll', 'coll-hook.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );

  writeHookDecorator(context, destDir, 'coll');
}

function writeEntityHook(context, dataPath, spec, destDir) {
  const sharedContext = composeSharedContext(spec, false);

  context.fs.copyTpl(
    context.templatePath(pathJoin('hooks', 'use-entity.ejs')),
    pathJoin(destDir, 'entity', 'entity-hook.js'),
    {
      dataPath,
      ...sharedContext,
    },
  );

  writeHookDecorator(context, destDir, 'entity');
}

module.exports = {
  writeActionHook,
  writeFuncHook,
  writeCollHook,
  writeEntityHook,
};
