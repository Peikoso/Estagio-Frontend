import { auth } from "../firebaseConfig.js";

export async function getToken() {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken(true);
}
