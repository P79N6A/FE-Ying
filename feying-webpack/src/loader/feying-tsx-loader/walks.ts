// import * as fs from 'fs';
// import * as path from 'path';
import * as walk from 'acorn-walk';

import eleMap from './eleMap';

function getCacheObj() {
    return {
        value: '',
        ele: null,
        if: null,
        extra: null,
    };
}

function getValue(obj, name) {
    const list = name.split('.');
    let ret;
    list.reduce((data, e) => {
        if (data) {
            ret = data[e];
            return ret;
        }
    }, obj);
    return ret;
}


// 对于特殊的节点进行专门的处理函数
const walkers: { [k: string]: Function } = {
    ...walk.base, // 基础的类型执行函数
    JSXElement(node, st, c) {
        const ele = {
            name:
                (node.openingElement && node.openingElement.name.name) ||
                getValue(node, 'openingElement.name.object.name'),
            attribute: {},
            children: [],
            data: [],
        };
        if (eleMap[ele.name]) {
            ele.name = eleMap[ele.name];
        }

        // 标签自己的数据, map参数
        if (st.eleData) {
            ele.data = st.eleData;
            delete st.eleData;
        }
        if (!st.ele) {
            st.ele = ele;
        }
        for (const attribute of node.openingElement.attributes) {
            c(attribute, ele);
        }

        for (const child of node.children) {
            const childObj = getCacheObj();
            c(child, childObj);
            ele.children.push(childObj.ele || childObj.value);
            // 条件判断可能会产生两个子元素
            if (childObj.extra) {
                ele.children.push(childObj.extra);
                delete childObj.extra;
            }
        }
    },
};

const handler = {
    // 防止出现没有对应的执行函数的情况
    get: function(target: Object, name: string) {
        return name in target ? target[name] : () => {};
    },
};

// walkers.propertype.get

export default new Proxy(walkers, handler);
