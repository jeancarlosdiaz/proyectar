const fs = require('fs');
const path = require('path');

const srcDir = 'c:\\xampp\\htdocs\\proyectar\\client\\src';

function processDirectory(dir, isComponent) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath, isComponent);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');

            if (content.includes('http://localhost/proyectar/api')) {
                // Determine import path
                const importPath = dir === srcDir ? './config' : (dir.includes('components') || dir.includes('pages')) ? '../config' : '../../config';
                
                // Add import if not present
                if (!content.includes('import config from')) {
                    // Find the last import statement
                    const importRegex = /^import\s+.*?;?\s*$/gm;
                    let lastImportIndex = 0;
                    let match;
                    while ((match = importRegex.exec(content)) !== null) {
                        lastImportIndex = match.index + match[0].length;
                    }

                    if (lastImportIndex > 0) {
                        content = content.substring(0, lastImportIndex) + `\nimport config from '${importPath}';` + content.substring(lastImportIndex);
                    } else {
                        content = `import config from '${importPath}';\n` + content;
                    }
                }

                // Replace 'http://localhost/proyectar/api/...' with `${config.apiUrl}/...`
                // Handle single quotes
                content = content.replace(/'http:\/\/localhost\/proyectar\/api([^']*)'/g, '`${config.apiUrl}$1`');
                // Handle double quotes
                content = content.replace(/"http:\/\/localhost\/proyectar\/api([^"]*)"/g, '`${config.apiUrl}$1`');
                // Handle backticks (already template literals)
                content = content.replace(/http:\/\/localhost\/proyectar\/api/g, '${config.apiUrl}');

                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    });
}

processDirectory(srcDir, false);
console.log('Finalizado el reemplazo.');
