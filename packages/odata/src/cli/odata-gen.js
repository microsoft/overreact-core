#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const util = require('util');
const _ = require('lodash');
const { generateODataSchema } = require('../schema/generate-odata-schema');
const { exportSchemaModel } = require('../schema/export-schema-model');
const { EDM } = require('../edm/core');
const { resIdsPlugin } = require('../edm/resource-identifiers');
const { defineConstProperty } = require('../edm/reflection');

(async () => {
  const namespaces = await generateODataSchema('http://ui.ads-int.microsoft.com/ODataApi/Mca/V1', {
    isByDefaultNullable(ref) {
      if (ref === 'Edm/String') {
        return true;
      }

      return !ref.startsWith('Edm') && !ref.startsWith('Enum');
    },
    withEnumValue: false,
  });

  const model = exportSchemaModel(namespaces);

  const rootPropertyName = 'Customers';
  const rootPropertyModelName = 'Model/McaCustomer';

  const mappedModel = {};

  Object.keys(model || {}).forEach(key => {
    const schema = model[key];
    mappedModel[key] = {
      ...schema,
      $$ref: key,
    };
  });

  const edm = new EDM({
    schemas: {
      $ROOT: {
        $$ref: '$ROOT',
        type: 'object',
        properties: {
          [rootPropertyName]: {
            type: 'array',
            items: model[rootPropertyModelName],
          },
        },
        $$ODataExtension: {
          Name: '$ROOT',
          NavigationProperty: [
            rootPropertyName,
          ],
        },
      },
      ...mappedModel,
    },
  });

  resIdsPlugin(edm);

  const root = edm.types.resolve('$ROOT');

  const rootResourceIdentifier = new root.ResourceIdentifier();
  defineConstProperty(edm, 'root', rootResourceIdentifier);
  defineConstProperty(edm, rootPropertyName, rootResourceIdentifier[rootPropertyName]);

  console.log(edm);
})();
