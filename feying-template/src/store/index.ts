import Store, { IActions } from 'awex';
import apis, { ISystemInfo } from 'mp-apis';

import counterModel, {
    ICounterState,
    ICounterActions,
} from './../pages/awex/store';

export interface IState {
    counter: ICounterState;
    systemInfo: ISystemInfo;
    platform: string;
}

export interface IStoreActions extends IActions {
    counter: ICounterActions;

    getSystemInfo(): Promise<void>;
}

const store = Store.createStore<IState, IStoreActions>({
    log: false,
    modules: {
        counter: counterModel,
    },
    state: {
        systemInfo: {} as ISystemInfo,
        platform: '',
    } as IState,
    actions: {
        getSystemInfo: async ({ state }) => {
            const system = await apis.getSystemInfo();
            state.systemInfo = system;
            state.platform =
                system.platform! === 'devtools' ? 'ios' : system.platform!;
        },
    },
    setStorage: state => {
        const app = getApp();
        app.store = state;
    },
});

export default store;
