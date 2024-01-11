import { IonItem, IonLabel, IonSkeletonText, IonThumbnail } from '@ionic/react';

const ItemLoading = () => {
  return (
    <IonItem detail={false} className="ion-no-padding ion-margin-top">
      <IonThumbnail slot="start">
        <IonSkeletonText animated={true} />
      </IonThumbnail>
      <IonLabel className="main-info">
        <h1>
          <IonSkeletonText animated={true} style={{ width: '100%' }} />
        </h1>
        <p>
          <IonSkeletonText animated={true} style={{ width: '100%' }} />
        </p>
      </IonLabel>
    </IonItem>
  );
};

export default ItemLoading;
