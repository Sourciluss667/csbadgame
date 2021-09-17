import { Color3, CubeTexture, Mesh, MeshBuilder, Scene, StandardMaterial, Texture } from "babylonjs";

export class Sky {
    private scene: Scene;
    private skyBox: Mesh;

    constructor(scene: Scene) {
        this.scene = scene;
        this._init();
    }

    private _init () {
        // Create sky
        this.skyBox = MeshBuilder.CreateBox('skyBox', { size: 1000.0 }, this.scene);
        var skyboxMaterial = new StandardMaterial('skyBox', this.scene);
        skyboxMaterial.backFaceCulling = false;
        skyboxMaterial.reflectionTexture = new CubeTexture('assets/textures/sky/skybox', this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);
        this.skyBox.material = skyboxMaterial;
    }
}