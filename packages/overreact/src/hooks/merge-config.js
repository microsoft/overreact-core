import { isFunction } from 'underscore';

export function getMergedConfig(config, origin) {
  // create new instance of origin, origin is also required to be an object
  const newInstance = { ...origin };

  if (!config) {
    return newInstance;
  }

  if (isFunction(config)) {
    return config(newInstance);
  }

  return {
    ...origin,
    ...config,
  };
}
