const { parseFullName } = require('./parseFullName');
const { parseBoolean } = require('./parseBoolean');

function addNullable(schema, nullable, { isByDefaultNullable }) {
  // by default Nullable is true
  // see: http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#_Toc505863907
  if ((!nullable || parseBoolean(nullable)) && !isByDefaultNullable(schema.$ref)) {
    return {
      oneOf: [schema, {
        type: 'null',
      }],
    };
  }
  return schema;
}

function parseTypeReference(typeReference, nullable, {
  isByDefaultNullable,
}) {
  const collectionExec = /Collection\((.*)\)/.exec(typeReference);
  if (collectionExec) {
    return {
      type: 'array',
      items: parseTypeReference(collectionExec[1], 'false', { isByDefaultNullable }),
    };
  }
  return addNullable({
    $ref: parseFullName(typeReference),
  }, nullable, {
    isByDefaultNullable,
  });
}

exports.parseTypeReference = parseTypeReference;
