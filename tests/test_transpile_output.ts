import test from 'ava';
import path from 'path';
import { promises as fs } from 'fs';

import { compile } from './compiler';

const testFilesDir = path.join(__dirname, 'test_files');

test('Transpile output', async t => {
    let files = await fs.readdir(testFilesDir);
    files = files.filter(file => path.extname(file) === '.ts');

    for (const file of files) {
        let output = '';
        const filePath = path.join(testFilesDir, file);
        const jsFilePath = filePath.replace(/\.ts$/, '.js');

        compile([filePath], (_, data) => output = data);
        const expected = await fs.readFile(jsFilePath, 'utf8');

        t.is(output, expected);
    }
});
