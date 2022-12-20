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
  IonProgressBar,
  IonSegment,
  IonSegmentButton,
  IonSkeletonText,
  IonSpinner,
  IonText,
  IonThumbnail,
  IonTitle,
  IonToggle,
  IonToolbar,
  useIonAlert,
  useIonPicker,
  useIonToast,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { auth, db } from "../../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection, useDocument } from "react-firebase-hooks/firestore";
import {
  collection,
  doc,
  getDoc,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import "./Home.css";
import {
  card,
  cart,
  cash,
  checkmarkDone,
  fastFood,
  reorderTwo,
  time,
} from "ionicons/icons";

const Home: React.FC = () => {
  const [segment, setSegment] = useState<string | undefined>("stato");

  const [ordini, ordiniLoading, ordiniError] = useCollection(
    collection(db, "ordini"),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  const [ordiniConsegnati, ordiniConsegnatiLoading, ordiniConsegnatiError] =
    useCollection(
      query(collection(db, "ordini"), where("completato", "==", true)),
      {
        snapshotListenOptions: { includeMetadataChanges: true },
      }
    );

  const [attiva, attivaLoading, attivaError] = useDocument(
    doc(db, "attiva", "AZBtxAIwCsLvNeu7RMwK"),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  const [user, userLoading, userError] = useAuthState(auth);
  const [panini, paniniLoading, paniniError] = useCollection(
    query(collection(db, "panini"), orderBy("conto", "desc")),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  const [tipo, setTipo] = useState<string>("");
  const [editor, setEditor] = useState<boolean>(false);

  const [presentPicker] = useIonPicker();
  const [presentAlert] = useIonAlert();
  const [presentToast, dismiss] = useIonToast();

  const history = useHistory();

  useEffect(() => {
    if (!user && !userLoading) {
      history.push("/page/Login");
    } else if (user && !userLoading) {
      const docRef = doc(db, "utenti", user.uid);

      getDoc(docRef).then((snap) => {
        if (snap.data()?.tipo === "classe") {
          history.push("/page/Classe");
        }
        setTipo(snap.data()?.tipo);
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
              onIonChange={(e) => setSegment(e.detail.value)}
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
        {segment === "stato" ? (
          <>
            <IonText>
              <h1 className="stato-vendite">
                Stato <span>Vendite</span>
              </h1>
            </IonText>

            <div className="widget-vendite">
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
                type={ordiniLoading ? "indeterminate" : "determinate"}
                value={
                  ordiniConsegnati && ordini && ordini.size !== 0
                    ? ordiniConsegnati.size / ordini.size
                    : 0
                }
              />
              <span className="progress-note">
                {ordini && ordiniConsegnati && ordini.size !== 0
                  ? ordini.size - ordiniConsegnati.size <= 0
                    ? "Tutti gli ordini sono stati consegnati"
                    : ordini.size -
                      ordiniConsegnati.size +
                      " ancora da consegnare"
                  : "0 ancora da consegnare"}
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
                      .replace(".", ",") + "€"}
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
                disabled={!editor}
                checked={attiva?.data()?.attiva}
                onClick={() => {
                  if (editor) {
                    presentAlert({
                      header: `Sei sicuro di voler ${
                        attiva?.data()?.attiva ? "disattivare" : "attivare"
                      } le vendite?`,
                      message: "Potrai disattivarle in qualsiasi momento",
                      buttons: [
                        { text: "Indietro", role: "cancel" },
                        { text: "Si, Continua", role: "confirm" },
                      ],
                      onDidDismiss: (e: CustomEvent) => {
                        if (e.detail.role === "confirm") {
                          const docRef = doc(
                            db,
                            "attiva",
                            "AZBtxAIwCsLvNeu7RMwK"
                          );

                          updateDoc(docRef, {
                            attiva: !attiva?.data()?.attiva,
                          }).then(() => {
                            presentToast({
                              message: `Le vendite sono state ${
                                attiva?.data()?.attiva
                                  ? "disattivate"
                                  : "attivate"
                              }`,
                              duration: 3000,
                              position: "top",
                            });
                          });
                        } else {
                          const docRef = doc(
                            db,
                            "attiva",
                            "AZBtxAIwCsLvNeu7RMwK"
                          );

                          updateDoc(docRef, {
                            attiva: attiva?.data()?.attiva,
                          }).then(() => {});
                        }
                      },
                    });
                  }
                }}
                slot="end"
              ></IonToggle>
            </IonItem>
          </>
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
                    [0, 1, 2].map((el) => (
                      <IonItem
                        detail={false}
                        className="ion-no-padding ion-margin-top"
                        key={el}
                      >
                        <IonThumbnail slot="start">
                          <IonSkeletonText animated={true} />
                        </IonThumbnail>
                        <IonLabel className="main-info">
                          <h1>
                            <IonSkeletonText
                              animated={true}
                              style={{ width: "80%" }}
                            />
                          </h1>
                          <p>
                            <IonSkeletonText
                              animated={true}
                              style={{ width: "80%" }}
                            />
                          </p>
                        </IonLabel>
                      </IonItem>
                    ))}
                  {panini?.docs.map((panino) => (
                    <IonItem
                      detail={false}
                      onClick={() => {
                        presentPicker({
                          columns: [
                            {
                              name: "num",
                              options: range(0, 200),
                              selectedIndex: panino.data().conto,
                            },
                          ],
                          buttons: [
                            {
                              text: "Ok",
                              role: "confirm",
                            },
                          ],
                          onDidDismiss: (e: CustomEvent) => {
                            if (
                              e.detail.role === "confirm" &&
                              parseInt(e.detail.data.num.value) >= 0
                            ) {
                              const docRef = doc(db, "panini", panino.id);

                              updateDoc(docRef, {
                                conto: parseInt(e.detail.data.num.value),
                              });
                            }
                          },
                        });
                      }}
                      button
                      key={panino.id}
                      className={`disp-item ${
                        panino.data().conto <= 0 && "disp-zero"
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
