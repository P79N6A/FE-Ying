// 第一版:
import * as path from 'path';
import * as ts from 'typescript';
import * as R from 'ramda';
import * as fs from 'fs';
import * as acorn from 'acorn-jsx';
import * as walk from 'acorn-walk';
import * as loaderUtils from 'loader-utils';
import walkers from './walks.test';
import { write } from './utils/log';

// 工具函数放在前面
/**
 * 处理membet
 */
const parseMember = R.map(
    ({ name: { escapedText }, body, type, kind, pos, end }) => ({
        type,
        body,
        kind,
        pos,
        end,
        name: escapedText,
    }),
);

/**
 * 处理class
 * @param {String} [name]
 * @returns
 */
const parseClassNode = R.compose<any, any, any, any, any>(
    R.head,
    R.map(({ name: { escapedText: className }, members }) => ({
        className,
        members: members && parseMember(members),
    })),
    R.filter(R.propEq('kind', ts.SyntaxKind.ClassDeclaration)),
    R.prop('statements'),
);

function parseComponentsPath(state: any, resource: string) {
    const keys = Object.keys(state.components);
    keys.forEach(c => {
        const value = state.components[c];
        const abs = p => path.resolve(path.dirname(resource), p);
        const files = [value, `${value}/index`];
        const realPath = files.find(
            e =>
                fs.existsSync(`${abs(e)}.tsx`) ||
                fs.existsSync(`${abs(e)}.ts`) ||
                fs.existsSync(`${abs(e)}.json`),
        );
        state.components[c] = realPath;
    });
}

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
        data: new Map(), // page 成员变量data
        renderData: new Map(), // render 中变量data,
        constants: new Map(), // 全局常量
        components: new Map(),
        attribute: new Map(),
        imports: new Map(),
        isRender: false,
        eleData: null,
    };

    walk.simple(ast, {}, walkers, state, undefined);

    write('tree.json', state);
    
    return state;
}

export default function(source: string) {
    // 获取处理组件路径 判断是组件or页面
    const dir = path.resolve(this.rootContext, 'src');

    const query = loaderUtils.getOptions(this) || {};
    const sourceFile = ts.createSourceFile(
        this.resourcePath,
        source,
        ts.ScriptTarget.ES2016,
        false,
    );
    write('sourceFile.js', sourceFile);
    const page = parseClassNode(sourceFile);

    // TODO: 对于非规定目录的jsx进行报错处理

    const dirPath =
        getPagePath(this.resourcePath) || getComponentPath(this.resourcePath);

    if (!dirPath) {
        throw new Error(
            `${this.resourcePath} 不在pages 或者 components目录下!!`,
        );
    }

    // 把tsx转换成jsx 方便后期处理
    const jsCode = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            jsx: ts.JsxEmit.Preserve,
            target: ts.ScriptTarget.ES2015,
        },
    });

    // 遍历语法树 提取信息&转换信息
    const state = walkCode(jsCode.outputText, this.resourcePath);

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
