# Visualizador de Matemática

Sitio web estático enfocado solo en ejercicios:
1. **Ejercicios**: buscador por `tema` y `dificultad`, y visualización secuencial.

En ambos filtros existe la opción `Cualquiera`.
- Si elegís `Cualquiera` en uno o ambos campos, se muestran ejercicios compatibles.
- Cuando se usa `Cualquiera`, el orden de visualización es aleatorio.

## Archivos

- `index.html`: estructura de la app.
- `style.css`: estilos.
- `script.js`: lógica de filtros y navegación.
- `ejercicios.js`: listado editable de ejercicios.

## Recomendación para imágenes (`assets`)

Recomendado: usar una carpeta `assets/ejercicios` con subcarpetas por tema.

Ejemplo:

```text
assets/
  ejercicios/
    algebra/
    geometria/
    calculo/
    probabilidad/
```

No es obligatorio usar subcarpetas por tema, pero ayuda mucho a mantener orden cuando crece la cantidad de ejercicios.

## Cómo usar

Abrí `index.html` en el navegador.

## Flujo de pantallas

- **Inicio**: acceso al módulo de `Ejercicios`.
- **Ejercicios**: abre una pantalla intermedia con dos opciones:
  - `Practicar`: lleva al buscador por `tema` y `dificultad`.
  - `Lista de Ejercicios`: muestra todos los ejercicios agrupados por `tema`, con numeración e imágenes.

### Numeración manual de ejercicios

Cada ejercicio debe incluir la variable `numero` en `ejercicios.js` con formato jerárquico, por ejemplo:
- `1.1`, `1.2`, `1.3`
- `2.1`, `2.2`, `2.3`

El sitio ordena automáticamente usando ese `numero` (comparación numérica por segmentos), tanto en la lista como en la práctica cuando no está en modo aleatorio.

### Filtro en la lista de ejercicios

En la pantalla `Lista de Ejercicios` hay un filtro por `Tema` con opción `Cualquiera`.
- `Cualquiera`: muestra todos los temas.
- Tema específico: muestra solo ese bloque.

Si un ejercicio tiene `imagenes` (o `imagen`), también se muestran miniaturas en la lista.

## Cómo cargar o quitar ejercicios

Editar el archivo `ejercicios.js` y mantener este formato por ejercicio:

```js
{
  id: 9,
  numero: "1.4",
  tema: "Álgebra",
  dificultad: "Fácil",
  enunciado: "Resolver:<br><strong>x + 2 = 7</strong>", // texto normal o HTML
  imagenes: [
    "assets/ejercicios/algebra/ej-9-1.png",
    "assets/ejercicios/algebra/ej-9-2.png"
  ], // opcional, hasta 3 imágenes
  imagen: "", // opcional (compatibilidad con formato anterior de 1 imagen)
  respuesta: "<strong>Resultado:</strong> x = 5" // texto normal o HTML
}
```

Campos:
- `tema`: texto (se usa en el filtro).
- `dificultad`: texto (se usa en el filtro).
- `enunciado`: contenido del ejercicio (acepta texto simple o HTML).
- `imagenes`: opcional, lista de rutas de imágenes (máximo 3 por ejercicio).
- `imagen`: opcional y heredado, para compatibilidad con ejercicios viejos de 1 imagen.
- `respuesta`: solución (acepta texto simple o HTML).

Si existe `imagenes`, se usa esa lista (hasta 3). Si no existe, se intenta con `imagen`.

> Consejo: mantené `id` único para cada ejercicio.
