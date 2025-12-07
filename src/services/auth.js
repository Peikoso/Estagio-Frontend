import { onAuthStateChanged } from "firebase/auth";
import { auth } from '../firebaseConfig.js'

export function getCurrentUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe(); // executa só uma vez
      resolve(user);
    });
  });
}

