import {findAllScrollableElements, IRect, recursionGetVisibleRect, ScrollableInfo} from "./utils";
import {IHighLight, MatchedNodeRangeInfo} from "../type";
import {findChildByCls, getRandomValue} from "../utils";
import {addResizeListener, removeResizeListener} from "./utils";

interface CustomHighlightRangeInfo extends MatchedNodeRangeInfo {
    parentScroll: ScrollableInfo | null;
    range: Range | null;
    highlightEl: HTMLElement | null;
}

export interface HighlightCustomOptions {
    wrapElementId: string;
    wrapElement: HTMLElement;
    detailElement: HTMLElement;
    highlightKey?: string;
}

class HighlightCustom implements IHighLight {
    public wrapElement: HTMLElement;
    public detailElement: HTMLElement;
    public highlightContainer: HTMLElement | null;
    public highlightKey: string;
    public highlights: CustomHighlightRangeInfo[];
    public scrollableInfos: ScrollableInfo[];

    constructor(options: HighlightCustomOptions) {
        this.wrapElement = options.wrapElement
        this.detailElement = options.detailElement
        this.highlightContainer = null;
        this.highlightKey = options.highlightKey || `highlight${getRandomValue()}`
        this.highlights = []
        this.scrollableInfos = []

        this.onResize = this.onResize.bind(this);
        this.onScroll = this.onScroll.bind(this)

        this.init();
    }

    private init(): void {
        this.scrollableInfos = findAllScrollableElements(this.detailElement);
        this.bindScrollEvent();

        const highlightElCls: string = 'search-highlight-container'
        const highlightElements = findChildByCls(this.wrapElement, highlightElCls)
        if (highlightElements) {
            highlightElements.forEach(node => node.remove())
        }

        const highlightEl = document.createElement('div')
        highlightEl.className = "search-highlight-container"
        this.highlightContainer = highlightEl;
        this.detailElement.insertAdjacentElement('beforebegin', highlightEl);

        const styleElCls: string = 'search-highlight-style'
        const styleElements = findChildByCls(this.wrapElement, styleElCls)
        if (styleElements) {
            styleElements.forEach(node => node.remove())
        }
        const styleElStr = `
            <style class="${styleElCls}">
                .${this.highlightKey} {
                    position: absolute;
                    /*background-color: rgb(245, 74, 69, 0.6);*/
                    background-color: rgb(255, 198, 10, 0.5);
                    pointer-events: none;
                    z-index: 11;
                }
            </style>
            `;
        this.wrapElement.insertAdjacentHTML('beforeend', styleElStr)
    }

    private bindScrollEvent(): void {
        this.scrollableInfos.forEach(info => {
            const element = info.node
            element.addEventListener('scroll', this.onScroll)
        })

        addResizeListener(this.detailElement, this.onResize)
    }

    private onResize(): void {
        this.updateHighlights(this.highlights);
    }

    private onScroll(e: Event) {
        const target = e.target as Element;
        const shouldUpdateInfos: CustomHighlightRangeInfo[] = [];
        this.highlights.forEach(info => {
            const {node} = info
            if (target?.contains?.(node)) {
                shouldUpdateInfos.push(info)
            }
        })

        this.updateHighlights(shouldUpdateInfos);
    }

    private removeScrollEvent(): void {
        this.scrollableInfos.forEach(info => {
            const element = info.node
            element.removeEventListener('scroll', this.onScroll)
        })

        removeResizeListener(this.detailElement, this.onResize)
    }

    public highlight(matchedNodeInfos: MatchedNodeRangeInfo[]) {
        const highlightRangeInfos: CustomHighlightRangeInfo[] = [];
        for (let i = 0; i < matchedNodeInfos.length; i++) {
            const matchedNodeInfo = matchedNodeInfos[i]

            let parentScroll = null;
            for (let j = this.scrollableInfos.length - 1; j >= 0; j--) {
                const scrollInfo = this.scrollableInfos[j]

                const {node} = scrollInfo
                if (node.contains(matchedNodeInfo.node)) {
                    parentScroll = scrollInfo;
                    break;
                }
            }

            highlightRangeInfos.push({
                ...matchedNodeInfo,
                parentScroll,
                range: null,
                highlightEl: null,
            })
        }

        const highlights: CustomHighlightRangeInfo[] = []
        highlightRangeInfos.forEach(info => {
            const range = new Range()
            range.setStart(info.node, info.start)
            range.setEnd(info.node, info.end)

            const standardRange = new Range()
            standardRange.setStart(info.node, 0)
            standardRange.setEnd(info.node, 0)
            const standardRangeReact = standardRange.getBoundingClientRect()
            const lineHeight = standardRangeReact.height

            const rangeRect = range.getBoundingClientRect()
            if (rangeRect.height === lineHeight) {
                highlights.push({
                    ...info,
                    range,
                })
            } else {
                // 多行的情况
                let i = 0
                let j = 1
                const l = info.end - info.start;
                while (j <= l) {
                    const subRange = new Range()
                    subRange.setStart(info.node, info.start + i)
                    subRange.setEnd(info.node, info.start + j)
                    const subRangeReact = subRange.getBoundingClientRect()
                    if (subRangeReact.height === lineHeight) {
                        if (j !== 1) {
                            highlights.pop()
                        }
                        j++
                    } else {
                        i = j - 1
                    }
                    highlights.push({
                        ...info,
                        range: subRange,
                    })
                }
            }
        })
        this.highlights = highlights;
        this.createHighlights(highlights)
    }

    private createHighlights(highlights: CustomHighlightRangeInfo[]): void {
        if (!this.highlightContainer) {
            return;
        }
        const wrapElementRect = this.wrapElement.getBoundingClientRect();
        highlights.forEach(info => {
            const {range} = info;
            if (range) {
                const rect = range.getBoundingClientRect()
                const visibleRect = recursionGetVisibleRect(rect, info.parentScroll!);

                const el = document.createElement('div')
                info.highlightEl = el
                el.className = `${this.highlightKey}`

                this.updateHighlight(el, visibleRect, wrapElementRect)
                this.highlightContainer?.insertAdjacentElement('beforeend', el)
            }
        })
    }

    public updateHighlights(highlights: CustomHighlightRangeInfo[]): void {
        const wrapElementRect = this.wrapElement.getBoundingClientRect();
        highlights.forEach(info => {
            const {range, highlightEl} = info
            if (range && highlightEl) {
                const rect = range.getBoundingClientRect();
                const visibleRect = recursionGetVisibleRect(rect, info.parentScroll!);

                this.updateHighlight(highlightEl, visibleRect, wrapElementRect);
            }
        })
    }

    public updateHighlight(highlightEl: HTMLElement, visibleRect: IRect, wrapElementRect: DOMRect): void {
        const wrapLeft = wrapElementRect.left || 0
        const wrapTop = wrapElementRect.top || 0

        const width = visibleRect.right - visibleRect.left;
        const height = visibleRect.bottom - visibleRect.top;

        highlightEl.style.left = `${visibleRect.left - wrapLeft + this.wrapElement.scrollLeft}px`
        highlightEl.style.top = `${visibleRect.top - wrapTop + this.wrapElement.scrollTop}px`
        highlightEl.style.width = `${width}px`
        highlightEl.style.height = `${height}px`
    }

    public unHighlight() {
        this.highlights = []
        if (this.highlightContainer) {
            this.highlightContainer.innerHTML = ''
        }
    }

    public dispose() {
        this.unHighlight()
        this.removeScrollEvent()
    }
}

export default HighlightCustom