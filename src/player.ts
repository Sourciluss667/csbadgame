import { FreeCamera, MeshBuilder, Ray, Scene, Vector3 } from "babylonjs";
import { Mesh } from "babylonjs/Meshes/mesh";
import { Targets } from "./targets";
import { Weapon } from "./weapon";

export class Player {
    public scene: Scene;
    public camera: FreeCamera;
    public playerBox: Mesh;
    public hitboxPlayer: Mesh;
    public weapon: Weapon;

    constructor(scene: Scene) {
        this.scene = scene;
        this._init();
    }

    private _init () {
        // Create character
        this.playerBox = MeshBuilder.CreateBox('playerBox', {height: 5, width: 2, depth: 2});
        this.playerBox.position = new Vector3(5, 5.05, 7);
        this.playerBox.ellipsoid = new Vector3(2, 5, 2);
        this.playerBox.checkCollisions = true;

        this.hitboxPlayer = MeshBuilder.CreateBox('hitboxPlayer', {height: 5, width: 2, depth: 2});
        this.hitboxPlayer.parent = this.playerBox;
        this.hitboxPlayer.isPickable = true;

        // Create camera and attach control
        this.camera = new FreeCamera('playerCamera', Vector3.Zero(), this.scene);
        this.camera.parent = this.playerBox;
        
        //this.camera.setTarget(Vector3.Zero());
        //this.camera.attachControl(this.canvas, true);
        this.weapon = new Weapon(this.scene, this);
    }
}

export class PlayerInput {
    private player: Player;
    private speed = 0.6;
    private angularSensibility = 250;
    private controlEnabled = false;
    private rotEngaged: boolean;
    private canJump: boolean = true;
    private canFire: boolean = false;
    private weaponShoot: boolean = false;
    private weaponShootTimer: boolean = false;
    private targets: Targets;
    private jumpHeight = 6;
    private jumpNeed = {
        status: false,
        y: undefined,
        inAir: false
    };
    private keys = [
        {
            key: 'z',
            action: 'forward',
            pressed: false
        },
        {
            key: 's',
            action: 'backward',
            pressed: false
        },
        {
            key: 'q',
            action: 'left',
            pressed: false
        },
        {
            key: 'd',
            action: 'right',
            pressed: false
        },
        {
            key: ' ',
            action: 'jump',
            pressed: false
        }
    ];

    constructor(player: Player, canvas: HTMLCanvasElement, targets: Targets) {
        this.player = player;
        this.targets = targets;
        this._init(canvas);
    }

    _init(canvas: HTMLCanvasElement) {
        const _this = this;

        // Event for movement
        window.addEventListener('keyup', (event) => {
            let i = 0;
            for (i = 0; i < this.keys.length; i++) {
                if (event.key === this.keys[i].key) {
                    this.keys[i].pressed = false;
                    break;
                }
            }
        });

        window.addEventListener('keydown', (event) => {
            let i = 0;
            for (i = 0; i < this.keys.length; i++) {
                if (event.key === this.keys[i].key) {
                    this.keys[i].pressed = true;
                    break;
                }
            }
        });

        // Event for mouse control
        window.addEventListener("mousemove", function(event) {
            if (_this.rotEngaged === true) {
                // Camera rotation
                //_this.player.camera.rotation.y += event.movementX * 0.001 * (_this.angularSensibility / 250);
                // Player rotation
                _this.player.playerBox.rotation.y += event.movementX * 0.001 * (_this.angularSensibility / 250);
                const nextRotationX = _this.player.playerBox.rotation.x + (event.movementY * 0.001 * (_this.angularSensibility / 250));
                if (nextRotationX < (Math.PI*90)/180 && nextRotationX > (Math.PI*-90)/180) {
                    // Camera rotation
                    //_this.player.camera.rotation.x += event.movementY * 0.001 * (_this.angularSensibility / 250);
                    // Player rotation
                    _this.player.playerBox.rotation.x += event.movementY * 0.001 * (_this.angularSensibility / 250);
                }
            }
        }, false);

        // For mouse lock
        canvas.addEventListener("click", function(evt) {
            canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
            if (canvas.requestPointerLock) {
                canvas.requestPointerLock();
            }
        }, false);

        // Mouse shoot
        canvas.addEventListener('mousedown', function (event) {
            if (_this.canFire) {
                _this.weaponShoot = true;
            }
        });

        canvas.addEventListener('mouseup', function (event) {
            if (_this.canFire) {
                _this.weaponShoot = false;
            }
        });
    
        // Evenement pour changer le paramètre de rotation
        var pointerlockchange = function (event) {
            _this.controlEnabled = ((document as any).mozPointerLockElement === canvas || (document as any).webkitPointerLockElement === canvas || (document as any).msPointerLockElement === canvas || document.pointerLockElement === canvas);
            if (!_this.controlEnabled) {
                _this.rotEngaged = false;
                _this.canFire = false;
            } else {
                _this.rotEngaged = true;
                _this.canFire = true;
            }
        };
        
        // Event pour changer l'état du pointeur, sous tout les types de navigateur
        document.addEventListener("pointerlockchange", pointerlockchange, false);
        document.addEventListener("mspointerlockchange", pointerlockchange, false);
        document.addEventListener("mozpointerlockchange", pointerlockchange, false);
        document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
    }

    checkFire () {
        if (this.weaponShoot && !(this.weaponShootTimer)) {
            this.player.weapon.fire(this.player.playerBox);
            this.weaponShootTimer = true;
            setTimeout(() => {
                this.weaponShootTimer = false;
            }, 200);
        }

        let i = 0;
        let len = this.player.weapon.bullets.length;
        for (i; i < len; i++) {
            const bullet = this.player.weapon.bullets[i];
            if (bullet === undefined) {
                continue;
            }
            bullet.translate(new Vector3(0, 0, 1), 3);
            const rayBullet = new Ray(bullet.position, (bullet as any).direction);
    
            const meshFound = bullet.getScene().pickWithRay(rayBullet);
            
            if(!meshFound || meshFound.distance < 5){
                if (meshFound.pickedMesh.name.match(/target-\d*/g)) {
                    meshFound.pickedMesh.dispose();
                    this.targets.targets.splice(parseInt(meshFound.pickedMesh.name.split('-')[1])); // Remove target
                }

                bullet.dispose();
                this.player.weapon.bullets.splice(i, 1);
            }
        }
    }

    checkMove (fpsRatio) {
        let relativeSpeed = this.speed / fpsRatio;

        let i = 0;
        for (i = 0; i < this.keys.length; i++) {
            if (this.keys[i].pressed) {
                switch (this.keys[i].action) {
                    case 'forward':
                        const forward = new Vector3(
                            Math.sin(this.player.playerBox.rotation.y) * relativeSpeed, 
                            0, 
                            Math.cos(this.player.playerBox.rotation.y) * relativeSpeed
                        );
                        this.player.playerBox.moveWithCollisions(forward);
                    break;
                    case 'backward':
                        const backward = new Vector3(
                            -Math.sin(this.player.playerBox.rotation.y) * relativeSpeed, 
                            0, 
                            -Math.cos(this.player.playerBox.rotation.y) * relativeSpeed
                        );
                        this.player.playerBox.moveWithCollisions(backward);
                    break;
                    case 'left':
                        const left = new Vector3(
                            Math.sin(this.player.playerBox.rotation.y + Math.PI*-90/180) * relativeSpeed, 
                            0, 
                            Math.cos(this.player.playerBox.rotation.y + Math.PI*-90/180) * relativeSpeed
                        );
                        this.player.playerBox.moveWithCollisions(left);
                    break;
                    case 'right':
                        const right = new Vector3(
                            -Math.sin(this.player.playerBox.rotation.y + Math.PI*-90/180) * relativeSpeed, 
                            0, 
                            -Math.cos(this.player.playerBox.rotation.y + Math.PI*-90/180) * relativeSpeed
                        );
                        this.player.playerBox.moveWithCollisions(right);
                    break;
                    case 'jump':
                        if (this.canJump) {
                            this.canJump = false;
                            this.jumpNeed.status = true;
                            this.jumpNeed.y = this.player.playerBox.position.y + this.jumpHeight;
                        }
                    break;
                }
            }
        }

        // Gravity
        if (!(this.jumpNeed.status)) {
            this.player.playerBox.moveWithCollisions(new Vector3(0, -1 * relativeSpeed, 0));
        }

        // Check if need jump
        if (this.jumpNeed.status) {
            // Jump
            // Lerp (pour adoucir le saut)
            const percentMove = this.jumpNeed.y - this.player.playerBox.position.y;
            // Mouvement
            const up = new Vector3(0, percentMove/4 *  relativeSpeed, 0);
            this.player.playerBox.moveWithCollisions(up);

            // On vérifie si le joueur a environ atteint la hauteur désirée
            if(this.player.playerBox.position.y + 1 > this.jumpNeed.y){
                // Si c'est le cas, on prépare inAir
                this.jumpNeed.inAir = true;
                this.jumpNeed.status = false;
            }
        }

        // Check if on the ground
        // if (this.player.playerBox.position.y <= this.jumpNeed.y - this.jumpHeight) {
        if (this.player.playerBox.position.y <= 5.06) {
            this.canJump = true;
            this.jumpNeed.status = false;
            this.jumpNeed.inAir = false;
        }

        this.checkFire();
    }
}
