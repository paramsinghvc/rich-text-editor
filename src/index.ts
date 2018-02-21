import './index.scss';
import { DOMHelpers, NODE_TYPE } from './DOMHelpers';
import { Toolbar } from './Toolbar';

const iframe = document.createElement('iframe');
const ToolbarElement = Toolbar.createToolbar();

iframe.id = 'editor';
document.body.appendChild(iframe);

const doc = iframe.contentDocument;
const win = iframe.contentWindow;

const DOM = DOMHelpers.createHelper(doc, win);

ToolbarElement.attachClickHandler(DOM, iframe);
    
doc.body.contentEditable = 'true';
doc.body.innerHTML = '<p>Half of my heart is in Havana</p>';
