import { writeFile } from 'fs/promises';
import path = require('path');
import { PreloadTemplates, RenderPanoramaXML } from '../src/index';

describe('Test xml render', () => {
    test('test.xml', async () => {
        const result = await RenderPanoramaXML(path.join(__dirname, 'test.xml'), {
            indentation: '    ',
        });
        await writeFile(path.join(__dirname, 'test_render.xml'), result);
    });

    test('preload components', async () => {
        const elements = await PreloadTemplates([path.join(__dirname, 'components')]);
        expect(2).toBe(elements.length);
        expect('Template').toBe(elements[0].tagName);
        expect('Template').toBe(elements[1].tagName);
        expect('DefaultButton').toBe(elements[0].getAttribute('name'));
        expect('HeroButton').toBe(elements[1].getAttribute('name'));

        await expect(
            PreloadTemplates([
                path.join(__dirname, 'components'),
                path.join(__dirname, 'some_componenets'),
            ])
        ).rejects.toThrow(
            `${path
                .join(__dirname, 'some_componenets/DefaultButton.xml')
                .replace(/\\/g, '/')}: Duplicate template name 'DefaultButton'`
        );
    });
});
