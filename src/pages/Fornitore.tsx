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
} from '@ionic/react';
import { home, logInOutline } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { Redirect, Route, useHistory, useLocation } from 'react-router';
import { auth, db } from '../firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import './Fornitore.css';
import Home from '../components/Fornitore/Home';
import Ordine from '../components/Fornitore/Ordine';
import { signOut } from 'firebase/auth';

interface AppPage {
  url: string;
  icon: string;
  title: string;
}

const appPages: AppPage[] = [
  {
    title: 'Home',
    url: '/page/Fornitore/Home',
    icon: home,
  },
  // {
  //   title: 'Ordini',
  //   url: '/page/Fornitore/Ordine',
  //   icon: fastFood,
  // },
];

const Fornitore: React.FC = () => {
  const location = useLocation();
  const [present, dismiss] = useIonToast();

  const [user, userLoading, userError] = useAuthState(auth);
  const [funzione, setFunzione] = useState('');
  const history = useHistory();

  useEffect(() => {
    if (!user && !userLoading) {
      history.push('/page/Login');
    } else if (user && !userLoading) {
      const docRef = doc(db, 'utenti', user.uid);

      getDoc(docRef).then((snap) => {
        if (snap.data()?.tipo === 'cliente') {
          history.push('/page/Classe');
        }

        setFunzione(snap.data()?.funzione);
      });
    }
  }, [user, userLoading, history]);

  return (
    <>
      <IonMenu contentId="fornitore" type="overlay">
        <IonContent>
          <IonList>
            <IonListHeader className="logo">Panini Vasari</IonListHeader>
            <IonNote className="email">{user?.email}</IonNote>
            {appPages.map((appPage, index) => {
              return (
                <IonMenuToggle key={index} autoHide={false}>
                  <IonItem
                    className={
                      location.pathname === appPage.url ? 'selected' : ''
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
                      message: 'Logout effettuato correttamente',
                      duration: 3000,
                      position: 'top',
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
        <IonRouterOutlet id="fornitore">
          <Route path="/page/Fornitore" exact={true}>
            <Redirect to="/page/Fornitore/Home" />
          </Route>
          <Route path="/page/Fornitore/Home" exact={true}>
            {funzione === 'DISP' ? <Home /> : <Ordine />}
          </Route>
          {/* <Route path="/page/Fornitore/Ordine" exact={true}>
            <Ordine />
          </Route> */}
        </IonRouterOutlet>

        <IonTabBar slot="bottom" className="fornitore-tabs">
          <IonTabButton tab="home" href="/page/Fornitore/Home">
            <IonIcon icon={home} />
            <IonLabel>Home</IonLabel>
          </IonTabButton>
          {/* <IonTabButton tab="ordine" href="/page/Fornitore/Ordine">
            <IonIcon icon={fastFood} />
            <IonLabel>Ordini</IonLabel>
          </IonTabButton> */}
        </IonTabBar>
      </IonTabs>
    </>
  );
};

export default Fornitore;
