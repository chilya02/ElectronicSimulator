const ELEMENT_LENGTH = 20;
const DEFAULT_IMPEDANCE = 1;
const LAYOUT_HEIGHT = 50;
const LAYOUT_WIDTH = 100;
const SCALE = 8;

//colors:

const MAIN_COLOR = '#808080'
const SELECTED_COLOR = '#00ffff'
const NODE_COLOR = '#ffffff'
const BACK_COLOR = '#000000'

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


class Node {

    constructor(){
        this.x;
        this.y;
        this.selected = false;
        this.update = false;
    }

    setPoint(x, y){
        this.x = x;
        this.y = y;
    }

    checkPoint(xAbs, yAbs, isPressed){
        
        let x = Math.round((xAbs)/SCALE);
        let y = Math.round((yAbs)/SCALE);

        if (this.isInArea(x, y)){
            if (!this.selected){this.selected = true}
        } else {

            if (this.selected & !isPressed){this.selected = false;}
        }
    }

    isInArea(x, y){
        return Math.abs(x - this.x) <= 5/SCALE & Math.abs(y - this.y) <= 5/SCALE
    }

    set selected(value){
        this._selected = value;
        this.update = true;
    }

    get selected(){
        return this._selected
    }

    draw(ctx){
        if (this.selected){
            ctx.fillStyle = SELECTED_COLOR;
            ctx.fillRect(this.x*SCALE - 5, this.y*SCALE - 5, 10, 10)
            ctx.fillStyle = BACK_COLOR;
        } else{
            ctx.beginPath();
            ctx.arc(this.x*SCALE, this.y*SCALE, 5, 0, 2*Math.PI);
            ctx.fillStyle = NODE_COLOR;
            ctx.fill();
            ctx.fillStyle = BACK_COLOR;
        }
    }
}


class Element {

    constructor(x, y, orientation, ctx) {

        this.x1 = x;
        this.y1 = y;

        this.xStart = this.x1;
        this.yStart = this.y1;
        
        this._node1 = new Node();
        this._node2 = new Node();

        this._orientation = orientation;
        this._calcCoordinates();
        this._calcPath();

        this.selected = false;
        this.update = false;
        this.draw(ctx);
    };

    set _orientation(value){
        while (value < 0){
            value += 360;
        }
        if (value % 90 != 0){
            console.log('Неправльный угол элемента')
            return
        } 
        this.__orientation = value % 360;
    }

    get _orientation(){
        return this.__orientation
    }

    set selected(value){
        this._selected = value;
        this.xStart = this.x1;
        this.yStart = this.y1;
        this.update = true;
    }

    get selected(){
        return this._selected
    }

    stopDrag(){
        this.xStart = this.x1;
        this.yStart = this.y1;
    }

    isInArea(x, y){

        let inNode = this._node1.isInArea(x, y) | this._node2.isInArea(x, y);
        
        switch(this._orientation){

            case 0:
                return x > this.x1 & x < this.x2 & y == this.y1 & y == this.y2 | inNode;

            case 90:
                return y < this.y1 & y > this.y2 & x == this.x1 & x == this.x2 | inNode;
            
            case 180:
                return x < this.x1 & x > this.x2 & y == this.y1 & y == this.y2 | inNode;

            case 270:
                return y > this.y1 & y < this.y2 & x == this.x1 & x == this.x2 | inNode;
            
        }
    }

    checkPoint(xAbs, yAbs, xStart, yStart, isPressed){

        this._node1.checkPoint(xAbs, yAbs, isPressed);
        this._node2.checkPoint(xAbs, yAbs, isPressed);

        let x = Math.round((xAbs)/SCALE);
        let y = Math.round((yAbs)/SCALE);

        if (this.isInArea(x, y)){
            if (!this.selected){this.selected = true}
        } else {

            if (this.selected & !isPressed){this.selected = false;}
        }

        if (this.selected & isPressed){
            this.move(Math.round((xAbs - xStart)/SCALE), Math.round((yAbs - yStart)/SCALE))
        }

        this.update = this.update | this._node1.update | this._node2.update;

        this._node1.update = false;
        this._node2.update = false;
    }

    draw(ctx){
        let element = new Path2D(this._path);
        if (this.selected){
            ctx.strokeStyle = SELECTED_COLOR;
            ctx.stroke(element);
            ctx.strokeStyle = MAIN_COLOR;
        } else {ctx.stroke(element)}

        this._node1.draw(ctx);
        this._node2.draw(ctx);

        console.log('DRAW')
    }

    _calcCoordinates(){  

        let x = this.x1;
        let y = this.y1;    

        switch (this._orientation){

            case 0:
                this.x2 = x + ELEMENT_LENGTH;
                this.y2 = y;
                this.centerX = x + ELEMENT_LENGTH / 2;
                this.centerY = y;
            break;

            case 90:
                this.x2 = x;
                this.y2 = y - ELEMENT_LENGTH;
                this.centerX = x;
                this.centerY = y - ELEMENT_LENGTH / 2;
            break;

            case 180:
                this.x2 = x - ELEMENT_LENGTH;
                this.y2 = y;
                this.centerX = x - ELEMENT_LENGTH / 2;
                this.centerY = y;
            break;

            case 270:
                this.x2 = x;
                this.y2 = y + ELEMENT_LENGTH;
                this.centerX = x;
                this.centerY = y + ELEMENT_LENGTH / 2;
            break;
        }

        this._node1.setPoint(this.x1, this.y1);
        this._node2.setPoint(this.x2, this.y2);

        console.log(`x1: ${this.x1}, y1: ${this.y1}, x2: ${this.x2}, y2: ${this.y2}`)
    }

    move(dx, dy){
        this.x1 = this.xStart + dx;
        this.y1 = this.yStart + dy;
        this._calcCoordinates();
        this._calcPath();
        this.update = true;
    }
}


class Resistor extends Element {

    constructor(x, y, orientation, ctx) {super(x, y, orientation, ctx)}

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
                inBody = Math.abs(x - this.centerX) < (mainResW / 2);
                inBody = inBody & Math.abs(y - this.centerY) < (mainResH / 2);
            break;

            case 90:
                inBody = Math.abs(x - this.centerX) < (mainResH / 2);
                inBody = inBody & Math.abs(y - this.centerY) < (mainResW / 2);
            break;
        }

        return super.isInArea(x, y) | inBody;
    }
}


class Key extends Element {

    constructor(x, y, orientation, ctx) {super(x, y, orientation, ctx)}

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

    constructor(x, y, orientation, ctx) {super(x, y, orientation, ctx)}

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

        return super.isInArea(x, y) | distanceFromCenter < mainLampR;
    }
}


class Wire extends Element {

    constructor() {
        super();
    }
}


class Layout{

    constructor(){
        this.elements = [];
        this.isPressed = false;
        this.lastSelected = null;
        this.xStart;
        this.yStart;

        this.canvas = document.getElementById('layout');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = MAIN_COLOR;
        this.ctx.fillStyle = BACK_COLOR;
        this.ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
        
    }

    checkPoint(xAbs, yAbs){
        
        let update = false;

        if (this.lastSelected){
            this.lastSelected.checkPoint(xAbs, yAbs, this.xStart, this.yStart, this.isPressed)

            if (this.lastSelected.selected){

                update = this.lastSelected.update;
                this.lastSelected.update = false;


            } else{ 
                update = this._checkElements(xAbs, yAbs);            
            }
        } else {
            update = this._checkElements(xAbs, yAbs);
        }

        
        if (update)
            this.invalidate(this.elements, this.ctx); 
    }

    _checkElements (xAbs, yAbs){
        let update = false;
        for (let element of this.elements){
            
            element.checkPoint(xAbs, yAbs, this.xStart, this.yStart, this.isPressed);         
            update = update | element.update;
            element.update = false;
            if (element.selected) this.lastSelected = element;
        }
        return update;
    }
    
    invalidate(){
        this.ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
        for (let element of this.elements) element.draw(this.ctx);
        if (this.lastSelected) this.lastSelected.draw(this.ctx);
    }

}



function canvasMove(e){
    let xAbs = e.pageX - layout.canvas.offsetLeft;
    let yAbs = e.pageY - layout.canvas.offsetTop;

    layout.checkPoint(xAbs,yAbs) 
}


function canvasRelease(e){
    layout.isPressed = false;
    layout.lastSelected.stopDrag();
}

function canvasClick(e){
    layout.isPressed = true;
    layout.xStart = e.pageX - layout.canvas.offsetLeft;
    layout.yStart = e.pageY - layout.canvas.offsetTop;
}


let layout = new Layout();

layout.canvas.onmousemove = canvasMove;
layout.canvas.onmousedown = canvasClick;  
layout.canvas.onmouseup = canvasRelease; 