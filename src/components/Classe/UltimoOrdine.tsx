import {
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonThumbnail,
} from '@ionic/react';
import { restaurantOutline } from 'ionicons/icons';
import React from 'react';
import { db } from '../../firebaseConfig';
import { useDocument } from 'react-firebase-hooks/firestore';
import { doc, DocumentData, QuerySnapshot } from 'firebase/firestore';
import { Panino } from '../../types';

import './Carrello.css';
import ItemLoading from '../common/ItemLoading';

const UltimoOrdine = ({
  idClasse,
  uid,
  panini,
}: {
  idClasse: string;
  uid: string;
  panini: QuerySnapshot<DocumentData> | undefined;
}) => {
  const [ultimoOrdine, ultimoOrdineLoading, ultimoOrdineError] = useDocument(
    doc(doc(db, 'ordini', idClasse), 'lista', uid),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  return (
    <>
      <div className="disp-header">
        <h1 className="ordini-text">
          <span>Ultimo Ordine</span>
        </h1>

        <div className="totale-panini">
          <IonIcon icon={restaurantOutline} />
          <span>
            {ultimoOrdine?.exists()
              ? ultimoOrdine.data()?.panini === 1
                ? ultimoOrdine.data()?.panini + ' panino'
                : ultimoOrdine.data()?.panini + ' panini'
              : '0 panini'}
          </span>
        </div>
      </div>

      <IonList lines="none">
        {ultimoOrdineLoading && [0, 1].map((el) => <ItemLoading key={el} />)}
        {ultimoOrdine?.exists() &&
        ultimoOrdine.data()?.ordine.reduce((accumulator: any, object: any) => {
          return accumulator + object.numero;
        }, 0) > 0 ? (
          ultimoOrdine.data()?.ordine.map((panino: Panino) => (
            <React.Fragment key={panino.id}>
              {panino.numero > 0 && (
                <IonItem detail={false} key={panino.id} className="disp-item">
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
                    <p>Quantità: {panino.numero}</p>
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
              <p className="no-ordini">Non hai ancora inviato nessun ordine</p>
            )}
          </>
        )}
      </IonList>

      <hr />

      <div className="totale">
        <span className="totale-testo">Totale</span>
        <span className="totale-prezzo">
          {ultimoOrdine?.exists()
            ? ultimoOrdine.data()?.totale.toFixed(2).replace('.', ',')
            : '0,00'}
          €
        </span>
      </div>
    </>
  );
};

export default UltimoOrdine;
