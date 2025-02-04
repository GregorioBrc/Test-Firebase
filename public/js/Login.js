// app.js
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { auth } from "./firebase-config.js";
import { signOutGoogle } from "./auth.js";

// Verifica si hay un usuario autenticado
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("profile-pic").src = user.photoURL;
    document.getElementById(
      "span_Nombre_user"
    ).textContent = `${user.displayName}`;

    // Maneja el cierre de sesión
    document.getElementById("logout").addEventListener("click", () => {
      signOutGoogle();
    });
  } else {
    // Si no hay usuario autenticado, redirige a la página de inicio
    window.location.href = "index.html";
  }
});


