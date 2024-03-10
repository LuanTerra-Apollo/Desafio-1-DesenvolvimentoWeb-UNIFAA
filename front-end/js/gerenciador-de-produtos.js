let tbody = document.querySelector("table>tbody");
let btnAdicionar = document.querySelector("#btn-adicionar");
let btnLogout = document.querySelector("#icone-logout");
let btnClose = document.querySelector("btn-close");
let alertContainer = document.querySelector("#alert-container");
let alertElement = document.createElement('div');


let form = {
    id: document.querySelector('#id'),
    nome: document.querySelector('#nome'),
    quantidade: document.querySelector('#quantidade'),
    valor: document.querySelector('#valor'),
    btnSalvar: document.querySelector('#btn-salvar'),
    btnCancelar: document.querySelector('#btn-cancelar'),
}

let listaProdutos = [];
let modoEdicao = false;
let modalProdutos = null;

verificarTokenNoLocalStorage();

btnAdicionar.addEventListener('click', () => {
    modoEdicao = false;
    limparCampos()
    abrirModal();
})

btnLogout.addEventListener('click', () => {
    logout();
})

form.btnSalvar.addEventListener('click', () => {
    var produto = {
        id: form.id.value,
        nome: form.nome.value,
        quantidadeEstoque: form.quantidade.value,
        valor: formatarValor(form.valor.value)
    };

    if (!produto.nome || !produto.quantidadeEstoque || !produto.valor) {
        alertElement.className = "alert alert-warning";
        alertElement.role = "alert";
        alertElement.textContent = "Os campos nome, quantidade e valor são obrigatórios!";
        alertContainer.appendChild(alertElement);
        setTimeout(() => {
            alertContainer.removeChild(alertElement);
        }, 3000)
        alert("Os campos nome, quantidade e valor são obrigatórios!");
        return;
    }

    modoEdicao ?
        atualizarProdutoNaAPI(produto) :
        cadastrarProdutoNaAPI(produto);
})

function logout() {
    fetch('http://localhost:3400/logout', {
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("authToken"),
        },
        method: "DELETE",
    }).then(
        response => response.json()
        ).then(
            response => {
                localStorage.removeItem("authToken");
                window.location.href = "/login.html";
            }
    ).catch(err => console.error(err));
}

function verificarTokenNoLocalStorage() {
    const token = localStorage.getItem('authToken');
    const pathname = window.location.pathname;

    // Verifica se a página atual é a página de login ou de gerenciamento de produtos
    if (pathname === '/login.html' || pathname === '/gerenciador-de-produtos.html') {
        return; // Não redireciona se já estiver na página de login ou gerenciamento de produtos
    }

    if (token) {
        // Redireciona para a página de gerenciamento de produtos se o token estiver presente
        window.location.href = "/gerenciador-de-produtos.html";
    } else {
        // Redireciona para a página de login se o token não estiver presente
        window.location.href = "/login.html";
    }
}

function cadastrarProdutoNaAPI(produto) {
    fetch('http://localhost:3400/produtos', {
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("authToken"),
        },
        method: "POST",
        body: JSON.stringify(produto),
    }) //endereço da
        .then(response => response.json())
        .then(response => {
            obterProdutosDaAPI();
            limparCampos();
            alertElement.className = 'alert alert-success';
            alertElement.role = 'alert';
            alertElement.textContent = 'Produto cadastrado com sucesso!';
            alertContainer.appendChild(alertElement);
            setTimeout(() => {
                alertContainer.removeChild(alertElement);
            }, 3000);
        })
        .catch(erro => {
            console.log(erro)
            alertElement.className = 'alert alert-danger';
            alertElement.role = 'alert';
            alertElement.textContent = 'Não foi possível cadastrar o produto!';
            alertContainer.appendChild(alertElement);
            setTimeout(() => {
                alertContainer.removeChild(alertElement);
            }, 3000);
        })
}

function atualizarProdutoNaAPI(produto) {

    fetch(`http://localhost:3400/produtos/${produto.id}`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("authToken"),
        },
        method: "PUT",
        body: JSON.stringify(produto),
    }) //endereço da
        .then(response => response.json())
        .then(response => {
            atualizarProdutoNaTela(new Produto(response), false)
            fecharModal();
            alertElement.className = 'alert alert-success';
            alertElement.role = 'alert';
            alertElement.textContent = 'Produto atualizado com sucesso!';
            alertContainer.appendChild(alertElement);
            setTimeout(() => {
                alertContainer.removeChild(alertElement);
            }, 3000);
        })
        .catch(erro => {
            console.log(erro)
            alertElement.className = 'alert alert-danger';
            alertElement.role = 'alert';
            alertElement.textContent = 'Não foi possível atualizar o produto!';
            alertContainer.appendChild(alertElement);
            setTimeout(() => {
                alertContainer.removeChild(alertElement);
            }, 3000);
        })
}

function deletarProdutoNaAPI(produto) {
    fetch(`http://localhost:3400/produtos/${produto.id}`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("authToken"),
        },
        method: "DELETE",
    }) //endereço da
        .then(response => response.json())
        .then(() => {
            atualizarProdutoNaTela(produto, true)
            alertElement.className = 'alert alert-success';
            alertElement.role = 'alert';
            alertElement.textContent = 'Produto deletado com sucesso!';
            alertContainer.appendChild(alertElement);
            setTimeout(() => {
                alertContainer.removeChild(alertElement);
            }, 3000);
        })
        .catch(erro => {
            console.log(erro)
            alert.className = 'alert alert-danger';
            alert.role = 'alert';
            alert.textContent = 'Não foi possível deletar o produto!';
            alertContainer.appendChild(alert);
            setTimeout(() => {
                alertContainer.removeChild(alert);
            }, 3000);
        })
}

function obterProdutosDaAPI() {
    fetch('http://localhost:3400/produtos', {
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("authToken"),
        },
    }) //endereço da
        .then(response => response.json())
        .then(response => {
            listaProdutos = response.map(p => new Produto(p));
            console.log(listaProdutos)
            preencherTabela(listaProdutos);
        })
        .catch(erro => console.log(erro))
}

function atualizarProdutoNaTela(produto, deletarProduto) {
    let index = listaProdutos.findIndex(p => p.id == produto.id)

    deletarProduto ?
        listaProdutos.splice(index, 1) :
        listaProdutos.splice(index, 1, produto);

    preencherTabela(listaProdutos);

}

function preencherTabela(produtos) {

    //Limpando a tabela para receber os produtos.
    tbody.textContent = "";

    produtos.map(produto => {
        var tr = document.createElement("tr");
        var tdId = document.createElement("td");
        var tdNome = document.createElement("td");
        var tdQuantidade = document.createElement("td");
        var tdValor = document.createElement("td");
        var tdAcoes = document.createElement("td")

        tdId.textContent = produto.id;
        tdNome.textContent = produto.nome;
        tdQuantidade.textContent = produto.quantidadeEstoque;
        tdValor.textContent = aplicarMascaraParaRealComPrefixo(produto.valor);

        tdAcoes.innerHTML = `
    <i onclick="editarProduto(${produto.id})" class="fas fa-edit" style='cursor: pointer;'></i> /
    <i onclick="excluirProduto(${produto.id})" class="fas fa-trash" style='cursor: pointer;'></i>`;

        tr.appendChild(tdId);
        tr.appendChild(tdNome);
        tr.appendChild(tdQuantidade);
        tr.appendChild(tdValor);
        tr.appendChild(tdAcoes);

        tbody.appendChild(tr);
    })

}

function limparCampos() {
    form.id.value = "";
    form.nome.value = "";
    form.quantidade.value = "";
    form.valor.value = "";
}

obterProdutosDaAPI();


function AtualizarModal(produto) {
    form.id.value = produto.id;
    form.nome.value = produto.nome;
    form.quantidade.value = produto.quantidadeEstoque;
    form.valor.value = produto.valor;
}

function editarProduto(id) {
    modoEdicao = true;
    let produto = listaProdutos.find(p => p.id == id)
    AtualizarModal(produto);
    abrirModal();
}

function excluirProduto(id) {
    let produto = listaProdutos.find(p => p.id == id);


    document.querySelector('#confirmModal .modal-body p').textContent = `Deseja excluir o produto ${produto.id} - ${produto.nome}?`;


    var myModal = new bootstrap.Modal(document.getElementById('confirmModal'), {});
    myModal.show();


    document.getElementById('confirmModalOk').onclick = function() {
        deletarProdutoNaAPI(produto);
        myModal.hide(); // Fecha o modal após a confirmação
    };
}

function abrirModal() {
    if (!modalProdutos) {
        modalProdutos = new bootstrap.Modal(document.getElementById('modal-produtos'), {
            backdrop: 'static'
        });
    }
    modalProdutos.show()
}

function fecharModal() {
    if (modalProdutos) {
        modalProdutos.hide();
    }
}

function formatarValor(valor) {
    const valorString = valor.toString();

    const valorConvertido = valorString.replace(/,/g, ".");

    return valorConvertido;
}