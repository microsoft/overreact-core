function generateSpecMetadata(
  edmModel,
  overreactSchema,
  schemaNameMapper,
  path,
  visitedSchemas,
  rootSchema,
) {
  return {
    edmModel,
    schema: overreactSchema,
    schemaNameMapper,
    path,
    visitedSchemas,
    rootSchema,
  };
}

module.exports = {
  generateSpecMetadata,
};
