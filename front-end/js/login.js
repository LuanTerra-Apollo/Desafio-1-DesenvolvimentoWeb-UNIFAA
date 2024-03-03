document.addEventListener('DOMContentLoaded', () => {
    const form = {
        email: document.querySelector('#input-email'),
        senha: document.querySelector('#input-senha'),
        btnEntrar: document.querySelector('#btn-entrar'),
    };

    form.btnEntrar.addEventListener('click', () => {
        const usuario = {
            email: form.email.value,
            senha: form.senha.value
        };
        
        if(!usuario.email || !usuario.senha) {
            alert('Os campos usuário e senha são obrigatórios');
            return;
        }
    
        console.log(usuario)
        
        login(usuario);
    });
    
    // Verificação do token de autenticação após o DOM estar completamente carregado
    verificarTokenNoLocalStorage();
});     

function verificarTokenNoLocalStorage() {
    const token = localStorage.getItem('authToken');
    
    if(token) {
        // Verifique se a página atual é a página de login para evitar redirecionamento infinito
        if (window.location.pathname !== '/login.html') {
            window.location.href = "gerenciador-de-produtos.html";
        }
    } else {
        if (window.location.pathname !== '/login.html') {
            window.location.href = "login.html";
        }
    }
}

function login(usuario) {
    fetch('http://localhost:3400/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuario)
    })
 .then(response => response.json())
 .catch((error) => {
    console.log(error);
  })
 .then((data) => {
    console.log(data);
    localStorage.setItem('authToken', data.token);
    window.location.href = "gerenciador-de-produtos.html";
  });
}
