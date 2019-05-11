import { Provider } from 'awex';
import './app.less';
import store from './store';

@Provider(store)
class MyApp implements AppOptions {
    onLaunch() {
        console.log('App Launch');
        store.actions.getSystemInfo();
    }
    onShow() {
        console.log('App Show');
    }
    onHide() {
        console.log('App Hide');
    }
}

App(new MyApp());
