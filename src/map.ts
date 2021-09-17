import { Mesh, MeshBuilder, Scene, StandardMaterial, Texture } from "babylonjs";

export class Map {
    private scene: Scene;
    public ground: Mesh;
    private walls: Mesh[];

    constructor(scene: Scene) {
        this.scene = scene;
        this.walls = [];
        this._init();
    }

    private _init () {
        // Define materials
        const groundMaterial = new StandardMaterial('groundMaterial', this.scene);
        groundMaterial.diffuseTexture = new Texture('assets/img/ground/ground_ground_leaves_0039_01.jpg', this.scene);
        (groundMaterial.diffuseTexture as any).uScale = 4.0;
        (groundMaterial.diffuseTexture as any).vScale = 4.0;
        const wallMaterial = new StandardMaterial('wallMaterial', this.scene);
        wallMaterial.diffuseTexture = new Texture('assets/img/fences/fence_brick_fence_0017_01.jpg', this.scene);
        (wallMaterial.diffuseTexture as any).uScale = 16.0;
        //(wallMaterial.diffuseTexture as any).vScale = 8.0;

        // Create ground
        this.ground = Mesh.CreateGround('ground', 200, 200, 1, this.scene);
        this.ground.material = groundMaterial;
        this.ground.checkCollisions = true;

        // Create wall
        this.walls.push(MeshBuilder.CreateBox('wall1', {height: 10, width: 200, depth: 1}));
        this.walls[0].position.y = 5;
        this.walls[0].position.z = 100;
        this.walls[0].material = wallMaterial;
        this.walls[0].checkCollisions = true;

        this.walls.push(this.walls[0].clone('wall2'));
        this.walls[1].position.z = -100;
        this.walls[1].rotation.z = (Math.PI*180)/180;
        this.walls.push(this.walls[0].clone('wall3'));
        this.walls[2].position.x = 100;
        this.walls[2].position.z = 0;        
        this.walls[2].rotation.y = (Math.PI*90)/180;
        this.walls.push(this.walls[0].clone('wall4'));
        this.walls[3].position.x = -100;
        this.walls[3].position.z = 0;
        this.walls[3].rotation.y = (Math.PI*90)/180;
        this.walls[3].rotation.z = (Math.PI*180)/180;

    }
}