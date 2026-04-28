/* eslint-disable */
// Using absolute path to real React to avoid recursion with the webpack alias
const React = require('../../node_modules/react/index.js');

// Polyfill useEffectEvent if it's missing (required for Sanity compatibility)
const useEffectEvent = React.useEffectEvent || function(fn) {
  const ref = React.useRef(fn);
  if (typeof window !== 'undefined') {
    React.useLayoutEffect(function() {
      ref.current = fn;
    });
  }
  return React.useCallback(function() {
    const args = Array.prototype.slice.call(arguments);
    return ref.current.apply(null, args);
  }, []);
};

// Export everything from React, plus our polyfill
module.exports = {
  ...React,
  useEffectEvent
};
