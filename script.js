document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const loginContainer = document.getElementById('login-container');
    const choiceContainer = document.getElementById('choice-container');
    const logoutBtn = document.getElementById('logout-btn');
    
    const cardhashim = document.getElementById('card-hashim');
    const cardsadeen = document.getElementById('card-sadeen');

    // Story View Elements
    const SUPABASE_URL = 'https://lezmniypicjcbyetucvz.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxlem1uaXlwaWNqY2J5ZXR1Y3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTg4MDgsImV4cCI6MjA5MDI5NDgwOH0.Q5UHhIr_wd2XqNFQJKu2F2hfAjsrm-RhjbU8PNRhfo8';
    const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const storyContainer = document.getElementById('story-container');
    const storyTitle = document.getElementById('story-title');
    const bioText = document.getElementById('bio-text');
    const editBioBtn = document.getElementById('edit-bio-btn');
    const shareProfileBtn = document.getElementById('share-profile-btn');
    const backToChoicesBtn = document.getElementById('back-to-choices-btn');
    
    // Modal Elements
    const editModal = document.getElementById('edit-modal');
    const bioEditor = document.getElementById('bio-editor');
    const editName = document.getElementById('edit-name');
    const editWallpaperFile = document.getElementById('edit-wallpaper-file');
    const fileNameDisplay = document.getElementById('file-name-display');
    const clearWallpaperBtn = document.getElementById('clear-wallpaper-btn');
    
    let uploadedWallpaper = null;
    const saveBioBtn = document.getElementById('save-bio-btn');
    const cancelBioBtn = document.getElementById('cancel-bio-btn');

    let currentUser = null;
    let currentStory = null;

    // Login via Cloud Database
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        // Reset error state
        errorMessage.classList.remove('show');
        loginContainer.classList.remove('shake');

        try {
            const { data, error } = await _supabase
                .from('profiles')
                .select('username, password')
                .eq('username', username)
                .single();

            if (!error && data && data.password === password) {
                handleLoginSuccess(data.username);
            } else {
                handleLoginError();
            }
        } catch (err) {
            console.error('Login error:', err);
            handleLoginError();
        }
    });

    function handleLoginSuccess(username) {
        currentUser = username;
        localStorage.setItem('currentUser', username);
        usernameInput.value = '';
        passwordInput.value = '';
        
        loginContainer.classList.remove('active');
        loginContainer.classList.add('hidden');
        
        setTimeout(() => {
            choiceContainer.classList.remove('hidden');
            choiceContainer.classList.add('active');
        }, 500);
    }

    function handleLoginError() {
        errorMessage.classList.add('show');
        void loginContainer.offsetWidth; 
        loginContainer.classList.add('shake');
        setTimeout(() => {
            loginContainer.classList.remove('shake');
        }, 500);
    }

    // Logout functionality
    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('currentUser');
        choiceContainer.classList.remove('active');
        choiceContainer.classList.add('hidden');
        
        setTimeout(() => {
            loginContainer.classList.remove('hidden');
            loginContainer.classList.add('active');
        }, 500);
    });

    // Profile Default Data
    const defaultData = {
        'hashim': {
            name: "System Override",
            bio: "Welcome to the matrix...\n\nSYSTEM OVERRIDE DETECTED.\n\n[ADD YOUR BIO INFO HERE]",
            wallpaper: null
        },
        'sadeen': {
            name: "sadeen 🌸",
            bio: "Hii! 🌸 Welcome to my story! 💕\n\nEnjoy the cuteness, put your bio here!",
            wallpaper: null
        }
    };

    async function loadProfileData(storyId) {
        let savedBio, savedName, savedWallpaper;
        
        try {
            const { data, error } = await _supabase
                .from('profiles')
                .select('*')
                .eq('username', storyId)
                .single();
            
            if (data) {
                savedBio = data.bio || defaultData[storyId].bio;
                savedName = data.full_name || defaultData[storyId].name;
                savedWallpaper = data.wallpaper || null;
            } else {
                savedBio = defaultData[storyId].bio;
                savedName = defaultData[storyId].name;
            }
        } catch (e) {
            console.error("Supabase load error:", e);
            savedBio = defaultData[storyId].bio;
            savedName = defaultData[storyId].name;
        }

        bioText.textContent = savedBio;
        if(igFullname) igFullname.textContent = savedName;

        if (savedWallpaper) {
            storyContainer.style.backgroundImage = `url(${savedWallpaper})`;
            storyContainer.style.backgroundSize = 'cover';
            storyContainer.style.backgroundPosition = 'center';
            storyContainer.style.backgroundBlendMode = 'overlay';
        } else {
            storyContainer.style.backgroundImage = 'none'; 
        }
    }

    const igFullname = document.getElementById('ig-fullname');

    function openStoryView(storyId, ownerAccounts, titleText, fullNameText) {
        currentStory = storyId;
        storyTitle.textContent = titleText;
        
        loadProfileData(storyId);

        // Apply theme classes
        storyContainer.classList.remove('hacker-theme-ig', 'girly-theme-ig');
        if (storyId === 'hashim') {
            storyContainer.classList.add('hacker-theme-ig');
        } else {
            storyContainer.classList.add('girly-theme-ig');
        }

        // Check if user is owner
        if (ownerAccounts.includes(currentUser.toUpperCase()) || ownerAccounts.includes(currentUser)) {
            editBioBtn.classList.remove('hidden');
            if(shareProfileBtn) shareProfileBtn.classList.remove('hidden');
        } else {
            editBioBtn.classList.add('hidden');
            if(shareProfileBtn) shareProfileBtn.classList.add('hidden');
        }

        // Transition
        choiceContainer.classList.remove('active');
        choiceContainer.classList.add('hidden');
        
        setTimeout(() => {
            storyContainer.classList.remove('hidden');
            storyContainer.classList.add('active');
            storyContainer.style.display = 'block';
        }, 500);
    }

    // Story Card interactions
    cardhashim.addEventListener('click', () => {
        createRipple(cardhashim);
        setTimeout(() => {
            openStoryView('hashim', ['1', 'hashim'], 'Hashim', 'System Override');
        }, 400);
    });

    cardsadeen.addEventListener('click', () => {
        createRipple(cardsadeen);
        setTimeout(() => {
            openStoryView('sadeen', ['2', 'sadeen'], 'sadeen', 'sadeen 🌸');
        }, 400);
    });

    // Bio Edit interactions
    backToChoicesBtn.addEventListener('click', () => {
        storyContainer.classList.remove('active');
        storyContainer.classList.add('hidden');
        
        setTimeout(() => {
            choiceContainer.classList.remove('hidden');
            choiceContainer.classList.add('active');
        }, 500);
    });

    if (editWallpaperFile) {
        editWallpaperFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                fileNameDisplay.textContent = file.name;
                const reader = new FileReader();
                reader.onload = function(event) {
                    uploadedWallpaper = event.target.result;
                };
                reader.readAsDataURL(file);
            } else {
                fileNameDisplay.textContent = 'No file chosen';
                uploadedWallpaper = null;
            }
        });
    }

    if (clearWallpaperBtn) {
        clearWallpaperBtn.addEventListener('click', () => {
            uploadedWallpaper = null;
            editWallpaperFile.value = '';
            fileNameDisplay.textContent = 'No file chosen';
        });
    }

    editBioBtn.addEventListener('click', async () => {
        // Load current profile from cloud
        let savedName = defaultData[currentStory].name;
        let savedBio = defaultData[currentStory].bio;

        try {
            const { data } = await _supabase
                .from('profiles')
                .select('*')
                .eq('username', currentStory)
                .single();
            if (data) {
                savedName = data.full_name || savedName;
                savedBio = data.bio || savedBio;
                uploadedWallpaper = data.wallpaper || null;
            }
        } catch(e) {}
        
        editName.value = savedName;
        bioEditor.value = savedBio;
        
        editWallpaperFile.value = '';
        fileNameDisplay.textContent = 'No file chosen';

        editModal.classList.remove('hidden');
        setTimeout(() => {
            editModal.classList.add('active');
        }, 10);
    });

    cancelBioBtn.addEventListener('click', () => {
        editModal.classList.remove('active');
        setTimeout(() => {
            editModal.classList.add('hidden');
        }, 300);
    });

    saveBioBtn.addEventListener('click', async () => {
        const newBio = bioEditor.value.trim();
        const newName = editName.value.trim();

        try {
            const { error } = await _supabase
                .from('profiles')
                .update({ 
                    bio: newBio, 
                    full_name: newName,
                    wallpaper: uploadedWallpaper || ''
                })
                .eq('username', currentStory);

            if (error) throw error;
            
            await loadProfileData(currentStory);
            console.log("☁️ Profile updated in cloud.");
        } catch (e) {
            console.error("Save error:", e);
            alert("Failed to save to cloud. Please try again.");
        }
        
        editModal.classList.remove('active');
        setTimeout(() => {
            editModal.classList.add('hidden');
        }, 300);
    });
    
    // Aesthetic click effect
    function createRipple(element) {
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.top = '50%';
        ripple.style.left = '50%';
        ripple.style.transform = 'translate(-50%, -50%)';
        ripple.style.width = '10px';
        ripple.style.height = '10px';
        ripple.style.background = 'rgba(255,255,255,0.4)';
        ripple.style.borderRadius = '50%';
        ripple.style.animation = 'ripple-effect 0.6s linear';
        ripple.style.zIndex = '10';
        ripple.style.pointerEvents = 'none';
        
        if (!document.getElementById('ripple-style')) {
            const style = document.createElement('style');
            style.id = 'ripple-style';
            style.innerHTML = `
                @keyframes ripple-effect {
                    0% { width: 10px; height: 10px; opacity: 1; }
                    100% { width: 500px; height: 500px; opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
});
