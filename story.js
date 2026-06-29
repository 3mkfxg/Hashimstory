document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    const currentStory = window.CURRENT_STORY_ID;
    const ownerAccounts = window.OWNER_ACCOUNTS;

    const storyContainer = document.getElementById('story-container');
    const igFullname = document.getElementById('ig-fullname');
    const bioText = document.getElementById('bio-text');
    const editBioBtn = document.getElementById('edit-bio-btn');
    const shareProfileBtn = document.getElementById('share-profile-btn');
    const backToChoicesBtn = document.getElementById('back-to-choices-btn');

    const editModal = document.getElementById('edit-modal');
    const bioEditor = document.getElementById('bio-editor');
    const editName = document.getElementById('edit-name');
    const editWallpaperFile = document.getElementById('edit-wallpaper-file');
    const fileNameDisplay = document.getElementById('file-name-display');
    const clearWallpaperBtn = document.getElementById('clear-wallpaper-btn');
    const wallpaperPreviewContainer = document.getElementById('wallpaper-preview-container');
    const wallpaperPreviewImg = document.getElementById('wallpaper-preview-img');
    const saveBioBtn = document.getElementById('save-bio-btn');
    const cancelBioBtn = document.getElementById('cancel-bio-btn');
    const wallpaperVideo = document.getElementById('wallpaper-video');
    const wallpaperPreviewVideo = document.getElementById('wallpaper-preview-video');

    const addStoryModal = document.getElementById('add-story-modal');
    const addPostBtn = document.getElementById('add-post-btn');
    const storyTitleInput = document.getElementById('story-title-input');
    const storyContentInput = document.getElementById('story-content-input');
    const saveStoryBtn = document.getElementById('save-story-btn');
    const warningStoryBtn = document.getElementById('warning-story-btn');
    const cancelStoryBtn = document.getElementById('cancel-story-btn');
    const gridContainer = document.getElementById('ig-grid-container');

    const storyReaderModal = document.getElementById('story-reader-modal');
    const readerTitle = document.getElementById('reader-title');
    const readerContent = document.getElementById('reader-content');
    const closeReaderBtn = document.getElementById('close-reader-btn');
    const playerVideo = document.getElementById('player-video');
    const playerPhoto = document.getElementById('player-photo');
    const videoContainer = document.getElementById('video-container');
    const photoContainer = document.getElementById('photo-container');

    const videoUploadSection = document.getElementById('video-upload-section');
    const storyVideoFile = document.getElementById('story-video-file');
    const videoNameDisplay = document.getElementById('video-name-display');

    const commentInput = document.getElementById('comment-input');
    const postCommentBtn = document.getElementById('post-comment-btn');
    const readerAvatar = document.getElementById('reader-avatar');
    const readerAuthorName = document.getElementById('reader-author-name');
    const readerPostDate = document.getElementById('reader-post-date');
    const actualComments = document.getElementById('actual-comments');
    const captionAuthorName = document.querySelector('.caption-author-name');
    const captionAvatar = document.querySelector('.caption-avatar');

    let uploadedWallpaper = null; // This will hold the URL or base64
    let selectedWallpaperBlob = null;
    let selectedVideoBlob = null;
    let currentOpenPost = null;

    const readerMediaCol = document.querySelector('.reader-media-col');
    const readerPanel = document.querySelector('.reader-panel');

    // 1. Story Header
    const storyHeader = document.createElement('div');
    storyHeader.className = 'story-view-header';
    storyHeader.innerHTML = `
        <div class="story-header-spacer"></div>
        <button class="story-close-btn" id="story-close-x" title="Close">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
    `;
    if (readerMediaCol) readerMediaCol.insertBefore(storyHeader, readerMediaCol.firstChild);

    // 2. Story Footer
    const storyFooter = document.createElement('div');
    storyFooter.className = 'story-view-footer';
    storyFooter.style.background = 'transparent';
    storyFooter.style.border = 'none';
    storyFooter.innerHTML = `
        <button id="story-footer-comment-btn" class="story-footer-btn" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(10px);">
            Add Comment
        </button>
    `;
    if (readerMediaCol) readerMediaCol.appendChild(storyFooter);

    const backToStoryBtn = document.createElement('button');
    backToStoryBtn.id = 'back-to-story-btn';
    backToStoryBtn.className = 'back-to-story-btn';
    backToStoryBtn.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>`;
    const readerHeader = document.querySelector('.reader-header');
    if (readerHeader) readerHeader.insertBefore(backToStoryBtn, readerHeader.firstChild);

    function setStoryMode() {
        if (readerPanel) {
            readerPanel.classList.add('story-mode');
            readerPanel.classList.remove('comments-mode');
        }
    }

    function setCommentsMode() {
        if (readerPanel) {
            readerPanel.classList.remove('story-mode');
            readerPanel.classList.add('comments-mode');
        }
    }

    function closeReaderModal() {
        if (playerVideo) {
            playerVideo.pause();
            playerVideo.src = '';
        }
        if (playerPhoto) playerPhoto.src = '';
        currentOpenPost = null;
        storyReaderModal.classList.remove('active');
        if (readerPanel) {
            readerPanel.classList.remove('story-mode');
            readerPanel.classList.remove('comments-mode');
            readerPanel.classList.remove('warning-mode'); // Reset warning mode on close
        }
        setTimeout(() => storyReaderModal.classList.add('hidden'), 300);
    }

    const footerCommentBtn = document.getElementById('story-footer-comment-btn');
    if (footerCommentBtn) {
        footerCommentBtn.addEventListener('click', () => {
            setCommentsMode();
        });
    }

    const storyCloseX = document.getElementById('story-close-x');
    if (storyCloseX) {
        storyCloseX.addEventListener('click', closeReaderModal);
    }

    if (backToStoryBtn) {
        backToStoryBtn.addEventListener('click', () => {
            setStoryMode();
        });
    }

    // --- Supabase ---
    const SUPABASE_URL = 'https://lezmniypicjcbyetucvz.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxlem1uaXlwaWNqY2J5ZXR1Y3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTg4MDgsImV4cCI6MjA5MDI5NDgwOH0.Q5UHhIr_wd2XqNFQJKu2F2hfAjsrm-RhjbU8PNRhfo8';
    const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const saveToDB = async (storeName, data) => {
        if (storeName === 'comments') {
            const { error: commentError } = await _supabase
                .from('comments')
                .insert([{
                    store_name: data.storeName,
                    post_id: data.postId,
                    author: data.author,
                    text: data.text,
                    date: data.date
                }]);
            if (commentError) throw commentError;
            return;
        }

        const { error } = await _supabase
            .from('posts')
            .insert([{
                store_name: storeName,
                title: data.title || '',
                content: data.content || '',
                media_url: data.media_url || '',
                date: data.date,
                is_warning: data.is_warning || false
            }]);

        if (error) throw error;
    };

    const loadFromDB = async (storeName) => {
        const { data, error } = await _supabase
            .from('posts')
            .select('*')
            .eq('store_name', storeName)
            .eq('is_deleted', false) // Only load active posts
            .order('id', { ascending: false });
        if (error) return [];
        return data;
    };

    const loadCommentsForPost = async (storeName, postId) => {
        const { data, error } = await _supabase
            .from('comments')
            .select('*')
            .eq('store_name', storeName)
            .eq('post_id', postId)
            .eq('is_deleted', false) // Only load active comments
            .order('date', { ascending: false });
        if (error) return [];
        return data;
    };

    function timeAgo(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        if (seconds < 10) return "just now";
        return Math.floor(seconds) + " seconds ago";
    }

    const defaultData = {
        'hashim': { name: "System Override", bio: "Welcome to the matrix...", wallpaper: null },
        'sadeen': { name: "sadeen 🌸", bio: "Hii! 🌸 Welcome to my story!", wallpaper: null }
    };

    async function loadProfileData() {
        let savedBio, savedName, savedWallpaper;
        try {
            const { data } = await _supabase
                .from('profiles')
                .select('*')
                .eq('username', currentStory)
                .single();
            if (data) {
                savedBio = data.bio || defaultData[currentStory].bio;
                savedName = data.full_name || defaultData[currentStory].name;
                savedWallpaper = data.wallpaper || null;
            } else {
                savedBio = defaultData[currentStory].bio;
                savedName = defaultData[currentStory].name;
                savedWallpaper = null;
            }
        } catch (e) {
            savedBio = defaultData[currentStory].bio;
            savedName = defaultData[currentStory].name;
        }

        bioText.textContent = savedBio;
        if (igFullname) igFullname.textContent = savedName;

        if (savedWallpaper) {
            const isVideo = savedWallpaper.split('?')[0].toLowerCase().match(/\.(mp4|webm|mov|m4v|ogv)$/);
            
            if (isVideo) {
                if (wallpaperVideo) {
                    wallpaperVideo.src = savedWallpaper;
                    wallpaperVideo.classList.remove('hidden');
                    wallpaperVideo.play().catch(e => console.log("Autoplay blocked:", e));
                }
                storyContainer.style.backgroundImage = 'none';
                document.body.style.backgroundImage = 'none';
                storyContainer.classList.add('has-wallpaper');
            } else {
                if (wallpaperVideo) {
                    wallpaperVideo.pause();
                    wallpaperVideo.src = '';
                    wallpaperVideo.classList.add('hidden');
                }
                storyContainer.style.backgroundImage = `url(${savedWallpaper})`;
                storyContainer.style.backgroundSize = 'cover';
                storyContainer.style.backgroundPosition = 'center';
                storyContainer.classList.add('has-wallpaper');
                document.body.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${savedWallpaper})`;
                document.body.style.backgroundSize = 'cover';
                document.body.style.backgroundPosition = 'center';
                document.body.style.backgroundAttachment = 'fixed';
            }
        } else {
            if (wallpaperVideo) {
                wallpaperVideo.pause();
                wallpaperVideo.src = '';
                wallpaperVideo.classList.add('hidden');
            }
            storyContainer.style.backgroundImage = 'none';
            storyContainer.classList.remove('has-wallpaper');
            document.body.style.backgroundImage = '';
        }

        const isOwner = ownerAccounts.some(acc => String(acc).toUpperCase() === String(currentUser).toUpperCase());
        if (isOwner) {
            if (editBioBtn) editBioBtn.classList.remove('hidden');
            if (shareProfileBtn) shareProfileBtn.classList.remove('hidden');
        } else {
            if (editBioBtn) editBioBtn.classList.add('hidden');
            if (shareProfileBtn) shareProfileBtn.classList.add('hidden');
        }

        storyContainer.classList.remove('hidden');
        storyContainer.classList.add('active');
        storyContainer.style.display = 'block';

        const category = window.CURRENT_CATEGORY || 'story';
        document.querySelectorAll('.ig-tab').forEach(t => t.classList.remove('active'));
        const activeTab = document.getElementById('tab-' + category + 's');
        if (activeTab) activeTab.classList.add('active');

        loadGridContent(category);
    }

    function getCategoryFromTab(tabId) {
        if (tabId === 'tab-stories' || tabId === 'link-stories') return 'story';
        if (tabId === 'tab-photos' || tabId === 'link-photos' || tabId === 'tab-videos' || tabId === 'link-videos') return 'photo';
        if (tabId === 'tab-questions' || tabId === 'link-questions') return 'question';
        return 'story';
    }

    async function loadGridContent(category) {
        const storeName = `user_${category}s_${currentStory}`;
        let items = [];
        try { items = await loadFromDB(storeName); } catch (e) { }

        const addBtn = document.getElementById('add-post-btn');
        const isOwner = ownerAccounts.some(acc => String(acc).toUpperCase() === String(currentUser).toUpperCase());
        gridContainer.innerHTML = '';

        if (addBtn && isOwner) {
            addBtn.classList.remove('hidden');
            const addLabel = addBtn.querySelector('span');
            if (addLabel) addLabel.textContent = 'Add ' + category.charAt(0).toUpperCase() + category.slice(1);
            gridContainer.appendChild(addBtn);
        }

        items.forEach((data, index) => {
            const item = document.createElement('div');
            item.className = 'ig-grid-item';
            item.style.display = 'flex';
            item.style.flexDirection = 'column';
            item.style.justifyContent = 'center';
            item.style.alignItems = 'center';
            item.style.padding = '0.5rem';
            item.style.cursor = 'pointer';

            let icon = '📖';
            if (data.is_warning) {
                icon = '🚨🔞';
                item.classList.add('warning-post');
            } else {
                if (category === 'photo') {
                    const mediaUrl = data.media_url || data.video_url;
                    const isVideo = mediaUrl && mediaUrl.split('?')[0].toLowerCase().match(/\.(mp4|webm|mov|m4v|ogv)$/);
                    if (isVideo) {
                        icon = '🎬';
                    } else {
                        icon = '🖼️';
                    }
                }
                if (category === 'question') icon = '❓';
            }

            item.innerHTML = `<span style="font-size:1.5rem;margin-bottom:5px;">${icon}</span><strong style="display:block;margin-bottom:2px;">${data.title}</strong><span style="opacity:0.7;font-size:0.7rem;">Click to view</span>`;

            // Soft Delete Post (Owners Only)
            if (isOwner) {
                const delBtn = document.createElement('button');
                delBtn.className = 'delete-post-btn';
                delBtn.innerHTML = '×';
                delBtn.onclick = async (e) => {
                    e.stopPropagation(); // Don't open the post
                    if (confirm("Are you sure you want to hide this post?")) {
                        try {
                            await _supabase.from('posts').update({ is_deleted: true }).eq('id', data.id);
                            loadGridContent(category);
                        } catch (err) { alert("Failed to delete post."); }
                    }
                };
                item.appendChild(delBtn);
            }

            item.onclick = async () => {
                currentOpenPost = { category, id: data.id, storeName };
                
                // Toggle Warning Mode
                if (data.is_warning && readerPanel) {
                    readerPanel.classList.add('warning-mode');
                } else if (readerPanel) {
                    readerPanel.classList.remove('warning-mode');
                }

                readerTitle.textContent = data.title;
                readerContent.textContent = data.content;

                let profileName = defaultData[currentStory] ? defaultData[currentStory].name : currentStory;
                try {
                    const { data: profile } = await _supabase.from('profiles').select('full_name').eq('username', currentStory).single();
                    if (profile) profileName = profile.full_name || profileName;
                } catch (e) { }

                if (readerAuthorName) readerAuthorName.textContent = profileName;
                if (readerAvatar) readerAvatar.textContent = profileName.charAt(0).toUpperCase();
                if (readerPostDate) readerPostDate.textContent = timeAgo(data.date);
                if (captionAuthorName) captionAuthorName.textContent = profileName;
                if (captionAvatar) captionAvatar.textContent = profileName.charAt(0).toUpperCase();

                const textDisplay = document.getElementById('text-display');
                const tdTitle = document.getElementById('td-title');
                const tdContent = document.getElementById('td-content');
                const tdAvatar = document.getElementById('td-avatar');
                const tdName = document.getElementById('td-name');
                const tdDate = document.getElementById('td-date');
                const currentCategory = window.CURRENT_CATEGORY || 'story';

                if (currentCategory === 'photo') {
                    const mediaUrl = data.media_url || data.video_url;
                    if (mediaUrl && mediaUrl !== 'EMPTY') {
                        const isVideo = mediaUrl.split('?')[0].toLowerCase().match(/\.(mp4|webm|mov|m4v|ogv)$/);
                        if (isVideo) {
                            if (playerVideo) {
                                playerVideo.src = mediaUrl;
                                if (videoContainer) { videoContainer.classList.remove('hidden'); videoContainer.style.display = 'flex'; }
                            }
                            if (playerPhoto) { playerPhoto.src = ''; if (photoContainer) photoContainer.classList.add('hidden'); }
                        } else {
                            if (playerPhoto) {
                                playerPhoto.src = mediaUrl;
                                if (photoContainer) { photoContainer.classList.remove('hidden'); photoContainer.style.display = 'flex'; }
                            }
                            if (playerVideo) { playerVideo.src = ''; if (videoContainer) videoContainer.classList.add('hidden'); }
                        }
                        if (textDisplay) textDisplay.classList.remove('active');
                    } else {
                        if (playerPhoto) playerPhoto.src = '';
                        if (photoContainer) photoContainer.classList.add('hidden');
                        if (playerVideo) playerVideo.src = '';
                        if (videoContainer) videoContainer.classList.add('hidden');
                        if (textDisplay) {
                            tdTitle.textContent = data.title;
                            tdContent.textContent = data.content + "\n\n(No media found in database)";
                            textDisplay.classList.add('active');
                        }
                    }
                    const storyTitle = document.getElementById('story-view-title');
                    if (storyTitle) storyTitle.textContent = data.title;
                    setStoryMode();
                } else {
                    if (playerVideo) playerVideo.src = '';
                    if (videoContainer) videoContainer.classList.add('hidden');
                    if (playerPhoto) playerPhoto.src = '';
                    if (photoContainer) photoContainer.classList.add('hidden');
                    if (textDisplay) {
                        tdTitle.textContent = data.title;
                        tdContent.textContent = data.content;
                        tdAvatar.textContent = profileName.charAt(0).toUpperCase();
                        tdName.textContent = profileName;
                        tdDate.textContent = timeAgo(data.date);
                        textDisplay.classList.add('active');
                        const storyTitle = document.getElementById('story-view-title');
                        if (storyTitle) storyTitle.textContent = data.title;
                    }
                    setStoryMode();
                }

                renderComments();
                storyReaderModal.classList.remove('hidden');
                setTimeout(() => storyReaderModal.classList.add('active'), 10);
            };
            gridContainer.appendChild(item);
        });
    }

    if (backToChoicesBtn) { backToChoicesBtn.addEventListener('click', () => { window.location.href = 'choices.html'; }); }

    if (editWallpaperFile) {
        editWallpaperFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Client-side size check (e.g., 200MB limit)
                if (file.size > 200 * 1024 * 1024) {
                    alert("This file is too big (over 200MB)! Please choose a smaller video or increase your Supabase limit.");
                    editWallpaperFile.value = '';
                    fileNameDisplay.textContent = 'No file chosen';
                    return;
                }

                fileNameDisplay.textContent = file.name;
                selectedWallpaperBlob = file;
                const isVideo = file.type.startsWith('video/');
                
                if (isVideo) {
                    const videoUrl = URL.createObjectURL(file);
                    if (wallpaperPreviewVideo) {
                        wallpaperPreviewVideo.src = videoUrl;
                        wallpaperPreviewVideo.classList.remove('hidden');
                    }
                    if (wallpaperPreviewImg) wallpaperPreviewImg.classList.add('hidden');
                    wallpaperPreviewContainer.classList.remove('hidden');
                } else {
                    const reader = new FileReader();
                    reader.onload = function (event) {
                        if (wallpaperPreviewImg) {
                            wallpaperPreviewImg.src = event.target.result;
                            wallpaperPreviewImg.classList.remove('hidden');
                        }
                        if (wallpaperPreviewVideo) {
                            wallpaperPreviewVideo.pause();
                            wallpaperPreviewVideo.src = '';
                            wallpaperPreviewVideo.classList.add('hidden');
                        }
                        wallpaperPreviewContainer.classList.remove('hidden');
                    };
                    reader.readAsDataURL(file);
                }
            }
        });
    }

    if (clearWallpaperBtn) {
        clearWallpaperBtn.addEventListener('click', () => {
            uploadedWallpaper = null;
            selectedWallpaperBlob = null;
            editWallpaperFile.value = '';
            fileNameDisplay.textContent = 'No file chosen';
            if (wallpaperPreviewContainer) wallpaperPreviewContainer.classList.add('hidden');
            if (wallpaperPreviewImg) { wallpaperPreviewImg.src = ''; wallpaperPreviewImg.classList.add('hidden'); }
            if (wallpaperPreviewVideo) {
                wallpaperPreviewVideo.pause();
                wallpaperPreviewVideo.src = '';
                wallpaperPreviewVideo.classList.add('hidden');
            }
        });
    }

    if (editBioBtn) {
        editBioBtn.addEventListener('click', async () => {
            let savedName = defaultData[currentStory].name;
            let savedBio = defaultData[currentStory].bio;
            let savedWallpaper = null;
            try {
                const { data } = await _supabase.from('profiles').select('*').eq('username', currentStory).single();
                if (data) { savedName = data.full_name || savedName; savedBio = data.bio || savedBio; savedWallpaper = data.wallpaper || null; }
            } catch (e) { }
            editName.value = savedName; bioEditor.value = savedBio; 
            uploadedWallpaper = savedWallpaper;
            selectedWallpaperBlob = null;

            if (uploadedWallpaper && wallpaperPreviewContainer) {
                const isVideo = uploadedWallpaper.split('?')[0].toLowerCase().match(/\.(mp4|webm|mov|m4v|ogv)$/);
                if (isVideo) {
                    if (wallpaperPreviewVideo) {
                        wallpaperPreviewVideo.src = uploadedWallpaper;
                        wallpaperPreviewVideo.classList.remove('hidden');
                    }
                    if (wallpaperPreviewImg) wallpaperPreviewImg.classList.add('hidden');
                } else {
                    if (wallpaperPreviewImg) {
                        wallpaperPreviewImg.src = uploadedWallpaper;
                        wallpaperPreviewImg.classList.remove('hidden');
                    }
                    if (wallpaperPreviewVideo) wallpaperPreviewVideo.classList.add('hidden');
                }
                wallpaperPreviewContainer.classList.remove('hidden');
            } else {
                if (wallpaperPreviewContainer) wallpaperPreviewContainer.classList.add('hidden');
            }

            editModal.classList.remove('hidden'); setTimeout(() => editModal.classList.add('active'), 10);
        });
    }

    if (saveBioBtn) {
        saveBioBtn.addEventListener('click', async () => {
            saveBioBtn.disabled = true;
            const originalText = saveBioBtn.textContent;
            saveBioBtn.textContent = 'Saving...';

            let wallpaperToSave = uploadedWallpaper;

            if (selectedWallpaperBlob) {
                console.log("Starting wallpaper upload for:", selectedWallpaperBlob.name);
                try {
                    // Sanitize filename to avoid "Invalid key" errors from special characters/spaces
                    const cleanFileName = selectedWallpaperBlob.name.replace(/[^a-zA-Z0-9.]/g, '_');
                    const fileName = `wallpaper_${currentStory}_${Date.now()}_${cleanFileName}`;
                    
                    const { data: uploadData, error: uploadError } = await _supabase.storage.from('videos').upload(fileName, selectedWallpaperBlob);
                    if (!uploadError && uploadData) {
                        const { data: urlData } = _supabase.storage.from('videos').getPublicUrl(fileName);
                        wallpaperToSave = urlData.publicUrl;
                        console.log("Upload success, public URL:", wallpaperToSave);
                    } else {
                        console.error("Storage upload error:", uploadError);
                        alert("Storage Error: " + (uploadError.message || "Unknown error") + " - Check your bucket permissions!");
                    }
                } catch (e) {
                    console.error("Upload exception:", e);
                    alert("Upload Exception: " + e.message);
                }
            }

            console.log("Upserting profile for:", currentStory, "with wallpaper:", wallpaperToSave);
            try {
                const { error: upsertError } = await _supabase.from('profiles').upsert({ 
                    username: currentStory,
                    bio: bioEditor.value.trim(), 
                    full_name: editName.value.trim(), 
                    wallpaper: wallpaperToSave || '' 
                }, { onConflict: 'username' });

                if (upsertError) {
                    console.error("Database upsert error:", upsertError);
                    alert("Database Error: " + upsertError.message);
                } else {
                    console.log("Profile saved successfully!");
                    alert("Profile saved successfully!");
                }
            } catch (e) { 
                console.error("Save exception:", e);
                alert("Failed to save profile: " + e.message); 
            } finally {
                saveBioBtn.disabled = false;
                saveBioBtn.textContent = originalText;
                await loadProfileData();
                editModal.classList.remove('active'); 
                setTimeout(() => editModal.classList.add('hidden'), 300);
                selectedWallpaperBlob = null; // Clear blob after successful save
            }
        });
    }

    if (addPostBtn) {
        addPostBtn.addEventListener('click', () => {
            storyTitleInput.value = ''; storyContentInput.value = ''; storyVideoFile.value = ''; videoNameDisplay.textContent = 'No media chosen'; selectedVideoBlob = null;
            const category = window.CURRENT_CATEGORY || 'story';
            if (category === 'photo') {
                videoUploadSection.classList.remove('hidden');
                const uploadLabel = videoUploadSection.querySelector('.modal-label');
                if (uploadLabel) uploadLabel.textContent = 'Upload Media (Photo or Video)';
                if (storyVideoFile) storyVideoFile.setAttribute('accept', 'image/*,video/*');
            } else {
                videoUploadSection.classList.add('hidden');
            }
            addStoryModal.classList.remove('hidden'); setTimeout(() => addStoryModal.classList.add('active'), 10);
        });
    }

    if (storyVideoFile) {
        storyVideoFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Client-side size check (e.g., 200MB limit)
                if (file.size > 200 * 1024 * 1024) {
                    alert("This file is too big (over 200MB)! Please choose a smaller video or increase your Supabase limit.");
                    storyVideoFile.value = '';
                    videoNameDisplay.textContent = 'No media chosen';
                    return;
                }
                videoNameDisplay.textContent = file.name; 
                selectedVideoBlob = file; 
            }
        });
    }

    if (cancelStoryBtn) { cancelStoryBtn.addEventListener('click', () => { addStoryModal.classList.remove('active'); setTimeout(() => addStoryModal.classList.add('hidden'), 300); }); }

    const performPost = async (isWarning = false) => {
        const title = storyTitleInput.value.trim();
        const content = storyContentInput.value.trim();
        const category = window.CURRENT_CATEGORY || 'story';

        if (!title) { alert("Please enter a title!"); return; }
        if (category === 'photo' && !selectedVideoBlob) { alert("Please select a photo/video first!"); return; }

        const btnToDisable = isWarning ? warningStoryBtn : saveStoryBtn;
        const originalText = btnToDisable.textContent;
        
        btnToDisable.disabled = true;
        btnToDisable.textContent = 'Uploading...';

        const storeName = `user_${category}s_${currentStory}`;
        const data = { title, content, date: new Date().toISOString(), media_url: '', is_warning: isWarning };

        if (category === 'photo' && selectedVideoBlob) {
            try {
                // Sanitize filename to avoid "Invalid key" errors from special characters/spaces
                const cleanFileName = selectedVideoBlob.name.replace(/[^a-zA-Z0-9.]/g, '_');
                const fileName = `${Date.now()}_${cleanFileName}`;
                
                const { data: uploadData, error: uploadError } = await _supabase.storage.from('videos').upload(fileName, selectedVideoBlob);
                if (!uploadError && uploadData) {
                    const { data: urlData } = _supabase.storage.from('videos').getPublicUrl(fileName);
                    data.media_url = urlData.publicUrl;
                } else {
                    console.error("Storage upload error:", uploadError);
                    alert("Storage Error: " + (uploadError.message || "Unknown error") + " - Please check your bucket policies in Supabase!");
                    btnToDisable.disabled = false; btnToDisable.textContent = originalText; return;
                }
            } catch (e) { 
                console.error("Upload exception:", e);
                alert("Upload Exception: " + e.message);
                btnToDisable.disabled = false; btnToDisable.textContent = originalText; return; 
            }
        }

        try {
            await saveToDB(storeName, data);
            alert(`${isWarning ? 'Warning post' : category.charAt(0).toUpperCase() + category.slice(1)} posted successfully!`);
            storyTitleInput.value = ''; storyContentInput.value = '';
            selectedVideoBlob = null; videoNameDisplay.textContent = 'No photo chosen';
            await loadGridContent(category);
            addStoryModal.classList.remove('active'); setTimeout(() => addStoryModal.classList.add('hidden'), 300);
        } catch (err) { alert("Database error!"); } finally { btnToDisable.disabled = false; btnToDisable.textContent = originalText; }
    };

    if (saveStoryBtn) {
        saveStoryBtn.addEventListener('click', () => performPost(false));
    }
    
    if (warningStoryBtn) {
        warningStoryBtn.addEventListener('click', () => performPost(true));
    }

    if (closeReaderBtn) { closeReaderBtn.addEventListener('click', closeReaderModal); }

    if (postCommentBtn) {
        postCommentBtn.addEventListener('click', async () => {
            const input = document.getElementById('comment-input');
            const text = input ? input.value.trim() : "";
            if (!text || !currentOpenPost) return;
            try {
                await saveToDB('comments', { storeName: currentOpenPost.storeName, postId: currentOpenPost.id, author: currentUser || "Guest", text: text, date: new Date().toISOString() });
                input.value = ''; await renderComments();
            } catch (e) { alert("Failed to save comment."); }
        });
    }

    async function renderComments() {
        if (!currentOpenPost) return;
        const comments = await loadCommentsForPost(currentOpenPost.storeName, currentOpenPost.id);
        actualComments.innerHTML = '';
        if (comments.length === 0) {
            actualComments.innerHTML = '<p style="opacity:0.5; font-size:0.8rem;">No comments yet. Be the first!</p>';
            return;
        }
        comments.forEach(c => {
            const div = document.createElement('div');
            div.style.marginBottom = '1.2rem'; div.style.background = 'rgba(167, 70, 70, 0.08)'; div.style.padding = '1rem'; div.style.borderRadius = '12px'; div.style.border = '1px solid rgba(255,255,255,0.1)';
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items: center; margin-bottom: 0.5rem;">
                    <div style="display:flex; align-items:center; gap: 0.5rem;">
                        <div style="width:24px; height:24px; border-radius:50%; background:var(--accent-1); display:flex; align-items:center; justify-content:center; font-size:0.6rem; font-weight:800; color:white;">${String(c.author).charAt(0).toUpperCase()}</div>
                        <strong style="font-size:0.9rem; color: #fff;">${c.author}</strong>
                    </div>
                    <div style="display:flex; align-items:center;">
                        <span style="font-size:0.75rem; opacity:0.6; font-weight: 500;">${timeAgo(c.date)}</span>
                        ${(c.author === currentUser || ownerAccounts.includes(currentUser)) ? `
                            <button class="comment-delete-btn" onclick="handleDeleteComment(${c.id})">Delete</button>
                        ` : ''}
                    </div>
                </div>
                <p style="font-size:0.95rem; line-height:1.5; color: rgba(255,255,255,0.9);">${c.text}</p>`;
            actualComments.appendChild(div);
        });
    }

    const tabs = document.querySelectorAll('.ig-tab');
    tabs.forEach(tab => { tab.addEventListener('click', () => {
        const category = getCategoryFromTab(tab.id);
        const userPrefix = currentStory.toLowerCase();
        let targetFile = userPrefix + '.html';
        if (category === 'photo') targetFile = userPrefix + '_photos.html';
        if (category === 'question') targetFile = userPrefix + '_ask.html';
        window.location.href = targetFile;
    }); });

    window.handleDeleteComment = async (commentId) => {
        if (confirm("Delete this comment?")) {
            try {
                await _supabase.from('comments').update({ is_deleted: true }).eq('id', commentId);
                renderComments();
            } catch (e) { alert("Failed to delete comment."); }
        }
    };

    loadProfileData();
});
