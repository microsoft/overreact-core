import { Schema } from '@microsoft/overreact';

const schemaToModelMapping = {
  people: 'People',
  trip: 'Trip',
  airline: 'Airline',
  // more entities go here ...
};

export const schema = new Schema(schemaToModelMapping, () => {});
