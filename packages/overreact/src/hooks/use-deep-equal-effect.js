import { useRef, useEffect, useDebugValue } from 'react';
import { isEqual } from 'underscore';

export function useDeepEqualEffect(fn, deps) {
  const isFirst = useRef(true);
  const prevDeps = useRef(deps);

  useEffect(() => {
    const isSame = prevDeps.current.every((obj, key) => isEqual(obj, deps[key]));

    if (isFirst.current || !isSame) {
      fn();
    }

    isFirst.current = false;
    prevDeps.current = deps;
  }, [deps, fn]);

  useDebugValue('useDeepEqualEffect');
}
