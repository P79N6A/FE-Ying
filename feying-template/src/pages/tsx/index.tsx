import { Atop } from '@byted/atop-app';
import TsxItem from '../../components/tsx-item';

import './index.less';

interface IData {
    user: wx.UserInfo;
    name: string;
}

class Options extends Atop.Page<IData> {
    onReady() {}
    onClick() {
        console.log('click了一下');
    }

    onComponentEvent(data: any) {
        console.log('组件传递的数据', data);
    }

    render() {
        return (
            <view class="tsx-page">
                <p bindtap={this.onClick}>tsx测试界面</p>
                <view>
                    <TsxItem
                        headerText="这是page 传入的参数"
                        bindtestEvent={this.onComponentEvent}
                    />
                </view>
                ----------
            </view>
        );
    }
}

Page(new Options());
