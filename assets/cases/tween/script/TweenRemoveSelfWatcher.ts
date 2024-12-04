import { _decorator, Component, Node } from 'cc';
import { TweenRemoveSelf } from './TweenRemoveSelf';
const { ccclass, property } = _decorator;

@ccclass('TweenRemoveSelfWatcher')
export class TweenRemoveSelfWatcher extends Component {

    @property(Node)
    target: Node = null!;

    protected onDestroy(): void {
        this.target.destroy();
    }
}

