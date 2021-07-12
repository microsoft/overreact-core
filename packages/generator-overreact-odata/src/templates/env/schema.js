import { Schema } from '@microsoft/overreact';

import { edm } from './edm';

const schemaToModelMapping = {

};

export const schema = new Schema(
  schemaToModelMapping,
  name => edm.schema.schemas[name],
);
