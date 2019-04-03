import compiler from './compiler';

test('test first task', async () => {
    try{
        const stats = await compiler('./test-files/test_1.txt');

        console.log((stats as any).stats);

        // console.log(stats)
        // const output = (stats as any).toJson().modules.source;
        // expect(output).toBe(`export default "Hey haoxubin!"`);
    } catch (e) {
        console.error(e)
    }
  
});
