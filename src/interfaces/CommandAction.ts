import ArenaSelection from '../helpers/ArenaSelection';
import Textarena from '../Textarena';

type CommandAction = (textarena: Textarena, selection: ArenaSelection) => ArenaSelection;

export default CommandAction;
