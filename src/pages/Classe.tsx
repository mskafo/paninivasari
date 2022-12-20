import {
  IonButton,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  useIonToast,
} from "@ionic/react";
import { cart, fastFood, logInOutline } from "ionicons/icons";
import React, { useEffect, useRef, useState } from "react";
import { Redirect, Route, useHistory, useLocation } from "react-router";
import { auth, db } from "../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { Panino } from "../types";
import { signOut } from "firebase/auth";

import "./Classe.css";
import Home from "../components/Classe/Home";
import Carrello from "../components/Classe/Carrello";

interface AppPage {
  url: string;
  icon: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: "Home",
    url: "/page/Classe/Home",
    icon: fastFood,
  },
  {
    title: "Carrello",
    url: "/page/Classe/Carrello",
    icon: cart,
  },
];

const Classe: React.FC = () => {
  const [ordine, setOrdine] = useState<Panino[]>([]);
  const location = useLocation();
  const [present, dismiss] = useIonToast();

  const [user, userLoading, userError] = useAuthState(auth);
  const history = useHistory();

  const getPanini = async () => {
    const querySnapshot = await getDocs(
      query(collection(db, "panini"), orderBy("conto", "desc"))
    );

    querySnapshot.forEach((doc) => {
      setOrdine((oldArray) => [
        ...oldArray,
        {
          id: doc.id,
          nome: doc.data().nome,
          prezzo: doc.data().prezzo,
          numero: 0,
        },
      ]);
    });
  };

  useEffect(() => {
    if (!user && !userLoading) {
      history.push("/page/Login");
    } else if (user && !userLoading) {
      const docRef = doc(db, "utenti", user.uid);

      getDoc(docRef).then((snap) => {
        if (snap.data()?.tipo === "fornitore") {
          history.push("/page/Fornitore");
        }
      });

      if (ordine.length <= 0) {
        getPanini();
      }
    }
  }, [user, userLoading]);

  return (
    <>
      <IonMenu contentId="classe" type="overlay">
        <IonContent>
          <IonList>
            <IonListHeader className="logo">Panini Vasari</IonListHeader>
            <IonNote className="email">{user?.email}</IonNote>
            {appPages.map((appPage, index) => {
              return (
                <IonMenuToggle key={index} autoHide={false}>
                  <IonItem
                    className={
                      location.pathname === appPage.url ? "selected" : ""
                    }
                    routerLink={appPage.url}
                    routerDirection="none"
                    lines="none"
                    detail={false}
                  >
                    <IonIcon slot="start" icon={appPage.icon} />
                    <IonLabel>{appPage.title}</IonLabel>
                  </IonItem>
                </IonMenuToggle>
              );
            })}
          </IonList>

          <div className="logout-button">
            <IonButton
              className="ion-text-capitalize logout-btn"
              size="large"
              onClick={() => {
                signOut(auth)
                  .then(() => {
                    present({
                      message: "Logout effettuato correttamente",
                      duration: 3000,
                      position: "top",
                    });
                  })
                  .catch((err) => {
                    console.log(err.message);
                  });
              }}
              fill="solid"
              expand="block"
            >
              Esci
              <IonIcon slot="end" icon={logInOutline}></IonIcon>
            </IonButton>
          </div>
        </IonContent>
      </IonMenu>

      <IonTabs>
        <IonRouterOutlet id="classe">
          <Route path="/page/Classe" exact={true}>
            <Redirect to="/page/Classe/Home" />
          </Route>
          <Route path="/page/Classe/Home" exact={true}>
            <Home ordine={ordine} setOrdine={setOrdine} />
          </Route>
          <Route path="/page/Classe/Carrello" exact={true}>
            <Carrello ordine={ordine} setOrdine={setOrdine} />
          </Route>
        </IonRouterOutlet>

        <IonTabBar slot="bottom" className="fornitore-tabs">
          <IonTabButton tab="home" href="/page/Classe/Home">
            <IonIcon icon={fastFood} />
            <IonLabel>Home</IonLabel>
          </IonTabButton>
          <IonTabButton tab="carrello" href="/page/Classe/Carrello">
            <IonIcon icon={cart} />
            <IonLabel>Carrello</IonLabel>
          </IonTabButton>
        </IonTabBar>
      </IonTabs>
    </>
  );
};

export default Classe;
