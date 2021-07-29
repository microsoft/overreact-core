/**
 * the reflection module for property defintions
 */
const _ = require('underscore');

/**
* Define a const property
* @param {Object} obj - the host object of the proprty
* @param {String} name - the name of the property
* @param {Object} value - the value of the property
* @return {Object} the host object
*/
function defineConstProperty(obj, name, value) {
  return Object.defineProperty(obj, name, {
    value,
    enumerable: true,
    writable: false,
  });
}

/**
* Define a produced property with a factory
* @param {Object} obj - the host object of the proprty
* @param {String} name - the name of the property
* @param {Function} factory - the factory to produce the property value
* @return {Object} the host object
*/
function defineProducedProperty(obj, name, factory) {
  return Object.defineProperty(obj, name, {
    get() {
      const value = factory.apply(obj);

      defineConstProperty(obj, name, value);
      return value;
    },
    enumerable: true,
    configurable: true,
  });
}

/**
* Define a produced property on a class
* @param {Class} Class - the host class of the proprty
* @param {String} name - the name of the property
* @param {Function} factory - the factory to produce the property value
* @return {Class} the host class
*/
function defineProducedPropertyOnClass(Class, name, factory) {
  const RAND_MAX = 65535;
  const className = Class.name || `Anony${_.random(0, RAND_MAX)}`;
  const symbol = `__${className}_${name}`;

  Object.defineProperty(Class.prototype, name, {
    get() {
      if (!Object.prototype.hasOwnProperty.call(this, symbol)) {
        defineConstProperty(this, symbol, factory.apply(this));
      }
      return this[symbol];
    },
    enumerable: true,
  });

  return Class;
}

/**
* Define a computed property whose value is computed each time the getter being called
* @param {Object} obj - the host object of the proprty
* @param {String} name - the name of the property
* @param {Function} getter - the getter to compute the property value
* @return {Object} the host object
*/
function defineComputedProperty(obj, name, getter) {
  return Object.defineProperty(obj, name, {
    get: getter,
    enumerable: true,
  });
}

// Make the functions chainable with underscorejs
_.mixin({
  defineConstProperty,
  defineProducedProperty,
  defineProducedPropertyOnClass,
  defineComputedProperty,
});

/**
* Detect whether or not a object has certain property without evaluation
* @param {Object} obj - the host class of the proprty
* @param {String} name - the name of the property
* @return {Boolean} whether the property is defined
*/
function hasOwnProperty(obj, name) {
  return !!Object.getOwnPropertyDescriptor(obj, name);
}

module.exports = {
  defineConstProperty,
  defineProducedProperty,
  defineProducedPropertyOnClass,
  defineComputedProperty,
  hasOwnProperty,
};
