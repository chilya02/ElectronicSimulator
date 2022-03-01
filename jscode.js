const ELEMENT_LENGTH = 18;
const DEFAULT_IMPEDANCE = 1;
const LAYOUT_HEIGHT = 50;
const LAYOUT_WIDTH = 100;
const SCALE = 10;
class Element {
    constructor(impedance) {
        this.length = ELEMENT_LENGTH;
        this.impedance = impedance;
        this.image = new Image();
      };

      move(x1, y1, x2, y2){
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
      }
}


class Resistor extends Element {
    constructor() {
        super(DEFAULT_IMPEDANCE);
    }

}


class Key extends Element {
    constructor() {
        super(DEFAULT_IMPEDANCE);
    }
}


class Lamp extends Element {
    constructor() {
        super(DEFAULT_IMPEDANCE);
    }
}


class Wire extends Element {
    constructor() {
        super(0);
    }
}



function draw(){
    
    let canvas = document.getElementById('canvas')
    let ctx = canvas.getContext('2d');


    //Константы резистора
    const connectorLength = 3;
    const mainWidth = 10;
    const mainHeight = 4;


    //Рисуем гооризонтальный резистор
    let x = 0;
    let y = 5;

    let resistor = new Path2D(`M${x*SCALE} ${y*SCALE} 
    h ${connectorLength*SCALE} 
    v ${mainHeight/2*SCALE} 
    h ${mainWidth*SCALE} 
    v -${mainHeight*SCALE} 
    h -${mainWidth*SCALE} 
    v ${mainHeight/2*SCALE} 
    M${(x+mainWidth+connectorLength)*SCALE} ${y*SCALE} 
    h ${connectorLength*SCALE} 
    `);
    ctx.stroke(resistor);

    //Рисуем вертикальный резистор
        x = 5;
        y = 8;
        resistor = new Path2D(`M${x*SCALE} ${y*SCALE} 
        v ${connectorLength*SCALE} 
        h ${mainHeight/2*SCALE} 
        v ${mainWidth*SCALE} 
        h -${mainHeight*SCALE} 
        v -${mainWidth*SCALE} 
        h ${mainHeight/2*SCALE} 
        M${x*SCALE} ${(y+mainWidth+connectorLength)*SCALE} 
        v ${connectorLength*SCALE} 
        `);
    ctx.stroke(resistor);

    
}