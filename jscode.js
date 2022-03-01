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
    const wireResLength = 4;
    const mainResW = 10;
    const mainResH = 4;
    const wireLampLength = 5.6;
    const mainLampR = 3.4;



    //Рисуем горизонтальный резистор
    
    let x = 10;
    let y = 10;

    let resistor = new Path2D(`M${x*SCALE} ${y*SCALE} 
    h ${wireResLength*SCALE} 
    v ${mainResH/2*SCALE} 
    h ${mainResW*SCALE} 
    v -${mainResH*SCALE} 
    h -${mainResW*SCALE} 
    v ${mainResH/2*SCALE} 
    M${(x+mainResW+wireResLength)*SCALE} ${y*SCALE} 
    h ${wireResLength*SCALE} 
    `);

    y = 20

    // Рисуем горизонтальную лампу

    let lamp = new Path2D(`M${x*SCALE} ${y*SCALE}
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
    l ${mainLampR*0.7*SCALE} ${mainLampR*0.7*SCALE}
    `);
    
    
    ctx.stroke(resistor)
    ctx.stroke(lamp);

    x = 40;
    y = 8;


    //Рисуем вертикальную лампу
    lamp = new Path2D(`M${x*SCALE} ${y*SCALE}
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
    l ${mainLampR*0.7*SCALE} ${mainLampR*0.7*SCALE}
    `);


    //Рисуем вертикальный резистор
    x = 50;

        resistor = new Path2D(`M${x*SCALE} ${y*SCALE} 
        v ${wireResLength*SCALE} 
        h ${mainResH/2*SCALE} 
        v ${mainResW*SCALE} 
        h -${mainResH*SCALE} 
        v -${mainResW*SCALE} 
        h ${mainResH/2*SCALE} 
        M${x*SCALE} ${(y+mainResW+wireResLength)*SCALE} 
        v ${wireResLength*SCALE} 
        `);

        ctx.stroke(resistor)
        ctx.stroke(lamp);
}