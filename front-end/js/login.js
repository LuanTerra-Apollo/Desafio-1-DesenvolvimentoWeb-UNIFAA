
var loginForm = document.getElementById("loginForm");
let alertContainer = document.querySelector("#alert-container");
let alertElement = document.createElement('div');

VerificarTokenLocalHost();

loginForm.addEventListener("submit" , function(e) {
    e.preventDefault();

    var campoEmail = document.querySelector('#input-email');
    var campoSenha = document.querySelector('#input-senha');

    let emailDigitado = campoEmail.value.toLowerCase();
    let senhaDigitada = campoSenha.value.toLowerCase();

    if(!emailDigitado || !senhaDigitada) {
        showAlert('Os campos de e-mail e senha são obrigatórios!', 'warning');
        return;
    }
    
    login(emailDigitado, senhaDigitada);
    
})

function login(email, senha) {

    const URL = 'http://localhost:3400/login';

    fetch(URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            senha: senha
        })
    })
 .then(response => response = response.json())
 .then(response => {
    console.log(response);

    if(!!response.mensagem) {
        showAlert(response.mensagem, 'danger');
        return;
    }

    localStorage.setItem('authToken', response.token);
    window.open("gerenciador-de-produtos.html", '_self');
 })
 .catch((error) => {
    console.log(error);
  })
}

function showAlert(message, type = 'warning') {
    alertElement.className = `alert alert-${type}`;
    alertElement.role = 'alert';
    alertElement.textContent = message;
    alertContainer.appendChild(alertElement);
    setTimeout(() => {
        alertContainer.removeChild(alertElement);
    }, 3000);
}

function VerificarTokenLocalHost() {
    const token = localStorage.getItem('authToken');
    if(token) {
        window.open("gerenciador-de-produtos.html", '_self');
    }
}