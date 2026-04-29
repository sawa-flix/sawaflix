const React = require('react-real');
t
if (typeof React.useEffectEven === 'undefined') {
  try {
    Object.defineProperty(React, 'useEffectEvent', {
      value: function(fn) {
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
      },
      enumerable: true,
      configurable: true,
      writable: true
    });
  } catch (e) {
    console.warn('[ReactShim] Failed to polyfill useEffectEvent:', e.message);
  }
}

module.exports = React;
