// Selecciona el elemento del carrusel
const carousel = document.querySelector('.carousel');

// URL de la API
const apiUrl = "https://api.escuelajs.co/api/v1/categories";
const productsApiUrl = "https://api.escuelajs.co/api/v1/products";

// Guardar el carrito en localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart)); // Guardar el carrito como un JSON en localStorage
}

// Función para cargar las categorías 
async function loadCategories() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Error en la respuesta de la API: ${response.status}`);
        }

        const categories = await response.json();

        // Limpia el contenido actual del carrusel
        carousel.innerHTML = '';

        // Limita las categorías a las primeras 5
        const limitedCategories = categories.slice(0, 5);

        // Itera sobre las categorías y crea los elementos correspondientes
        limitedCategories.forEach(category => {
            const carouselItem = document.createElement('div');
            carouselItem.classList.add('carousel-item');

            // Agrega imagen y título a cada categoría
            carouselItem.innerHTML = `
                <img src="${category.image}" alt="${category.name}" width="400px" height="400px" class="carousel-image" />
                <div clas="tittle-category">
                    <h3>${category.name}</h3>
                </div>
                
            `;

            // Agrega evento para mostrar productos de la categoría
            carouselItem.addEventListener('click', () => showCategoryProducts(category.id));

            carousel.appendChild(carouselItem);
        });
    } catch (error) {
        console.error('Error al cargar las categorías:', error);
    }
}

// Función para cargar productos en el héroe
async function loadHeroImages() {
    try {
        const response = await fetch(productsApiUrl);
        if (!response.ok) {
            throw new Error(`Error en la respuesta de la API: ${response.status}`);
        }

        const products = await response.json();

        // Selecciona la sección de imágenes del héroe
        const heroImages = document.querySelector('.hero-images');

        // Limpia las imágenes existentes
        heroImages.innerHTML = '';

        // Limita los productos a los primeros 2
        const limitedProducts = products.slice(0, 2);

        // Itera sobre los productos y crea los elementos correspondientes
        limitedProducts.forEach(product => {
            const imageHero = document.createElement('div');
            imageHero.classList.add('image-hero');

            imageHero.innerHTML = `
                <img src="${product.images[0]}" width="500px" height="500px"  alt="${product.title}" />
            `;

            heroImages.appendChild(imageHero);
        });
    } catch (error) {
        console.error('Error al cargar las imágenes del héroe:', error);
    }
}


loadCategories();
loadHeroImages();
loadPromoImages();

async function loadPromoImages() {
    try {
        const response = await fetch(productsApiUrl);
        if (!response.ok) {
            throw new Error(`Error en la respuesta de la API: ${response.status}`);
        }

        const products = await response.json();

        // Selecciona la sección de imágenes del héroe
        const heroImages = document.querySelector('.social-promo');

        // Limpia las imágenes existentes
        heroImages.innerHTML = '';

        // Limita los productos a los primeros 2
        const limitedProducts = products.slice(0, 3);

        // Itera sobre los productos y crea los elementos correspondientes
        limitedProducts.forEach(product => {
            const imageHero = document.createElement('div');
            imageHero.classList.add('item-promo');

            imageHero.innerHTML = `
                <img src="${product.images[0]}" width="300px" height="300px" alt="${product.title}" />
            `;

            heroImages.appendChild(imageHero);
        });
    } catch (error) {
        console.error('Error al cargar las imágenes del héroe:', error);
    }
}

// Array para almacenar los productos del carrito
let cart = [];

// Guardar el carrito en localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}


// Función para renderizar el carrito en un overlay
function showCart() {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    overlay.innerHTML = `
        <div class="overlay-content">
            <button class="close-overlay">&times;</button>
            <h2>Your Cart</h2>
            <div class="cart-container">
                ${
                    cart.length > 0
                    ? cart.map((product, index) => `
                        <div class="cart-item">
                            <img src="${product.image}" alt="${product.title}" style="width: 200px; height: 200px; object-fit: cover;" />
                            <h4>${product.title}</h4>
                            <h3>${product.price}€</h3>
                            <p>Quantity: ${product.quantity}</p>
                            <button class="increase-quantity" data-index="${index}">+</button>
                            <button class="decrease-quantity" data-index="${index}">-</button>
                            <button class="remove-item" data-index="${index}">Remove</button>
                        </div>
                    `).join('')
                    : '<p>Your cart is empty</p>'
                }
            </div>
            <div class="cart-actions">
                <button class="clear-cart">Empty Cart</button>
                <button class="add-products">Add Products</button>
                <button class="process-order">Process Order</button>
            </div>
            
        </div>
    `;

    overlay.querySelector('.close-overlay').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    overlay.querySelector('.add-products').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    overlay.querySelector('.clear-cart').addEventListener('click', () => {
        cart = [];
        document.body.removeChild(overlay);
        showCart();
        saveCartToLocalStorage();
    });

    overlay.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.dataset.index;
            cart.splice(index, 1);
            document.body.removeChild(overlay);
            showCart();
            saveCartToLocalStorage();
        });
    });

    overlay.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.dataset.index;
            cart[index].quantity += 1;
            document.body.removeChild(overlay);
            showCart();
            saveCartToLocalStorage();
            updateCartCount();
        });
    });

    overlay.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = e.target.dataset.index;
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            } else {
                cart.splice(index, 1); 
            }
            document.body.removeChild(overlay);
            showCart();
            saveCartToLocalStorage();
            decreaseCartCount();
        });
    });

    document.body.appendChild(overlay);
}



// mostrar los productos de una categoría con scroll infinito y botón de carga
async function showCategoryProducts(categoryId) {
    let currentPage = 1;
    const itemsPerPage = 10;
    let loading = false; 

    // Crear el contenedor superpuesto
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    overlay.innerHTML = `
        <div class="overlay-content">
            <button class="close-overlay">&times;</button>
            <div class="container" id="product-container"></div>
            <div id="preloader" style="display: none; text-align: center;">Cargando productos...</div>
            <button id="load-more" style="display: none;">Cargar más</button>
        </div>
    `;

    const productContainer = overlay.querySelector('#product-container');
    const preloader = overlay.querySelector('#preloader');
    const loadMoreButton = overlay.querySelector('#load-more');

    // cargar productos por página
    async function loadProducts() {
        if (loading) return; 
        loading = true;
        preloader.style.display = 'block';
        loadMoreButton.style.display = 'none';

        try {
            const response = await fetch(`${apiUrl}/${categoryId}/products`);
            if (!response.ok) {
                throw new Error(`Error al cargar los productos de la categoría: ${response.status}`);
            }

            const products = await response.json();
            const start = (currentPage - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const pageProducts = products.slice(start, end);

            // Renderizar los productos en el contenedor
            pageProducts.forEach(product => {
                const productItem = document.createElement('div');
                productItem.classList.add('product-item');
                productItem.innerHTML = `
                    <img src="${product.images[0]}" alt="${product.title}" style="width: 200px; height: 200px; object-fit: cover;" />
                    <h4>${product.title}</h4>
                    <h3>${product.price}€</h3>
                    <button class="view-details">View Details</button>
                `;
                
                // ver detalles del producto
                productItem.querySelector('.view-details').addEventListener('click', () => {
                    showProductDetails(product);
                });

                productContainer.appendChild(productItem);
            });

            // Si quedan más productos por cargar, muestra el botón "Cargar más"
            if (products.length > end) {
                loadMoreButton.style.display = 'block';
            } else {
                loadMoreButton.style.display = 'none'; // Ocultar si no hay más productos
            }

            currentPage++; // Incrementar la página actual
        } catch (error) {
            console.error('Error al cargar los productos:', error);
        } finally {
            loading = false;
            preloader.style.display = 'none';
        }
    }

    // Cerrar el contenedor
    overlay.querySelector('.close-overlay').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    // Evento para cargar más productos al hacer clic en el botón
    loadMoreButton.addEventListener('click', loadProducts);

    // Evento de scroll infinito
    overlay.addEventListener('scroll', () => {
        const { scrollTop, scrollHeight, clientHeight } = overlay;
        if (scrollTop + clientHeight >= scrollHeight - 50 && !loading) {
            loadProducts();
        }
    });

    document.body.appendChild(overlay);

    // Cargar los primeros productos
    loadProducts();
}


//  mostrar detalles de un producto
function showProductDetails(product) {
    // Crear el contenedor superpuesto para los detalles 
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    overlay.innerHTML = `
        <div class="overlay-content">
            <button class="close-overlay">&times;</button>
            <div class="product-details">
                <div class="images">
                    ${product.images.map(image => `<img src="${image}" alt="${product.title}" style="width: 200px; height: 200px; object-fit: cover; margin: 5px;" />`).join('')}
                </div>
                <div class="all-details">
                    <h2>${product.title}</h2>
                    <p>${product.description}</p>
                    <h3>${product.price}€</h3>
                    <button class="add-to-cart">Add to Cart</button>
                </div>
            </div>
        </div>
    `;

    // Cerrar el contenedor
    overlay.querySelector('.close-overlay').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    // Agregar producto al carrito
    overlay.querySelector('.add-to-cart').addEventListener('click', () => {
        const existingProduct = cart.find(item => item.id === product.id);

    if (existingProduct) {
        // Si el producto ya está incrementa la cantidad
        existingProduct.quantity += 1;
    } else {
       
        cart.push({
            id: product.id,
            title: product.title,
            image: product.images[0],
            price: product.price,
            quantity: 1
        });
    }
    updateCartCount(); // Actualizar el contador del carrito
    saveCartToLocalStorage();
    });

    // Agregar el contenedor al DOM
    document.body.appendChild(overlay);
}


//  abrir el carrito desde el menú
document.querySelector('#cart').addEventListener('click', (e) => {
    e.preventDefault();
    showCart(); // Llama a la función para mostrar el carrito
});


// mostrar el contenedor del formulario de registro
function showLoginForm() {
    // Crear el contenedor del overlay
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    overlay.innerHTML = `
        <div class="overlay-content-form">
            
            <form id="register-form">
            <button class="close-overlay">&times;</button>
            <h2>Register</h2>
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" required />
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required />
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required />
                </div>
                <button type="submit">Register</button>
            </form>
        </div>
    `;

    // Cerrar el formulario de registro
    overlay.querySelector('.close-overlay').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    // Manejar el registro
    overlay.querySelector('#register-form').addEventListener('submit', (e) => {
        e.preventDefault(); // Evitar el envío tradicional del formulario

        // Obtener los valores del formulario
        const username = document.querySelector('#username').value;
        const email = document.querySelector('#email').value;
        const password = document.querySelector('#password').value;

        // Cerrar el overlay
        document.body.removeChild(overlay);
    });

    // Agregar el contenedor al DOM
    document.body.appendChild(overlay);
}

// Evento para mostrar el formulario al hacer clic en el enlace de "Login"
document.querySelector('#login').addEventListener('click', showLoginForm);
document.addEventListener('DOMContentLoaded', () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart); 
    }
});

//  actualizar el contador del carrito en el DOM
function updateCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    const currentCount = parseInt(cartCountElement.textContent, 10) || 0; 
    cartCountElement.textContent = currentCount + 1;
    saveCartToLocalStorage();

}
document.addEventListener('DOMContentLoaded', () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
    updateCartCount(currentCount);
});
function decreaseCartCount() {
    const cartCountElement = document.getElementById('cart-count');
    const currentCount = parseInt(cartCountElement.textContent, 10) || 0;

    if (currentCount > 0) {
        cartCountElement.textContent = currentCount - 1;
    }
    saveCartToLocalStorage();

}



