let tempo = 0;
let distancia = 0;
let valor = 0;
let intervalo;
let emCorrida = false;
let ultimaPosicao = null;

const tarifaMinuto = 0.75;
const tarifaKm = 2.50;

const tempoEl = document.getElementById("tempo");
const distanciaEl = document.getElementById("distancia");
const valorEl = document.getElementById("valor");

const iniciarBtn = document.getElementById("iniciar");
const pararBtn = document.getElementById("parar");
const resetarBtn = document.getElementById("resetar");

iniciarBtn.addEventListener("click", () => {
  if (emCorrida) return;

  emCorrida = true;
  iniciarBtn.disabled = true;
  pararBtn.disabled = false;

  navigator.geolocation.watchPosition(pos => {
    if (!emCorrida) return;

    const { latitude, longitude } = pos.coords;

    if (ultimaPosicao) {
      const d = calcularDistancia(ultimaPosicao.lat, ultimaPosicao.lng, latitude, longitude);
      distancia += d;
    }

    ultimaPosicao = { lat: latitude, lng: longitude };
    atualizarDisplay();
  }, console.error, { enableHighAccuracy: true });

  intervalo = setInterval(() => {
    tempo++;
    atualizarDisplay();
  }, 60000); // 1 minuto
});

pararBtn.addEventListener("click", () => {
  clearInterval(intervalo);
  emCorrida = false;
  iniciarBtn.disabled = false;
  pararBtn.disabled = true;
  salvarCorrida();
});

resetarBtn.addEventListener("click", () => {
  clearInterval(intervalo);
  tempo = 0;
  distancia = 0;
  valor = 0;
  ultimaPosicao = null;
  emCorrida = false;
  atualizarDisplay();
  iniciarBtn.disabled = false;
  pararBtn.disabled = true;
});

function atualizarDisplay() {
  valor = (tempo * tarifaMinuto) + (distancia * tarifaKm);
  tempoEl.textContent = tempo;
  distanciaEl.textContent = distancia.toFixed(2);
  valorEl.textContent = valor.toFixed(2);
}

function salvarCorrida() {
  const corridas = JSON.parse(localStorage.getItem("corridas")) || [];
  corridas.push({
    tempo,
    distancia: distancia.toFixed(2),
    valor: valor.toFixed(2),
    data: new Date().toLocaleString()
  });
  localStorage.setItem("corridas", JSON.stringify(corridas));
}

// Fórmula de Haversine para calcular distância
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}