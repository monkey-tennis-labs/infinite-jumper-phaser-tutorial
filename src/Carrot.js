import Phaser from "phaser";
import { v4 as uuid } from "uuid";

export default class Carrot extends Phaser.Physics.Arcade.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {string} texture
   */
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);
    this.setScale(0.5);
    this.setName(uuid());
  }
}
