let API_BASE_URL = localStorage.getItem("API_URL") || "https://katharyn-dextrorotatory-gavin.ngrok-free.dev/";
let carrinho = [];

document.addEventListener("DOMContentLoaded", () => {
    // Se já estiver logado, mostra os preços
    if (localStorage.getItem("usuario_nome")) {
        mostrarAreaLogada();
    }
});

// --- FUNÇÕES DE AUTENTICAÇÃO ---

async function cadastrarUsuario() {
    const numero = document.getElementById("u-cad-num").value;
    const nome = document.getElementById("u-cad-nome").value;
    const senha = document.getElementById("u-cad-pass").value;
    const msg = document.getElementById("auth-msg");

    try {
        const res = await fetch(`${API_BASE_URL}/api/cadastro`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({ numero, nome, senha })
        });

        const dados = await res.json();
        if (res.ok) {
            msg.style.color = "#00ff88";
            msg.innerText = "Cadastro realizado! Agora faça login.";
            alternarAuth('login');
        } else {
            msg.style.color = "#ff4747";
            msg.innerText = dados.erro;
        }
    } catch (e) {
        msg.innerText = "Erro ao conectar ao servidor.";
    }
}

async function loginUsuario() {
    const numero = document.getElementById("u-login-num").value;
    const senha = document.getElementById("u-login-pass").value;
    const msg = document.getElementById("auth-msg");

    try {
        const res = await fetch(`${API_BASE_URL}/api/login_usuario`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({ numero, senha })
        });

        const dados = await res.json();
        if (res.ok) {
            localStorage.setItem("usuario_nome", dados.nome);
            mostrarAreaLogada();
        } else {
            msg.style.color = "#ff4747";
            msg.innerText = dados.erro;
        }
    } catch (e) {
        msg.innerText = "Erro ao conectar ao servidor.";
    }
}

function mostrarAreaLogada() {
    const nome = localStorage.getItem("usuario_nome");
    document.getElementById("auth-usuario").classList.add("escondido");
    document.getElementById("area-publica").classList.remove("escondido");
    document.getElementById("user-info").innerHTML = `<span>Olá, ${nome}!</span> <button onclick="logoutUsuario()" class="btn-perigo" style="padding: 5px 10px; font-size: 0.7rem;">Sair</button>`;
    carregarPrecos();
}

function logoutUsuario() {
    localStorage.removeItem("usuario_nome");
    location.reload();
}

// --- CONTROLE DE UI ---

function alternarAuth(tipo) {
    const fLogin = document.getElementById("form-login");
    const fCad = document.getElementById("form-cadastro");
    const btns = document.querySelectorAll(".tab-btn");

    if (tipo === 'login') {
        fLogin.classList.remove("escondido");
        fCad.classList.add("escondido");
        btns[0].classList.add("active");
        btns[1].classList.remove("active");
    } else {
        fLogin.classList.add("escondido");
        fCad.classList.remove("escondido");
        btns[1].classList.add("active");
        btns[0].classList.remove("active");
    }
}

// --- CATÁLOGO E CARRINHO (MESMA LÓGICA ANTERIOR) ---

async function carregarPrecos() {
    const corpo = document.getElementById("corpo-tabela-publica");
    try {
        const res = await fetch(`${API_BASE_URL}/api/precos`, {
            headers: { "ngrok-skip-browser-warning": "true" }
        });
        const dados = await res.json();
        corpo.innerHTML = "";
        dados.forEach(item => {
            corpo.innerHTML += `<tr><td>${item.nome}</td><td>R$ ${item.preco.toFixed(2)}</td><td><button class="btn-primario" onclick="adicionarAoCarrinho('${item.nome}', ${item.preco})">Adicionar</button></td></tr>`;
        });
    } catch (e) {
        corpo.innerHTML = "<tr><td colspan='3'>Erro ao carregar catálogo.</td></tr>";
    }
}

// ... (Mantenha as funções de adicionarAoCarrinho, atualizarCarrinhoUI, toggleCarrinho e finalizarPedido iguais ao código anterior)
function adicionarAoCarrinho(nome, preco) {
    carrinho.push({ nome, preco });
    atualizarCarrinhoUI();
}

function atualizarCarrinhoUI() {
    const lista = document.getElementById("lista-carrinho");
    const totalSpan = document.getElementById("valor-total");
    const contagem = document.getElementById("contagem-carrinho");
    
    lista.innerHTML = "";
    let total = 0;

    carrinho.forEach(item => {
        total += item.preco;
        lista.innerHTML += `<li>${item.nome} - R$ ${item.preco.toFixed(2)}</li>`;
    });

    totalSpan.innerText = total.toFixed(2);
    contagem.innerText = carrinho.length;
}

function toggleCarrinho() {
    document.getElementById("janela-carrinho").classList.toggle("escondido");
}

async function finalizarPedido() {
    if (carrinho.length === 0) return alert("Seu carrinho está vazio!");
    
    const res = await fetch(`${API_BASE_URL}/api/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: carrinho })
    });

    if (res.ok) {
        alert("Pedido enviado com sucesso!");
        carrinho = [];
        atualizarCarrinhoUI();
        toggleCarrinho();
    }
}

