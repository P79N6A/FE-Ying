// 第一版:
import * as path from 'path';
import * as ts from 'typescript';
import * as R from 'ramda';
import * as acorn from 'acorn-jsx';
import * as walk from 'acorn-walk';
import walkers  from './walks';
import { write } from './utils/log';

/**
 * 处理class
 * @param {String} [name]
 * @returns
 */
// function parseClassNode() {
//     return R.compose<any, any, any, any, any>(
//         R.head,
//         R.map(({ name: { text: className }, decorators, members }) => ({
//             className,
//             members: members && parseMember()(members),
//         })),
//         R.filter(R.propEq('kind', ts.SyntaxKind.ClassDeclaration)),
//         R.prop('statements'),
//     );
// }

// 工具函数放在前面

/**
 * 获取当前page的路径
 */
const getPagePath = R.compose<string, string, string[], string>(
    R.head,
    R.match(/pages[\/a-z-]+/),
    path.dirname,
);

/**
 * 获取当前component的路径
 */
const getComponentPath = R.compose<string, string, string[], string>(
    R.head,
    R.match(/component[\/a-z-]+/),
    path.dirname,
);

/**
 * 生成语法树并遍历
 * 输出结构树
 * @param {string} code
 * @returns
 */
function walkCode(code: any, filePath: string) {
    const ast = acorn.parse(code, {
        plugins: {
            jsx: true,
        },
    });
    write('ast.json', ast);

    const state = {
        filePath,
        ele: null,
        data: {}, // page 成员变量data
        renderData: {}, // render 中变量data,
        constants: {}, // 全局常量
        components: {},
        imports: {},
    };

    walk.simple(ast, {} , walkers, state, undefined);

    write('tree.json', state);

    // state.renderData = parseRenderDataConst(state.renderData);

    // write('tree-after.json', state);

    return state;
}



/**
 * 翻译成小程序识别的变量
 * @param name
 * @param eleData
 * @param data
 */
function parseVariable(name: string, eleData: any, data: any) {
    if (!name) {
        return name;
    }
    const regx = /{{(.*?)}}/;
    const result = name.match(regx);
    let expressionBody = result && result[1];
    if (expressionBody) {
        expressionBody = expressionBody.replace(/'(\w|\.|\s)*'/g, '');
        const varsRegx = /\b(\w|\.|\')*\b/g;
        const vars = expressionBody
            .match(varsRegx)
            .filter((e: string) => e && isNaN(Number(e)));

        // 检查变量是否存在
        if (vars.length) {
            vars.forEach(key => {
                if (key.indexOf('this.data') !== -1) {
                    // const realKey = key.replace('this.data.', '').split('.')[0]; const inData =
                    // !!data.data[realKey]; if (!inData) {   throw new Error(`data中不存在的变量:
                    // ${key}`); }
                } else {
                    let realKey = key.split('.')[0];
                    const inEleData =
                        eleData.filter(e => e === realKey).length > 0;
                    const inRenderData = Object.keys(data.renderData).some(
                        e => {
                            if (e.indexOf('.') > -1) {
                                if (key.indexOf(e) === 0) {
                                    const next = key[key.indexOf(e) + e.length];
                                    if (
                                        next === '.' ||
                                        next === undefined ||
                                        next === '['
                                    ) {
                                        realKey = e;
                                        return true;
                                    }
                                }
                                return false;
                            }
                            return e.indexOf(realKey) === 0;
                        },
                    );
                    if (inRenderData) {
                        name = name.replace(realKey, data.renderData[realKey]);
                    }
                    if (!inEleData && !inRenderData) {
                        // 常量判断
                        if (Object.keys(data.constants).indexOf(key) !== -1) {
                            let newValue = data.constants[key];
                            if (typeof newValue === 'string') {
                                newValue = `'${newValue}'`;
                            }
                            name = name.replace(key, newValue);
                        }
                    }
                }
            });
        }
    }
    if (typeof name === 'string') {
        name = name.replace(/this\.data\./g, '');
        name = name.replace(/this\./g, '');
    }
    return name;
}

/**
 * 遍历结构树 生成sxml
 * @param {*} stateTree
 * @param {*} data
 * @returns
 */
function assemblewxml(stateTree: any, data: any) {
    if (stateTree.name) {
        const ele = stateTree;
        const attr = Object.keys(ele.attribute)
            .map(key => {
                let value = parseVariable(
                    ele.attribute[key],
                    stateTree.data,
                    data,
                );
                // 事件处理
                if (key.slice(0, 4) === 'bind' || key.slice(0, 5) === 'catch') {
                    const regx = /{{(.*?)}}/;
                    const result = value.match(regx);
                    value = result && result[1];
                    value = value.replace('this.', '');
                }
                // key驼峰转下划线
                return `${key
                    .replace(/([A-Z])/g, '-$1')
                    .toLowerCase()}="${value}"`;
            })
            .join(' ');
        const children = ele.children
            .map(c => {
                if (typeof c === 'string') {
                    return parseVariable(c, stateTree.data, data);
                }
                // 作用域传递到子节点
                c.data = c.data.concat(ele.data);
                return assemblewxml(c, data);
            })
            .join('');

        // 确定里面的引用是组件引用
        if (data.imports[ele.name]) {
            data.components[ele.name] = data.imports[ele.name];
        }

        return `<${ele.name.replace(
            /_/g,
            '-',
        )} ${attr}>${children}</${ele.name.replace(/_/g, '-')}>`;
    }
}


export default function(source: string) {
    // TODO: 获取处理组件路径 判断是组件or页面

    // TODO: 对于非规定目录的jsx进行报错处理


    // 把tsx转换成jsx 方便后期处理
    const jsCode = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            jsx: ts.JsxEmit.Preserve,
            target: ts.ScriptTarget.ES2015,
        },
    });

    // 遍历语法树 提取信息&转换信息
    const state = walkCode(jsCode.outputText, this.resourcePath)

    // TODO: 生成wxml文件

    let wxml = assemblewxml(state.ele, {
        data: state.data,
        renderData: state.renderData,
        constants: state.constants,
        imports: state.imports,
        components: state.components,
    });

    console.log(wxml);

    wxml = `export default '${wxml}'`
    // TODO: 生成wxml.js文件

    // TODO: 注册组件

    // TODO: 删除render

    // TODO: 删除组件引用

    // 返回处理后的文件
    this.callback(null, wxml);
}
