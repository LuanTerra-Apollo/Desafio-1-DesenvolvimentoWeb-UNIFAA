

var campoEmail = document.querySelector('#input-email');
var campoSenha = document.querySelector('#input-senha');
var btnEntrar = document.querySelector('#btn-entrar');

btnEntrar.addEventListener('click', () => {
    let emailDigitado = campoEmail.value.toLowerCase();
    let senhaDigitada = campoSenha.value.toLowerCase();
    
    if(!emailDigitado || !senhaDigitada) {
        alert('Os campos usuário e senha são obrigatórios');
        return;
    }
    
    login(emailDigitado, senhaDigitada);
});

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
        alert(response.mensagem);
        return;
    }

    localStorage.setItem('authToken', response.token);
    window.open("gerenciador-de-produtos.html", '_self');
 })
 .catch((error) => {
    console.log(error);
  })
}
