// ===== QLOBAL ELEMENTLƏR VƏ TƏNZİMLƏMƏLƏR =====
const productGrid = document.getElementById('product-grid');
const tagFilterContainer = document.getElementById('tag-filter-container');
const paginationContainer = document.getElementById('pagination-container');
const modal = document.getElementById('product-modal');
const modalMainImage = document.getElementById('modal-main-image');
const modalThumbnailContainer = document.getElementById('modal-thumbnail-container');
const modalMaterialText = document.getElementById('modal-material-text');
const modalPriceText = document.getElementById('modal-price-text');
const modalOrderButton = document.getElementById('modal-order-button');
const closeModalButton = document.querySelector('.close-modal');

document.getElementById('instagram-contact-link').href = instagramLink;
document.getElementById('whatsapp-contact-link').href = whatsappLink;
modalOrderButton.href = instagramLink; 

const productsPerPage = 21;
let currentPage = 1;
let filteredProducts = [...products];

// ===== MƏHSUL FUNKSİONALLIĞI =====
function displayProducts() {
    productGrid.innerHTML = '';
    currentPage = Math.min(currentPage, Math.ceil(filteredProducts.length / productsPerPage)) || 1;
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    productsToShow.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image-container">
                <img src="${product.image}" alt="Məhsul şəkli" loading="lazy">
            </div>
            <div class="product-details">
              <p class="price" style="text-align: center; color: #5C4033;">${product.price}</p>

            </div>
        `;
        card.addEventListener('click', () => openModal(product));
        productGrid.appendChild(card);
    });
}

function setupPagination() {
    paginationContainer.innerHTML = '';
    const pageCount = Math.ceil(filteredProducts.length / productsPerPage);
    if (pageCount <= 1) return;
    for (let i = 1; i <= pageCount; i++) {
        const btn = document.createElement('button');
        btn.className = 'page-btn';
        if (i === currentPage) {
            btn.classList.add('active');
        }
        btn.innerText = i;
        btn.addEventListener('click', () => {
            currentPage = i;
            displayProducts();
            setupPagination();
            if (window.matchMedia('(min-width: 1025px)').matches) {
                document.getElementById('nav-link-products')?.click();
            } else {
                document.getElementById('products-section').scrollIntoView({ behavior: 'smooth' });
            }
        });
        paginationContainer.appendChild(btn);
    }
}

function createTagFilters() {
    const allTags = new Set();
    products.forEach(p => p.tags.forEach(tag => allTags.add(tag)));
    const allButton = document.createElement('button');
    allButton.className = 'tag-filter active';
    allButton.textContent = 'Hamısı';
    allButton.addEventListener('click', () => {
        document.querySelectorAll('.tag-filter').forEach(btn => btn.classList.remove('active'));
        allButton.classList.add('active');
        filteredProducts = [...products];
        currentPage = 1;
        displayProducts();
        setupPagination();
    });
    tagFilterContainer.appendChild(allButton);
    allTags.forEach(tag => {
        const button = document.createElement('button');
        button.className = 'tag-filter';
        button.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
        button.dataset.tag = tag;
        button.addEventListener('click', handleTagClick);
        tagFilterContainer.appendChild(button);
    });
}

function handleTagClick(event) {
    const clickedButton = event.currentTarget;
    tagFilterContainer.querySelector('button').classList.remove('active');
    clickedButton.classList.toggle('active');
    filterProducts();
}

function filterProducts() {
    const activeTags = [...document.querySelectorAll('.tag-filter.active')]
                        .map(btn => btn.dataset.tag)
                        .filter(tag => tag);
    if (activeTags.length === 0) {
        tagFilterContainer.querySelector('button').classList.add('active');
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(product => 
            activeTags.every(tag => product.tags.includes(tag))
        );
    }
    currentPage = 1;
    displayProducts();
    setupPagination();
}

function openModal(product) {
    modalMainImage.src = product.image;
    modalMaterialText.textContent = product.material;
    modalPriceText.textContent = product.price;
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('visible'), 10);
}

function closeModal() {
    modal.classList.remove('visible');
    setTimeout(() => modal.style.display = 'none', 300);
}
closeModalButton.addEventListener('click', closeModal);
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        closeModal();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    createTagFilters();
    displayProducts();
    setupPagination();
});

// ===== 3D/2D SAYT MÜHƏRRİKİ =====
if (window.matchMedia('(min-width: 1025px)').matches) {
    let scene, camera, webGLRenderer, css3DRenderer;
    let contentGroup = new THREE.Group();
    let sections = [];
    const sectionDistance = 2000;
    let particles;
    const mouse = new THREE.Vector2();
    let currentScrollY = 0;
    let targetScrollY = 0;

    function init() {
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x000000, 100, 2500);
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 3000);
        camera.position.z = 900;
        const webglContainer = document.getElementById('webgl-container');
        webGLRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        webGLRenderer.setSize(window.innerWidth, window.innerHeight);
        webGLRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        webglContainer.appendChild(webGLRenderer.domElement);
        const css3dContainer = document.getElementById('css3d-container');
        css3DRenderer = new THREE.CSS3DRenderer();
        css3DRenderer.setSize(window.innerWidth, window.innerHeight);
        css3dContainer.appendChild(css3DRenderer.domElement);
        createParticles();
        create3DContent();
        window.addEventListener('resize', onWindowResize);
        window.addEventListener('wheel', onMouseWheel, { passive: false });
        window.addEventListener('mousemove', onMouseMove);
        createNavigation();
        animate();
    }

   function createParticles() {
    const particlesGeometry = new THREE.BufferGeometry();
    const count = 7000;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    // İstifadə etmək istədiyiniz rənglər (RGB formatında 0-1 arasında)
    const colorOptions = [
        new THREE.Color(0xff8c00), // narıncı
        new THREE.Color(0xff0000), // qırmızı
        new THREE.Color(0x00ff00), // yaşıl
        new THREE.Color(0x0000ff)  // mavi
    ];

    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 3000;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 3000;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 3000;

        // Random rəng seç
        const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];

        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 4,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true
    });

     particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

}

    function create3DContent() {
        const sectionElements = document.querySelectorAll('.html-section');
        sectionElements.forEach((el, i) => {
            const object = new THREE.CSS3DObject(el);
            object.position.y = -i * sectionDistance;
            contentGroup.add(object);
            sections.push({ element: el, object3d: object });
        });
        scene.add(contentGroup);
    }

    function createNavigation() {
        const navLinksContainer = document.querySelector('.nav-links');
        sections.forEach((section, i) => {
            if (section.element.id) {
                let linkText = section.element.id.replace('-section', '');
                linkText = linkText.charAt(0).toUpperCase() + linkText.slice(1);
                const link = document.createElement('a');
                link.href = `#${section.element.id}`;
                link.textContent = linkText;
                if (section.element.id === 'products-section') {
                    link.id = 'nav-link-products';
                }
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    targetScrollY = i * sectionDistance;
                });
                navLinksContainer.appendChild(link);
            }
        });
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        webGLRenderer.setSize(window.innerWidth, window.innerHeight);
        css3DRenderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    function onMouseWheel(event) {
        event.preventDefault();
        targetScrollY += event.deltaY * 0.8;
        const maxScroll = (sections.length - 1) * sectionDistance;
        targetScrollY = Math.max(0, Math.min(targetScrollY, maxScroll));
    }
    
    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    function animate() {
         requestAnimationFrame(animate);

    currentScrollY += (targetScrollY - currentScrollY) * 0.07;
    contentGroup.position.y = currentScrollY;

    const parallaxX = mouse.x * 50;
    const parallaxY = -mouse.y * 50;
    camera.position.x += (parallaxX - camera.position.x) * 0.05;
    camera.position.y += (parallaxY - camera.position.y) * 0.05;

    const elapsedTime = Date.now() * 0.0001;

    if (particles) {
        particles.rotation.y = -elapsedTime * 0.2;

        // hissəciklərin tərpənməsi birbaşa burada:
        const pos = particles.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const i3 = i * 3;
            pos.array[i3] += Math.sin(elapsedTime + i) * 0.05;
            pos.array[i3 + 1] += Math.cos(elapsedTime + i) * 0.05;
            pos.array[i3 + 2] += Math.sin(elapsedTime + i) * 0.05;
        }
        pos.needsUpdate = true;
    }

    const currentSectionIndex = Math.round(currentScrollY / sectionDistance);
    document.querySelectorAll('.nav-links a').forEach((link, index) => {
        link.classList.toggle('active', index === currentSectionIndex);
    });

    webGLRenderer.render(scene, camera);
    css3DRenderer.render(scene, camera);
    }
    init();

} else {
    // ===== MOBİL CİHAZLAR ÜÇÜN OLAN KOD =====
    document.getElementById('content-sections').style.display = 'block';
    document.body.style.overflow = 'auto';
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (navLinks.children.length === 0) {
        const sectionsMobile = document.querySelectorAll('.html-section');
        sectionsMobile.forEach(section => {
            if(section.id) {
                let linkText = section.id.replace('-section', '');
                linkText = linkText.charAt(0).toUpperCase() + linkText.slice(1);
                const link = document.createElement('a');
                link.href = `#${section.id}`;
                link.textContent = linkText;
                navLinks.appendChild(link);
            }
        });
    }

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}