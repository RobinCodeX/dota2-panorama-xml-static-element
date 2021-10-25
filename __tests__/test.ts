import { writeFile } from 'fs/promises';
import path = require('path');
import { RenderPanoramaXML } from '../src/index';

describe('Test xml render', () => {
    test('test.xml', async () => {
        const result = await RenderPanoramaXML(path.join(__dirname, 'test.xml'), {
            indentation: '    ',
        });
        writeFile(path.join(__dirname, 'test_render.xml'), result);
    });
});
