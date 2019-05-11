interface App {
    store: any;
}

interface IObj {
    [key: string]: any;
}

type PickerViewEvent = wx.BaseEvent<
    'picker-view',
    {
        current: number;
        currentItemId: string;
        source: string;
    }
>;

type PickerEvent = wx.BaseEvent<
    'picker',
    {
        column: number;
        value: number | string;
    }
>;

type AnyEvent = wx.BaseEvent<
    'any',
    {
        detail: any;
    }
>;

type TapEvent = wx.BaseEvent<
    'tap',
    {
        detail: {
            x: number;
            y: number;
        };
    }
>;
