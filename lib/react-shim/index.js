const React = require('react');

// Create a copy of React to avoid mutating the original in case of cache issues
const ReactShim = { ...React };

// Polyfill useEffectEvent if it's missing
if (typeof ReactShim.useEffectEvent === 'undefined') {
  ReactShim.useEffectEvent = function(fn) {
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
}

module.exports = ReactShim;
