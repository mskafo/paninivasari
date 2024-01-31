import {
  IonButton,
  IonContent,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonText,
  useIonToast,
} from '@ionic/react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { logInOutline } from 'ionicons/icons';
import { useState } from 'react';
import { useHistory } from 'react-router';
import { auth, db } from '../firebaseConfig';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [present, dismiss] = useIonToast();

  const history = useHistory();

  return (
    <IonPage>
      <IonContent className="login-content" fullscreen>
        <div className="login-container">
          <div className="illustration-container">
            <div className="illustration">
              <IonImg
                className="image"
                src="assets/images/illustration.png"
                alt="Login Illustration"
              />
              <IonImg
                className="background"
                src="assets/images/illustration.png"
                alt="Login Illustration"
              />
            </div>
          </div>
          <div className="login-box">
            <IonText>
              <h1 className="accesso">Accesso</h1>
            </IonText>

            <IonText color="primary">
              <p className="paninivasari">Panini Vasari</p>
            </IonText>

            <br />

            <IonItem detail={false} className="ion-no-padding login-item">
              <IonLabel className="login-label" position="stacked">
                Email
              </IonLabel>
              <IonInput
                className="login-input"
                value={email}
                onIonChange={(e: any) => setEmail(e.detail.value)}
                placeholder="email@esempio.com"
                type="email"
              />
            </IonItem>

            <br />

            <IonItem detail={false} className="ion-no-padding login-item">
              <IonLabel className="login-label" position="stacked">
                Password
              </IonLabel>
              <IonInput
                className="login-input"
                value={password}
                onIonChange={(e: any) => setPassword(e.detail.value)}
                placeholder="latuapassword"
                type="password"
              />
            </IonItem>

            <br />

            <div className="login-button">
              <IonButton
                className="ion-text-capitalize login-btn"
                size="large"
                onClick={() => {
                  if (!email || !password) {
                    present({
                      message: 'Devi prima compilare ogni campo',
                      duration: 3000,
                      position: 'top',
                    });
                  } else {
                    signInWithEmailAndPassword(auth, email, password)
                      .then((cred) => {
                        present({
                          message: 'Accesso effettuato correttamente',
                          duration: 3000,
                          position: 'top',
                        });

                        const docRef = doc(db, 'utenti', cred.user.uid);

                        getDoc(docRef).then((snap) => {
                          if (snap.data()?.tipo === 'fornitore') {
                            history.push('/page/Fornitore');
                            setEmail('');
                            setPassword('');
                          } else if (snap.data()?.tipo === 'cliente') {
                            history.push('/page/Classe');
                            setEmail('');
                            setPassword('');
                          }
                        });
                      })
                      .catch((err) => {
                        present({
                          message: 'Errore, account non trovato',
                          duration: 3000,
                          position: 'top',
                        });
                      });
                  }
                }}
                fill="solid"
                expand="block"
              >
                Accedi
                <IonIcon slot="end" icon={logInOutline}></IonIcon>
              </IonButton>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
