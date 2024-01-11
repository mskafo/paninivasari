import {
  IonButton,
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
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonModal,
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { auth, db } from '../../firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import './Ordine.css';
import {
  reorderTwo,
  restaurantOutline,
  timeOutline,
  trashOutline,
} from 'ionicons/icons';

import TimeAgo from 'javascript-time-ago';
import it from 'javascript-time-ago/locale/it';
import OrdineModal from './OrdineModal';
import Stato from './Stato';
import ItemLoading from '../common/ItemLoading';

TimeAgo.setDefaultLocale(it.locale);
TimeAgo.addLocale(it);

const timeAgo = new TimeAgo('it-IT');

const Ordine: React.FC = () => {
  const [editor, setEditor] = useState<boolean>(false);
  const [ordineId, setOrdineId] = useState('');
  const [segment, setSegment] = useState<string | undefined>('stato');
  const [presentModal, dismiss] = useIonModal(OrdineModal, {
    editor: editor,
    id: ordineId,
    onDismiss: () => dismiss(),
  });
  const [presentAlert] = useIonAlert();

  const [
    ordiniDaConsegnare,
    ordiniDaConsegnareLoading,
    ordiniDaConsegnareError,
  ] = useCollection(
    query(
      collection(db, 'ordini'),
      where('completato', '==', false),
      orderBy('data', 'desc')
    ),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  const [ordiniConsegnati, ordiniConsegnatiLoading, ordiniConsegnatiError] =
    useCollection(
      query(
        collection(db, 'ordini'),
        where('completato', '==', true),
        orderBy('data', 'desc')
      ),
      {
        snapshotListenOptions: { includeMetadataChanges: true },
      }
    );

  const [user, userLoading, userError] = useAuthState(auth);

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

  const resetOrdini = async () => {
    const ordiniRef = collection(db, 'ordini');

    const querySnapshot = await getDocs(ordiniRef);

    querySnapshot.forEach((el) => {
      const listaRef = collection(el.ref, 'lista');

      getDocs(listaRef).then((snap) => {
        snap.forEach((s) => {
          deleteDoc(s.ref);
        });
      });

      deleteDoc(el.ref);
    });
  };

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
        <IonToolbar className="segment-toolbar">
          <IonSegment
            value={segment}
            onIonChange={(e) => setSegment(e.detail.value?.toString())}
          >
            <IonSegmentButton className="ion-text-capitalize" value="stato">
              Stato Vendite
            </IonSegmentButton>
            <IonSegmentButton className="ion-text-capitalize" value="ord">
              Ordini
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {segment === 'stato' ? (
          <Stato />
        ) : (
          <>
            <div className="disp-header">
              <h1 className="ordini-text">
                <span>Ordini</span>
              </h1>

              {editor && (
                <IonButton
                  onClick={() => {
                    presentAlert({
                      header:
                        'Sei sicuro di voler cancellare tutti gli ordini?',
                      message: 'Non potrai recuperare gli ordini cancellati',
                      buttons: [
                        { text: 'Indietro', role: 'cancel' },
                        { text: 'Si, Continua', role: 'confirm' },
                      ],
                      onDidDismiss: (e: CustomEvent) => {
                        if (e.detail.role === 'confirm') {
                          resetOrdini();
                        }
                      },
                    });
                  }}
                  className="cancel-btn"
                  fill="clear"
                >
                  <span>Cancella tutto</span>
                  <IonIcon icon={trashOutline} />
                </IonButton>
              )}
            </div>

            <IonText color="primary">
              <h2 className="ordine-label">Da Consegnare</h2>
            </IonText>
            <IonList lines="none" className="ion-no-padding">
              {ordiniDaConsegnareLoading && <ItemLoading />}
            </IonList>

            {ordiniDaConsegnare?.size! > 0 ? (
              <IonList lines="none" className="ion-no-padding">
                {ordiniDaConsegnare?.docs.map((el) => (
                  <IonItem
                    detail={false}
                    onClick={() => {
                      setOrdineId(el.id);

                      presentModal({
                        cssClass: 'ordine-modal',
                        // initialBreakpoint: 0.6,
                        // breakpoints: [1, 0.6, 0.75],
                      });
                    }}
                    className="disp-item"
                    key={'daConsegnare' + el.id}
                    button
                  >
                    <IonLabel className="main-info">
                      <h1>{el.data().classe}</h1>
                      <div className="ordine-info">
                        <div>
                          <IonIcon icon={timeOutline} />
                          <span>
                            {timeAgo.format(
                              new Date(el.data().data.seconds * 1000)
                            )}
                          </span>
                        </div>
                        <div>
                          <IonIcon icon={restaurantOutline} />
                          <span>
                            {el.data().panini === 1
                              ? el.data().panini + ' panino'
                              : el.data().panini + ' panini'}
                          </span>
                        </div>
                      </div>
                    </IonLabel>
                    <IonLabel className="prezzo" slot="end">
                      <h1>{el.data().totale.toFixed(2)}€</h1>
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            ) : (
              !ordiniDaConsegnareLoading && (
                <p className="no-ordini">
                  Al momento non ci sono ordini da consegnare
                </p>
              )
            )}

            <IonText color="primary">
              <h2 className="ordine-label">Consegnati</h2>
            </IonText>

            <IonList lines="none" className="ion-no-padding">
              {ordiniConsegnatiLoading && <ItemLoading />}
            </IonList>

            {ordiniConsegnati?.size! > 0 ? (
              <IonList lines="none" className="ion-no-padding">
                {ordiniConsegnati?.docs.map((el) => (
                  <IonItem
                    detail={false}
                    onClick={() => {
                      setOrdineId(el.id);

                      presentModal({
                        cssClass: 'ordine-modal',
                        // initialBreakpoint: 0.6,
                        // breakpoints: [0, 0.6, 0.75],
                      });
                    }}
                    className="disp-item"
                    key={'consegnati' + el.id}
                    button
                  >
                    <IonLabel className="main-info">
                      <h1 className="classe-consegnato">{el.data().classe}</h1>
                      <div className="ordine-info">
                        <div>
                          <IonIcon icon={timeOutline} />
                          <span>
                            {timeAgo.format(
                              new Date(el.data().data.seconds * 1000)
                            )}
                          </span>
                        </div>
                        <div>
                          <IonIcon icon={restaurantOutline} />
                          <span>
                            {el.data().panini === 1
                              ? el.data().panini + ' panino'
                              : el.data().panini + ' panini'}
                          </span>
                        </div>
                      </div>
                    </IonLabel>
                    <IonLabel className="prezzo" slot="end">
                      <h1 className="prezzo-consegnato">
                        {el.data().totale.toFixed(2)}€
                      </h1>
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            ) : (
              !ordiniConsegnatiLoading && (
                <p className="no-ordini">
                  Non hai ancora consegnato nessun ordine
                </p>
              )
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Ordine;
