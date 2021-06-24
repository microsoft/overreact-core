/* eslint-disable max-classes-per-file */

const _ = require('lodash');
const { Registry } = require('./registry');
const {
  defineConstProperty,
  defineProducedProperty,
  defineProducedPropertyOnClass,
} = require('./reflection');

const ONEOF_TYPE_PREFIX = '@ONEOF';
const COLLECTION_TYPE_POSTFIX = '@COLL';

function isOneOfType(typeName) {
  return typeName.indexOf(ONEOF_TYPE_PREFIX) === 0;
}

function hasPostfix(str, postfix) {
  return str.slice(-postfix.length) === postfix;
}

function removePostfix(str, postfix) {
  return str.slice(0, -postfix.length);
}

/**
 * @param {EDM} edm - The EDM object to apply this plugin to
 * @return {void}
 */
module.exports = edm => {
  if (edm.types) {
    return;
  }

  // eslint-disable-next-line no-undef
  const oneOfTypes = new Map();

  /**
   * @name edm
   * @type {EDM}
   * @property {Registry} types - A registry of all types
   * @property {Class} types.Type - The base type of all meta Types
   * @property {Class} types.PrimitiveType - The meta type of primitive types
   * @property {Class} types.ObjectType - The meta type of the key/value types
   * @property {Class} types.ComplexType - The meta type of the complex types
   * @property {Class} types.EntityType - The meta type of the entity types
   * @property {Class} types.CollectionType - The meta type of the collection types
   * @property {Class} types.CallableType - The meta type of the callable types
   */
  defineConstProperty(edm, 'types', (() => {
    const types = new Registry();

    function resolveType(name, namespace) {
      if (hasPostfix(name, COLLECTION_TYPE_POSTFIX)) {
        return resolveType(removePostfix(name, COLLECTION_TYPE_POSTFIX), namespace).collectionType;
      }

      if (isOneOfType(name)) {
        if (!oneOfTypes.has(name)) {
          const prefixLength = ONEOF_TYPE_PREFIX.length + 1;
          const typeNames = name.substr(prefixLength, name.length - prefixLength - 1).split(',');
          // eslint-disable-next-line no-use-before-define
          oneOfTypes.set(name, new OneOfType({ typeNames }));
        }

        return oneOfTypes.get(name);
      }

      return types.resolve(name, namespace);
    }

    /**
     * @class Property
     * @property {String} name - The name of the property
     * @property {String} typeName - The name of the property's type
     * @property {Type} type - The type of the property
     */
    class Property {
      /**
       * Create a property
       * @param {Object} options - The constructor options
       * @param {String} options.name - The name of the property
       * @param {String} options.typeName - The name of the propertie's type
       * @param {String} options.namespace - The namespace of the propertie's type
       * @return {void}
       */
      constructor({
        name,
        typeName,
        namespace,
      }) {
        defineConstProperty(this, 'name', name);
        defineConstProperty(this, 'typeName', typeName);
        defineProducedProperty(this, 'type', () => resolveType(typeName, namespace));
      }
    }

    /**
     * @class Parameter
     * @property {String} name - The name of the parameter
     * @property {String} typeName - The name of the paramter's type
     * @property {type} type - The type of the parameter
     */
    class Parameter {
      /**
       * Create a parameter
       * @param {Object} options - The constructor options
       * @param {String} options.name - The name of the parameter
       * @param {String} options.typeName - The name of the parameter's type
       * @param {String} options.namespace - The namespace of the parameter's type
       * @return {void}
       */
      constructor({
        name,
        typeName,
        namespace,
      }) {
        defineConstProperty(this, 'name', name);
        defineConstProperty(this, 'typeName', typeName);
        defineProducedProperty(this, 'type', () => resolveType(typeName, namespace));
      }
    }

    /**
     * @class Type
     * @property {String} name - The qualified name of the type
     * @property {String} namespace - The namespace of the type
     * @property {String} shortName - The short name of the type
     */
    class Type {
      /**
       * Create and register a type
       * A side effect of Type creation is registering itself to the type registry
       * @param {Object} options - The constructor options
       * @param {String} options.name - The name of the type
       * @return {void}
       */
      constructor({
        name,
      }) {
        defineConstProperty(this, 'name', name);
        defineConstProperty(this, 'namespace', Registry.getNamespace(name));
        defineConstProperty(this, 'shortName', Registry.getShortName(name));
        types.register(this);
      }
    }

    /**
     * @class PrimitiveType
     * @extends Type
     * @property {Class} jsType - The corresponding JavaScript type
     */
    class PrimitiveType extends Type {
      /**
       * Create a PrimitiveType
       * @param {Object} options - The constructor options
       * @param {String} options.name - The name of the type
       * @param {Class} options.jsType - The JavaScript type of the primitive type
       * @return {void}
       */
      constructor({
        name,
        jsType,
      }) {
        super({ name });
        defineConstProperty(this, 'jsType', jsType);
      }
    }

    /**
     * @class OneOfType
     * @extends Type
     * @property {Class} types - Data could be one of these types
     * @see {@link http://json-schema.org/latest/json-schema-validation.html#rfc.section.6.7.3}
     */
    class OneOfType extends Type {
      /**
       * Create a PrimitiveType
       * @param {Object} options - The constructor options
       * @param {String} options.name - The name of the type
       * @param {Type[]} options.types - The JavaScript type of the primitive type
       * @return {void}
       */
      constructor({
        typeNames,
      }) {
        super({
          name: OneOfType.oneOfTypeName(typeNames),
        });

        defineConstProperty(this, 'typeNames', typeNames);
        defineConstProperty(this, 'types', typeNames.map(typeName => resolveType(typeName, this.namespace)));
      }

      /**
       * Get the OneOfType's name from it's elements type name
       * @param {String[]} typeNames - The name of the elementTypes
       * @return {String} The name of the OneOfType
       */
      static oneOfTypeName(typeNames) {
        // We don't support nested one for now
        const sortedNames = typeNames
          .map(name => types.resolveQualifiedName(name, this.namespace))
          .sort();

        return `${ONEOF_TYPE_PREFIX}(${sortedNames.join(',')})`;
      }
    }

    /**
     * @typedef {Object} PropertyInfo
     * @property {String} typeName - The name of the propertie's type
     *
     * @memberof ObjectType#
     * @this ObjectType
     * @param {Object.<String, PropertyInfo>} properties - The properties to be compiled
     * @return {Object.<String, Property>} a mapping for name to compiled Properties
     */
    function compileProperties(properties) {
      const { namespace } = this;

      const ret = {};

      Object.keys(properties || {}).forEach(name => {
        const { typeName } = properties[name];
        ret[name] = new Property({
          name,
          typeName,
          namespace,
        });
      });

      return ret;
    }

    /**
     * @class ObjectType
     * @extends Type
     * @property {Object.<String, Property>} properties - The properties of the object type
     * @property {String} baseTypeName - The name of the base type
     * @property {Type} baseType - The base type
     */
    class ObjectType extends Type {
      /**
       * Create an ObjectType
       * @param {Object} options - The constructor options
       * @param {String} options.name - The name of the type
       * @param {Object.<String, PropertyInfo>} options.properties - The property definition
       * @param {string[]} [options.navigationPropertyNames] - Navigation properties names
       * @param {String} options.baseTypeName - The name of the base type
       * @return {void}
       */
      constructor({
        name,
        properties,
        navigationPropertyNames = [],
        baseTypeName,
      }) {
        super({ name });

        defineConstProperty(this, 'properties', compileProperties.call(this, properties));
        defineConstProperty(this, 'navigationPropertyNames', navigationPropertyNames.slice());
        defineProducedProperty(this, 'navigationProperties', () => _.pick(this.properties, (property, propertyName) => _.contains(this.navigationPropertyNames, propertyName)));
        if (baseTypeName) {
          defineConstProperty(this, 'baseTypeName', baseTypeName);
          defineProducedProperty(this, 'baseType', () => resolveType(this.baseTypeName, this.namespace));
        }
      }

      addProperties(properties) {
        _.extend(this.properties, compileProperties.call(this, properties));
        // only for backward compability, should use addNavigationProperties for this case
        this.navigationPropertyNames.push(..._.keys(properties));
      }

      addNavigationProperties(properties) {
        this.addProperties(properties);
      }
    }

    /**
     * @class ComplexType
     * @extends ObjectType
     */
    class ComplexType extends ObjectType {

    }

    /**
     * @class EntityType
     * @extends ObjectType
     * @property {String} key - The name of the key property
     * @property {Property} keyProperty - The key property of the entity type
     * @return {void}
     */
    class EntityType extends ObjectType {
      /**
       * Create an EntityType
       * @param {Object} options - The constructor options
       * @param {String} options.name - The name of the type
       * @param {Object.<String, PropertyInfo>} options.properties - The property definition
       * @param {String} options.baseTypeName - The name of the base type
       * @param {String} [options.key] - The name of the key property
       * @return {void}
       */
      constructor({
        name,
        properties,
        navigationPropertyNames,
        baseTypeName,
        key,
      }) {
        super({
          name,
          properties,
          navigationPropertyNames,
          baseTypeName,
        });

        if (key) {
          defineConstProperty(this, 'key', key);
          defineConstProperty(this, 'keyProperty', this.properties[this.key]);
        } else if (baseTypeName) {
          // The key property is inherited if there's a base type
          defineProducedProperty(this, 'key', () => this.baseType.key);
          defineProducedProperty(this, 'keyProperty', () => this.baseType.keyProperty);
        } else {
          throw new Error('The "key" property is required for an EntityType');
        }
      }
    }

    /**
     * @class CollectionType
     * @extends ObjectType
     * @property {String} elementTypeName - The name of the element type
     * @property {Type} elementType - The type of the elements
     */
    class CollectionType extends ObjectType {
      /**
       * Create a CollectionType
       * @param {Object} options - The constructor options
       * @param {Object.<String, PropertyInfo>} options.properties - The property definition
       * @param {String} options.baseTypeName - The name of the base type
       * @param {String} options.elementTypeName - The name of the element type
       * @return {void}
       */
      constructor({
        properties,
        baseTypeName,
        elementTypeName,
      }) {
        super({
          name: CollectionType.collectionTypeName(elementTypeName),
          properties,
          baseTypeName,
        });
        defineConstProperty(this, 'elementTypeName', elementTypeName);
        defineProducedProperty(this, 'elementType', () => resolveType(this.elementTypeName, this.namespace));
      }

      /**
       * Get the CollectionType's name from it's element type name
       * @param {String} typeName - The name of the elementType
       * @return {String} The name of the CollectionType
       */
      static collectionTypeName(typeName) {
        return `${typeName}${COLLECTION_TYPE_POSTFIX}`;
      }
    }

    /**
     * @memberof Type#
     * @this Type
     * @returns {CollectionType} The CollectionType of the given Type
     */
    function collectionTypeFactory() {
      return new CollectionType({ elementTypeName: this.name });
    }

    /**
     * @name type
     * @type Type
     * @property {CollectionType} collectionType - The collection type of the given type
     */
    defineProducedPropertyOnClass(Type, 'collectionType', collectionTypeFactory);

    /**
     * @typedef {Object} ParameterInfo
     * @property {String} typeName - The name of the parameter's type
     *
     * @memberof CallableType#
     * @this CallableType
     * @param {Object.<String, ParameterInfo>} parameters - The parameters to compile
     * @return {Object.<String, Parameter>} A mapping for name to compiled Parameters
     */
    function compileParameters(parameters) {
      const { namespace } = this;

      const ret = {};
      Object.keys(parameters || {}).forEach(name => {
        const { typeName } = parameters[name];
        ret[name] = new Parameter({ name, namespace, typeName });
      });
    }

    /**
     * @class CallableType
     * @property {Parameter[]} parameters - The parameters required to call the callable
     * @property {String} returnTypeName - The name of the return type
     * @property {Type} returnType - The return type of the callable
     */
    class CallableType extends Type {
      /**
       * Create a CallableType
       * @param {Object} options - The constructor options
       * @param {String} options.name - The name of the type
       * @param {Object.<String, ParameterInfo>} parameters - The parameter definitions
       * @param {String} returnTypeName - The name of the return type
       * @return {void}
       */
      constructor({
        name,
        callableName,
        parameters,
        returnTypeName,
      }) {
        super({ name });

        defineConstProperty(this, 'callableName', callableName);
        defineConstProperty(this, 'parameters', compileParameters.call(this, parameters));
        defineConstProperty(this, 'returnTypeName', returnTypeName);
        defineProducedProperty(this, 'returnType', () => resolveType(returnTypeName, this.namespace));
      }
    }

    /**
     * @class ActionType
     * @property {Parameter[]} parameters - The parameters required to call the callable
     * @property {String} returnTypeName - The name of the return type
     * @property {Type} returnType - The return type of the callable
     */
    class ActionType extends CallableType {
      /**
       * Create a CallableType
       * @param {Object} options - The constructor options
       * @param {String} options.name - The name of the type
       * @param {Object.<String, ParameterInfo>} parameters - The parameter definitions
       * @param {String} returnTypeName - The name of the return type
       * @return {void}
       */
      constructor({
        name,
        callableName,
        parameters,
        returnTypeName,
      }) {
        super({
          name,
          callableName,
          parameters,
          returnTypeName,
        });
      }
    }

    /**
     * @class FunctionType
     * @property {Parameter[]} parameters - The parameters required to call the callable
     * @property {String} returnTypeName - The name of the return type
     * @property {Type} returnType - The return type of the callable
     */
    class FunctionType extends CallableType {
      /**
       * Create a CallableType
       * @param {Object} options - The constructor options
       * @param {String} options.name - The name of the type
       * @param {Object.<String, ParameterInfo>} parameters - The parameter definitions
       * @param {String} returnTypeName - The name of the return type
       * @return {void}
       */
      constructor({
        name,
        callableName,
        parameters,
        returnTypeName,
      }) {
        super({
          name,
          callableName,
          parameters,
          returnTypeName,
        });
      }
    }

    // TODO: wewei, support EnumType

    defineConstProperty(types, 'Property', Property);
    defineConstProperty(types, 'Parameter', Parameter);
    defineConstProperty(types, 'Type', Type);
    defineConstProperty(types, 'PrimitiveType', PrimitiveType);
    defineConstProperty(types, 'OneOfType', OneOfType);
    defineConstProperty(types, 'ObjectType', ObjectType);
    defineConstProperty(types, 'ComplexType', ComplexType);
    defineConstProperty(types, 'EntityType', EntityType);
    defineConstProperty(types, 'CollectionType', CollectionType);
    defineConstProperty(types, 'CallableType', CallableType);
    defineConstProperty(types, 'ActionType', ActionType);
    defineConstProperty(types, 'FunctionType', FunctionType);

    return types;
  })());
};
