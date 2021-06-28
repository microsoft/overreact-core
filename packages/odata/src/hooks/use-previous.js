const { useRef, useEffect } = require('react');

function usePrevious(value) {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

module.exports = {
  usePrevious,
};
