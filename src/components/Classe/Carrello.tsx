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
  IonThumbnail,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonPicker,
  useIonToast,
} from '@ionic/react';
import {
  informationCircleOutline,
  reorderTwo,
  restaurantOutline,
} from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { auth, db } from '../../firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection, useDocumentData } from 'react-firebase-hooks/firestore';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { Panino } from '../../types';

import './Carrello.css';
import UltimoOrdine from './UltimoOrdine';

const Carrello = ({
  ordine,
  setOrdine,
}: {
  ordine: Panino[];
  setOrdine: any;
}) => {
  const [segment, setSegment] = useState<string | undefined>('carrello');

  const [attiva, attivaLoading, attivaError] = useDocumentData(
    doc(db, 'attiva', 'AZBtxAIwCsLvNeu7RMwK'),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  const [user, userLoading, userError] = useAuthState(auth);
  const [panini, paniniLoading, paniniError] = useCollection(
    collection(db, 'panini'),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  const [nomeClasse, setNomeClasse] = useState<string>('');
  const [idClasse, setIdClasse] = useState<string>('');
  const [nomeStudente, setNomeStudente] = useState<string>('');

  const [presentPicker] = useIonPicker();
  const [presentToast, dismiss] = useIonToast();
  const [presentAlert] = useIonAlert();

  const history = useHistory();

  useEffect(() => {
    if (!user && !userLoading) {
      history.push('/page/Login');
    } else if (user && !userLoading) {
      const docRef = doc(db, 'utenti', user.uid);

      getDoc(docRef).then((snap) => {
        if (snap.data()?.tipo === 'fornitore') {
          history.push('/page/Fornitore');
        }

        setIdClasse(snap.data()?.classe);
        setNomeStudente(snap.data()?.nome);
        const classeRef = doc(db, 'classi', snap.data()?.classe);

        getDoc(classeRef).then((classeSnap) => {
          setNomeClasse(classeSnap.data()?.nome);
        });

        const ordineRef = doc(db, 'ordini', snap.data()?.classe);
        const listaRef = doc(ordineRef, 'lista', user.uid);
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
          <IonTitle>Ciao, {nomeStudente}</IonTitle>
        </IonToolbar>
        <IonToolbar className="segment-toolbar">
          <IonSegment
            value={segment}
            onIonChange={(e) => setSegment(e.detail.value?.toString())}
          >
            <IonSegmentButton className="ion-text-capitalize" value="carrello">
              Carrello
            </IonSegmentButton>
            <IonSegmentButton className="ion-text-capitalize" value="ordine">
              Ultimo Ordine
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {segment === 'carrello' ? (
          <>
            <div className="disp-header">
              <h1 className="ordini-text">
                <span>Carrello</span>
              </h1>

              <div className="totale-panini">
                <IonIcon icon={restaurantOutline} />
                <span>
                  {ordine.reduce((accumulator, object) => {
                    return accumulator + object.numero;
                  }, 0) === 1
                    ? ordine.reduce((accumulator, object) => {
                        return accumulator + object.numero;
                      }, 0) + ' panino'
                    : ordine.reduce((accumulator, object) => {
                        return accumulator + object.numero;
                      }, 0) + ' panini'}
                </span>
              </div>
            </div>

            {!(
              new Date(Date.now()).toLocaleTimeString() >=
                attiva?.inizio?.toDate().toLocaleTimeString() &&
              new Date(Date.now()).toLocaleTimeString() <=
                attiva?.fine?.toDate().toLocaleTimeString()
            ) &&
              !attivaLoading && (
                <p className="vendite-disattivate">
                  <IonIcon icon={informationCircleOutline} />
                  <span>
                    Al momento non puoi inviare un'ordine, dato che le vendite
                    sono state disattivate
                  </span>
                </p>
              )}

            <IonList lines="none">
              {ordine.reduce((accumulator, object) => {
                return accumulator + object.numero;
              }, 0) > 0 ? (
                ordine.map((panino) => (
                  <React.Fragment key={'paninoCarrello' + panino.id}>
                    {panino.numero > 0 && (
                      <IonItem
                        detail={false}
                        onClick={() => {
                          if (
                            panini?.docs
                              .filter((el) => el.id === panino.id)
                              .at(0)
                              ?.data().conto > 0
                          ) {
                            presentPicker({
                              columns: [
                                {
                                  name: 'num',
                                  options: range(
                                    0,
                                    panini?.docs
                                      .filter((el) => el.id === panino.id)
                                      .at(0)
                                      ?.data().conto
                                  ),
                                  selectedIndex: panino.numero,
                                },
                              ],
                              buttons: [
                                {
                                  text: 'Ok',
                                  role: 'confirm',
                                },
                              ],
                              onDidDismiss: (e: CustomEvent) => {
                                if (e.detail.data) {
                                  if (
                                    e.detail.role === 'confirm' &&
                                    parseInt(e.detail.data.num.value) >= 0 &&
                                    parseInt(e.detail.data.num.value) <=
                                      panini?.docs
                                        .filter((el) => el.id === panino.id)
                                        .at(0)
                                        ?.data().conto
                                  ) {
                                    const newState = ordine.map((obj) => {
                                      if (obj.id === panino.id) {
                                        return {
                                          ...obj,
                                          numero: parseInt(
                                            e.detail.data.num.value
                                          ),
                                        };
                                      }

                                      return obj;
                                    });

                                    setOrdine(newState);
                                  } else if (
                                    parseInt(e.detail.data.num.value) >
                                    panini?.docs
                                      .filter((el) => el.id === panino.id)
                                      .at(0)
                                      ?.data().conto
                                  ) {
                                    presentToast({
                                      message:
                                        'Il numero di panini selezionati è maggiore alla disponibilità',
                                      duration: 3000,
                                      position: 'top',
                                    });
                                  }
                                }
                              },
                            });
                          }
                        }}
                        button
                        key={panino.id}
                        className="disp-item"
                      >
                        <IonThumbnail slot="start">
                          <img
                            alt={panino.nome}
                            src={
                              panini?.docs
                                .filter((el) => el.id === panino.id)
                                .at(0)
                                ?.data().immagine
                            }
                          />
                        </IonThumbnail>
                        <IonLabel className="main-info">
                          <h1>{panino.nome}</h1>
                          <p>Quantià: {panino.numero}</p>
                        </IonLabel>
                        <IonLabel className="disp-info" slot="end">
                          <h1>
                            {(panino.numero * panino.prezzo)
                              .toFixed(2)
                              .replace('.', ',') + '€'}
                          </h1>
                        </IonLabel>
                      </IonItem>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <>
                  {!false && (
                    <p className="no-ordini">Il tuo carrello è vuoto</p>
                  )}
                </>
              )}
            </IonList>

            <hr />

            <div className="totale">
              <span className="totale-testo">Totale</span>
              <span className="totale-prezzo">
                {ordine
                  .reduce((accumulator, object) => {
                    return accumulator + object.prezzo * object.numero;
                  }, 0)
                  .toFixed(2)
                  .replace('.', ',')}
                €
              </span>
            </div>

            <br />

            <IonButton
              className="ion-text-capitalize consegna-btn"
              size="large"
              onClick={() => {
                presentAlert({
                  header: "Sei sicuro di voler procedere con l'ordine?",
                  message: "Non potrai modificare l'ordine",
                  buttons: [
                    { text: 'Indietro', role: 'cancel' },
                    { text: 'Si, Continua', role: 'confirm' },
                  ],
                  onDidDismiss: (e: CustomEvent) => {
                    if (e.detail.role === 'confirm') {
                      if (user) {
                        const ordRef = doc(db, 'ordini', idClasse);
                        const lRef = doc(ordRef, 'lista', user.uid);

                        getDoc(lRef).then((l) => {
                          if (l.exists()) {
                            presentToast({
                              message:
                                'Hai già inviato un ordine che non è stato cancellato',
                              duration: 3000,
                              position: 'top',
                            });
                          } else if (
                            ordine.filter(
                              (e) =>
                                e.numero >
                                panini?.docs
                                  .filter((el) => el.id === e.id)
                                  .at(0)
                                  ?.data().conto
                            ).length > 0
                          ) {
                            presentToast({
                              message:
                                'Il numero di panini ordinati è maggiore alla disponibilità',
                              duration: 3000,
                              position: 'top',
                            });
                          } else if (
                            user &&
                            ordine.length > 0 &&
                            ordine.filter((e) => e.numero > 0).length > 0
                          ) {
                            const totale = ordine.reduce(
                              (accumulator, object) => {
                                return (
                                  accumulator + object.prezzo * object.numero
                                );
                              },
                              0
                            );

                            const totalePanini = ordine.reduce(
                              (accumulator, object) => {
                                return accumulator + object.numero;
                              },
                              0
                            );

                            const ordineRef = doc(db, 'ordini', idClasse);

                            getDoc(ordineRef).then((ordineSnap) => {
                              if (ordineSnap.exists()) {
                                if (
                                  totalePanini &&
                                  totale &&
                                  nomeClasse &&
                                  ordine &&
                                  user &&
                                  nomeStudente
                                ) {
                                  const listaRef = doc(
                                    ordineRef,
                                    'lista',
                                    user.uid
                                  );

                                  setDoc(listaRef, {
                                    data: Timestamp.now(),
                                    panini: totalePanini,
                                    totale: totale,
                                    nome: nomeStudente,
                                    ordine: ordine.filter(function (obj) {
                                      return obj.numero > 0;
                                    }),
                                  });

                                  let newOrdine: Panino[] = [
                                    ...ordineSnap.data().ordine,
                                  ];

                                  ordine.forEach((pan: Panino) => {
                                    if (
                                      newOrdine.filter((el) => el.id === pan.id)
                                        .length > 0
                                    ) {
                                      // ce gia il panino
                                      const index = newOrdine.findIndex(
                                        (object) => {
                                          return object.id === pan.id;
                                        }
                                      );

                                      newOrdine[index] = {
                                        ...ordine[index],
                                        numero:
                                          newOrdine[index].numero + pan.numero,
                                        prezzo: newOrdine[index].prezzo,
                                      };
                                    } else {
                                      newOrdine.push({
                                        id: pan.id,
                                        nome: pan.nome,
                                        numero: pan.numero,
                                        prezzo: pan.prezzo,
                                      });
                                    }
                                  });

                                  updateDoc(ordineRef, {
                                    data: Timestamp.now(),
                                    panini:
                                      ordineSnap.data()?.panini + totalePanini,
                                    totale: ordineSnap.data()?.totale + totale,
                                    completato: false,
                                    ordine: newOrdine.filter(function (obj) {
                                      return obj.numero > 0;
                                    }),
                                  }).then(() => {
                                    ordine.forEach((el) => {
                                      const docRef = doc(db, 'panini', el.id);

                                      getDoc(docRef).then((snap) => {
                                        updateDoc(docRef, {
                                          conto: snap.data()?.conto - el.numero,
                                          vendite:
                                            snap.data()?.vendite + el.numero,
                                        });
                                      });

                                      let newState = [...ordine];

                                      const newArr = newState.map((obj) => {
                                        return { ...obj, numero: 0 };
                                      });

                                      setOrdine(newArr);
                                    });

                                    presentToast({
                                      message: 'Ordine Inviato!',
                                      duration: 3000,
                                      position: 'top',
                                    });
                                  });
                                } else {
                                  presentToast({
                                    message:
                                      "C'è stato un errore nell'invio dell'ordine, riprova",
                                    duration: 3000,
                                    position: 'top',
                                  });
                                }
                              } else {
                                if (
                                  totalePanini &&
                                  totale &&
                                  nomeClasse &&
                                  ordine &&
                                  user &&
                                  nomeStudente
                                ) {
                                  const listaRef = doc(
                                    ordineRef,
                                    'lista',
                                    user.uid
                                  );

                                  setDoc(listaRef, {
                                    data: Timestamp.now(),
                                    panini: totalePanini,
                                    totale: totale,
                                    nome: nomeStudente,
                                    ordine: ordine.filter(function (obj) {
                                      return obj.numero > 0;
                                    }),
                                  });

                                  setDoc(ordineRef, {
                                    data: Timestamp.now(),
                                    panini: totalePanini,
                                    totale: totale,
                                    classe: nomeClasse,
                                    completato: false,
                                    ordine: ordine.filter(function (obj) {
                                      return obj.numero > 0;
                                    }),
                                  }).then(() => {
                                    ordine.forEach((el) => {
                                      const docRef = doc(db, 'panini', el.id);

                                      getDoc(docRef).then((snap) => {
                                        updateDoc(docRef, {
                                          conto: snap.data()?.conto - el.numero,
                                          vendite:
                                            snap.data()?.vendite + el.numero,
                                        });
                                      });

                                      let newState = [...ordine];

                                      const newArr = newState.map((obj) => {
                                        return { ...obj, numero: 0 };
                                      });

                                      setOrdine(newArr);
                                    });

                                    presentToast({
                                      message: 'Ordine Inviato!',
                                      duration: 3000,
                                      position: 'top',
                                    });
                                  });
                                } else {
                                  presentToast({
                                    message:
                                      "C'è stato un errore nell'invio dell'ordine, riprova",
                                    duration: 3000,
                                    position: 'top',
                                  });
                                }
                              }
                            });
                          } else {
                            presentToast({
                              message: 'Informazioni non valide',
                              duration: 3000,
                              position: 'top',
                            });
                          }
                        });
                      }
                    } else {
                    }
                  },
                });
              }}
              fill="solid"
              expand="block"
              disabled={
                !(
                  new Date(Date.now()).toLocaleTimeString() >=
                    attiva?.inizio?.toDate().toLocaleTimeString() &&
                  new Date(Date.now()).toLocaleTimeString() <=
                    attiva?.fine?.toDate().toLocaleTimeString()
                ) ||
                ordine.reduce((accumulator, object) => {
                  return accumulator + object.numero;
                }, 0) <= 0
              }
            >
              Ordina (
              {ordine
                .reduce((accumulator, object) => {
                  return accumulator + object.prezzo * object.numero;
                }, 0)
                .toFixed(2)
                .replace('.', ',')}
              €)
            </IonButton>
          </>
        ) : (
          user && (
            <UltimoOrdine idClasse={idClasse} panini={panini} uid={user.uid} />
          )
        )}
      </IonContent>
    </IonPage>
  );
};

export default Carrello;
