import {MatchedNodeRangeInfo, MatchedTextRange} from "./type";

export function getSearchContextNodes(node: HTMLElement): Node[] {
    // const textNodes = [];
    // const children = node.childNodes;
    // for (let i = 0; i < children.length; i++) {
    //     const child = children[i];
    //     if (child.nodeType === Node.TEXT_NODE) {
    //         textNodes.push(child);
    //     } else if (blankTagNames.includes(child.tagName)) {
    //         textNodes.push(child)
    //     } else if (child.nodeType === Node.ELEMENT_NODE) {
    //         textNodes.push(...getSearchContextNodes(child));
    //     }
    // }
    // return textNodes;

    const walker = document.createTreeWalker(
        node,
        NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
        {
            acceptNode(node) {
                if (node.nodeType === Node.TEXT_NODE) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_SKIP;
            },
        }
    );

    const allTextNodes = [];
    let currentNode = walker.nextNode();
    while (currentNode) {
        allTextNodes.push(currentNode);
        currentNode = walker.nextNode();
    }
    console.log('allTextNodes', allTextNodes)
    return allTextNodes
}

const blankTagNames = ['BR']


export function getMatchedNodeInfos(nodeList: Node[], ranges: MatchedTextRange[]): MatchedNodeRangeInfo[][] {
    const result: MatchedNodeRangeInfo[][] = []
    let index = 0;

    for (let i = 0; i < nodeList.length; i++) {
        const node = nodeList[i]

        if (blankTagNames.includes(node.nodeName)) {
            index += 1
            continue
        }

        const text = node.nodeValue || '';
        const length = text.length;
        const nodeStart = index;
        const nodeEnd = index + length - 1;

        for (let j = 0; j < ranges.length; j++) {
            const range = ranges[j]
            const {start, end} = range

            if (!(nodeStart > end || nodeEnd < start)) {
                const info: MatchedNodeRangeInfo = {
                    node,
                    start: Math.max(start - nodeStart, 0),
                    end: Math.min(end - nodeStart + 1, length),
                }

                const targetCache = result[j]
                if (targetCache) {
                    targetCache.push(info)
                } else {
                    result[j] = [info]
                }
            }
        }


        index += length
    }
    console.log('matchedNodeInfos', result)


    return result
}

export const findChildByCls = (parent: HTMLElement, childCls: string): Element[] => {
    return Array.from(parent.children).filter(child => child.classList.contains(childCls))
}

export const getRandomValue = () => {
    return Math.random().toString().replace('0.', '')
}



