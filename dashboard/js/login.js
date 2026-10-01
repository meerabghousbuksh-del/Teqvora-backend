var form = document.getElementById('loginForm');
var errorBox = document.getElementById('loginError');
var button = document.getElementById('loginButton');

form.addEventListener('submit', async function (event) {
    event.preventDefault();
    button.disabled = true;
    errorBox.textContent = '';

    try {
        var response = await fetch(window.API_BASE + '/api/auth/login', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            })
        });
        var result = await response.json();

        if (!response.ok) throw new Error(result.message);
        window.location.href = 'index.html';
    } catch (error) {
        errorBox.textContent = error instanceof TypeError ? 'Could not reach the server.' : error.message;
        button.disabled = false;
    }
});
