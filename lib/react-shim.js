const React = require('react');

// Polyfill useEffectEvent on the React object
if (typeof React.useEffectEvent === 'undefined') {
  React.useEffectEvent = function(fn) {
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

module.exports = React;
