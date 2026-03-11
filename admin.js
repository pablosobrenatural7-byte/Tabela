let API_BASE_URL = localStorage.getItem("API_URL") || "https://solid-fortnight-69qq966x7p6v344xw-5000.app.github.dev";

document.addEventListener("DOMContentLoaded", () => {
    if(localStorage.getItem("token_jwt")) {
        document.getElementById("modal-login").classList.add("escondido");
        document.getElementById("area-admin").classList.remove("escondido");
        carregarTabela();
    }
});

async function realizarLogin() {
    const username = document.getElementById("login-user").value;
    const password = document.getElementById("login-pass").value;
    const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST", headers: {"Content-Type": "application/json", "ngrok-skip-browser-warning": "true"},
        body: JSON.stringify({ username, password })
    });
    if(res.ok) {
        const d = await res.json();
        localStorage.setItem("token_jwt", d.token);
        location.reload();
    } else alert("Erro!");
}

async function carregarTabela() {
    const res = await fetch(`${API_BASE_URL}/api/precos`, { headers: {"ngrok-skip-browser-warning": "true"} });
    const dados = await res.json();
    const corpo = document.getElementById("corpo-admin");
    corpo.innerHTML = "";
    dados.forEach(i => {
        corpo.innerHTML += `<tr><td>${i.categoria}</td><td>${i.nome}</td><td>R$ ${i.preco.toFixed(2)}</td>
        <td><button onclick="apagar('${i.nome}')" class="btn-perigo">Remover</button></td></tr>`;
    });
}

async function salvarItem() {
    const categoria = document.getElementById("n-cat").value;
    const nome = document.getElementById("n-nome").value;
    const preco = parseFloat(document.getElementById("n-preco").value);
    const token = localStorage.getItem("token_jwt");
    await fetch(`${API_BASE_URL}/api/precos/atualizar`, {
        method: "POST",
        headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`, "ngrok-skip-browser-warning": "true"},
        body: JSON.stringify({ nome, preco, categoria })
    });
    carregarTabela();
}

async function apagar(nome) {
    if(!confirm(`Apagar ${nome}?`)) return;
    const token = localStorage.getItem("token_jwt");
    await fetch(`${API_BASE_URL}/api/precos/remover`, {
        method: "POST",
        headers: {"Content-Type": "application/json", "Authorization": `Bearer ${token}`, "ngrok-skip-browser-warning": "true"},
        body: JSON.stringify({ nome })
    });
    carregarTabela();
}

function fazerLogout() { localStorage.removeItem("token_jwt"); location.reload(); }
