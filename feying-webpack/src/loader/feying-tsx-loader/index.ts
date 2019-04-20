// 第一版:
import * as path from 'path';
import * as ts from 'typescript';
import * as R from 'ramda';
import * as acorn from 'acorn-jsx';
import * as walk from 'acorn-walk';
import walkers  from './walks.test';
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
        isRender: false,
        eleData: null,
    };

    walk.simple(ast, {} , walkers, state, undefined);

    write('tree.json', state);

    // state.renderData = parseRenderDataConst(state.renderData);

    // write('tree-after.json', state);

    return state;
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

    // let wxml = assemblewxml(state.ele, {
    //     data: state.data,
    //     renderData: state.renderData,
    //     constants: state.constants,
    //     imports: state.imports,
    //     components: state.components,
    // });

    // TODO: 生成wxml.js文件

    // TODO: 注册组件

    // TODO: 删除render

    // TODO: 删除组件引用

    // 返回处理后的文件
    this.callback(null, state);
}
