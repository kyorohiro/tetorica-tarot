import { Graphics } from "pixi.js";
import { TarotElement } from "../tarot/majorArcana";


function drawFire(g: Graphics) {
    g.circle(0, 0, 12).fill(0xff8888);
}

function drawWater(g: Graphics) {
    g.rect(-12, -12, 24, 24).fill(0x8888ff);
}

function drawAir(g: Graphics) {
    g.moveTo(0, -14);
    g.lineTo(14, 10);
    g.lineTo(-14, 10);
    g.closePath();
    g.fill(0xc9d8ff);
}

function drawEarth(g: Graphics) {
    g.moveTo(0, -14);
    g.lineTo(14, 0);
    g.lineTo(0, 14);
    g.lineTo(-14, 0);
    g.closePath();
    g.fill(0x66aa44);
}

function drawSpecial(g: Graphics) {
    g.star(0, 0, 5, 14).fill(0xFFD700);
}

function drawElementMark(params:{elementMark:Graphics, element: TarotElement}) {
    const g = params.elementMark;
    g.clear();

    switch (params.element) {
        case "fire":
            drawFire(g);
            break;
        case "water":
            drawWater(g);
            break;
        case "air":
            drawAir(g);
            break;
        case "earth":
            drawEarth(g);
            break;
        case "special":
            drawSpecial(g);
            break;
    }
}


export {
    drawElementMark
}