const path = require('path');

function writeDecorator(context, destDir, folder, fileName) {
  const decoFile = path.join(destDir, folder, fileName);

  if (!context.fs.exists(decoFile)) {
    context.fs.copy(
      context.templatePath(path.join('shared', 'decorators.js')),
      decoFile,
    );
  }
}

module.exports = {
  writeDecorator,
};
