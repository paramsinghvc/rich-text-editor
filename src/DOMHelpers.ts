export enum NODE_TYPE {
    'ELEMENT_NODE' = 1,
    'TEXT_NODE' = 3
}

export class DOMHelpers {
    _document: Document;
    _window: Window;

    /**
     * Factory Method to instantiate the class
     * @param document 
     * @param window 
     */
    static createHelper(document: Document, window: Window) {
        return new DOMHelpers(document, window);
    }

    constructor(document: Document, window: Window) {
        this._document = document;
        this._window = window;
    }

    /**
     * Given a caret position in between a text node, returns the whole word present in there.
     * @param str 
     * @param index 
     */
    getWordAtIndex(str: string, index: number) {
        const preTextMatch = str.slice(0, index).match(/\S+$/);
        const postTextMatch = str.slice(index).match(/\S+/);

        let preText = '', postText = '', startIndex, endIndex;

        if (preTextMatch && preTextMatch.length > 0) {
            preText = preTextMatch[0];
            startIndex = preTextMatch['index'];
        }
        if (postTextMatch && postTextMatch.length > 0) {
            postText = postTextMatch[0];
        }

        const word = `${preText}${postText}`;
        return {
            word,
            startIndex,
            endIndex: startIndex + word.length
        };
    }

    /**
     * Helper for creating a document element
     * @param type 
     */
    createElement(type = 'div', attributes?: object) {
        const el = this._document.createElement(type);
        if (attributes) {
            Object.keys(attributes).forEach(key => {
                el[key] = attributes[key];
            });
        }
        return el;
    }

    createTextNode(data: string) {
        return this._document.createTextNode(data);
    }

    createRange() {
        return this._document.createRange();
    }

    createRangeFromNode(node: Node) {
        const range = this.createRange();
        let startOffset = 0, endOffset = 0;

        if (node.nodeType === NODE_TYPE.TEXT_NODE) {
            startOffset = 0;
            endOffset = node.textContent.length;
        } else if (node.nodeType === NODE_TYPE.ELEMENT_NODE) {
            startOffset = 0;
            endOffset = node.childNodes.length;
        }
        range.selectNode(node);
        range.setStart(node, startOffset);
        range.setEnd(node, endOffset);
        return range.cloneRange();
    }
    /**
     * Wrap a given node with a new one
     * @param newNode 
     * @param refNode 
     */
    encloseNode(newNode: Node, refNode: Node) {
        refNode.parentNode.insertBefore(newNode, refNode);
        this.removeNode(refNode);
        newNode.appendChild(refNode);
    }

    /**
     * Wrap a node with a new one by creating it from a tag name
     * @param node 
     * @param tagName 
     */
    encloseNodeWithTag(node: Node, tagName: string, tagAttrs?: object) {
        const newNode = this.createElement(tagName, tagAttrs);
        // [].slice.call(node.childNodes).forEach(n => {
        //     newNode.appendChild(n);
        // });

        this.encloseNode(newNode, node);
    }

    getTextLeafNode(node: Node) {
        let currentNode;
        while (currentNode = node) {
            if (currentNode.nodeType === NODE_TYPE.TEXT_NODE) {
                break;
            }
            node = node.firstChild;
        }
        return currentNode;
    }

    getUserSelection() {
        let userSelection;
        if (this._window.getSelection) {
            userSelection = this._window.getSelection();
        }
        else if ((this._document as any).selection) { // Opera!
            userSelection = (this._document as any).selection.createRange();
        }
        return userSelection;
    }
    /**
     * Get Range Object from the user selection
     */
    getUserSelectionRange(): Range {
        const userSelection = this.getUserSelection();
        return this.getRangeObject(userSelection);
    }

    /**
     * Get Range from the selection passed to it
     * @param selectionObject 
     */
    getRangeObject(selectionObject: Selection): Range {
        if (selectionObject.getRangeAt)
            return selectionObject.getRangeAt(0);
        else { // Safari!
            let range: Range = this._document.createRange();
            range.setStart(selectionObject.anchorNode, selectionObject.anchorOffset);
            range.setEnd(selectionObject.focusNode, selectionObject.focusOffset);
            return range;
        }
    }

    /**
     * To traverse through the parents of a given node until a loop-break strategy is hit
     * @param startingNode 
     * @param breakStrategy 
     */
    traverseAncestors(startingNode: Node, breakStrategy: (node: Node) => boolean) {
        let node = startingNode;
        while (node && !breakStrategy(node)) {
            node = node.parentNode;
        }
        return node;
    }

    /**
     * Get the closest parent from the given node with a given node name
     * @param startingNode 
     * @param nodeName 
     * TODO: To break the loop when a block element is encountered on its path
     */
    getClosestParent(startingNode: Node, nodeName: string) {
        return this.traverseAncestors(startingNode, (node) => node.nodeName === nodeName);
    }

    removeNode(node: Node) {
        return node.parentNode.removeChild(node);
    }
}