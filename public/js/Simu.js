import { Get_Usu } from "./auth.js";
import { auth } from "./firebase-config.js";
import { saveSimulationData } from "./save-data.js";

class Botella {
  constructor(contenedor) {
    this.element = document.createElement("div");
    this.element.className = "botella_Vacia";

    // Ancho aleatorio entre 20px y 40px
    this.ancho = this.generarAnchoAleatorio();
    this.element.style.width = `${this.ancho}px`;

    // Configuración de posición y transición
    this.element.style.position = "absolute";
    this.element.style.left = "0px";
    this.element.style.bottom = "0px";
    this.element.style.transition = "left 0.5s linear";

    // Tiempo de llenado basado en el ancho (más ancho = más rápido)
    this.tiempoLlenado = this.calcularTiempoLlenado();

    // Nivel de llenado aleatorio con distribución ponderada
    this.nivelLlenado = this.generarNivelLlenado();

    // Elementos internos
    this.liquido = document.createElement("div");
    this.liquido.style.backgroundColor = "blue";
    this.liquido.style.width = "100%";
    this.liquido.style.position = "absolute";
    this.liquido.style.bottom = "0";
    this.liquido.style.height = "0%";
    this.liquido.style.transition = `height ${this.tiempoLlenado}ms linear`;

    this.tapa = document.createElement("div");
    this.tapa.style.backgroundColor = "red";
    this.tapa.style.width = "100%";
    this.tapa.style.height = "10px";
    this.tapa.style.position = "absolute";
    this.tapa.style.top = "-10px";
    this.tapa.style.opacity = "0";

    this.element.appendChild(this.liquido);
    this.element.appendChild(this.tapa);
    contenedor.appendChild(this.element);

    this.estado = "movimiento";
    this.Llena = false;
    this.Tapa = false;
    this.posicion = -this.ancho - 5;
  }

  generarAnchoAleatorio() {
    // Ancho entre 20px y 40px
    return Math.floor(Math.random() * 30) + 10;
  }

  calcularTiempoLlenado() {
    // Tiempo entre 800ms y 1500ms inversamente proporcional al ancho
    return 1000 * (this.ancho / 20);
  }

  generarNivelLlenado() {
    // 80% de probabilidad para 95-98%, 20% para 50-60%
    const esBuena = Math.random() < 0.6;
    return esBuena
      ? Math.floor(Math.random() * 20) + 75
      : Math.floor(Math.random() * 20) + 50;
  }
}

class Simulacion {
  constructor() {
    this.contenedor = document.getElementById("Linea_Botellas");
    this.maquinaLlenado = document.getElementById("Maquina_LLenado");
    this.maquinaTapado = document.getElementById("Maquina_Tapado");
    this.botellas = [];
    this.animacionActiva = false;
    this.intervalos = [];

    this.Cant_totalBotellas = 0;
    this.PorcentajeLLenado = [];
    this.Cant_Electricidad = 0;
    this.Ganancia_total = 0;
    this.startTime = null;
    this.botellasVendidas = 0;
    this.aguaDesperdiciada = 0;
    this.wattsConsumidos = 0;
    this.defectos = 0;
    this.intervaloDatos = null;

    this.configurarPosiciones();
    this.agregarEventos();
  }

  configurarPosiciones() {
    const rect = this.contenedor.getBoundingClientRect();
    this.posLlenado = this.maquinaLlenado.offsetLeft - rect.left;
    this.posTapado = this.maquinaTapado.offsetLeft - rect.left;
  }

  agregarEventos() {
    document
      .getElementById("btn_Ini")
      .addEventListener("click", () => this.iniciar());
    document
      .getElementById("btn_Stop")
      .addEventListener("click", () => this.detener());
  }

  iniciar() {
    if (this.animacionActiva) return;
    this.startTime = Date.now();
    this.intervaloDatos = setInterval(() => this.actualizarDatos(), 1000);
    this.animacionActiva = true;
    this.intervalos.push(setInterval(() => this.crearBotella(), 3000));
    this.animar();
  }

  detener() {
    this.animacionActiva = false;
    this.intervalos.forEach(clearInterval);
    this.intervalos = [];
    clearInterval(this.intervaloDatos);
  }

  crearBotella() {
    if (this.botellas.length < 5) {
      this.botellas.push(new Botella(this.contenedor));
      this.Cant_totalBotellas++;
    }
  }

  animar() {
    if (!this.animacionActiva) return;

    this.botellas.forEach((botella, index) => {
      if (botella.estado === "movimiento") {
        const nuevaPos = botella.posicion + 2;
        botella.element.style.left = `${nuevaPos}px`;
        botella.posicion = nuevaPos;

        if (
          Math.abs(
            nuevaPos - this.posLlenado - Math.abs(botella.ancho - 50) / 2
          ) < 2 &&
          !botella.Llena
        ) {
          this.iniciarLlenado(botella);
        } else if (
          Math.abs(
            nuevaPos - this.posTapado - Math.abs(botella.ancho - 50) / 2
          ) < 2 &&
          !botella.Tapa
        ) {
          this.iniciarTapado(botella);
        }
      }

      if (botella.posicion > this.contenedor.offsetWidth + botella.ancho) {
        this.eliminarBotella(index);
      }
    });

    requestAnimationFrame(() => this.animar());
  }

  iniciarLlenado(botella) {
    botella.estado = "llenando";
    setTimeout(() => {
      this.wattsConsumidos += 75;
      botella.liquido.style.height = `${botella.nivelLlenado}%`;
      setTimeout(() => {
        botella.estado = "movimiento";
        botella.Llena = true;
      }, botella.tiempoLlenado);
    }, 750);
  }

  iniciarTapado(botella) {
    botella.estado = "tapando";
    setTimeout(() => {
      this.PorcentajeLLenado.push(botella.nivelLlenado);
      this.wattsConsumidos += 85;
      botella.tapa.style.opacity = "1";
      botella.tapa.style.transition = "opacity 0.3s";
      setTimeout(() => {
        botella.estado = "movimiento";
        botella.Tapa = true;
      }, 500);
    }, 1000);
  }

  eliminarBotella(index) {
    const botella = this.botellas[index];

    // Calcular agua desperdiciada
    this.aguaDesperdiciada += (100 - botella.nivelLlenado) * 0.1; // 0.1L por % faltante

    // Contar defectos
    if (botella.nivelLlenado < 60) this.defectos++;

    // Calcular ganancias
    if (botella.Llena && botella.Tapa) {
      this.botellasVendidas++;
      this.Ganancia_total += botella.ancho * 0.02; // $0.02 por px de ancho
    }

    // Actualizar DOM
    this.actualizarDatos();

    botella.element.remove();
    this.botellas.splice(index, 1);
  }

  actualizarDatos() {
    // Tiempo transcurrido
    const tiempoTranscurrido = Date.now() - this.startTime;
    const minutos = Math.floor(tiempoTranscurrido / 60000);
    const segundos = Math.floor((tiempoTranscurrido % 60000) / 1000);

    // Cálculos
    const eficienciaPromedio =
      this.PorcentajeLLenado.length > 0
        ? (
            this.PorcentajeLLenado.reduce((a, b) => a + b, 0) /
            this.PorcentajeLLenado.length
          ).toFixed(1)
        : 0;

    const botellasPorMinuto =
      this.botellasVendidas / (tiempoTranscurrido / 60000) || 0;

    // Actualizar DOM
    document.getElementById("botellas-totales").textContent =
      this.Cant_totalBotellas;
    document.getElementById("botellas-vendidas").textContent =
      this.botellasVendidas;
    document.getElementById("agua-desperdiciada").textContent =
      this.aguaDesperdiciada.toFixed(2);
    document.getElementById("eficiencia").textContent = eficienciaPromedio;
    document.getElementById("vatios").textContent = Math.floor(
      (this.wattsConsumidos += 10)
    );
    document.getElementById("ganancias").textContent =
      this.Ganancia_total.toFixed(2);
    document.getElementById("tiempo").textContent = `${String(minutos).padStart(
      2,
      "0"
    )}:${String(segundos).padStart(2, "0")}`;
    document.getElementById("botellas-minuto").textContent =
      botellasPorMinuto.toFixed(1);
    document.getElementById("defectos").textContent = this.defectos;
    document.getElementById("capacidad").textContent = (
      (this.botellas.length / 5) *
      100
    ).toFixed(0);
  }

  reiniciarSimulacion() {
    // Detener la simulación actual
    this.detener();

    // Limpiar botellas existentes
    this.botellas.forEach((botella) => botella.element.remove());
    this.botellas = [];

    // Reiniciar métricas
    this.Cant_totalBotellas = 0;
    this.PorcentajeLLenado = [];
    this.Cant_Electricidad = 0;
    this.Ganancia_total = 0;
    this.botellasVendidas = 0;
    this.aguaDesperdiciada = 0;
    this.wattsConsumidos = 0;
    this.defectos = 0;
    this.startTime = null;

    // Reiniciar la UI
    this.actualizarDatos();

    document.getElementById("tiempo").textContent = "00:00";

    // Limpiar cualquier intervalo pendiente
    if (this.intervaloDatos) {
      clearInterval(this.intervaloDatos);
      this.intervaloDatos = null;
    }

    console.log("Simulación reiniciada. Todo listo para comenzar de nuevo.");
  }

  obtenerDatos() {
    const tiempoTranscurrido = Date.now() - this.startTime;
    const minutos = Math.floor(tiempoTranscurrido / 60000);
    
    const tasaDefectos = (this.defectos / this.Cant_totalBotellas) * 100 || 0;
    const costoPorBotella =
      (this.wattsConsumidos + this.aguaDesperdiciada) /
        this.Cant_totalBotellas || 0;
    const eficienciaEnergetica =
      this.Cant_totalBotellas > 0
        ? this.wattsConsumidos / this.Cant_totalBotellas
        : 0;
    const rendimientoEconomico =
      minutos > 0 ? this.Ganancia_total / minutos : 0;

    // Distribución de tamaños de botellas
    const distribucionTamanos = this.botellas.reduce(
      (acc, botella) => {
        if (botella.ancho < 20) acc.pequenas++;
        else if (botella.ancho >= 20 && botella.ancho < 30) acc.medianas++;
        else acc.grandes++;
        return acc;
      },
      { pequenas: 0, medianas: 0, grandes: 0 }
    );

    // Índice de optimización (combinación ponderada de eficiencia, costos y ganancias)
    const indiceOptimizacion =
      (this.PorcentajeLLenado.length > 0
        ? this.PorcentajeLLenado.reduce((a, b) => a + b, 0) /
          this.PorcentajeLLenado.length
        : 0) -
      costoPorBotella +
      rendimientoEconomico;

    return {
      timestamp: new Date().toISOString(),
      duracion: minutos,
      metricas: {
        botellasTotales: this.Cant_totalBotellas,
        botellasVendidas: this.botellasVendidas,
        aguaDesperdiciada: parseFloat(this.aguaDesperdiciada.toFixed(2)),
        eficienciaPromedio:
          this.PorcentajeLLenado.length > 0
            ? parseFloat(
                (
                  this.PorcentajeLLenado.reduce((a, b) => a + b, 0) /
                  this.PorcentajeLLenado.length
                ).toFixed(1)
              )
            : 0,
        vatiosConsumidos: this.wattsConsumidos,
        gananciasTotales: parseFloat(this.Ganancia_total.toFixed(2)),
        defectos: this.defectos,
        capacidadUtilizada: parseFloat(
          ((this.botellas.length / 5) * 100).toFixed(0)
        ),
        botellasPorMinuto:
          this.botellasVendidas / (tiempoTranscurrido / 60000) || 0,
        tasaDefectos: parseFloat(tasaDefectos.toFixed(1)),
        costoPorBotella: parseFloat(costoPorBotella.toFixed(2)),
        eficienciaEnergetica: parseFloat(eficienciaEnergetica.toFixed(2)),
        rendimientoEconomico: parseFloat(rendimientoEconomico.toFixed(2)),
        distribucionTamanos,
        indiceOptimizacion: parseFloat(indiceOptimizacion.toFixed(2)),
      },
      configuracion: {
        velocidadSimulacion: 2, // px por frame
        intervaloCreacion: 3000, // ms
        capacidadMaxima: 5,
      },
    };
  }
}

let user;
let Simu;
Get_Usu().then((u) => {
  user = u;
});
// Iniciar simulación al cargar
document.addEventListener("DOMContentLoaded", () => (Simu = new Simulacion()));

document.getElementById("btn_Save").addEventListener("click", () => {
  saveSimulationData(user.uid, Simu.obtenerDatos()).then(() =>
    Simu.reiniciarSimulacion()
  );
});
