(function(){
	var canvas = document.getElementById("canvas1");
	var ctx = canvas.getContext("2d");
	ctx.globalAlpha = 0.5;
	ctx.lineWidth = 4;
	ctx.lineJoin = 'round';

	canvas.addEventListener('mousemove', mouseInsidePaths);

	var currentHighlight;
	function mouseInsidePaths(evnt){
		if (currentHighlight) {
			if (ctx.isPointInPath(currentHighlight, evnt.x, evnt.y)) return; 

			restorePath(currentHighlight);
			currentHighlight = null;		
		}
		for(let i=0; i < paths.length; i++){		
			if (ctx.isPointInPath(paths[i], evnt.x, evnt.y)){			
				currentHighlight = paths[i];
				highlightPath(paths[i]);
				return;
			}
		}
	}

	function drawBar(path){
		ctx.beginPath();
		ctx.fillStyle = path.color;
		ctx.stroke(path);
		ctx.fill(path);
		ctx.closePath();
	}

	function highlightPath(path){
		ctx.save();
		ctx.globalAlpha = 1;
		drawBar(path);
		ctx.restore();	
	}

	function restorePath(path){
		let stroke = ctx.lineWidth;
		ctx.clearRect(path.x-(stroke/2), path.y-(stroke/2), path.width+stroke, path.height+stroke);
		drawBar(path);
	}

	let paths = [];
	function Path(x, y, width, height, color){
		let path = new Path2D();
		paths.push(path);
		path.rect(x, y, width, height);
		path.x = x;
		path.y = y;
		path.width = width;
		path.height = height;
		path.color = color;
		drawBar(path);
		return path;
	}

	var path1 = Path( 10, 10, 40, 100, 'blue');
	var path2 = Path(110, 10, 40, 100, 'green');
	var path2 = Path(210, 10, 40, 100, 'red');
	var path2 = Path(310, 10, 40, 100, 'yellow');
})()

function drawLine(ctx, startX, startY, endX, endY, color){
	ctx.save();
	ctx.strokeStyle = color;
	ctx.beginPath();
	ctx.moveTo(startX, startY);
	ctx.lineTo(endX, endY);
	ctx.stroke();
	ctx.restore();
}
 
function drawBar(ctx, upperLeftCornerX, upperLeftCornerY, width, height, color){
	ctx.save();
	ctx.fillStyle = color;
	ctx.fillRect(upperLeftCornerX, upperLeftCornerY, width, height);
	ctx.restore();
}

function writeText(ctx, color, font, value, x, y){
	ctx.save();
	ctx.fillStyle = color;
	ctx.textBaseline = 'bottom';
	ctx.font = font;
	ctx.fillText(value, x, y);
	ctx.restore();
}

function drawArc(ctx, centerX, centerY, radius, currentAngle, sliceAngle, color){
	ctx.beginPath();
	ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);	
	ctx.lineTo(centerX, centerY);
	ctx.fillStyle = color;
	ctx.fill();
}


function OutcomeChart(options){
	this.options = options;
	this.canvas = options.canvas;
	this.ctx = this.canvas.getContext('2d');
	this.colors = options.colors;
	this.data = options.data;
	
	this.draw = function(){
		const drawingWidth = this.canvas.width - this.options.padding * 2;
		const drawingHeight = this.canvas.height - this.options.padding * 2;
		
		//drawing the bars
		//let barIndex = 0;
		let numberOfBars = Object.keys(this.data).length;
		let barWidth = Math.round((drawingWidth-(numberOfBars-1)*this.options.spacing)/numberOfBars);
		let currentX = this.options.padding;
		
		for (let doc in this.data){
			let val = this.data[doc];
			let total = Object.values(val).reduce((a,b)=>a+b);					
			let currentY = this.options.padding;
			
			for (let result of ['Success', 'Complications', 'Failure']){
				let barHeight;
				if (result!=='Failure')
					barHeight = Math.round( drawingHeight * val[result]/total);
				else
					barHeight = drawingHeight-currentY+this.options.padding;
				
				drawBar(this.ctx, currentX, currentY, barWidth, barHeight, this.colors[result]);				
				currentY += barHeight;
			}	
			currentX += barWidth + this.options.spacing;
			//barIndex++;
		}
		//drawing the grid lines
		let gridValue = 0;
		while (gridValue <= 100){
				var gridY = drawingHeight * (1 - gridValue/100) + this.options.padding;
				drawLine(this.ctx, 0, gridY, this.canvas.width, gridY, this.options.gridColor);

				//writing grid markers
				writeText(this.ctx, this.options.gridColor, gridValue, 5, gridY - 2)
				gridValue+=this.options.gridScale;
		}
	}
}

var chart1 = new OutcomeChart(
	{
		canvas: canvas2,       
		padding: 20,
		gridScale: 10,
		spacing: 0,
		gridColor: 'lightgrey',
		font: 'bold 10px Arial',
		data: data.outcome,
		colors: {
			Success: '#66cc66',
			Complications: '#ffd319',
			Failure: '#fe4e00'
		}
	}
);
chart1.draw();

function OperativityChart(options){	
	this.options = options;
	this.canvas = options.canvas;
	this.ctx = this.canvas.getContext('2d');
	this.colors = options.colors;
	
	
	this.draw = function(data){
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		let total = Object.values(data).reduce((a,b)=>a+b);
		let currentAngle = -0.5 * Math.PI;
		let centerX = (this.canvas.width-this.options.padding*2)/4;
		let centerY = this.canvas.height/2;
		let colorIndex = 0;
		let legendX = this.canvas.width/2 + this.options.padding;
		let legendY = this.options.padding*2;
		let dataCount = Object.keys(data).length;
		let legendSpacing = Math.min(20, ((this.canvas.height-this.options.padding*2)-dataCount*20)/(dataCount-1));
		
		for (let doc in data) {
			let percentage = data[doc] / total;
			let sliceAngle = (percentage) * 2 * Math.PI;
			let currentColor = this.colors[colorIndex++%this.colors.length];
			drawArc(this.ctx, centerX, centerY, centerY-this.options.padding, currentAngle, sliceAngle, currentColor);
			currentAngle += sliceAngle;
			
			let text = doc + ' ' + Math.round(percentage * 100) + '%';
			writeText(this.ctx, currentColor, this.options.font, text, legendX, legendY);
			legendY += legendSpacing + 20;
		}
	}
}

var pieCharter = new OperativityChart(
	{
		canvas: canvas3,    
		padding: 20,	
		font: '20px Monospace',		
		colors: ['#fd7690', '#ceea8a', '#ffae03', '#aae4b7', '#f0caca', '#d1c4a4', '#01ea0e', '#40e0d0', '#66cdaa']
	}
);
//let opTestData = {'Virgil Zara Howland': 25, 'Desiree Lucas': 41, 'Bridget Malinda': 10, 'Luz Tran': 6, 'Litzy Wilcox': 36, 'Alanna Burnett': 34, 'Damian Saunders': 31, 'Damari Craig': 33};
//pieCharter.draw(opTestData);

var select = document.getElementById("dropCategories");
for(let categ in data.operativity) {
	let btn = document.createElement('button');
	btn.type = 'button';
	btn.className = 'dropdown-item';
	btn.value = categ;
	btn.innerHTML = categ;
	btn.addEventListener('click', ()=> pieCharter.draw(data.operativity[categ]));
	select.appendChild(btn);
}

























