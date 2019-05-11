import { Atop } from '@byted/atop-app';
import store from '../../store';

import './index.wxml';
import './index.less';
interface IData {
    count: number;
}

@store.connect(state => ({
    count: state.counter.count,
}))
class Options extends Atop.Page<Partial<IData>> {
    data = {};
    pageWillReceiveData(data: IData) {
        console.log('get data', data);
    }

    minusAsync() {
        store.actions.counter.addAsync(-1);
    }
    minus() {
        store.actions.counter.add(-1);
    }
    add() {
        store.actions.counter.add();
    }
    addAsync() {
        store.actions.counter.addAsync();
    }
}

Page(new Options());
