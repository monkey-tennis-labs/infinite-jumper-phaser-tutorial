import Phaser from "phaser";
import bg_layer1 from "/assets/bg_layer1.png";
import groundGrass from "../assets/ground_grass.png";
import bunnyStand from "../assets/bunny1_stand.png";
import carrot from "../assets/carrot.png";
import Carrot from "./Carrot";

class Game extends Phaser.Scene {
  /** @type {Phaser.Physics.Arcade.StaticGroup} */
  platforms;
  /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
  cursors;
  /** @type {Phaser.Physics.Arcade.Group} */
  carrots;
  carrotsCollected = 0;
  carrotCollectedText;

  preload() {
    this.load.image("background", bg_layer1);
    this.load.image("platform", groundGrass);
    this.load.image("bunny-stand", bunnyStand);
    this.load.image("carrot", carrot);
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {
    const style = { color: "#000", fontSize: 24 };
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

    this.cameras.main.setDeadzone(this.scale.width * 1.5);

    this.carrots = this.physics.add.group({ classType: Carrot });
    this.physics.add.collider(this.platforms, this.carrots);

    this.physics.add.overlap(
      this.player,
      this.carrots,
      this.handleCollectCarrot,
      undefined,
      this
    );
    this.carrotCollectedText = this.add
      .text(240, 10, "Carrots: 0", style)
      .setScrollFactor(0)
      .setOrigin(0.5, 0);
  }

  update() {
    const bottomMostPlatform = this.findBottomMostPlatform();
    if (this.player.y > bottomMostPlatform) {
      this.endGame();
    }

    this.platforms.children.iterate((child) => {
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = child;
      const scrollY = this.cameras.main.scrollY;

      if (platform.y >= scrollY + 700) {
        platform.y = scrollY - Phaser.Math.Between(50, 100);
        platform.body.updateFromGameObject();
        this.addCarrotAbove(platform);
      }
    });

    this.carrots.children.iterate((child) => {
      const carrot = child;
      const scrollY = this.cameras.main.scrollY;
      if (carrot.y > scrollY + 700) {
        this.carrots.killAndHide(carrot);
        this.physics.world.disableBody(carrot.body);
        console.log(carrot.name);
        console.log(this.carrots.getChildren().length);
      }
    });

    const touchingDown = this.player.body.touching.down;

    if (touchingDown) {
      this.player.setVelocityY(-300);
    }

    if (this.cursors.left.isDown && !touchingDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown && !touchingDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    this.horizontalWrap(this.player);
  }

  /**
   * @param {Phaser.GameObjects.Sprite} sprite
   */
  horizontalWrap(sprite) {
    const halfWidth = sprite.displayWidth * 0.5;
    const gameWidth = this.scale.width;
    if (sprite.x < -halfWidth) {
      sprite.x = gameWidth + halfWidth;
    } else if (sprite.x > gameWidth + halfWidth) {
      sprite.x = -halfWidth;
    }
  }

  /**
   * @param {Phaser.GameObjects.Sprite} sprite
   */
  addCarrotAbove(sprite) {
    const y = sprite.y - sprite.displayHeight;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    const carrot = this.carrots.get(sprite.x, y, "carrot");
    carrot.setActive(true);
    carrot.setVisible(true);
    this.add.existing(carrot);
    this.physics.world.enable(carrot);
    carrot.body.setSize(carrot.width, carrot.height);
    return carrot;
  }

  handleCollectCarrot(player, carrot) {
    this.carrots.killAndHide(carrot);
    this.physics.world.disableBody(carrot.body);
    this.carrotsCollected++;
    const value = `Carrots: ${this.carrotsCollected}`;
    this.carrotCollectedText.text = value;
  }

  findBottomMostPlatform() {
    let highestYValue = Number.MIN_VALUE;
    this.platforms.children.iterate((platform) => {
      if (platform.y > highestYValue) {
        highestYValue = platform.y;
      }
    });
    return highestYValue;
  }

  endGame() {
    this.cameras.main.stopFollow(this.player);
    const style = { color: "#000", fontSize: 24 };
    this.add
      .text(240, 320, "Game Over", style)
      .setScrollFactor(0)
      .setOrigin(0.5, 0);
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
