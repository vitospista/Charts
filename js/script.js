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

const stackedChart = new StackedChart(
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


const pieChart = new PieChart(
	{
		canvas: canvas3,    
		padding: 20,	
		font: '20px Monospace',		
		colors: ['#fe4e00', '#fd7690', '#ceea8a', '#ffae03', '#aae4b7', '#f0caca', '#d1c4a4', '#66cdaa', '#66cc66', '#ffd319']
	}
);
const select = document.getElementById("dropCategories");
//create buttons for DropDown
for(let categ in data.operativity) {
	let btn = document.createElement('button');
	btn.type = 'button';
	btn.className = 'dropdown-item';
	btn.value = categ;
	btn.innerHTML = categ;
	btn.addEventListener('click', ()=> pieChart.draw(data.operativity[categ]));
	select.appendChild(btn);
}
select.firstElementChild.click();


const horizontalChart = new HorizontalChart(
	{
		canvas: canvas4,       
		padding: 20,
		spacing: 10,
		gridColor: 'lightgrey',
		gridFont: 'bold 10px Arial',
		legendFont: '20px Monospace',
		colors: ['#fe4e00', '#fd7690', '#ceea8a', '#ffae03', '#aae4b7', '#f0caca', '#d1c4a4', '#66cdaa', '#66cc66', '#ffd319']
	}
);
const btnYears = document.getElementById('btnYears');
const chkOutcomes = document.getElementById('chkOutcomes');
let selectedYearButton = btnYears.firstElementChild;
let selectedOutcomes = ['Success'];
refreshSurgeryData();

btnYears.addEventListener('click', function(e){
	//console.log(e.target);
	if (e.target !== selectedYearButton){
		selectedYearButton.classList.remove('active');
		e.target.classList.add('active');
		selectedYearButton = e.target;
		refreshSurgeryData();	
	}
});

chkOutcomes.addEventListener('click', function(e){	
	if (!e.target.type)
		return;
	
	let index = selectedOutcomes.indexOf(e.target.value);
	if (index === -1){
		selectedOutcomes.push(e.target.value);
	} else {
		selectedOutcomes.splice(index, 1);
	}
	refreshSurgeryData();
})

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

function refreshSurgeryData(){
	let yearData = filterSurgery(selectedYearButton.value, selectedOutcomes);
	horizontalChart.draw(yearData);	
}



















