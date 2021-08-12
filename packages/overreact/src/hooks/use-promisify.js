import { useMemo } from 'react';
import Promise from 'bluebird';

export function usePromisify(actions) {
  return useMemo(() => actions.map(action => (...args) => new Promise((resolve, reject) => {
    const configBuilder = config => ({
      ...config,
      onComplete: processedResponse => {
        if (config.onComplete) {
          config.onComplete(processedResponse);
        }
        resolve(processedResponse);
      },
      onError: error => {
        if (config.onError) {
          config.onError(error);
        }
        reject(error);
      },
    });

    const mergedArgs = [...args, configBuilder];
    action(...mergedArgs);
  })), actions); // eslint-disable-line react-hooks/exhaustive-deps
}
