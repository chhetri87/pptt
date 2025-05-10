// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const noteForm = document.getElementById('note-form');
const noteTitle = document.getElementById('note-title');
const noteCategory = document.getElementById('note-category');
const noteContent = document.getElementById('note-content');
const notesListContainer = document.getElementById('notes-list-container');
const noteDetailTitle = document.getElementById('note-detail-title');
const noteDetailCategory = document.getElementById('note-detail-category');
const noteDetailContent = document.getElementById('note-detail-content');
const noteActions = document.getElementById('note-actions');
const deleteNoteBtn = document.getElementById('delete-note');
const emptyNotesMessage = document.querySelector('.empty-notes-message');
const filterButtons = document.querySelectorAll('.filter-btn');

// Contact Form Elements
const contactForm = document.getElementById('contact-form');
const contactName = document.getElementById('contact-name');
const contactEmail = document.getElementById('contact-email');
const contactSubject = document.getElementById('contact-subject');
const contactMessage = document.getElementById('contact-message');
const contactFormMessage = document.getElementById('contact-form-message');

// Login Elements
const loginBtn = document.getElementById('login-btn');
const loginResourcesBtn = document.getElementById('login-resources');
const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const loginMessage = document.getElementById('login-form-message');
const submitLoginBtn = document.getElementById('submit-login');
const cancelLoginBtn = document.getElementById('cancel-login');
const closeModalBtn = document.querySelector('.close-modal');

// Initialize login elements
document.addEventListener('DOMContentLoaded', function() {
    // Re-query elements to ensure they're loaded
    const loginBtnInit = document.getElementById('login-btn');
    const loginModalInit = document.getElementById('login-modal');
    
    if (loginBtnInit && loginModalInit) {
        console.log('Login elements initialized successfully');
    } else {
        console.error('Failed to initialize login elements');
    }
    
    // Check login status on page load
    checkLoginStatus();
});

// Notification Elements
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');
const notificationCloseBtn = document.querySelector('.notification-close');

// Mobile Navigation Toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking on a nav link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Study Resources Management
let resources = [];
let selectedResourceId = null;
let currentFilter = 'all';

// Load resources from localStorage
function loadResources() {
    const storedResources = localStorage.getItem('dipeshResources');
    if (storedResources) {
        resources = JSON.parse(storedResources);
        renderResourcesList();
    }
}

// Save resources to localStorage
function saveResources() {
    localStorage.setItem('dipeshResources', JSON.stringify(resources));
}

// Render the list of resources based on current filter
function renderResourcesList() {
    // Filter resources based on current filter
    let filteredResources = resources;
    if (currentFilter !== 'all') {
        filteredResources = resources.filter(resource => resource.category === currentFilter);
    }

    if (filteredResources.length === 0) {
        emptyNotesMessage.style.display = 'block';
        notesListContainer.innerHTML = '';
        return;
    }

    emptyNotesMessage.style.display = 'none';
    notesListContainer.innerHTML = '';

    filteredResources.forEach(resource => {
        const resourceItem = document.createElement('div');
        resourceItem.classList.add('note-item');
        if (resource.id === selectedResourceId) {
            resourceItem.classList.add('active');
        }
        resourceItem.setAttribute('data-id', resource.id);
        
        // Get category display name
        const categoryDisplay = getCategoryDisplayName(resource.category);
        
        resourceItem.innerHTML = `
            <h4>${resource.title}</h4>
            <p>${formatDate(resource.date)}</p>
            <span class="category-tag">${categoryDisplay}</span>
        `;
        resourceItem.addEventListener('click', () => selectResource(resource.id));
        notesListContainer.appendChild(resourceItem);
    });
}

// Get display name for category
function getCategoryDisplayName(category) {
    const categoryMap = {
        'book-notes': 'Book Notes',
        'model-questions': 'Model Questions',
        'lecture-notes': 'Lecture Notes',
        'tutorials': 'Tutorials'
    };
    return categoryMap[category] || 'Other';
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Select a resource to display
function selectResource(id) {
    selectedResourceId = id;
    const resource = resources.find(resource => resource.id === id);
    
    if (resource) {
        noteDetailTitle.textContent = resource.title;
        noteDetailCategory.textContent = getCategoryDisplayName(resource.category);
        noteDetailContent.textContent = resource.content;
        noteActions.style.display = 'block';
        
        // Update active class in the list
        document.querySelectorAll('.note-item').forEach(item => {
            if (item.getAttribute('data-id') === id) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }
}

// Add a new resource
function addResource(title, category, content) {
    const newResource = {
        id: Date.now().toString(),
        title: title,
        category: category,
        content: content,
        date: new Date().toISOString()
    };
    
    resources.unshift(newResource); // Add to the beginning of the array
    saveResources();
    renderResourcesList();
    selectResource(newResource.id);
    
    // Clear form
    noteTitle.value = '';
    noteCategory.value = '';
    noteContent.value = '';
}

// Delete a resource
function deleteResource(id) {
    resources = resources.filter(resource => resource.id !== id);
    saveResources();
    renderResourcesList();
    
    // Reset resource details view
    noteDetailTitle.textContent = 'Select a resource to view';
    noteDetailCategory.textContent = '';
    noteDetailContent.textContent = '';
    noteActions.style.display = 'none';
    selectedResourceId = null;
}

// Filter resources by category
function filterResources(category) {
    currentFilter = category;
    renderResourcesList();
    
    // Update active class on filter buttons
    filterButtons.forEach(btn => {
        if (btn.getAttribute('data-filter') === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Event Listeners
// No form submission for adding resources on the main page
// Resources can only be added from the admin dashboard

// Contact form submission
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const name = contactName.value.trim();
        const email = contactEmail.value.trim();
        const subject = contactSubject.value.trim();
        const message = contactMessage.value.trim();
        
        // Validate form data
        if (!name || !email || !subject || !message) {
            contactFormMessage.textContent = 'Please fill in all fields';
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        // Create new message object
        const newMessage = {
            id: Date.now().toString(),
            name: name,
            email: email,
            subject: subject,
            message: message,
            date: new Date().toISOString(),
            read: false
        };
        
        // Get existing messages from localStorage
        let messages = [];
        const storedMessages = localStorage.getItem('contactMessages');
        if (storedMessages) {
            messages = JSON.parse(storedMessages);
        }
        
        // Add new message to beginning of array
        messages.unshift(newMessage);
        
        // Save messages to localStorage
        localStorage.setItem('contactMessages', JSON.stringify(messages));
        
        // Show success notification
        showNotification('Message sent successfully!', 'success');
        
        // Reset form
        contactForm.reset();
        contactFormMessage.textContent = '';
    });
}

// Filter buttons
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        filterResources(filter);
    });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadResources();
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        // Skip for login button
        if (this.id === 'login-btn') {
            e.preventDefault();
            return;
        }
        
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80, // Adjust for header height
                behavior: 'smooth'
            });
        }
    });
});

// Login Functionality
// Check if user is already logged in
function checkLoginStatus() {
    if (!loginBtn) return; // Exit if login button doesn't exist
    
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        // User is logged in - show Admin text and link to dashboard
        loginBtn.innerHTML = '<i class="fas fa-user-check"></i> Admin';
        loginBtn.classList.add('logged-in');
        loginBtn.setAttribute('href', 'admin-dashboard.html');
        loginBtn.setAttribute('title', 'Go to Admin Dashboard');
    } else {
        // User is not logged in - show Login text and open modal on click
        loginBtn.innerHTML = '<i class="fas fa-user"></i> Login';
        loginBtn.classList.remove('logged-in');
        loginBtn.setAttribute('href', '#');
        loginBtn.setAttribute('title', 'Login to Admin Area');
    }
}

// Open login modal from nav button
if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        // If already logged in, let the link work normally (redirect to dashboard)
        if (localStorage.getItem('adminLoggedIn') === 'true') {
            return; // Allow normal link behavior to admin-dashboard.html
        }
        
        // Otherwise prevent default and show login modal
        e.preventDefault();
        console.log('Login button clicked');
        
        // Make sure modal exists
        if (loginModal) {
            loginModal.style.display = 'block';
            if (loginUsername) loginUsername.focus();
        } else {
            console.error('Login modal not found');
            showNotification('Login system error. Please try again later.', 'error');
        }
    });
} else {
    console.error('Login button not found');
}

// Open login modal from resources section
if (loginResourcesBtn) {
    loginResourcesBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // If already logged in, redirect to admin dashboard
        if (localStorage.getItem('adminLoggedIn') === 'true') {
            window.location.href = 'admin-dashboard.html';
            return;
        }
        
        // Otherwise show login modal
        loginModal.classList.add('show');
        loginUsername.focus();
        
        // Show notification about admin-only resource creation
        showNotification('Login as Dipesh to add new resources', 'info');
    });
}

// Close login modal
function closeLoginModal() {
    if (loginModal) {
        loginModal.style.display = 'none';
        if (loginForm) loginForm.reset();
        if (loginMessage) loginMessage.textContent = '';
    }
}

// Close modal when clicking the X
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeLoginModal);
}

// Close modal when clicking cancel button
if (cancelLoginBtn) {
    cancelLoginBtn.addEventListener('click', closeLoginModal);
}

// Close modal when clicking outside of it
window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        closeLoginModal();
    }
});

// Notification Function
function showNotification(message, type = 'info', duration = 3000) {
    // Set notification message
    notificationMessage.textContent = message;
    
    // Remove all type classes
    notification.classList.remove('success', 'error', 'info');
    
    // Add the appropriate type class
    notification.classList.add(type);
    
    // Show notification
    notification.classList.add('show');
    
    // Hide notification after duration
    setTimeout(() => {
        notification.classList.remove('show');
    }, duration);
}

// Close notification when clicking the close button
notificationCloseBtn.addEventListener('click', () => {
    notification.classList.remove('show');
});

// Handle login form submission
submitLoginBtn.addEventListener('click', async () => {
    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();
    
    // Simple validation
    if (!username || !password) {
        loginMessage.textContent = 'Please enter both username and password';
        showNotification('Please enter both username and password', 'error');
        return;
    }
    
    // Use secure authentication module
    try {
        const authResult = await window.AuthModule.authenticate(username, password);
        
        if (authResult.success) {
            // Set admin session
            localStorage.setItem('adminLoggedIn', 'true');
            localStorage.setItem('adminUsername', username);
            
            // Add login activity if admin.js is loaded
            if (typeof addActivity === 'function') {
                addActivity('Admin logged in from main site');
            }
            
            // Show success notification
            showNotification('Login successful! Redirecting to dashboard...', 'success');
            
            // Update login button
            checkLoginStatus();
            
            // Close modal
            closeLoginModal();
            
            // Redirect to admin dashboard after a short delay
            setTimeout(() => {
                window.location.href = 'admin-dashboard.html';
            }, 1500);
        } else {
            loginMessage.textContent = authResult.message;
            showNotification(authResult.message, 'error');
            
            // If account is temporarily blocked
            if (authResult.blocked) {
                // Disable login button
                submitLoginBtn.disabled = true;
                setTimeout(() => {
                    submitLoginBtn.disabled = false;
                }, authResult.timeLeft * 60 * 1000);
            }
        }
    } catch (error) {
        console.error('Authentication error:', error);
        loginMessage.textContent = 'An error occurred during login. Please try again.';
        showNotification('Authentication error', 'error');
    }
});

// Check login status on page load
document.addEventListener('DOMContentLoaded', () => {
    loadResources();
    checkLoginStatus();
});
