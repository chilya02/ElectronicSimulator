const ELEMENT_LENGTH = 20;
const DEFAULT_IMPEDANCE = 1;
const LAYOUT_HEIGHT = 50;
const LAYOUT_WIDTH = 100;
const SCALE = 8;

//colors:
const MAIN_COLOR = '#808080'
const SELECTED_COLOR = '#cccccc'

//Constants for Resistor params

const mainResW = 10;
const mainResH = 4;
const wireResLength = (ELEMENT_LENGTH - mainResW) / 2;

//Constants for Key params

const mainKeyLength = 6;
const wireKeyLength = (ELEMENT_LENGTH - mainKeyLength) / 2;

//Constants for Lamp params

const mainLampR = 3.4;
const wireLampLength = ELEMENT_LENGTH / 2 - mainLampR;



class Element {

    constructor(x, y, orientation) {

        this._orientation = orientation % 360;
        this.selected = false;
        this._calcCoordinates(x, y);
        this._calcPath();
        this.draw();

    };

    set selected(value){
        this._selected = value;
        if (this._selected){
            ctx.strokeStyle = SELECTED_COLOR;
            this.draw();
            ctx.strokeStyle = MAIN_COLOR;
        } else{
            this.draw();
        }
    }

    get selected(){
        return this._selected
    }

    isInArea(x, y){
        
        switch(this._orientation){
            case 0:
                return x > this.x1 & x < this.x2 & y == this.y1 & y == this.y2;

            case 90:
                return y < this.y1 & y > this.y2 & x == this.x1 & x == this.x2;
            
            case 180:
                return x < this.x1 & x > this.x2 & y == this.y1 & y == this.y2;

            case 270:
                return y > this.y1 & y < this.y2 & x == this.x1 & x == this.x2;
            
        }
        
    }

    draw(){
        let element = new Path2D(this._path);
        ctx.stroke(element);
        console.log('DRAW')
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
                this.x2 = x + ELEMENT_LENGTH;
                this.y2 = y;
                this.centerX = x + ELEMENT_LENGTH / 2;
                this.centerY = y;
            break;

            case 90:
                this.x1 = x;
                this.y1 = y;
                this.x2 = x;
                this.y2 = y - ELEMENT_LENGTH;
                this.centerX = x;
                this.centerY = y - ELEMENT_LENGTH / 2;
            break;

            case 180:
                this.x1 = x;
                this.y1 = y;
                this.x2 = x - ELEMENT_LENGTH;
                this.y2 = y;
                this.centerX = x - ELEMENT_LENGTH / 2;
                this.centerY = y;
            break;

            case 270:
                this.x1 = x;
                this.y1 = y;
                this.x2 = x;
                this.y2 = y + ELEMENT_LENGTH;
                this.centerX = x;
                this.centerY = y + ELEMENT_LENGTH / 2;
            break;
        }

        console.log(`x1: ${this.x1}, y1: ${this.y1}, x2: ${this.x2}, y2: ${this.y2}`)
    }

}


class Resistor extends Element {

    constructor(x, y, orientation) {super(x, y, orientation)}

    _calcPath(){
        
        //SVG for drawing with orientation

        let x = this.x1;
        let y = this.y1;

        switch (this._orientation){

            case 0:
                this._path = `M ${x*SCALE} ${y*SCALE} 
                h ${wireResLength*SCALE} 
                v ${mainResH/2*SCALE} 
                h ${mainResW*SCALE} 
                v -${mainResH*SCALE} 
                h -${mainResW*SCALE} 
                v ${mainResH/2*SCALE} 
                m ${mainResW*SCALE} 0
                h ${wireResLength*SCALE}`;
            break;

            case 90:
                this._path = `M ${x*SCALE} ${y*SCALE} 
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
                this._path = `M ${x*SCALE} ${y*SCALE} 
                h -${wireResLength*SCALE} 
                v ${mainResH/2*SCALE} 
                h -${mainResW*SCALE} 
                v -${mainResH*SCALE} 
                h ${mainResW*SCALE} 
                v ${mainResH/2*SCALE} 
                m -${mainResW*SCALE} 0
                h -${wireResLength*SCALE}`;
            break;

            case 270:
                this._path = `M ${x*SCALE} ${y*SCALE} 
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
    }

    isInArea(x, y){

        let inBody;

        switch (this._orientation % 180){

            case 0:
                inBody = Math.abs(x - this.centerX) <= (mainResW / 2);
                inBody = inBody & Math.abs(y - this.centerY) <= (mainResH / 2);
            break;

            case 90:
                inBody = Math.abs(x - this.centerX) <= (mainResH / 2);
                inBody = inBody & Math.abs(y - this.centerY) <= (mainResW / 2);
            break;
        }

        return super.isInArea(x, y) | inBody;
    }
}


class Key extends Element {

    constructor(x, y, orientation) {super(x, y, orientation)}

    _calcPath(){

        //SVG for drawing with params

        let x = this.x1;
        let y = this.y1;

        switch (this._orientation){

            case 0:
                this._path = `M${x * SCALE} ${y * SCALE}
                h ${wireKeyLength * SCALE}
                l ${0.8 * mainKeyLength * SCALE} -${0.5 * mainKeyLength * SCALE}
                m ${0.2 * mainKeyLength * SCALE} ${0.5 * mainKeyLength * SCALE}
                h ${wireKeyLength * SCALE}`;
            break;

            case 90:
                this._path = `M${x * SCALE} ${y * SCALE}
                v -${wireKeyLength * SCALE}
                l -${0.5 * mainKeyLength * SCALE} -${0.8 * mainKeyLength * SCALE}
                m ${0.5 * mainKeyLength * SCALE} -${0.2 * mainKeyLength * SCALE}
                v -${wireKeyLength * SCALE}`;
            break;

            case 180:
                this._path = `M${x * SCALE} ${y * SCALE}
                h -${wireKeyLength * SCALE}
                l -${0.8 * mainKeyLength * SCALE} ${0.5 * mainKeyLength * SCALE}
                m -${0.2 * mainKeyLength * SCALE} -${0.5 * mainKeyLength * SCALE}
                h -${wireKeyLength * SCALE}`;
            break;

            case 270:
                this._path = `M${x * SCALE} ${y * SCALE}
                v ${wireKeyLength * SCALE}
                l ${0.5 * mainKeyLength * SCALE} ${0.8 * mainKeyLength * SCALE}
                m -${0.5 * mainKeyLength * SCALE} ${0.2 * mainKeyLength * SCALE}
                v ${wireKeyLength * SCALE}`;
            break;
        }
    }

    isInArea(x, y){

        let inBody;

        switch (this._orientation){

            case 0:
                inBody = Math.abs(x - this.centerX) <= mainKeyLength / 2;
                inBody = inBody & this.centerY - y <= mainKeyLength / 2;
                inBody = inBody & this.centerY - y > 0;
            break;

            case 90:
                inBody = Math.abs(y - this.centerY) <= mainKeyLength / 2;
                inBody = inBody & this.centerX - x <= mainKeyLength / 2;
                inBody = inBody & this.centerX - x > 0;
            break;

            case 180:
                inBody = Math.abs(x - this.centerX) <= mainKeyLength / 2;
                inBody = inBody & y - this.centerY <= mainKeyLength / 2;
                inBody = inBody & y - this.centerY > 0;
            break;

            case 270:
                inBody = Math.abs(y - this.centerY) <= mainKeyLength / 2;
                inBody = inBody & x - this.centerX <= mainKeyLength / 2;
                inBody = inBody & x - this.centerX > 0;
            break;
        }

        return super.isInArea(x, y) | inBody;
    }
}


class Lamp extends Element {

    constructor(x, y, orientation) {super(x, y, orientation)}

    _calcPath(){

        //SVG for drawing with params

        let x = this.x1;
        let y = this.y1;

        switch (this._orientation){

            case 0:
                this._path = `M${x*SCALE} ${y*SCALE}
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
                this._path = `M${x*SCALE} ${y*SCALE}
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
                this._path = `M${x*SCALE} ${y*SCALE}
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
                this._path = `M${x*SCALE} ${y*SCALE}
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
    }

    isInArea(x, y){
        let distanceFromCenter = Math.sqrt(Math.pow(this.centerX - x, 2) + Math.pow(this.centerY - y, 2));

        return super.isInArea(x, y) | distanceFromCenter <= mainLampR;
    }
}


class Wire extends Element {

    constructor() {
        super();
    }
}

function canvasMove(e){
    let x = Math.round((e.pageX - layout.offsetLeft)/SCALE);
    let y = Math.round((e.pageY - layout.offsetTop)/SCALE);
    for (let element of elements){
        if (element.isInArea(x, y)){
            element.selected = true;
        } else if (element.selected){
            element.selected = false;
        }
    }
}


let layout = document.getElementById('layout')
let ctx = layout.getContext('2d');

//layout.onclick = canvasClick;
layout.onmousemove = canvasMove;

ctx.fillStyle = "#000000";
ctx.fillRect(0,0,window.innerWidth,window.innerHeight);

ctx.lineWidth = 4;
ctx.strokeStyle = MAIN_COLOR;

let elements = [];