// read-data.js
import { db } from "./firebase-config.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Función para leer datos de Firestore filtrados por userId
export async function readSimulationData(userId) {
  try {
    // Referencia a la colección "simulaciones"
    const simulationsCollection = collection(db, "simulaciones");

    // Crear una consulta para filtrar por userId
    const q = query(simulationsCollection, where("userId", "==", userId));

    // Obtener los documentos que coinciden con la consulta
    const querySnapshot = await getDocs(q);

    const simulations = [];
    querySnapshot.forEach((doc) => {
      simulations.push({ id: doc.id, ...doc.data() });
    });

    console.log("Datos de simulación del usuario:", simulations);
    return simulations;
  } catch (error) {
    console.error("Error al leer los datos:", error.message);
    alert("Hubo un error al leer las simulaciones. Inténtalo de nuevo.");
  }
}