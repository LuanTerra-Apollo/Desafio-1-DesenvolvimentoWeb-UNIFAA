let tbody = document.querySelector("table>tbody");
let btnAdicionar = document.querySelector("#btn-adicionar");
let btnLogout = document.querySelector("#icone-logout");
let btnClose = document.querySelector("btn-close");
let alertContainer = document.querySelector("#alert-container");
let alertElement = document.createElement('div');

VerificarTokenLocalHost();

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
        showAlert('Os campos nome, quantidade e valor são obrigatórios!', 'warning');
        return;
    }

    modoEdicao ?
        atualizarProdutoNaAPI(produto) :
        cadastrarProdutoNaAPI(produto);
})

function apiRequest(url, method, body = null) {
    fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("authToken"),
        },
        body: body ? JSON.stringify(body) : null,
    }).then(
        (response) => {
            return response.json();
        }
    ).then((data) => {
        return data;
    }).catch(function (error) {
        console.log(error);
        throw error;
    });
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

async function cadastrarProdutoNaAPI(produto) {
    try {
        await apiRequest('http://localhost:3400/produtos', 'POST', produto);
        showAlert('Produto cadastrado com sucesso', 'success');
        obterProdutosDaAPI();
        limparCampos();
    } catch (e) {
        showAlert('Não foi possível cadastrar o produto', 'danger');
    }
}

async function atualizarProdutoNaAPI(produto) {

    try {
        await apiRequest(`http://localhost:3400/produtos/${produto.id}`, 'PUT', produto);
        showAlert('Produto atualizado com sucesso', 'success');
        atualizarProdutoNaTela(new Produto(produto), false);
        fecharModal();
    } catch (e) {
        showAlert('Não foi possível atualizar o produto', 'danger');
    }
}

async function deletarProdutoNaAPI(produto) {
    try {
        await apiRequest(`http://localhost:3400/produtos/${produto.id}`, 'DELETE');
        showAlert('Produto deletado com sucesso', 'success');
        atualizarProdutoNaTela(new Produto(produto), true);
    } catch (e) {
        showAlert('Não foi possível deletar o produto!', 'danger');
    }
}

function obterProdutosDaAPI() {
    fetch('http://localhost:3400/produtos', {
        headers: {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("authToken"),
        },
    })
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


    document.getElementById('confirmModalOk').onclick = function () {
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

function VerificarTokenLocalHost() {
    if (localStorage.getItem("authToken") == null) {
        window.location.href = "/login.html";
    }
}