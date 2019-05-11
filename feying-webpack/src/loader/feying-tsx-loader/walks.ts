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
    ele: JSXNodeInfo | null; // 这个节点最后作为全部模板
    eleData: any;
    data: Map<any, any>; // page 成员变量data
    renderData: Map<any, any>; // render 中变量data,
    constants: Map<any, any>; // 全局常量
    components: Map<any, any>;
    attribute: Map<any, any>; // JSX的属性
    imports: Map<any, any>;
    isRender: boolean;
};

const getSimpleState = (): WalkState => ({
    value: '', // `{{like this}}`
    extra: null,
    filePath: '',
    ele: null, //
    eleData: null,
    attribute: new Map(),
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
export const parseRenderData = (data: any) => {
    const keys = Object.keys(data);
    let done = false;
    keys.forEach(item => {
        const value = data[item];
        // 如果是字面变量跳过
        if (typeof value !== 'string') {
            return;
        }
        // 查找要替换的key
        const replaceKey = keys.find(
            key =>
                value.indexOf[key] === 0 &&
                (value[key.length] === '.' ||
                    value[key.length] === '[' ||
                    value[key.length] === undefined),
        );

        if (replaceKey) {
            done = false;
            data[item] =
                value === replaceKey
                    ? data[replaceKey]
                    : value.replace(replaceKey, data[replaceKey]);
        }
    });
    if (done) {
        return parseRenderData(data);
    }
    return data;
};

function parseGlobalData(
    node: TSESTree.Node,
    st: WalkState,
    c: WalkCallbackFunction,
) {
    if (node.type !== AST_NODE_TYPES.VariableDeclaration) {
        return;
    }

    // 常量判断
    // TODO: 考虑解构
    node.declarations.forEach(varNode => {
        if (
            varNode.type === AST_NODE_TYPES.VariableDeclarator &&
            varNode.init &&
            varNode.init.type !== AST_NODE_TYPES.CallExpression &&
            varNode.init.type !== AST_NODE_TYPES.ObjectExpression
        ) {
            const varObj = getCacheObj();
            c(varNode.init, varObj);
            try {
                const value = eval(varObj.value);
                if (isConstValue(value)) {
                    st.constants[
                        (varNode.id as TSESTree.Identifier).name
                    ] = value;
                }
            } catch (e) {}
        }

        if (
            varNode.type === AST_NODE_TYPES.VariableDeclarator &&
            getValue(varNode, 'init.callee.name') === 'require' &&
            getValue(varNode, 'init.arguments.0.value') &&
            getValue(varNode, 'init.arguments.0.value').indexOf('components') >
                -1
        ) {
            st.components[(varNode.id as TSESTree.Identifier).name] = getValue(
                varNode,
                'init.arguments.0.value',
            );
        }
        st.imports[(varNode.id as TSESTree.Identifier).name] = getValue(
            varNode,
            'init.arguments.0.value',
        );
    });
}

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

// 判断全局声明变量
function isConstValue(value: any) {
    return (
        (typeof value !== 'object' && typeof value !== 'function') ||
        value === null
    );
}

// 对于特殊的节点进行专门的处理函数
const walkers: { [k: string]: WalkFunction } = {
    ...walk.base, // 基础的类型执行函数
    // JSX相关
    JSXElement: (node: TSESTree.JSXElement, st, c) => {
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
        if (st.eleData) {
            ele.data = st.eleData;
            delete st.eleData;
        }

        if (!st.ele) {
            // 从这里创建全局
            st.ele = ele;
        }
        for (const attribute of node.openingElement.attributes) {
            c(attribute, ele);
        }

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
    JSXAttribute(node: TSESTree.JSXAttribute, st, c) {
        // JSX属性
        const valueObj = getCacheObj();
        // 根据类型去取value
        c(node.value, valueObj);
        // 属性名
        let name = node.name.name;

        if (name === 'key') {
            name = 'wx:key';
            const regx = /{{(.*?)}}/;
            const result = valueObj.value.match(regx)[1];
            valueObj.value = result.split('.').pop();
        }

        if (name === 'className') {
            name = 'class';
        }

        name.toLowerCase();
        st.attribute[name] = valueObj.value;
    },
    JSXExpressionContainer(node: TSESTree.JSXExpressionContainer, st, c) {
        c(node.expression, st);
        st.value = `{{${st.value}}}`;
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
        // 都以字符串的形式 后期处理时eval再解析
        st.value =
            typeof node.value !== 'string' ? `${node.value}` : node.value;
    },
    ThisExpression(node: TSESTree.ThisExpression, st, c) {
        st.value = 'this';
    },
    Identifier(node: TSESTree.Identifier, st, c) {
        st.value = node.name;
    },
    MemberExpression(node: TSESTree.MemberExpression, st, c) {
        const obj = getCacheObj();
        const property = getCacheObj();
        c(node.object, obj);
        c(node.property, property);
        st.value = node.computed
            ? `${obj.value}[${property.value}]`
            : `${obj.value}.${property.value}`;
    },
    CallExpression(node: TSESTree.CallExpression, st, c) {
        // 处理map情况 将map拆解为wx:for
        c(node.callee, st);
    },
    TemplateLiteral(node: TSESTree.TemplateLiteral, st, c) {
        // 模板字符串在react和小程序中使用有bug 小程序中模板渲染时无法使用
    },
    TemplateElement(node: TSESTree.TemplateElement, st, c) {
        // 模板字符串单一元素
        st.value = node.value.raw;
    },
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
    Program(node: TSESTree.Program, st, c) {
        node.body.forEach(nodeItem => {
            parseGlobalData(nodeItem, st, c);
        });
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
