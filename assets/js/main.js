// Configuration
const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL'; // You'll update this with your actual Apps Script URL
const BASE_URL = window.location.origin + window.location.pathname.replace('index.html', '');

// DOM Elements
const addLinkForm = document.getElementById('add-link-form');
const linksContainer = document.getElementById('links-container');
const linksLoader = document.getElementById('links-loader');
const linksTableBody = document.getElementById('links-table-body');
const noLinksMessage = document.getElementById('no-links-message');
const messageContainer = document.getElementById('message-container');

// Helper Functions
function showMessage(message, type = 'success') {
    const messageElement = document.createElement('div');
    messageElement.classList.add(
        'flash-message', 
        'p-4', 
        'rounded', 
        'shadow', 
        'mb-4',
        type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    );
    messageElement.textContent = message;
    messageContainer.appendChild(messageElement);
    
    // Remove message after animation completes
    setTimeout(() => {
        messageElement.remove();
    }, 4000);
}

function generateShortUrl(slug) {
    return `${BASE_URL}redirect.html?slug=${slug}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            showMessage('Link copied to clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
            showMessage('Failed to copy link', 'error');
        });
}

function getLinkStatus(expirationDate) {
    const now = new Date();
    const expDate = new Date(expirationDate);
    return now > expDate ? 'Expired' : 'Active';
}

// API Functions
async function fetchLinks() {
    try {
        const response = await fetch(https://script.google.com/macros/s/AKfycbxXmHcADu4nRgxj4isEK_5X3l5BU4z8AKvkKfNGAn0JGccUlw2Mvkq33xqQVfpfoRw9/exec, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'getLinks' })
        });
        
        const data = await response.json();
        
        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.message || 'Failed to fetch links');
        }
    } catch (error) {
        console.error('Error fetching links:', error);
        showMessage(`Error fetching links: ${error.message}`, 'error');
        return [];
    }
}

async function addLink(linkData) {
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                action: 'addLink', 
                data: linkData 
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            return { success: true, data: data.data };
        } else {
            return { success: false, message: data.message || 'Failed to add link' };
        }
    } catch (error) {
        console.error('Error adding link:', error);
        return { success: false, message: error.message };
    }
}

async function deleteLink(id) {
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                action: 'deleteLink', 
                id: id 
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            return { success: true };
        } else {
            return { success: false, message: data.message || 'Failed to delete link' };
        }
    } catch (error) {
        console.error('Error deleting link:', error);
        return { success: false, message: error.message };
    }
}

// UI Functions
function renderLinks(links) {
    linksLoader.classList.add('hidden');
    linksContainer.classList.remove('hidden');
    
    if (links.length === 0) {
        noLinksMessage.classList.remove('hidden');
        return;
    }
    
    noLinksMessage.classList.add('hidden');
    linksTableBody.innerHTML = '';
    
    links.forEach(link => {
        const row = document.createElement('tr');
        const shortUrl = generateShortUrl(link.slug);
        const status = getLinkStatus(link.expirationDate);
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                    <span class="text-sm text-blue-600 truncate max-w-xs">${shortUrl}</span>
                    <button class="copy-button ml-2 text-gray-400 hover:text-blue-500" data-url="${shortUrl}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                        </svg>
                    </button>
                </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-500 truncate max-w-xs" title="${link.primeLink}">${link.primeLink}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-500 truncate max-w-xs" title="${link.expirationLink}">${link.expirationLink}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-500">${formatDate(link.expirationDate)}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }">${status}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="delete-button text-red-600 hover:text-red-900" data-id="${link.id}">Delete</button>
            </td>
        `;
        
        linksTableBody.appendChild(row);
    });
    
    // Add event listeners to copy buttons
    document.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', () => {
            const url = button.dataset.url;
            copyToClipboard(url);
            
            // Visual feedback
            button.classList.add('copy-success');
            setTimeout(() => {
                button.classList.remove('copy-success');
            }, 1000);
        });
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-button').forEach(button => {
        button.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this link?')) {
                const id = button.dataset.id;
                const result = await deleteLink(id);
                
                if (result.success) {
                    showMessage('Link deleted successfully');
                    loadLinks();
                } else {
                    showMessage(`Failed to delete link: ${result.message}`, 'error');
                }
            }
        });
    });
}

async function loadLinks() {
    linksLoader.classList.remove('hidden');
    linksContainer.classList.add('hidden');
    
    const links = await fetchLinks();
    renderLinks(links);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadLinks();
    
    addLinkForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const primeLink = document.getElementById('prime-link').value;
        const expirationLink = document.getElementById('expiration-link').value;
        const expirationDate = document.getElementById('expiration-date').value;
        const customSlug = document.getElementById('custom-slug').value;
        
        const linkData = {
            primeLink,
            expirationLink,
            expirationDate,
            slug: customSlug || undefined
        };
        
        const result = await addLink(linkData);
        
        if (result.success) {
            showMessage('Link added successfully');
            addLinkForm.reset();
            loadLinks();
        } else {
            showMessage(`Failed to add link: ${result.message}`, 'error');
        }
    });
});
