import { TemplateResult, html } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import RichTextManager from 'RichTextManager';
import ArenaNode from 'interfaces/ArenaNode';
import ArenaNodeText from 'interfaces/ArenaNodeText';
import AbstractNodeText from './AbstractNodeText';

export default class TextNode
  extends AbstractNodeText
  implements ArenaNodeText {
  protected text = '';

  insertText(
    text: string | RichTextManager,
    offset = 0,
  ): [ArenaNode, number] | undefined {
    const textStr = typeof text === 'string' ? text : text.getText();
    this.text = this.text.slice(0, offset) + textStr + this.text.slice(offset);
    return [this, offset + textStr.length];
  }

  insertFormating(name: string, start: number, end: number): void {
    //
  }

  toggleFormating(name: string, start: number, end: number): void {
    //
  }

  getText(): string | RichTextManager {
    return this.text;
  }

  cutText(start: number, end?: number): string {
    let result;
    if (end === undefined) {
      result = this.text.slice(start);
      this.text = this.text.slice(0, start);
    } else {
      result = this.text.slice(start, end);
      this.text = this.text.slice(0, start) + this.text.slice(end);
    }
    return result;
  }

  getTemplate(): TemplateResult | string {
    let { text } = this;
    if (text === '') {
      return html`<br/>`;
    }
    text = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/^\s/, '&nbsp;')
      .replace(/\s&/, '&nbsp;')
      .replace(/\s\s/g, ' &nbsp;');
    return html`${unsafeHTML(text)}`;
  }

  getHtml(): TemplateResult | string {
    return this.arena.template(this.getTemplate(), this.getGlobalIndex());
  }

  removeText(start: number, end?: number): void {
    if (end === undefined) {
      this.text = this.text.slice(0, start);
    } else {
      this.text = this.text.slice(0, start) + this.text.slice(end);
    }
  }

  getTextLength(): number {
    return this.text.length;
  }

  remove(): void {
    this.parent.removeChild(this.getIndex());
  }
}
