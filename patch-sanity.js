const fs = require('fs');
const path = require('path');

const filesToPatch = [
  'node_modules/sanity/lib/index.js',
  'node_modules/sanity/lib/_chunks-es/structureTool.js'
];

const polyfill = `
const useEffectEvent = (fn) => {
  const ref = React.useRef(fn);
  if (typeof window !== 'undefined') {
    React.useLayoutEffect(() => {
      ref.current = fn;
    });
  }
  return React.useCallback((...args) => {
    return ref.current?.(...args);
  }, []);
};
`;

filesToPatch.forEach(file => {
  const filePath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} (not found)`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Remove useEffectEvent from the named imports from "react"
  content = content.replace(/import\s+React,\s+\{([^}]*),\s*useEffectEvent\s*([^}]*)\}\s+from\s+"react"/g, (match, before, after) => {
     return `import React, {${before}${after}} from "react";\n${polyfill}`;
  });

  // 2. Also handle cases where React is not the first import or it's slightly different
  content = content.replace(/import\s+\{([^}]*),\s*useEffectEvent\s*([^}]*)\}\s+from\s+"react"/g, (match, before, after) => {
     return `import {${before}${after}} from "react";\n// useEffectEvent polyfill added by script\n${polyfill}`;
  });

  fs.writeFileSync(filePath, content);
  console.log(`Patched ${file}`);
});
