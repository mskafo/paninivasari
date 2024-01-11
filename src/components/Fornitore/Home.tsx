import {
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonThumbnail,
  IonTitle,
  IonToolbar,
  useIonPicker,
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { auth, db } from '../../firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import {
  collection,
  doc,
  getDoc,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';
import './Home.css';
import { reorderTwo } from 'ionicons/icons';
import Stato from './Stato';
import ItemLoading from '../common/ItemLoading';

const Home: React.FC = () => {
  const [segment, setSegment] = useState<string | undefined>('stato');

  const [user, userLoading, userError] = useAuthState(auth);
  const [panini, paniniLoading, paniniError] = useCollection(
    query(collection(db, 'panini'), orderBy('conto', 'desc')),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  const [editor, setEditor] = useState<boolean>(false);

  const [presentPicker] = useIonPicker();

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
        setEditor(snap.data()?.editor);
      });
    }
  }, [user, userLoading]);

  function range(start: number, end: number) {
    var ans = [];
    for (let i = start; i <= end; i++) {
      ans.push({ text: i.toString(), value: i });
    }
    return ans;
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="menu-toolbar">
          <IonButtons slot="start">
            <IonMenuButton>
              <IonIcon icon={reorderTwo} />
            </IonMenuButton>
          </IonButtons>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
        {editor && (
          <IonToolbar className="segment-toolbar">
            <IonSegment
              value={segment}
              onIonChange={(e) => setSegment(e.detail.value?.toString())}
            >
              <IonSegmentButton className="ion-text-capitalize" value="stato">
                Stato Vendite
              </IonSegmentButton>
              <IonSegmentButton className="ion-text-capitalize" value="disp">
                Disponibilità
              </IonSegmentButton>
            </IonSegment>
          </IonToolbar>
        )}
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {segment === 'stato' ? (
          <Stato />
        ) : (
          <>
            {editor && (
              <>
                <IonText>
                  <h1 className="disp-text">
                    <span>Disponibilità</span>
                  </h1>
                </IonText>
                <IonList lines="none">
                  {paniniLoading &&
                    [0, 1, 2].map((el) => <ItemLoading key={el} />)}
                  {panini?.docs.map((panino) => (
                    <IonItem
                      detail={false}
                      onClick={() => {
                        presentPicker({
                          columns: [
                            {
                              name: 'num',
                              options: range(0, 200),
                              selectedIndex: panino.data().conto,
                            },
                          ],
                          buttons: [
                            {
                              text: 'Ok',
                              role: 'confirm',
                            },
                          ],
                          onDidDismiss: (e: CustomEvent) => {
                            if (
                              e.detail.role === 'confirm' &&
                              parseInt(e.detail.data.num.value) >= 0
                            ) {
                              const docRef = doc(db, 'panini', panino.id);

                              updateDoc(docRef, {
                                conto: parseInt(e.detail.data.num.value),
                              });
                            }
                          },
                        });
                      }}
                      button
                      key={'paninoHome' + panino.id}
                      className={`disp-item ${
                        panino.data().conto <= 0 && 'disp-zero'
                      }`}
                    >
                      <IonThumbnail slot="start">
                        <img
                          alt={panino.data().nome}
                          src={panino.data().immagine}
                        />
                      </IonThumbnail>
                      <IonLabel className="main-info">
                        <h1>{panino.data().nome}</h1>
                        <p>{panino.data()?.prezzo}€</p>
                      </IonLabel>
                      <IonLabel className="disp-info" slot="end">
                        <h1>{panino.data().conto}</h1>
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              </>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
