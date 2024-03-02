let tbody = document.querySelector("table>tbody");
let btnAdicionar = document.querySelector("#btn-adicionar");

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


form.btnSalvar.addEventListener('click', () => {
    var produto = {
        id: form.id.value,
        nome: form.nome.value,
        quantidadeEstoque: form.quantidade.value,
        valor: form.valor.value
    };

    if (!produto.nome || !produto.quantidadeEstoque || !produto.valor) {
        alert("Os campos nome, quantidade e valor são obrigatórios!");
        return;
    }

    modoEdicao ?
        atualizarProdutoNaAPI(produto) :
        cadastrarProdutoNaAPI(produto)
})

function cadastrarProdutoNaAPI(produto) {
    fetch('http://localhost:3000/produtos', {
        headers: {
            "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(produto),
    }) //endereço da
        .then(response => response.json())
        .then(response => {
            obterProdutosDaAPI();
            limparCampos();
        })
        .catch(erro => {
            console.log(erro)
            alert("Deu ruim")
        })
}

function atualizarProdutoNaAPI(produto) {

    fetch(`http://localhost:3000/produtos/${produto.id}`, {
        headers: {
            "Content-Type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify(produto),
    }) //endereço da
        .then(response => response.json())
        .then(response => {
            atualizarProdutoNaTela(new Produto(response), false)
            fecharModal();
        })
        .catch(erro => {
            console.log(erro)
            alert("Deu ruim")
        })
}

function deletarProdutoNaAPI(produto) {
    fetch(`http://localhost:3000/produtos/${produto.id}`, {
        headers: {
            "Content-Type": "application/json",
        },
        method: "DELETE",
    }) //endereço da
        .then(response => response.json())
        .then(() => {
            atualizarProdutoNaTela(produto, true)
        })
        .catch(erro => {
            console.log(erro)
            alert("Deu ruim")
        })
}

function obterProdutosDaAPI() {
    fetch('http://localhost:3000/produtos') //endereço da
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
        <button onclick="editarProduto(${produto.id})" class="btn btn-link">Editar</button> /
        <button onclick="excluirProduto(${produto.id})" class="btn btn-link">Excluir</button>`;

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
    let produto = listaProdutos.find(p => p.id == id)

    if(confirm(`Deseja excluir o produto ${produto.id} - ${produto.nome}`)){
        deletarProdutoNaAPI(produto);
    }
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