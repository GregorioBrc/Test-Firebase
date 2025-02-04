// estadisticas.js
import { readSimulationData } from "./read-data.js";
import { Get_Usu } from "./auth.js";

// Cargar Google Charts
google.charts.load("current", { packages: ["corechart", "bar"] });
google.charts.setOnLoadCallback(inicializarGraficos);

let user;

async function inicializarGraficos() {
  try {
    // Obtener el usuario autenticado
    user = await Get_Usu();
    if (!user) {
      alert("Debes iniciar sesión para ver tus estadísticas.");
      window.location.href = "index.html";
      return;
    }

    // Leer los datos de simulación del usuario
    const userId = user.uid;
    const simulaciones = await readSimulationData(userId);

    if (simulaciones.length === 0) {
      document.getElementById("graficos").innerHTML =
        "<p>No hay datos disponibles para mostrar.</p>";
      return;
    }

    // Procesar los datos para los gráficos
    const datosBotellas = procesarDatosBotellas(simulaciones);
    const datosEficiencia = procesarDatosEficiencia(simulaciones);
    const datosGanancias = procesarDatosGanancias(simulaciones);

    // Renderizar los gráficos
    renderizarGraficoBotellas(datosBotellas);
    renderizarGraficoEficiencia(datosEficiencia);
    renderizarGraficoGanancias(datosGanancias);
    renderizarGraficoTasaDefectos(simulaciones);
    renderizarGraficoCostoPorBotella(simulaciones);
    renderizarGraficoDistribucionTamanos(simulaciones);
  } catch (error) {
    console.error("Error al cargar estadísticas:", error.message);
    alert("Hubo un error al cargar las estadísticas. Inténtalo de nuevo.");
  }
}

function procesarDatosBotellas(simulaciones) {
  const datos = [["Simulación", "Botellas Vendidas", "Defectos"]];
  simulaciones.forEach((sim, index) => {
    datos.push([
      `Simulación ${index + 1}`,
      sim.metricas.botellasVendidas,
      sim.metricas.defectos,
    ]);
  });
  return datos;
}

function procesarDatosEficiencia(simulaciones) {
  const datos = [["Simulación", "Eficiencia Promedio"]];
  simulaciones.forEach((sim, index) => {
    datos.push([`Simulación ${index + 1}`, sim.metricas.eficienciaPromedio]);
  });
  return datos;
}

function procesarDatosGanancias(simulaciones) {
  const datos = [["Simulación", "Ganancias Totales"]];
  simulaciones.forEach((sim, index) => {
    datos.push([`Simulación ${index + 1}`, sim.metricas.gananciasTotales]);
  });
  return datos;
}

function renderizarGraficoBotellas(datos) {
  const data = google.visualization.arrayToDataTable(datos);

  const options = {
    title: "Botellas Vendidas vs Defectos",
    chartArea: { width: "70%", height: "70%" },
    hAxis: { title: "Simulación", minValue: 0 },
    vAxis: { title: "Cantidad", minValue: 0 },
    isStacked: true,
  };

  const chart = new google.visualization.ColumnChart(
    document.getElementById("chart_div_botellas")
  );
  chart.draw(data, options);
}

function renderizarGraficoEficiencia(datos) {
  const data = google.visualization.arrayToDataTable(datos);

  const options = {
    title: "Eficiencia Promedio por Simulación",
    curveType: "function",
    legend: { position: "bottom" },
  };

  const chart = new google.visualization.LineChart(
    document.getElementById("chart_div_eficiencia")
  );
  chart.draw(data, options);
}

function renderizarGraficoGanancias(datos) {
  const data = google.visualization.arrayToDataTable(datos);

  const options = {
    title: "Ganancias Totales por Simulación",
    pieHole: 0.4,
    pieSliceText: "value",
    legend: { position: "right" },
  };

  const chart = new google.visualization.PieChart(
    document.getElementById("chart_div_ganancias")
  );
  chart.draw(data, options);
}

function renderizarGraficoTasaDefectos(simulaciones) {
  const datos = [["Simulación", "Tasa de Defectos"]];
  simulaciones.forEach((sim, index) => {
    datos.push([`Simulación ${index + 1}`, sim.metricas.tasaDefectos]);
  });

  const data = google.visualization.arrayToDataTable(datos);

  const options = {
    title: "Tasa de Defectos por Simulación",
    hAxis: { title: "Simulación" },
    vAxis: { title: "Tasa de Defectos (%)" },
    colors: ["#FF5733"],
  };

  const chart = new google.visualization.ColumnChart(
    document.getElementById("chart_div_tasa_defectos")
  );
  chart.draw(data, options);
}

function renderizarGraficoCostoPorBotella(simulaciones) {
  const datos = [["Simulación", "Costo por Botella"]];
  simulaciones.forEach((sim, index) => {
    datos.push([`Simulación ${index + 1}`, sim.metricas.costoPorBotella]);
  });

  const data = google.visualization.arrayToDataTable(datos);

  const options = {
    title: "Costo Promedio por Botella",
    pieHole: 0.4,
    pieSliceText: "value",
    legend: { position: "right" },
  };

  const chart = new google.visualization.PieChart(
    document.getElementById("chart_div_costo_botella")
  );
  chart.draw(data, options);
}

function renderizarGraficoDistribucionTamanos(simulaciones) {
  const ultimaSimulacion = simulaciones[simulaciones.length - 1];
  const datos = [
    ["Tamaño", "Cantidad"],
    ["Pequeñas", ultimaSimulacion.metricas.distribucionTamanos.pequenas],
    ["Medianas", ultimaSimulacion.metricas.distribucionTamanos.medianas],
    ["Grandes", ultimaSimulacion.metricas.distribucionTamanos.grandes],
  ];

  const data = google.visualization.arrayToDataTable(datos);

  const options = {
    title: "Distribución de Tamaños de Botellas",
    pieHole: 0.4,
    pieSliceText: "value",
    legend: { position: "right" },
  };

  const chart = new google.visualization.PieChart(
    document.getElementById("chart_div_distribucion_tamanos")
  );
  chart.draw(data, options);
}
