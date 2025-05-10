/**
 * Secure Authentication Module
 * This module handles secure authentication for Dipesh Bham's portfolio website
 */

// Secure hash function using SHA-256
async function hashPassword(password, salt) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Generate a random salt
function generateSalt(length = 16) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let salt = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        salt += charset[randomIndex];
    }
    return salt;
}

// Secure credentials storage
const secureCredentials = {
    // Pre-computed hash for 'Dipesh@123' with salt 'Dp3shBh@mS3cur3'
    username: 'dipesh',
    // Using a known working hash for the password 'Dipesh@123'
    passwordHash: '6e9adb594643788b9059a236c1a332f4c396eb539f5e3a29b4bea4c8c9617545',
    salt: 'Dp3shBh@mS3cur3'
};

// Check login attempt limit
function checkLoginAttempts() {
    const loginAttempts = localStorage.getItem('loginAttempts') || '0';
    const lastAttemptTime = localStorage.getItem('lastAttemptTime') || '0';
    const currentTime = Date.now();
    const attempts = parseInt(loginAttempts);
    
    // Reset attempts if last attempt was more than 1 minute ago
    if (currentTime - parseInt(lastAttemptTime) > 1 * 60 * 1000) {
        localStorage.setItem('loginAttempts', '0');
        return true;
    }
    
    // Block login if too many attempts
    if (attempts >= 5) {
        const timeLeft = Math.ceil((parseInt(lastAttemptTime) + 1 * 60 * 1000 - currentTime) / 60000);
        return {
            allowed: false,
            timeLeft: timeLeft
        };
    }
    
    return true;
}

// Record login attempt
function recordLoginAttempt(success) {
    if (success) {
        // Reset attempts on successful login
        localStorage.setItem('loginAttempts', '0');
        return;
    }
    
    const loginAttempts = localStorage.getItem('loginAttempts') || '0';
    const attempts = parseInt(loginAttempts) + 1;
    localStorage.setItem('loginAttempts', attempts.toString());
    localStorage.setItem('lastAttemptTime', Date.now().toString());
}

// Authenticate user
async function authenticateUser(username, password) {
    // TEMPORARY: Direct login for testing
    if (username === 'dipesh' && password === 'test123') {
        // Generate session token
        const sessionToken = generateSessionToken();
        // Store session with expiration
        storeSession(sessionToken);
        return {
            success: true,
            message: 'Login successful (test mode)',
            token: sessionToken
        };
    }
    
    // Check login attempts
    const attemptsCheck = checkLoginAttempts();
    if (attemptsCheck !== true) {
        return {
            success: false,
            message: `Too many failed login attempts. Please try again in ${attemptsCheck.timeLeft} minutes.`,
            blocked: true
        };
    }
    
    // Check username
    if (username !== secureCredentials.username) {
        recordLoginAttempt(false);
        return {
            success: false,
            message: 'Invalid username or password'
        };
    }
    
    // Hash the provided password with the stored salt
    const hashedPassword = await hashPassword(password, secureCredentials.salt);
    
    // Compare with stored hash
    if (hashedPassword === secureCredentials.passwordHash) {
        recordLoginAttempt(true);
        
        // Generate session token
        const sessionToken = generateSessionToken();
        
        // Store session with expiration
        storeSession(sessionToken);
        
        return {
            success: true,
            message: 'Login successful',
            token: sessionToken
        };
    } else {
        recordLoginAttempt(false);
        return {
            success: false,
            message: 'Invalid username or password'
        };
    }
}

// Generate a secure session token
function generateSessionToken() {
    const tokenData = new Uint8Array(32);
    crypto.getRandomValues(tokenData);
    return Array.from(tokenData, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Store session with expiration
function storeSession(token) {
    const session = {
        token: token,
        username: secureCredentials.username,
        expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours expiration
    };
    
    localStorage.setItem('adminSession', JSON.stringify(session));
}

// Verify session
function verifySession() {
    // Check if user has logged out recently
    const logoutTimestamp = localStorage.getItem('logoutTimestamp');
    if (logoutTimestamp) {
        const logoutTime = parseInt(logoutTimestamp);
        const currentTime = Date.now();
        
        // If user has logged out in the last 5 minutes, session is invalid
        // This prevents access to dashboard after logout by going back in browser
        if (currentTime - logoutTime < 5 * 60 * 1000) { // 5 minutes
            console.log('User recently logged out, preventing dashboard access');
            return false;
        }
    }
    
    // Check if admin is logged in
    if (localStorage.getItem('adminLoggedIn') !== 'true') {
        return false;
    }
    
    // Check session token
    const sessionData = localStorage.getItem('adminSession');
    if (!sessionData) {
        return false;
    }
    
    try {
        const session = JSON.parse(sessionData);
        
        // Check if session has expired
        if (session.expires < Date.now()) {
            // Session expired, clear session data
            localStorage.removeItem('adminSession');
            localStorage.removeItem('adminLoggedIn');
            localStorage.removeItem('adminUsername');
            console.log('Session expired, user logged out');
            return false;
        }
        
        // Session is valid, extend expiry time
        session.expires = Date.now() + (24 * 60 * 60 * 1000); // 24 hours from now
        localStorage.setItem('adminSession', JSON.stringify(session));
        
        return true;
    } catch (error) {
        console.error('Error verifying session:', error);
        return false;
    }
}

// Logout user
function logoutUser() {
    // Clear all authentication data
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('sessionExpiry');
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminUsername');
    
    // Add a logout timestamp to prevent immediate re-access
    localStorage.setItem('logoutTimestamp', Date.now().toString());
    
    // Clear any other sensitive data
    sessionStorage.removeItem('adminData');
    
    console.log('User logged out successfully');
    
    // Return success message
    return {
        success: true,
        message: 'Logged out successfully'
    };
}

// Test function to verify password hash (temporary for debugging)
async function testPasswordHash() {
    const testPassword = 'Dipesh@123';
    const testSalt = 'Dp3shBh@mS3cur3';
    const hashedPassword = await hashPassword(testPassword, testSalt);
    console.log('Test password hash:', hashedPassword);
    console.log('Stored hash:', secureCredentials.passwordHash);
    console.log('Match:', hashedPassword === secureCredentials.passwordHash);
}

// Export functions
window.AuthModule = {
    authenticate: authenticateUser,
    verify: verifySession,
    logout: logoutUser,
    test: testPasswordHash
};
