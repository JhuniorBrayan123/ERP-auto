const fs = require('fs');
const path = require('path');

const basePath = 'C:\\Users\\USER\\WebstormProjects\\erpperu2-automation\\tests\\Logistica';

const directoriesToCreate = [
    'Productos-Stock/PS-2_carga-masiva',
    'Productos-Stock/PS-3_creacion-items',
    'Productos-Stock/PS-4_editar-item',
    'Productos-Stock/PS-5_clonar-item',
    'Productos-Stock/PS-6_actualizacion-masiva-items',
    'Productos-Stock/PS-7_actualizacion-masiva-stock',
    'Productos-Stock/PS-8_exportar-items',
    'Movimientos/MS-1_ingreso',
    'Movimientos/MS-2_salida',
    'Movimientos/MS-3_ajuste',
    'Movimientos/MS-4_traslado',
    'Movimientos/MS-5_edicion',
    'Movimientos/MS-6_clonacion',
    'Movimientos/MS-7_movimiento-masivo',
    'Movimientos/MS-8_acciones-impresion',
    'Movimientos/MS-9_eliminacion',
    'Movimientos/MS-10_MS-11_exportaciones',
    'Movimientos/MS-12_movimientos-rapidos'
];

directoriesToCreate.forEach(dir => {
    fs.mkdirSync(path.join(basePath, dir), { recursive: true });
});

const fileMappings = [
    {old: 'Productos-Stock/creacion-masiva/creacion-masiva-combos.spec.ts', new: 'Productos-Stock/PS-2_carga-masiva/PS-2-creacion-masiva-combos.spec.ts', prefix: 'PS-2'},
    {old: 'Productos-Stock/creacion-masiva/creacion-masiva-insumos.spec.ts', new: 'Productos-Stock/PS-2_carga-masiva/PS-2-creacion-masiva-insumos.spec.ts', prefix: 'PS-2'},
    {old: 'Productos-Stock/creacion-masiva/creacion-masiva-listas.spec.ts', new: 'Productos-Stock/PS-2_carga-masiva/PS-2-creacion-masiva-listas.spec.ts', prefix: 'PS-2'},
    {old: 'Productos-Stock/creacion-masiva/creacion-masiva-productos.spec.ts', new: 'Productos-Stock/PS-2_carga-masiva/PS-2-creacion-masiva-productos.spec.ts', prefix: 'PS-2'},
    {old: 'Productos-Stock/creacion-masiva/creacion-masiva-recetas.spec.ts', new: 'Productos-Stock/PS-2_carga-masiva/PS-2-creacion-masiva-recetas.spec.ts', prefix: 'PS-2'},
    {old: 'Productos-Stock/creacion-masiva/creacion-masiva-servicios.spec.ts', new: 'Productos-Stock/PS-2_carga-masiva/PS-2-creacion-masiva-servicios.spec.ts', prefix: 'PS-2'},
    
    {old: 'Productos-Stock/creacion-items/crear-combo.spec.ts', new: 'Productos-Stock/PS-3_creacion-items/PS-3-crear-combo.spec.ts', prefix: 'PS-3'},
    {old: 'Productos-Stock/creacion-items/crear-insumo.spec.ts', new: 'Productos-Stock/PS-3_creacion-items/PS-3-crear-insumo.spec.ts', prefix: 'PS-3'},
    {old: 'Productos-Stock/creacion-items/crear-lista.spec.ts', new: 'Productos-Stock/PS-3_creacion-items/PS-3-crear-lista.spec.ts', prefix: 'PS-3'},
    {old: 'Productos-Stock/creacion-items/crear-producto.spec.ts', new: 'Productos-Stock/PS-3_creacion-items/PS-3-crear-producto.spec.ts', prefix: 'PS-3'},
    {old: 'Productos-Stock/creacion-items/crear-receta.spec.ts', new: 'Productos-Stock/PS-3_creacion-items/PS-3-crear-receta.spec.ts', prefix: 'PS-3'},
    {old: 'Productos-Stock/creacion-items/crear-servicio.spec.ts', new: 'Productos-Stock/PS-3_creacion-items/PS-3-crear-servicio.spec.ts', prefix: 'PS-3'},
    
    {old: 'Productos-Stock/creacion-items/edicion-item-afectacion-igv.spec.ts', new: 'Productos-Stock/PS-4_editar-item/PS-4-edicion-item-afectacion-igv.spec.ts', prefix: 'PS-4'},
    {old: 'Productos-Stock/creacion-items/edicion-item-nombre.spec.ts', new: 'Productos-Stock/PS-4_editar-item/PS-4-edicion-item-nombre.spec.ts', prefix: 'PS-4'},
    {old: 'Productos-Stock/creacion-items/edicion-item-precio.spec.ts', new: 'Productos-Stock/PS-4_editar-item/PS-4-edicion-item-precio.spec.ts', prefix: 'PS-4'},
    
    {old: 'Productos-Stock/creacion-items/clonar-item.spec.ts', new: 'Productos-Stock/PS-5_clonar-item/PS-5-clonar-item.spec.ts', prefix: 'PS-5'},
    
    {old: 'Productos-Stock/edicion-masiva/edicion-masiva-insumos.spec.ts', new: 'Productos-Stock/PS-6_actualizacion-masiva-items/PS-6-edicion-masiva-insumos.spec.ts', prefix: 'PS-6'},
    {old: 'Productos-Stock/edicion-masiva/edicion-masiva-productos.spec.ts', new: 'Productos-Stock/PS-6_actualizacion-masiva-items/PS-6-edicion-masiva-productos.spec.ts', prefix: 'PS-6'},
    {old: 'Productos-Stock/edicion-masiva/edicion-masiva-servicios.spec.ts', new: 'Productos-Stock/PS-6_actualizacion-masiva-items/PS-6-edicion-masiva-servicios.spec.ts', prefix: 'PS-6'},
    
    {old: 'Productos-Stock/edicion-masiva/edicion-masiva-stock.spec.ts', new: 'Productos-Stock/PS-7_actualizacion-masiva-stock/PS-7-edicion-masiva-stock.spec.ts', prefix: 'PS-7'},
    
    {old: 'Productos-Stock/creacion-items/exportar-items.spec.ts', new: 'Productos-Stock/PS-8_exportar-items/PS-8-exportar-items.spec.ts', prefix: 'PS-8'},

    // MOVIMIENTOS
    {old: 'Movimientos/ingreso.spec.ts', new: 'Movimientos/MS-1_ingreso/MS-1-ingreso.spec.ts', prefix: 'MS-1'},
    {old: 'Movimientos/salida.spec.ts', new: 'Movimientos/MS-2_salida/MS-2-salida.spec.ts', prefix: 'MS-2'},
    {old: 'Movimientos/ajuste.spec.ts', new: 'Movimientos/MS-3_ajuste/MS-3-ajuste.spec.ts', prefix: 'MS-3'},
    {old: 'Movimientos/datos-adicionales.spec.ts', new: 'Movimientos/MS-3_ajuste/MS-3-datos-adicionales.spec.ts', prefix: 'MS-3'},
    {old: 'Movimientos/traslado.spec.ts', new: 'Movimientos/MS-4_traslado/MS-4-traslado.spec.ts', prefix: 'MS-4'},
    {old: 'Movimientos/edicion.spec.ts', new: 'Movimientos/MS-5_edicion/MS-5-edicion.spec.ts', prefix: 'MS-5'},
    {old: 'Movimientos/clonacion.spec.ts', new: 'Movimientos/MS-6_clonacion/MS-6-clonacion.spec.ts', prefix: 'MS-6'},
    {old: 'Movimientos/movimientos-masivos.spec.ts', new: 'Movimientos/MS-7_movimiento-masivo/MS-7-movimientos-masivos.spec.ts', prefix: 'MS-7'},
    {old: 'Movimientos/acciones.spec.ts', new: 'Movimientos/MS-8_acciones-impresion/MS-8-acciones.spec.ts', prefix: 'MS-8'},
    {old: 'Movimientos/eliminacion.spec.ts', new: 'Movimientos/MS-9_eliminacion/MS-9-eliminacion.spec.ts', prefix: 'MS-9'},
    {old: 'Movimientos/exportaciones.spec.ts', new: 'Movimientos/MS-10_MS-11_exportaciones/MS-10-11-exportaciones.spec.ts', prefix: 'MS-10-11'},
    {old: 'Movimientos/movimientos-rapidos.spec.ts', new: 'Movimientos/MS-12_movimientos-rapidos/MS-12-movimientos-rapidos.spec.ts', prefix: 'MS-12'},
];

fileMappings.forEach(mapping => {
    const oldPath = path.join(basePath, mapping.old);
    const newPath = path.join(basePath, mapping.new);
    if (fs.existsSync(oldPath)) {
        let content = fs.readFileSync(oldPath, 'utf8');
        
        // Match test.describe('Algo', ...
        content = content.replace(/test\.describe\(\s*(['"\])(.*?)\1/g, (match, quote, title) => {
            // Eliminar tags preexistentes al inicio del titulo por si las hay, ej "MS-1 | Algo"
            let cleanTitle = title;
            if (cleanTitle.startsWith(mapping.prefix + ' | ')) {
                cleanTitle = cleanTitle.substring((mapping.prefix + ' | ').length);
            }
            return \	est.describe(\\ | \\\;
        });

        // Match test('Algo', ...
        content = content.replace(/test\(\s*(['"\])(.*?)\1/g, (match, quote, title) => {
            // Solo añadir tag si no está ya
            let cleanTitle = title;
            // Clean up any existing tag of the same type at the end
            cleanTitle = cleanTitle.replace(new RegExp(' @' + mapping.prefix + '$'), '');
            return \	est(\\ @\\\;
        });

        fs.writeFileSync(newPath, content);
        fs.unlinkSync(oldPath);
        console.log(\Moved: \\);
    } else {
        console.log(\Not found: \\);
    }
});

const dirsToRemove = ['Productos-Stock/creacion-items', 'Productos-Stock/creacion-masiva', 'Productos-Stock/edicion-masiva'];
dirsToRemove.forEach(dir => {
    const dirPath = path.join(basePath, dir);
    if(fs.existsSync(dirPath) && fs.readdirSync(dirPath).length === 0) {
        fs.rmdirSync(dirPath);
    }
});
