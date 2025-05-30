// Importações do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getDatabase, ref, set, get, child, onValue } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";

// Configuração do Firebase
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

// Adicionar cliente
window.adicionarCliente = async function () {
  const nome = document.getElementById("nomeCliente").value.trim().toLowerCase();
  const selos = parseInt(document.getElementById("qtdSelos").value);
  const indicacoes = parseInt(document.getElementById("qtdIndicacoes").value);

  if (!nome || isNaN(selos) || selos < 0 || selos > 10) {
    alert("Preencha corretamente os campos.");
    return;
  }

  try {
    await set(ref(db, 'clientes/' + nome), { nome, selos, indicacoes });
    alert("Cliente salvo com sucesso!");

    // Limpar campos
    document.getElementById("nomeCliente").value = "";
    document.getElementById("qtdSelos").value = "";
    document.getElementById("qtdIndicacoes").value = "";
  } catch (error) {
    console.error("Erro ao salvar:", error);
    alert("Erro ao salvar cliente.");
  }
}

// Editar cliente
window.editarSelos = async function () {
  const nome = document.getElementById("nomeEditar").value.trim().toLowerCase();
  const novoSelos = parseInt(document.getElementById("novoValorSelos").value);
  const inputIndicacoes = document.getElementById("novoValorIndicacoes").value;
  const novasIndicacoes = inputIndicacoes === "" ? 0 : parseInt(inputIndicacoes);

  if (!nome || isNaN(novoSelos) || novoSelos < 0 || novoSelos > 10) {
    alert("Dados inválidos.");
    return;
  }

  try {
    const snapshot = await get(child(ref(db), 'clientes/' + nome));
    if (snapshot.exists()) {
      const cliente = snapshot.val();
      cliente.selos = novoSelos;
      cliente.indicacoes = novasIndicacoes;

      await set(ref(db, 'clientes/' + nome), cliente);
      alert(`Selos e indicações atualizados.`);

      document.getElementById("modalEditar").style.display = "none";
    } else {
      alert("Cliente não encontrado.");
    }
  } catch (error) {
    console.error("Erro ao atualizar selos:", error);
  }
}

// Excluir cliente
window.excluirCliente = async function () {
  const nome = document.getElementById("nomeExcluir").value.trim().toLowerCase();
  if (!nome) return alert("Digite o nome do cliente.");
  if (!confirm(`Deseja excluir o cliente "${nome}"?`)) return;

  try {
    await set(ref(db, 'clientes/' + nome), null);
    alert("Cliente excluído com sucesso.");
    document.getElementById("nomeExcluir").value = "";
  } catch (error) {
    console.error("Erro ao excluir cliente:", error);
    alert("Erro ao excluir cliente.");
  }
}

// Listar clientes automaticamente
window.onload = function () {
  const lista = document.getElementById("listaClientes");

  onValue(ref(db, 'clientes'), (snapshot) => {
    lista.innerHTML = '';
    if (snapshot.exists()) {
      const data = snapshot.val();
      Object.values(data).forEach(cliente => {
        const div = document.createElement("div");
        
        let statusPremium = '';
if (cliente.indicacoes === 2) {
  statusPremium = '<span class="premium-entregue">✅ PREMIUM ENTREGUE</span>';
}

div.innerHTML = `${cliente.nome.toUpperCase()} - ${cliente.selos} selos - ${cliente.indicacoes || 0} indicações ${statusPremium}`;
        lista.appendChild(div);
      });
    } else {
      lista.innerHTML = '<em>Nenhum cliente cadastrado.</em>';
    }
  });
}

// Abrir e fechar modal de edição
window.abrirModalEditar = () => document.getElementById("modalEditar").style.display = "block";
window.fecharModalEditar = () => document.getElementById("modalEditar").style.display = "none";

// Filtrar clientes
window.filtrarClientes = function () {
  const termo = document.getElementById("buscaCliente").value.trim().toLowerCase();
  const divs = document.querySelectorAll("#listaClientes div");

  divs.forEach(div => {
    const texto = div.textContent.toLowerCase();
    div.style.display = texto.includes(termo) ? "block" : "none";
  });
}

// Marcar premiu entregue
window.marcarPremiumEntregue = async function () {
  const nome = document.getElementById("nomePremium").value.trim().toLowerCase();
  if (!nome) return alert("Digite o nome do cliente.");

  try {
    const clienteRef = child(ref(db), 'clientes/' + nome);
    const snapshot = await get(clienteRef);

    if (snapshot.exists()) {
      const cliente = snapshot.val();
      cliente.premiumEntregue = true;

      await set(ref(db, 'clientes/' + nome), cliente);
      alert("Cliente marcado como Premium entregue!");
      document.getElementById("nomePremium").value = "";
    } else {
      alert("Cliente não encontrado.");
    }
  } catch (error) {
    console.error("Erro ao marcar como entregue:", error);
    alert("Erro ao atualizar cliente.");
  }
}

// Exportar backup para arquivo JSON
window.exportarBackup = async function () {
  try {
    const snapshot = await get(child(ref(db), 'clientes'));
    if (!snapshot.exists()) return alert("Nenhum cliente encontrado.");

    const dados = snapshot.val();
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "application/json" });
    const nomeArquivo = "backup_fideliza.json";

    if (window.cordova) {
      window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (dir) {
        dir.getFile(nomeArquivo, { create: true }, function (file) {
          file.createWriter(function (writer) {
            writer.onwriteend = function () {
              cordova.plugins.fileOpener2.open(
                cordova.file.externalDataDirectory + nomeArquivo,
                'application/json',
                {
                  error: (e) => alert("Erro ao abrir: " + JSON.stringify(e)),
                  success: () => alert("Backup exportado com sucesso!")
                }
              );
            };
            writer.onerror = (e) => alert("Erro ao salvar: " + e.toString());
            writer.write(blob);
          });
        });
      }, (err) => alert("Erro ao acessar armazenamento: " + err.message));
    } else {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = nomeArquivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error("Erro ao exportar backup:", error);
    alert("Erro ao exportar backup.");
  }
}

// Importar backup de arquivo JSON
window.importarBackup = async function () {
  const input = document.getElementById("importarArquivo");
  const file = input.files[0];
  if (!file) return alert("Selecione um arquivo JSON.");

  const reader = new FileReader();
  reader.onload = async function (e) {
    try {
      const data = JSON.parse(e.target.result);
      for (const nome in data) {
        const cliente = data[nome];
        await set(ref(db, 'clientes/' + nome), cliente);
      }
      alert("Backup importado com sucesso!");
    } catch (error) {
      console.error("Erro ao importar:", error);
      alert("Erro ao importar backup.");
    }
  };
  reader.readAsText(file);
}

// Voltar para a página anterior
window.voltarPaginaAnterior = function () {
  const pagina = localStorage.getItem("paginaAnterior");
  if (pagina) {
    window.location.href = pagina;
  } else {
    history.back();
  }
}