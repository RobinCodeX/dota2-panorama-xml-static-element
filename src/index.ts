import { DOMParser, XMLSerializer } from 'xmldom';
import formatter from 'xml-formatter';
import { readFile } from 'fs/promises';
import glob from 'glob';
import path from 'path';
import { promisify } from 'util';

interface RenderContext {
    readonly RootFile: string;
    readonly Root: Document;
    templates: Element[];
}

function getFirstElement(root: Node): Element | undefined {
    let child = root.firstChild;
    while (child) {
        if (child.nodeType === child.ELEMENT_NODE) {
            return child as Element;
        }
        child = child.nextSibling;
    }
}

function queryElementsByAttribute(attrName: string, root: Node): Element[] {
    const list: Element[] = [];
    let child = root.firstChild;
    while (child) {
        if (child.nodeType === child.ELEMENT_NODE) {
            if (!!(child as Element).getAttribute(attrName)) {
                list.push(child as Element);
            } else if (child.hasChildNodes()) {
                list.push(...queryElementsByAttribute(attrName, child));
            }
        }
        child = child.nextSibling;
    }
    return list;
}

function queryElementsByID(id: string, root: Node): Element | undefined {
    let child = root.firstChild;
    while (child) {
        if (child.nodeType === child.ELEMENT_NODE) {
            if ((child as Element).getAttribute('id') === id) {
                return child as Element;
            } else if (child.hasChildNodes()) {
                const nextChild = queryElementsByID(id, child);
                if (nextChild) {
                    return nextChild;
                }
            }
        }
        child = child.nextSibling;
    }
}

function getAllAttributes(root: Element): Record<string, string> {
    const result: Record<string, string> = {};
    for (let i = 0; i < root.attributes.length; i++) {
        const attr = root.attributes.item(i)!;
        result[attr.name] = attr.value;
    }
    return result;
}

function replaceVariables(root: Element, key: string, value: string) {
    if (root.nodeType === root.ELEMENT_NODE) {
        for (let i = 0; i < root.attributes.length; i++) {
            const attr = root.attributes.item(i)!;
            attr.value = attr.value.replace(`[${key}]`, value);
        }
    }

    if (root.hasChildNodes()) {
        let child = root.firstChild as Element;
        while (child) {
            if (child.nodeType === child.ELEMENT_NODE) {
                replaceVariables(child, key, value);
            }
            child = child.nextSibling as Element;
        }
    }
}

function ClearComments(root: Node) {
    for (let i = root.childNodes.length - 1; i >= 0; i--) {
        const child = root.childNodes.item(i);
        if (child.nodeType === child.COMMENT_NODE) {
            child.parentNode?.removeChild(child);
        } else if (child.hasChildNodes()) {
            ClearComments(child);
        }
    }
}

function ReplaceTemplates(templates: Element[], root: Node) {
    for (let i = root.childNodes.length - 1; i >= 0; i--) {
        let child = root.childNodes.item(i) as Element;
        if (child.nodeType === child.ELEMENT_NODE) {
            const template = templates.find((v) => v.getAttribute('name') === child.nodeName);
            if (template) {
                const firstElement = getFirstElement(template.cloneNode(true));
                if (!firstElement) {
                    throw Error(`not first child in template ${child.nodeName}`);
                }

                // Copy children
                const bindElements = queryElementsByAttribute('bind', firstElement);
                for (const elem of bindElements) {
                    const bindTag = elem.getAttribute('bind')!;
                    elem.removeAttribute('bind');
                    const target = child.getElementsByTagName(bindTag).item(0);
                    if (target) {
                        for (let i = 0; i < target.childNodes.length; i++) {
                            const element = target.childNodes.item(i);
                            elem.appendChild(element.cloneNode(true));
                        }
                    }
                }

                // Replace attribute value
                for (const [k, v] of Object.entries(getAllAttributes(child))) {
                    replaceVariables(firstElement, k, v);
                }

                // Inherit ID
                const childID = child.getAttribute('id');
                if (childID) {
                    firstElement.setAttribute('id', childID);
                }

                // Merge class
                const childClass = child.getAttribute('class');
                if (childClass) {
                    const classList: string[] = [
                        ...(firstElement.getAttribute('class') || '').split(' '),
                        ...childClass.split(' '),
                    ].filter((v) => !!v.trim());
                    firstElement.setAttribute('class', classList.join(' '));
                }

                // Merge style
                const childStyle = child.getAttribute('style');
                if (childStyle) {
                    const classList: string[] = [
                        ...(firstElement.getAttribute('style') || '').split(';'),
                        ...childStyle.split(';'),
                    ].filter((v) => !!v.trim());
                    firstElement.setAttribute('style', classList.join(';') + ';');
                }

                // Replace element
                child.parentNode?.replaceChild(firstElement, child);
                child = firstElement;
            }
            if (child.hasChildNodes()) {
                ReplaceTemplates(templates, child);
            }
        }
    }
}

function StartRender(ctx: RenderContext) {
    ClearComments(ctx.Root);

    // Find templates
    const templateElements = ctx.Root.getElementsByTagName('Template');
    for (let i = templateElements.length - 1; i >= 0; i--) {
        const element = templateElements.item(i)!;
        element.parentNode?.removeChild(element);
        ctx.templates.push(element);
    }

    ReplaceTemplates(ctx.templates, ctx.Root);
}

export interface RenderPanoramaXMLOptions {
    /**
     * Default is two spaces
     */
    indentation: string;
    /**
     * Path to template folders
     */
    templateRoots?: string[];
    /**
     * Prepare templates
     */
    templates?: Element[];
}

async function parseXMLFile(filePath: string): Promise<Document> {
    const body = await readFile(filePath, { encoding: 'utf8' });
    return new DOMParser().parseFromString(body, 'text/xml');
}

export async function PreloadTemplates(folders: string[]): Promise<Element[]> {
    const list: Element[] = [];

    for (const f of folders) {
        const files = await promisify(glob)(path.join(f, '**/*.xml'));
        for (const file of files) {
            const doc = await parseXMLFile(file);
            const templateElements = doc.getElementsByTagName('Template');
            for (let i = templateElements.length - 1; i >= 0; i--) {
                const element = templateElements.item(i)!;
                const name = element.getAttribute('name');
                if (list.some((v) => v.getAttribute('name') === name)) {
                    throw Error(`${file}: Duplicate template name '${name}'`);
                }
                list.push(element);
            }
        }
    }

    return list;
}

export async function RenderPanoramaXML(
    xmlFilePath: string,
    options?: RenderPanoramaXMLOptions
): Promise<string> {
    if (!options) {
        options = { indentation: '  ' };
    }
    if (!options.templates) {
        options.templates = [];
    }
    if (options.templateRoots) {
        options.templates = [
            ...options.templates,
            ...(await PreloadTemplates(options.templateRoots)),
        ];
    }

    const doc = await parseXMLFile(xmlFilePath);
    const ctx: RenderContext = {
        RootFile: xmlFilePath,
        Root: doc,
        templates: options.templates,
    };
    StartRender(ctx);

    return formatter(new XMLSerializer().serializeToString(ctx.Root), {
        indentation: options.indentation || '  ',
        lineSeparator: '\n',
    });
}
