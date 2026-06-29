document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const loginContainer = document.getElementById('login-container');

    // Supabase Cloud Database
    const SUPABASE_URL = 'https://lezmniypicjcbyetucvz.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxlem1uaXlwaWNqY2J5ZXR1Y3Z6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTg4MDgsImV4cCI6MjA5MDI5NDgwOH0.Q5UHhIr_wd2XqNFQJKu2F2hfAjsrm-RhjbU8PNRhfo8';
    const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // If already logged in, skip login
    if (localStorage.getItem('currentUser')) {
        window.location.href = 'choices.html';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        // Reset error state
        errorMessage.classList.remove('show');
        loginContainer.classList.remove('shake');

        // Disable button while checking
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.querySelector('span').textContent;
        submitBtn.querySelector('span').textContent = 'Checking...';
        submitBtn.disabled = true;

        try {
            // Check credentials from the cloud database
            const { data, error } = await _supabase
                .from('profiles')
                .select('username, password')
                .eq('username', username)
                .single();

            if (error || !data || data.password !== password) {
                // Login failed
                handleLoginError();
            } else {
                // Login success!
                localStorage.setItem('currentUser', data.username);
                window.location.href = 'choices.html';
            }
        } catch (err) {
            console.error('Login error:', err);
            handleLoginError();
        }

        // Re-enable button
        submitBtn.querySelector('span').textContent = originalText;
        submitBtn.disabled = false;
    });

    function handleLoginError() {
        errorMessage.classList.add('show');
        void loginContainer.offsetWidth; 
        loginContainer.classList.add('shake');
        setTimeout(() => {
            loginContainer.classList.remove('shake');
        }, 500);
    }
});
