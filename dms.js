document.addEventListener('DOMContentLoaded', () => {
    const SUPABASE_URL = 'https://lezmniypicjcbyetucvz.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxlem1uaXlwaWNqY2J5ZXR1Y3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTg4MDgsImV4cCI6MjA5MDI5NDgwOH0.Q5UHhIr_wd2XqNFQJKu2F2hfAjsrm-RhjbU8PNRhfo8';
    
    // Use existing client if available, else create one
    let _supabase;
    if (typeof supabase !== 'undefined') {
        _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
        console.error("Supabase client not loaded. Please include the Supabase CDN script.");
        return;
    }

    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return; // Only show DMs when logged in

    // Inject DM UI
    const dmUI = `
        <div class="dms-trigger" id="dms-trigger">
            <svg viewBox="0 0 24 24"><path d="M20,2H4C2.9,2,2,2.9,2,4v18l4-4h14c1.1,0,2-0.9,2-2V4C22,2.9,21.1,2,20,2z M20,16H5.2L4,17.2V4h16V16z M7,9h10V7H7V9z M7,13h10v-2H7V13z"/></svg>
        </div>
        <div class="dms-window" id="dms-window">
            <div class="dms-header">
                <h3>Direct Messages</h3>
                <button class="dms-close" id="dms-close">&times;</button>
            </div>
            <div class="dms-messages" id="dms-messages"></div>
            <div class="dms-input-area">
                <input type="text" class="dms-input" id="dms-input" placeholder="Type a message...">
                <button class="dms-send-btn" id="dms-send-btn">
                    <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', dmUI);

    const trigger = document.getElementById('dms-trigger');
    const windowEl = document.getElementById('dms-window');
    const closeBtn = document.getElementById('dms-close');
    const msgContainer = document.getElementById('dms-messages');
    const input = document.getElementById('dms-input');
    const sendBtn = document.getElementById('dms-send-btn');

    let currentEditingId = null;

    // Toggle Window
    trigger.addEventListener('click', () => {
        windowEl.classList.toggle('active');
        if (windowEl.classList.contains('active')) {
            scrollToBottom();
            input.focus();
        }
    });

    closeBtn.addEventListener('click', () => {
        windowEl.classList.remove('active');
    });

    // Fetch and Display DMs
    async function fetchDMs() {
        const { data, error } = await _supabase
            .from('dms')
            .select('*')
            .order('created_at', { ascending: true })
            .limit(50);

        if (error) {
            console.error("Error fetching DMs:", error);
            return;
        }

        msgContainer.innerHTML = '';
        data.forEach(displayDM);
        scrollToBottom();
    }

    function displayDM(dm) {
        const isOwner = dm.sender === currentUser;
        const bubbleWrap = document.createElement('div');
        bubbleWrap.className = `dm-bubble-wrapper ${isOwner ? 'sent' : 'received'}`;
        bubbleWrap.id = `dm-${dm.id}`;

        const senderHtml = isOwner ? '' : `<div class="dm-sender">${dm.sender}</div>`;
        const editedTag = dm.is_edited ? `<span class="dm-edited-tag">(edited)</span>` : '';
        const historyView = dm.is_edited ? `
            <div class="dm-history-view is-edited">
                <span class="original-msg">${dm.original_message}</span> → <span>${dm.message}</span>
            </div>
        ` : '';

        bubbleWrap.innerHTML = `
            ${senderHtml}
            <div class="dm-bubble ${isOwner ? 'sent' : 'received'}" title="${isOwner ? 'Click to edit' : ''}">
                <span class="dm-text">${dm.message}</span>
                ${editedTag}
                ${historyView}
            </div>
        `;

        if (isOwner) {
            bubbleWrap.querySelector('.dm-bubble').addEventListener('click', () => startEditing(dm));
        }

        msgContainer.appendChild(bubbleWrap);
    }

    function startEditing(dm) {
        currentEditingId = dm.id;
        input.value = dm.message;
        input.classList.add('editing');
        input.placeholder = "Editing message...";
        input.focus();
        
        // Add a visual indicator for editing if not already there
        if (!document.getElementById('edit-indicator')) {
             const indicator = document.createElement('div');
             indicator.id = 'edit-indicator';
             indicator.style.fontSize = '10px';
             indicator.style.color = 'var(--accent-1)';
             indicator.style.padding = '0 1.2rem 5px';
             indicator.textContent = 'Editing mode (Enter: save, Esc: cancel)';
             windowEl.querySelector('.dms-input-area').before(indicator);
        }
    }

    function stopEditing() {
        currentEditingId = null;
        input.value = '';
        input.classList.remove('editing');
        input.placeholder = "Type a message...";
        const indicator = document.getElementById('edit-indicator');
        if (indicator) indicator.remove();
    }

    async function sendOrUpdateDM() {
        const message = input.value.trim();
        if (!message) return;

        if (currentEditingId) {
            // Edit existing DM
            const { data: originalData } = await _supabase
                .from('dms')
                .select('message')
                .eq('id', currentEditingId)
                .single();

            const { error } = await _supabase
                .from('dms')
                .update({ 
                    original_message: originalData.message,
                    message: message,
                    is_edited: true
                })
                .eq('id', currentEditingId);

            if (error) console.error("Edit error:", error);
            stopEditing();
        } else {
            // Send new DM
            const { error } = await _supabase
                .from('dms')
                .insert([{ sender: currentUser, message: message }]);

            if (error) console.error("Send error:", error);
            input.value = '';
        }
    }

    sendBtn.addEventListener('click', sendOrUpdateDM);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendOrUpdateDM();
    });
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && currentEditingId) stopEditing();
    });

    function scrollToBottom() {
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }

    // Real-time Subscriptions
    const sub = _supabase
        .channel('public:dms')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dms' }, payload => {
            displayDM(payload.new);
            scrollToBottom();
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'dms' }, payload => {
            const el = document.getElementById(`dm-${payload.new.id}`);
            if (el) {
                // Refresh the specific bubble
                const dm = payload.new;
                const isOwner = dm.sender === currentUser;
                const editedTag = dm.is_edited ? `<span class="dm-edited-tag">(edited)</span>` : '';
                const historyView = dm.is_edited ? `
                    <div class="dm-history-view is-edited">
                        <span class="original-msg">${dm.original_message}</span> → <span>${dm.message}</span>
                    </div>
                ` : '';
                
                el.querySelector('.dm-text').textContent = dm.message;
                const oldTag = el.querySelector('.dm-edited-tag');
                if (oldTag) oldTag.remove();
                el.querySelector('.dm-bubble').insertAdjacentHTML('beforeend', editedTag);
                
                const oldHistory = el.querySelector('.dm-history-view');
                if (oldHistory) oldHistory.remove();
                el.querySelector('.dm-bubble').insertAdjacentHTML('beforeend', historyView);
            }
        })
        .subscribe();

    fetchDMs();
});
