// 🔹 Inicialização do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAm2mOO3cL5kHPftq30Tk7hAW8nwJH1v-w",
  authDomain: "cartao-fidelidade-94ef3.firebaseapp.com",
  databaseURL: "https://cartao-fidelidade-94ef3-default-rtdb.firebaseio.com",
  projectId: "cartao-fidelidade-94ef3",
  storageBucket: "cartao-fidelidade-94ef3.appspot.com",
  messagingSenderId: "801121898410",
  appId: "1:801121898410:web:9e9636aa702128d346e5d3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 🔹 Função para buscar cliente
window.buscarCliente = async function () {
  const nome = document.getElementById("buscarNome").value.trim().toLowerCase();
  if (!nome) return alert("Digite nome de usuário.");

  try {
    const snapshot = await get(child(ref(db), 'clientes/' + nome));
    if (snapshot.exists()) {
      mostrarCartao(snapshot.val());
    } else {
      alert("Cliente não encontrado.");
      document.getElementById("cartaoFidelidade").style.display = "none";
    }
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    alert("Erro ao buscar cliente.");
  }
};

// 🔹 Exibir cartão de fidelidade
window.mostrarCartao = function (cliente) {
  if (!cliente.nome || cliente.selos === undefined) {
    alert("Dados incompletos do cliente.");
    return;
  }

  const nomeCliente = document.getElementById("nomeCliente");
  const areaSelos = document.getElementById("areaSelos");

  nomeCliente.textContent = cliente.nome.toUpperCase();
  nomeCliente.classList.remove("brilhante");
  areaSelos.innerHTML = "";

  for (let i = 0; i < 10; i++) {
    const selo = document.createElement("div");
    selo.classList.add("selo");
    if (i < cliente.selos) selo.classList.add("ativo");
    selo.textContent = i + 1;
    areaSelos.appendChild(selo);
  }

  document.getElementById("cartaoFidelidade").style.display = "block";

  // 🔸 Indicacoes
  const infoIndicacao = document.getElementById("infoIndicacao");
  const modalIndicacao = document.getElementById("modalIndicacao");

  if (cliente.indicacoes) {
    if (cliente.indicacoes === 2) {
      document.getElementById("mensagemIndicacao").textContent =
        "Você indicou 2 pessoas e ganhou 1 mês grátis!";
      modalIndicacao.style.display = "block";
    } else {
      const texto = cliente.indicacoes === 1 ? "1 pessoa" : `${cliente.indicacoes} pessoas`;
      infoIndicacao.textContent = `Você indicou ${texto}.`;
    }
  } else {
    infoIndicacao.textContent = "";
  }

  // 🔸 Selos especiais
  if (cliente.selos === 10) nomeCliente.classList.add("brilhante");

  [3, 6, 10].forEach(n => {
    if (cliente.selos === n) exibirModalSelos(n);
  });
};

// 🔹 Exibir modais com base nos selos
function exibirModalSelos(selos) {
  const modal = document.getElementById(`modal${selos}Selos`);
  if (modal) modal.style.display = "block";
}

// 🔹 Fechar modal genérico
window.fecharModal = function (id) {
  document.getElementById(id).style.display = "none";
};

// 🔹 Evento único para fechar o modal de indicação
document.getElementById("fecharModal").addEventListener("click", () => {
  document.getElementById("modalIndicacao").style.display = "none";
});

// 🔐 Função para gerar o hash SHA-256 da senha digitada
async function gerarHash(texto) {
  const encoder = new TextEncoder();
  const data = encoder.encode(texto);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Hash da senha correta
const SENHA_HASH = "cdbd3bbf30c1038474ca3e79bb0209c6493493700450a9d7bf6090382c663dd2";

// Abre o modal
window.abrirModalADM = function () {
  document.getElementById("modalADM").style.display = "flex";
  document.getElementById("senhaADM").value = "";
  document.getElementById("erroSenha").style.display = "none";
};

// Fecha o modal
window.fecharModalADM = function () {
  document.getElementById("modalADM").style.display = "none";
};

// Verifica a senha digitada
window.verificarSenhaADM = async function () {
  const senha = document.getElementById("senhaADM").value;
  const hashDigitado = await gerarHash(senha);

  if (hashDigitado === SENHA_HASH) {
    localStorage.setItem("paginaAnterior", window.location.href);
    window.location.href = "admin.html";
  } else {
    document.getElementById("erroSenha").style.display = "block";
  }
};

// 🔹 Registro do Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .then(reg => console.log('Service Worker registrado', reg))
      .catch(err => console.error('Erro no Service Worker', err));
  });
}

// 🔹 Instalação do PWA
let deferredPrompt;
const btnInstalar = document.getElementById('btnInstalar');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  btnInstalar.style.display = 'block';
});

btnInstalar.addEventListener('click', async () => {
  btnInstalar.style.display = 'none';
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(outcome === 'accepted' ? 'Usuário aceitou instalar' : 'Usuário recusou');
    deferredPrompt = null;
  }
});

window.addEventListener('appinstalled', () => {
  console.log('PWA instalado');
  btnInstalar.style.display = 'none';
});

// 🔹 Splash Screen
window.addEventListener('load', () => {
  setTimeout(() => {
    const splash = document.getElementById('splash');
    splash.style.opacity = '0';
    setTimeout(() => splash.remove(), 1000);
  }, 3000);
});