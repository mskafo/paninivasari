import { Route } from 'react-router-dom';
import { IonApp, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import Fornitore from './pages/Fornitore';
import Classe from './pages/Classe';
import Login from './pages/Login';
import { useEffect } from 'react';
import Loading from './pages/Loading';
import { SplashScreen } from '@awesome-cordova-plugins/splash-screen/';

SplashScreen.hide();

setupIonicReact();

const App: React.FC = () => {
  useEffect(() => {
    SplashScreen.hide();
    ScreenOrientation.lock(ScreenOrientation.ORIENTATIONS.PORTRAIT);
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <Route path="/" exact={true}>
          <Loading />
        </Route>
        <Route path="/page/Fornitore">
          <Fornitore />
        </Route>
        <Route path="/page/Classe">
          <Classe />
        </Route>
        <Route path="/page/Login" exact={true}>
          <Login />
        </Route>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
