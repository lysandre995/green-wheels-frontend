document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login');

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const formData = new FormData(loginForm);
            const data = {
                username: formData.get('username'),
                password: formData.get('password')
            };

            fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.token) {
                    // Save token in localStorage
                    localStorage.setItem('authToken', data.token);
                    window.location.href = '../';
                } else {
                    alert('Login failed: ' + data.message);
                }
            })
            .catch(error => console.error('Error logging in:', error));
        });
    }
});
