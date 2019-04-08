import compiler from '../compiler';
import * as path from 'path';
// import outputFile from './output';

test('string', async () => {
    try {
        await compiler(path.resolve(__dirname, 'source.tsx'));
  
        // const outputAssets = (res as any).stats[0].compilation.assets;
        // for (let file in outputAssets) {
        //     const res = await require(outputAssets[file].existsAt);
        //     expect(res.default).toBe(outputFile);
        // }
    } catch (e) {
        console.log(e);
    }
});
