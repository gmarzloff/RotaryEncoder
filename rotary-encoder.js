var canvas = document.getElementById("rotary");

canvas.center = {
    x: canvas.width/2,
    y: canvas.height/2,
    toString: function(){
        return "(" + this.x + ", " + this.y + ")";
    }
};
canvas.context = canvas.getContext("2d");


class RotaryEncoder {
    constructor(bitsize=3, sizefactor=0.8){
        this.radius = Math.min.apply(null,[canvas.width, canvas.height])/2 * sizefactor;
        this.bitsize = bitsize;
        this.center = {x: canvas.width/2, y: canvas.height/2};
        this.axleRadius = 20;
        this.rodTheta = 0.0;

        this.fps = 24;
        this.revolutionPeriod = 5.0; // seconds 
        this.updateInterval = 1000 / this.fps ;
        this.d_theta = 2*Math.PI / (this.fps * this.revolutionPeriod);
    }
    get totalValues() {
        return Math.pow(2,this.bitsize);
    }

    get currentDecimalValue(){
        var fractionOfRotation = this.rodTheta/(Math.PI * 2);
        return Math.floor(this.totalValues * fractionOfRotation);
    }

    get currentBinaryValue(){
        var fractionOfRotation = this.rodTheta/(Math.PI * 2);
        return (Math.floor(this.totalValues * fractionOfRotation)).bits(this.bitsize);
    }

    changeBitSize(newbits){
        canvas.context.clear();
        this.bitsize = newbits;
        draw();
    }

}

function drawPartOfSlice(c, decNumber, bitPosition, shouldFill){
    // c:           drawing context
    // decNumber:   represented number in decimal format
    // bitPosition: position of the bit
    // shouldFill:  fill area with a color? true/false

    var arcAngle = 2 * Math.PI / rotaryEncoder.totalValues;
    
    var innerArc = {
        start: arcAngle * decNumber, 
        end: arcAngle * (decNumber + 1), 
        r: bitPosition/rotaryEncoder.bitsize * rotaryEncoder.radius 
    };
    
    var outerArc = {
        start: arcAngle * decNumber, 
        end: arcAngle * (decNumber + 1), 
        r: (bitPosition+1)/rotaryEncoder.bitsize * rotaryEncoder.radius 
    };

    c.beginPath();
    c.arc(rotaryEncoder.center.x, rotaryEncoder.center.y, innerArc.r, innerArc.start, innerArc.end);
    c.arc(rotaryEncoder.center.x, rotaryEncoder.center.y, outerArc.r, outerArc.end, outerArc.start, true);
    var pt = polarToCartesian(innerArc.r, innerArc.start);
    c.lineTo(pt.x + rotaryEncoder.center.x, pt.y + rotaryEncoder.center.y);
    
    if(shouldFill){
        c.fillStyle = "black";
        c.fill();
    }
    c.strokeStyle="gray";
    c.stroke();
}

function drawAxle(c){
    c.beginPath();
    c.arc(rotaryEncoder.center.x, rotaryEncoder.center.y, rotaryEncoder.axleRadius, 0, 2*Math.PI);
    c.fillStyle = "white";
    c.strokeStyle = "gray";
    c.stroke();
    c.fill();
}

function drawRod(c){
    var pt = polarToCartesian(rotaryEncoder.radius, rotaryEncoder.rodTheta);
    c.beginPath();
    c.moveTo(rotaryEncoder.center.x, rotaryEncoder.center.y);
    c.lineTo(pt.x + rotaryEncoder.center.x, pt.y + rotaryEncoder.center.y);
    c.strokeStyle = "red";
    c.lineWidth = 8;
    c.lineCap = "round";
    c.stroke();
    c.lineWidth = 1;
}

function drawFullSlice(c, decNumber){
    var bits = decNumber.bits(rotaryEncoder.bitsize);   // converts number to string of bits
    for(var i=0; i<bits.length; i++){
        drawPartOfSlice(c, decNumber, i, bits[i] == "1");
    }
}

function draw(){
    canvas.context.clear();
    for(var i=0; i<rotaryEncoder.totalValues; i++){
        drawFullSlice(canvas.context,i);
    }
    drawAxle(canvas.context);
    drawRod(canvas.context);
    updateBinDecLabels();
    rotaryEncoder.rodTheta = rotaryEncoder.rodTheta > 2*Math.PI - rotaryEncoder.d_theta ? 0 : rotaryEncoder.rodTheta + rotaryEncoder.d_theta;
}

function polarToCartesian(r, theta){
    return {
        x: r * Math.cos(theta),
        y: r * Math.sin(theta)
    }
}

// Converts a number to a string of bits
Number.prototype.bits = function(capacityInBits=8) {
    var num = this.toString(2);
    var padding = Array.from(Array(capacityInBits - num.length), ()=>0).join('');
    return padding+num
}

// context.clear() clears the canvas 
CanvasRenderingContext2D.prototype.clear = function (){
    this.clearRect(0,0,window.canvas.width, window.canvas.height)
}



//////////////////////////////////////////////////////////////////
// User Interface
//////////////////////////////////////////////////////////////////


var decreaseButton = document.getElementById("decreaseButton");
var increaseButton = document.getElementById("increaseButton");
var bitCountLabel = document.getElementById("bitCountLabel");
var totalValuesLabel = document.getElementById("totalValuesLabel");
var angularResolutionLabel = document.getElementById("angularResolutionLabel");
var currentBinaryValueLabel = document.getElementById("currentBinaryValueLabel");
var currentDecimalValueLabel = document.getElementById("currentDecimalValueLabel");

decreaseButton.onclick = function(){
    var newsize = window.rotaryEncoder.bitsize - 1;
    if(newsize>0){
        window.rotaryEncoder.changeBitSize(newsize);
    }
    updateUI(newsize);
};

increaseButton.onclick = function(){
    var newsize = window.rotaryEncoder.bitsize + 1;
    if(newsize<=8){
        window.rotaryEncoder.changeBitSize(newsize);
    }
    updateUI(newsize);
};

function updateUI(bitsize){

    if(bitsize == 8){
        increaseButton.disabled = true
        increaseButton.classList.add("disabledColor");
        increaseButton.classList.remove("enabledColor");
    } else{
        increaseButton.disabled = false
        increaseButton.classList.remove("disabledColor");
        increaseButton.classList.add("enabledColor");
    }
    
    if(bitsize == 1){
        decreaseButton.disabled = true
        decreaseButton.classList.add("disabledColor");
        decreaseButton.classList.remove("enabledColor");
    } else{
        decreaseButton.disabled = false
        decreaseButton.classList.remove("disabledColor");
        decreaseButton.classList.add("enabledColor");
    }

    // update labels
    bitCountLabel.innerHTML = bitsize;
    totalValuesLabel.innerHTML = rotaryEncoder.totalValues - 1;
    angularResolutionLabel.innerHTML = Math.round( 360 / rotaryEncoder.totalValues * 10)/10

}

function updateBinDecLabels(){
    currentDecimalValueLabel.innerHTML = rotaryEncoder.currentDecimalValue;
    currentBinaryValueLabel.innerHTML = rotaryEncoder.currentBinaryValue;
}
//////////////////////////////////////////////////////////////////

var rotaryEncoder = new RotaryEncoder();
// rotaryEncoder.draw();
var timer = setInterval(draw, rotaryEncoder.updateInterval);

//////////////////////////////////////////////////////////////////
