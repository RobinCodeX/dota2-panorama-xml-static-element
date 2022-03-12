import { writeFile } from 'fs/promises';
import path = require('path');
import { PreloadTemplates, RenderPanoramaXML } from '../src/index';

describe('Test xml render', () => {
    test('test.xml', async () => {
        const result = await RenderPanoramaXML(path.join(__dirname, 'test.xml'), {
            indentation: '    ',
        });
        expect(result).toMatchSnapshot();
    });

    test('test.xml no options', async () => {
        const result = await RenderPanoramaXML(path.join(__dirname, 'test.xml'));
        expect(result).toMatchSnapshot();
    });

    test('test.xml templateRoots option', async () => {
        const result = await RenderPanoramaXML(path.join(__dirname, 'test.xml'), {
            templateRoots: [path.join(__dirname, 'components')],
        });
        expect(result).toMatchSnapshot();
    });

    test('test.xml template not root element', async () => {
        const result = await RenderPanoramaXML(path.join(__dirname, 'test.xml'), {
            templateRoots: [path.join(__dirname, 'no_root_component')],
        });
        expect(result);
    });

    test('preload components', async () => {
        const elements = await PreloadTemplates([path.join(__dirname, 'components')]);
        expect(4).toBe(elements.length);
        expect('Template').toBe(elements[0].tagName);
        expect('Template').toBe(elements[1].tagName);
        expect('DefaultButton').toBe(elements[0].getAttribute('name'));
        expect('HeroButton').toBe(elements[1].getAttribute('name'));
        expect('Button02').toBe(elements[2].getAttribute('name'));
        expect('Button01').toBe(elements[3].getAttribute('name'));

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

    test('generic snippets', async () => {
        const result = await RenderPanoramaXML(path.join(__dirname, 'test_snippets.xml'), {
            snippetsFiles: [
                path.join(__dirname, 'snippets/Ability.xml'),
                path.join(__dirname, 'snippets/Item.xml'),
            ],
        });
        expect(result).toMatchSnapshot();
    });

    test('generic snippets - no snippets', async () => {
        const result = await RenderPanoramaXML(path.join(__dirname, 'test_snippets2.xml'), {
            snippetsFiles: [
                path.join(__dirname, 'snippets/Ability.xml'),
                path.join(__dirname, 'snippets/Item.xml'),
                path.join(__dirname, 'snippets/NoSnippets.xml'),
            ],
        });
        expect(result).toMatchSnapshot();
    });
});
