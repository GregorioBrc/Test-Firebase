// save-data.js
import { db } from "./firebase-config.js";
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Función para guardar datos en Firestore
export async function saveSimulationData(userId, simulationData) {
  try {
    // Referencia a la colección "simulaciones"
    const simulationsCollection = collection(db, "simulaciones");

    // Añade un nuevo documento con los datos de la simulación
    const docRef = await addDoc(simulationsCollection, {
      userId: userId, // ID del usuario autenticado
      ...simulationData, // Datos de la simulación
      timestamp: new Date() // Fecha y hora de la simulación
    });

    console.log("Datos guardados con ID:", docRef.id);
    alert("Simulación guardada correctamente.");
  } catch (error) {
    console.error("Error al guardar los datos:", error.message);
    alert("Hubo un error al guardar la simulación. Inténtalo de nuevo.");
  }
}