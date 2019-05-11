import { Atop } from '@byted/atop-app';
interface IProps {
    headerText: string;
    bindtestEvent?: (data: any) => void;
}

interface IData {
    name: string;
}

export default class TsxItem extends Atop.Component<IProps, IData> {
    data = {
        name: '初始name',
    } as Partial<IProps & IData>;

    properties = {
        // 这里定义了 headerText 属性，属性值可以在组件使用时指定
        headerText: {
            type: String,
            value: '默认标题文案',
        },
    };

    ready() {
        console.log('onready');
    }

    methods = {
        // sayHello: () => {} 错误
        sayHello(this: Atop.Component<IProps, IData>) {
            console.log('hello');
            this.setData({
                name: '新名字',
            });
            this.triggerEvent('testEvent', { data:'组件数据' });
        },
    };

    render() {
        return (
            <div>
                <div bindtap={this.sayHello}>
                    传入参数: {this.data.headerText}
                </div>
                <div>name: {this.data.name}</div>
            </div>
        );
    }
}
Component(new TsxItem());
