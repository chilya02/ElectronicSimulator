const ELEMENT_LENGTH = 10;
const DEFAULT_IMPEDANCE = 1;
const SCALE = 16;

//colors:

const MAIN_COLOR = '#808080'
const SELECTED_COLOR = '#00ffff'
const NODE_COLOR = '#ffffff'
const BACK_COLOR = '#000000'

//Constants for Resistor params

const mainResW = 5;
const mainResH = 2;
const wireResL = (ELEMENT_LENGTH - mainResW) / 2;

//Constants for Key params

const mainKeyL = 3;
const wireKeyL = (ELEMENT_LENGTH - mainKeyL) / 2;

//Constants for Round elements params

const mainRoundR = 1.7;
const wireRoundL = ELEMENT_LENGTH / 2 - mainRoundR;

//Constants for Voltage Source params

const mainVoltSourceL = 0.75;
const minMainVoltSourceL = 2;
const plusMainVoltSourceL = 4;
const wireVoltSourceL = (ELEMENT_LENGTH - mainVoltSourceL) / 2;


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


class BaseElement{

    // Abstract class for all elements on the layout

    constructor(x, y){
        this.x1 = x;
        this.y1 = y;

        this.xStart = this.x1;
        this.yStart = this.y1;

        this._node1 = new Node();
        this._node2 = new Node();

        this.lastSelected = null;
        this.selected = false;
        this.update = false;
        this.isMoving = false;
    }

    get length(){
        return Math.sqrt((this.x1 - this.x2) ** 2 + (this.y1 - this.y2) ** 2);
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
        this.isMoving = false;
    }

    checkPoint(xAbs, yAbs, xStart, yStart, isPressed){
        if (!this.isMoving){
            if (this.lastSelected){

                this.lastSelected.checkPoint(xAbs, yAbs, isPressed);

                if (this.lastSelected.selected){
                    this.update = this.update | this.lastSelected.update;
                    this.lastSelected.update = false;
                } else{
                    this._checkNodes(xAbs, yAbs, isPressed);
                }
            } else{
                this._checkNodes(xAbs, yAbs, isPressed);
            }
        }

        if (this.isInArea(xAbs, yAbs)){
            if (!this.selected){this.selected = true}
        } else {

            if (this.selected & !isPressed){this.selected = false;}
        }

        if (isPressed){

            let dx = Math.round((xAbs - xStart)/SCALE);
            let dy = Math.round((yAbs - yStart)/SCALE);
            
            let x = Math.round((xAbs)/SCALE);
            let y = Math.round((yAbs)/SCALE);
            
            if (this._node1.selected | this._node2.selected){
                this.rotate(x, y)
            }
            else { 
                if (this.selected){
                    this.move(dx, dy)
                }
            }
        }
    }

    _checkNodes(xAbs, yAbs, isPressed){
        for (let node of [this._node1, this._node2]){
            node.checkPoint(xAbs, yAbs, isPressed);
            if (node.selected) this.lastSelected = node;

            this.update = this.update | node.update;
            node.update = false;
        }
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
    }
    

    move(dx, dy){
        this.x1 = this.xStart + dx;
        this.y1 = this.yStart + dy;
        this._calcPath();
        this.update = true;
        if ((dx+dy)) this.isMoving = true;
    }

}


class ActiveElement extends BaseElement {

    // Abstract class for active elements 
    // Includes: 
    // Element + orientation + calculating coordinates
    
    constructor(x, y, orientation, ctx) {
        super(x, y);

        this._orientation = orientation;
        this._calcCoordinates();
        this._calcPath();

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

    move(dx, dy){
        super.move(dx, dy);
        this._calcCoordinates();
    }

    isInArea(xAbs, yAbs){

        let x = Math.round((xAbs)/SCALE);
        let y = Math.round((yAbs)/SCALE);

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

    rotate(x, y){

        if (this._node1.selected){

            let dx = x - this.x2;
            let dy = y - this.y2;

            switch (this._orientation){

                case 0:
                    if (Math.abs(dy/dx) > 1){
                        this.x1 += ELEMENT_LENGTH;
                        this.y1 += (dy/dx) > 0 ? -ELEMENT_LENGTH: ELEMENT_LENGTH;
                        this._orientation += (dy/dx) > 0 ? -90 : 90;
                        this.update = true;
                    } else if (dx > 0){
                        this.x1 += ELEMENT_LENGTH * 2;
                        this._orientation += 180;
                        this.update = true;
                    }
                break;

                case 90:
                    if (Math.abs(dx/dy) > 1){
                        this.x1 += (dx/dy) > 0 ? ELEMENT_LENGTH: -ELEMENT_LENGTH;
                        this.y1 -= ELEMENT_LENGTH;
                        this._orientation += (dx/dy) > 0 ? 90 : -90;
                        this.update = true;
                    } else if (dy < 0){
                        this.y1 -= ELEMENT_LENGTH * 2; 
                        this._orientation += 180;
                        this.update = true;
                    }
                break;

                case 180:
                    if (Math.abs(dy/dx) > 1){
                        this.x1 -= ELEMENT_LENGTH;
                        this.y1 += (dy/dx) > 0 ? ELEMENT_LENGTH: -ELEMENT_LENGTH;
                        this._orientation += (dy/dx) > 0 ? -90 : 90;
                        this.update = true;
                    } else if (dx < 0){
                        this.x1 -= ELEMENT_LENGTH * 2;
                        this._orientation += 180;
                        this.update = true;
                    }
                break;

                case 270:
                    if (Math.abs(dx/dy) > 1){
                        this.x1 += (dx/dy) > 0 ? -ELEMENT_LENGTH: ELEMENT_LENGTH;
                        this.y1 += ELEMENT_LENGTH;
                        this._orientation += (dx/dy) > 0 ? 90 : -90;
                        this.update = true;
                    } else if (dy > 0){
                        this.y1 += ELEMENT_LENGTH * 2;
                        this._orientation += 180;
                        this.update = true;
                    }
                break;
                }
        }

        if (this._node2.selected){

            let dx = x - this.x1;
            let dy = y - this.y1;
            
            switch (this._orientation){

                case 0:
                    if (Math.abs(dy/dx) > 1){
                        this._orientation += (dy/dx) > 0 ? -90 : 90;
                        this.update = true;
                    } else if (dx < 0){
                        this._orientation += 180;
                        this.update = true;
                    }
                break;

                case 90:
                    if (Math.abs(dx/dy) > 1){
                        this._orientation += (dx/dy) > 0 ? 90 : -90;
                        this.update = true;
                    } else if (dy > 0){
                        this._orientation += 180;
                        this.update = true;
                    }
                break;

                case 180:
                    if (Math.abs(dy/dx) > 1){
                        this._orientation += (dy/dx) > 0 ? -90 : 90;
                        this.update = true;
                    } else if (dx > 0){
                        this._orientation += 180;
                        this.update = true;
                    }
                break;

                case 270:
                    if (Math.abs(dx/dy) > 1){
                        this._orientation += (dx/dy) > 0 ? 90 : -90;
                        this.update = true;
                    } else if (dy < 0){
                        this._orientation += 180;
                        this.update = true;
                    }
                break;

            }
        }

        if (this.update) {
            this._calcCoordinates();
            this._calcPath();
        }
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
    }
}


class RoundElement extends ActiveElement{

    constructor(x, y, orientation, ctx){super(x, y, orientation, ctx)}

    _calcPath(){

        //SVG for drawing with params

        let x = this.x1;
        let y = this.y1;

        switch (this._orientation){

            case 0:
                this._path = `M${x * SCALE} ${y * SCALE}
                h ${wireRoundL * SCALE} 
                a ${mainRoundR * SCALE} ${mainRoundR * SCALE} 0 1 1 ${2 * mainRoundR * SCALE} 0
                a ${mainRoundR * SCALE} ${mainRoundR * SCALE} 0 1 1 ${-2 * mainRoundR * SCALE} 0
                m ${2 * mainRoundR * SCALE} 0
                h ${wireRoundL * SCALE}`;
            break;

            case 90:
                this._path = `M${x * SCALE} ${y * SCALE}
                v ${-wireRoundL * SCALE} 
                a ${mainRoundR * SCALE} ${mainRoundR * SCALE} 0 1 1 0 ${-2 * mainRoundR * SCALE}
                a ${mainRoundR * SCALE} ${mainRoundR * SCALE} 0 1 1 0 ${2 *mainRoundR * SCALE}
                m 0 ${-2 * mainRoundR * SCALE}
                v ${-wireRoundL * SCALE}`;
            break;

            case 180:
                this._path = `M${x * SCALE} ${y * SCALE}
                h ${-wireRoundL * SCALE} 
                a ${mainRoundR * SCALE} ${mainRoundR * SCALE} 0 1 1 -${2 * mainRoundR * SCALE} 0
                a ${mainRoundR * SCALE} ${mainRoundR * SCALE} 0 1 1 ${2 * mainRoundR * SCALE} 0
                m ${-2 * mainRoundR * SCALE} 0
                h ${-wireRoundL * SCALE}`;
            break;

            case 270:
                this._path = `M${x * SCALE} ${y * SCALE}
                v ${wireRoundL * SCALE} 
                a ${mainRoundR * SCALE} ${mainRoundR * SCALE} 0 1 1 0 ${2 * mainRoundR * SCALE}
                a ${mainRoundR * SCALE} ${mainRoundR * SCALE} 0 1 1 0 ${-2 * mainRoundR * SCALE}
                m 0 ${mainRoundR * SCALE * 2}
                v ${wireRoundL * SCALE}`;
            break;
        }
    }

    isInArea(xAbs, yAbs){
        let x = Math.round((xAbs)/SCALE);
        let y = Math.round((yAbs)/SCALE);

        let distanceFromCenter = Math.sqrt(Math.pow(this.centerX - x, 2) + Math.pow(this.centerY - y, 2));

        return super.isInArea(xAbs, yAbs) | distanceFromCenter < mainRoundR;
    }
}


class Resistor extends ActiveElement {

    constructor(x, y, orientation, ctx) {super(x, y, orientation, ctx)}

    _calcPath(){
        
        //SVG for drawing with orientation

        let x = this.x1;
        let y = this.y1;

        switch (this._orientation){

            case 0:
                this._path = `M ${x * SCALE} ${y * SCALE} 
                h ${wireResL * SCALE} 
                v ${mainResH / 2 * SCALE} 
                h ${mainResW * SCALE} 
                v ${-mainResH * SCALE} 
                h ${-mainResW * SCALE} 
                v ${mainResH / 2 * SCALE} 
                m ${mainResW * SCALE} 0
                h ${wireResL * SCALE}`;
            break;

            case 90:
                this._path = `M ${x * SCALE} ${y * SCALE} 
                v ${-wireResL * SCALE} 
                h ${mainResH / 2 * SCALE} 
                v ${-mainResW * SCALE} 
                h ${-mainResH * SCALE} 
                v ${mainResW * SCALE} 
                h ${mainResH / 2 * SCALE} 
                m 0 ${-mainResW * SCALE} 
                v ${-wireResL * SCALE}`;
            break;

            case 180:
                this._path = `M ${x * SCALE} ${y * SCALE} 
                h ${-wireResL * SCALE} 
                v ${mainResH / 2 * SCALE} 
                h ${-mainResW * SCALE} 
                v ${-mainResH * SCALE} 
                h ${mainResW * SCALE} 
                v ${mainResH / 2 * SCALE} 
                m ${-mainResW * SCALE} 0
                h ${-wireResL * SCALE}`;
            break;

            case 270:
                this._path = `M ${x * SCALE} ${y * SCALE} 
                v ${wireResL * SCALE} 
                h ${mainResH / 2 * SCALE} 
                v ${mainResW * SCALE} 
                h -${mainResH * SCALE} 
                v -${mainResW * SCALE} 
                h ${mainResH / 2 * SCALE} 
                m 0 ${mainResW * SCALE} 
                v ${wireResL * SCALE}`;
            break;
        }
    }

    isInArea(xAbs, yAbs){

        let x = Math.round((xAbs)/SCALE);
        let y = Math.round((yAbs)/SCALE);

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

        return super.isInArea(xAbs, yAbs) | inBody;
    }
}


class Key extends ActiveElement {

    constructor(x, y, orientation, ctx) {super(x, y, orientation, ctx)}

    _calcPath(){

        //SVG for drawing with params

        let x = this.x1;
        let y = this.y1;

        switch (this._orientation){

            case 0:
                this._path = `M${x * SCALE} ${y * SCALE}
                h ${wireKeyL * SCALE}
                l ${0.8 * mainKeyL * SCALE} ${-0.5 * mainKeyL * SCALE}
                m ${0.2 * mainKeyL * SCALE} ${0.5 * mainKeyL * SCALE}
                h ${wireKeyL * SCALE}`;
            break;

            case 90:
                this._path = `M${x * SCALE} ${y * SCALE}
                v ${-wireKeyL * SCALE}
                l ${-0.5 * mainKeyL * SCALE} -${0.8 * mainKeyL * SCALE}
                m ${0.5 * mainKeyL * SCALE} -${0.2 * mainKeyL * SCALE}
                v ${-wireKeyL * SCALE}`;
            break;

            case 180:
                this._path = `M${x * SCALE} ${y * SCALE}
                h -${wireKeyL * SCALE}
                l -${0.8 * mainKeyL * SCALE} ${0.5 * mainKeyL * SCALE}
                m -${0.2 * mainKeyL * SCALE} -${0.5 * mainKeyL * SCALE}
                h -${wireKeyL * SCALE}`;
            break;

            case 270:
                this._path = `M${x * SCALE} ${y * SCALE}
                v ${wireKeyL * SCALE}
                l ${0.5 * mainKeyL * SCALE} ${0.8 * mainKeyL * SCALE}
                m ${-0.5 * mainKeyL * SCALE} ${0.2 * mainKeyL * SCALE}
                v ${wireKeyL * SCALE}`;
            break;
        }
    }

    isInArea(xAbs, yAbs){

        let x = Math.round((xAbs)/SCALE);
        let y = Math.round((yAbs)/SCALE);

        let inBody;

        switch (this._orientation){

            case 0:
                inBody = Math.abs(x - this.centerX) <= mainKeyL / 2;
                inBody = inBody & this.centerY - y <= mainKeyL / 2;
                inBody = inBody & this.centerY - y > 0;
            break;

            case 90:
                inBody = Math.abs(y - this.centerY) <= mainKeyL / 2;
                inBody = inBody & this.centerX - x <= mainKeyL / 2;
                inBody = inBody & this.centerX - x > 0;
            break;

            case 180:
                inBody = Math.abs(x - this.centerX) <= mainKeyL / 2;
                inBody = inBody & y - this.centerY <= mainKeyL / 2;
                inBody = inBody & y - this.centerY > 0;
            break;

            case 270:
                inBody = Math.abs(y - this.centerY) <= mainKeyL / 2;
                inBody = inBody & x - this.centerX <= mainKeyL / 2;
                inBody = inBody & x - this.centerX > 0;
            break;
        }

        return super.isInArea(xAbs, yAbs) | inBody;
    }
}


class Lamp extends RoundElement {

    constructor(x, y, orientation, ctx) {super(x, y, orientation, ctx)}

    _calcPath(){

        //SVG for drawing with params

        super._calcPath();

        let x = this.x1;
        let y = this.y1;

        switch (this._orientation){

            case 0:
                this._path += `m ${-(mainRoundR + wireRoundL) * SCALE} 0
                l ${0.7 * mainRoundR * SCALE} ${0.7 * mainRoundR * SCALE}
                m ${-1.4 * mainRoundR * SCALE} 0
                l ${1.4 * mainRoundR * SCALE} ${-1.4 * mainRoundR * SCALE}
                m ${-1.4 * mainRoundR * SCALE} 0
                l ${0.7 * mainRoundR * SCALE} ${0.7 * mainRoundR * SCALE}`;
            break;

            case 90:
                this._path += `m 0 ${(mainRoundR + wireRoundL) * SCALE}
                l ${0.7 * mainRoundR * SCALE} ${0.7 * mainRoundR * SCALE}
                m ${-1.4 * mainRoundR * SCALE} 0
                l ${1.4 * mainRoundR * SCALE} ${-1.4 * mainRoundR * SCALE}
                m ${-1.4 * mainRoundR * SCALE} 0
                l ${0.7 * mainRoundR * SCALE} ${0.7 * mainRoundR * SCALE}`;
            break;

            case 180:
                this._path += `m ${(mainRoundR + wireRoundL) * SCALE} 0
                l ${0.7 * mainRoundR * SCALE} ${0.7 * mainRoundR * SCALE}
                m ${-1.4 * mainRoundR * SCALE} 0
                l ${1.4 * mainRoundR * SCALE} ${-1.4 * mainRoundR * SCALE}
                m ${-1.4 * mainRoundR * SCALE} 0
                l ${0.7 * mainRoundR * SCALE} ${0.7 * mainRoundR * SCALE}`;
            break;

            case 270:
                this._path += `m 0 -${(mainRoundR + wireRoundL)*SCALE}
                l ${0.7 * mainRoundR * SCALE} ${0.7 * mainRoundR * SCALE}
                m ${-1.4 * mainRoundR * SCALE} 0
                l ${1.4 * mainRoundR * SCALE} ${-1.4 * mainRoundR * SCALE}
                m ${-1.4 * mainRoundR * SCALE} 0
                l ${0.7 * mainRoundR * SCALE} ${0.7 * mainRoundR * SCALE}`;
            break;
        }
    }
}


class CurrentSource extends RoundElement{

    constructor(x, y, orientation, ctx){super(x, y, orientation, ctx)}

    _calcPath(){

        //SVG for drawing with params

        super._calcPath();

        let x = this.x1;
        let y = this.y1;

        switch (this._orientation){

            case 0:
                this._path += `m ${-(1.5 * mainRoundR + wireRoundL)*SCALE} 0
                h ${mainRoundR * SCALE}
                m ${-0.35 * mainRoundR * SCALE} ${-0.3 * mainRoundR * SCALE}
                l ${0.3 * mainRoundR * SCALE} ${0.3 * mainRoundR * SCALE}
                m ${-0.3 * mainRoundR * SCALE} ${0.3 * mainRoundR * SCALE}
                l ${0.3 * mainRoundR * SCALE} ${-0.3 * mainRoundR * SCALE}`;
            break;

            case 90:
                this._path += `m 0 ${(1.5 * mainRoundR + wireRoundL) * SCALE}
                v ${-mainRoundR * SCALE}
                m ${-0.3 * mainRoundR * SCALE} ${0.35 * mainRoundR * SCALE} 
                l ${0.3 * mainRoundR * SCALE} ${-0.3 * mainRoundR * SCALE}
                m ${0.3 * mainRoundR * SCALE} ${0.3 * mainRoundR * SCALE}
                l ${-0.3 * mainRoundR * SCALE} ${-0.3 * mainRoundR * SCALE}`;
            break;

            case 180:
                this._path += `m ${(1.5 * mainRoundR + wireRoundL) * SCALE} 0
                h ${-mainRoundR * SCALE}
                m ${0.35 * mainRoundR * SCALE} ${-0.3 * mainRoundR * SCALE}
                l ${-0.3 * mainRoundR * SCALE} ${0.3 * mainRoundR * SCALE}
                m ${0.3 * mainRoundR * SCALE} ${0.3 * mainRoundR * SCALE}
                l ${-0.3 * mainRoundR * SCALE} ${-0.3 * mainRoundR * SCALE}`
            break;

            case 270:
                this._path += `m 0 ${-(1.5 * mainRoundR + wireRoundL) * SCALE}
                v ${mainRoundR * SCALE}
                m ${-0.3 * mainRoundR * SCALE} ${-0.35 * mainRoundR * SCALE} 
                l ${0.3 * mainRoundR * SCALE} ${0.3 * mainRoundR * SCALE}
                m ${0.3 * mainRoundR * SCALE} ${-0.3 * mainRoundR * SCALE}
                l ${-0.3 * mainRoundR * SCALE} ${0.3 * mainRoundR * SCALE}`;
            break;
        }
    }
}


class VoltageSource extends ActiveElement{

    constructor(x, y, orientation, ctx) {super(x, y, orientation, ctx)}

    _calcPath(){
        
        //SVG for drawing with orientation

        let x = this.x1;
        let y = this.y1;

        switch (this._orientation){

            case 0:
                this._path = `M ${x*SCALE} ${y*SCALE} 
                h ${wireVoltSourceL*SCALE} 
                m 0 ${minMainVoltSourceL/2*SCALE} 
                v ${-minMainVoltSourceL*SCALE}
                m 0 ${minMainVoltSourceL/2*SCALE}
                m ${mainVoltSourceL*SCALE} 0
                m 0 ${plusMainVoltSourceL/2*SCALE} 
                v ${-plusMainVoltSourceL*SCALE}
                m 0 ${plusMainVoltSourceL/2*SCALE}
                h ${wireVoltSourceL*SCALE}`;
            break;

            case 90:
                this._path = `M ${x*SCALE} ${y*SCALE} 
                v -${wireVoltSourceL*SCALE} 
                m ${minMainVoltSourceL/2*SCALE} 0
                h ${-minMainVoltSourceL*SCALE}
                m ${minMainVoltSourceL/2*SCALE} 0
                m 0 ${-mainVoltSourceL*SCALE}
                m ${plusMainVoltSourceL/2*SCALE} 0
                h ${-plusMainVoltSourceL*SCALE}
                m ${plusMainVoltSourceL/2*SCALE} 0
                v -${wireVoltSourceL*SCALE}`;
            break;

            case 180:
                this._path = `M ${x*SCALE} ${y*SCALE} 
                h ${-wireVoltSourceL*SCALE} 
                m 0 ${minMainVoltSourceL/2*SCALE} 
                v ${-minMainVoltSourceL*SCALE}
                m 0 ${minMainVoltSourceL/2*SCALE}
                m ${-mainVoltSourceL*SCALE} 0
                m 0 ${plusMainVoltSourceL/2*SCALE} 
                v ${-plusMainVoltSourceL*SCALE}
                m 0 ${plusMainVoltSourceL/2*SCALE}
                h -${wireVoltSourceL*SCALE}`;
            break;

            case 270:
                this._path = `M ${x*SCALE} ${y*SCALE} 
                v ${wireVoltSourceL*SCALE} 
                m ${minMainVoltSourceL/2*SCALE} 0
                h ${-minMainVoltSourceL*SCALE}
                m ${minMainVoltSourceL/2*SCALE} 0
                m 0 ${mainVoltSourceL*SCALE}
                m ${plusMainVoltSourceL/2*SCALE} 0
                h ${-plusMainVoltSourceL*SCALE}
                m ${plusMainVoltSourceL/2*SCALE} 0
                v ${wireVoltSourceL*SCALE}`;
            break;
        }
    }

    isInArea(xAbs, yAbs){

        let x = Math.round((xAbs)/SCALE);
        let y = Math.round((yAbs)/SCALE);

        let inBody;

        switch (this._orientation % 180){

            case 0:
                inBody = Math.abs(x - this.centerX) <= (mainVoltSourceL / 2);
                inBody = inBody & Math.abs(y - this.centerY) <= (plusMainVoltSourceL / 2);
            break;

            case 90:
                inBody = Math.abs(x - this.centerX) <= (plusMainVoltSourceL / 2);
                inBody = inBody & Math.abs(y - this.centerY) <= (mainVoltSourceL / 2);
            break;
        }

        return super.isInArea(xAbs, yAbs) | inBody;
    }
}


class Voltmetr extends RoundElement{

}


class Wire extends BaseElement{

    constructor(x1, y1, x2, y2, ctx) {
        super(x1, y1, ctx);
        this.x2 = x2;
        this.y2 = y2;

        this.selected = true;
        this._node2.selected = true;
        this.lastSelected = this._node2;

        this.x2Start = this.x2;
        this.y2Start = this.y2;

        this._calcPath();
        this.draw(ctx);
    }

    set selected(value){
        super.selected = value;

        this.x2Start = this.x2;
        this.y2Start = this.y2;
    }

    get selected(){
        return super.selected;
    }

    rotate(x, y){

        if (this._node1.selected){
            this.x1 = x;
            this.y1 = y;
            this.update = true;
        }

        if (this._node2.selected){
            this.x2 = x;
            this.y2 = y;
            this.update = true;
        }

        if (this.update) {
            this._calcPath();
        }
    }

    _calcPath(){
        this._path = `M${this.x1*SCALE} ${this.y1*SCALE}
        L${this.x2*SCALE} ${this.y2*SCALE}`

        this._node1.setPoint(this.x1, this.y1);
        this._node2.setPoint(this.x2, this.y2);
    }
    
    isInArea(xAbs, yAbs){

        let x = Math.round((xAbs)/SCALE);
        let y = Math.round((yAbs)/SCALE);

        let inNode = this._node1.isInArea(x, y) | this._node2.isInArea(x, y);

        if (this.y1 == this.y2){
            return inNode | Math.abs(yAbs - this.y1*SCALE) <= 5 &
            xAbs >= Math.min(this.x1*SCALE, this.x2*SCALE) &
            xAbs <= Math.max(this.x1*SCALE, this.x2*SCALE);
        }

        if (this.x1 == this.x2){
            return inNode | Math.abs(xAbs - this.x1*SCALE) <= 5 &
            yAbs >= Math.min(this.y1*SCALE, this.y2*SCALE) &
            yAbs <= Math.max(this.y1*SCALE, this.y2*SCALE);
        }

        let equation = (xAbs - this.x1*SCALE) * (this.y2*SCALE - this.y1*SCALE)/ (this.x2*SCALE-this.x1*SCALE) + this.y1*SCALE;
            
        return yAbs <= Math.max(this.y1*SCALE, this.y2*SCALE) &
            yAbs >= Math.min(this.y1*SCALE, this.y2*SCALE) & 
            xAbs >= Math.min(this.x1*SCALE, this.x2*SCALE) &
            xAbs <= Math.max(this.x1*SCALE, this.x2*SCALE) &
            Math.abs(equation - yAbs) <= 5 | inNode;
    }

    move(dx, dy){
        this.x1 = this.xStart + dx;
        this.y1 = this.yStart + dy;
        this.x2 = this.x2Start + dx;
        this.y2 = this.y2Start + dy;
        this._calcPath();
        this.update = true;
        if ((dx+dy)) this.isMoving = true;
    }
}


class Layout{

    constructor(){

        this.elements = [];
        this.devices = [];

        this._isPressed = false;
        this._isPressedRight = false;

        this.lastSelected = null;
        this.lastSelectedNew = null;
        this.newWire = null;

        this.xStart;
        this.yStart;

        this.canvas = document.getElementById('layout');

        //this.currentSource = new CurrentSource(5, 5, 250, 150, this.ctx);

        this.calcSize();
        this.ctxSetup();
        this._createNewElements();

        this.invalidate();
    }

    changeSize(){
        this.calcSize();
        this.ctxSetup();
        this._createNewElements();
        this.invalidate();
    }

    calcSize(){
        this.height = document.body.clientHeight;
        this.width = document.body.clientWidth;

        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;

        this.downLineY = Math.round(this.height - 6 *SCALE)

        this.newKeyRespX = Math.round(this.width / SCALE / 2 - ELEMENT_LENGTH / 2);
        this.newKeyRespY = Math.round(this.height / SCALE - 3);

        this.newResistorRespX = Math.round(this.width / SCALE / 2 - ELEMENT_LENGTH * 3 / 2 - 5);
        this.newResistorRespY = Math.round(this.height / SCALE - 3);

        this.newLampRespX = Math.round(this.width / SCALE / 2 + ELEMENT_LENGTH / 2 + 5);
        this.newLampRespY = Math.round(this.height / SCALE - 3);
    }

    ctxSetup(){
        this.ctx = this.canvas.getContext('2d');
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = MAIN_COLOR;
        this.ctx.fillStyle = BACK_COLOR;
    }

    checkPoint(xAbs, yAbs){
        
        let update = false;

        if (this._isPressedRight){
            let x = Math.round((xAbs)/SCALE);
            let y = Math.round((yAbs)/SCALE);
            this.newWire.rotate(x, y);
            update = update | this.newWire.update;

        } else {
            if (this.lastSelectedNew){
                update = update | this._checkLastSelectedNew(xAbs, yAbs);
            } else {
                update = update | this._checkNewElements(xAbs, yAbs);
                   
                if (this.lastSelected){
                    update = update | this._checkLastSelected(xAbs, yAbs);
                } else {
                    update = update | this._checkElements(xAbs, yAbs);
                }
            }
        }
        
        if (update)
            this.invalidate(); 
    }

    _checkLastSelectedNew(xAbs, yAbs){

        let update = false;

        this.lastSelectedNew.checkPoint(xAbs, yAbs, this.xStart, this.yStart, this._isPressed);

        if (this.lastSelectedNew.selected){

            update = update | this.lastSelectedNew.update;
            this.lastSelectedNew.update = false;

        } else{ 
            update = update | this._checkNewElements(xAbs, yAbs);            
        }
        return update;
    }

    _checkLastSelected(xAbs, yAbs){

        let update = false;

        this.lastSelected.checkPoint(xAbs, yAbs, this.xStart, this.yStart, this._isPressed);

        if (this.lastSelected.selected){

            update = update | this.lastSelected.update;
            this.lastSelected.update = false;

        } else{ 
            update = update | this._checkElements(xAbs, yAbs);            
        }
        return update;
    }

    _checkNewElements(xAbs, yAbs){

        let update = false;
        let isAnySelected = false;

        for (let element of [this.newKey, this.newResistor, this.newLamp]){
            element.checkPoint(xAbs, yAbs, this.xStart, this.yStart, this._isPressed)
            isAnySelected = isAnySelected | element.selected;
            update = update | element.update;
            element.update = false;
            if (element.selected) this.lastSelectedNew = element;
        }
        if (!isAnySelected) this.lastSelectedNew = null;

        return update;
    }

    _checkElements (xAbs, yAbs){

        let update = false;
        
        for (let element of this.elements){
            
            element.checkPoint(xAbs, yAbs, this.xStart, this.yStart, this._isPressed);         
            update = update | element.update;
            element.update = false;
            if (element.selected) {
                this.lastSelected = element;
                break;
            }
        }
        return update;
    }
    
    invalidate(){
        this.ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
        
        for (let element of this.elements){
            element.draw(this.ctx);
        }

        if (this.lastSelected) this.lastSelected.draw(this.ctx);
        if (this.newWire) this.newWire.draw(this.ctx);

        this.ctx.fillRect(0,this.downLineY, this.width, this.height - this.downLineY);
        for (let element of [this.newKey, this.newResistor, this.newLamp]){
            element.draw(this.ctx);
        }
        this.ctx.stroke(new Path2D(`M 0 ${this.downLineY} l ${this.width} 0`));
    }

    mouseClick(xAbs, yAbs){
        if (this.lastSelected){
            if (this.lastSelected.selected){
                this._isPressed = true;
                this.xStart = xAbs - this.canvas.offsetLeft;
                this.yStart = yAbs - this.canvas.offsetTop;
            }
        }
        if (this.lastSelectedNew){
            if (this.lastSelectedNew.selected){
                this._isPressed = true;
                this.xStart = xAbs - this.canvas.offsetLeft;
                this.yStart = yAbs - this.canvas.offsetTop;
            }
        }
    }

    rightClick(xAbs, yAbs){
        this.xStart = xAbs - this.canvas.offsetLeft;
        this.yStart = yAbs - this.canvas.offsetTop;

        this._isPressedRight = true;
        let x = Math.round((xAbs)/SCALE);
        let y = Math.round((yAbs)/SCALE);
        this.newWire = new Wire(x, y, x, y, this.ctx);
    }

    rightRelease(xAbs, yAbs){
        this._isPressedRight = false;
        if (this.newWire.length > 0){
            this.elements.push(this.newWire);
            if (this.lastSelected){
                this.lastSelected.selected = false;
            }
            this.lastSelected = this.newWire;
            this.checkPoint(xAbs, yAbs);
        }
        this.newWire = null;
        this.invalidate();
    }

    mouseRelease(){
        this._isPressed = false;
        if (this.lastSelected) this.lastSelected.stopDrag();
        if (this.lastSelectedNew) this.lastSelectedNew.stopDrag();
        this._checkNewElementsPosition();
    }

    _checkNewElementsPosition(){
        if (this.lastSelectedNew){
            if (this.lastSelectedNew.y1 < this.downLineY/SCALE & this.lastSelectedNew.y2 < this.downLineY/SCALE){
                this.elements.push(this.lastSelectedNew);
                this.lastSelected = this.lastSelectedNew;
                this.lastSelectedNew = null;
            }
            this._createNewElements();
            this.invalidate();  
        }
    }

    _createNewElements(){
        this.newKey = new Key(this.newKeyRespX, this.newKeyRespY, 0, this.ctx);
        this.newResistor = new Resistor(this.newResistorRespX, this.newResistorRespY, 0, this.ctx);
        this.newLamp = new Lamp(this.newLampRespX, this.newLampRespY, 0, this.ctx);
    }

    deleteItem(){
        if (this.lastSelected){
            if (this.lastSelected.selected){
                for (let index = 0; index < this.elements.length; index++){
                    if (this.elements[index].selected){
                        this.elements.splice(index, 1)
                        this.lastSelected = this.elements[this.elements.length - 1];
                        this.invalidate();
                    }
                }
            }
        }
    }
}


function canvasMove(e){
    let xAbs = e.pageX - layout.canvas.offsetLeft;
    let yAbs = e.pageY - layout.canvas.offsetTop;

    layout.checkPoint(xAbs,yAbs) 
}


function canvasRelease(e){
    switch (e.which){
        case 1:
            layout.mouseRelease();
        break;
        case 3:
            layout.rightRelease(e.pageX, e.pageY);
        break;
    }
        
}


function canvasClick(e){
    switch (e.which){
        case 1:
            layout.mouseClick(e.pageX, e.pageY);
        break;
        case 3:
            layout.rightClick(e.pageX, e.pageY);
        break;
    }
}


function canvasResize(e){
    layout.changeSize();
}


function deleteContextMenu(e){
    e.preventDefault();
}


function deleteItem(e){
    if (e.code == 'Delete') {
        layout.deleteItem(e.pageX, e.pageY);
      }
}


let layout = new Layout();
layout.canvas.oncontextmenu = deleteContextMenu;
layout.canvas.onmousemove = canvasMove;
layout.canvas.onmousedown = canvasClick;  
layout.canvas.onmouseup = canvasRelease;
layout.canvas.onresize = canvasResize;
layout.canvas.onmouseout = canvasRelease;
window.onresize = canvasResize;

document.addEventListener('keyup', deleteItem);