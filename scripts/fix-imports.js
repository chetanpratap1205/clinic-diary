const fs = require('fs');
const path = require('path');

const walk = (d) => {
  const items = fs.readdirSync(d);
  for (const item of items) {
    const full = path.join(d, item);
    if (fs.statSync(full).isDirectory()) {
      walk(full);
    } else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      let content = fs.readFileSync(full, 'utf8');
      
      // Skip utils.ts itself
      if (full.includes('utils.ts')) continue;
      
      if (content.includes('formatDoctorName') && !content.includes('import { formatDoctorName')) {
        // Find last import line and add after it
        const lines = content.split('\n');
        let lastImportIdx = -1;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) {
            lastImportIdx = i;
          }
        }
        
        if (lastImportIdx !== -1) {
          lines.splice(lastImportIdx + 1, 0, 'import { formatDoctorName } from "@/lib/utils";');
          content = lines.join('\n');
          fs.writeFileSync(full, content, 'utf8');
          console.log('Fixed import in:', full);
        }
      }
    }
  }
};

walk('src');
