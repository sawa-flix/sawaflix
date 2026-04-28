/* eslint-disable */
const React = require('c:/Users/THE EYE INFORMATIQUE/OneDrive/Desktop/All/sawaflix/sawa/node_modules/react/index.js');

// Polyfill useEffectEvent if it's missing
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

// We must export everything from the original React
// and add our polyfill. To avoid "Invalid hook call",
// we must ensure we are returning the exact same functions.
const combined = {};
for (const key in React) {
  combined[key] = React[key];
}
combined.useEffectEvent = useEffectEvent;

module.exports = combined;
