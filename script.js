$(document).ready(function(){
    $('.slider1').slick({
        dots: true,
        arrows: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        adaptiveHeight: true,
        prevArrow: '<button type="button" class="slick-prev">←</button>',
        nextArrow: '<button type="button" class="slick-next">→</button>',
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    arrows: true,
                    dots: true
                }
            },
            {
                breakpoint: 480,
                settings: {
                    arrows: false,
                    dots: true,
                    autoplaySpeed: 4000
                }
            }
        ]
    });
});

// Класс для работы с избранным
class Favorites {
    constructor() {
        this.items = this.loadFavorites() || [];
    }
    
    loadFavorites() {
        const favoritesData = localStorage.getItem('bookFavorites');
        return favoritesData ? JSON.parse(favoritesData) : null;
    }
    
    saveFavorites() {
        localStorage.setItem('bookFavorites', JSON.stringify(this.items));
    }
    
    addItem(book) {
        const existingItem = this.items.find(item => item.id === book.id);
        
        if (!existingItem) {
            this.items.push(book);
            this.saveFavorites();
            return book;
        }
        return null;
    }
    
    removeItem(bookId) {
        this.items = this.items.filter(item => item.id !== bookId);
        this.saveFavorites();
    }
    
    isInFavorites(bookId) {
        return this.items.some(item => item.id === bookId);
    }
    
    getItems() {
        return this.items;
    }
    
    getCount() {
        return this.items.length;
    }
    
    updateFavoritesIndicator() {
        const count = this.getCount();
        const favoritesIndicator = document.getElementById('favoritesIndicator');
        
        if (favoritesIndicator) {
            favoritesIndicator.innerHTML = count > 0 ? `❤️ (${count})` : '❤️';
        }
    }
}

// Класс для работы с корзиной
class Cart {
    constructor() {
        this.items = this.loadCart() || [];
    }
    
    loadCart() {
        const cartData = localStorage.getItem('bookCart');
        return cartData ? JSON.parse(cartData) : null;
    }
    
    saveCart() {
        localStorage.setItem('bookCart', JSON.stringify(this.items));
    }
    
    addItem(book) {
        const existingItem = this.items.find(item => item.id === book.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            book.quantity = 1;
            this.items.push(book);
        }
        
        this.saveCart();
        this.updateCartIndicator();
        return book;
    }
    
    removeItem(bookId) {
        this.items = this.items.filter(item => item.id !== bookId);
        this.saveCart();
        this.updateCartIndicator();
    }
    
    updateQuantity(bookId, quantity) {
        const item = this.items.find(item => item.id === bookId);
        if (item) {
            item.quantity = quantity;
            this.saveCart();
        }
    }
    
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }
    
    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartIndicator();
    }
    
    updateCartIndicator() {
        const totalItems = this.getTotalItems();
        const cartIndicator = document.getElementById('cartIndicator');
        
        if (cartIndicator) {
            cartIndicator.innerHTML = totalItems > 0 ? `🛒 (${totalItems})` : '🛒';
        }
    }
    
    getItems() {
        return this.items;
    }
}

// Инициализация избранного и корзины
const favorites = new Favorites();
const cart = new Cart();

// ========================
// МОДАЛЬНОЕ ОКНО ДЛЯ КНИГ
// ========================

const bookModalOverlay = document.getElementById('bookModalOverlay');
const bookModalClose = document.getElementById('bookModalClose');
const bookModalImage = document.getElementById('bookModalImage').querySelector('img');
const bookModalTitle = document.getElementById('bookModalTitle');
const bookModalAuthor = document.getElementById('bookModalAuthor');
const bookModalPrice = document.getElementById('bookModalPrice');
const bookModalDescription = document.getElementById('bookModalDescription');
const addToCartModalBtn = document.getElementById('addToCartModal');
const addToFavoritesModalBtn = document.getElementById('addToFavoritesModal');

let currentBookData = null;

function openBookModal(bookData) {
    currentBookData = bookData;
    
    bookModalImage.src = bookData.image;
    bookModalImage.alt = bookData.title;
    bookModalTitle.textContent = bookData.title;
    bookModalAuthor.textContent = bookData.author;
    bookModalPrice.textContent = `${bookData.price} ₽`;
    bookModalDescription.textContent = bookData.description || 'Описание временно отсутствует';
    
    const isFavorited = favorites.isInFavorites(bookData.id);
    if (isFavorited) {
        addToFavoritesModalBtn.classList.add('favorited');
        addToFavoritesModalBtn.innerHTML = '<i class="fas fa-heart"></i> В избранном';
    } else {
        addToFavoritesModalBtn.classList.remove('favorited');
        addToFavoritesModalBtn.innerHTML = '<i class="fas fa-heart"></i> В избранное';
    }
    
    bookModalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeBookModal() {
    bookModalOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentBookData = null;
}

bookModalClose.addEventListener('click', closeBookModal);
bookModalOverlay.addEventListener('click', (e) => {
    if (e.target === bookModalOverlay) {
        closeBookModal();
    }
});

addToCartModalBtn.addEventListener('click', () => {
    if (currentBookData) {
        cart.addItem(currentBookData);
        
        showNotification(`Книга "${currentBookData.title}" добавлена в корзину`, 'success');
        cart.updateCartIndicator();
        
        const originalText = addToCartModalBtn.textContent;
        addToCartModalBtn.textContent = 'Добавлено!';
        addToCartModalBtn.style.backgroundColor = '#8B4513';
        
        setTimeout(() => {
            addToCartModalBtn.textContent = originalText;
            addToCartModalBtn.style.backgroundColor = '';
        }, 1500);
    }
});

addToFavoritesModalBtn.addEventListener('click', () => {
    if (currentBookData) {
        const isFavorited = favorites.isInFavorites(currentBookData.id);
        
        if (isFavorited) {
            favorites.removeItem(currentBookData.id);
            addToFavoritesModalBtn.classList.remove('favorited');
            addToFavoritesModalBtn.innerHTML = '<i class="fas fa-heart"></i> В избранное';
            showNotification(`Книга "${currentBookData.title}" удалена из избранного`, 'info');
        } else {
            const addedBook = favorites.addItem(currentBookData);
            if (addedBook) {
                addToFavoritesModalBtn.classList.add('favorited');
                addToFavoritesModalBtn.innerHTML = '<i class="fas fa-heart"></i> В избранном';
                showNotification(`Книга "${currentBookData.title}" добавлена в избранное`, 'success');
            }
        }
        
        favorites.updateFavoritesIndicator();
    }
});

// Обработчики клика на карточки книг для открытия модального окна
document.querySelectorAll('.book-card').forEach(card => {
    card.style.cursor = 'pointer';
    
    card.addEventListener('click', (e) => {
        if (!e.target.closest('.add-to-cart') && !e.target.closest('.add-to-favorites')) {
            const addToCartBtn = card.querySelector('.add-to-cart');
            if (addToCartBtn && addToCartBtn.getAttribute('data-book')) {
                try {
                    const bookData = JSON.parse(addToCartBtn.getAttribute('data-book'));
                    openBookModal(bookData);
                } catch (error) {
                    console.error('Ошибка при разборе данных книги:', error);
                }
            }
        }
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && bookModalOverlay.classList.contains('active')) {
        closeBookModal();
    }
});

// ========================
// УВЕДОМЛЕНИЯ
// ========================

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    let icon = 'fas fa-check-circle';
    if (type === 'error') icon = 'fas fa-exclamation-circle';
    if (type === 'info') icon = 'fas fa-info-circle';
    
    notification.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ========================
// ОБРАБОТЧИКИ ДЛЯ КНОПОК "В КОРЗИНУ" НА ГЛАВНОЙ СТРАНИЦЕ
// ========================

function addCartButtonHandlers() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        // Удаляем старые обработчики чтобы не дублировать
        button.removeEventListener('click', handleCartButtonClick);
        // Добавляем новый обработчик
        button.addEventListener('click', handleCartButtonClick);
    });
}

function handleCartButtonClick(e) {
    e.stopPropagation(); // Чтобы не открывалось модальное окно
    
    const bookData = JSON.parse(this.getAttribute('data-book'));
    if (!bookData) return;
    
    cart.addItem(bookData);
    
    // Визуальная обратная связь
    const originalText = this.textContent;
    this.textContent = 'Добавлено!';
    this.classList.add('added');
    
    setTimeout(() => {
        this.textContent = originalText;
        this.classList.remove('added');
    }, 1500);
    
    showNotification(`Книга "${bookData.title}" добавлена в корзину`, 'success');
    cart.updateCartIndicator();
}

// ========================
// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// ========================

document.addEventListener('DOMContentLoaded', () => {
    // Обновляем индикаторы
    cart.updateCartIndicator();
    favorites.updateFavoritesIndicator();
    
    // Добавляем обработчики для кнопок корзины
    addCartButtonHandlers();
    
    // Обновляем индикаторы в сайдбаре
    const favoritesIcon = document.querySelector('.sidebar-icon[title="Избранное"] a');
    const cartIcon = document.querySelector('.sidebar-icon[title="Корзина"] a');
    
    if (favoritesIcon) {
        favoritesIcon.id = 'favoritesIndicator';
    }
    
    if (cartIcon) {
        cartIcon.id = 'cartIndicator';
    }
    
    // Инициализируем индикаторы значениями
    cart.updateCartIndicator();
    favorites.updateFavoritesIndicator();
});

// Функция для обновления при динамических изменениях
function updatePage() {
    cart.updateCartIndicator();
    favorites.updateFavoritesIndicator();
    addCartButtonHandlers();
}

// Экспортируем объекты для использования в других файлах
window.cart = cart;
window.favorites = favorites;
window.showNotification = showNotification;
window.updatePage = updatePage;