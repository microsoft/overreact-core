/* eslint-disable no-restricted-syntax */
const { parseBoolean } = require('./parseBoolean');
const { parseTypeReference } = require('./parseTypeReference');

function parseMethod({
  $: { Name, IsBound },
  Parameter,
  ReturnType,
}, Namespace, {
  isByDefaultNullable,
}) {
  const metadata = {
    Namespace,
    Name,
    IsBound: parseBoolean(IsBound),
  };
  if (Parameter) {
    metadata.Parameter = {};
    for (const { $: { Name: parameterName, Type, Nullable/* , Unicode */ } } of Parameter) {
      metadata.Parameter[parameterName] = parseTypeReference(Type, Nullable, {
        isByDefaultNullable,
      });
    }
    if (metadata.IsBound) {
      // The first parameter is the binding parameter
      // Check http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/cs01/odata-csdl-xml-v4.01-cs01.html#sec_Parameter
      metadata.BindingParameter = Parameter[0].$.Name;
    }
  }
  if (ReturnType) {
    metadata.ReturnType = parseTypeReference(ReturnType[0].$.Type, 'false', { isByDefaultNullable });
  }
  return metadata;
}

exports.parseMethod = parseMethod;
