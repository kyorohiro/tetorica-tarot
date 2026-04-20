import { Assets, Sprite, Texture, Ticker } from "pixi.js";
import TitleSun from "../../assets/title_sun.png";

export class Sun extends Sprite {
    private fadeTick?: () => void;
    private animTick?: () => void;

    constructor() {
        super(Texture.EMPTY);
        this.visible = false;
        this.alpha = 0;
    }

    async load() {
        const texture = await Assets.load(TitleSun);

        this.texture = texture;
        this.visible = true;
        this.alpha = 0;

        this.startFadeIn();
    }

    private startFadeIn() {
        if (this.fadeTick) {
            Ticker.shared.remove(this.fadeTick);
        }

        this.x = 100;
        this.y = 100;
        this.scale.set(0.7);
        //this.scale.set(1.0);

        //this.anchor.set(0.48, 0.45);
        this.anchor.set(0.55, 0.45);
        this.fadeTick = () => {
            this.alpha += 0.05;
            if (this.alpha >= 1) {
                this.alpha = 1;
                if (this.fadeTick) {
                    Ticker.shared.remove(this.fadeTick);
                    this.fadeTick = undefined;
                }
            }
        };

        Ticker.shared.add(this.fadeTick);
    }

    public startAnimation() {
        if (this.animTick) {
            Ticker.shared.remove(this.animTick);
        }

        this.x = 100;
        this.y = 100;
        this.scale.set(0.2);
        //this.anchor.set(0.48, 0.45);
        this.anchor.set(0.55, 0.45);


        const _self = this;
        if (!self.parent) {
            return;
        }
        const pw = _self.parent!.width
        const rightLimit = pw * 0.75;// * (1 - this.anchor.x);
        this.animTick = () => {


            //console.log("x > rightLimit", this.x, rightLimit, pw);
            if (this.x < rightLimit) {
                this.x += 0.8;
            } else {
                if (this.animTick) {
                    Ticker.shared.remove(this.animTick);
                    this.animTick = undefined;
                }
            }

            this.rotation += 0.003;

        };

        Ticker.shared.add(this.animTick);
    }

    override destroy(options?: Parameters<Sprite["destroy"]>[0]) {
        if (this.fadeTick) {
            Ticker.shared.remove(this.fadeTick);
            this.fadeTick = undefined;
        }
        super.destroy(options);
    }
}
