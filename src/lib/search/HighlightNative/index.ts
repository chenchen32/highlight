import {IHighLight, MatchedNodeRangeInfo} from "../type";
import {findChildByCls, getRandomValue} from "../utils";

export interface HighlightNativeOptions {
    wrapElementId: string;
    wrapElement: HTMLElement;
    detailElement: HTMLElement;
    highlightKey?: string;
}

class HighlightNative implements IHighLight {
    public highlightKey: string;
    public detailElement: HTMLElement;
    public wrapElementId: string;
    public wrapElement: HTMLElement;

    constructor(options: HighlightNativeOptions) {
        this.highlightKey = options.highlightKey || `highlight${getRandomValue()}`;
        this.detailElement = options.detailElement
        this.wrapElementId = options.wrapElementId
        this.wrapElement = options.wrapElement
        this.init();
    }

    private init(): void {
        const styleNodeCls: string = 'search-highlight-style'
        const styleElements = findChildByCls(this.wrapElement, styleNodeCls)
        if (styleElements) {
            styleElements.forEach(node => node.remove())
        }

        const styleEl = `
            <style class="${styleNodeCls}">
                #${this.wrapElementId}::highlight(${this.highlightKey}) {
                    background-color: yellow;
                    color: black;
                }
            </style>
        `;
        this.wrapElement.insertAdjacentHTML('beforeend', styleEl)
    }

    public highlight(matchedNodeInfos: MatchedNodeRangeInfo[]): void {
        const highlightRanges: Range[] = []
        matchedNodeInfos.forEach(info => {
            const range = new Range()
            range.setStart(info.node, info.start)
            range.setEnd(info.node, info.end)
            highlightRanges.push(range)
        })
        console.log('highlightRanges', highlightRanges)
        // @ts-ignore
        const highlight = new window.Highlight(...highlightRanges);
        // @ts-ignore
        CSS.highlights.set(this.highlightKey, highlight);
    }

    public unHighlight(): void {
        // @ts-ignore
        CSS.highlights.delete(this.highlightKey);
    }

    public dispose(): void {
        this.unHighlight()
    }
}

export default HighlightNative