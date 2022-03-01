const ELEMENT_LENGTH = 18;
const DEFAULT_IMPEDANCE = 1;
const LAYOUT_HEIGHT = 50;
const LAYOUT_WIDTH = 100;
const SCALE = 10;


class Element {
    constructor() {};

    _draw(path){
        let element = new Path2D(path);
        ctx.stroke(element);
    }
}


class Resistor extends Element {
    constructor(x, y, orientation) {
        super();
        this._draw(x, y, orientation)
    }

    _draw(x, y, orientation){

        //Constants for Resistor params

        const wireResLength = 4;
        const mainResW = 10;
        const mainResH = 4;

        let path;
        
        //SVG for drawing with orientation

        switch (orientation % 180){

            case 0:
                path = `M${x*SCALE} ${y*SCALE} 
                h ${wireResLength*SCALE} 
                v ${mainResH/2*SCALE} 
                h ${mainResW*SCALE} 
                v -${mainResH*SCALE} 
                h -${mainResW*SCALE} 
                v ${mainResH/2*SCALE} 
                M${(x+mainResW+wireResLength)*SCALE} ${y*SCALE} 
                h ${wireResLength*SCALE} `;
            break;

            case 90:
                path = `M${x*SCALE} ${y*SCALE} 
                v ${wireResLength*SCALE} 
                h ${mainResH/2*SCALE} 
                v ${mainResW*SCALE} 
                h -${mainResH*SCALE} 
                v -${mainResW*SCALE} 
                h ${mainResH/2*SCALE} 
                M${x*SCALE} ${(y+mainResW+wireResLength)*SCALE} 
                v ${wireResLength*SCALE}`;
            break;
        }

        super._draw(path);
    }
}


class Key extends Element {
    constructor(x, y, orientation) {
        super();
        this._draw(x, y, orientation);
    }

    _draw(x, y, orientation){

        //Constants for Key params

        const wireKeyLength = 6;
        const mainKeyLength = 6;

        let path;

        //SVG for drawing with params

        switch (orientation){

            case 0:
                path = `M${x * SCALE} ${y * SCALE}
                h ${wireKeyLength * SCALE}
                l ${0.8 * mainKeyLength * SCALE} -${0.5 * mainKeyLength * SCALE}
                m ${0.2 * mainKeyLength * SCALE} ${0.5 * mainKeyLength * SCALE}
                h ${wireKeyLength * SCALE}`;
            break;

            case 90:
                path = `M${x * SCALE} ${y * SCALE}
                v ${wireKeyLength * SCALE}
                l ${0.5 * mainKeyLength * SCALE} ${0.8 * mainKeyLength * SCALE}
                m -${0.5 * mainKeyLength * SCALE} ${0.2 * mainKeyLength * SCALE}
                v ${wireKeyLength * SCALE}`;
            break;

            case 180:
                path = `M${x * SCALE} ${y * SCALE}
                h ${wireKeyLength * SCALE}
                l ${0.8 * mainKeyLength * SCALE} ${0.5 * mainKeyLength * SCALE}
                m ${0.2 * mainKeyLength * SCALE} -${0.5 * mainKeyLength * SCALE}
                h ${wireKeyLength * SCALE}`;
            break;

            case 270:
                path = `M${x * SCALE} ${y * SCALE}
                v ${wireKeyLength * SCALE}
                l -${0.5 * mainKeyLength * SCALE} ${0.8 * mainKeyLength * SCALE}
                m ${0.5 * mainKeyLength * SCALE} ${0.2 * mainKeyLength * SCALE}
                v ${wireKeyLength * SCALE}`;
            break;
        }

        super._draw(path);
    }
}


class Lamp extends Element {
    constructor(x, y, orientation) {
        super();
        this._draw(x, y, orientation);
    }

    _draw(x, y, orientation){
        
        //Constants for Lamp params
        
        const wireLampLength = 5.6;
        const mainLampR = 3.4;

        let path;

        //SVG for drawing with params

        switch (orientation % 180){

            case 0:
                path = `M${x*SCALE} ${y*SCALE}
                h ${wireLampLength*SCALE} 
                a ${mainLampR*SCALE} ${mainLampR*SCALE} 0 1 1 ${mainLampR*SCALE*2} 0
                a ${mainLampR*SCALE} ${mainLampR*SCALE} 0 1 1 -${mainLampR*SCALE*2} 0
                m ${mainLampR*SCALE*2} 0
                h ${wireLampLength*SCALE}
                m -${(mainLampR+wireLampLength)*SCALE} 0
                l ${mainLampR*0.7*SCALE} ${mainLampR*0.7*SCALE}
                m -${mainLampR*1.4*SCALE} 0
                l ${mainLampR*1.4*SCALE} -${mainLampR*1.4*SCALE}
                m -${mainLampR*1.4*SCALE} 0
                l ${mainLampR*0.7*SCALE} ${mainLampR*0.7*SCALE}`;
            break;

            case 90:
                path = `M${x*SCALE} ${y*SCALE}
                v ${wireLampLength*SCALE} 
                a ${mainLampR*SCALE} ${mainLampR*SCALE} 0 1 1 0 ${mainLampR*SCALE*2}
                a ${mainLampR*SCALE} ${mainLampR*SCALE} 0 1 1 0 -${mainLampR*SCALE*2}
                m 0 ${mainLampR*SCALE*2}
                v ${wireLampLength*SCALE}
                m 0 -${(mainLampR+wireLampLength)*SCALE}
                l ${mainLampR*0.7*SCALE} ${mainLampR*0.7*SCALE}
                m -${mainLampR*1.4*SCALE} 0
                l ${mainLampR*1.4*SCALE} -${mainLampR*1.4*SCALE}
                m -${mainLampR*1.4*SCALE} 0
                l ${mainLampR*0.7*SCALE} ${mainLampR*0.7*SCALE}`;
        }

        super._draw(path);
    }
}


class Wire extends Element {
    constructor() {
        super();
    }
}

let canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d');