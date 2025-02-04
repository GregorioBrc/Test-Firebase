import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { auth } from "./firebase-config.js";

// Configura el proveedor de autenticación de Google
const provider = new GoogleAuthProvider();

// Función para iniciar sesión con Google
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    console.log("Usuario autenticado:", user);

    // Redirige al usuario a la página de dashboard
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Error al iniciar sesión:", error.message);
    alert("Hubo un error al iniciar sesión. Inténtalo de nuevo.");
  }
}

export async function signOutGoogle() {
  try {
    await signOut(auth);
    console.log("Sesión cerrada");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error al cerrar sesión:", error.message);
  }
}

export async function Comprobar_Usu() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
    } else {
      alert("Debes Registrarte para entrar aqui");
      window.location.href = "index.html";
    }
  });
}

export async function Get_Usu() {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("Usuario autenticado:", user);
        resolve(user); // Resuelve la promesa con el usuario
      } else {
        console.log("No hay usuario autenticado");
        resolve(null); // Resuelve la promesa con null si no hay usuario
      }
    });
  });
}
