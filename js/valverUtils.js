// Obtener el color desde CSS
function getColorFromCSS(varName) {
  // Obtener el color de la variable CSS
  const color = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();

  // Convertir el formato CSS (#RRGGBB) a formato numérico de Three.js (0xRRGGBB)
  return color.startsWith("#") ? parseInt(color.substring(1), 16) : 0xffffff; // Color por defecto si hay error
}

// Crear la luz usando el color desde CSS
/*
var spotLight = new THREE.DirectionalLight(getColorFromCSS("--light-color"));
*/
