import { HemisphericLight, Scene, Vector3 } from "babylonjs";

export class Lights {
    private scene: Scene;
    private sunLight: HemisphericLight;

    constructor(scene: Scene) {
        this.scene = scene;
        this._init();
    }

    private _init () {
        // Create light
        this.sunLight = new HemisphericLight("light", new Vector3(10, 20, 0), this.scene);
    }
}