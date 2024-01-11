import {
  IonIcon,
  IonItem,
  IonLabel,
  IonProgressBar,
  IonRippleEffect,
  IonSpinner,
  IonText,
  IonToggle,
  useIonAlert,
  useIonToast,
} from '@ionic/react';
import {
  collection,
  doc,
  getDoc,
  query,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { card, cart, cash, checkmarkDone } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  useCollection,
  useDocument,
  useDocumentData,
} from 'react-firebase-hooks/firestore';
import { useHistory } from 'react-router';
import { auth, db } from '../../firebaseConfig';

const Stato = () => {
  const history = useHistory();
  const [presentAlert] = useIonAlert();
  const [presentToast, dismiss] = useIonToast();
  const [editor, setEditor] = useState<boolean>(false);

  const [user, userLoading, userError] = useAuthState(auth);

  const [ordini, ordiniLoading, ordiniError] = useCollection(
    collection(db, 'ordini'),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  const [ordiniConsegnati, ordiniConsegnatiLoading, ordiniConsegnatiError] =
    useCollection(
      query(collection(db, 'ordini'), where('completato', '==', true)),
      {
        snapshotListenOptions: { includeMetadataChanges: true },
      }
    );

  const [attiva, attivaLoading, attivaError] = useDocumentData(
    doc(db, 'attiva', 'AZBtxAIwCsLvNeu7RMwK'),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

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

  return (
    <>
      <IonText>
        <h1 className="stato-vendite">
          Stato <span>Vendite</span>
        </h1>
      </IonText>

      <div
        // onClick={() => history.push('/page/Fornitore/Ordine')}
        className="widget-vendite"
      >
        <div className="widget-item">
          <div className="widget-chip">
            <span>Ordini</span>
            <IonIcon icon={cart} />
          </div>
          <span className="widget-number">
            {ordiniLoading && <IonSpinner color="primary" />}
            {ordini && ordini.size}
          </span>
        </div>
        <div className="widget-item">
          <div className="widget-chip">
            <span>Consegnati</span>
            <IonIcon icon={checkmarkDone} />
          </div>
          <span className="widget-number">
            {ordiniConsegnatiLoading && <IonSpinner color="primary" />}
            {ordiniConsegnati && ordiniConsegnati.size}
          </span>
        </div>
        <IonRippleEffect />
      </div>

      <br />

      <div>
        <div className="progress-top">
          <span>Ordini Consegnati</span>
          <span>
            {ordiniConsegnati && ordini && ordini.size !== 0
              ? ((ordiniConsegnati.size / ordini.size) * 100).toFixed(0)
              : 0}
            %
          </span>
        </div>
        <IonProgressBar
          type={ordiniLoading ? 'indeterminate' : 'determinate'}
          value={
            ordiniConsegnati && ordini && ordini.size !== 0
              ? ordiniConsegnati.size / ordini.size
              : 0
          }
        />
        <span className="progress-note">
          {ordini && ordiniConsegnati && ordini.size !== 0
            ? ordini.size - ordiniConsegnati.size <= 0
              ? 'Tutti gli ordini sono stati consegnati'
              : ordini.size - ordiniConsegnati.size + ' ancora da consegnare'
            : '0 ancora da consegnare'}
        </span>
      </div>

      <br />

      <div className="widget-vendite">
        <div className="widget-item">
          <div className="widget-chip">
            <span>Guadagno</span>
            <IonIcon icon={cash} />
          </div>
          <span className="widget-number">
            {ordiniConsegnatiLoading && <IonSpinner color="primary" />}
            {ordiniConsegnati &&
              ordiniConsegnati.docs
                .reduce(function (prev, current) {
                  return prev + current.data().totale;
                }, 0)
                .toFixed(2)
                .replace('.', ',') + '€'}
          </span>
        </div>
      </div>

      <br />

      <IonText>
        <h1 className="stato-vendite">
          Accetta Nuovi <span>Ordini</span>
        </h1>
      </IonText>

      <IonItem detail={false} className="vendite-attive" lines="none">
        <IonIcon icon={card} slot="start" />
        <IonLabel>Vendite Attive</IonLabel>
        <IonToggle
          disabled={true}
          checked={
            new Date(Date.now()).toLocaleTimeString() >=
              attiva?.inizio?.toDate().toLocaleTimeString() &&
            new Date(Date.now()).toLocaleTimeString() <=
              attiva?.fine?.toDate().toLocaleTimeString()
          }
          slot="end"
        />
      </IonItem>
    </>
  );
};

export default Stato;
