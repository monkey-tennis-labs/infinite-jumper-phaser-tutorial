import Phaser from "phaser";
import bg_layer1 from "/assets/bg_layer1.png";
import groundGrass from "../assets/ground_grass.png";
import bunnyStand from "../assets/bunny1_stand.png";

class Game extends Phaser.Scene {
  /** @type {Phaser.Physics.Arcade.StaticGroup} */
  platforms;

  preload() {
    this.load.image("background", bg_layer1);
    this.load.image("platform", groundGrass);
    this.load.image("bunny-stand", bunnyStand);
  }

  create() {
    this.add.image(240, 320, "background").setScrollFactor(1, 0);
    this.platforms = this.physics.add.staticGroup();
    for (let i = 0; i < 5; ++i) {
      const x = Phaser.Math.Between(80, 400);
      const y = 150 * i;

      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = this.platforms.create(x, y, "platform");
      platform.scale = 0.5;

      /** @type {Phaser.Physics.Arcade.StaticBody} */
      const body = platform.body;
      body.updateFromGameObject();
    }

    this.player = this.physics.add
      .sprite(240, 320, "bunny-stand")
      .setScale(0.5);

    this.player.body.checkCollision.up = false;
    this.player.body.checkCollision.left = false;
    this.player.body.checkCollision.right = false;

    this.physics.add.collider(this.platforms, this.player);

    this.cameras.main.startFollow(this.player);
  }

  update() {
    this.platforms.children.iterate((child) => {
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = child;
      const scrollY = this.cameras.main.scrollY;

      if (platform.y >= scrollY + 700) {
        platform.y = scrollY - Phaser.Math.Between(50, 100);
        platform.body.updateFromGameObject();
      }
    });
    const touchingDown = this.player.body.touching.down;

    if (touchingDown) {
      this.player.setVelocityY(-300);
    }
  }
}

export default new Phaser.Game({
  type: Phaser.AUTO,
  width: 480,
  height: 640,
  scene: Game,
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        y: 200,
      },
      debug: true,
    },
  },
});
