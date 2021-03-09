/* eslint-disable no-console */
import ArenaOptions from 'interfaces/ArenaOptions';
import RootNode from 'models/RootNode';
import Textarena from 'Textarena';
import ArenaNodeText from 'interfaces/ArenaNodeText';
import ArenaNode from 'interfaces/ArenaNode';
import ArenaSelection from 'ArenaSelection';
import { Direction } from 'events/RemoveEvent';
import ArenaNodeAncestor from 'interfaces/ArenaNodeAncestor';
import ArenaNodeScion from 'interfaces/ArenaNodeScion';
import Arena, { ArenaRoot } from 'interfaces/Arena';
import ArenaFactory from 'arenas/ArenaFactory';

type TagAndAttributes = {
  tag: string,
  attributes: string[],
};

export type ArenaFormating = {
  name: string,
  tag: string,
  attributes: string[],
};

export type ArenaFormatings = {
  [key: string]: ArenaFormating,
};

type ArenaMark = {
  attributes: string[],
  arena: Arena,
};

type FormatingMark = {
  attributes: string[],
  formating: ArenaFormating
};

export default class ArenaModel {
  static rootArenaName = '__ROOT__';

  arenas: Arena[] = [];

  arenasByName: { [name: string]: Arena } = { };

  formatings: ArenaFormating[] = [];

  formatingsByName: ArenaFormatings = {};

  areanMarks: { [tag: string]: ArenaMark[] } = { };

  formatingMarks: { [tag: string]: FormatingMark[] } = { };

  rootArena: ArenaRoot;

  model: RootNode;

  constructor(private textarena: Textarena) {
    this.rootArena = this.registerArena({
      name: ArenaModel.rootArenaName,
      tag: '',
      attributes: [],
      hasChildren: true,
    }) as ArenaRoot;
    this.model = new RootNode(this.rootArena);
  }

  public registerArena(
    arenaOptions: ArenaOptions,
    markers?: TagAndAttributes[],
    parentArenas?: string[],
  ): Arena {
    const arena = ArenaFactory.create(arenaOptions);
    this.arenas.push(arena);
    this.arenasByName[arena.name] = arena;
    if (parentArenas) {
      parentArenas.forEach((parentName) => {
        const parentArena = this.arenasByName[parentName];
        if (!parentArena) {
          throw new Error(`Arena "${parentName}" not found`);
        }
        if (!('hasChildren' in parentArena)) {
          throw new Error(`Arena "${parentName}" has not children`);
        }
        parentArena.addAllowedChild(arena);
      });
    }
    if (markers) {
      markers.forEach(({ tag, attributes }) => {
        if (!this.areanMarks[tag]) {
          this.areanMarks[tag] = [];
        }
        this.areanMarks[tag].push({
          attributes,
          arena,
        });
      });
    }
    return arena;
  }

  public registerFormating(
    formating: ArenaFormating,
    markers: TagAndAttributes[],
  ): ArenaFormating {
    this.formatings.push(formating);
    this.formatingsByName[formating.name] = formating;
    markers.forEach(({ tag, attributes }) => {
      if (!this.formatingMarks[tag]) {
        this.formatingMarks[tag] = [];
      }
      this.formatingMarks[tag].push({
        attributes,
        formating,
      });
    });
    return formating;
  }

  getArena(name: string): Arena | undefined {
    return this.arenasByName[name];
  }

  public getFormatings(): ArenaFormatings {
    return this.formatingsByName;
  }

  public getArenaMarks(tagName: string): ArenaMark[] | undefined {
    return this.areanMarks[tagName];
  }

  public getFormatingMarks(tagName: string): FormatingMark[] | undefined {
    return this.formatingMarks[tagName];
  }

  public getTextNodeById(id: string): ArenaNodeText | undefined {
    const path = id.split('.').map((i) => parseInt(i, 10));
    let cursor: ArenaNode | RootNode | undefined = this.model;
    if (path.shift() === 0) {
      path.forEach((i) => {
        if (cursor && 'hasChildren' in cursor) {
          cursor = cursor.children[i];
        } else {
          cursor = undefined;
        }
      });
      if (cursor && 'hasText' in cursor) {
        return cursor;
      }
    }
    return undefined;
  }

  public getAncestors(node: ArenaNode): ArenaNodeAncestor[] {
    if ('hasParent' in node) {
      return [...this.getAncestors(node.parent), node.parent];
    }
    return [];
  }

  public getCommonAncestor(nodeA: ArenaNode, nodeB: ArenaNode): ArenaNode | undefined {
    if (nodeA === nodeB) {
      return nodeA;
    }
    const ancestorsForA = this.getAncestors(nodeA);
    const ancestorsForB = this.getAncestors(nodeB);
    const commonMaxDeep = Math.min(ancestorsForA.length, ancestorsForB.length);
    if (commonMaxDeep === 0) {
      return undefined;
    }
    let result;
    for (let i = 0; i < commonMaxDeep; i += 1) {
      if (ancestorsForA[i] === ancestorsForB[i]) {
        result = ancestorsForA[i];
      } else {
        break;
      }
    }
    return result;
  }

  public insertHtml(selection: ArenaSelection, html: string): ArenaSelection {
    let newSelection = selection;
    if (!selection.isCollapsed()) {
      newSelection = this.removeSelection(selection, 'backward');
    }
    const result = this.textarena.parser.insertHtmlToModel(
      html,
      newSelection.startNode,
      newSelection.startOffset,
    );
    if (result) {
      newSelection.setBoth(result[0] as ArenaNodeText, result[1]);
    }
    return newSelection;
  }

  public insertText(selection: ArenaSelection, text: string): ArenaSelection {
    let newSelection = selection;
    if (!selection.isCollapsed()) {
      newSelection = this.removeSelection(selection, 'backward');
    }
    const result = newSelection.startNode.insertText(text, newSelection.startOffset, true);
    if (result) {
      newSelection.startOffset += text.length;
      newSelection.endOffset = newSelection.startOffset;
    }
    return newSelection;
  }

  public removeSelection(selection: ArenaSelection, direction: Direction): ArenaSelection {
    const {
      startNode,
      startOffset,
      endNode,
      endOffset,
    } = selection;
    if (selection.isCollapsed()) {
      const newSelection = selection;
      if (direction === 'forward') {
        if (startNode.getTextLength() === startOffset) {
          const nextSibling = startNode.parent.getChild(startNode.getIndex() + 1);
          if (nextSibling && 'hasText' in nextSibling) {
            this.mergeNodes(startNode, nextSibling);
          }
        } else {
          startNode.removeText(startOffset, startOffset + 1);
        }
      }
      if (direction === 'backward') {
        if (startOffset === 0) {
          if (startNode.getIndex() > 0) {
            const prevSibling = startNode.parent.getChild(startNode.getIndex() - 1);
            if (prevSibling && 'hasText' in prevSibling) {
              newSelection.setBoth(prevSibling, prevSibling.getTextLength());
              this.mergeNodes(prevSibling, startNode);
            }
          }
        } else {
          startNode.removeText(startOffset - 1, startOffset);
          newSelection.setBoth(startNode, startOffset - 1);
        }
      }
      return newSelection;
    }
    if (selection.isSameNode()) {
      console.log('remove text', selection.startOffset, selection.endOffset);
      selection.startNode.removeText(selection.startOffset, selection.endOffset);
      selection.collapse();
      return selection;
    }
    const commonAncestor = this.getCommonAncestor(selection.startNode, selection.endNode);
    if (!commonAncestor) {
      return selection;
    }

    if (commonAncestor === selection.startNode.parent
      && commonAncestor === selection.endNode.parent
      && 'hasChildren' in commonAncestor) {
      const startIndex = selection.startNode.getIndex();
      const endIndex = selection.endNode.getIndex();
      selection.startNode.removeText(selection.startOffset);
      selection.endNode.removeText(0, selection.endOffset);
      selection.startNode.insertText(
        selection.endNode.getText(),
        selection.startOffset,
      );
      const removeLength = endIndex - startIndex;
      if (removeLength) {
        commonAncestor.removeChildren(startIndex + 1, removeLength);
      }
      const newSelection = selection;
      newSelection.collapseBackward();
      return newSelection;
    }
    selection.startNode.removeText(selection.startOffset);
    let startIndex = selection.startNode.getIndex();
    let startCursor:
      ArenaNodeAncestor
      | (ArenaNodeAncestor & ArenaNodeScion)
      | undefined = selection.startNode.parent;
    while (startCursor && startCursor !== commonAncestor) {
      startCursor.removeChildren(startIndex + 1);
      if ('hasParent' in startCursor) {
        startIndex = startCursor.getIndex();
        startCursor = startCursor.parent;
      } else {
        startCursor = undefined;
      }
    }

    selection.endNode.removeText(0, selection.endOffset);
    let endIndex = selection.endNode.getIndex();
    let endCursor:
      ArenaNodeAncestor
      | (ArenaNodeAncestor & ArenaNodeScion)
      | undefined = selection.endNode.parent;
    while (endCursor && endCursor !== commonAncestor) {
      endCursor.removeChildren(0, endIndex);
      if ('hasParent' in endCursor) {
        endIndex = endCursor.getIndex();
        endCursor = endCursor.parent;
      } else {
        endCursor = undefined;
      }
    }
    if (commonAncestor === startCursor
      && commonAncestor === endCursor
      && 'hasChildren' in commonAncestor) {
      const removeLength = endIndex - startIndex - 1;
      if (removeLength) {
        commonAncestor.removeChildren(startIndex + 1, removeLength);
      }
    }

    const newSelection = selection;
    newSelection.collapse();
    return newSelection;
  }

  breakSelection(selection: ArenaSelection): ArenaSelection {
    let newSelection = selection;
    if (!selection.isCollapsed()) {
      newSelection = this.removeSelection(selection, 'backward');
    }
    const { startNode } = selection;
    const text = startNode.cutText(selection.startOffset);
    const newNode = startNode.parent.createAndInsertNode(startNode.arena, startNode.getIndex() + 1);
    if (newNode && 'hasText' in newNode) {
      newNode.insertText(text, 0);
      newSelection.setBoth(newNode, 0);
    }
    return newSelection;
  }

  mergeNodes(nodeA: ArenaNodeText, nodeB: ArenaNodeText): void {
    nodeA.insertText(nodeB.getText(), nodeA.getTextLength());
    nodeB.remove();
  }

  transformModel(selection: ArenaSelection, arena: Arena): ArenaSelection {
    const {
      startNode,
      startOffset,
    } = selection;
    const newSelection = selection;
    if (selection.isCollapsed() || selection.isSameNode()) {
      const newNode = startNode.parent.createAndInsertNode(arena, startNode.getIndex());
      if (newNode) {
        const result = newNode.insertText(startNode.getText(), 0, false);
        const resultNode = result ? result[0] : newNode;
        const resultOffset = result ? result[1] : startOffset;
        startNode.remove();
        newSelection.setBoth(resultNode as ArenaNodeText, resultOffset);
        return newSelection;
      }
    }
    return selection;
  }

  formatingModel(selection: ArenaSelection, formating: ArenaFormating): ArenaSelection {
    const {
      startNode,
      startOffset,
      endNode,
      endOffset,
    } = selection;
    if (selection.isCollapsed() || selection.isSameNode()) {
      startNode.toggleFormating(formating.name, startOffset, endOffset);
    }
    return selection;
  }
}
