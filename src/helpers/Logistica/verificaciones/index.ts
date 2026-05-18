/**
 * Barrel export para todos los helpers de verificaciones de movimientos.
 *
 * Este archivo re-exporta todo desde los módulos separados,
 * permitiendo importar desde una sola ubicación.
 *
 * @example
 * import { verificarStockYKardex, crearIngresoEstandarParaPrecondicion } from './verificaciones';
 */

// Verificaciones de stock
export {
    verificarStockYKardex,
    verificarStockPorCodigoYClick,
    verificarStockMasivo,
} from './verificar-stock.helper';

// Verificaciones de kardex
export {
    verificarKardexTotalEstandar,
    verificarKardexDesdeStock,
} from './verificar-kardex.helper';

// Crear movimientos como precondición
export {
    crearAjusteConItem,
    crearIngresoEstandarParaPrecondicion,
    crearIngresoEstandarParaPrecondicion2,
    crearSalidaEstandarParaPrecondicion,
    crearIngresoBaseParaClonacion,
} from './crear-movimiento.helper';

// Navegación a secciones
export {
    navegarAIngresosYNuevo,
    navegarATrasladosYNuevo,
    navegarASalidasYNuevo,
} from './navegar-movimiento.helper';

// Registro/confirmación de movimientos
export {
    definirAlmacenYMotivo,
    definirCantidadYFactor,
    buscarYSeleccionarItem,
    definirCantidadYRegistrarIngreso,
    registrarIngresoEIrAlListado,
    registrarAjusteEIrAlListado,
    registrarSalidaYDespachar,
    registrarTrasladoEIrAlListado,
} from './registrar-movimiento.helper';

// Acciones de listado
export {
    eliminarMovimientoDesdeListado,
    editarCantidadDeMovimiento,
    clonarMovimientoDesdeListado,
} from './acciones-listado.helper';

// Bitácora
export {
    verificarEventoEnBitacora,
    abrirYCerrarBitacora,
    verificarBitacoraEdicion,
} from './bitacora.helper';

// Datos opcionales
export {
    configurarDatosOpcionalesEstandar,
} from './datos-opcionales.helper';

// Movimientos masivos y rápidos
export {
    buscarItemEnListadoRapidoYAcceder,
    configurarYRetirarStockRapido,
    configurarYRetirarStockRapido2,
    configurarYAumentarStockRapido,
    navegarAIngresosYAbrirAccionesImpresion,
    cargarMovimientoMasivoDesdeExcel,
} from './movimiento-masivo.helper';

// ─── Backward compat alias ────────────────────────────────────────────
// El nombre original tenía un typo (verificarstockmasivo sin camelCase).
// Lo re-exportamos para que los imports existentes no se rompan.
export { verificarStockMasivo as verificarstockmasivo } from './verificar-stock.helper';
