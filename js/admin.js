// DOM Elements - Login Page
const adminLoginForm = document.getElementById('admin-login-form');
const loginMessage = document.getElementById('login-message');

// Notification Elements
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');
const notificationCloseBtn = document.querySelector('.notification-close');

// DOM Elements - Dashboard
const adminUsername = document.getElementById('admin-username');
const logoutBtn = document.getElementById('logout-btn');
const adminMenuItems = document.querySelectorAll('.admin-menu li');
const adminTabs = document.querySelectorAll('.admin-tab');

// DOM Elements - Messages Tab
const totalMessagesCount = document.getElementById('total-messages');
const messagesList = document.getElementById('messages-list');
const noMessagesMessage = document.getElementById('no-messages');
const refreshMessagesBtn = document.getElementById('refresh-messages');

// DOM Elements - Resources Tab
const totalResourcesCount = document.getElementById('total-resources');
const modelQuestionsCount = document.getElementById('model-questions');
const bookNotesCount = document.getElementById('book-notes');
const lectureNotesCount = document.getElementById('lecture-notes');
const resourcesTableBody = document.getElementById('resources-table-body');
const noResourcesMessage = document.getElementById('no-resources-message');
const resourceSearch = document.getElementById('resource-search');
const searchBtn = document.getElementById('search-btn');
const adminFilterButtons = document.querySelectorAll('.admin-filters .filter-btn');
const addResourceBtn = document.getElementById('add-resource-btn');
const recentActivityList = document.getElementById('recent-activity-list');

// DOM Elements - Modals
const resourceModal = document.getElementById('resource-modal');
const modalTitle = document.getElementById('modal-title');
const resourceForm = document.getElementById('resource-form');
const resourceId = document.getElementById('resource-id');
const resourceTitle = document.getElementById('resource-title');
const resourceCategory = document.getElementById('resource-category');
const resourceContent = document.getElementById('resource-content');
const resourceStatus = document.getElementById('resource-status');
const resourceMessage = document.getElementById('resource-message');
const saveResourceBtn = document.getElementById('save-resource');
const cancelResourceBtn = document.getElementById('cancel-resource');
const closeModalBtns = document.querySelectorAll('.close-modal');

const deleteModal = document.getElementById('delete-modal');
const deleteResourceId = document.getElementById('delete-resource-id');
const confirmDeleteBtn = document.getElementById('confirm-delete');
const cancelDeleteBtn = document.getElementById('cancel-delete');

// Variables
let resources = [];
let activities = [];
let messages = [];
let currentAdminFilter = 'all';
let searchQuery = '';

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
if (notificationCloseBtn) {
    notificationCloseBtn.addEventListener('click', () => {
        notification.classList.remove('show');
    });
}

// Check if on login page
if (adminLoginForm) {
    // Admin Login Functionality
    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        // Simple validation
        if (!username || !password) {
            loginMessage.textContent = 'Please enter both username and password';
            loginMessage.style.color = 'var(--admin-danger)';
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
                
                // Add login activity
                addActivity('Admin logged in');
                
                // Show success notification
                showNotification('Login successful! Redirecting to dashboard...', 'success');
                
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = 'admin-dashboard.html';
                }, 1500);
            } else {
                loginMessage.textContent = authResult.message;
                loginMessage.style.color = 'var(--admin-danger)';
                showNotification(authResult.message, 'error');
                
                // If account is temporarily blocked
                if (authResult.blocked) {
                    // Disable login button
                    document.querySelector('button[type="submit"]').disabled = true;
                    setTimeout(() => {
                        document.querySelector('button[type="submit"]').disabled = false;
                    }, authResult.timeLeft * 60 * 1000);
                }
            }
        } catch (error) {
            console.error('Authentication error:', error);
            loginMessage.textContent = 'An error occurred during login. Please try again.';
            loginMessage.style.color = 'var(--admin-danger)';
            showNotification('Authentication error', 'error');
        }
    });
} else {
    // Dashboard Functionality
    // Check if admin is logged in using secure verification
    const sessionValid = window.AuthModule.verify();
    if (!sessionValid) {
        window.location.href = 'admin.html';
    }
    
    // Set admin username
    const username = localStorage.getItem('adminUsername') || 'Admin';
    adminUsername.textContent = username;
    
    // Logout functionality
    logoutBtn.addEventListener('click', () => {
        // Use secure logout function
        window.AuthModule.logout();
        // Redirect to admin login page
        window.location.href = 'admin.html';
    });
    
    // Tab switching
    adminMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.getAttribute('data-tab');
            
            // Update active menu item
            adminMenuItems.forEach(menuItem => menuItem.classList.remove('active'));
            item.classList.add('active');
            
            // Show selected tab
            adminTabs.forEach(tab => {
                if (tab.id === `${tabId}-tab`) {
                    tab.classList.add('active');
                } else {
                    tab.classList.remove('active');
                }
            });
        });
    });
    
    // Load resources, messages, and update dashboard
    loadResources();
    loadActivities();
    loadMessages();
    updateDashboard();
    renderResourcesTable();
    renderActivities();
    renderMessages();
    
    // Resource search
    searchBtn.addEventListener('click', () => {
        searchQuery = resourceSearch.value.trim().toLowerCase();
        renderResourcesTable();
    });
    
    resourceSearch.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            searchQuery = resourceSearch.value.trim().toLowerCase();
            renderResourcesTable();
        }
    });
    
    // Resource filtering
    adminFilterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentAdminFilter = btn.getAttribute('data-filter');
            
            // Update active filter button
            adminFilterButtons.forEach(filterBtn => filterBtn.classList.remove('active'));
            btn.classList.add('active');
            
            renderResourcesTable();
        });
    });
    
    // Refresh messages button
    if (refreshMessagesBtn) {
        refreshMessagesBtn.addEventListener('click', () => {
            loadMessages();
            renderMessages();
            updateDashboard();
            showNotification('Messages refreshed', 'info');
        });
    };
    
    // Add new resource
    addResourceBtn.addEventListener('click', () => {
        openResourceModal();
    });
    
    // Save resource
    saveResourceBtn.addEventListener('click', () => {
        if (validateResourceForm()) {
            saveResource();
            showNotification('Resource saved successfully!', 'success');
        }
    });
    
    // Cancel resource
    cancelResourceBtn.addEventListener('click', () => {
        closeResourceModal();
    });
    
    // Close modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            closeAllModals();
        });
    });
    
    // Delete resource
    confirmDeleteBtn.addEventListener('click', () => {
        const id = deleteResourceId.value;
        if (id) {
            deleteResource(id);
            closeAllModals();
            showNotification('Resource deleted successfully', 'info');
        }
    });
    
    // Cancel delete
    cancelDeleteBtn.addEventListener('click', () => {
        closeDeleteModal();
    });
    
    // Account settings form
    const accountSettingsForm = document.getElementById('account-settings-form');
    if (accountSettingsForm) {
        accountSettingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const adminName = document.getElementById('admin-name').value.trim();
            const adminEmail = document.getElementById('admin-email').value.trim();
            
            // Save settings (in a real app, this would be server-side)
            localStorage.setItem('adminName', adminName);
            localStorage.setItem('adminEmail', adminEmail);
            
            // Update display name
            adminUsername.textContent = adminName;
            
            // Add activity
            addActivity('Updated account settings');
            
            alert('Account settings updated successfully!');
        });
    }
    
    // Change password form
    const changePasswordForm = document.getElementById('change-password-form');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const passwordMessage = document.getElementById('password-message');
            
            // Simple validation (in a real app, this would be more secure)
            if (currentPassword !== 'admin123') {
                passwordMessage.textContent = 'Current password is incorrect';
                return;
            }
            
            if (newPassword !== confirmPassword) {
                passwordMessage.textContent = 'New passwords do not match';
                return;
            }
            
            if (newPassword.length < 6) {
                passwordMessage.textContent = 'Password must be at least 6 characters';
                return;
            }
            
            // Add activity
            addActivity('Changed password');
            
            // Reset form
            changePasswordForm.reset();
            passwordMessage.textContent = '';
            
            alert('Password changed successfully!');
        });
    }
}

// Functions
// Load resources from localStorage
function loadResources() {
    const storedResources = localStorage.getItem('dipeshResources');
    if (storedResources) {
        resources = JSON.parse(storedResources);
    }
}

// Load activities from localStorage
function loadActivities() {
    const storedActivities = localStorage.getItem('adminActivities');
    if (storedActivities) {
        activities = JSON.parse(storedActivities);
    }
}

// Load messages from localStorage
function loadMessages() {
    const storedMessages = localStorage.getItem('contactMessages');
    if (storedMessages) {
        messages = JSON.parse(storedMessages);
    }
}

// Save messages to localStorage
function saveMessages() {
    localStorage.setItem('contactMessages', JSON.stringify(messages));
}

// Save resources to localStorage
function saveResources() {
    localStorage.setItem('dipeshResources', JSON.stringify(resources));
}

// Save activities to localStorage
function saveActivities() {
    localStorage.setItem('adminActivities', JSON.stringify(activities));
}

// Add a new activity
function addActivity(description) {
    const newActivity = {
        id: Date.now().toString(),
        description: description,
        date: new Date().toISOString()
    };
    
    activities.unshift(newActivity);
    
    // Keep only the last 20 activities
    if (activities.length > 20) {
        activities = activities.slice(0, 20);
    }
    
    saveActivities();
    
    // Update activities list if on dashboard
    if (recentActivityList) {
        renderActivities();
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Update dashboard statistics
function updateDashboard() {
    if (totalResourcesCount) {
        totalResourcesCount.textContent = resources.length;
        
        const modelQuestions = resources.filter(resource => resource.category === 'model-questions').length;
        const bookNotes = resources.filter(resource => resource.category === 'book-notes').length;
        const lectureNotes = resources.filter(resource => resource.category === 'lecture-notes').length;
        
        modelQuestionsCount.textContent = modelQuestions;
        bookNotesCount.textContent = bookNotes;
        lectureNotesCount.textContent = lectureNotes;
    }
    
    if (totalMessagesCount) {
        totalMessagesCount.textContent = messages.length;
    }
}

// Render messages in the admin dashboard
function renderMessages() {
    if (!messagesList) return;
    
    if (messages.length === 0) {
        messagesList.innerHTML = '';
        noMessagesMessage.style.display = 'block';
        return;
    }
    
    noMessagesMessage.style.display = 'none';
    messagesList.innerHTML = '';
    
    messages.forEach(message => {
        const messageCard = document.createElement('div');
        messageCard.classList.add('message-card');
        messageCard.setAttribute('data-id', message.id);
        
        const statusClass = message.read ? 'status-read' : 'status-unread';
        
        messageCard.innerHTML = `
            <div class="message-status ${statusClass}"></div>
            <div class="message-header">
                <div class="message-sender">
                    <h3>${message.name}</h3>
                    <p>${message.email}</p>
                </div>
                <div class="message-date">${formatDate(message.date)}</div>
            </div>
            <div class="message-subject">${message.subject}</div>
            <div class="message-content">${message.message}</div>
            <div class="message-actions">
                <button class="btn secondary-btn mark-${message.read ? 'unread' : 'read'}-btn" data-id="${message.id}">
                    Mark as ${message.read ? 'Unread' : 'Read'}
                </button>
                <button class="btn danger-btn delete-message-btn" data-id="${message.id}">
                    Delete
                </button>
            </div>
        `;
        
        messagesList.appendChild(messageCard);
    });
    
    // Add event listeners to message action buttons
    document.querySelectorAll('.mark-read-btn, .mark-unread-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            toggleMessageReadStatus(id);
        });
    });
    
    document.querySelectorAll('.delete-message-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this message?')) {
                deleteMessage(id);
            }
        });
    });
}

// Toggle message read status
function toggleMessageReadStatus(id) {
    const index = messages.findIndex(message => message.id === id);
    
    if (index !== -1) {
        // Toggle read status
        messages[index].read = !messages[index].read;
        
        // Save messages
        saveMessages();
        
        // Re-render messages
        renderMessages();
        
        // Update dashboard
        updateDashboard();
        
        // Show notification
        const status = messages[index].read ? 'read' : 'unread';
        showNotification(`Message marked as ${status}`, 'info');
    }
}

// Delete message
function deleteMessage(id) {
    messages = messages.filter(message => message.id !== id);
    
    // Save messages
    saveMessages();
    
    // Re-render messages
    renderMessages();
    
    // Update dashboard
    updateDashboard();
    
    // Show notification
    showNotification('Message deleted successfully', 'info');
}

// Render activities list
function renderActivities() {
    if (!recentActivityList) return;
    
    if (activities.length === 0) {
        recentActivityList.innerHTML = '<p class="empty-message">No recent activity.</p>';
        return;
    }
    
    recentActivityList.innerHTML = '';
    
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.classList.add('activity-item');
        activityItem.innerHTML = `
            <p>${activity.description}</p>
            <p class="activity-time">${formatDate(activity.date)}</p>
        `;
        recentActivityList.appendChild(activityItem);
    });
}

// Render resources table
function renderResourcesTable() {
    if (!resourcesTableBody) return;
    
    // Filter resources based on current filter and search query
    let filteredResources = resources;
    
    if (currentAdminFilter !== 'all') {
        filteredResources = filteredResources.filter(resource => resource.category === currentAdminFilter);
    }
    
    if (searchQuery) {
        filteredResources = filteredResources.filter(resource => 
            resource.title.toLowerCase().includes(searchQuery) || 
            resource.content.toLowerCase().includes(searchQuery)
        );
    }
    
    if (filteredResources.length === 0) {
        resourcesTableBody.innerHTML = '';
        noResourcesMessage.style.display = 'block';
        return;
    }
    
    noResourcesMessage.style.display = 'none';
    resourcesTableBody.innerHTML = '';
    
    filteredResources.forEach(resource => {
        const row = document.createElement('tr');
        
        // Get category display name
        const categoryDisplay = getCategoryDisplayName(resource.category);
        
        // Set status (default to published if not specified)
        const status = resource.status || 'published';
        
        row.innerHTML = `
            <td>${resource.title}</td>
            <td>${categoryDisplay}</td>
            <td>${formatDate(resource.date)}</td>
            <td><span class="resource-status status-${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
            <td>
                <div class="resource-actions">
                    <div class="action-btn view-btn" title="View" data-id="${resource.id}">
                        <i class="fas fa-eye"></i>
                    </div>
                    <div class="action-btn edit-btn" title="Edit" data-id="${resource.id}">
                        <i class="fas fa-edit"></i>
                    </div>
                    <div class="action-btn delete-btn" title="Delete" data-id="${resource.id}">
                        <i class="fas fa-trash"></i>
                    </div>
                </div>
            </td>
        `;
        
        resourcesTableBody.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            editResource(id);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            openDeleteModal(id);
        });
    });
    
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            viewResource(id);
        });
    });
}

// Get category display name
function getCategoryDisplayName(category) {
    const categoryMap = {
        'book-notes': 'Book Notes',
        'model-questions': 'Model Questions',
        'lecture-notes': 'Lecture Notes',
        'tutorials': 'Tutorials'
    };
    return categoryMap[category] || 'Other';
}

// Open resource modal for adding new resource
function openResourceModal() {
    modalTitle.textContent = 'Add New Resource';
    resourceId.value = '';
    resourceForm.reset();
    resourceStatus.value = 'published';
    resourceMessage.textContent = '';
    
    resourceModal.classList.add('show');
}

// Open resource modal for editing resource
function editResource(id) {
    const resource = resources.find(resource => resource.id === id);
    
    if (resource) {
        modalTitle.textContent = 'Edit Resource';
        resourceId.value = resource.id;
        resourceTitle.value = resource.title;
        resourceCategory.value = resource.category;
        resourceContent.value = resource.content;
        resourceStatus.value = resource.status || 'published';
        resourceMessage.textContent = '';
        
        resourceModal.classList.add('show');
    }
}

// View resource
function viewResource(id) {
    // In a real app, this might open a preview page
    // For now, we'll just redirect to the main site with the resource selected
    window.location.href = `index.html#notes`;
    // In a real implementation, you would pass the ID and auto-select the resource
}

// Close resource modal
function closeResourceModal() {
    resourceModal.classList.remove('show');
}

// Open delete confirmation modal
function openDeleteModal(id) {
    deleteResourceId.value = id;
    deleteModal.classList.add('show');
}

// Close delete modal
function closeDeleteModal() {
    deleteModal.classList.remove('show');
}

// Close all modals
function closeAllModals() {
    resourceModal.classList.remove('show');
    deleteModal.classList.remove('show');
}

// Validate resource form
function validateResourceForm() {
    const title = resourceTitle.value.trim();
    const category = resourceCategory.value;
    const content = resourceContent.value.trim();
    
    if (!title) {
        resourceMessage.textContent = 'Title is required';
        return false;
    }
    
    if (!category) {
        resourceMessage.textContent = 'Category is required';
        return false;
    }
    
    if (!content) {
        resourceMessage.textContent = 'Content is required';
        return false;
    }
    
    return true;
}

// Save resource (add new or update existing)
function saveResource() {
    const id = resourceId.value;
    const title = resourceTitle.value.trim();
    const category = resourceCategory.value;
    const content = resourceContent.value.trim();
    const status = resourceStatus.value;
    
    if (id) {
        // Update existing resource
        const index = resources.findIndex(resource => resource.id === id);
        
        if (index !== -1) {
            resources[index] = {
                ...resources[index],
                title,
                category,
                content,
                status,
                lastUpdated: new Date().toISOString()
            };
            
            addActivity(`Updated resource: ${title}`);
        }
    } else {
        // Add new resource
        const newResource = {
            id: Date.now().toString(),
            title,
            category,
            content,
            status,
            date: new Date().toISOString()
        };
        
        resources.unshift(newResource);
        addActivity(`Added new resource: ${title}`);
    }
    
    saveResources();
    updateDashboard();
    renderResourcesTable();
    closeResourceModal();
}

// Delete resource
function deleteResource(id) {
    const resource = resources.find(resource => resource.id === id);
    
    if (resource) {
        resources = resources.filter(resource => resource.id !== id);
        saveResources();
        updateDashboard();
        renderResourcesTable();
        
        addActivity(`Deleted resource: ${resource.title}`);
    }
}
