/* 
 * Некоторые комментарии на английском. Они были написаны на этапе создания программы.
 * 
 * СОКРАЩЕНИЯ:
 * ИН - источник напряжения
 * ИТ - источник тока
 * СК - система координат
 * ЛКМ - левая кнопка мыши
 * ПКМ - правая кнопка мыши
 * ИП - Измерительный прибор
*/
const ELEMENT_LENGTH = 10;      //Длина элемента
const SCALE = 16;               //Масштабный коэффициент

//colors:

const MAIN_COLOR = '#808080'    //Цвет элементов
const SELECTED_COLOR = '#00ffff'//Цвет выбранного элемента
const NODE_COLOR = '#ffffff'    //Цвет узла
const BACK_COLOR = '#000000'    //Цвет заднего фона

//Constants for Resistor params

const mainResW = 5;             //Ширина основной части резистора
const mainResH = 2;             //Высота основной части резистора
const wireResL = (ELEMENT_LENGTH - mainResW) / 2; //Длина провода резистора

//Constants for Key params

const mainKeyL = 3;             //Длина основой части ключа
const wireKeyL = (ELEMENT_LENGTH - mainKeyL) / 2; //Длина провода ключа

//Constants for Round elements params

const mainRoundR = 1.7;         //Радиус основной части круговых элементов
const wireRoundL = ELEMENT_LENGTH / 2 - mainRoundR; //Длина провода круговых элементов

//Constants for Voltage Source params

const mainVoltSourceL = 0.75;   //Длина основной части ИН
const minMainVoltSourceL = 2;   //Длина короткой составляющей основной части ИН
const plusMainVoltSourceL = 4;  //Длина длинной составляющей основной части ИН 
const wireVoltSourceL = (ELEMENT_LENGTH - mainVoltSourceL) / 2; //Длина провода ИН


class Node { //Класс узла элемента

    constructor(element){
        /*
         * Конструктор класса. 
         * Привязывает узел к конкретному элементу element и устанавливает начальные значения атрибутов.
         *
         * @param {BaseElement} элемент, к которому привязывается узел 
         */
        this.element = element;
        this.x;
        this.y;
        this.selected = false;
        this.update = false;
        this.globalNode = null;
    }

    setPoint(x, y){
        /*
         * Устанавливает положение узла (x, y) в нашей собственной СК.
         * 
         * @param x абсцисса в нашей собственной СК. 
         * @param y ордината в нашей собственной СК.
         */
        this.x = x;
        this.y = y;
    }

    checkPoint(xAbs, yAbs, isPressed){
        /*
         * Проверяет точку (xAbs, yAbs) на попадание в границы узла с учетом нажатия ЛКМ.
         * Если точка (xAbs, yAbs) попадает в узел, то он выделяется.
         * 
         * @param xAbs абсцисса в СК окна.
         * @param yAbs ордината в СК окна.
         * @param isPressed Нажата ли ЛКМ
         */
        
        let x = Math.round((xAbs)/SCALE);
        let y = Math.round((yAbs)/SCALE);

        if (this.isInArea(x, y)){
            if (!this.selected){this.selected = true}
        } else {

            if (this.selected & !isPressed){this.selected = false;}
        }
    }

    isInArea(x, y){
        /*
         * Проверяет точку (x, y) на попадание в границы узла.
         * 
         * @param x абсцисса в нашей собственной СК. 
         * @param y ордината в нашей собственной СК.
         * 
         * @return true если точка попадает в границы, иначе - false.  
         */
        
        return Math.abs(x - this.x) <= 5/SCALE & Math.abs(y - this.y) <= 5/SCALE
    }

    set selected(value){
        /*
         * Сетер для установки параметра выделения узла. 
         * Дополнительно предписывает обновить отрисовку узла.
         * 
         * @param value значение выделения.
         */
        this._selected = value;
        this.update = true;
    }

    get selected(){
        /* 
         * Гетер для параметра выделения узла.
         * 
         */
        return this._selected
    }

    draw(ctx){
        /*  
         * Рисует узел в контексте рисования ctx.
         * 
         * @param ctx контекст рисования.
         */
        if (this.selected){
            ctx.fillStyle = SELECTED_COLOR;
            ctx.fillRect(this.x*SCALE - 5, this.y*SCALE - 5, 10, 10)
        } else{
            ctx.beginPath();
            ctx.fillStyle = NODE_COLOR;
            ctx.arc(this.x*SCALE, this.y*SCALE, 5, 0, 2*Math.PI);
            ctx.fill();
        }
    }

    get otherNode(){
        /*
         * Возвращает противоположный узел того же элемента
         * 
         * @return {Node} противоположный узел элемента.
         */
        if (this.element.node1 == this){
            return this.element.node2;
        }
        if (this.element.node2 == this){
            return this.element.node1;
        }
    }

    get nextElementNode(){
        /* 
         * Возвращает узел другого элемента, соединенного с противоположным узлом текущего элемента.
         * 
         * @return {Node} узел другого элемента, соединенного с противоположным узлом текущего элемента.
         */
        if (this.globalNode){
            return this.otherNode == this.otherNode.globalNode.activeElementsNodes[0] ?
            this.otherNode.globalNode.activeElementsNodes[1]:
            this.otherNode.globalNode.activeElementsNodes[0];
        }
    }

    get sameNodeElement(){
        /* 
         * Возвращает узел другого элемента, соединенного с текущим узлом.
         * 
         * @return {Node} узел другого элемента, соединенного с текущим узлом.
         */
        if (this.globalNode){
            return this == this.globalNode.activeElementsNodes[0] ?
            this.globalNode.activeElementsNodes[1]:
            this.globalNode.activeElementsNodes[0];
        }
    }
}


class BaseElement{ //Абстрактный класс всех элементов цепи

    // Abstract class for all elements on the layout

    constructor(x, y){
        /*
         * Конструктор класса. 
         * Устанавливает координаты (x, y) одного из узлов элемента, создает узлы и устанавливает начальные значения атрибутов.
         *
         * @param x абсцисса одного из узлов элемента в нашей собственной СК.
         * @param y ордината одного из узлов элемента в нашей собственной СК.
         */
        this.x1 = x;
        this.y1 = y;

        this.xStart = this.x1;
        this.yStart = this.y1;

        this.node1 = new Node(this);
        this.node2 = new Node(this);

        this.lastSelected = null;
        this.selected = false;
        this.update = false;
        this.isMoving = false;
    }

    get length(){
        /* 
         * Свойство: длина элемента.
         * 
         * @return {number} длина элемента в нашей собственной СК.
         */
        return Math.sqrt((this.x1 - this.x2) ** 2 + (this.y1 - this.y2) ** 2);
    }

    set selected(value){
        /* 
         * Сетер для установки параметра выделения элемента. 
         * Дополнительно предписывает обновить отрисовку элемента и записывыет координаты выделения или снятия выделения.
         * 
         * @param value значение выделения.
         */
        this._selected = value;
        this.xStart = this.x1;
        this.yStart = this.y1;
        this.update = true;
    }

    get selected(){
        /*
         * Гетер для получения значения выделения.
         * 
         * @return {boolean} выделение. 
         */
        return this._selected
    }

    get nominal(){
        /* 
         * Гетер для получения номинала элемента.
         * 
         * @return {number|null} номинал или ничего.
         */
        let value = null;

        if (this instanceof CurrentSource){
            value = this.current;
        }
        if (this instanceof VoltageSource){
            value = this.voltage;
        }
        if (this instanceof Lamp | this instanceof Resistor){
            value = this.resistance;
        }
        return value;
    }

    get normalisedValue(){
        /* 
         * Свойство: нормализованное значение.
         * 
         * Возвращает строку для подписи номинала элемента цепи или индикации ИП с единицами измерения и округлением.
         * @return {string} подпись для элемента.
         */
        let value;

        if (this.hasProperties){
            value = this.nominal;
        } else if (this.hasIndications){
            value = this.indications;
        } else return;
        if (value == Infinity){
            return 'Ꝏ'
        }
        if (value >= 1000000){
            return (Math.floor(value / 100000) / 10) + 'М'
        }
        if (value >= 1000){
            return (Math.floor(value / 100) / 10) + 'к'
        }
        if (value == 0){
            return value;
        } 
        if (value <= 0.1){
            return Math.floor(value * 100000) / 100 + 'м'
        }
        return Math.floor(value * 100) / 100 ;
    }

    set nominal(value){
        /* 
         * Универсальный установщик значения для номиналов элементов.
         * 
         * @param value для установки значения.
         */

        if (this instanceof CurrentSource){
            this.current = value;
        }
        if (this instanceof VoltageSource){
            this.voltage = value;
        }
        if (this instanceof Lamp | this instanceof Resistor){
            this.resistance = value;
        }
    }

    get nominalType(){
        /* 
         * Свойство: возврат наименования параметра элемента. 
         * 
         * @return {string|null} наименование параметра элемента.
         */

        if (this instanceof CurrentSource){
            return "Ток";
        }
        if (this instanceof VoltageSource){
            return "Напряжение";
        }
        if (this instanceof Lamp | this instanceof Resistor){
            return "Сопротивление";
        }
        return null;
    }

    get measurementUnits(){
        /* 
         * Свойство: возврат единиц измерения номинала элемента. 
         * 
         * @return {string|null} единицы измерения.
         */

        if (this instanceof CurrentSource | this instanceof Ampermetr){
            return "А";
        }
        if (this instanceof VoltageSource | this instanceof Voltmetr){
            return "В";
        }
        if (this instanceof Lamp | this instanceof Resistor | this instanceof Ommetr){
            return "Ом";
        }
        return null;
    }

    get hasProperties(){
        /* 
         * Свойство: возвращает true, если у элемента имеется номинал. Иначе - false.
         * 
         * @return {boolean} наличие номинала.
         */
        if (this instanceof CurrentSource | this instanceof VoltageSource | this instanceof Lamp | this instanceof Resistor){
            return true
        }
        return false;
    }

    get textDistance(){
        /* 
         * Свойство: отступ текста подписи. 
         * 
         * @return {float} значение отступа.
         */
        let offset = 0.4;
        if (this instanceof RoundElement){
            return mainRoundR + offset;
        }
        if (this instanceof VoltageSource){
            return plusMainVoltSourceL / 2 + offset;
        }
        if (this instanceof Resistor){
            return mainResH / 2 + offset;
        }
        return null;
    }

    get hasIndications(){
        /* 
         * Свойство: возвращает true, если у элемента имеется значения для индикации. Иначе - false
         * 
         * @return {boolean} наличие значения для индикации.
         */
        if (this instanceof MeasureDevice){
            return true;
        }
        return false;
    }


    stopDrag(){
        /*
         * Фиксирует остановку перетаскивания элемента, изменяя соответсвующий атрибут.
         * Обновляет координаты старта перетаскивания.
         */
        this.xStart = this.x1;
        this.yStart = this.y1;
        this.isMoving = false;
    }

    checkPoint(xAbs, yAbs, xStart, yStart, isPressed){
        /*
         * Проверяет точку (xAbs, yAbs) на попадание в границы элемента с учетом нажатия ЛКМ.
         * Если точка (xAbs, yAbs) попадает в элемент, то он выделяется.
         * Если элемент выделен и нажата ЛКМ, то он перемещается вместе со своими узлами.
         * При попадании точки в узел, вращает элемент.
         * 
         * @param xAbs абсцисса курсора в СК окна.
         * @param yAbs ордината курсора в СК окна.
         * @param xStart абсцисса нажатия ЛКМ в СК окна.
         * @param yStart ордината нажатия ЛКМ в СК окна.
         * @param isPressed Нажата ли ЛКМ.
         */
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
            
            if (this.node1.selected | this.node2.selected){
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
        /* 
         * Проверяет точку (xAbs, yAbs) на попадание в узлы элемента с учетом нажатия ЛКМ.
         * 
         * @param xAbs абсцисса курсора в СК окна.
         * @param yAbs ордината курсора в СК окна.
         * @param isPressed Нажата ли ЛКМ.
         */
        for (let node of [this.node1, this.node2]){
            node.checkPoint(xAbs, yAbs, isPressed);
            if (node.selected) this.lastSelected = node;

            this.update = this.update | node.update;
            node.update = false;
        }
    }

    draw(ctx){
        /* 
         * Рисует элемент в контексте ctx.
         * 
         * @param ctx контекст рисования.
         */
        let element = new Path2D(this._path);
        if (this.selected){
            ctx.strokeStyle = SELECTED_COLOR;
            ctx.stroke(element);
        } else {
            ctx.strokeStyle = MAIN_COLOR;
            ctx.stroke(element)
        }

        this.node1.draw(ctx);
        this.node2.draw(ctx);

        this.drawValue(ctx);
    }

    
    drawValue(ctx){
        /* 
         * Рисует надпись возле элемента в контексте ctx.
         * 
         * @param ctx контекст рисования.
         */
        if (this.hasProperties | this.hasIndications){

            let x;
            let y;

            let text = this.normalisedValue + this.measurementUnits;
            
            switch (this._orientation % 180){

                case 0:
                    x = this.centerX * SCALE;
                    y = (this.centerY - this.textDistance) * SCALE;
                    ctx.textAlign = "center";
                break;

                case 90:
                    x = (this.centerX + this.textDistance) * SCALE;
                    y = this.centerY * SCALE;
                    ctx.textAlign = "left"
                break;
            }
            ctx.font = "bold italic 16px Arial";
            if (this instanceof MeasureDevice){
                ctx.fillStyle = NODE_COLOR;
            } else{
                ctx.fillStyle = MAIN_COLOR;
            }
            
            ctx.fillText(text, x, y);
        }
    }
    

    move(dx, dy){
        /* 
         * Изменяет координаты элемента на (dx, dy) отнсительно первоначального положения.
         * Автоматически пересчитывает путь рисования и дает команду на обновление отрисовки.
         * 
         * @param dx абсцисса сдвига в нашей собственной СК.
         * @param dy ордината свдига в нашей собственной СК. 
         */
        this.x1 = Math.round(this.xStart + dx);
        this.y1 = Math.round(this.yStart + dy);
        this._calcPath();
        this.update = true;
        if ((dx+dy)) this.isMoving = true;
    }

}


class ActiveElement extends BaseElement { //Абстрактный класс для всех элементов, кроме провода

    // Abstract class for active elements 
    // Includes: 
    // Element + orientation + calculating coordinates
    
    constructor(x, y, orientation, ctx) {
         /*
         * Конструктор класса. 
         * Вызывает конструктор родительского класса BaseElement.
         *
         * @param x абсцисса одного из узлов элемента в нашей собственной СК.
         * @param y ордината одного из узлов элемента в нашей собственной СК.
         * @param orientation ориетация элемента.
         * @param ctx контекст для рисования.
         */
        super(x, y);

        this._orientation = orientation;
        this._calcCoordinates();
        this._calcPath();

        this.draw(ctx);
    };

    set _orientation(value){
        /* 
         * Устанавливает и валидирует ориентацию элемента
         * Автоматически располагает угол в пределах 0 - 359 градусов
         * 
         * @param value угол элемента
         */
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
        /* 
         * Гетер для получения ориентации элемента.
         * 
         * {number} ориентация элемента.
         */
        return this.__orientation
    }

    get isInBranch(){
        /* 
         * Свойство: принадлежность элемента какой-либо ветви.
         * 
         * @return {boolean} наличие ветви.
         */
        return this.branch != null;
    }

    resetBranch(){
        /*
         * Сбрасывает текущую ветвь элемента
         * 
         */
        this.branch = null;
    }

    move(dx, dy){
        /* 
         * Изменяет координаты элемента на (dx, dy) и пересчитывает координаты остальных опорных точек.
         * 
         * @param {number} dx абсцисса смещения в нашей собственной СК.
         * @param {number} dy ордината смещения в нашей собственной СК.
         */
        super.move(dx, dy);
        this._calcCoordinates();
    }

    isInArea(xAbs, yAbs){
        /*
         * Проверяет точку (xAbs, yAbs) на попадание в провод элемента.
         * 
         * @param xAbs абсцисса в нашей СК окна. 
         * @param yAbs ордината в нашей СК окна.
         * 
         * @return true если точка попадает в границы, иначе - false.  
         */

        let x = Math.round((xAbs)/SCALE);
        let y = Math.round((yAbs)/SCALE);

        let inNode = this.node1.isInArea(x, y) | this.node2.isInArea(x, y);
        
        switch(this._orientation){

            case 0:
                return x > this.x1 & x < this.x2 & y == Math.round(this.y1) & y == Math.round(this.y2) | inNode;

            case 90:
                return y < this.y1 & y > this.y2 & x == this.x1 & x == this.x2 | inNode;
            
            case 180:
                return x < this.x1 & x > this.x2 & y == this.y1 & y == this.y2 | inNode;

            case 270:
                return y > this.y1 & y < this.y2 & x == this.x1 & x == this.x2 | inNode;
            
        }
    }

    rotate(x, y){
        /* 
         * При переходе точкой (x, y) критических углов изменяет координаты выделенного узла и пересчитывает путь.
         * 
         * @param {number} x абсцисса курсора в нашей собственной СК.
         * @param {number} y ордината курсора в нашей собственной СК.
         */

        if (this.node1.selected){

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

        if (this.node2.selected){

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
        /* 
         * Расчитывает координаты опорных точек элемента.
         */

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

        this.node1.setPoint(this.x1, this.y1);
        this.node2.setPoint(this.x2, this.y2);
    }
    
    stopDrag(){
         /*
         * Фиксирует остановку перетаскивания элемента.
         * Пересчитывает координаты опорных точек.
         * Пересчитывает путь рисования.
         */
        super.stopDrag();
        this._calcCoordinates();
        this._calcPath();
    }
}


class RoundElement extends ActiveElement{ //Абстрактный класс для круговых элементов цепи

    constructor(x, y, orientation, ctx){super(x, y, orientation, ctx)}

    _calcPath(){
        /* 
         * Расчитывает SVG для рисования кругового элемента с учетом ориентации.
         */

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
            /*
             * Проверяет точку (xAbs, yAbs) на попадание в тело кругового элемента с учетом проводов.
             * 
             * @param xAbs абсцисса в нашей СК окна. 
             * @param yAbs ордината в нашей СК окна.
             * 
             * @return true если точка попадает в границы, иначе - false.  
             */
        let x = Math.round((xAbs)/SCALE);
        let y = Math.round((yAbs)/SCALE);

        let distanceFromCenter = Math.sqrt(Math.pow(this.centerX - x, 2) + Math.pow(this.centerY - y, 2));

        return super.isInArea(xAbs, yAbs) | distanceFromCenter < mainRoundR;
    }
}


class MeasureDevice extends RoundElement{ //Абстрактный класс для измерительных приборов

    constructor(x, y, orientation, ctx){
        super(x, y, orientation, ctx);
    }

    draw(ctx){
        /* 
         * Расширенная версия рисования с измненными параметрами для измерительных приборов.
         * 
         * @param ctx контект рисования.
         */

        super.draw(ctx)
        let content = new Path2D(this._contentPath);
        ctx.lineWidth = 3;
        ctx.strokeStyle = NODE_COLOR;
        ctx.stroke(content);
        ctx.lineWidth = 4;
    }
}


class Resistor extends ActiveElement { //Класс резистора

    constructor(x, y, orientation, ctx) {
        super(x, y, orientation, ctx);
        this.resistance = 1;
    }

    _calcPath(){
        /* 
         * Расчитывает SVG для рисования резистора с учетом ориентации.
         */
        
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
        /*
         * Проверяет точку (xAbs, yAbs) на попадание в тело резистора с учетом проводов.
         * 
         * @param xAbs абсцисса в нашей СК окна. 
         * @param yAbs ордината в нашей СК окна.
         * 
         * @return true если точка попадает в границы, иначе - false.  
         */

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


class Key extends ActiveElement { //Класс ключа

    constructor(x, y, orientation, ctx) {
        super(x, y, orientation, ctx)
        this.state = false;
    }

    changeState(xAbs, yAbs){
        /*  
         * Изменяет состояние (вкл/выкл) при попадании точки в тело ключа.
         *  
         * @param xAbs абсцисса в нашей СК окна. 
         * @param yAbs ордината в нашей СК окна
         */

        if (this.isInBody(xAbs, yAbs)){

            this.state = !this.state;
            this._calcPath();
        }
    }

    _calcPath(){
        /* 
         * Расчитывает SVG для ключа с учетом ориентации и состояния. 
         */

        //SVG for drawing with params

        let x = this.x1;
        let y = this.y1;

        switch (this._orientation){

            case 0:
                this._path = `M ${x * SCALE} ${y * SCALE}
                h ${wireKeyL * SCALE}
                m ${mainKeyL * SCALE} 0
                h ${wireKeyL * SCALE}`;

                this._contentPath = this.state ? 
                `M ${(x + wireKeyL) * SCALE} ${y * SCALE - 3}
                h ${mainKeyL * SCALE}`
                :
                `M ${(x + wireKeyL) * SCALE} ${y * SCALE}
                l ${0.8 * mainKeyL * SCALE} ${-0.5 * mainKeyL * SCALE}`;
            break;

            case 90:
                this._path = `M ${x * SCALE} ${y * SCALE}
                v ${-wireKeyL * SCALE}
                m 0 -${mainKeyL * SCALE}
                v ${-wireKeyL * SCALE}`;

                this._contentPath = this.state ? 
                `M ${x * SCALE - 3} ${(y - wireKeyL) * SCALE}
                v ${-mainKeyL * SCALE}`
                :
                `M ${x * SCALE} ${(y - wireKeyL) * SCALE}
                l ${-0.5 * mainKeyL * SCALE} -${0.8 * mainKeyL * SCALE}`;
            break;

            case 180:
                this._path = `M ${x * SCALE} ${y * SCALE}
                h -${wireKeyL * SCALE}
                m -${mainKeyL * SCALE} 0
                h -${wireKeyL * SCALE}`;

                this._contentPath = this.state ? 
                `M ${(x - wireKeyL)* SCALE} ${y * SCALE + 3}
                h ${-mainKeyL * SCALE}`
                :
                `M ${(x - wireKeyL)* SCALE} ${y * SCALE}
                l -${0.8 * mainKeyL * SCALE} ${0.5 * mainKeyL * SCALE}`;
            break;

            case 270:
                this._path = `M ${x * SCALE} ${y * SCALE}
                v ${wireKeyL * SCALE}
                m 0 ${mainKeyL * SCALE}
                v ${wireKeyL * SCALE}`;
                
                this._contentPath = this.state ? 
                `M ${x * SCALE + 3} ${(y + wireKeyL) * SCALE}
                v ${mainKeyL * SCALE}`
                :
                `M ${x * SCALE} ${(y + wireKeyL) * SCALE}
                l ${0.5 * mainKeyL * SCALE} ${0.8 * mainKeyL * SCALE}`;
            break;
        }
    }

    isInBody(xAbs, yAbs){
        /*
         * Проверяет точку (xAbs, yAbs) на попадание в тело кругового элемента.
         * 
         * @param xAbs абсцисса в нашей СК окна. 
         * @param yAbs ордината в нашей СК окна.
         * 
         * @return true если точка попадает в границы, иначе - false.  
         */

        let x = Math.round((xAbs)/SCALE);
        let y = Math.round((yAbs)/SCALE);
        let inBody;

        switch (this._orientation){

            case 0:
                inBody = Math.abs(x - this.centerX) <= mainKeyL / 2;
                inBody = inBody & this.centerY - y <= mainKeyL / 2;
                inBody = inBody & this.centerY - y >= 0;
            break;

            case 90:
                inBody = Math.abs(y - this.centerY) <= mainKeyL / 2;
                inBody = inBody & this.centerX - x <= mainKeyL / 2;
                inBody = inBody & this.centerX - x >= 0;
            break;

            case 180:
                inBody = Math.abs(x - this.centerX) <= mainKeyL / 2;
                inBody = inBody & y - this.centerY <= mainKeyL / 2;
                inBody = inBody & y - this.centerY >= 0;
            break;

            case 270:
                inBody = Math.abs(y - this.centerY) <= mainKeyL / 2;
                inBody = inBody & x - this.centerX <= mainKeyL / 2;
                inBody = inBody & x - this.centerX >= 0;
            break;
        }
        return inBody;
    }

    isInArea(xAbs, yAbs){
        /*
         * Проверяет точку (xAbs, yAbs) на попадание в тело ключа с учетом проводов.
         * 
         * @param xAbs абсцисса в нашей СК окна. 
         * @param yAbs ордината в нашей СК окна.
         * 
         * @return true если точка попадает в границы, иначе - false.  
         */

        return super.isInArea(xAbs, yAbs) | this.isInBody(xAbs, yAbs);
    }

    draw(ctx){
        /* 
         * Расширенная версия рисования с измненными параметрами для ключа.
         * 
         * @param ctx контект рисования.
         */

        super.draw(ctx);

        let content = new Path2D(this._contentPath);

        ctx.strokeStyle = NODE_COLOR;
        ctx.stroke(content);
    }
}


class Lamp extends RoundElement { //Класс лампы

    constructor(x, y, orientation, ctx) {
        super(x, y, orientation, ctx);
        this.resistance = 1;
    }

    _calcPath(){
        /* 
         * Расчитывает SVG для лампы с учетом ориентации. 
         */

        //SVG for drawing with params

        super._calcPath();

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

    draw(ctx){
        /* 
         * Расширенная версия рисования с измненными параметрами для лампы с учетом состояния.
         * 
         * @param ctx контект рисования.
         */
        if (this.node1.globalNode && this.node2.globalNode){
            if (this.node1.globalNode.potential != null & this.node2.globalNode.potential != null){
                if (this.node1.globalNode.potential - this.node2.globalNode.potential != 0){
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.arc((this.centerX) * SCALE, this.centerY * SCALE, mainRoundR * SCALE, 0, 2 * Math.PI);
                    ctx.closePath();
                    ctx.fill();
                }  
            }
        }
        super.draw(ctx);
    }
}


class CurrentSource extends RoundElement{ //Класс ИТ

    constructor(x, y, orientation, ctx){
        super(x, y, orientation, ctx);
        this.current = 0.1;
    }

    _calcPath(){
        /* 
         * Расчитывает SVG для ИТ с учетом ориентации. 
         */

        //SVG for drawing with params

        super._calcPath();

        switch (this._orientation){

            case 0:
                this._path += `m ${-(1.5 * mainRoundR + wireRoundL) * SCALE} 0
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


class VoltageSource extends ActiveElement{ //Класс ИН

    constructor(x, y, orientation, ctx) {
        super(x, y, orientation, ctx);
        this.voltage = 5;
    }

    _calcPath(){
        /* 
         * Расчитывает SVG для ИН с учетом ориентации. 
         */
        
        //SVG for drawing with orientation

        let x = this.x1;
        let y = this.y1;

        switch (this._orientation){

            case 0:
                this._path = `M ${x * SCALE} ${y * SCALE} 
                h ${wireVoltSourceL * SCALE} 
                m 0 ${minMainVoltSourceL / 2 * SCALE} 
                v ${-minMainVoltSourceL * SCALE}
                m 0 ${minMainVoltSourceL / 2 * SCALE}
                m ${mainVoltSourceL * SCALE} 0
                m 0 ${plusMainVoltSourceL / 2 * SCALE} 
                v ${-plusMainVoltSourceL * SCALE}
                m 0 ${plusMainVoltSourceL / 2 * SCALE}
                h ${wireVoltSourceL * SCALE}`;
            break;

            case 90:
                this._path = `M ${x * SCALE} ${y * SCALE} 
                v ${-wireVoltSourceL * SCALE} 
                m ${minMainVoltSourceL / 2 * SCALE} 0
                h ${-minMainVoltSourceL * SCALE}
                m ${minMainVoltSourceL / 2 * SCALE} 0
                m 0 ${-mainVoltSourceL * SCALE}
                m ${plusMainVoltSourceL / 2 * SCALE} 0
                h ${-plusMainVoltSourceL * SCALE}
                m ${plusMainVoltSourceL / 2 * SCALE} 0
                v ${-wireVoltSourceL * SCALE}`;
            break;

            case 180:
                this._path = `M ${x * SCALE} ${y * SCALE} 
                h ${-wireVoltSourceL * SCALE} 
                m 0 ${minMainVoltSourceL / 2 * SCALE} 
                v ${-minMainVoltSourceL * SCALE}
                m 0 ${minMainVoltSourceL / 2 * SCALE}
                m ${-mainVoltSourceL * SCALE} 0
                m 0 ${plusMainVoltSourceL / 2 * SCALE} 
                v ${-plusMainVoltSourceL * SCALE}
                m 0 ${plusMainVoltSourceL / 2 * SCALE}
                h ${-wireVoltSourceL * SCALE}`;
            break;

            case 270:
                this._path = `M ${x * SCALE} ${y * SCALE} 
                v ${wireVoltSourceL * SCALE} 
                m ${minMainVoltSourceL / 2 * SCALE} 0
                h ${-minMainVoltSourceL * SCALE}
                m ${minMainVoltSourceL / 2 * SCALE} 0
                m 0 ${mainVoltSourceL * SCALE}
                m ${plusMainVoltSourceL / 2 * SCALE} 0
                h ${-plusMainVoltSourceL * SCALE}
                m ${plusMainVoltSourceL / 2 * SCALE} 0
                v ${wireVoltSourceL * SCALE}`;
            break;
        }
    }

    isInArea(xAbs, yAbs){
        /*
         * Проверяет точку (xAbs, yAbs) на попадание в тело ИН с учетом проводов.
         * 
         * @param xAbs абсцисса в нашей СК окна. 
         * @param yAbs ордината в нашей СК окна.
         * 
         * @return true если точка попадает в границы, иначе - false.  
         */


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


class Voltmetr extends MeasureDevice{ //Класс вольтметра

    constructor(x, y, orientation, ctx){super(x, y, orientation, ctx)}

    get indications(){
        /* 
         * Геттер для возврата напряжения на узлах вольтметра
         * 
         * @return {number} напряжение.
         */
        if (this.node1.globalNode && this.node2.globalNode){
            if (this.node1.globalNode.activeElementsNodes.length > 0 & this.node2.globalNode.activeElementsNodes.length > 0){
                if (this.node1.globalNode.potential != null & this.node2.globalNode.potential != null){
                    return Math.abs(this.node1.globalNode.potential - this.node2.globalNode.potential);
                }
            }
        }
        return 0;
    }

    _calcPath(){
        /* 
         * Расчитывает SVG для вольтметра с учетом ориентации. 
         */

        //SVG for drawing with params

        super._calcPath();

        switch (this._orientation){

            case 0:
                this._contentPath = `m ${(this.x2 - 1.3 * mainRoundR - wireRoundL) * SCALE} ${(this.y2 - 0.5 * mainRoundR) * SCALE}`;
            break;

            case 90:
                this._contentPath = `m ${(this.x2 - 0.3 * mainRoundR) * SCALE} ${(this.y2 + 0.5 * mainRoundR + wireRoundL) * SCALE}`;
            break;

            case 180:
                this._contentPath = `m ${(this.x2 + 0.7 * mainRoundR + wireRoundL) * SCALE} ${(this.y2 - 0.5 * mainRoundR) * SCALE}`;
            break;

            case 270:
                this._contentPath = `m ${(this.x2 -0.3 * mainRoundR) * SCALE} ${(this.y2 - 1.5 * mainRoundR - wireRoundL) * SCALE}`;
            break;
        }

        this._contentPath += `l ${0.3 * mainRoundR * SCALE} ${0.9 * mainRoundR * SCALE} 
        l ${0.3 * mainRoundR * SCALE} ${-0.9 * mainRoundR * SCALE}`;
    }
}


class Ampermetr extends MeasureDevice{ //Класс амперметра

    constructor(x, y, orientation, ctx){
        super(x, y, orientation, ctx);
    }

    set indications(value){
        this._indications = value;
    }

    get indications(){
        /* 
         * Геттер для возврата тока через амперметр.
         * 
         * @return {number} ток.
         */

        let value = 0; 
        if (this.node1.globalNode && this.node2.globalNode){
            if (this.node1.globalNode.potential != null & this.node2.globalNode.potential != null){
                value = this._indications;
            }
        }
        return Math.abs(value);
    }
    
    _calcPath(){
        /* 
         * Расчитывает SVG для амперметра с учетом ориентации. 
         */

        //SVG for drawing with params

        super._calcPath();

        switch (this._orientation){

            case 0:
                this._contentPath = `M ${(this.x2 - 1.3 * mainRoundR - wireRoundL) * SCALE} ${(this.y2 + 0.5 * mainRoundR) * SCALE}`;
            break;

            case 90:
                this._contentPath = `M ${(this.x2 - 0.3 * mainRoundR) * SCALE} ${(this.y2 + 1.5 * mainRoundR + wireRoundL) * SCALE}`;
            break;

            case 180:
                this._contentPath = `M ${(this.x2 + 0.7 * mainRoundR + wireRoundL) * SCALE} ${(this.y2 + 0.5 * mainRoundR) * SCALE}`;
            break;

            case 270:
                this._contentPath = `M ${(this.x2 - 0.3 * mainRoundR) * SCALE} ${(this.y2 - 0.5 * mainRoundR - wireRoundL) * SCALE}`;
            break;
        }
        this._contentPath += `l ${0.3 * mainRoundR * SCALE} ${-mainRoundR * SCALE} 
        l ${0.3 * mainRoundR * SCALE} ${mainRoundR * SCALE}
        m ${-0.1 * mainRoundR * SCALE} ${-0.3 * mainRoundR * SCALE}
        h ${-0.4 * mainRoundR * SCALE}`;
    }
}


class Ommetr extends MeasureDevice{ //Класс омметра

    constructor(x, y, orientation, ctx){super(x, y, orientation, ctx)}

    set indications(value){
        this._indications = value;
    }

    get indications(){
        /* 
         * Геттер для возврата сопротивления между концами омметра.
         * 
         * @return {number} сопротивление.
         */

        let value = 0; 
        if (this.node1.globalNode && this.node2.globalNode){
            value = this._indications;
            return Math.abs(value);
        } else return Infinity;
        
    }

    _calcPath(){
        /* 
         * Расчитывает SVG для омметра с учетом ориентации. 
         */

        //SVG for drawing with params

        super._calcPath();

        switch (this._orientation){

            case 0:
                this._contentPath = `M ${(this.x2 - 1.6 * mainRoundR - wireRoundL) * SCALE} ${(this.y2 + 0.4 * mainRoundR) * SCALE}`;
            break;

            case 90:
                this._contentPath = `M ${(this.x2 - 0.6 * mainRoundR) * SCALE} ${(this.y2 + 1.4 * mainRoundR + wireRoundL) * SCALE}`;
            break;

            case 180:
                this._contentPath = `M ${(this.x2 + 0.4 * mainRoundR + wireRoundL) * SCALE} ${(this.y2 + 0.4 * mainRoundR) * SCALE}`;
            break;

            case 270:
                this._contentPath = `M ${(this.x2 - 0.6 * mainRoundR) * SCALE} ${(this.y2 - 0.6 * mainRoundR - wireRoundL) * SCALE}`;
            break;
        }
        this._contentPath += `h ${0.35 * mainRoundR * SCALE}
        a ${0.5 * mainRoundR * SCALE} ${0.5 * mainRoundR * SCALE} 0 1 1 ${0.5 * mainRoundR * SCALE} 0
        h ${0.35 * mainRoundR * SCALE}`;
    }
}


class Wire extends BaseElement{ //Класс провода

    constructor(x1, y1, x2, y2, ctx) {
        super(x1, y1, ctx);
        this.x2 = x2;
        this.y2 = y2;

        this.selected = true;
        this.node2.selected = true;
        this.lastSelected = this.node2;

        this.x2Start = this.x2;
        this.y2Start = this.y2;

        this._calcPath();
        this.draw(ctx);
    }

    set selected(value){
        /*
         * Сетер для установки параметра выделения провода. 
         * 
         * @param value значение выделения.
         */
        super.selected = value;

        this.x2Start = this.x2;
        this.y2Start = this.y2;
    }

    get selected(){
        return super.selected;
    }

    rotate(x, y){
        /* 
         * Изменяет координаты выделенного узла на (x, y).
         * 
         * @param {number} x абсцисса курсора в нашей собственной СК.
         * @param {number} y ордината курсора в нашей собственной СК.
         */
        if (this.node1.selected){
            this.x1 = x;
            this.y1 = y;
            this.update = true;
        }

        if (this.node2.selected){
            this.x2 = x;
            this.y2 = y;
            this.update = true;
        }

        if (this.update) {
            this._calcPath();
        }
    }

    _calcPath(){
        /* 
         * Рассчитывает SVG для провода.
         */
        this._path = `M${this.x1*SCALE} ${this.y1*SCALE}
        L${this.x2*SCALE} ${this.y2*SCALE}`

        this.node1.setPoint(this.x1, this.y1);
        this.node2.setPoint(this.x2, this.y2);
    }
    
    isInArea(xAbs, yAbs){
        /*
         * Проверяет точку (xAbs, yAbs) на попадание в провод.
         * 
         * @param xAbs абсцисса в нашей СК окна. 
         * @param yAbs ордината в нашей СК окна.
         * 
         * @return true если точка попадает в границы, иначе - false.  
         */


        let x = Math.round((xAbs)/SCALE);
        let y = Math.round((yAbs)/SCALE);

        let inNode = this.node1.isInArea(x, y) | this.node2.isInArea(x, y);

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
        /* 
         * Изменяет координаты провода на (dx, dy) и пересчитывает координаты остальных опорных точек.
         * 
         * @param {number} dx абсцисса смещения в нашей собственной СК.
         * @param {number} dy ордината смещения в нашей собственной СК.
         */
        this.x1 = this.xStart + dx;
        this.y1 = this.yStart + dy;
        this.x2 = this.x2Start + dx;
        this.y2 = this.y2Start + dy;
        this._calcPath();
        this.update = true;
        if ((dx+dy)) this.isMoving = true;
    }
}


class Layout{ //Класс макета

    constructor(){
        /* 
         * Конструктор класса макета для проектирования схем.
         * 
         * Создаёт пустые списки-атрибуты: 
         * элементы макета, 
         * новые элементы макета, 
         * девайсы (источники, измерительные приборы)
         * 
         * Получает контекст для рисования, производит изначальные настройки.
         */

        this.elements = [];
        this.newElements = [];
        this.devices = [];

        this._isPressed = false;
        this._isPressedRight = false;

        this.lastSelected = null;
        this.lastSelectedNew = null;
        this.newWire = null;

        this.xStart;
        this.yStart;

        this.canvas = document.getElementById('layout');

        this.calcSize();
        this.ctxSetup();
        this._createNewElements();

        this.invalidate();
    }

    changeSize(){
        /* 
         * Изменяет размеры макета в соответствии с размерами окна.
         */
        this.calcSize();
        this.ctxSetup();
        this._createNewElements();
        this.invalidate();
    }

    calcSize(){
        /* 
         * Расчитывает координаты новых элементов и опорные точки макета.
         */

        this.height = document.body.clientHeight;
        this.width = document.body.clientWidth;

        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;

        this.leftLineX = Math.round((ELEMENT_LENGTH + 6) * SCALE);

        this.newRespX = 3;

        this.newKeyRespY = (this.height / SCALE / 16);

        this.newResistorRespY = (this.height / SCALE / 8 + this.height / SCALE / 16);

        this.newLampRespY = (2 * this.height / SCALE / 8 + this.height / SCALE / 16);

        this.newVoltSourceRespY = (3 * this.height / SCALE / 8 + this.height / SCALE / 16);
        
        this.newCurrentSourceRespY = (4 * this.height / SCALE / 8 + this.height / SCALE / 16);

        this.newVoltmetrRespY = (5 * this.height / SCALE / 8 + this.height / SCALE / 16);

        this.newAmpermetrRespY = (6 * this.height / SCALE / 8 + this.height / SCALE / 16);
        
        this.newOmmetrRespY = (7 * this.height / SCALE / 8 + this.height / SCALE / 16);
    }

    ctxSetup(){
        /* 
         * Производит настройку контекста рисования.
         */

        this.ctx = this.canvas.getContext('2d');
        this.ctx.lineWidth = 4;
    }

    checkPoint(xAbs, yAbs){
        /* 
         * Проверяет точку (xAbs, yAbs) на попадание во все элементы.
         * При попадании точки выполняет манипуляции с элементами и вызывает перерисовку макета.
         * 
         * @param xAbs абсцисса в нашей собственной СК.
         * @param yAbs ордината в нашей собственной СК. 
         */
        
        let update = false;

        if (this._isPressedRight){
            let x = Math.round((xAbs)/SCALE);
            let y = Math.round((yAbs)/SCALE);
            this.newWire.rotate(x, y);
            update = update | this.newWire.update;

        } else {
            let shouldCheckNew = true;
            let shouldCheck= true;

            if (this.lastSelectedNew){
                shouldCheck = !this.lastSelectedNew.selected;
            }
            if (this.lastSelected){
                shouldCheckNew = !this.lastSelected.selected;
            }

            if (shouldCheckNew){
                if (this.lastSelectedNew){
                    update = update | this._checkLastSelectedNew(xAbs, yAbs);
                } else {
                    update = update | this._checkNewElements(xAbs, yAbs);
                }
            }
            if (shouldCheck){
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
        /* 
         * Проверяет точку (xAbs, yAbs) на попадание в последний выбранный новый элемент.
         * 
         * @param xAbs абсцисса в нашей собственной СК.
         * @param yAbs ордината в нашей собственной СК. 
         * 
         * @return {boolean} true, если необходима перерисовка, иначе - false.
         */

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
               /* 
         * Проверяет точку (xAbs, yAbs) на попадание в последний выбранный элемент макета.
         * 
         * @param xAbs абсцисса в нашей собственной СК.
         * @param yAbs ордината в нашей собственной СК. 
         * 
         * @return {boolean} true, если необходима перерисовка, иначе - false.
         */

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
        /* 
         * Проверяет точку (xAbs, yAbs) на попадание в новые элементы.
         * 
         * @param xAbs абсцисса в нашей собственной СК.
         * @param yAbs ордината в нашей собственной СК. 
         * 
         * @return {boolean} true, если необходима перерисовка, иначе - false.
         */

        let update = false;
        let isAnySelected = false;

        for (let element of this.newElements){
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
        /* 
         * Проверяет точку (xAbs, yAbs) на попадание в элементы на макете.
         * 
         * @param xAbs абсцисса в нашей собственной СК.
         * @param yAbs ордината в нашей собственной СК. 
         * 
         * @return {boolean} true, если необходима перерисовка, иначе - false.
         */

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
        /* 
         * Выполняет перерисовку макета.
         */
        this.ctx.fillStyle = BACK_COLOR;
        this.ctx.fillRect(0,0,window.innerWidth,window.innerHeight);
        
        for (let element of this.elements){
            element.draw(this.ctx);
        }

        if (this.lastSelected) this.lastSelected.draw(this.ctx);
        if (this.newWire) this.newWire.draw(this.ctx);

        for (let element of this.newElements){
            element.draw(this.ctx);
        }
        this.ctx.strokeStyle = MAIN_COLOR;
        this.ctx.stroke(new Path2D(`M ${this.leftLineX} 0 l 0 ${this.height}`));
    }

    mouseClick(xAbs, yAbs){
        /* 
         * Запоминает координаты нажатия ЛКМ на выбранном элементе.
         * 
         * @param xAbs абсцисса в нашей собственной СК.
         * @param yAbs ордината в нашей собственной СК.
         */

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
        /* 
         * Запоминает координаты нажатия ПКМ на макете и создаёт новый провод.
         * 
         * @param xAbs абсцисса в нашей собственной СК.
         * @param yAbs ордината в нашей собственной СК.
         */

        this.xStart = xAbs - this.canvas.offsetLeft;
        this.yStart = yAbs - this.canvas.offsetTop;

        this._isPressedRight = true;
        let x = Math.round((xAbs)/SCALE);
        let y = Math.round((yAbs)/SCALE);
        this.newWire = new Wire(x, y, x, y, this.ctx);
    }

    rightRelease(xAbs, yAbs){
        /* 
         * Завершает создание нового провода. Помещает провод в список элементов макета.
         */

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
    }x

    mouseRelease(){
        /* 
         * Завершает перетаскивание выделенного элемента.
         * Проверяет новые координаты элемента на выход за границы.
         */

        this._isPressed = false;
        if (this.lastSelected) {
            this.lastSelected.stopDrag()
            if (this.lastSelected.centerX * SCALE <= this.leftLineX | 
                this.lastSelected.centerY * SCALE <= 0 | 
                this.lastSelected.centerX * SCALE >= this.width |
                this.lastSelected.centerY * SCALE >= this.height){
                this.deleteItem();
            }
        };
        if (this.lastSelectedNew) this.lastSelectedNew.stopDrag();
        this._checkNewElementsPosition();
    }

    _checkNewElementsPosition(){
        /* 
         * Проверяет координаты новых элементов. Если они расположены на макете, то добавляет их в массив элементов.
         * Пересоздаёт новые элементы 
         */
        if (this.lastSelectedNew){
            if (this.lastSelectedNew.x1 > this.leftLineX/SCALE & this.lastSelectedNew.x2 > this.leftLineX/SCALE){
                this.elements.push(this.lastSelectedNew);
                this.lastSelected = this.lastSelectedNew;
                this.lastSelectedNew = null;
            }
            this._createNewElements();
            this.invalidate();  
        }
    }

    _createNewElements(){
        /* 
         * Создает новые элементы на левой панели.
         */
        this.newElements = [];
        this.newElements.push(new Key(this.newRespX, this.newKeyRespY, 0, this.ctx));
        this.newElements.push(new Resistor(this.newRespX, this.newResistorRespY, 0, this.ctx));
        this.newElements.push(new Lamp(this.newRespX, this.newLampRespY, 0, this.ctx));

        let ampermetr = true;
        let voltmetr = true;
        let ommetr = true;
        let voltage = true;
        let current = true;

        for (let element of this.elements){
            if (element instanceof Voltmetr) voltmetr = false;
            if (element instanceof Ommetr) ommetr = false;
            if (element instanceof Ampermetr) ampermetr = false;
            if (element instanceof VoltageSource) voltage = false;
            if (element instanceof CurrentSource) current = false;
        }

        if (voltage)
        this.newElements.push(new VoltageSource (this.newRespX, this.newVoltSourceRespY, 0, this.ctx));
        if (current)
        this.newElements.push(new CurrentSource (this.newRespX, this.newCurrentSourceRespY, 0, this.ctx));
        if (voltmetr)
        this.newElements.push(new Voltmetr (this.newRespX, this.newVoltmetrRespY, 0, this.ctx));
        if (ampermetr)
        this.newElements.push(new Ampermetr (this.newRespX, this.newAmpermetrRespY, 0, this.ctx));
        if (ommetr)
        this.newElements.push(new Ommetr (this.newRespX, this.newOmmetrRespY, 0, this.ctx));
    }

    deleteItem(){
        /*  
         * Удаляет выделенный элемент с макета.
         */

        if (this.lastSelected){
            if (this.lastSelected.selected){
                for (let index = 0; index < this.elements.length; index++){
                    if (this.elements[index].selected){
                        this.elements.splice(index, 1)
                        this.lastSelected = this.elements[this.elements.length - 1];
                        this._createNewElements();
                        this.invalidate();
                    }
                }
            }
        }
    }
}


class CircuitCalc{ //Класс расчета цепи

    constructor(){

        this.nodes = [];
        this.branches = [];

        this.baseNode = null;
        this.knownNode = null;

    };

    _checkShort(element){
        /* 
         * Для короткозамкнутых между собой узлов элементов (провод и замкнутый ключ) создает сущность одного узла на макете
         * Если элемент подключен к существующему узлу макета, то он просто добавляется в этот узел.
         * 
         * @param {BaseElement} element - элемент, узлы котрого проверяются. 
         */

        //Check and add Wires + short Keys

        let added = false;

        for (let node of this.nodes){                    
            added = added | node.checkShortNodes(element);
        }
        if(!added){
            this.nodes.push(new SameNode([element.node1, element.node2]));
        }
    }

    _checkNotShort(element){
        /* 
         * Для некороткозамкнутых элементов создает сущность одного узла на макете
         * Если элемент один из узлов элемента подключен к существующему узлу макета, то он просто добавляется в этот узел.
         * 
         * @param {ActiveElement} element - элемент, узлы котрого проверяются. 
         */

        //Check not short elements

        let node1Added = false;
        let node2Added = false;

        for (let node of this.nodes){
            node1Added = node1Added | node.checkElementNode(element.node1);
            node2Added = node2Added | node.checkElementNode(element.node2);
        }

        if (!node1Added){
            this.nodes.push(new SameNode(element.node1));
        }
        if (!node2Added){
            this.nodes.push(new SameNode(element.node2));
        }
    }

    _checkWiresAndKeys(elements){
        /* 
         * Добавляет узлы ключей и проводов (амперметр считается проводом) в список узлов макета.
         * 
         * @param {Array} elements список элементов макета.
         */ 

        this.ampermetr = null;

        for (let element of elements){
            if (element instanceof Wire | element instanceof Ampermetr){
                this._checkShort(element)
            }
            if (element instanceof Ampermetr){
                this.ampermetr = element;
            }
            if (element instanceof Key){
                if (element.state){
                    this._checkShort(element)
                } else{
                    this._checkNotShort(element)
                }
            }
        }

    }

    tryLinkShortWires(){
        /* 
         * Сводит устранимые узлы, соединенные проводами к одному узлу
         */

        for (let i = 0; i <= this.nodes.length; i++){
            for (let index1 = 0; index1 < this.nodes.length; index1++){
                for (let index2 = index1 + 1; index2 < this.nodes.length; index2++){                    
                    if(this.nodes[index1].tryLink(this.nodes[index2])){
                        this.nodes.splice(index2, 1);
                    }
                }
            }
        }
    }

    calcNodes(elements){
        /* 
         * Создает список узлов цепи, объединяя короткозамкнутые узлы в один.
         * 
         * @param {Array} elements - массив элементов на макете
         */

        this.nodes = [];

        this._checkWiresAndKeys(elements);
        this.tryLinkShortWires();

        for (let element of elements){
            if (element instanceof Ommetr){
                this.ommetr = element;
            }
            if (!(element instanceof Wire) & !(element instanceof Key)& !(element instanceof Ampermetr)){
                this._checkNotShort(element);
                element.resetBranch();
            }
        }

        for (let node of this.nodes){
            node.tryOptimize();
        }
    }

    calcBranches(){
        /* 
         * Создает список ветвей цепи.
         */

        this.branches = [];

        for (let sameNode of this.nodes){
            if (sameNode.isUnrecoverable){
                for (let activeElementNode of sameNode.activeElementsNodes){

                    let currentNode = activeElementNode;
                    if (currentNode.element.isInBranch){
                        continue;
                    }
                    let branchElements = [];

                    while (1){
                        branchElements.push(currentNode.element);
                        
                        if (currentNode.otherNode.globalNode.isBreak){
                            break;
                        }
                        if (currentNode.otherNode.globalNode == sameNode){
                            sameNode.cicles += 1;
                            break;
                        }
                        if (currentNode.otherNode.globalNode.isUnrecoverable){
                            this.branches.push(new Branch(sameNode, currentNode.otherNode.globalNode, branchElements));
                            break;
                        }
                        currentNode = currentNode.nextElementNode;
                    }
                }
            }
        }
    }

    makeMatix(G, I, nodesForCalc){
        /* 
         * Создает матрицу проводимостей (G) и вектор токов (I) из списка узлов, которые участвуют в построении цепи
         * 
         * @param {Array} G - массив, в который запишется матрица проводимостей.
         * @param {Array} I - вектор, в который запишутся токи.
         */

        let rowIndex = 0;

        for (let i = 0; i < nodesForCalc.length; i++){
            if (nodesForCalc[i] == this.knownNode){
                continue;
            }

            G.push(new Array());
            I.push(0);
            for (let j = 0; j < nodesForCalc.length; j++){

                let g = 0;

                if (i == j){
                    for (let branch of nodesForCalc[i].branches){
                        let conductivity = (branch.resistance ** (-1));
                        if (conductivity != Infinity){
                            g += conductivity;
                        }
                    }
                }else{
                    for (let branch of nodesForCalc[i].branches){
                        if (branch.sameNode2 == nodesForCalc[j] | branch.sameNode1 == nodesForCalc[j]){
                            let conductivity = (branch.resistance ** (-1));
                            if (conductivity != Infinity){
                                g -= conductivity;
                            }
                        }
                    }
                }

                if (nodesForCalc[j] == this.knownNode){
                    I[rowIndex] = (- g) * this.knownNode.potential;
                }else{
                    G[rowIndex].push(g);
                }
            }

            let nominal = 0;
            let isPlus = false;
            let isMinus = false;

            for (let branch of nodesForCalc[i].branches){
                for (let element of branch.elements){
                    if (element instanceof CurrentSource){

                        nominal = element.current;
                        let currentNode = element.node2;
                        isPlus = false;
                        isMinus = false;

                        while (1){
                            if (currentNode.globalNode.isUnrecoverable){
                                if (currentNode.globalNode == nodesForCalc[i]){
                                    isPlus = true;
                                }
                                break;
                            }
                            currentNode = currentNode.sameNodeElement.otherNode;
                        }

                        currentNode = element.node1;

                        while (1){
                            if (currentNode.globalNode.isUnrecoverable){
                                if (currentNode.globalNode == nodesForCalc[i]){
                                    isMinus = true;
                                }
                                break;
                            }
                            currentNode = currentNode.sameNodeElement.otherNode;
                        }
                        if ((isPlus | isMinus) & !(isPlus&isMinus)){
                            I[rowIndex] += isPlus ? nominal: -nominal;
                        }
                        else {
                            alert ('Неразбериха!')
                        }
                    }
                }
            }

            rowIndex++;
        }
    }

    calcUnrecoverableNodes(){
        /* 
         * Расчитывает потенциалы неустранимых узлов цепи.
         */

        let G = [];
        let I = [];
        let deltas = [];

        let nodesForCalc = [];

        for (let node of this.nodes){
            if (node.isUnrecoverable & node != this.baseNode){
                nodesForCalc.push(node);
            }
        }
        this.makeMatix(G, I, nodesForCalc);

        console.log(G);
        console.log(I);

        if (G.length > 0){
            for (let column = 0; column < G.length; column++){
                let tempMatrix = JSON.parse(JSON.stringify(G));
                for (let row = 0; row < tempMatrix.length; row++){
                    tempMatrix[row][column] = I[row];
                }
                deltas.push(det(tempMatrix));
            }

            let delta = det(G);
            let index = 0;

            for (let node of nodesForCalc){
                if (node == this.knownNode){
                    continue;
                }
                node.potential = deltas[index]/delta;
                index++;
            }
        }
    }

    calc(elements){
        /* 
         * Расчитывает всю цепь на основе метода узловых потенциалов.
         * 
         * @param {Array} elements элементы на макете
         */
        this.calcNodes(elements);
        this.calcBranches();

        let isVoltageSource = false;
        let isCurrentSource = false;

        this.knownNode = null;
        this.baseNode = null;

        for (let element of elements){
            if (element instanceof VoltageSource){
                isVoltageSource = true;
                element.node1.globalNode.potential = 0;
                this.baseNode = element.node1.globalNode;
                element.node2.globalNode.potential = element.nominal;
                this.knownNode =  element.node2.globalNode;
            }
            if (element instanceof CurrentSource){
                isCurrentSource = true;
            }
        }

        if (!isVoltageSource){
            for (let node of this.nodes){
                if (node.isUnrecoverable){
                    this.baseNode = node;
                    this.baseNode.potential = 0;
                    break;
                }
            }  
        }

        //TODO Если 0 веток и есть ИТ от сделать его узлы неустранимыми и пересчитать ветки
        
        console.log(this.nodes);
        console.log(this.branches);
        if (isVoltageSource | isCurrentSource){
            this.calcUnrecoverableNodes();
            this.calcRecoverableNodes();
            this.setAmpermetrValue();
        }
        this.setOmmetrValue();
        console.log(this.nodes);
    }

    calcRecoverableNodes(){
        /* 
         * Расчитывает потенциалы устранимых узлов цепи.
         */
        for (let branch of this.branches){
            if (branch.elements[0] instanceof VoltageSource | branch.elements[0] instanceof CurrentSource){
                continue;
            }
            let startNode;
            branch.current = Math.abs((branch.sameNode1.potential - branch.sameNode2.potential) / branch.resistance);
            for (let activeElementNode of branch.fromNode.activeElementsNodes){
                for (let element of branch.elements){
                    if (activeElementNode.element == element){
                        startNode = activeElementNode;
                        break;
                    }
                }
            }

            let currentNode = startNode;
 
            while (1){
                if (currentNode.otherNode.globalNode.isUnrecoverable){
                    break;
                }
                if (currentNode.element instanceof Lamp | currentNode.element instanceof Resistor){
                    currentNode.otherNode.globalNode.potential = currentNode.globalNode.potential + branch.current * currentNode.element.resistance;
                }
                currentNode = currentNode.nextElementNode;
            }

        }
    }

    setAmpermetrValue(){
        /* 
         * Устанавливает амперметру на макете значение тока, если он существует.
         */
        if (this.ampermetr){
            this.ampermetr.indications = this.calcAmpermetrValue(this.ampermetr.node1.globalNode);
        }
    }

    setOmmetrValue(){
        /* 
         * Устанавливает омметру на макете значение сопротивления, если он существует.
         */
        if (this.ommetr){
            this.ommetr.indications = this.calcOmmetrValue(this.ommetr.node1.globalNode, this.ommetr.node2.globalNode);
        }
    }

    calcAmpermetrValue(sameNode){
        /* 
         * Расчитывает алгеьраическую сумму токов, которые втекают и вытекают из узла. 
         * Ток амперметра находится по закону токов Кирхгофа.
         * 
         * @param {SameNode} sameNode - один из узлов амперметра.
         * 
         * @return {Number} ток амперметра
         */
        let nodes = [];
        let activeElementsNodes = [];
        let sameNodes = [];
        
        for (let node of sameNode.nodes){
            if (!(node.element instanceof Ampermetr)){ 
                nodes.push(node);
            }
        }
        
        for (let activeElementNode of sameNode.activeElementsNodes){
            activeElementsNodes.push(activeElementNode);
        }       

        for (let node of nodes){
            let added = false;
            for (let currentSameNode of sameNodes){
                added = added | currentSameNode.checkShortNodes(node.element, false);
            }
            if(!added){
                sameNodes.push(new SameNode(node, false));
            }
        }

        for (let i = 0; i <= sameNodes.length; i++){
            for (let index1 = 0; index1 < sameNodes.length; index1++){
                for (let index2 = index1 + 1; index2 < sameNodes.length; index2++){                    
                    if(sameNodes[index1].tryLink(sameNodes[index2]), false){
                        sameNodes.splice(index2, 1);
                    }
                }
            }
        }

        for (let activeElementNode of activeElementsNodes){
            let nodeAdded = false;

            for (let sameNode of sameNodes){
                nodeAdded = nodeAdded | sameNode.checkElementNode(activeElementNode, false);
            }
            if (!nodeAdded){
                sameNodes.push(new SameNode(activeElementNode, false));
            }
        }
        let value = 0;

        for (let sameNode of sameNodes){
            for (let activeElementNode of sameNode.activeElementsNodes){
                if (activeElementNode.element.branch){
                    if (activeElementNode.element.branch.current){
                        if (activeElementNode.element instanceof CurrentSource){
                            if (activeElementNode.globalNode.potential < activeElementNode.otherNode.globalNode.potential){
                                value -= activeElementNode.element.branch.current
                            } else{
                                value += activeElementNode.element.branch.current
                            }
                        } else{
                            if (activeElementNode.globalNode.potential < activeElementNode.otherNode.globalNode.potential){
                                value += activeElementNode.element.branch.current
                            } else{
                                value -= activeElementNode.element.branch.current
                            }
                        }
                    }
                }
            }
            if (value == Infinity | value == 0){
                value = 0;
                continue;
            } else return value;
        }
        return 0;
    }

    calcOmmetrValue(node1, node2){
        /* 
         * Расчитывает сопротивление между узлами node1 и node2 на основе теории графов.
         * Частично используется алгоритм Дейкстры и поиск в ширину.
         * 
         * @param {SameNode} node1 первый узел, к котрому подключен омметр.
         * @param {SameNode} node2 второй узел, к котрому подключен омметр.
         * 
         * @return {Number} сопротивление между точками
         */
        for (let node of this.nodes){
            for (let activeElementNode of node.activeElementsNodes){
                if (activeElementNode.element instanceof VoltageSource){
                    continue;
                }
                let edge = new Edge(activeElementNode.element); 
                for (let neighbourNode of activeElementNode.otherNode.globalNode.neighbourNodes){
                    if (neighbourNode['edge'].element == activeElementNode.element){
                        edge = neighbourNode[edge];
                    }
                }
                node.neighbourNodes.push({'node': activeElementNode.otherNode.globalNode, 'edge': new Edge(activeElementNode.element)})
            }
        }

        node1.resistance = 0;
        let queue = [node1];

        while(queue.length){
            
            let activeNode = queue.shift();

            for (let neighbourNode of activeNode.neighbourNodes){
                if (!(neighbourNode['edge'].calced)){
                    neighbourNode['edge'].calced = true;

                    if (neighbourNode['node'] != node2){
                        queue.push(neighbourNode['node']);
                    }

                    if (neighbourNode['node'].resistance == Infinity){
                        neighbourNode['node'].resistance = activeNode.resistance + neighbourNode['edge'].resistance;
                    } else {
                        if (neighbourNode['edge'].resistance){
                            neighbourNode['node'].resistance = neighbourNode['node'].resistance * (neighbourNode['edge'].resistance + activeNode.resistance) / (neighbourNode['node'].resistance + neighbourNode['edge'].resistance + activeNode.resistance)
                        } else{
                            neighbourNode['node'].resistance = activeNode.resistance;
                        }
                    }
                }
            }
        }
        return node2.resistance;
    }
}


class Edge{ //Класс ребра графа (ветвь между неустранимыми узлами)
    constructor(element){
        this.element = element;
        this.calced = false;
    }

    get resistance(){
        /* 
         * Возвращает сопротивление ребра (ветви)
         */
        let resistance = 0;
        if (this.element instanceof Lamp | this.element instanceof Resistor){
            resistance = this.element.resistance;
        }
        return resistance;
    }
}


class SameNode{ //Класс узла макета

    constructor(arg, shouldRemember=true){
        /* 
         * Конструктор класса узла макета
         * 
         * @param {Array|Node} arg - один или два узла элемента.
         * @param {Boolean} shouldRemember (default=true) флаг на запоминание узлом элемента принадлежности к узлу макета.
         */ 

        this.nodes = [];
        this.activeElementsNodes = [];
        this.branches = [];
        this.potential = null;
        this.cicles = 0;
        this.neighbourNodes = [];
        this.resistance = Infinity;
        this.visited = false;

        if (arg instanceof Array){
            for (let node of arg){
                this.nodes.push(node);
                if (shouldRemember) node.globalNode = this;
            }
        }else{ 
            if (arg.element instanceof Key | arg.element instanceof Voltmetr | arg.element instanceof Ampermetr | arg.element instanceof Ommetr){
                this.nodes.push(arg);     
            }else{
                this.activeElementsNodes.push(arg);
            }
            if (shouldRemember) arg.globalNode = this;
        }
    }

    get isUnrecoverable(){
        /* 
         * Возвращает true, если узел неустранимый или к нему подключен источник.
         */
        if (this.activeElementsNodes.length  >= 3){
            return true;
        }
        if (this.activeElementsNodes.length == 2){
            for (let node of this.activeElementsNodes){
                if (node.element instanceof VoltageSource | node.element instanceof CurrentSource){
                    return true
                }
            }
        }
        return false;
    }

    get isBreak(){
        /* 
         * Возвращает true, если к узлу подключено меньше некороткозамкнутых элементов цепи.
         */
        return this.activeElementsNodes.length <= 1;
    }

    checkShortNodes(wire, shouldRemember=true){
        /* 
         * Проверяет короткозамкнутый элемент на связь с настоящим узлом макета.
         * 
         * @param {BaseElement} wire - короткозамкнутый элемент.
         * @param {Boolean} shouldRemember (default=true) флаг на запоминание узлом элемента принадлежности к узлу макета.
         * 
         * @return {Boolean} true, если узлы элемента добавлены к настоящему узлу макета. Иначе - fasle.
         */

        if (this.containsPoint(wire.node1)){
            this.nodes.push(wire.node1, wire.node2);
            if (shouldRemember) wire.node1.globalNode = this;
            if (shouldRemember) wire.node2.globalNode = this;
            return true;
        }

        if (this.containsPoint(wire.node2)){
            this.nodes.push(wire.node1, wire.node2);
            if (shouldRemember) wire.node1.globalNode = this;
            if (shouldRemember) wire.node2.globalNode = this;
            return true;
        }

        return false;
    }

    checkElementNode(node, shouldRemember=true){
        /* 
         * Проверяет узел элемента на связь с настоящим узлом макета.
         * 
         * @param {Node} node - узел элемента.
         * @param {Boolean} shouldRemember (default=true) флаг на запоминание узлом элемента принадлежности к узлу макета.
         * 
         * @return {Boolean} true, если узел элемента добавлен к настоящему узлу макета. Иначе - fasle.
         */

        if (this.containsPoint(node)){

            if (shouldRemember) node.globalNode = this;

            if (node.element instanceof Key | node.element instanceof Voltmetr | node.element instanceof Ommetr){
                this.nodes.push(node);
                return true;
            }

            this.activeElementsNodes.push(node);
            return true;
        }
        return false;
    }

    tryLink(sameNode, shouldRemember=true){
        /* 
         * Проверяет связь узла макета sameNode с настоящим узлом макета.
         * При возможности совместить, совмещает эти узлы.
         * 
         * @param {SameNode} sameNode проверяемый узел.
         * @param {Boolean} shouldRemember (default=true) флаг на запоминание узлом элемента принадлежности к узлу макета.
         * 
         * @return {Boolean} true, если узлы совмещены. Иначе - fasle.
         */

        let shouldAdd = false;

        for (let node of sameNode.nodes){
            if (this.containsPoint(node)){
                shouldAdd = true;
            }
        }

        if (shouldAdd){
            this.link(sameNode, shouldRemember);
            return true;
        }

        return false;
    }

    link(sameNode, shouldRemember=true){
        /* 
         * Совмещает узел макета sameNode с настоящим узлом макета.
         * 
         * @param {SameNode} sameNode совмещаемый узел.
         * @param {Boolean} shouldRemember (default=true) флаг на запоминание узлом элемента принадлежности к узлу макета.
         */
        for (let node of sameNode.nodes){
            if (!(this.containsNode(node))){
                this.nodes.push(node);
                if (shouldRemember) node.globalNode = this;
            }
        }
    }

    tryOptimize(){
        /* 
         * Если элемент цепи подключен двумя концами к одному и тому же узлу макета, то функция исключает его из рассчетов.
         */
        for (let node of this.activeElementsNodes){
            if (node.globalNode == node.otherNode.globalNode){
                this.replaceNodes(node, node.otherNode)
            }
        }
    }

    replaceNodes(node1, node2){
        /* 
         * Исключает узлы элемента node1 и node2 из расчёта цепи.
         * 
         * @param {Node} node1 первый узел элемента.
         * @param {Node} node2 второй узел элемента.
         */

        for (let index = 0; index < this.activeElementsNodes.length; index++){
            if (node1 == this.activeElementsNodes[index]){
                this.activeElementsNodes.splice(index, 1);
                this.nodes.push(node1);
            }
        }
        for (let index = 0; index < this.activeElementsNodes.length; index++){
            if (node2 == this.activeElementsNodes[index]){
                this.activeElementsNodes.splice(index, 1);
                this.nodes.push(node2);
            }
        }
    }

    containsPoint(checkingNode){
        /* 
         * Проверяет узел элемента checkingNode на связь с настоящим узлом макета 
         * по координатам в нашей собственной СК
         * 
         * @param {Node} checkingNode проверяемый узел элемента.
         * 
         * @return {Boolean} true, если узлы связаны. Иначе - false.
         */

        for (let node of this.nodes){
            if (node.x == checkingNode.x & node.y == checkingNode.y){
                return true;
            }
        }

        for (let node of this.activeElementsNodes){
            if (node.x == checkingNode.x & node.y == checkingNode.y){
                return true;
            }
        }

        return false;
    }

    containsNode(checkingNode) {
        /* 
         * Проверяет узел элемента checkingNode на связь с настоящим узлом макета. 
         * 
         * @param {Node} checkingNode проверяемый узел элемента.
         * 
         * @return {Boolean} true, если узлы связаны. Иначе - false.
         */

        for (let node of this.nodes) {
            if (node == checkingNode) {
                return true;
            }
        }

        for (let node of this.activeElementsNodes) {
            if (node == checkingNode) {
                return true;
            }
        }

        return false;
    }
}


class Branch{ //Класс ветви цепи
    
    constructor(sameNode1, sameNode2, elements){
        /* 
         * Конструктор класса ветви.
         * 
         * @param {SameNode} sameNode1 первый узел макета для настоящей ветви.
         * @param {SameNode} sameNode2 второй узел макета для настоящей ветви.
         * @param {Array} elements список элементов ветви. 
         */
        this.sameNode1 = sameNode1;
        this.sameNode2 = sameNode2;

        sameNode1.branches.push(this);
        sameNode2.branches.push(this);

        this._current;

        this.elements = elements;

        for (let element of this.elements){
            element.branch = this;
        }
    }

    get resistance(){
        /*  
         * Возвращает сопротивление ветви.
         * 
         * @return {Number} сопротивление.
         */
        let value = 0;
        for (let element of this.elements){
            if (element instanceof Resistor | element instanceof Lamp){
                value += element.nominal;
            }
        }
        return value;
    }

    set current(value){
        /* 
         * Устанавливает ток ветви.
         * 
         * @param {Number} value ток ветви. 
         */
        this._current = value;
    }

    get current(){
        /* 
         * Возвращает ток ветви. Причем, если есть ИТ, то возвращается его номинал.
         * 
         * @return {Number} ток ветви
         */
        for (let element of this.elements){
            if (element instanceof CurrentSource){
                return element.current;
            }
        }
        return this._current;
    }

    get fromNode(){
        /* 
         * Возвращает узел ветви с наибольшим потенциалом (откуда течет ток).
         *
         * @return {SameNode} узел с наибольшим потенциалом.
         */
        if (this.sameNode1.potential <= this.sameNode2.potential){
            return this.sameNode1;
        } else{
            return this.sameNode2;
        }
    }

    get toNode(){
        /* 
         * Возвращает узел ветви с наименьшим потенциалом (куда течет ток).
         *
         * @return {SameNode} узел с наименьшим потенциалом.
         */
        if (this.sameNode1.potential > this.sameNode2.potential){
            return this.sameNode1;
        } else{
            return this.sameNode2;
        }
    }
}


class App{ //Класс приложения

    constructor(){
        this.layout = new Layout();
        this.calc = new CircuitCalc();

        this.isSetupOpened = false;

        this.overlay = document.querySelector('.overlay');
        this.modal = document.querySelector('.dlg-modal');
    }

    doubleClick(xAbs, yAbs){
        /* 
         * Открывает настройки элемента или изменяет состояние ключа, в границу которого попадет точка (xAbs, yAbs)
         * 
         * @param {Number} xAbs абсцисса курсора в нашей собственной СК.
         * @param {Number} yAbs ордината курсора в нашей собственной СК.
         */
        if (this.layout.lastSelected){
            if (this.layout.lastSelected instanceof Key){
                this.layout.lastSelected.changeState(xAbs, yAbs);
                this.calc.calc(this.layout.elements);
                this.layout.invalidate();
                return;
            }
            
            if (this.layout.lastSelected.hasProperties){
                if (this.layout.lastSelected.selected){
                    this.openSetup();
                }
            }
        }
    }

    openSetup(){
        /* 
         * Открывает всплывающее окно для настроек выбранного элемента.
         */
        this.isSetupOpened = true;
        let element = this.layout.lastSelected;

        this.overlay.classList.remove('fadeOut');
        this.overlay.classList.add('fadeIn');
        
        this.modal.querySelector('.gwt-Label').textContent = `${element.nominalType} [${element.measurementUnits}]`;
        this.modal.querySelector('.gwt-TextBox').value = element.nominal;
        this.modal.classList.remove('fadeOut');
        this.modal.classList.add('fadeIn');
    }

    setValue(){
        /* 
         * Валидирует введенный в окне настроек параметр. 
         * Если валидация проходит успешно, изменяет параметры выделенного элемента.
         * Иначе - выводит сообщение о некорректных параметрах. 
         */
        if (!this.isSetupOpened){
            return;
        }

        let value = Number(this.modal.querySelector('.gwt-TextBox').value);

        if (isNaN(value)){
            alert("Введите положительное число!");
            return;
        }
        if (value <= 0){
            alert("Введите положительное число!");
            return;
        }

        let element = this.layout.lastSelected;
        element.nominal = value;
        closeSetup();
        this.calc.calc(this.layout.elements);
        this.layout.invalidate();
    }

    mouseRelease(e){
        /* 
         * В зависимости того, отпущена ПКМ или ЛКМ, вызывает соответсвующие функции модуля layout.
         */
        switch (e.which){
            case 1:
                this.layout.mouseRelease();
            break;
            case 3:
                this.layout.rightRelease(e.pageX, e.pageY);
            break;
        }
        this.calc.calc(this.layout.elements);
        this.layout.invalidate();
    }

    closeSetup(){
        /* 
         * Закрывает окно изменения параметров.
         */
        if (!this.isSetupOpened){
            return;
        }

        this.modal.classList.remove('fadeIn');
		this.modal.classList.add('fadeOut');

        this.overlay.classList.remove('fadeIn');
		this.overlay.classList.add('fadeOut');

        this.isSetupOpened = false;
    }
}


function canvasMove(e){
    /* 
     * Вычисляет позицию курсора в данный момент времени и передает её в модуль app.layout
     */
    let xAbs = e.pageX - app.layout.canvas.offsetLeft;
    let yAbs = e.pageY - app.layout.canvas.offsetTop;

    app.layout.checkPoint(xAbs,yAbs) 
}


function canvasRelease(e){
    /* 
     * Передаёт сообщение об отпускании кнопки мыши в модуль app.
     */
    app.mouseRelease(e);       
}


function canvasClick(e){
    /* 
     * Передает сообщение о нажатии соответствующей кнопки мыши в модуль app.layout.
     */ 
    switch (e.which){
        case 1:
            app.layout.mouseClick(e.pageX, e.pageY);
        break;
        case 3:
            app.layout.rightClick(e.pageX, e.pageY);
        break;
    }
}


function canvasResize(e){
    /* 
     * Передает сообщение об изменении размера окна в модуль app.layout.
     */
    app.layout.changeSize();
}


function deleteContextMenu(e){
    /*
     * Предотвращает открытие контекстного меню в приложении.
     */
    e.preventDefault();
}


function doubleClick(e){
    /* 
     * Передает сообщение о двойном нажатии кнопки мыши в модуль app.
     */ 
    app.doubleClick(e.pageX, e.pageY);
}


function releaseButton(e){
    /* 
     * Передает сообщение об отпускании кнопки Delete в модуль app.layout
     * По нажатию на Escape закрывает открытое окно изменения параметров без сохранения.
     * По нажатию на Enter закрывает открытое окно изменения параметров и сохраненяет параметры.
     */
    if (e.code == 'Delete') {
        if (!app.isSetupOpened){
            app.layout.deleteItem(e.pageX, e.pageY);
            app.calc.calc(app.layout.elements)
            app.layout.invalidate();
        }
    }
    if (e.code == "Escape"){
        closeSetup(e);
    }
    if (e.code == "Enter"){
        setValue(e);
    }
}


function closeSetup(e){
    /*  
     * Передает в модуль app команду закрыть окно изменения парамертов.
     */
    app.closeSetup();
}


function setValue(e){
    /*  
     * Передает в модуль app команду изменить параметр элемента.
     */
    app.setValue();
}


function det(A){
    /* 
     * Возвращает определитель матрицы A.
     * @param {Array} A - квадратная матрица (массив массивов)
     * 
     * @return {Number} определитель. 
     */
    let N = A.length, B = [], denom = 1, exchanges = 0;

    for (let i = 0; i < N; ++i){
        B[i] = [];
        for (let j = 0; j < N; ++j){
            B[i][j] = A[i][j];
        }
    }

    for (let i = 0; i < N-1; ++i){ 

        let maxN = i, maxValue = Math.abs(B[i][i]);
        for (let j = i+1; j < N; ++j){ 
            var value = Math.abs(B[j][i]);
            if (value > maxValue){ 
                maxN = j; maxValue = value;
            }
        }

        if (maxN > i){
            let temp = B[i]; B[i] = B[maxN]; B[maxN] = temp;
            ++exchanges;
        }else {
            if (maxValue == 0) return maxValue; 
        }
        let value1 = B[i][i];
        for (let j = i+1; j < N; ++j){ 
            let value2 = B[j][i];
            B[j][i] = 0;
            for (let k = i+1; k < N; ++k){
                B[j][k] = (B[j][k]*value1-B[i][k]*value2)/denom;
            }
        }
        denom = value1;
    }

    if (exchanges%2){
        return -B[N-1][N-1];
    }else {
        return B[N-1][N-1];
    }
}

//Создание экзампляра приложения
let app = new App();

//Изменение некоторых функций по умолчанию для canvas на собственные.

app.layout.canvas.oncontextmenu = deleteContextMenu;
app.layout.canvas.onmousemove = canvasMove;
app.layout.canvas.onmousedown = canvasClick;  
app.layout.canvas.onmouseup = canvasRelease;
app.layout.canvas.onresize = canvasResize;
app.layout.canvas.onmouseout = canvasRelease;
app.layout.canvas.ondblclick = doubleClick;

//Создание событий для окна изменения параметров.

document.querySelector('#cancelButton').addEventListener('click', closeSetup);
document.querySelector('#setButton').addEventListener('click', setValue);
document.addEventListener('keyup', releaseButton);

//При изменении окна координаты canvas будут пересчитываться автоматически.
window.onresize = canvasResize;