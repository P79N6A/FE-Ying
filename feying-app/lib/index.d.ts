/// <reference types="weixin-app" />
export declare namespace Atop {
    class Page<D = any> {
        /**
         * 页面的初始数据
         */
        data: D;
        setData: ((data: {
            [key in keyof D]?: D[key];
        }) => {});
        /**
         * 生命周期函数--监听页面加载
         * @param options 接收页面参数可以获取wx.navigateTo和wx.redirectTo及<navigator/>中的 query
         */
        onLoad?(options: object): void;
        /**
         * 生命周期函数--监听页面初次渲染完成
         */
        onReady?(): void;
        /**
         * 生命周期函数--监听页面显示
         */
        onShow?(): void;
        /**
         * 生命周期函数--监听页面隐藏
         */
        onHide?(): void;
        /**
         * 生命周期函数--监听页面卸载
         */
        onUnload?(): void;
        /**
         * 下拉刷新
         * 在 Page 中定义 onPullDownRefresh 处理函数，监听该页面用户下拉刷新事件。
         * 需要在 config 的window选项中开启 enablePullDownRefresh。
         * 当处理完数据刷新后，wx.stopPullDownRefresh可以停止当前页面的下拉刷新。
         */
        onPullDownRefresh?(): void;
        /**
         * 页面上拉触底事件的处理函数
         * 监听用户上拉触底事件。
         * 可以在app.json的window选项中或页面配置中设置触发距离onReachBottomDistance。
         * 在触发距离内滑动期间，本事件只会被触发一次。
         */
        onReachBottom?(): void;
        /**
         * 在 Page 中定义 onShareAppMessage 函数，设置该页面的转发信息。
         * + 只有定义了此事件处理函数，右上角菜单才会显示 “转发” 按
         * + 用户点击转发按钮的时候会调
         * + 此事件需要 return 一个 Object，用于自定义转发内容
         */
        onShareAppMessage?(options?: PageShareAppMessageOptions): wx.ShareAppMessage;
        /**
         * 页面滚动触发事件的处理函数
         * 监听用户滑动页面事件。
         * 参数为 Object，包含以下字段：
         */
        onPageScroll?(option: {
            scrollTop: number;
        }): void;
        /**
         * 当前是 tab 页时，点击 tab 时触发
         */
        onTabItemTap?(item: any): void;
    }
    class Component<D = any> {
        data: D;
        setData: ((data: {
            [key in keyof D]?: D[key];
        }) => {});
        methods?: {
            [key: string]: (this: Component<D>, ...s: any[]) => void;
        };
        properties?: {
            [key: string]: Object & {
                type: Object;
                value: any;
                observer?: (newVal: any, oldVal: any, changedPath: any) => {};
            };
        };
        behaviors?: string[];
        created?(): void;
        attached?(): void;
        ready?(): void;
        moved?(): void;
        detached?(): void;
        relations: any;
        externalClasses?: string[];
        lifetimes: any;
        pageLifetimes?: any;
        definitionFilter?: Function;
    }
}
