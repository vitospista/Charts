const Chart = {
	constructor: function (options){
		this.options = options;
		this.canvas = options.canvas;
		this.ctx = this.canvas.getContext('2d');
		this.colors = options.colors;
	},
	
	drawLine: function(startX, startY, endX, endY, color){
		this.ctx.save();
		this.ctx.strokeStyle = color;
		this.ctx.beginPath();
		this.ctx.moveTo(startX, startY);
		this.ctx.lineTo(endX, endY);
		this.ctx.stroke();
		this.ctx.restore();
	},
 
	drawBar: function(upperLeftCornerX, upperLeftCornerY, width, height, color){
		this.ctx.save();
		this.ctx.fillStyle = color;
		this.ctx.fillRect(upperLeftCornerX, upperLeftCornerY, width, height);
		this.ctx.restore();
	},

	writeText: function(color, font, value, x, y, pos){
		this.ctx.save();
		this.ctx.fillStyle = color;
		this.ctx.textBaseline = pos || 'bottom';
		this.ctx.font = font;
		this.ctx.fillText(value, x, y);
		this.ctx.restore();
	},

	drawArc: function(centerX, centerY, radius, currentAngle, sliceAngle, color){
		this.ctx.beginPath();
		this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);	
		this.ctx.lineTo(centerX, centerY);
		this.ctx.fillStyle = color;
		this.ctx.fill();
	},
	
	clear: function(){
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}

function StackedChart(options){
	this.constructor(options);

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
					barHeight = Math.round( drawingHeight * val[result] / total);
				else
					barHeight = drawingHeight - currentY + padding;
				
				this.drawBar(currentX, currentY, barWidth, barHeight, this.colors[result]);				
				currentY += barHeight;
			}	
			currentX += barWidth + spacing;
		}
		//drawing the grid lines
		let scaleValue = 0;
		while (scaleValue <= 100){
				var gridY = drawingHeight * (1 - scaleValue / 100) + this.options.padding;
				this.drawLine(0, gridY, this.canvas.width, gridY, this.options.gridColor);

				//writing grid markers
				this.writeText(this.options.gridColor, this.options.font, scaleValue, 0, gridY)
				this.writeText(this.options.gridColor, this.options.font, scaleValue, this.canvas.width - 20, gridY)
				scaleValue+=this.options.gridScale;
		}
	}
}
StackedChart.prototype = Chart;

function PieChart(options){	
	this.constructor(options);
		
	this.draw = function(data){
		this.clear();
		let total = Object.values(data).reduce((a,b)=>a + b);
		let currentAngle = -0.5 * Math.PI;
		let centerX = (this.canvas.width - this.options.padding * 2) / 4;
		let centerY = this.canvas.height / 2;
		let colorIndex = 0;
		let legendX = this.canvas.width / 2 + this.options.padding;
		let legendY = this.options.padding * 2;
		let dataCount = Object.keys(data).length;
		let legendSpacing = Math.min(20, ((this.canvas.height - this.options.padding * 2) - dataCount * 20) / (dataCount - 1));
		
		for (let doc in data) {
			let percentage = data[doc] / total;
			let sliceAngle = (percentage) * 2 * Math.PI;
			let currentColor = this.colors[colorIndex++ % this.colors.length];
			this.drawArc(centerX, centerY, centerY - this.options.padding, currentAngle, sliceAngle, currentColor);
			currentAngle += sliceAngle;
			
			let text = doc + ' ' + Math.round(percentage * 100) + '%';
			this.writeText(currentColor, this.options.font, text, legendX, legendY);
			legendY += legendSpacing + 20;
		}
	}
}
PieChart.prototype = Chart;

function HorizontalChart(options){
	this.constructor(options);

	this.draw = function(data){
		this.clear();
		let padding = this.options.padding;
		let spacing = this.options.spacing;
		let numberOfBars = Object.keys(data).length;				
		let currentY = padding;
		let drawingWidth = (this.canvas.width)*.65 - padding*2;
		let drawingHeight = this.canvas.height - padding*2;
		let max = Math.max.apply(null, Object.values(data));
		let colorIndex = 0;
		let barHeight = (drawingHeight - (numberOfBars - 1) * spacing) / numberOfBars;		
		
		for (let categ in data){
			let val = data[categ];
			let barWidth = Math.round( drawingWidth * val/max);
			let currentColor = this.colors[colorIndex++ % this.colors.length];
			this.drawBar(padding, currentY, barWidth, barHeight, currentColor);	
			
			let text = categ;
			this.writeText(currentColor, this.options.legendFont, text, this.canvas.width * .7, currentY, 'top');	
			
			currentY += barHeight + spacing;
		}	
		
		//drawing the grid lines
		let scaleValue = 0;
		let gridScale = Math.max(1, Math.round(max / 10));
		while (scaleValue <= max){
			var gridX = drawingWidth * (scaleValue/max) + this.options.padding;
			this.drawLine( gridX, 0, gridX, drawingHeight + 2 * padding, this.options.gridColor);

			//writing grid markers
			this.writeText(this.options.gridColor, this.options.gridFont, scaleValue, gridX + 5, 15)
			this.writeText(this.options.gridColor, this.options.gridFont, scaleValue, gridX + 5, drawingHeight + 2 * padding - 5)
			scaleValue += gridScale;
		}
	}
}
HorizontalChart.prototype = Chart;