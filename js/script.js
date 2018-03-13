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

function constructor(options){
	this.options = options;
	this.canvas = options.canvas;
	this.ctx = this.canvas.getContext('2d');
	this.colors = options.colors;
}

function StackedChart(options){
	constructor.call(this, options);

	this.draw = function(data){
		let padding = this.options.padding;
		let barWidth = this.options.barWidth;
		let spacing = this.options.spacing;
		let numberOfBars = Object.keys(data).length;
		this.canvas.width = padding * 2 + numberOfBars*barWidth + (numberOfBars-1)*spacing;
		let drawingHeight = this.canvas.height - padding * 2;		
		let currentX = padding;
		
		//drawing the bars
		for (let doc in data){
			let val = data[doc];
			let total = Object.values(val).reduce((a,b)=>a+b);					
			let currentY = padding;
			
			for (let result of ['Success', 'Complications', 'Failure']){
				let barHeight;
				if (result!=='Failure')
					barHeight = Math.round( drawingHeight * val[result]/total);
				else
					barHeight = drawingHeight - currentY + padding;
				
				drawBar(this.ctx, currentX, currentY, barWidth, barHeight, this.colors[result]);				
				currentY += barHeight;
			}	
			currentX += barWidth + spacing;
		}
		//drawing the grid lines
		let scaleValue = 0;
		while (scaleValue <= 100){
				var gridY = drawingHeight * (1 - scaleValue/100) + this.options.padding;
				drawLine(this.ctx, 0, gridY, this.canvas.width, gridY, this.options.gridColor);

				//writing grid markers
				writeText(this.ctx, this.options.gridColor, this.options.font, scaleValue, 0, gridY)
				writeText(this.ctx, this.options.gridColor, this.options.font, scaleValue, this.canvas.width-20, gridY)
				scaleValue+=this.options.gridScale;
		}
	}
}


function PieChart(options){	
	constructor.call(this, options);
		
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

function HorizontalChart(options){
	constructor.call(this, options);	

	this.draw = function(data){
		let padding = this.options.padding;
		let spacing = this.options.spacing;
		let numberOfBars = Object.keys(data).length;				
		let currentY = padding;
		let drawingWidth = this.canvas.width - padding*2;
		let drawingHeight = (this.canvas.height)*.80 - padding*2;
		let max = Math.max.apply(null, Object.values(data));
		let colorIndex = 0;
		let barHeight = (drawingHeight - (numberOfBars-1)*spacing) / numberOfBars;
		let legendX = padding;
		
		for (let categ in data){
			let val = data[categ];
			let barWidth = Math.round( drawingWidth * val/max);
			let currentColor = this.colors[colorIndex++%this.colors.length];
			drawBar(this.ctx, padding, currentY, barWidth, barHeight, currentColor);	
			currentY += barHeight+ spacing;	
			
			let text = categ;
			writeText(this.ctx, currentColor, this.options.legendFont, text, legendX, this.canvas.height*.9);
			legendX += 150;
		}	
		
		//drawing the grid lines
		let scaleValue = 0;
		let gridScale = Math.max(1, max/10);
		while (scaleValue <= max){
			var gridX = drawingWidth * (scaleValue/max) + this.options.padding;
			drawLine(this.ctx, gridX, 0, gridX, drawingHeight+2*padding, this.options.gridColor);

			//writing grid markers
			writeText(this.ctx, this.options.gridColor, this.options.gridFont, scaleValue, gridX+5, 15)
			writeText(this.ctx, this.options.gridColor, this.options.gridFont, scaleValue, gridX+5, drawingHeight+2*padding-5)
			scaleValue+=gridScale;
		}
	}
}

var stackedChart = new StackedChart(
	{
		canvas: canvas2,       
		padding: 20,
		gridScale: 10,
		spacing: 10,
		gridColor: 'lightgrey',
		font: 'bold 10px Arial',
		barWidth: 70,
		colors: {
			Success: '#28a745',
			Complications: '#ffc107',
			Failure: '#dc3545'
		}
	}
);
stackedChart.draw(data.outcome);


var pieChart = new PieChart(
	{
		canvas: canvas3,    
		padding: 20,	
		font: '20px Monospace',		
		colors: ['#fe4e00', '#fd7690', '#ceea8a', '#ffae03', '#aae4b7', '#f0caca', '#d1c4a4', '#66cdaa', '#66cc66', '#ffd319']
	}
);

var select = document.getElementById("dropCategories");
for(let categ in data.operativity) {
	let btn = document.createElement('button');
	btn.type = 'button';
	btn.className = 'dropdown-item';
	btn.value = categ;
	btn.innerHTML = categ;
	btn.addEventListener('click', ()=> pieChart.draw(data.operativity[categ]));
	select.appendChild(btn);
}

select.children[0].click();

function filterSurgery(year, outcomes){
	let result = {};
	let yearData = data.surgery[year];
	for (let type in yearData){
		for (let outcome of outcomes){
			if (yearData[type][outcome]){
				if (!result[type])
					result[type] = yearData[type][outcome];
				else
					result[type] += yearData[type][outcome];
			}
		}
	}	
	return result;
}

var horizontalChart = new HorizontalChart(
	{
		canvas: canvas4,       
		padding: 20,
		spacing: 10,
		gridColor: 'lightgrey',
		gridFont: 'bold 10px Arial',
		legendFont: '14px Monospace',
		colors: ['#fe4e00', '#fd7690', '#ceea8a', '#ffae03', '#aae4b7', '#f0caca', '#d1c4a4', '#66cdaa', '#66cc66', '#ffd319']
	}
);
let testData = filterSurgery(2016, ['Success']);
horizontalChart.draw(testData);





















