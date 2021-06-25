/* eslint-disable no-restricted-syntax */
const { parseEntityType } = require('./parseEntityType');
const { parseComplexType } = require('./parseComplexType');
const { parseEnumType } = require('./parseEnumType');
const { bindMethods } = require('./bindMethods');
const { EDMPrimitivesMapping } = require('./EDMPrimitivesMapping');

function parseSchemas(schemas, { isByDefaultNullable, withEnumValue }) {
  const ans = {
    Edm: {},
  };
  for (const [EDMType, schema] of Object.entries(EDMPrimitivesMapping)) {
    ans.Edm[EDMType] = schema;
  }
  for (const {
    $: { Namespace },
    ComplexType = [],
    EntityType = [],
    EnumType = [],
  } of schemas) {
    ans[Namespace] = {};
    for (const et of EntityType) {
      const etSchema = parseEntityType(et, { isByDefaultNullable });
      ans[Namespace][etSchema.$$ODataExtension.Name] = etSchema;
    }
    for (const ct of ComplexType) {
      const ctSchema = parseComplexType(ct, { isByDefaultNullable });
      ans[Namespace][ctSchema.$$ODataExtension.Name] = ctSchema;
    }
    for (const et of EnumType) {
      const etSchema = parseEnumType(et, { isByDefaultNullable, withEnumValue });
      ans[Namespace][etSchema.$$ODataExtension.Name] = etSchema;
    }
  }

  for (const { $: { Namespace }, Action, Function } of schemas) {
    bindMethods(Action, Namespace, ans, 'Action', { isByDefaultNullable });
    bindMethods(Function, Namespace, ans, 'Function', { isByDefaultNullable });
  }

  return ans;
}

exports.parseSchemas = parseSchemas;
