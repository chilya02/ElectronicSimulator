const ELEMENT_LENGTH = 18;
const DEFAULT_IMPEDANCE = 1;
const LAYOUT_HEIGHT = 50;
const LAYOUT_WIDTH = 100;
const SCALE = 10;


class Element {

    constructor(x, y, orientation) {

        this._orientation = orientation % 360;
        this._calcCoordinates(x, y);
        let path = this._getPath()
        this._draw(path);

    };

    _draw(path){
        let element = new Path2D(path);
        ctx.stroke(element);
    }

    /*rotate(angle){
        this._orientation += angle;
        this._calcCoordinates();
        let path = this._getPath();
        this._draw(path);
    }*/

    _calcCoordinates(x, y){

        switch (this._orientation){

            case 0:
                this.x1 = x;
                this.y1 = y;
                this.x2 = this.x1 + ELEMENT_LENGTH;
                this.y2 = this.y1;
            break;

            case 90:
                this.x1 = x;
                this.y1 = y;
                this.x2 = this.x1;
                this.y2 = this.y1 - ELEMENT_LENGTH;
            break;

            case 180:
                this.x1 = x;
                this.y1 = y;
                this.x2 = this.x1 - ELEMENT_LENGTH;
                this.y2 = this.y1;
            break;

            case 270:
                this.x1 = x;
                this.y1 = y;
                this.x2 = this.x1;
                this.y2 = this.y1 + ELEMENT_LENGTH;
            break;
        }

        console.log(`x1: ${this.x1}, y1: ${this.y1}, x2: ${this.x2}, y2: ${this.y2}`)
    }
}


class Resistor extends Element {

    constructor(x, y, orientation) {super(x, y, orientation)}

    _getPath(){
        
        //Constants for Resistor params

        const mainResW = 10;
        const mainResH = 4;
        const wireResLength = (ELEMENT_LENGTH - mainResW) / 2;

        let path;
        
        //SVG for drawing with orientation

        let x = this.x1;
        let y = this.y1;

        switch (this._orientation){

            case 0:
                path = `M${x*SCALE} ${y*SCALE} 
                h ${wireResLength*SCALE} 
                v ${mainResH/2*SCALE} 
                h ${mainResW*SCALE} 
                v -${mainResH*SCALE} 
                h -${mainResW*SCALE} 
                v ${mainResH/2*SCALE} 
                m ${mainResW*SCALE} 0
                h ${wireResLength*SCALE} `;
            break;

            case 90:
                path = `M${x*SCALE} ${y*SCALE} 
                v -${wireResLength*SCALE} 
                h ${mainResH/2*SCALE} 
                v -${mainResW*SCALE} 
                h -${mainResH*SCALE} 
                v ${mainResW*SCALE} 
                h ${mainResH/2*SCALE} 
                m 0 -${mainResW*SCALE} 
                v -${wireResLength*SCALE}`;
            break;

            case 180:
                path = `M ${x*SCALE} ${y*SCALE} 
                h -${wireResLength*SCALE} 
                v ${mainResH/2*SCALE} 
                h -${mainResW*SCALE} 
                v -${mainResH*SCALE} 
                h ${mainResW*SCALE} 
                v ${mainResH/2*SCALE} 
                m -${mainResW*SCALE} 0
                h -${wireResLength*SCALE} `;
            break;

            case 270:
                path = `M${x*SCALE} ${y*SCALE} 
                v ${wireResLength*SCALE} 
                h ${mainResH/2*SCALE} 
                v ${mainResW*SCALE} 
                h -${mainResH*SCALE} 
                v -${mainResW*SCALE} 
                h ${mainResH/2*SCALE} 
                m 0 ${mainResW*SCALE} 
                v ${wireResLength*SCALE}`;
            break;
        }

        return path;
    }
}


class Key extends Element {

    constructor(x, y, orientation) {super(x, y, orientation)}

    _getPath(){

        //Constants for Key params

        const mainKeyLength = 6;
        const wireKeyLength = (ELEMENT_LENGTH - mainKeyLength) / 2;

        let path;

        //SVG for drawing with params

        let x = this.x1;
        let y = this.y1;

        switch (this._orientation){

            case 0:
                path = `M${x * SCALE} ${y * SCALE}
                h ${wireKeyLength * SCALE}
                l ${0.8 * mainKeyLength * SCALE} -${0.5 * mainKeyLength * SCALE}
                m ${0.2 * mainKeyLength * SCALE} ${0.5 * mainKeyLength * SCALE}
                h ${wireKeyLength * SCALE}`;
            break;

            case 90:
                path = `M${x * SCALE} ${y * SCALE}
                v -${wireKeyLength * SCALE}
                l -${0.5 * mainKeyLength * SCALE} -${0.8 * mainKeyLength * SCALE}
                m ${0.5 * mainKeyLength * SCALE} -${0.2 * mainKeyLength * SCALE}
                v -${wireKeyLength * SCALE}`;
            break;

            case 180:
                path = `M${x * SCALE} ${y * SCALE}
                h -${wireKeyLength * SCALE}
                l -${0.8 * mainKeyLength * SCALE} ${0.5 * mainKeyLength * SCALE}
                m -${0.2 * mainKeyLength * SCALE} -${0.5 * mainKeyLength * SCALE}
                h -${wireKeyLength * SCALE}`;
            break;

            case 270:
                path = `M${x * SCALE} ${y * SCALE}
                v ${wireKeyLength * SCALE}
                l ${0.5 * mainKeyLength * SCALE} ${0.8 * mainKeyLength * SCALE}
                m -${0.5 * mainKeyLength * SCALE} ${0.2 * mainKeyLength * SCALE}
                v ${wireKeyLength * SCALE}`;
            break;
        }

        return path;
    }
}


class Lamp extends Element {

    constructor(x, y, orientation) {super(x, y, orientation)}

    _getPath(){
        
        //Constants for Lamp params
        
        const mainLampR = 3.4;
        const wireLampLength = ELEMENT_LENGTH / 2 - mainLampR;

        let path;

        //SVG for drawing with params

        let x = this.x1;
        let y = this.y1;

        switch (this._orientation){

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
                v -${wireLampLength*SCALE} 
                a ${mainLampR*SCALE} ${mainLampR*SCALE} 0 1 1 0 -${mainLampR*SCALE*2}
                a ${mainLampR*SCALE} ${mainLampR*SCALE} 0 1 1 0 ${mainLampR*SCALE*2}
                m 0 -${mainLampR*SCALE*2}
                v -${wireLampLength*SCALE}
                m 0 ${(mainLampR+wireLampLength)*SCALE}
                l ${mainLampR*0.7*SCALE} ${mainLampR*0.7*SCALE}
                m -${mainLampR*1.4*SCALE} 0
                l ${mainLampR*1.4*SCALE} -${mainLampR*1.4*SCALE}
                m -${mainLampR*1.4*SCALE} 0
                l ${mainLampR*0.7*SCALE} ${mainLampR*0.7*SCALE}`;
            break;

            case 180:
                path = `M${x*SCALE} ${y*SCALE}
                h -${wireLampLength*SCALE} 
                a ${mainLampR*SCALE} ${mainLampR*SCALE} 0 1 1 -${mainLampR*SCALE*2} 0
                a ${mainLampR*SCALE} ${mainLampR*SCALE} 0 1 1 ${mainLampR*SCALE*2} 0
                m -${mainLampR*SCALE*2} 0
                h -${wireLampLength*SCALE}
                m ${(mainLampR+wireLampLength)*SCALE} 0
                l ${mainLampR*0.7*SCALE} ${mainLampR*0.7*SCALE}
                m -${mainLampR*1.4*SCALE} 0
                l ${mainLampR*1.4*SCALE} -${mainLampR*1.4*SCALE}
                m -${mainLampR*1.4*SCALE} 0
                l ${mainLampR*0.7*SCALE} ${mainLampR*0.7*SCALE}`;
            break;

            case 270:
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
            break;
        }

        return path;
    }
}


class Wire extends Element {

    constructor() {
        super();
    }
}

let canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d');

ctx.fillStyle = "#000000";
ctx.fillRect(0,0,window.innerWidth,window.innerHeight);

ctx.lineWidth = 4;
ctx.strokeStyle = '#808080';

let elements = [];