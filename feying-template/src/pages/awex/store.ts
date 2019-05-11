import { IOptions, IActionsType } from 'awex';

export interface ICounterState {
    count: number;
}
export interface ICounterActions extends IActionsType {
    add: (num?: number) => number;
    addAsync: (num?: number) => Promise<number>;
    clear: () => void;
}

export default {
    state: {
        count: 0,
    },
    actions: {
        add: ({ state }, num = 1) => {
            state.count += num;
            return state.count;
        },
        addAsync: async ({ state }, num = 1) => {
            return await new Promise(r => {
                setTimeout(() => {
                    state.count += num;
                    r(state.count);
                }, 2000);
            });
        },
        clear: ({ state }) => {
            state.count = 0;
        },
    },
} as IOptions<ICounterState, ICounterActions>;
