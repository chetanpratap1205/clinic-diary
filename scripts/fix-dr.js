const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const allFiles = fs.readdirSync(srcDir, { recursive: true });
const targetFiles = allFiles.filter(f => f.endsWith('.ts') || f.endsWith('.tsx')).map(f => path.join(srcDir, f));

for (const file of targetFiles) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace `Dr. ${var}` -> `${formatDoctorName(var)}`
  content = content.replace(/Dr\.\s*\$\{([a-zA-Z0-9_\.]*(?:doctorName|name|doctorFirst|Name|docName|doctor)[a-zA-Z0-9_]*)\}/g, (match, p1) => {
    return `\${formatDoctorName(${p1})}`;
  });

  // Replace `Dr. {var}` -> `{formatDoctorName(var)}`
  content = content.replace(/Dr\.\s*\{([a-zA-Z0-9_\.]*(?:doctorName|name|doctorFirst|Name|docName|doctor)[a-zA-Z0-9_]*)\}/g, (match, p1) => {
    return `{formatDoctorName(${p1})}`;
  });
  
  // Wait, we need to handle "Dr. " + item.doctorName cases too.
  content = content.replace(/"Dr\.\s*"\s*\+\s*([a-zA-Z0-9_\.]*(?:doctorName|name|doctorFirst|Name|docName|doctor)[a-zA-Z0-9_]*)/g, (match, p1) => {
    return `formatDoctorName(${p1})`;
  });

  if (content !== originalContent) {
    if (!content.includes('formatDoctorName')) {
      const importStatement = `import { formatDoctorName } from "@/lib/utils";\n`;
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const nextLineIndex = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, nextLineIndex + 1) + importStatement + content.slice(nextLineIndex + 1);
      } else {
        content = importStatement + content;
      }
    }
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
