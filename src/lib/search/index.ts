import {getMatchedNodeInfos, getSearchContextNodes} from "./utils";
import HighlightCustom from "./HighlightCustom/index";
import HighlightNative from "./HighlightNative/index";
import {MatchedTextRange} from "./type";

export interface SearchOptions {
    classPrefix?: string;
    wrapElementId: string;
    wrapElement: HTMLElement;
    detailElement: HTMLElement;
    doSearch?: (searchContextText: string, word: string) => MatchedTextRange[]
}

export default class Search {
    public options: SearchOptions;
    public detailElement: HTMLElement
    public highlightIns: HighlightCustom | HighlightNative;
    public isNativeSupport: boolean;

    constructor(options: SearchOptions) {
        this.options = options;
        const {detailElement} = options
        // @ts-ignore
        this.isNativeSupport = !!(window.Highlight && window.CSS.highlights);

        this.detailElement = detailElement

        this.isNativeSupport = false
        if (this.isNativeSupport) {
            this.highlightIns = new HighlightNative(options)
        } else {
            this.highlightIns = new HighlightCustom(options)
        }
        // @ts-ignore
        window.__Highlight = this.highlightIns;
    }

    search(word: string) {
        this.highlightIns.unHighlight()
        if (!word) {
            return
        }

        const textsNodes = getSearchContextNodes(this.detailElement)
        const searchContextText = textsNodes.map(node => node.nodeValue).join('')

        try {
            const doSearch = this.options.doSearch || this.doSearch;

            const matchedTextRanges = doSearch(searchContextText, word)
            const nodeInfos = getMatchedNodeInfos(textsNodes, matchedTextRanges)
            const matchedNodeInfos = nodeInfos.flat()

            this.highlightIns.highlight(matchedNodeInfos)
        } catch (e) {

        }
    }

    private doSearch(searchContextText: string, word: string): MatchedTextRange[] {
        const len = word.length

        const matchedTextRanges: MatchedTextRange[] = [];
        let result = null
        const regExp = new RegExp(word, 'g')
        while (result = regExp.exec(searchContextText)) {
            const {index} = result

            const range: MatchedTextRange = {
                start: index,
                end: index + len - 1,
            }
            matchedTextRanges.push(range)
        }
        console.log('matchedTextRanges', matchedTextRanges)
        return matchedTextRanges
    }

    public dispose(): void {
        this.highlightIns.dispose();
    }
}
