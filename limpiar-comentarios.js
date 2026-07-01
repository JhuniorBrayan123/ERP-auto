const fs = require('fs');
const path = require('path');
const stripComments = require('strip-comments');

const DIRS_TO_CLEAN = ['src', 'tests'];

function cleanDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            cleanDirectory(fullPath);
        } else if (stat.isFile() && fullPath.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            
            // Remueve comentarios de línea (//) y bloque (/* */),
            // pero es inteligente para no borrar los "http://" dentro de strings.
            const cleanedContent = stripComments(content);

            // Solo guardamos si hubo un cambio real para no modificar timestamps innecesariamente
            if (content !== cleanedContent) {
                fs.writeFileSync(fullPath, cleanedContent, 'utf8');
                console.log(`[LIMPIO] ${fullPath}`);
            }
        }
    }
}

console.log('Iniciando limpieza de comentarios...');
DIRS_TO_CLEAN.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (fs.existsSync(fullPath)) {
        cleanDirectory(fullPath);
    }
});
console.log('¡Limpieza completada! Todos los comentarios han sido eliminados.');
