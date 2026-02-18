document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    // 1. TYPEWRITER + SCROLL REVEAL
    // ===============================
    const typeWriter = (selector) => {
        const element = document.querySelector(selector);
        if (!element) return;
        const text = element.getAttribute('data-text') || element.innerText;
        element.innerText = '';
        element.style.opacity = '1';
        let i = 0;
        const speed = 50;

        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    };

    const revealElements = () => {
        const observerOptions = { threshold: 0.15 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    if (entry.target.tagName === 'H1' && !entry.target.dataset.typed) {
                        typeWriter('h1');
                        entry.target.dataset.typed = "true";
                    }
                }
            });
        }, observerOptions);

        document.querySelectorAll('h1, h2, .card, .terminal, .hero p').forEach(el => {
            el.classList.add('reveal');
            observer.observe(el);
        });
    };
    revealElements();

    // ===============================
    // 2. DOWNLOAD BUTTON ANIMATION
    // ===============================
    const downloadBtn = document.querySelector('.primary-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            downloadBtn.style.pointerEvents = "none"; 
            downloadBtn.textContent = "ESTABLISHING LINK...";
            setTimeout(() => { downloadBtn.textContent = "TRANSFERRING DATA..."; }, 1000);
            setTimeout(() => { 
                downloadBtn.textContent = "TRANSFER COMPLETE";
                downloadBtn.style.borderColor = "var(--primary)";
                downloadBtn.style.boxShadow = "0 0 15px var(--primary)";
            }, 3000);
        });
    }

    // ===============================
    // 3. SMOOTH SCROLL
    // ===============================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // ===============================
    // 4. THREE.JS TARS ENGINE (3-BLOCK CONFIG)
    // ===============================
    const canvas = document.getElementById("tars-bg");
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 10, 50);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 16); 

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(5, 10, 7);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x007aff, 2.5);
    rimLight.position.set(-10, 5, -5);
    scene.add(rimLight);

    // --- TARS Group ---
    const tars = new THREE.Group();
    scene.add(tars);

    const tarsMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.9,
        roughness: 1
    });
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x444444 });

    const segW = 1.4;  // Side segment width
    const segH = 7;  // Height
    const segD = 1.5;  // Depth
    const gap = 0.1;
    const centerW = (segW * 2) + gap; // Combined width of two middle blocks

    // Function to create a TARS segment
    function createSegment(width, xPos, hasFace = false) {
        const segGroup = new THREE.Group();
        const geo = new THREE.BoxGeometry(width, segH, segD);
        const mesh = new THREE.Mesh(geo, tarsMaterial);
        
        const edges = new THREE.EdgesGeometry(geo);
        const line = new THREE.LineSegments(edges, edgeMaterial);
        
        segGroup.add(mesh);
        segGroup.add(line);
        segGroup.position.x = xPos;

        if (hasFace) {
            // Main Terminal Screen
            const screenGeo = new THREE.BoxGeometry(width * 0.7, 0.6, 0.05);
            const screenMat = new THREE.MeshStandardMaterial({ 
                color: 0xffffff, 
                emissive: 0x00ffff, 
                emissiveIntensity: 5
            });
            const screen = new THREE.Mesh(screenGeo, screenMat);
            screen.position.set(0, 2.5, segD / 2 + 0.01);
            segGroup.add(screen);

            // Small detail indicator below screen
            const detailGeo = new THREE.BoxGeometry(width * 0.4, 0.1, 0.05);
            const detail = new THREE.Mesh(detailGeo, screenMat);
            detail.position.set(0, 2.2, segD / 2 + 0.01);
            segGroup.add(detail);
        }
        return segGroup;
    }

    // 1. Left Block
    const leftBlock = createSegment(segW, -(centerW / 2 + gap + segW / 2));
    tars.add(leftBlock);

    // 2. Center Block (The "Face" block)
    const centerBlock = createSegment(centerW, 0, true);
    tars.add(centerBlock);

    // 3. Right Block
    const rightBlock = createSegment(segW, (centerW / 2 + gap + segW / 2));
    tars.add(rightBlock);

    tars.position.y = -2;

// ===============================
    // 1. LIGHTING (Boosted for Visibility)
    // ===============================
    scene.add(new THREE.AmbientLight(0xffffff, 0.8)); // Higher ambient light so nothing is pure black
    
    const spotlight = new THREE.DirectionalLight(0xffffff, 2.0);
    spotlight.position.set(5, 10, 7);
    scene.add(spotlight);

    // This light stays near TARS to make sure he's always visible
    const fillLight = new THREE.PointLight(0xffffff, 1.5, 30);
    fillLight.position.set(0, 2, 5);
    scene.add(fillLight);

    // ===============================
    // 2. FLOOR & PARTICLES
    // ===============================
    
    // Background Color
    renderer.setClearColor(0x050508);
    // Standard fog is safer than FogExp2
    scene.fog = new THREE.Fog(0x050508, 5, 50);

    // The Floor (Using StandardMaterial for guaranteed visibility)
    const floorGeo = new THREE.PlaneGeometry(200, 200);
    const floorMat = new THREE.MeshStandardMaterial({ 
        color: 0x111115,      // Slightly lighter charcoal so you can see the surface
        metalness: 0, 
        roughness: 1,
    });

    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -10.2;
    scene.add(floor);

    // The Stars
    const particlesGeo = new THREE.BufferGeometry();
    const starCount = 1500;
    const posArr = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
        posArr[i] = (Math.random() - 0.5) * 100;
    }
    particlesGeo.setAttribute("position", new THREE.BufferAttribute(posArr, 3));
    
    const particlesMat = new THREE.PointsMaterial({ 
        color: 0xffffff, 
        size: 0.08, // Made them a bit bigger so they are definitely visible
        transparent: true, 
        opacity: 0.8 
    });

    const particles = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particles);

    // Mouse control
    let mouseX = 0, mouseY = 0;
    document.addEventListener("mousemove", e => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function animate() {
        requestAnimationFrame(animate);
        const time = Date.now() * 0.001;
        const scrollY = window.scrollY;
        tars.position.y = (-3 + Math.sin(Date.now() * 0.001 * 0.5) * 0.1) + (scrollY * 0.005);



        // Animate segments (Middle stays steady, sides shuffle)
        leftBlock.rotation.x = Math.sin(time) * 0.05;
        rightBlock.rotation.x = Math.cos(time) * 0.05;

        tars.rotation.y = THREE.MathUtils.lerp(tars.rotation.y, mouseX * 0.4, 0.05);
        tars.rotation.x = THREE.MathUtils.lerp(tars.rotation.x, mouseY * 0.1, 0.05);

        particles.rotation.y += 0.0003;
        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    canvas.style.opacity = 1;
});