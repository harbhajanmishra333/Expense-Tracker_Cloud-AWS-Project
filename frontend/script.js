let currentUser = null;
let idToken = null;
let userPool = null;
let cognitoUser = null;

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain', 'text/csv', 'application/zip', 'application/x-zip-compressed'
];

function initCognito() {
    const poolData = {
        UserPoolId: CONFIG.cognito.userPoolId,
        ClientId: CONFIG.cognito.clientId
    };
    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
}

function checkAuthStatus() {
    cognitoUser = userPool.getCurrentUser();
    if (cognitoUser != null) {
        cognitoUser.getSession((err, session) => {
            if (err) {
                showAuthSection();
                return;
            }
            if (session.isValid()) {
                idToken = session.getIdToken().getJwtToken();
                currentUser = cognitoUser;
                showAppSection(session.getIdToken().payload.email);
                loadFiles();
            } else {
                showAuthSection();
            }
        });
    } else {
        showAuthSection();
    }
}

function showAuthSection() {
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('app-section').style.display = 'none';
}

function showAppSection(email) {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('app-section').style.display = 'block';
    document.getElementById('user-email').textContent = email;
}

function showMessage(elementId, message, type) {
    const messageEl = document.getElementById(elementId);
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    setTimeout(() => messageEl.style.display = 'none', 5000);
}

document.getElementById('signup').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    const attributeList = [
        new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'email', Value: email }),
        new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'name', Value: name })
    ];

    userPool.signUp(email, password, attributeList, null, (err, result) => {
        if (err) {
            showMessage('auth-message', err.message || JSON.stringify(err), 'error');
            return;
        }
        showMessage('auth-message', 'Sign up successful! Please check your email to verify your account, then sign in.', 'success');
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('signin-form').style.display = 'block';
    });
});

document.getElementById('signin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    const authenticationData = {
        Username: email,
        Password: password
    };
    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

    const userData = {
        Username: email,
        Pool: userPool
    };
    cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
            idToken = result.getIdToken().getJwtToken();
            currentUser = cognitoUser;
            showAppSection(email);
            loadFiles();
        },
        onFailure: (err) => {
            showMessage('auth-message', err.message || JSON.stringify(err), 'error');
        }
    });
});

document.getElementById('show-signin').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signup-form').style.display = 'none';
    document.getElementById('signin-form').style.display = 'block';
});

document.getElementById('show-signup').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signin-form').style.display = 'none';
    document.getElementById('signup-form').style.display = 'block';
});

document.getElementById('logout-btn').addEventListener('click', () => {
    if (cognitoUser) {
        cognitoUser.signOut();
    }
    currentUser = null;
    idToken = null;
    showAuthSection();
});

document.getElementById('upload-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fileInput = document.getElementById('file-input');
    const file = fileInput.files[0];
    const tag = document.getElementById('file-tag').value.trim() || 'untagged';

    if (!file) {
        showMessage('upload-message', 'Please select a file', 'error');
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
        showMessage('upload-message', `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`, 'error');
        return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        showMessage('upload-message', 'File type not allowed', 'error');
        return;
    }

    try {
        const uploadUrlResponse = await fetch(`${CONFIG.api.endpoint}/get-upload-url`, {
            method: 'POST',
            headers: {
                'Authorization': idToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size
            })
        });

        if (!uploadUrlResponse.ok) {
            throw new Error('Failed to get upload URL');
        }

        const { uploadUrl, fileId, key } = await uploadUrlResponse.json();

        document.getElementById('upload-progress').style.display = 'block';
        const progressFill = document.querySelector('.progress-fill');

        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': file.type
            },
            body: file
        });

        if (!uploadResponse.ok) {
            throw new Error('Failed to upload file');
        }

        progressFill.style.width = '100%';

        const metadataResponse = await fetch(`${CONFIG.api.endpoint}/files`, {
            method: 'POST',
            headers: {
                'Authorization': idToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileId,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                key,
                tag
            })
        });

        if (!metadataResponse.ok) {
            throw new Error('Failed to save file metadata');
        }

        showMessage('upload-message', 'File uploaded successfully!', 'success');
        document.getElementById('upload-form').reset();
        setTimeout(() => {
            document.getElementById('upload-progress').style.display = 'none';
            progressFill.style.width = '0%';
        }, 1000);
        loadFiles();
    } catch (error) {
        showMessage('upload-message', error.message, 'error');
        document.getElementById('upload-progress').style.display = 'none';
    }
});

async function loadFiles() {
    try {
        const response = await fetch(`${CONFIG.api.endpoint}/files`, {
            headers: {
                'Authorization': idToken
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load files');
        }

        const data = await response.json();
        displayFiles(data.files);
    } catch (error) {
        showMessage('files-message', error.message, 'error');
    }
}

function displayFiles(files) {
    const filesList = document.getElementById('files-list');
    if (files.length === 0) {
        filesList.innerHTML = '<p>No files uploaded yet.</p>';
        return;
    }

    filesList.innerHTML = files.map(file => `
        <div class="file-card">
            <div class="file-header">
                <div class="file-name">${file.fileName}</div>
                <div class="file-tag">${file.tag}</div>
            </div>
            <div class="file-info">
                <div>Size: ${formatFileSize(file.fileSize)}</div>
                <div>Uploaded: ${new Date(file.uploadedAt).toLocaleString()}</div>
            </div>
            <div class="file-actions">
                <button class="btn btn-primary" onclick="downloadFile('${file.downloadUrl}', '${file.fileName}')">Download</button>
                <button class="btn btn-secondary" onclick="renameFilePrompt('${file.fileId}', '${file.fileName}')">Rename</button>
                <button class="btn btn-secondary" onclick="shareFilePrompt('${file.fileId}')">Share</button>
                <button class="btn btn-danger" onclick="deleteFile('${file.fileId}')">Delete</button>
            </div>
        </div>
    `).join('');
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function downloadFile(url, fileName) {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

let currentFileId = null;

function renameFilePrompt(fileId, currentName) {
    currentFileId = fileId;
    document.getElementById('new-filename').value = currentName;
    document.getElementById('rename-modal').style.display = 'block';
}

document.getElementById('rename-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const newFileName = document.getElementById('new-filename').value.trim();

    try {
        const response = await fetch(`${CONFIG.api.endpoint}/files/${currentFileId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': idToken,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newFileName })
        });

        if (!response.ok) {
            throw new Error('Failed to rename file');
        }

        document.getElementById('rename-modal').style.display = 'none';
        showMessage('files-message', 'File renamed successfully!', 'success');
        loadFiles();
    } catch (error) {
        showMessage('files-message', error.message, 'error');
    }
});

document.getElementById('cancel-rename').addEventListener('click', () => {
    document.getElementById('rename-modal').style.display = 'none';
});

async function shareFilePrompt(fileId) {
    try {
        const response = await fetch(`${CONFIG.api.endpoint}/files/${fileId}/share`, {
            method: 'POST',
            headers: {
                'Authorization': idToken,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to generate shareable link');
        }

        const data = await response.json();
        document.getElementById('share-link').value = data.shareableUrl;
        document.getElementById('share-modal').style.display = 'block';
    } catch (error) {
        showMessage('files-message', error.message, 'error');
    }
}

document.getElementById('copy-link-btn').addEventListener('click', () => {
    const linkInput = document.getElementById('share-link');
    linkInput.select();
    document.execCommand('copy');
    showMessage('files-message', 'Link copied to clipboard!', 'success');
});

async function deleteFile(fileId) {
    if (!confirm('Are you sure you want to delete this file?')) {
        return;
    }

    try {
        const response = await fetch(`${CONFIG.api.endpoint}/files/${fileId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': idToken
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete file');
        }

        showMessage('files-message', 'File deleted successfully!', 'success');
        loadFiles();
    } catch (error) {
        showMessage('files-message', error.message, 'error');
    }
}

document.getElementById('search-btn').addEventListener('click', async () => {
    const searchTerm = document.getElementById('search-input').value.trim();
    const tag = document.getElementById('tag-filter').value.trim();

    try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('q', searchTerm);
        if (tag) params.append('tag', tag);

        const response = await fetch(`${CONFIG.api.endpoint}/files/search?${params}`, {
            headers: {
                'Authorization': idToken
            }
        });

        if (!response.ok) {
            throw new Error('Failed to search files');
        }

        const data = await response.json();
        displayFiles(data.files);
        showMessage('files-message', `Found ${data.count} file(s)`, 'success');
    } catch (error) {
        showMessage('files-message', error.message, 'error');
    }
});

document.getElementById('clear-search-btn').addEventListener('click', () => {
    document.getElementById('search-input').value = '';
    document.getElementById('tag-filter').value = '';
    loadFiles();
});

document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

window.addEventListener('DOMContentLoaded', () => {
    initCognito();
    checkAuthStatus();
});
