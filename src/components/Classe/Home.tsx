import {
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonMenuButton,
  IonPage,
  IonRow,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonText,
  IonTitle,
  IonToolbar,
  useIonPicker,
  useIonToast,
} from '@ionic/react';
import { informationCircleOutline, reorderTwo } from 'ionicons/icons';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { auth, db } from '../../firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection, useDocumentData } from 'react-firebase-hooks/firestore';
import { collection, doc, getDoc, orderBy, query } from 'firebase/firestore';
import { Panino } from '../../types';

import './Home.css';

const Home = ({ ordine, setOrdine }: { ordine: Panino[]; setOrdine: any }) => {
  const [segment, setSegment] = useState<string | undefined>('popolari');

  const [attiva, attivaLoading, attivaError] = useDocumentData(
    doc(db, 'attiva', 'AZBtxAIwCsLvNeu7RMwK'),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  const [user, userLoading, userError] = useAuthState(auth);
  const [panini, paniniLoading, paniniError] = useCollection(
    query(collection(db, 'panini'), orderBy('conto', 'desc')),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  const [text, setText] = useState<string | undefined>('');

  const [nomeClasse, setNomeClasse] = useState<string>('');
  const [nomeStudente, setNomeStudente] = useState<string>('');

  const [presentPicker] = useIonPicker();
  const [presentToast, dismiss] = useIonToast();

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

        setNomeStudente(snap.data()?.nome);
        const classeRef = doc(db, 'classi', snap.data()?.classe);

        getDoc(classeRef).then((classeSnap) => {
          setNomeClasse(classeSnap.data()?.nome);
        });
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
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <IonText>
          <h1 className="vuoi-ordinare">
            Cosa Vuoi <span>Ordinare?</span>
          </h1>
        </IonText>

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
                Al momento non puoi inviare un'ordine, dato che le vendite sono
                state disattivate
              </span>
            </p>
          )}

        <IonSearchbar
          onIonChange={(e) => setText(e.detail.value?.toString())}
          className="custom ion-no-padding"
          placeholder="Cerca..."
        />

        <IonText color="primary">
          <h2 className="menu-label">Menu</h2>
        </IonText>

        <IonSegment
          value={segment}
          onIonChange={(e) => setSegment(e.detail.value?.toString())}
        >
          <IonSegmentButton className="ion-text-capitalize" value="popolari">
            Popolari
          </IonSegmentButton>
          <IonSegmentButton className="ion-text-capitalize" value="tutti">
            Tutti
          </IonSegmentButton>
        </IonSegment>

        <br />

        <IonGrid className="ion-no-padding">
          {segment === 'popolari' ? (
            <>
              {ordine
                .sort((a, b) => {
                  return (
                    panini?.docs
                      .filter((el) => el.id === b.id)
                      .at(0)
                      ?.data().vendite -
                    panini?.docs
                      .filter((el) => el.id === a.id)
                      .at(0)
                      ?.data().vendite
                  );
                })
                .filter(
                  (el) =>
                    panini?.docs
                      .filter((p) => el.id === p.id)
                      .at(0)
                      ?.data().conto > 0
                )
                .filter((q) => {
                  if (text) {
                    return (
                      q.nome.toLowerCase().indexOf(text.toLowerCase()) > -1
                    );
                  } else {
                    return true;
                  }
                })
                .reduce(function (rows: any, key, index) {
                  return (
                    (index % 2 == 0
                      ? rows.push([key])
                      : rows[rows.length - 1].push(key)) && rows
                  );
                }, [])
                .map((coppia: Panino[], index: number) => (
                  <IonRow key={'coppiaPanino' + index}>
                    {coppia.map((panino) => (
                      <IonCol
                        key={'colPanino' + panino.id}
                        size="6"
                        className="ion-no-padding"
                      >
                        {panino.numero > 0 && (
                          <div className="badge">
                            <span>{panino.numero}</span>
                          </div>
                        )}
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
                          lines="none"
                          className="panino ion-no-padding"
                          button
                        >
                          <div
                            className={`${
                              panini?.docs
                                .filter((el) => el.id === panino.id)
                                .at(0)
                                ?.data().conto <= 0 && 'conto-zero'
                            }`}
                          >
                            <IonImg
                              alt={panino.nome}
                              src={
                                panini?.docs
                                  .filter((el) => el.id === panino.id)
                                  .at(0)
                                  ?.data().immagine
                              }
                            />
                            <h1 className="card-nome">{panino.nome}</h1>
                            <div className="card-disp">
                              Disponibilità:{' '}
                              {
                                panini?.docs
                                  .filter((el) => el.id === panino.id)
                                  .at(0)
                                  ?.data().conto
                              }
                            </div>
                            <div className="card-prezzo">{panino.prezzo}€</div>
                          </div>
                        </IonItem>
                      </IonCol>
                    ))}
                  </IonRow>
                ))}
            </>
          ) : (
            <>
              {ordine
                .sort((a, b) => {
                  return (
                    panini?.docs
                      .filter((el) => el.id === b.id)
                      .at(0)
                      ?.data().conto -
                    panini?.docs
                      .filter((el) => el.id === a.id)
                      .at(0)
                      ?.data().conto
                  );
                })
                .filter((q) => {
                  if (text) {
                    return (
                      q.nome.toLowerCase().indexOf(text.toLowerCase()) > -1
                    );
                  } else {
                    return true;
                  }
                })
                .reduce(function (rows: any, key, index) {
                  return (
                    (index % 2 == 0
                      ? rows.push([key])
                      : rows[rows.length - 1].push(key)) && rows
                  );
                }, [])
                .map((coppia: Panino[], index: number) => (
                  <IonRow key={'rowPanino' + index}>
                    {coppia.map((panino) => (
                      <IonCol
                        key={'copPanino' + panino.id}
                        size="6"
                        className="ion-no-padding"
                      >
                        {panino.numero > 0 && (
                          <div className="badge">
                            <span>{panino.numero}</span>
                          </div>
                        )}
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
                          lines="none"
                          className="panino ion-no-padding"
                          button
                        >
                          <div
                            className={`${
                              panini?.docs
                                .filter((el) => el.id === panino.id)
                                .at(0)
                                ?.data().conto <= 0 && 'conto-zero'
                            }`}
                          >
                            <IonImg
                              alt={panino.nome}
                              src={
                                panini?.docs
                                  .filter((el) => el.id === panino.id)
                                  .at(0)
                                  ?.data().immagine
                              }
                            />
                            <h1 className="card-nome">{panino.nome}</h1>
                            <div className="card-disp">
                              Disponibilità:{' '}
                              {
                                panini?.docs
                                  .filter((el) => el.id === panino.id)
                                  .at(0)
                                  ?.data().conto
                              }
                            </div>
                            <div className="card-prezzo">{panino.prezzo}€</div>
                          </div>
                        </IonItem>
                      </IonCol>
                    ))}
                  </IonRow>
                ))}
            </>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Home;
