# Tests Automatizados

## 📋 2 — ¿Qué casos están automatizados?

### 🔐 Login / Autenticación

| ID           | Descripción                                                                 | Estado |
|:-------------|:----------------------------------------------------------------------------|:------:|
| `auth.setup` | Login y guardado de sesión (se ejecuta automáticamente antes de cada suite) |   ✅    |

---

### 📦 Logística — Movimientos de Almacén

| ID              | Descripción                                                        | Tag      |
|:----------------|:-------------------------------------------------------------------|:---------|
| `MS-1`          | Registrar ingreso de almacén y verificar aumento de stock + Kardex | `@MS-1`  |
| `MS-2`          | Registrar salida de almacén y verificar descuento de stock         | `@MS-2`  |
| `MS-3`          | Ajuste de stock (positivo y negativo)                              | `@MS-3`  |
| `MS-4`          | Traslado entre almacenes                                           | `@MS-4`  |
| `MS-5`          | Edición de movimiento registrado                                   | `@MS-5`  |
| `MS-6`          | Clonación de movimiento                                            | `@MS-6`  |
| `MS-7`          | Movimiento masivo (Excel)                                          | `@MS-7`  |
| `MS-8`          | Acciones de impresión                                              | `@MS-8`  |
| `MS-9`          | Eliminación de movimiento                                          | `@MS-9`  |
| `MS-10 / MS-11` | Exportaciones                                                      | `@MS-10` |
| `MS-12`         | Movimientos rápidos                                                | `@MS-12` |

---

### 🏷️ Logística — Productos & Stock

| ID     | Descripción                                                  | Tag     |
|:-------|:-------------------------------------------------------------|:--------|
| `PS-2` | Carga masiva de productos (Excel)                            | `@PS-2` |
| `PS-3` | Creación de ítems (producto, servicio, combo, receta, lista) | `@PS-3` |
| `PS-4` | Editar ítem existente                                        | `@PS-4` |
| `PS-5` | Clonar ítem                                                  | `@PS-5` |
| `PS-6` | Actualización masiva de ítems (Excel)                        | `@PS-6` |
| `PS-7` | Actualización masiva de stock (Excel)                        | `@PS-7` |
| `PS-8` | Exportar lista de ítems                                      | `@PS-8` |

---

### 🛒 Punto de Venta — Emisiones

| ID      | Descripción                                                       | Comprobantes    | Tag             |
|:--------|:------------------------------------------------------------------|:----------------|:----------------|
| `PV-01` | Emisión con control de stock, datos adicionales, validación SUNAT | Boleta, Factura | `@PV-01`        |
| `PV-03` | Equivalencias, variantes y descuentos por ítem                    | Boleta, Factura | `@PV-03`        |
| `PV-04` | Nota de venta con descuento por ítem                              | Nota de Venta   | `@PV-04`        |
| `PV-14` | Retención                                                         | Factura         | `@PV-14`        |
| `PV-15` | Adelanto                                                          | —               | `@PV-15`        |
| `PV-16` | Exportación con receta                                            | Factura         | `@PV-16`        |
| `PV-17` | Detracción                                                        | —               | `@PV-17`        |
| `PV-18` | Selección y edición de ítem en caja                               | —               | `@PV-18`        |
| `PV-19` | **Cotizaciones**: emisión, cliente sin doc, imagen, vigencia      | Cotización      | `@cotizacion`   |
| `PV-20` | **Pedidos**: emisión, búsqueda, compartir, lista                  | Pedido          | `@pedido`       |

---

### 📄 Guías de Remisión

| ID      | Descripción                                                           | Módulo         | Tag        |
|:--------|:----------------------------------------------------------------------|:---------------|:-----------|
| `GRR-01` | Emitir guía con modalidad pública + **stock no se descuenta** ✅     | Remitente      | `@guias`   |
| `GRR-02` | Emitir guía por exportación + **stock no se descuenta** ✅           | Remitente      | `@guias`   |
| `GRR-03` | Validar datos obligatorios de exportación (DAM, bultos)               | Remitente      | `@guias`   |
| `GRR-03a`| Destinatario mismo emisor (tipo COMPRA)                               | Remitente      | `@guias`   |
| `GRR-06` | Guardar guía en modalidad privada (borrador)                          | Remitente      | `@guias`   |
| `GRR-10` | Traslado de mercancía extranjera sin contenedor                       | Remitente      | `@guias`   |
| `GRR-11` | Traslado de mercancía extranjera con contenedor + **stock no se descuenta** ✅ | Remitente | `@guias` |
| `GRR-12` | Traslado de vehículos categoría M1 o L + **stock no se descuenta** ✅ | Remitente      | `@guias`   |
| `GRR-13` | Validar datos obligatorios mercancía extranjera                        | Remitente      | `@guias`   |
| `GRR-14` | Validar contenedor y precinto obligatorios                             | Remitente      | `@guias`   |
| `GRR-15` | Emitir guía vinculando un comprobante + **stock no se descuenta** ✅  | Remitente      | `@guias`   |
| `GRR-16` | Venta con entrega a terceros (pública)                                 | Remitente      | `@guias`   |
| `GRR-17` | Venta con entrega a terceros (privada)                                 | Remitente      | `@guias`   |
| `GRR-18` | Validar destinatario obligatorio en venta a terceros                   | Remitente      | `@guias`   |
| `GRR-04` | Validar campos obligatorios generales (motivo, modalidad, etc.)        | Remitente      | `@guias`   |
| `GRR-05` | Validar serie y número de guía en listado                              | Remitente      | `@guias`   |
| `GRR-07` | Validar datos de exportación (DAM + bultos)                            | Remitente      | `@guias`   |
| `GRR-08` | Validar destinatario en venta a terceros                               | Remitente      | `@guias`   |
| `GRR-09` | Validar que QUEDAN datos al cambiar de público a privado               | Remitente      | `@guias`   |
| `GRT-17` | Emitir guía transportista modalidad pública                            | Transportista  | `@guias`   |
| `GRT-18` | Emitir guía transportista modalidad privada                            | Transportista  | `@guias`   |
| `GRT-19` | Emitir guía transportista con retorno subcontratado + **stock no se descuenta** ✅ | Transportista | `@guias` |
| `GRT-20` | Emitir guía transportista con autorización especial + **stock no se descuenta** ✅ | Transportista | `@guias` |
| `GRT-21` | Validar campos obligatorios transportista (datos obligatorios)         | Transportista  | `@guias`   |
| `GRT-22` | Validar remitente y destinatario obligatorios                          | Transportista  | `@guias`   |

---

## 👥 Módulo Clientes y Proveedores

### 🏢 Clientes

| ID | Descripción | Tag |
|:---|:------------|:----|
| `SC-01` | Crear cliente DNI con datos obligatorios @CL-01.1 | `@clientes` |
| `SC-01` | No permitir crear cliente con mismo documento @CL-01.3 | `@clientes` |
| `SC-01` | Validar campo código obligatorio @CL-02.1 | `@clientes` |
| `SC-01` | Editar razón social, estado y campo adicional @CL-03.1 | `@clientes` |
| `SC-01` | Desactivar cliente activo y validar estado + bitácora @CL-04.1 | `@clientes` |
| `SC-01` | Eliminar cliente sin ventas, validar éxito y desaparición @CL-05.1 | `@clientes` |
| `SC-01` | Crear nota y validar en panel y detalle @CL-06.1 | `@clientes` |
| `SC-01` | Validar historial completo en bitácora @CL-07.1 | `@clientes` |
| `SC-01` | Buscar cliente por nombre @CL-08.1 | `@clientes` |
| `SC-01` | Ocultar y mostrar columnas opcionales @CL-09.1 | `@clientes` |
| `SC-01` | Descargar clientes filtrados @CL-10.1 | `@clientes` |
| `SC-01` | Validar creación masiva con Excel correcto @CL-11.1 | `@clientes` |
| `SC-02` | Crear cliente con campo adicional y validar en detalle @CL-01.2 | `@clientes` |
| `SC-02` | Validar campo nombre/razón social obligatorio @CL-02.2 | `@clientes` |
| `SC-02` | Activar cliente inactivo y validar estado + bitácora @CL-04.2 | `@clientes` |
| `SC-02` | Buscar cliente por número de documento @CL-08.2 | `@clientes` |
| `SC-02` | Validar que las columnas obligatorias no se pueden ocultar @CL-09.2 | `@clientes` |
| `SC-02` | Descargar todos los clientes @CL-10.2 | `@clientes` |
| `SC-02` | Validar errores en creación masiva de clientes @CL-11.2 | `@clientes` |
| `SC-03` | Validar campo número documento obligatorio @CL-02.3 | `@clientes` |
| `SC-03` | Buscar cliente por teléfono @CL-08.3 | `@clientes` |
| `SC-04` | Buscar cliente inexistente muestra sin resultados @CL-08.4 | `@clientes` |

---

### 🏭 Proveedores

| ID | Descripción | Tag |
|:---|:------------|:----|
| `PR-01.3` | Intentar crear proveedor duplicado muestra error | `@proveedores` |
| `PR-02.1` | Validar que nombre/razón social es obligatorio para RUC | `@proveedores` |
| `PR-03.1` | Editar nombre de proveedor y validar en bitácora | `@proveedores` |
| `PR-05.1` | Eliminar proveedor | `@proveedores` |
| `SC-01` | Crear proveedor válido con DNI @PR-01.1 | `@proveedores` |
| `SC-01` | Editar razón social y estado del proveedor @PR-02.1 | `@proveedores` |
| `SC-01` | Desactivar y reactivar proveedor @PR-03.1 | `@proveedores` |
| `SC-01` | Buscar proveedor por nombre y documento @PR-04.1 | `@proveedores` |
| `SC-01` | Descargar proveedores filtrados @PR-05.1 | `@proveedores` |
| `SC-02` | Validar campos obligatorios al crear proveedor @PR-01.2 | `@proveedores` |
| `SC-02` | Filtros avanzados (Tipo Documento) @PR-04.2 | `@proveedores` |
| `SC-02` | Descargar todos los proveedores @PR-05.2 | `@proveedores` |
| `SC-03` | Buscar proveedor inexistente @PR-04.3 | `@proveedores` |

---

### 🚛 Conductores

| ID | Descripción | Tag |
|:---|:------------|:----|
| `CD-01.1` | Crear conductor con DNI (datos básicos) | `@conductores` |
| `CD-01.2` | Crear conductor con código manual | `@conductores` |
| `CD-01.3` | Intentar crear conductor duplicado muestra error | `@conductores` |
| `CD-02.1` | Validar que nombre/razón social es obligatorio para RUC | `@conductores` |
| `CD-03.1` | Editar nombre de conductor y validar | `@conductores` |
| `CD-04.1` | Desactivar conductor | `@conductores` |
| `CD-04.2` | Activar conductor | `@conductores` |
| `CD-05.1` | Eliminar conductor | `@conductores` |

---

### 👨‍💼 Vendedores

| ID | Descripción | Tag |
|:---|:------------|:----|
| `SC-01` | Crear vendedor válido con metas y zona de ventas @VE-01.1 | `@vendedores` |
| `SC-01` | Validar metas numéricas del vendedor @VE-02.1 | `@vendedores` |
| `SC-01` | Editar nombre y metas del vendedor @VE-03.1 | `@vendedores` |
| `SC-02` | Validar campos obligatorios al crear vendedor @VE-01.2 | `@vendedores` |
| `VD-01.1` | Crear vendedor con DNI | `@vendedores` |
| `VD-01.2` | Crear vendedor con código manual | `@vendedores` |
| `VD-01.3` | Intentar crear vendedor duplicado muestra error | `@vendedores` |
| `VD-02.1` | Validar que nombre/razón social es obligatorio para RUC | `@vendedores` |
| `VD-04.1` | Desactivar vendedor | `@vendedores` |
| `VD-04.2` | Activar vendedor | `@vendedores` |
| `VD-05.1` | Eliminar vendedor | `@vendedores` |

---

### 🔗 Integración (Impacto en otros módulos)

| ID | Descripción | Tag |
|:---|:------------|:----|
| `SC-01` | Comportamiento de cliente inactivo, inexistente y activo en caja @IN-01.1 | `@integracion` |
| `SC-01` | Comportamiento de proveedor inactivo y activo en compras @IN-02.1 | `@integracion` |
| `SC-01` | Comportamiento de conductor inactivo y activo en guías @IN-03.1 | `@integracion` |
| `SC-01` | Comportamiento de vendedor inactivo y activo en datos de caja @IN-04.1 | `@integracion` |
| `SC-01` | Configurar columnas del listado por actor comercial @IN-05.1 | `@integracion` |

---

### 🩺 Health Checks (Estado del Ambiente) — ⚠️ PENDIENTE

| Descripción                     | Detalle                                           | Estado |
|:--------------------------------|:--------------------------------------------------|:------:|
| `health check - Seguridad`      | Verifica que el servicio de seguridad responde OK |   🚧   |
| `health check - Logística`      | Verifica que el servicio de logística responde OK |   🚧   |
| `health check - Finanzas`       | Verifica que el servicio de finanzas responde OK  |   🚧   |
| `health check - Punto de venta` | Verifica que el servicio de PdV responde OK       |   🚧   |

---
