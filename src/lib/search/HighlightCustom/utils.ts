import ResizeObserver from "resize-observer-polyfill";
import debounce from "lodash.debounce";

const isServer = typeof window === 'undefined';

const resizeHandler = function (entries: any) {
    for (const entry of entries) {
        const listeners = entry.target.__resizeListeners__ || [];
        if (listeners.length) {
            listeners.forEach((fn: () => void) => {
                fn();
            });
        }
    }
};

export const addResizeListener = function (element: any, fn: () => void) {
    if (isServer) return;
    if (!element.__resizeListeners__) {
        element.__resizeListeners__ = [];
        element.__ro__ = new ResizeObserver(debounce(resizeHandler, 30));
        element.__ro__.observe(element);
    }
    element.__resizeListeners__.push(fn);
};

export const removeResizeListener = function (element: any, fn: () => void) {
    if (!element || !element.__resizeListeners__) return;
    element.__resizeListeners__.splice(element.__resizeListeners__.indexOf(fn), 1);
    if (!element.__resizeListeners__.length) {
        element.__ro__.disconnect();
        element.__resizeListeners__ = null
    }
};

export interface ScrollableInfo {
    node: Element;
    parentScroll: ScrollableInfo | null;
}

export function findAllScrollableElements(node: Element, parent: ScrollableInfo | null = null, scrollableElements: ScrollableInfo[] = []): ScrollableInfo[] {
    if (node.nodeType !== Node.ELEMENT_NODE) {
        return [];
    }

    const style = window.getComputedStyle(node);
    const overflowY = style.getPropertyValue('overflow-y');
    const isScrollable = overflowY === 'scroll' || overflowY === 'auto';

    let nextParentNode: ScrollableInfo | null = null
    if (isScrollable) {
        nextParentNode = {
            node,
            parentScroll: parent
        }
        scrollableElements.push(nextParentNode);
    }

    for (let i = 0; i < node.children.length; i++) {
        findAllScrollableElements(node.children[i], isScrollable ? nextParentNode : parent, scrollableElements);
    }

    return scrollableElements;
}

export interface IRect {
    left: number;
    top: number;
    right: number;
    bottom: number;
}

export const recursionGetVisibleRect = (rect: IRect, info: ScrollableInfo): IRect => {
    if (!info) {
        return rect;
    }
    const {node, parentScroll} = info;
    const rectA = node.getBoundingClientRect()
    const nextRect = getBVisibleRectInA(rectA, rect);
    if (!parentScroll) {
        return nextRect;
    } else {
        return recursionGetVisibleRect(nextRect, parentScroll)
    }
}

export const getBVisibleRectInA = (containerARect: IRect, containerBRect: IRect) => {
    const containerBVisibleRect = {
        left: Math.max(containerARect.left, containerBRect.left),
        top: Math.max(containerARect.top, containerBRect.top),
        right: Math.min(containerARect.right, containerBRect.right),
        bottom: Math.min(containerARect.bottom, containerBRect.bottom)
    };
    return containerBVisibleRect;
}