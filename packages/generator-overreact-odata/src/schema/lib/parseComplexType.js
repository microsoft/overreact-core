const { parseObjectType } = require('./parseObjectType');

function parseComplexType(ComplexType, { isByDefaultNullable }) {
  return parseObjectType(ComplexType, { isByDefaultNullable });
}

exports.parseComplexType = parseComplexType;
