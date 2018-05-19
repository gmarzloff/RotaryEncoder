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
        this.radius = Math.min.apply(null,[window.canvas.width, window.canvas.height])/2 * sizefactor;
        this.bitsize = bitsize;
        this.center = {x: window.canvas.width/2, y: window.canvas.height/2};
        this.axleRadius = 20;
        this.rodTheta = 0.0;

        this.fps = 24;
        this.revolutionPeriod = 4.0; // seconds 
        this.updateInterval = 1.0 / this.fps ;
        this.d_theta = 360 / (this.fps * this.revolutionPeriod);
    }
    get totalValues() {
        return Math.pow(2,this.bitsize);
    }

    //drawSegment(drawing context, decimalNumber, bitPosition, fill? true/false)
    drawPartOfSlice(c, decNumber, bitPosition, shouldFill){
        var arcAngle = 2 * Math.PI / this.totalValues;
        
        var innerArc = {
            start: arcAngle * decNumber, 
            end: arcAngle * (decNumber + 1), 
            r: bitPosition/this.bitsize * this.radius 
        };
        
        var outerArc = {
            start: arcAngle * decNumber, 
            end: arcAngle * (decNumber + 1), 
            r: (bitPosition+1)/this.bitsize * this.radius 
        };

        
        c.beginPath();
        c.arc(this.center.x, this.center.y, innerArc.r, innerArc.start, innerArc.end);
        c.arc(this.center.x, this.center.y, outerArc.r, outerArc.end, outerArc.start, true);
        var pt = polarToCartesian(innerArc.r, innerArc.start);
        c.lineTo(pt.x + this.center.x, pt.y + this.center.y);
        
        if(shouldFill){
            c.fillStyle = "black";
            c.fill();
        }
        c.strokeStyle="gray";
        c.stroke();
    }

    drawAxle(c){
        c.beginPath();
        c.arc(this.center.x, this.center.y, this.axleRadius, 0, 2*Math.PI);
        c.fillStyle = "white";
        c.strokeStyle = "gray";
        c.stroke();
        c.fill();
    }

    drawRod(c){
        var pt = polarToCartesian(this.radius, this.rodTheta);
        c.beginPath();
        c.moveTo(this.center.x, this.center.y);
        c.lineTo(pt.x + this.center.x, pt.y + this.center.y);
        c.strokeStyle = "red";
        c.lineWidth = 8;
        c.lineCap = "round";
        c.stroke();
        c.lineWidth = 1;
    }

    drawFullSlice(c, decNumber){
        var bits = decNumber.bits(this.bitsize);   // converts number to string of bits
        
        for(var i=0; i<bits.length; i++){
            this.drawPartOfSlice(c, decNumber, i, bits[i] == "1");
            
        }
    }

    draw(){
        for(var i=0; i<this.totalValues; i++){
            this.drawFullSlice(window.canvas.context,i);
        }
        this.drawAxle(window.canvas.context);
        this.drawRod(window.canvas.context);
    }

    changeBitSize(newbits){
        window.canvas.context.clear();
        this.bitsize = newbits;
        this.draw();
    }

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

//////////////////////////////////////////////////////////////////

var rotaryEncoder = new RotaryEncoder();
rotaryEncoder.draw();
// var timer = setInterval(rotaryEncoder.draw, rotaryEncoder.updateInterval);

//////////////////////////////////////////////////////////////////
