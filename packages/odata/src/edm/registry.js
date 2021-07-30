/* eslint-disable max-classes-per-file */
/* eslint-disable no-mixed-operators */
/* eslint no-param-reassign: 0 */
const _ = require('underscore');

/** Class representing a namespace */
class Namespace {
  /**
   * Create a namespace
   * @param {Namespace|null} parent - The parent namespace
   */
  constructor(parent) {
    this.map = {};
    this.parent = parent;
  }

  /**
   * Resolve an object by name
   * @param {String[]} segments - The name segments
   * @return {Object} The object registered with the given name
   */
  resolve(segments) {
    const iterator = (ns, seg) => {
      if (ns && ns instanceof Namespace) {
        return ns.map[seg];
      }
      return ns;
    };

    return _.reduce(segments, iterator, this)
      || this.parent && this.parent.resolve(segments);
  }

  /**
   * Register an object
   * @param {Object} obj - The object to be registered
   * @param {String[]} segments - The name segments for the object
   * @return {Void} Nothing to return
   */
  register(obj, segments) {
    const key = segments.pop();
    const iterator = (ns, seg) => {
      if (ns instanceof Namespace) {
        if (_.isUndefined(ns.map[seg])) {
          ns.map[seg] = new Namespace(ns);
        }
        return ns.map[seg];
      }
      throw new Error(`There are conflicts when defining registry for ${segments.join('.')}`);
    };

    const nsTarget = _.reduce(segments, iterator, this);

    nsTarget.map[key] = obj;
  }

  /**
   * Iterate through all objects in this namespace
   * @param {Function} worker - The callback for each of the objects
   * @return {void} Nothing to return
   */
  each(worker) {
    _.each(this.map, obj => {
      if (obj instanceof Namespace) {
        obj.each(worker);
      } else {
        worker(obj);
      }
    });
  }
}

function isObjectWithName(obj) {
  return typeof obj.name === 'string';
}

/** Class representing a namespaced registry */
class Registry {
  /**
   * Create a registry
   */
  constructor() {
    this.rootNamespace = new Namespace(null);
    this.qualifiedNames = new Map();
  }

  /**
   * Resolve an object by name
   * @param {String} name - The name of the object
   * @param {String} [namespace=this.rootNamespace] - The base namespace to resolve against
   * @return {Object|null} The object registered with the name
   */
  resolve(name, namespace) {
    const ns = namespace
      ? this.rootNamespace.resolve(namespace.split('.'))
      : this.rootNamespace;
    const obj = ns instanceof Namespace ? ns.resolve(name.split('.')) : null;

    return obj || null;
  }

  resolveQualifiedName(name, namespace) {
    const obj = this.resolve(name, namespace);
    if (obj instanceof Namespace || !obj) {
      return null;
    }

    return this.qualifiedNames.get(obj) || null;
  }

  /**
   * Register an object
   * @param {Object} obj - The object to be registered
   * @param {String} [name=obj.name] - The qualified name for the object
   * @return {void} Nothing to return
   */
  register(obj, name) {
    const realName = !name && isObjectWithName(obj) ? obj.name : name;
    if (typeof realName === 'undefined') {
      throw new Error(`name not passed in and obj ${JSON.stringify(obj)} doesn't have name property`);
    }
    this.rootNamespace.register(obj, realName.split('.'));
    this.qualifiedNames.set(obj, realName);
  }

  /**
   * Iterate through all registered objects
   * @param {Function} worker - The callback for each of the objects
   * @return {void} Nothing to return
   */
  each(worker) {
    this.rootNamespace.each(worker);
  }

  /**
   * Get namespace from a qualified name
   * @param {String} name - The qualified name
   * @return {String} The namespace
   */
  static getNamespace(name) {
    const segments = name.split('.');

    segments.pop();
    return segments.join('.');
  }

  /**
   * Get short name from a qualified name
   * @param {String} name - The qualified name
   * @return {String} The short name
   */
  static getShortName(name) {
    return _.last(name.split('.'));
  }

  static getQualifiedName(name, namespace) {
    return namespace ? `${namespace}.${name}` : name;
  }
}

module.exports = {
  Registry,
};
