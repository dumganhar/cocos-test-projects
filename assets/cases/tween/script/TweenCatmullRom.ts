import { _decorator, Component, Node, tween, tweenProgress, v3, color, CameraComponent, Canvas, geometry, Vec3, Button, Label, Tween, EventTouch } from 'cc';
const { ccclass, property } = _decorator;


const originalKnots: ReadonlyArray<Vec3> = [
    // v3(-360, -180, 0), // start
    v3(-180*1.5, 80, 0),
    v3(-100, -180+100, 0),
    v3(0, 0, 0),
    // v3(0, 0, 0),
    v3(100, -180+100, 0),
    v3(180*1.5, 80, 0),
    v3(360, -180, 0),
];

@ccclass('TweenCatmullRom')
export class TweenCatmullRom extends Component {

    @property(CameraComponent)
    private mainCamera!: CameraComponent;

    @property(Canvas)
    private canvas!: Canvas;

    @property(Node)
    private greenBlock!: Node;

    @property(Node)
    private blueBlock!: Node;

    private _spline: geometry.Spline | null = null;
    private _isPaused = false;
    private _isStopped = false;

    private _tweenGreen: Tween | null = null;
    private _tweenBlue: Tween | null = null;
    private _originalPosition: Vec3 = v3();

    start() {
        const pos = this.greenBlock.getPosition().clone();
        this._originalPosition = pos;
        const offsetKnots = originalKnots.map((v: Vec3) => v.clone().subtract(pos));
        const renderKnots = originalKnots.slice();
        renderKnots.splice(0, 0, pos);
        this._spline = geometry.Spline.create(geometry.SplineMode.CATMULL_ROM, renderKnots);

        this._tweenGreen = tween(this.greenBlock)
            .by(2, { position: tweenProgress.catmullRom(...offsetKnots) }).id(1)
            .call(()=>{
                console.log(`==> right finish`);
            })
            .reverse(1)
            .call(()=>{
                console.log(`==> reverse finish`);
            })
            .union()
            .repeatForever()
            .timeScale(0.5)
            .start();

        this.mainCamera.camera.initGeometryRenderer();      

        const reverseKnots = originalKnots.slice();
        reverseKnots.reverse();
        reverseKnots.push(pos);
        reverseKnots.splice(0, 1);

        this._tweenBlue = tween(this.blueBlock)
            .to(2, { position: tweenProgress.catmullRom(...originalKnots)})
            .call(()=>{
                console.log(`==> right2 finish`);
            })
            .to(2, { position: tweenProgress.catmullRom(...reverseKnots)})
            .call(()=>{
                console.log(`==> reverse2 finish`);
            })
            .union()
            .repeatForever()
            .timeScale(0.5)
            .start();
    }

    update(deltaTime: number) {
        let renderer = this.mainCamera?.camera.geometryRenderer;
        if (!renderer) {
            return;
        }

        renderer.addSpline(this._spline!, color(255, 0, 0, 255), 0xffffffff, 20, 100, false, true, this.canvas.node.worldMatrix);
    }

    onTweenControlButtonClick(event: EventTouch) {
        this._isPaused = !this._isPaused;
        if (this._tweenGreen && this._tweenBlue) {
            if (this._isPaused) {
                this._tweenGreen.pause();
                this._tweenBlue.pause();
            } else {
                this._tweenGreen.resume();
                this._tweenBlue.resume();
            }
        }

        event.target.getChildByName('Label').getComponent(Label)!.string = this._isPaused ? '恢复' : '暂停';
    }

    onTweenControlButtonClick_StartOrStop(event: EventTouch) {
        this._isStopped = !this._isStopped;
        if (this._tweenGreen && this._tweenBlue) {
            if (this._isStopped) {
                this._tweenGreen.stop();
                this._tweenBlue.stop();
                this.greenBlock.setPosition(this._originalPosition);
                this.blueBlock.setPosition(this._originalPosition);
            } else {
                this._tweenGreen.start();
                this._tweenBlue.start();
            }
        }

        event.target.getChildByName('Label').getComponent(Label)!.string = this._isStopped ? '开始' : '停止';
    }
}

