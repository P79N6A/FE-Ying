import { Atop } from '@byted/atop-app';
import apis from 'mp-apis';
import './index.wxml';
import './index.less';

interface IData {
    user: wx.UserInfo;
}

class Options extends Atop.Page<IData> {
    onReady() {
        console.log('onReady');
    }
    jumpToTsxPage() {
        apis.navigateTo({
            url: '/pages/tsx/index',
        });
    }
    jumpToAwexPage() {
        apis.navigateTo({
            url: '/pages/awex/index',
        });
    }
}

Page(new Options());
