/* eslint-disable max-classes-per-file */

const _ = require('lodash');

const { Registry } = require('./registry');
const {
  defineConstProperty,
  defineProducedPropertyOnClass,
} = require('./reflection');

const url = require('./url-util');

/**
 * @param {EDM} edm - The EDM object to apply this plugin to
 * @return {Void} nothing to return
 */
function resIdsPlugin(edm) {
  if (edm.resourceIdentifiers) {
    return;
  }

  /**
   * @name edm
   * @property {Registry} resourceIdentifiers - A registry of all resource-identifiers
   * @property {Class} resourceIdentifiers.Navigation - The base type of all navigations
   * @property {Class} resourceIdentifiers.PropertyNavigation - The navigation following a property
   * @property {Class} resourceIdentifiers.CastNavigation - The navigation following a type casting
   * @property {Class} resourceIdentifiers.WithKeyNavigation
   * - The navigation of selecting a single instance from an entity set
   * @property {Class} resourceIdentifiers.CallNavigation - The navigation of calling a callable
   * @property {Class} resourceIdentifiers.ResourceIdentifier
   * - The base type of all resource-identifiers
   */
  defineConstProperty(edm, 'resourceIdentifiers', (() => {
    const resourceIdentifiers = new Registry();

    /**
     * @class Navigation
     * @property {ResourceIdentifier} source - The source accessor navigated from
     */
    class Navigation {
      constructor({
        source,
      }) {
        defineConstProperty(this, 'source', source);
      }

      toJSON() {
        return [...this.source.toJSON(), this.toSelfJSON()];
      }

      // eslint-disable-next-line class-methods-use-this
      toSelfJSON() {
        throw new Error('I\'m abstract');
      }
    }

    /**
     * @class PropertyNavigation
     * @extends Navigation
     * @property {Property} property - The property navigated with
     */
    class PropertyNavigation extends Navigation {
      constructor({
        source,
        property,
        name,
      }) {
        super({
          source,
        });
        defineConstProperty(this, 'property', property);
        defineConstProperty(this, 'name', name);
        defineConstProperty(this, 'path', url.join(source.path, name));
      }

      toSelfJSON() {
        return {
          type: 'property',
          name: this.name,
        };
      }

      static defineOn(TypeResID, navigationProperties) {
        _.each(navigationProperties, (property, name) => {
          /**
           * Navigation property factory for the defined property
           * @memberof TypeResID#
           * @this TypeResID
           * @returns {ResourceIdentifier} The ResourceIdentifier to access the property
           */
          function navPropFactory() {
            return new property.type.ResourceIdentifier({
              navigation: new PropertyNavigation({ source: this, property, name }),
            });
          }

          defineProducedPropertyOnClass(TypeResID, name, navPropFactory);
        });
      }
    }

    class CallableNavigation extends Navigation {
      constructor({
        source,
        name,
      }) {
        super({
          source,
        });
        defineConstProperty(this, 'name', name);
        defineConstProperty(this, 'path', url.join(source.path, name));
      }

      static defineOn(TypeResID, callable) {
        function defineCallableOn(resID, callableTypes) {
          _.each(callableTypes, type => {
            /**
             * factory for the callables
             * @memberof resID#
             * @this resID
             * @returns {ResourceIdentifier} The ResourceIdentifier to access the property
             */
            function factory() {
              return new type.ResourceIdentifier({
                navigation: new CallableNavigation({ source: this, name: type.callableName }),
              });
            }

            defineProducedPropertyOnClass(resID, type.callableName, factory);
          });
        }
        defineCallableOn(TypeResID, callable.actions);
        defineCallableOn(TypeResID, callable.functions);
      }
    }

    /**
     * @class CastNavigation
     * @extends Navigation
     * @property {Type} type - The type casting to
     * @property {String} name - The type name used for casting
     */
    class CastNavigation extends Navigation {
      constructor({
        source,
        type,
        name = type.name,
      }) {
        super({
          source,
        });

        _.chain(this)
          .defineConstProperty('type', type)
          .defineConstProperty('name', name)
          .value();

        defineConstProperty(this, 'path', url.join(source.path, name));
      }

      toSelfJSON() {
        return {
          type: 'function',
          name: CastNavigation.navigationName,
          parameters: [this.name],
        };
      }

      static get navigationName() {
        return '$cast';
      }

      static defineOn(TypeResID) {
        /**
         * $cast navigation method of the TypeResID
         * @memberof TypeResID#
         * @this TypeResID
         * @param {String} name - The name of the subclass
         * @returns {TypeResID} The ResourceIdentifier to access the subclass object
         */
        function navCastMethod(name) {
          const entityType = edm.types.resolve(name, this.type.namespace);
          const type = TypeResID.prototype.type instanceof edm.types.CollectionType
            ? entityType.collectionType
            : entityType;
          const navigation = new CastNavigation({ source: this, type: entityType, name });

          return new type.ResourceIdentifier({ navigation });
        }

        defineConstProperty(TypeResID.prototype, CastNavigation.navigationName, navCastMethod);
      }
    }

    /**
     * @class WithKeyNavigation
     * @extends Navigation
     * @property {String|Number} key - The key of the selected entity
     */
    class WithKeyNavigation extends Navigation {
      constructor({
        source,
        key,
      }) {
        super({
          source,
        });

        defineConstProperty(this, 'key', key);
        defineConstProperty(this, 'path', (() => {
          // In case people pass a decimal string for a integer key
          // We cannot use parseInt directly, it would get a wrong number if the
          // key is beyond Number.MAX_SAFE_INTEGER
          if (_.isString(key)) {
            const keyType = _.chain(source)
              .result('type')
              .result('elementType')
              .result('keyProperty')
              .result('typeName')
              .value();

            if (keyType === 'integer') {
              if (key.match(/^[+-]?(0|[1-9][0-9]*)$/)) {
                return `${source.path}(${key})`;
              }
            }
            if (keyType === 'string') {
              return `${source.path}('${key}')`;
            }
          }

          return `${source.path}(${JSON.stringify(key)})`;
        })());
      }

      toSelfJSON() {
        return {
          type: 'function',
          name: WithKeyNavigation.navigationName,
          parameters: [this.key],
        };
      }

      static get navigationName() {
        return '$withKey';
      }

      static defineOn(TypeResID) {
        /**
         * $withKey navigation method of the TypeResID
         * @memberof TypeResID#
         * @this TypeResID
         * @param {String} key - The key of the element
         * @returns {ResourceIdentifier}
         * The ResourceIdentifier to access the element with the given key
         */
        function navWithKeyMethod(key) {
          const navigation = new WithKeyNavigation({ source: this, key });

          return new this.type.elementType.ResourceIdentifier({ navigation });
        }

        defineConstProperty(
          TypeResID.prototype,
          WithKeyNavigation.navigationName,
          navWithKeyMethod,
        );
      }
    }

    /**
     * @class CallNavigation
     * @extends Navigation
     * @property {Object} parameters - The parameters for the function call
     */
    class CallNavigation extends Navigation {
      constructor({
        source,
        parameters = {},
      }) {
        super({
          source,
        });
        defineConstProperty(this, 'parameters', parameters);

        const path = source.type instanceof edm.types.ActionType
          ? source.path : `${source.path}(${_.map(parameters, (value, name) => `${name}=${value}`).join(',')})`;

        defineConstProperty(this, 'path', path);
      }

      toSelfJSON() {
        return {
          type: 'function',
          name: CallNavigation.navigationName,
          // for callable, parameters are named
          parameters: [this.parameters],
        };
      }

      static get navigationName() {
        return '$call';
      }

      static defineOn(TypeResID) {
        /**
         * $call navigation method of the TypeResID
         * @memberof TypeResID#
         * @this TypeResID
         * @param {object} parameters - The parameters to call the callable
         * @return {ResourceIdentifier}
         * The ResourceIdentifier accessing the return value of the callable
         */
        function navCallMethod(parameters) {
          const navigation = new CallNavigation({ source: this, parameters });

          return new this.type.returnType.ResourceIdentifier({ navigation });
        }

        defineConstProperty(TypeResID.prototype, CallNavigation.navigationName, navCallMethod);
      }
    }

    /**
     * @class ResourceIdentifier
     * @property {Navigation} navigation
     * - The navigation back tracking the parent ResourceIdentifier
     */
    class ResourceIdentifier {
      /**
       * Create a ResourceIdentifier
       * @param {Object} [options] - The constructor options
       * @param {Navigation} [options.navigation]
       * - The navigation back tracking the parent ResourceIdentifier
       * @return {Void} Nothing to return
       */
      constructor({
        navigation,
      } = {}) {
        if (navigation) {
          defineConstProperty(this, 'navigation', navigation);
          defineConstProperty(this, 'path', navigation.path);
        } else {
          defineConstProperty(this, 'path', '');
        }
      }

      toJSON() {
        if (this.navigation) {
          return this.navigation.toJSON();
        }

        return [];
      }

      identifyEntitySet(json) {
        // eslint-disable-next-line
        let entitySet = this;

        /* eslint guard-for-in: 0 */
        /* eslint no-restricted-syntax: 0 */
        for (const i in json) {
          const item = json[i];

          if (item.type === 'property') {
            entitySet = entitySet[item.name];
          } else if (item.type === 'function') {
            entitySet = entitySet[item.name](...item.parameters);
          }

          if (!entitySet) {
            return null;
          }
        }

        return entitySet;
      }
    }
    /**
     * @class CollectionResourceIdentifier
     * @property {Navigation} navigation
     * - The navigation back tracking the parent ResourceIdentifier
     */
    class CollectionResourceIdentifier extends ResourceIdentifier {
      /**
       * Create a ResourceIdentifier
       * @param {Object} [options] - The constructor options
       * @param {Navigation} [options.navigation]
       * - The navigation back tracking the parent ResourceIdentifier
       * @return {Void} Nothing to return
       */
      constructor({
        navigation,
      } = {}) {
        super({ navigation });
      }
    }

    /**
     * define ResourceIdentifier type for the given type
     * @param {Type} type - An instance of one of the meta types
     * @return {Class} the ResourceIdentifier class
     */
    function resourceIdentifierForType(type) {
      // duck type, if the type has a "baseType", use its ResourceIdentifier as the super class
      const DefaultBase = type instanceof edm.types.CollectionType
        ? CollectionResourceIdentifier
        : ResourceIdentifier;
      const Base = type.baseType ? type.baseType.ResourceIdentifier : DefaultBase;

      const AccessorType = class extends Base {
      };

      /**
       * @name resId
       * @type ResourceIdentifier
       * @property {Type} type - The type associated with the ResourceIdentifier
       */
      defineConstProperty(AccessorType.prototype, 'type', type);

      resourceIdentifiers.register(AccessorType, type.name);

      return AccessorType;
    }

    // For each of the meta types defined by the type mixin, define the
    // "ResourceIdentifier" property
    _.each({

      // the root class 'Type' don't have an ResourceIdentifier property
      // Type: { factory() { } },

      PrimitiveType: {

        /**
         * PrimitiveType ResourceIdentifier type factory
         * @memberof PrimitiveType#
         * @this PrimitiveType
         * @returns {Class} The ResourceIdentifier type of the PrimitiveType
         */
        factory() {
          const PrimitiveTypeResID = resourceIdentifierForType(this);

          return PrimitiveTypeResID;
        },
      },

      ObjectType: {

        /**
         * ObjectType ResourceIdentifier type factory
         * @memberof ObjectType#
         * @this ObjectType
         * @returns {Class} The ResourceIdentifier type of the ObjectType
         */
        factory() {
          const ObjectTypeResID = resourceIdentifierForType(this);

          CastNavigation.defineOn(ObjectTypeResID);
          PropertyNavigation.defineOn(ObjectTypeResID, this.navigationProperties);
          if (this.callable) {
            CallableNavigation.defineOn(ObjectTypeResID, this.callable);
          }
          return ObjectTypeResID;
        },
      },

      // fallback to ObjectType.prototype.ResourceIdentifier
      // EntityType: { factory () { } },

      // fallback to ObjectType.prototype.ResourceIdentifier
      // ComplexType: { factory () { } },

      CollectionType: {

        /**
         * CollectionType ResourceIdentifier type factory
         * @memberof CollectionType#
         * @this CollectionType
         * @returns {Class} the ResourceIdentifier type of the CollectionType
         */
        factory() {
          const CollectionTypeResID = resourceIdentifierForType(this);

          CastNavigation.defineOn(CollectionTypeResID);
          // Only the entity sets can be navigated with keys
          if (this.elementType instanceof edm.types.EntityType) {
            WithKeyNavigation.defineOn(CollectionTypeResID);
          }
          PropertyNavigation.defineOn(CollectionTypeResID, this.navigationProperties);
          if (this.callable) {
            CallableNavigation.defineOn(CollectionTypeResID, this.callable);
          }

          return CollectionTypeResID;
        },
      },

      CallableType: {

        /**
         * CallableType ResourceIdentifier type factory
         * @memberof CallableType#
         * @this CallableType
         * @returns {Class} The ResourceIdentifier type of the CallableType
         */
        factory() {
          const CallableTypeResID = resourceIdentifierForType(this);

          CallNavigation.defineOn(CallableTypeResID);

          return CallableTypeResID;
        },
      },

    }, (def, typeName) => {
      /**
       * @name type
       * @type Type
       * @property {Class} ResourceIdentifier - The ResourceIdentifier type of the type
       */
      defineProducedPropertyOnClass(edm.types[typeName], 'ResourceIdentifier', def.factory);
    });

    _.chain(resourceIdentifiers)
      .defineConstProperty('ResourceIdentifier', ResourceIdentifier)
      .defineConstProperty('CollectionResourceIdentifier', CollectionResourceIdentifier)
      .defineConstProperty('Navigation', Navigation)
      .defineConstProperty('PropertyNavigation', PropertyNavigation)
      .defineConstProperty('CastNavigation', CastNavigation)
      .defineConstProperty('WithKeyNavigation', WithKeyNavigation)
      .defineConstProperty('CallNavigation', CallNavigation)
      .defineConstProperty('CallableNavigation', CallableNavigation)
      .value();

    return resourceIdentifiers;
  })());
}

module.exports = {
  resIdsPlugin,
};
