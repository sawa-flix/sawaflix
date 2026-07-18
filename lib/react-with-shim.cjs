/**
 * react-with-shim.cjs
 *
 * This shim is pointed to by next.config.mjs via:
 *   config.resolve.alias['react$'] = '<this file>'
 *
 * WHY this exists:
 *   sanity v5 was compiled against a React 19 canary build that exported
 *   `useEffectEvent` as a proper named ESM export. React 19 stable ships only
 *   a CJS build where `useEffectEvent` exists at runtime (exports.useEffectEvent)
 *   but webpack's static ESM analyser cannot see it because there is no
 *   corresponding entry in React's package.json `exports` map.
 *
 *   By aliasing bare `react` imports to this shim (using `react$` for exact
 *   match so `react/jsx-runtime` still resolves normally), webpack can see
 *   that `useEffectEvent` is explicitly assigned on module.exports, satisfying
 *   the static named-export check.
 *
 * CIRCULAR REFERENCE PREVENTION:
 *   We use a relative path to node_modules/react (not the bare specifier 'react')
 *   so that webpack does NOT apply the `react$` alias recursively when resolving
 *   the real React package from inside this file.
 */
'use strict';

// Bare module specifier → Next.js resolves it correctly for Server/Client components
const React = require('react');

// Re-export the entire React object as the default export
module.exports = React;

// ─── Explicitly re-declare every named export so webpack static analysis ───
// can verify them. Without this, ESM `import { X } from 'react'` would fail
// because webpack cannot enumerate named exports from a CJS default export.
module.exports.Activity                                                       = React.Activity;
module.exports.Children                                                       = React.Children;
module.exports.Component                                                      = React.Component;
module.exports.Fragment                                                       = React.Fragment;
module.exports.Profiler                                                       = React.Profiler;
module.exports.PureComponent                                                  = React.PureComponent;
module.exports.StrictMode                                                     = React.StrictMode;
module.exports.Suspense                                                       = React.Suspense;
module.exports.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
module.exports.__COMPILER_RUNTIME                                             = React.__COMPILER_RUNTIME;
module.exports.act                                                            = React.act;
module.exports.cache                                                          = React.cache;
module.exports.cacheSignal                                                    = React.cacheSignal;
module.exports.captureOwnerStack                                              = React.captureOwnerStack;
module.exports.cloneElement                                                   = React.cloneElement;
module.exports.createContext                                                  = React.createContext;
module.exports.createElement                                                  = React.createElement;
module.exports.createRef                                                      = React.createRef;
module.exports.forwardRef                                                     = React.forwardRef;
module.exports.isValidElement                                                 = React.isValidElement;
module.exports.lazy                                                           = React.lazy;
module.exports.memo                                                           = React.memo;
module.exports.startTransition                                                = React.startTransition;
module.exports.unstable_useCacheRefresh                                       = React.unstable_useCacheRefresh;
module.exports.use                                                            = React.use;
module.exports.useActionState                                                 = React.useActionState;
module.exports.useCallback                                                    = React.useCallback;
module.exports.useContext                                                      = React.useContext;
module.exports.useDebugValue                                                  = React.useDebugValue;
module.exports.useDeferredValue                                               = React.useDeferredValue;
module.exports.useEffect                                                      = React.useEffect;
// ← The key export — present in React 19 CJS but not in the ESM export map:
module.exports.useEffectEvent                                                 = React.useEffectEvent || React.useCallback;
module.exports.useId                                                          = React.useId;
module.exports.useImperativeHandle                                            = React.useImperativeHandle;
module.exports.useInsertionEffect                                             = React.useInsertionEffect;
module.exports.useLayoutEffect                                                = React.useLayoutEffect;
module.exports.useMemo                                                        = React.useMemo;
module.exports.useOptimistic                                                  = React.useOptimistic;
module.exports.useReducer                                                     = React.useReducer;
module.exports.useRef                                                         = React.useRef;
module.exports.useState                                                       = React.useState;
module.exports.useSyncExternalStore                                           = React.useSyncExternalStore;
module.exports.useTransition                                                  = React.useTransition;
module.exports.version                                                        = React.version;
module.exports.default                                                        = React;
