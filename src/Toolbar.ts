import { DOMHelpers, NODE_TYPE } from './DOMHelpers';

const DOM = DOMHelpers.createHelper(document, window);

export class Toolbar {

    toolbar: HTMLElement;
    iframe: HTMLIFrameElement;
    selectedRange: Range;

    static createToolbar() {
        return new Toolbar();
    }

    constructor() {
        this.init();
    }

    init() {
        const toolbar = DOM.createElement('section');
        toolbar.id = 'toolbar';
        document.body.appendChild(toolbar);
        toolbar.innerHTML = ['B', 'I', 'U', 'H1', 'H2', 'p'].map(c => `<p>${c}</p>`).join('');
        this.toolbar = toolbar;
    }

    setFocusIframe(_DOMHelpers: DOMHelpers) {
        this.iframe.focus();

        const selection = _DOMHelpers.getUserSelection();
        if (selection.rangeCount > 0) {
            console.log(this.selectedRange);
            if (this.selectedRange) {

                selection.removeAllRanges();
                selection.addRange(this.selectedRange);
            }
        }
    }

    attachClickHandler(_DOMHelpers: DOMHelpers, iframe: HTMLIFrameElement) {
        this.iframe = iframe;
        this.toolbar.addEventListener('click', (event) => {
            if ((event.target as Node).nodeName !== 'P') {
                return;
            }
            const toolbarItem: HTMLElement = <HTMLElement>(event.target);
            toolbarItem.classList.toggle('selected');

            switch ((<Node>event.target).textContent) {
                case 'B':
                    {
                        /** Get the current range from user selection */
                        const range: Range = _DOMHelpers.getUserSelectionRange();
                        /** Get the element or node from which selection is starting */
                        const currentNode = range.startContainer;

                        let strongNode, newNode;
                        /** Get the nearest node to the currentNode with strong as its node/tag name */
                        if ((strongNode = _DOMHelpers.getClosestParent(currentNode, 'STRONG'))) {
                            /**
                             *  If its found in its ancestors, it means we need to remove or unwrap it's children nodes or elements 
                             * if Bold on the toolbar is clicked.
                             * Mind that firstChild and firstElementChild prop on strongNode could give text nodes with blank nodeValues.
                             * Hence, traversing through all the child textnodes and appending them to the parent while unwrapping is safe.
                             */
                            let innerNode = strongNode.firstElementChild || strongNode.firstChild;
                            // strongNode.parentNode.replaceChild(innerNode, strongNode);
                            [].slice.call(strongNode.children).forEach(child => {
                                strongNode.parentNode.insertBefore(child, strongNode);
                            });
                            strongNode.parentNode.removeNode(strongNode);
                            /** Next, we need to re focus the iframe and restore our selection, hence the right textnode holding the content
                             * in its nodeValue is to be passed for finding the right startContainer, startOffset, endContainer & endOffset 
                             * props for the restoration to work.
                             */
                            this.selectedRange = _DOMHelpers.createRangeFromNode(_DOMHelpers.getTextLeafNode(innerNode));
                        } else {
                            /** If no strong node is found in the ancestors, it means we need to bold the selected text/element node */
                            if (currentNode.nodeType === NODE_TYPE.TEXT_NODE) { // Text Node
                                const newTextContent = currentNode.textContent;

                                newNode = _DOMHelpers.createElement('strong');
                                if (range.collapsed) {
                                    const { word, startIndex, endIndex } = _DOMHelpers.getWordAtIndex(newTextContent, range.startOffset);
                                    const preString = newTextContent.slice(0, startIndex);
                                    const postString = newTextContent.slice(endIndex);

                                    const wordTextNode = _DOMHelpers.createTextNode(word);

                                    newNode.appendChild(wordTextNode);
                                    currentNode.parentNode.replaceChild(newNode, currentNode);
                                    /* insertAdjacentText needs given node to have a parent */
                                    newNode.insertAdjacentText('beforebegin', preString);
                                    newNode.insertAdjacentText('afterend', postString);
                                    this.selectedRange = _DOMHelpers.createRangeFromNode(wordTextNode);

                                } else {
                                    const textNode = _DOMHelpers.createTextNode(newTextContent.slice(range.startOffset, range.endOffset));
                                    newNode.appendChild(textNode);
                                    range.deleteContents();
                                    range.insertNode(newNode);
                                    /** Set new Range to be selected */
                                    this.selectedRange = _DOMHelpers.createRangeFromNode(_DOMHelpers.getTextLeafNode(newNode));
                                }
                            } else if (currentNode.nodeType === NODE_TYPE.ELEMENT_NODE) {
                                _DOMHelpers.encloseNodeWithTag(currentNode, 'STRONG');
                                this.selectedRange = _DOMHelpers.createRangeFromNode(_DOMHelpers.getTextLeafNode(currentNode));
                            }
                        }

                        this.setFocusIframe(_DOMHelpers);

                    }
                    break;
                case 'I':
                    {
                        const range: Range =  _DOMHelpers.getUserSelectionRange();
                        const currentNode = range.startContainer;

                        let emNode, newNode;
                        if ((emNode = _DOMHelpers.getClosestParent(currentNode, 'EM'))) {
                            let innerNode = emNode.firstElementChild || emNode.firstChild;
                            emNode.parentNode.replaceChild(innerNode, emNode);
                            // _DOMHelpers.removeNode(emNode);
                            this.selectedRange = _DOMHelpers.createRangeFromNode(_DOMHelpers.getTextLeafNode(innerNode));
                        } else {
                            if (currentNode.nodeType === NODE_TYPE.TEXT_NODE) { // Text Node
                                const newTextContent = currentNode.textContent;
                                newNode = DOM.createElement('em');
                                const textNode = DOM.createTextNode(newTextContent.slice(range.startOffset, range.endOffset));
                                newNode.appendChild(textNode);
                                range.deleteContents();
                                range.insertNode(newNode);
                                // Set new Range to be selected
                                this.selectedRange = _DOMHelpers.createRangeFromNode(_DOMHelpers.getTextLeafNode(textNode));
                            } else if (currentNode.nodeType === NODE_TYPE.ELEMENT_NODE) {
                                _DOMHelpers.encloseNodeWithTag(currentNode, 'EM');
                                this.selectedRange = _DOMHelpers.createRangeFromNode(_DOMHelpers.getTextLeafNode(currentNode));
                            }
                        }

                        this.setFocusIframe(_DOMHelpers);

                    }
                    break;
            }
        })
    }

}