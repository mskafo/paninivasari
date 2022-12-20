import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import { getAuth, signOut } from "firebase/auth";
// import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDvZxP8vIIKt0Bt1rfF5UgM_ZKN3l3-V_4",
  authDomain: "paninivasari-af542.firebaseapp.com",
  projectId: "paninivasari-af542",
  storageBucket: "paninivasari-af542.appspot.com",
  messagingSenderId: "860362315549",
  appId: "1:860362315549:web:1d9a317c718c2de292b3f4",
};

initializeApp(firebaseConfig);

export const db = getFirestore();
export const auth = getAuth();
// export const storage = getStorage();
