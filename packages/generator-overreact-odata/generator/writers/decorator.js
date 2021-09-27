const { pathJoin } = require('../utils/path-join');

function writeDecorator(context, destDir, folder, fileName) {
  if (context.generateDecorators) {
    const decoFile = pathJoin(destDir, folder, fileName);

    if (!context.fs.exists(decoFile)) {
      context.fs.copy(
        context.templatePath(pathJoin('shared', 'decorators.js')),
        decoFile,
      );
    }
  }
}

module.exports = {
  writeDecorator,
};
