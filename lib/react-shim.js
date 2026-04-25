import * as React from 'react';

// Use standard React exports
export * from 'react';

// Add the missing hook if it doesn't exist
// Using Vanilla JS to avoid parsing errors in some environments
if (typeof React.useEffectEvent === 'undefined') {
  React.useEffectEvent = (fn) => {
    const ref = React.useRef(fn);
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      React.useLayoutEffect(() => {
        ref.current = fn;
      });
    }
    return React.useCallback((...args) => ref.current(...args), []);
  };
}

// Ensure default export works
export default React;
