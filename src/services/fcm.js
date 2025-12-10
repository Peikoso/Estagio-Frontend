import { messaging, getToken } from "../firebaseConfig.js";
import api from "./api.js";
import { getToken as getUserToken } from "./token.js";

export const requestNotificationPermission = async () => {
  try{
    const permission = await Notification.requestPermission();
    if(permission === "granted"){
      const userToken = await getUserToken();
      if(!userToken) {
        throw new Error("User not authenticated");
      };

      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_VAPID_KEY_FIREBASE
      });

      await api.patch("/users/fcm-token",
        { fcmToken: token },
        { headers: { Authorization: `Bearer ${userToken}` } }
      );

      return token;
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
  }
};
