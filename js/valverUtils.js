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

// Función para crear un mesh a partir de una geometría extruida
function createMesh(geom, materialColor) {
    geom.applyMatrix(new THREE.Matrix4().makeTranslation(-390, -74, 0));

    // Calcular las dimensiones antes de aplicar la escala
    var bbox = new THREE.Box3().setFromObject(new THREE.Mesh(geom));
    var width = bbox.max.x - bbox.min.x;
    var height = bbox.max.y - bbox.min.y;
    var depth = bbox.max.z - bbox.min.z;
    
    // Calcular el centro del objeto original
    var centerX = (bbox.max.x + bbox.min.x) / 2;
    var centerY = (bbox.max.y + bbox.min.y) / 2;
    var centerZ = (bbox.max.z + bbox.min.z) / 2;
    
    console.log("Centro original:", centerX.toFixed(2), centerY.toFixed(2), centerZ.toFixed(2));
    
    // Centrar la geometría en el origen ANTES de crear el mesh
    geom.applyMatrix(new THREE.Matrix4().makeTranslation(-centerX, -centerY, -centerZ));
    
    // Mostrar las dimensiones en la consola
    console.log("Dimensiones originales (antes de escalar):");
    console.log("Ancho: " + width.toFixed(2) + " unidades");
    console.log("Alto: " + height.toFixed(2) + " unidades");
    console.log("Profundo: " + depth.toFixed(2) + " unidades");

    // assign material
    var meshMaterial = new THREE.MeshPhongMaterial({
        color: materialColor || 0xffffff, 
        shininess: 100, 
        specular: 0x111111,
        side: THREE.DoubleSide // Renderiza ambos lados
    });
    var mesh = new THREE.Mesh(geom, meshMaterial);
    
    // Aplicar escala
    mesh.scale.x = 0.1;
    mesh.scale.y = 0.1;

    // Calcular las dimensiones después de aplicar la escala
    var scaledWidth = width * 0.1;
    var scaledHeight = height * 0.1;
    
    // CÁLCULO DEL CENTRO: PASO A PASO
    // 1. Primero calculamos el centro de la geometría original (ya hecho arriba)
    console.log("PASO 1 - Centro original antes de centrar:", centerX.toFixed(2), centerY.toFixed(2), centerZ.toFixed(2));
    
    // 2. Luego centramos la geometría restando ese centro
    console.log("PASO 2 - Después de centrar, el centro debería ser (0,0,0)");
    
    // 3. Verificamos que realmente está centrada
    var centeredBbox = new THREE.Box3().setFromObject(new THREE.Mesh(geom));
    var centeredCenterX = (centeredBbox.max.x + centeredBbox.min.x) / 2;
    var centeredCenterY = (centeredBbox.max.y + centeredBbox.min.y) / 2;
    var centeredCenterZ = (centeredBbox.max.z + centeredBbox.min.z) / 2;
    console.log("PASO 3 - Centro verificado después de centrar:", 
                centeredCenterX.toFixed(2), 
                centeredCenterY.toFixed(2), 
                centeredCenterZ.toFixed(2));
    
    // 4. Después de aplicar escala, el centro geométrico no cambia en coordenadas locales,
    //    pero sus dimensiones sí
    var adjustX = 0;
    var adjustY = 0;
    var adjustZ = 0;
    
    // Si el centro después de centrar no es exactamente (0,0,0), calculamos ajustes
    if (Math.abs(centeredCenterX) > 0.001 || 
        Math.abs(centeredCenterY) > 0.001 || 
        Math.abs(centeredCenterZ) > 0.001) {
        
        adjustX = -centeredCenterX * 0.1; // Ajustamos por la escala en X
        adjustY = -centeredCenterY * 0.1; // Ajustamos por la escala en Y 
        adjustZ = -centeredCenterZ;       // Z no se escala
        
        console.log("PASO 4 - Se requieren ajustes:", adjustX.toFixed(2), adjustY.toFixed(2), adjustZ.toFixed(2));
    } else {
        console.log("PASO 4 - No se requieren ajustes, el centro ya es (0,0,0)");
    }
    
    // Calcular un tamaño de referencia para la esfera basado en las dimensiones del objeto
    var sphereSize = Math.max(scaledWidth, scaledHeight, depth) * 0.1; // 10% del tamaño máximo
    
    console.log("Dimensiones finales después de escalar:");
    console.log("Ancho: " + scaledWidth.toFixed(2) + " unidades");
    console.log("Alto: " + scaledHeight.toFixed(2) + " unidades");
    console.log("Profundo: " + depth.toFixed(2) + " unidades");
    console.log("Centro de rotación final:", adjustX.toFixed(2), adjustY.toFixed(2), adjustZ.toFixed(2));
    console.log("Tamaño de la esfera: " + sphereSize.toFixed(2));

    // Aplicar el ajuste para colocar el centro real en (0,0,0)
    mesh.position.set(adjustX, adjustY, adjustZ);
    
    // Añadir las dimensiones y el centro como propiedades del objeto
    mesh.userData.dimensions = {
        width: scaledWidth,
        height: scaledHeight,
        depth: depth,
        sphereSize: sphereSize // Añadir el tamaño de la esfera para usarlo luego
    };
    
    mesh.userData.center = {
        x: 0,  // Después de los ajustes, el centro está en el origen
        y: 0,
        z: 0
    };
    
    return mesh;
}

// Función para duplicar elementos 3D
function duplicateElement(element, scene, copies, transform, options, drawShapeFunction) {
    // Obtener la forma base para volver a crear la geometría extruida
    var svgShape = drawShapeFunction();
    
    for (let i = 1; i <= copies; i++) {
        // Crear una nueva geometría extruida para cada copia
        var newGeom = new THREE.ExtrudeGeometry(svgShape, options);
        // Aplicar la misma transformación que la original
        newGeom.applyMatrix(new THREE.Matrix4().makeTranslation(-390, -74, 0));
        
        // Calcular el centro del objeto para centrarlo correctamente
        var bbox = new THREE.Box3().setFromObject(new THREE.Mesh(newGeom));
        var centerX = (bbox.max.x + bbox.min.x) / 2;
        var centerY = (bbox.max.y + bbox.min.y) / 2;
        var centerZ = (bbox.max.z + bbox.min.z) / 2;
        
        // Centrar la geometría en el origen
        newGeom.applyMatrix(new THREE.Matrix4().makeTranslation(-centerX, -centerY, -centerZ));
        
        // Usar el mismo color que el elemento original si está disponible
        var materialColor = element.material ? element.material.color.getHex() : 0xffffff;
        
        // Crear un nuevo mesh con la geometría extruida
        var meshMaterial = new THREE.MeshPhongMaterial({
            color: materialColor, 
            shininess: 100, 
            specular: 0x111111,
            side: THREE.DoubleSide
        });
        
        var newElement = new THREE.Mesh(newGeom, meshMaterial);
        
        // Aplicar las mismas escalas que el elemento original
        newElement.scale.copy(element.scale);
        
        // Aplicar posición según los parámetros de transformación
        newElement.position.x = i * (transform.x || 0);
        newElement.position.y = i * (transform.y || 0);
        newElement.position.z = i * (transform.z || 0);
        
        newElement.rotation.x = i * (transform.rx || 0);
        newElement.rotation.y = i * (transform.ry || 0);
        newElement.rotation.z = i * (transform.rz || 0);
        
        // El centro ya es (0,0,0) relativo al objeto
        newElement.userData.center = {
            x: 0,
            y: 0,
            z: 0
        };

        // Asignar un nombre único para identificarlo
        newElement.name = 'duplicateMesh-' + i + '-' + 
            (transform.x ? 'x' : '') + 
            (transform.y ? 'y' : '') + 
            (transform.z ? 'z' : '');

        scene.add(newElement);
    }
}

// Función para añadir puntos visuales en los centros de rotación
function addCenterPoints(scene, sphereSize) {
    var mainMesh = scene.getObjectByName('mainMesh');
    
    // Si no se proporciona un tamaño, intentar obtenerlo del mesh principal
    if (!sphereSize && mainMesh && mainMesh.userData.dimensions) {
        sphereSize = mainMesh.userData.dimensions.sphereSize || 2;
    } else if (!sphereSize) {
        sphereSize = 2; // Valor por defecto
    }
    
    // Crear un material para los puntos centrales
    var centerMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.7 // Hacerlo semi-transparente para no obstruir la vista
    });
    
    // Añadir un punto en el origen (0,0,0)
    var sphereGeom = new THREE.SphereGeometry(sphereSize, 16, 16);
    var centerSphere = new THREE.Mesh(sphereGeom, centerMaterial);
    centerSphere.name = 'centerPoint-main';
    scene.add(centerSphere);
    
    // Añadir puntos en cada mesh duplicado
    scene.traverse(function(object) {
        if (object instanceof THREE.Mesh && 
            object.name && 
            object.name.startsWith('duplicateMesh')) {
            
            var position = new THREE.Vector3();
            // Obtenemos la posición mundial del objeto
            object.getWorldPosition(position);
            
            // Creamos un punto en su posición
            var pointSphere = new THREE.Mesh(sphereGeom, centerMaterial);
            pointSphere.position.copy(position);
            pointSphere.name = 'centerPoint-' + object.name;
            scene.add(pointSphere);
        }
    });
}

// Función para añadir un helper de ejes
function addAxisHelper(scene, size, showCenterPoints) {
    var axisHelper = new THREE.AxisHelper(size || 100);
    axisHelper.name = "axisHelper"; // Asignar un nombre para poder encontrarlo después
    scene.add(axisHelper);
    
    // Si se solicita, también mostrar los puntos de centro
    if (showCenterPoints) {
        addCenterPoints(scene);
    }
}

// Función para limpiar objetos de la escena
function clearScene(scene) {
    // Crear una copia de los objetos de la escena para evitar problemas al modificar durante la iteración
    var objectsToRemove = [];
    scene.traverse(function(object) {
        if (object instanceof THREE.Mesh) {
            objectsToRemove.push(object);
        }
    });
    
    // Eliminar todos los objetos Mesh de la escena
    objectsToRemove.forEach(function(object) {
        scene.remove(object);
    });
}
