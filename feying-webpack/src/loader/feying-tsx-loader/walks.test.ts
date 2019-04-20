
import * as walk from 'acorn-walk';

import { TSESTree, AST_NODE_TYPES, AST_TOKEN_TYPES } from '@typescript-eslint/typescript-estree';


type JSXNodeInfo = {
    name: string;
    data: any[];
    attribute: Map<any, any>;
    children: TSESTree.JSXChild[];
};

type WalkState = {
    value: string; // `{{like this}}`
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


// 对于特殊的节点进行专门的处理函数
const walkers: { [k: string]: WalkFunction } = {
    ...walk.base, // 基础的类型执行函数
    // JSX相关
    Function:(node : TSESTree.ArrowFunctionExpression | TSESTree.FunctionExpression, st, c) => {

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

        const vars = {};
            (node.body as TSESTree.BlockStatement).body && (node.body as TSESTree.BlockStatement).body
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
                            console.log(key);
                            vars[key] = valueObj.value;
                        },
                    ),
                );

    }
};

const handler = {
    // 防止出现没有对应的执行函数的情况
    get: function(target: Object, name: string) {
        return name in target ? target[name] : () => {};
    },
};

// walkers.propertype.get

export default new Proxy(walkers, handler);
