// all primitive types https://docs.microsoft.com/en-us/dotnet/framework/data/adonet/entity-data-model-primitive-data-types
const EDMPrimitivesMapping = {
  Binary: { type: 'integer' },
  Boolean: { type: 'boolean' },
  Byte: { type: 'integer' },
  DateTime: {},
  DateTimeOffset: { type: 'string', format: 'date-time' },
  Decimal: { type: 'number' },
  Double: { type: 'number' },
  Float: { type: 'number' },
  GeographyPoint: {}, // not listed in the doc
  Guid: { type: 'string', regex: '^[a-fA-F0-9]{8}(?:-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12}$' },
  Int16: { type: 'integer' },
  Int32: { type: 'integer' },
  Int64: { type: 'integer' },
  SByte: { type: 'integer' },
  Single: { type: 'number' }, // not listed in the doc
  String: { type: 'string' },
  Time: { type: 'string', format: 'time' },
};

Object.entries(EDMPrimitivesMapping).forEach(([EDMType, schema]) => {
  // eslint-disable-next-line no-param-reassign
  schema.$$ODataExtension = {
    Name: EDMType,
  };
});

exports.EDMPrimitivesMapping = EDMPrimitivesMapping;
