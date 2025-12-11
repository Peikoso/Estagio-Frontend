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


export function VerifySuperAdmin(user) {
  if (!user) return false;

  const HasAdminRole = user.roles.some(role => role.isSuperadmin === true);

  if(user.profile === 'admin' && HasAdminRole) {
    return true;
  }

  return false;
}
