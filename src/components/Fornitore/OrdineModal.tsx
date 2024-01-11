import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSkeletonText,
  IonTitle,
  IonToolbar,
  useIonAlert,
} from '@ionic/react';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import {
  checkmarkDone,
  repeat,
  restaurantOutline,
  timeOutline,
  trashOutline,
} from 'ionicons/icons';
import { useCollection, useDocument } from 'react-firebase-hooks/firestore';
import { db } from '../../firebaseConfig';

import './OrdineModal.css';

import TimeAgo from 'javascript-time-ago';
import it from 'javascript-time-ago/locale/it';
import { Panino } from '../../types';
import React, { useState } from 'react';

TimeAgo.setDefaultLocale(it.locale);
TimeAgo.addLocale(it);

const timeAgo = new TimeAgo('it-IT');

const OrdineModal = ({
  id,
  onDismiss,
  editor,
}: {
  id: string;
  onDismiss: () => void;
  editor: boolean;
}) => {
  const [scheda, schedaLoading, schedaError] = useDocument(
    doc(db, 'ordini', id),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  const [lista, listaLoading, listaError] = useCollection(
    collection(doc(db, 'ordini', id), 'lista'),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  const [segment, setSegment] = useState<string | undefined>('totale');
  const [presentAlert] = useIonAlert();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="menu-toolbar">
          <IonButtons slot="start">
            <IonButton className="indietro-btn" onClick={() => onDismiss()}>
              Indietro
            </IonButton>
          </IonButtons>
          <IonTitle>Ordine {scheda?.data()?.classe}</IonTitle>
        </IonToolbar>
        <IonToolbar className="segment-toolbar">
          <IonSegment
            value={segment}
            onIonChange={(e) => setSegment(e.detail.value?.toString())}
          >
            <IonSegmentButton className="ion-text-capitalize" value="totale">
              Totale
            </IonSegmentButton>
            <IonSegmentButton className="ion-text-capitalize" value="studenti">
              Studenti
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ordine-content">
        {segment === 'totale' ? (
          <>
            <div className="disp-header">
              <h1 className="ordine-text">
                {schedaLoading && (
                  <IonSkeletonText
                    animated={true}
                    style={{ width: '8rem', height: '2rem' }}
                  />
                )}
                <span>{scheda?.data()?.classe}</span>
              </h1>

              {editor && (
                <IonButton
                  onClick={() => {
                    presentAlert({
                      header:
                        'Sei sicuro di voler cancellare gli ordini di questa classe?',
                      message: 'Non potrai recuperarli successivamente',
                      buttons: [
                        { text: 'Indietro', role: 'cancel' },
                        { text: 'Si, Continua', role: 'confirm' },
                      ],
                      onDidDismiss: (e: CustomEvent) => {
                        if (e.detail.role === 'confirm') {
                          onDismiss();
                          const ordineRef = doc(db, 'ordini', id);
                          const listaRef = collection(ordineRef, 'lista');

                          getDocs(listaRef).then((snap) => {
                            snap.forEach((s) => {
                              deleteDoc(s.ref);
                            });
                          });

                          deleteDoc(ordineRef);
                        }
                      },
                    });
                  }}
                  className="cancel-btn"
                  fill="clear"
                >
                  <span>Cancella ordini</span>
                  <IonIcon icon={trashOutline} />
                </IonButton>
              )}
            </div>

            <div className="ordine-info">
              <div>
                <IonIcon icon={timeOutline} />
                <span>
                  {schedaLoading && (
                    <IonSkeletonText
                      animated={true}
                      style={{ width: '4rem' }}
                    />
                  )}
                  {scheda &&
                    scheda.data() &&
                    timeAgo.format(
                      new Date(scheda.data()?.data.seconds * 1000)
                    )}
                </span>
              </div>
              <div>
                <IonIcon icon={restaurantOutline} />
                <span>
                  {schedaLoading && (
                    <IonSkeletonText
                      animated={true}
                      style={{ width: '4rem' }}
                    />
                  )}
                  {scheda?.data()?.panini === 1
                    ? scheda?.data()?.panini + ' panino'
                    : scheda?.data()?.panini + ' panini'}
                </span>
              </div>
            </div>

            <br />

            <div className="scheda">
              {schedaLoading && (
                <IonSkeletonText animated={true} style={{ width: '100%' }} />
              )}
              {scheda &&
                scheda.data()?.ordine.map((item: Panino) => (
                  <React.Fragment key={uuidv4()}>
                    {item.prezzo * item.numero > 0 && (
                      <div className="scheda-panino">
                        <span className="panino-nome">
                          {item.nome} x {item.numero}
                        </span>
                        <span className="panino-prezzo">
                          {(item.prezzo * item.numero).toFixed(2)}€
                        </span>
                      </div>
                    )}
                  </React.Fragment>
                ))}
            </div>

            <hr />

            {schedaLoading && (
              <IonSkeletonText
                animated={true}
                style={{ width: '100%', height: '1.4rem' }}
              />
            )}

            <div className="totale">
              <span className="totale-testo">Totale</span>
              <span className="totale-prezzo">
                {scheda?.data()?.totale.toFixed(2)}€
              </span>
            </div>

            <br />
            <br />

            <IonButton
              className="ion-text-capitalize consegna-btn"
              size="large"
              onClick={() => {
                if (scheda) {
                  onDismiss();

                  const docRef = doc(db, 'ordini', scheda.id);

                  updateDoc(docRef, {
                    completato: !scheda.data()?.completato,
                  });
                }
              }}
              fill="solid"
              expand="block"
            >
              {!scheda?.data()?.completato
                ? 'Segna come consegnato'
                : 'Segna da consegnare'}
              <IonIcon
                slot="end"
                icon={!scheda?.data()?.completato ? checkmarkDone : repeat}
              />
            </IonButton>
          </>
        ) : (
          <>
            {listaLoading && (
              <IonList lines="none" className="ion-no-padding">
                <IonItem detail={false} className="disp-item">
                  <IonLabel className="studente-info">
                    <IonSkeletonText
                      animated={true}
                      style={{ width: '100%' }}
                    />
                    <div className="ordine-info">
                      <IonSkeletonText
                        animated={true}
                        style={{ width: '60%' }}
                      />
                    </div>
                    <br />
                    <div className="scheda">
                      <IonSkeletonText
                        animated={true}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <hr />

                    <IonSkeletonText
                      animated={true}
                      style={{ width: '100%', height: '1.4rem' }}
                    />
                  </IonLabel>
                </IonItem>
              </IonList>
            )}

            {lista && !lista.empty && (
              <IonList lines="none" className="ion-no-padding">
                {lista.docs.map((el) => (
                  <IonItem
                    detail={false}
                    className="disp-item"
                    key={'listaModal' + el.id}
                  >
                    <IonLabel className="studente-info">
                      <h1>{el.data().nome}</h1>
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
                      <div className="scheda">
                        {el.data().ordine.map((item: Panino) => (
                          <React.Fragment key={'schedaModal' + item.id}>
                            {item.prezzo * item.numero > 0 && (
                              <div className="scheda-panino">
                                <span className="panino-nome">
                                  {item.nome} x {item.numero}
                                </span>
                                <span className="panino-prezzo">
                                  {(item.prezzo * item.numero).toFixed(2)}€
                                </span>
                              </div>
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      <hr />

                      <div className="studente-totale">
                        <span className="studente-totale-testo">Totale</span>
                        <span className="studente-totale-prezzo">
                          {el.data()?.totale.toFixed(2)}€
                        </span>
                      </div>
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default OrdineModal;
