const fs = require('fs');
const file = '/Users/marcossandovalruiz/Documents/quhealthy/components/consultation/PastConsultationModal.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('createPortal')) {
  content = content.replace("import React, { useEffect, useState } from 'react';", "import React, { useEffect, useState } from 'react';\nimport { createPortal } from 'react-dom';");
  
  content = content.replace(
    /return \(\s*<AnimatePresence>/,
    "const [mounted, setMounted] = useState(false);\n  useEffect(() => { setMounted(true); }, []);\n\n  if (!mounted) return null;\n\n  return createPortal(\n    <AnimatePresence>"
  );

  content = content.replace(
    /<\/AnimatePresence>\s*\);\s*};\s*$/,
    "</AnimatePresence>,\n    document.body\n  );\n};\n"
  );
  
  fs.writeFileSync(file, content);
  console.log("Patched PastConsultationModal.tsx");
} else {
  console.log("Already patched");
}
