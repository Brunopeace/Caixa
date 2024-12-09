let valorInicial = 4500.00;
let valorRestante = valorInicial;
let valoresEntrada = [];

function salvarDados() {
    localStorage.setItem('valorRestante', valorRestante);
    localStorage.setItem('valoresEntrada', JSON.stringify(valoresEntrada));
    localStorage.setItem('valorInicial', valorInicial);
}

function carregarDados() {
    if (localStorage.getItem('valorRestante')) {
        valorRestante = parseFloat(localStorage.getItem('valorRestante'));
    }
    if (localStorage.getItem('valoresEntrada')) {
        valoresEntrada = JSON.parse(localStorage.getItem('valoresEntrada'));
    }
    if (localStorage.getItem('valorInicial')) {
        valorInicial = parseFloat(localStorage.getItem('valorInicial'));
        document.getElementById("valorInicial").value = formatarMoeda(valorInicial);
    }
    atualizarValoresEntrada();
    document.getElementById("valorRestante").value = formatarMoeda(valorRestante);
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function desformatarMoeda(valor) {
    valor = valor.replace(/[^\d,.-]/g, '');
    valor = valor.replace('.', '').replace(',', '.');
    return parseFloat(valor);
}

function formatarMoedaEnquantoDigita(valor) {
    valor = valor.replace(/\D/g, '');
    valor = (valor / 100).toFixed(2) + '';
    valor = valor.replace('.', ',');
    valor = valor.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return 'R$ ' + valor;
}

document.getElementById("valorEntrada").addEventListener('input', function(e) {
    let cursorPosition = this.selectionStart;
    let valorDigitado = this.value;
    
    this.value = formatarMoedaEnquantoDigita(valorDigitado);
    
    let diff = this.value.length - valorDigitado.length;
    this.setSelectionRange(cursorPosition + diff, cursorPosition + diff);
});

function adicionarValor() {
    let valorEntrada = desformatarMoeda(document.getElementById("valorEntrada").value);
    if (!isNaN(valorEntrada) && valorEntrada > 0) {
        valorRestante -= valorEntrada;
        
        let dataVencimento = new Date().toLocaleDateString('pt-BR');
        valoresEntrada.push({ valor: valorEntrada, data: dataVencimento });

        atualizarValoresEntrada();
        document.getElementById("valorRestante").value = formatarMoeda(valorRestante);
        document.getElementById("valorEntrada").value = "";

        salvarDados();
    } else {
        alert("Por favor, insira um valor válido de entrada.");
    }
}

document.getElementById("valorEntrada").addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        adicionarValor();
        event.preventDefault(); // Impede a ação padrão do Enter (como envio de formulário)
    }
});

function atualizarValoresEntrada() {
    let listaValores = document.getElementById("listaValores");
    listaValores.innerHTML = '';

    let totalPago = valoresEntrada.reduce((acc, curr) => acc + curr.valor, 0);
    document.getElementById("valorPago").value = formatarMoeda(totalPago);

    valoresEntrada.forEach((item, index) => {
        let li = document.createElement('li');
        li.innerHTML = `
            ${formatarMoeda(item.valor)} - ${item.data}
            <div>
                <button class="edit" onclick="editarValor(${index})">Editar</button>
                <button class="delete" onclick="excluirValor(${index})">Excluir</button>
            </div>
        `;
        listaValores.appendChild(li);
    });
}

function excluirValor(index) {
    valorRestante += valoresEntrada[index].valor;
    valoresEntrada.splice(index, 1);
    document.getElementById("valorRestante").value = formatarMoeda(valorRestante);
    atualizarValoresEntrada();
    salvarDados();
}

function editarValor(index) {
    let novoValor = desformatarMoeda(prompt("Digite o novo valor:", formatarMoeda(valoresEntrada[index].valor)));
    if (!isNaN(novoValor) && novoValor > 0) {
        valorRestante += valoresEntrada[index].valor - novoValor;
        valoresEntrada[index].valor = novoValor;
        document.getElementById("valorRestante").value = formatarMoeda(valorRestante);
        atualizarValoresEntrada();
        salvarDados();
    } else {
        alert("Por favor, insira um valor válido.");
    }
}

function atualizarValorInicial() {
    let valorInput = desformatarMoeda(document.getElementById("valorInicial").value);
    if (!isNaN(valorInput)) {
        valorInicial = valorInput;
        valorRestante = valorInicial - valoresEntrada.reduce((acc, curr) => acc + curr.valor, 0);
        document.getElementById("valorRestante").value = formatarMoeda(valorRestante);
        salvarDados();
    } 
}

document.getElementById("valorInicial").addEventListener('blur', function() {
    let valorInput = document.getElementById("valorInicial").value;
    document.getElementById("valorInicial").value = formatarMoeda(desformatarMoeda(valorInput));
});

document.getElementById("valorInicial").addEventListener('input', atualizarValorInicial);

document.getElementById("valorEntrada").addEventListener('input', function() {
    let valorDigitado = this.value;
    this.value = formatarMoedaEnquantoDigita(valorDigitado);
});

document.getElementById("valorInicial").value = formatarMoeda(valorInicial);
carregarDados();

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./service-worker.js")
            .then(registration => {
                console.log("Service Worker registrado com sucesso:", registration.scope);
            })
            .catch(err => {
                console.error("Falha ao registrar o Service Worker:", err);
            });
    });
}