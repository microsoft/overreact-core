import { useMemo } from 'react';

/* eslint-disable no-continue */
export function useComponent() {
  // TODO: Detect DEBUG mode
  return useMemo(() => {
    try {
      throw new Error('fake error');
    } catch (ex) {
      const { stack } = ex;
      const stacks = stack.split('\n');

      for (let i = 0; i < stacks.length; i += 1) {
        if (i === 0) {
          // first line will be 'Error: fake error'
          continue;
        }

        // a typical stack line looks like this:
        // "at useComponent (webpack://1:2:3)"
        const stackSegs = stacks[i].trim().split(' ');

        // we only need the 2nd segment, which is the function name
        const funcName = stackSegs[1] || '';

        // we'll ignore anything that is a React hook
        if (!funcName
        || funcName === 'eval'
        || funcName === 'mountMemo'
        || funcName === 'Object.useMemo'
        || funcName.startsWith('use')) {
          continue;
        }

        // we'll return on the first non-hook function name, which is most likely
        // to be our calling component name;
        return funcName;
      }
    }

    return '__noname__';
  }, []);
}
