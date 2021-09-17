import { Color3, HemisphericLight, Mesh, Scene, StandardMaterial, Vector3 } from "babylonjs";
import { Map } from "./map";

export class Targets {
    private scene: Scene;
    private map: Map;
    public spawnTimerMs = 3000;
    public targets: Array<Mesh> = [];

    constructor(scene: Scene, map: Map) {
        this.scene = scene;
        this.map = map;
        this.targets = [];
        this._init();
    }

    private _init () {
        // Create random targets
        setInterval(() => {
            const target = Mesh.CreateBox('target-' + this.targets.length, 1, this.scene);
            target.scaling = new Vector3(2, 8, 2);
            target.position = new Vector3(Math.random() * 200 / 2, 4, Math.random() * 200 / 2);
            // Add random color
            var mat = new StandardMaterial("targetMat", this.scene);
            switch (this.getRandomIntInclusive(1, 3)) {
                case 1:
                    mat.diffuseColor = new Color3(255, 0, 0);
                break;
                case 2:
                    mat.diffuseColor = new Color3(0, 255, 0);
                break;
                case 3:
                    mat.diffuseColor = new Color3(0, 0, 255);
                break;
            }
            target.material = mat;
            this.targets.push(target);
        }, this.spawnTimerMs);
    }

    private getRandomIntInclusive(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min +1)) + min;
    }
}