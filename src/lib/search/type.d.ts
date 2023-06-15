export interface IHighLight {
    highlight: (matchedNodeInfos: MatchedNodeRangeInfo[]) => void;
    unHighlight: () => void;
    dispose: () => void;
}

export type MatchedNodeRangeInfo = {
    node: Node;
    start: number;
    end: number;
}

export type MatchedTextRange = {
    start: number;
    end: number;
}