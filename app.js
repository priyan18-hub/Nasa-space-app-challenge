// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Camera position (Satellite view)
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5).normalize();
scene.add(directionalLight);

// Load Earth texture
const earthTexture = new THREE.TextureLoader().load('./images/earth1.jpg');

// Earth material and geometry
const earthMaterial = new THREE.MeshStandardMaterial({
    map: earthTexture,
});
const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Load Mars texture
const marsTexture = new THREE.TextureLoader().load('./images/mars.jpg');

// Mars material and geometry
const marsMaterial = new THREE.MeshStandardMaterial({
    map: marsTexture,
});
const marsGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const mars = new THREE.Mesh(marsGeometry, marsMaterial);
scene.add(mars);

// Position Mars further from Earth (Increase this value to increase the gap)
mars.position.set(4.5, 0, 0); // Mars is now 4.5 units from Earth

// Load Comet texture
const cometTexture = new THREE.TextureLoader().load('./images/comet.jpg'); // Update the path if necessary

// Orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Function to create an orbit using EllipseCurve for circular orbits
const createOrbit = (distanceFromMars) => {
    const curve = new THREE.EllipseCurve(
        0, 0,           // ax, ay: Start point (center)
        distanceFromMars, distanceFromMars,  // xRadius, yRadius
        0, 2 * Math.PI,  // Start and end angle
        false,           // Clockwise
        0                // Rotation
    );
    const points = curve.getPoints(64); // Increase the number of points for smooth curves
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);

    // Create the material and add to the scene
    const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    orbit.rotation.x = Math.PI / 2; // Rotate the orbit to align with Mars
    orbit.position.set(0, 0, 0); // Center the orbit on Mars
    scene.add(orbit);
};

// Function to create NEOs with unique orbits
const createNEO = (radius, distanceFromMars, speed, orbitTilt) => {
    const material = new THREE.MeshStandardMaterial({ map: cometTexture }); // Use comet texture
    const neo = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), material);
    scene.add(neo);

    // Set initial position for NEOs further out
    neo.position.set(distanceFromMars, 0, 0); // Position based on Mars distance

    // Animate NEOs with different orbital parameters
    function animateNEO() {
        requestAnimationFrame(animateNEO);

        // Move NEOs in their unique orbits (circular and tilted)
        const time = Date.now() * 0.001 * speed; // Adjust speed of each orbit
        neo.position.x = distanceFromMars * Math.cos(time); // Circular motion in X
        neo.position.z = distanceFromMars * Math.sin(time); // Circular motion in Z
        neo.position.y = Math.sin(time) * orbitTilt; // Set the Y position based on tilt
    }

    animateNEO();
};

// Add NEOs with alternating sizes and increased distances
for (let i = 0; i < 20; i++) {
    let radius = (i % 2 === 0) ? (Math.random() * 0.15 + 0.1) : (Math.random() * 0.25 + 0.15); // Alternate size: larger for odd indices
    let distance = Math.random() * 5 + 8; // Position NEOs at 8 to 13 units from Mars for more gap
    let speed = Math.random() * 0.8 + 0.2; // Random speed for NEOs
    let tilt = Math.random() * 0.3; // Random tilt for each orbit
    createNEO(radius, distance, speed, tilt); // Call with comet texture
    createOrbit(distance); // Create corresponding orbit closer to Mars
}

// Stars background
function createStars() {
    const starGeometry = new THREE.SphereGeometry(0.05, 24, 24);
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
    for (let i = 0; i < 500; i++) {
        const star = new THREE.Mesh(starGeometry, starMaterial);
        const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
        star.position.set(x, y, z);
        scene.add(star);
    }
}
createStars();

// Render loop
function animate() {
    requestAnimationFrame(animate);
    earth.rotation.y += 0.01; // Rotate Earth
    mars.rotation.y += 0.01; // Rotate Mars
    controls.update();
    renderer.render(scene, camera);
}
animate();