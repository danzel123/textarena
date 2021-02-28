import ArenaNodeCore from './ArenaNodeCore';
import ArenaNodeScion from './ArenaNodeScion';

export default interface ArenaNodeAncestor extends ArenaNodeCore {
  hasChildren: true;

  children: ArenaNodeScion[];

  removeChild(index: number): void;

  removeChildren(start: number, length?: number): void;
}
