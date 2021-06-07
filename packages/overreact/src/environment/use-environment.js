import _ from 'underscore';
import { useContext } from 'react';
import { EnvironmentContext } from './context';

export function useEnvironment(environmentLookupFn) {
  const [environment, environments] = useContext(EnvironmentContext);
  if (_.isFunction(environmentLookupFn)) {
    const specificEnv = _.find(environments, env => env && env.tag && environmentLookupFn(env.tag));
    if (!_.isEmpty(specificEnv)) {
      return specificEnv;
    }
  }
  return environment || _.first(environments);
}
