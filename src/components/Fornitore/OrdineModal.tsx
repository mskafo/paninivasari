import {
  IonButton,
  IonContent,
  IonIcon,
  IonItemDivider,
  IonPage,
} from "@ionic/react";
import { doc, updateDoc } from "firebase/firestore";
import {
  checkmarkDone,
  close,
  repeat,
  restaurantOutline,
  timeOutline,
} from "ionicons/icons";
import { useDocument } from "react-firebase-hooks/firestore";
import { db } from "../../firebaseConfig";

import "./OrdineModal.css";

import TimeAgo from "javascript-time-ago";
import it from "javascript-time-ago/locale/it";
import { Panino } from "../../types";
import React from "react";

TimeAgo.setDefaultLocale(it.locale);
TimeAgo.addLocale(it);

const timeAgo = new TimeAgo("it-IT");

const OrdineModal = ({
  id,
  onDismiss,
}: {
  id: string;
  onDismiss: () => void;
}) => {
  const [scheda, schedaLoading, schedaError] = useDocument(
    doc(db, "ordini", id),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  return (
    <IonPage>
      <IonContent className="ordine-content">
        <h1 className="ordine-text">
          <span>{scheda?.data()?.classe}</span>
        </h1>
        <div className="ordine-info">
          <div>
            <IonIcon icon={timeOutline} />
            <span>
              {scheda &&
                scheda.data() &&
                timeAgo.format(new Date(scheda.data()?.data.seconds * 1000))}
            </span>
          </div>
          <div>
            <IonIcon icon={restaurantOutline} />
            <span>
              {scheda?.data()?.panini === 1
                ? scheda?.data()?.panini + " panino"
                : scheda?.data()?.panini + " panini"}
            </span>
          </div>
        </div>

        <br />

        <div className="scheda">
          {scheda &&
            scheda.data()?.ordine.map((item: Panino) => (
              <React.Fragment key={item.id}>
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

              const docRef = doc(db, "ordini", scheda.id);

              updateDoc(docRef, {
                completato: !scheda.data()?.completato,
              });
            }
          }}
          fill="solid"
          expand="block"
        >
          {!scheda?.data()?.completato
            ? "Segna come consegnato"
            : "Segna da consegnare"}
          <IonIcon
            slot="end"
            icon={!scheda?.data()?.completato ? checkmarkDone : repeat}
          />
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default OrdineModal;
