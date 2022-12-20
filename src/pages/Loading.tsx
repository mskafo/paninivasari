import { IonContent, IonIcon, IonPage, IonSpinner } from "@ionic/react";
import React, { useEffect } from "react";
import { useHistory } from "react-router";
import { auth, db } from "../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, getDoc } from "firebase/firestore";

import "./Loading.css";
import { restaurant } from "ionicons/icons";

const Loading: React.FC = () => {
  const [user, userLoading, userError] = useAuthState(auth);
  const history = useHistory();

  useEffect(() => {
    if (!user && !userLoading) {
      history.push("/page/Login");
    } else if (user && !userLoading) {
      const docRef = doc(db, "utenti", user.uid);

      getDoc(docRef).then((snap) => {
        if (snap.data()?.tipo === "fornitore") {
          history.push("/page/Fornitore");
        } else if (snap.data()?.tipo === "classe") {
          history.push("/page/Classe");
        }
      });
    }
  }, [user, userLoading]);

  return (
    <IonPage>
      <IonContent className="loading-content" fullscreen>
        <div className="loading-box">
          <div className="loading-logo">
            <IonIcon icon={restaurant} />
            <h1>Panini Vasari</h1>
          </div>
          <br />
          <br />
          <IonSpinner name="dots" />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Loading;
