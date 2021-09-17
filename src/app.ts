import { Engine, Vector3, Scene } from "babylonjs";
import { Lights } from "./light";
import { Map } from "./map";
import { Player, PlayerInput } from "./player";
import { Sky } from "./sky";
import { Targets } from "./targets";
import { Weapon } from "./weapon";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);

const scene = new Scene(engine);
scene.gravity = new Vector3(0, -9.81, 0);
scene.collisionsEnabled = true;

const lights = new Lights(scene);
const sky = new Sky(scene);
const map = new Map(scene);
const targetsClass = new Targets(scene, map);
const player = new Player(scene);
const playerInput = new PlayerInput(player, canvas, targetsClass);

// Register a render loop to repeatedly render the scene
engine.runRenderLoop(() => {
    const fps = Math.round(1000/engine.getDeltaTime());
    playerInput.checkMove(fps/60);
    // console.log(player.playerBox.position)
    // console.log(player.camera.position)
    scene.render();
});

// Watch for browser/canvas resize events
window.addEventListener("resize", () => {
    engine.resize();
});