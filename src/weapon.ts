import { Scene, Mesh, Vector3, SceneLoader, ISceneLoaderPlugin, ISceneLoaderPluginAsync, AbstractMesh, DynamicTexture, StandardMaterial, MeshBuilder, Color3 } from "babylonjs";
import { Player } from "./player";

export class Weapon {
    private scene: Scene;
    private player: Player;
    private weaponMeshs: Array<AbstractMesh> = [];
    private crosshair: any;
    public bullets: Array<Mesh> = [];

    constructor(scene: Scene, player: Player) {
        this.scene = scene;
        this.player = player;
        this._init();
    }

    private _init () {
        // Create weapon
        SceneLoader.AppendAsync("../assets/models/ak-47-kalashnikov-babylon/", "ak-47-kalashnikov.babylon", this.scene)
        .then((s) => {
            // Main, Hand_Grip, Magazine, Stock, Pistol_Grip, LightPreset
            this.weaponMeshs.push(s.getMeshByName("Main"));
            this.weaponMeshs.push(s.getMeshByName("Hand_Grip"));
            this.weaponMeshs.push(s.getMeshByName("Magazine"));
            this.weaponMeshs.push(s.getMeshByName("Stock"));
            this.weaponMeshs.push(s.getMeshByName("Pistol_Grip"));
            this.weaponMeshs.push(s.getMeshByName("LightPreset"));
            this.weaponMeshs.forEach(m => {
                m.scaling = new Vector3(0.1, 0.1, 0.1);
                m.parent = this.player.camera;
                m.position = new Vector3(-2, -1, 3.3);
                //m.position = new Vector3(0, -0.5, 3.3);
                m.rotation = new Vector3(0, 0.2, 0);
            });
        });
        //this.crosshair = addCrosshair(this.scene, this.player.camera);
    }

    public fire (playerPosition) {
        // Set position
        // Set where the bullet go (check how walking work to walk forward)
        const positionValue = this.weaponMeshs[0].absolutePosition.clone();
        const rotationValue = playerPosition.rotation; 
        const newBullet = Mesh.CreateBox("bullet", 1, this.scene);
        (newBullet as any).direction = new Vector3(
            Math.sin(rotationValue.y) * Math.cos(rotationValue.x),
            Math.sin(-rotationValue.x),
            Math.cos(rotationValue.y) * Math.cos(rotationValue.x)
        )
        newBullet.position = new Vector3(
            positionValue.x + ((newBullet as any).direction.x * 1) , 
            positionValue.y + ((newBullet as any).direction.y * 1) ,
            positionValue.z + ((newBullet as any).direction.z * 1));
        newBullet.rotation = new Vector3(rotationValue.x,rotationValue.y,rotationValue.z);
        newBullet.scaling = new Vector3(0.3,0.3,0.6);
        newBullet.isPickable = false;

        //newBullet.material = new StandardMaterial("textureWeapon", this.scene);
        //newBullet.material.diffuseColor = new Color3(1, 0, 0);
        this.bullets.push(newBullet);
    }
}

function addCrosshair(scene, camera){
    let w = 128

    let texture = new DynamicTexture('reticule', w, scene, false)
    texture.hasAlpha = true

    let ctx = texture.getContext()
    let reticule

    const createOutline = () => {
    let c = 2

    ctx.moveTo(c, w * 0.25)
    ctx.lineTo(c, c)
    ctx.lineTo(w * 0.25, c)

    ctx.moveTo(w * 0.75, c)
    ctx.lineTo(w - c, c)
    ctx.lineTo(w - c, w * 0.25)

    ctx.moveTo(w - c, w * 0.75)
    ctx.lineTo(w - c, w - c)
    ctx.lineTo(w * 0.75, w - c)

    ctx.moveTo(w * 0.25, w - c)
    ctx.lineTo(c, w - c)
    ctx.lineTo(c, w * 0.75)

    ctx.lineWidth = 1.5
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'
    ctx.stroke()
    }

    const createNavigate = () => {
    ctx.fillStyle = 'transparent'
    ctx.clearRect(0, 0, w, w)
    createOutline()

    ctx.strokeStyle = 'rgba(255, 0, 0, 0.9)'
    ctx.lineWidth = 3.5
    ctx.moveTo(w * 0.5, w * 0.25)
    ctx.lineTo(w * 0.5, w * 0.75)

    ctx.moveTo(w * 0.25, w * 0.5)
    ctx.lineTo(w * 0.75, w * 0.5)
    ctx.stroke()
    ctx.beginPath()

    texture.update()
    }

    createNavigate()

    let material = new StandardMaterial('reticule', scene)
    material.diffuseTexture = texture
    material.opacityTexture = texture
    material.emissiveColor.set(1, 1, 1)
    material.disableLighting = true

    let plane = MeshBuilder.CreatePlane('reticule', { size: 0.04 }, scene)
    plane.material = material
    plane.position.set(0, 0, 1.1)
    plane.isPickable = false
    plane.rotation.z = Math.PI / 4

    reticule = plane
    reticule.parent = camera
    return reticule
}
