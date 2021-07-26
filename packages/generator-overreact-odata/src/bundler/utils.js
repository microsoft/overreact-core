// https://stackoverflow.com/questions/54246477/how-to-convert-camelcase-to-snake-case-in-javascript
const pascalToSnakeCase = str => str.split(/(?=[A-Z])/).join('_').toLowerCase();
const snakeToPascalCase = str => str.split('_').map(s => `${s[0].toUpperCase()}${s.slice(1)}`).join('');

function schemaNameMapper(name) {
  const MODEL_PREFIX = 'Model/';
  const PRIMITIVE_PREFIX = 'Edm/';

  let modelName = name;
  if (name.startsWith(MODEL_PREFIX)) {
    modelName = name.substring(MODEL_PREFIX.length);
  }
  if (name.startsWith(PRIMITIVE_PREFIX)) {
    modelName = name.substring(PRIMITIVE_PREFIX.length);
  }

  return pascalToSnakeCase(modelName);
}

module.exports = {
  schemaNameMapper,

  pascalToSnakeCase,
  snakeToPascalCase,
};
