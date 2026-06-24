const fs = require('fs');
const path = require('path');

function removeComments(code) {
    let out = '';
    let inString = false;
    let stringChar = '';
    let inSingleComment = false;
    let inMultiComment = false;
    let i = 0;
    
    while (i < code.length) {
        if (!inString && !inSingleComment && !inMultiComment) {
            if (code[i] === '/' && code[i+1] === '/') {
                inSingleComment = true;
                i += 2;
                continue;
            }
            if (code[i] === '/' && code[i+1] === '*') {
                inMultiComment = true;
                i += 2;
                continue;
            }
            if (code[i] === '"' || code[i] === "'" || code[i] === '`') {
                inString = true;
                stringChar = code[i];
            }
            out += code[i];
        } else if (inString) {
            if (code[i] === '\\') {
                out += code[i];
                i++;
                if (i < code.length) {
                    out += code[i];
                }
                i++;
                continue;
            }
            if (code[i] === stringChar) {
                inString = false;
            }
            out += code[i];
        } else if (inSingleComment) {
            if (code[i] === '\n' || code[i] === '\r') {
                inSingleComment = false;
                // keep the newline
                out += code[i];
            }
        } else if (inMultiComment) {
            if (code[i] === '*' && code[i+1] === '/') {
                inMultiComment = false;
                i += 2;
                continue;
            }
        }
        i++;
    }
    
    // Optional: Limpiar líneas vacías que hayan quedado (opcional)
    // out = out.replace(/^\s*[\r\n]/gm, '');
    
    return out;
}

function processDirectory(directory) {
    if (!fs.existsSync(directory)) {
        console.error(`El directorio ${directory} no existe.`);
        return;
    }

    const files = fs.readdirSync(directory);
    
    for (const file of files) {
        const fullPath = path.join(directory, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && file !== 'node_modules' && file !== '.git' && file !== 'dist') {
            processDirectory(fullPath);
        } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.js'))) {
            try {
                const code = fs.readFileSync(fullPath, 'utf8');
                const newCode = removeComments(code);
                if (code !== newCode) {
                    fs.writeFileSync(fullPath, newCode, 'utf8');
                    console.log(`Comentarios eliminados en: ${fullPath}`);
                }
            } catch (err) {
                console.error(`Error procesando archivo ${fullPath}:`, err);
            }
        }
    }
}

const targetDir = path.resolve(process.argv[2] || './src');
console.log(`Iniciando limpieza de comentarios en: ${targetDir}`);
processDirectory(targetDir);
console.log('Finalizado.');
