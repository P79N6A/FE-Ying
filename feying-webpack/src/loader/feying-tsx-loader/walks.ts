// import * as fs from 'fs';
// import * as path from 'path';
import * as walk from 'acorn-walk';
import eleMap from './eleMap';

import { TSESTree, AST_NODE_TYPES } from '@typescript-eslint/typescript-estree';

type JSXNodeInfo = {
    name: string;
    data: any[];
    attribute: Map<any, any>;
    children: TSESTree.JSXChild[];
};

type WalkState = {
    value: undefined | string | number | boolean | null | Object | RegExp; // 基本数据类型
    extra: any;
    filePath: string;
    ele: JSXNodeInfo | null;
    eleData: any;
    data: Map<any, any>; // page 成员变量data
    renderData: Map<any, any>; // render 中变量data,
    constants: Map<any, any>; // 全局常量
    components: Map<any, any>;
    imports: Map<any, any>;
    isRender: boolean;
};

const getSimpleState = (): WalkState => ({
    value: '', // `{{like this}}`
    extra: null,
    filePath: '',
    ele: null, // 当前node节点
    eleData: null,
    data: new Map(), // page 成员变量data
    renderData: new Map(), // render 中变量data,
    constants: new Map(), // 全局常量
    components: new Map(),
    imports: new Map(),
    isRender: false,
});

type WalkCallbackFunction = Function;

type WalkFunction = (
    node: TSESTree.Node,
    state: WalkState,
    callback: WalkCallbackFunction,
) => void;

function getCacheObj() {
    return {
        value: '',
        ele: null,
        extra: null,
    };
}

/**
 *  "_a": "this.data.item",
 *  "comment": "_a.comment",  => "comment": "this.data.item.comment"
 *
 * @param {*} data
 */
export const parseRenderData = (data: any) => {};

function getValue(obj: TSESTree.Node, name: string) {
    const list = name.split('.');
    let ret: string;
    list.reduce((data: any, e) => {
        if (data) {
            ret = data[e];
            return ret;
        }
    }, obj);
    return ret;
}

// 对于特殊的节点进行专门的处理函数
const walkers: { [k: string]: WalkFunction } = {
    ...walk.base, // 基础的类型执行函数
    // JSX相关
    JSXElement: (node: TSESTree.JSXElement, st, c) => {
        // 提取标签内容

        console.log('进入jsx');

        // this.setState{} 数据不用管

        // render中计算的属性 需要替换
        const ele: JSXNodeInfo = {
            name:
                (node.openingElement &&
                    (node.openingElement.name as TSESTree.JSXIdentifier)
                        .name) ||
                getValue(node, 'openingElement.name.object.name'),
            attribute: new Map(),
            children: [],
            data: [],
        };

        // 去转换为预定义标签
        if (eleMap[ele.name]) {
            ele.name = eleMap[ele.name];
        }

        // // 标签自己的数据, map参数
        // if (st.eleData) {
        //     ele.data = st.eleData;
        //     delete st.eleData;
        // }
        // if (!st.ele) {
        //     st.ele = ele;
        // }
        // for (const attribute of node.openingElement.attributes) {
        //     c(attribute, ele);
        // }

        // for (const child of node.children) {
        //     const childObj = getCacheObj();
        //     c(child, childObj);
        //     ele.children.push(childObj.ele || childObj.value);
        //     // 条件判断可能会产生两个子元素
        //     if (childObj.extra) {
        //         ele.children.push(childObj.extra);
        //         delete childObj.extra;
        //     }
        // }
    },
    ReturnStatement(node: TSESTree.ReturnStatement, st, c) {
        // Function 会先向下遍历，这里如果判断是isRender的话，返回继续
        if (node.argument) {
            c(node.argument, st, 'Expression');
        }
        if (node.argument && node.argument.type === AST_NODE_TYPES.JSXElement) {
            console.log('isRender');
            st.isRender === true;
        }
    },
    // 解析st.value
    Literal(node: TSESTree.Literal, st) {
        st.value = node.value;
    },
    ThisExpoession(node: TSESTree.ThisExpression, st, c) {},
    MemberExpression(node: TSESTree.MemberExpression, st, c) {},
    CallExpression(node: TSESTree.CallExpression, st, c) {},
    // 解析st.value
    Function(
        node: TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression,
        st,
        c,
    ) {
        c(node.body, st); // 先进入body去判断整个function 有没有返回JSXElement

        // 将函数的参数传递给jsx使用，如果直接调用的话
        node.params.forEach(param => {
            c(param, st, 'Pattern');
        });

        // TODO: 如果是解构赋值or数组
        // 获取传入的参数
        const params = node.params.map(
            param => (param as TSESTree.Identifier).name,
        );
        st.eleData = params; // jsx可以从这里拿外界传入的值

        c(node.body, st, node.expression ? 'ScopeExpression' : 'ScopeBody');

        if (st.isRender) {
            const vars = {};
            (node.body as TSESTree.BlockStatement).body
                .filter(
                    item => item.type === AST_NODE_TYPES.VariableDeclaration,
                )
                .forEach(e =>
                    (e as TSESTree.VariableDeclaration).declarations.forEach(
                        varItem => {
                            const key = (varItem.id as TSESTree.Identifier)
                                .name;
                            const valueObj = getSimpleState();
                            c(varItem.init, valueObj);
                            vars[key] = valueObj.value;
                        },
                    ),
                );
            st.renderData = parseRenderData(vars);
        }
        st.isRender = false;
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
