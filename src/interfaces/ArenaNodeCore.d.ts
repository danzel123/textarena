import ArenaModel from 'ArenaModel';
import { TemplateResult } from 'lit-html';
import RichTextManager from 'RichTextManager';
import Arena from './Arena';
import ArenaNodeText from './ArenaNodeText';
import ArenaNodeScion from './ArenaNodeScion';
import ArenaCursor from './ArenaCursor';

export default interface ArenaNodeCore {
  readonly arena: Arena;

  insertText(
    text: string | RichTextManager,
    offset: number,
    keepFormatings?: boolean,
  ): ArenaCursor;

  createAndInsertNode(arena: Arena, offset: number): ArenaNodeScion | ArenaNodeText | undefined;

  getHtml(model: ArenaModel): TemplateResult | string;

  getGlobalIndex(): string;

  getTextNode(): ArenaNodeText | undefined;
}
