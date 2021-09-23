const path = require('path');

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
  const envLocation = path.join(envRelativePath, 'env-instance');

  return {
    envLocation,
    hookName,
  };
}

function writeHookDecorator(context, destDir, folder) {
  if (context.generateDecorators) {
    const decoFile = path.join(destDir, folder, 'hook-decorators.js');

    if (!context.fs.exists(decoFile)) {
      context.fs.copy(
        context.templatePath(path.join('shared', 'hook-decorators.js')),
        decoFile,
      );
    }
  }
}

function writeActionHook(context, dataPath, spec, destDir) {
  const sharedContext = composeSharedContext(spec, true);

  context.fs.copyTpl(
    context.templatePath(path.join('hooks', 'use-action.ejs')),
    path.join(destDir, 'calls', 'action-hook.js'),
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
    context.templatePath(path.join('hooks', 'use-func.ejs')),
    path.join(destDir, 'calls', 'func-hook.js'),
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
    context.templatePath(path.join('hooks', 'use-coll.ejs')),
    path.join(destDir, 'coll', 'coll-hook.js'),
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
    context.templatePath(path.join('hooks', 'use-entity.ejs')),
    path.join(destDir, 'entity', 'entity-hook.js'),
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
