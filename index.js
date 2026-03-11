let API_BASE_URL = localStorage.getItem("API_URL") || "https://solid-fortnight-69qq966x7p6v344xw-5000.app.github.dev";
let todosOsProdutos = [];
let carrinho = [];

document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("usuario_logado"));
    if (user) mostrarAreaLogada(user);
});

async function loginUsuario() {
    const numero = document.getElementById("u-login-num").value;
    const senha = document.getElementById("u-login-pass").value;
    const res = await fetch(`${API_BASE_URL}/api/login_usuario`, {
        method: "POST", 
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({ numero, senha })
    });
    const dados = await res.json();
    if(res.ok) {
        localStorage.setItem("usuario_logado", JSON.stringify(dados));
        mostrarAreaLogada(dados);
    } else alert("RA ou Senha incorretos!");
}

function mostrarAreaLogada(dados) {
    document.getElementById("auth-usuario").classList.add("escondido");
    document.getElementById("area-publica").classList.remove("escondido");
    document.getElementById("container-carrinho").classList.remove("escondido");
    document.getElementById("user-info").innerText = `Olá, ${dados.nome}`;

    if (!dados.contato || dados.contato === "") {
        document.getElementById("aviso-contato").classList.remove("escondido");
    }
    carregarPrecos();
}

async function abrirPromptContato() {
    const novo = prompt("Digite seu WhatsApp ou Instagram:");
    if (novo) {
        const user = JSON.parse(localStorage.getItem("usuario_logado"));
        const res = await fetch(`${API_BASE_URL}/api/usuarios/atualizar_contato`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({ numero: user.numero, contato: novo })
        });
        if (res.ok) {
            user.contato = novo;
            localStorage.setItem("usuario_logado", JSON.stringify(user));
            document.getElementById("aviso-contato").classList.add("escondido");
            alert("Contato salvo!");
        }
    }
}

async function carregarPrecos() {
    const res = await fetch(`${API_BASE_URL}/api/precos`, { headers: {"ngrok-skip-browser-warning": "true"} });
    todosOsProdutos = await res.json();
    const categorias = [...new Set(todosOsProdutos.map(p => p.categoria))];
    const listaCat = document.getElementById("lista-categorias");
    listaCat.innerHTML = "";
    categorias.forEach(cat => {
        const li = document.createElement("li");
        li.innerText = cat;
        li.onclick = () => filtrarPorCategoria(cat, li);
        listaCat.appendChild(li);
    });
    if(categorias.length > 0) listaCat.children[0].click();
}

function filtrarPorCategoria(cat, el) {
    document.querySelectorAll(".sidebar li").forEach(li => li.classList.remove("ativo"));
    el.classList.add("ativo");
    document.getElementById("titulo-categoria").innerText = cat;
    const corpo = document.getElementById("corpo-tabela-publica");
    corpo.innerHTML = "";
    todosOsProdutos.filter(p => p.categoria === cat).forEach(item => {
        corpo.innerHTML += `<tr><td>${item.nome}</td><td>R$ ${item.preco.toFixed(2)}</td>
        <td><button class="btn-primario" onclick="addCar('${item.nome}', ${item.preco})">Add</button></td></tr>`;
    });
}

function addCar(nome, preco) {
    carrinho.push({nome, preco});
    document.getElementById("contagem-carrinho").innerText = carrinho.length;
    atualizarCarUI();
}

function atualizarCarUI() {
    const lista = document.getElementById("lista-carrinho");
    let total = 0; lista.innerHTML = "";
    carrinho.forEach(i => {
        total += i.preco;
        lista.innerHTML += `<li>${i.nome} <span>R$ ${i.preco.toFixed(2)}</span></li>`;
    });
    document.getElementById("valor-total").innerText = total.toFixed(2);
}

async function finalizarPedido() {
    const user = JSON.parse(localStorage.getItem("usuario_logado"));
    if (carrinho.length === 0) return;
    const res = await fetch(`${API_BASE_URL}/api/pedidos`, {
        method: "POST", 
        headers: {"Content-Type": "application/json", "ngrok-skip-browser-warning": "true"},
        body: JSON.stringify({ items: carrinho, numero: user.numero })
    });
    if (res.ok) {
        alert("Pedido enviado!");
        carrinho = [];
        document.getElementById("contagem-carrinho").innerText = "0";
        atualizarCarUI();
        toggleCarrinho();
    }
}

// Alternar entre Login e Cadastro na tela
function toggleAuth() {
    document.getElementById("login-box").classList.toggle("escondido");
    document.getElementById("cadastro-box").classList.toggle("escondido");
}

async function cadastrarUsuario() {
    const nome = document.getElementById("c-nome").value;
    const numero = document.getElementById("c-num").value;
    const contato = document.getElementById("c-contato").value;
    const senha = document.getElementById("c-pass").value;

    if(!nome || !numero || !senha) return alert("Preencha os campos obrigatórios!");

    const res = await fetch(`${API_BASE_URL}/api/cadastrar_usuario`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
        body: JSON.stringify({ nome, numero, contato, senha })
    });

    if(res.ok) {
        alert("Conta criada! Agora faça o login.");
        toggleAuth();
    } else {
        const erro = await res.json();
        alert(erro.erro || "Erro ao cadastrar");
    }
}

function toggleCarrinho() { document.getElementById("janela-carrinho").classList.toggle("escondido"); }
function limparTudo() { localStorage.clear(); location.reload(); }
