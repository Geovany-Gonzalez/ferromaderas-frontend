# Página de Políticas de Compra

## 📋 Descripción
Componente que muestra las políticas de compra de FerroMaderas, incluyendo información sobre precios, envíos, devoluciones, disponibilidad, métodos de pago y horarios.

## 🌐 Acceso
- **Ruta:** `/politicas`
- **URL Local:** `http://localhost:4200/politicas` (o el puerto que esté usando el servidor)

## 🖼️ Imágenes Requeridas

Para completar la página, necesitas agregar las siguientes imágenes en la carpeta `src/assets/icons/`:

1. **placeholder-price.png** - Icono para "Precios y vigencia"
   - Sugerencia: Icono de lista de precios, etiqueta de precio, o calculadora
   - Tamaño recomendado: 100x100px o mayor (se ajustará automáticamente)

2. **placeholder-delivery.png** - Icono para "Envío y flete"
   - Sugerencia: Icono de camión de entrega, paquete con ubicación
   - Tamaño recomendado: 100x100px o mayor

3. **placeholder-returns.png** - Icono para "Cambios y devoluciones"
   - Sugerencia: Icono de flechas circulares, caja con flecha de retorno
   - Tamaño recomendado: 100x100px o mayor

4. **placeholder-stock.png** - Icono para "Disponibilidad"
   - Sugerencia: Icono de check con inventario, cajas apiladas
   - Tamaño recomendado: 100x100px o mayor

5. **placeholder-payment.png** - Icono para "Métodos de pago"
   - Sugerencia: Icono de mano con dinero, billetera, tarjeta de crédito
   - Tamaño recomendado: 100x100px o mayor

6. **placeholder-schedule.png** - Icono para "Horarios"
   - Sugerencia: Icono de calendario con reloj, reloj de pared
   - Tamaño recomendado: 100x100px o mayor

## 📱 Características Responsive

La página está completamente optimizada para diferentes dispositivos:

### Desktop (1024px+)
- Grid de 2 columnas
- Iconos de 100x100px
- Título principal de 2.5rem

### Tablet (768px - 1024px)
- Grid de 2 columnas
- Iconos de 80x80px
- Título principal de 2rem

### Mobile (480px - 768px)
- Grid de 1 columna
- Iconos de 90x90px centrados
- Título principal de 1.75rem

### Small Mobile (360px - 480px)
- Grid de 1 columna
- Iconos de 70x70px
- Título principal de 1.5rem

### Extra Small (< 360px)
- Grid de 1 columna
- Iconos de 60x60px
- Título principal de 1.3rem

## 🎨 Colores Corporativos

- **Azul Principal:** `#0033a0`
- **Azul Secundario:** `#0047cc`
- **Texto:** `#333`
- **Fondo Cards:** `white`
- **Fondo Iconos:** `#f5f5f5`

## 🎨 Elementos de Diseño

### Borde Rojo del Header
- El header principal tiene un borde rojo (#dc143c) de 6px
- El borde se adapta responsivamente (5px en tablet, 4px en mobile, 3px en small mobile)

### Footer de Políticas
- Fondo azul corporativo con gradiente
- Tres secciones:
  - **Izquierda:** Título "Políticas"
  - **Centro:** Copyright "© 2026 Ferromaderas Todos los derechos reservados"
  - **Derecha:** Botón de WhatsApp circular verde (#25d366)
- Completamente responsive (se apila verticalmente en mobile)

## 🔧 Estructura de Archivos

```
src/app/features/public/policies/
├── policies.component.ts       # Componente TypeScript
├── policies.component.html     # Template HTML
├── policies.component.scss     # Estilos SCSS
└── README.md                   # Esta documentación
```

## 📝 Contenido de las Políticas

### 1. Precios y vigencia
- Los precios pueden variar sin previo aviso
- La cotización se confirma al finalizar por WhatsApp

### 2. Envío y flete
- El flete depende de zona/distancia/productos
- Se confirma antes de cerrar el pedido

### 3. Cambios y devoluciones
- No se aceptan cambios ni devoluciones tras la entrega
- Aplica revisión al recibir

### 4. Disponibilidad
- Productos sujetos a stock
- Si se agota el producto, el vendedor ofrece alternativas por WhatsApp

### 5. Métodos de pago
- Efectivo
- Transferencia

### 6. Horarios
- Lunes a sábado 7:30 am – 5:30 pm
- Fuera de horario se atiende el siguiente día hábil

## 🚀 Próximos Pasos

1. Agregar las imágenes de iconos en `src/assets/icons/`
2. Actualizar las rutas de las imágenes en `policies.component.html` si es necesario
3. Verificar la página en diferentes dispositivos
4. Opcional: Agregar enlace en el navbar o footer para acceder a las políticas
