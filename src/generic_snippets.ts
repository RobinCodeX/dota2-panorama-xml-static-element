import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { readFile } from 'fs/promises';

async function LoadSnippetsFile(file: string) {
    const source = await readFile(file, 'utf8');
    const doc = new DOMParser().parseFromString(source, 'text/xml');
    return doc.getElementsByTagName('snippets').item(0);
}

/**
 * Return all snippets
 */
export async function MakeGenericSnippets(files: string[]): Promise<Node[]> {
    if (files.length <= 0) {
        return [];
    }
    const result: Node[] = [];
    const snippetsList = await Promise.all(files.map(LoadSnippetsFile));
    for (const snippets of snippetsList) {
        if (!snippets) {
            continue;
        }
        for (let i = 0; i < snippets.childNodes.length; i++) {
            const element = snippets.childNodes.item(i) as Element;
            if (
                element &&
                element.nodeType === element.ELEMENT_NODE &&
                element.tagName === 'snippet'
            ) {
                result.push(element.cloneNode(true));
            }
        }
    }
    return result;
}
