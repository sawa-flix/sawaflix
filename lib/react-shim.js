import * as React from 'react';

// Use standard React exports
export * from 'react';

// Add the missing hook if it doesn't exist
if (typeof (React as any).useEffectEvent === 'undefined') {
  (React as any).useEffectEvent = (fn: any) => {
    const ref = React.useRef(fn);
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      React.useLayoutEffect(() => {
        ref.current = fn;
      });
    }
    return React.useCallback((...args: any[]) => ref.current(...args), []);
  };
}

// Ensure default export works
export default React;
