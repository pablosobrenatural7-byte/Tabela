let API_BASE_URL = localStorage.getItem("API_URL") || "https://katharyn-dextrorotatory-gavin.ngrok-free.dev/";

document.addEventListener("DOMContentLoaded", () => {
    const urlInput = document.getElementById("input-ngrok-url");
    if (urlInput) urlInput.value = API_BASE_URL;
    verificarSessao();
});

// --- AUTENTICAÇÃO ---

async function realizarLogin() {
    const user = document.getElementById("login-user").value;
    const pass = document.getElementById("login-pass").value;
    const msgErro = document.getElementById("msg-erro");

    try {
        const res = await fetch(`${API_BASE_URL}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: user, password: pass })
        });

        if (res.ok) {
            const dados = await res.json();
            localStorage.setItem("token_jwt", dados.token);
            location.reload();
        } else {
            msgErro.innerText = "Usuário ou senha incorretos.";
        }
    } catch (e) {
        msgErro.innerText = "Erro ao conectar com o servidor.";
    }
}

function verificarSessao() {
    const token = localStorage.getItem("token_jwt");
    const modal = document.getElementById("modal-login");
    const area = document.getElementById("area-admin");

    if (token) {
        modal.classList.add("escondido");
        area.classList.remove("escondido");
        carregarDadosAdmin();
    } else {
        modal.classList.remove("escondido");
        area.classList.add("escondido");
    }
}

function fazerLogout() {
    localStorage.removeItem("token_jwt");
    location.reload();
}

// --- GERENCIAMENTO DE PRODUTOS ---

async function carregarDadosAdmin() {
    const corpo = document.getElementById("corpo-tabela-admin");
    try {
        const res = await fetch(`${API_BASE_URL}/api/precos`, {
            headers: { "ngrok-skip-browser-warning": "true" }
        });
        const dados = await res.json();
        
        corpo.innerHTML = "";
        dados.forEach(item => {
            corpo.innerHTML += `
                <tr>
                    <td>${item.nome}</td>
                    <td>R$ ${item.preco.toFixed(2)}</td>
                    <td>
                        <button class="btn-perigo" onclick="removerItem('${item.nome}')">Remover</button>
                    </td>
                </tr>`;
        });
    } catch (e) {
        corpo.innerHTML = "<tr><td colspan='3'>Erro ao carregar dados.</td></tr>";
    }
}

async function salvarItem() {
    const nome = document.getElementById("input-nome").value;
    const preco = document.getElementById("input-preco").value;
    const token = localStorage.getItem("token_jwt");

    if (!nome || !preco) return alert("Preencha todos os campos!");

    const res = await fetch(`${API_BASE_URL}/api/precos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ nome: nome, preco: parseFloat(preco) })
    });

    if (res.ok) {
        alert("Item salvo com sucesso!");
        document.getElementById("input-nome").value = "";
        document.getElementById("input-preco").value = "";
        carregarDadosAdmin(); // Atualiza a lista
    }
}

async function removerItem(nomeAlvo) {
    if (!confirm(`Deseja remover "${nomeAlvo}"?`)) return;

    const token = localStorage.getItem("token_jwt");
    const res = await fetch(`${API_BASE_URL}/api/precos/remover`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true"
        },
        body: JSON.stringify({ nome: nomeAlvo })
    });

    if (res.ok) {
        carregarDadosAdmin();
    }
}

// --- INTERFACE ---

function abrirAba(evt, nomeAba) {
    const contents = document.querySelectorAll(".tab-content");
    contents.forEach(c => c.classList.remove("active"));
    
    const btns = document.querySelectorAll(".tab-btn");
    btns.forEach(b => b.classList.remove("active"));

    document.getElementById(nomeAba).classList.add("active");
    evt.currentTarget.classList.add("active");
}

function salvarUrl() {
    const novaUrl = document.getElementById("input-ngrok-url").value;
    localStorage.setItem("API_URL", novaUrl);
    alert("URL da API atualizada!");
    location.reload();
}