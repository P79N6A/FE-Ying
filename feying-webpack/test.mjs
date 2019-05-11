const ts = require('typescript');

const source = `
export class RenderString extends HAHA{
    render() {
        const name_1 = "haoxubin";
        return (
            <div className="page">
                <div>{name_1}</div>
            </div>
        );
    }
}
`

console.log(ts.createSourceFile(
    'index.tsx',
    source,
    ts.ScriptTarget.ES2016,
    false,
).statements[0].members,ts.SyntaxKind.ClassDeclaration)
