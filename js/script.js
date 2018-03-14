const stackedChart = new StackedChart(
	{
		canvas: canvas1,       
		padding: 20,
		gridScale: 10,
		spacing: 40,
		gridColor: 'darkgrey',
		font: 'bold 10px Arial',
		barWidth: 80,
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
		canvas: canvas2,    
		padding: 20,	
		font: '20px Monospace',		
		colors: ['#fe4e00', '#fd7690', '#ceea8a', '#ffae03', '#aae4b7', '#f0caca', '#d1c4a4', '#66cdaa', '#66cc66', '#ffd319']
	}
);
const select = document.getElementById("dropCategories");
const pieTitle = document.getElementById("pieTitle");
//create buttons for DropDown
for(let categ in data.operativity) {
	let btn = document.createElement('button');
	btn.type = 'button';
	btn.className = 'dropdown-item';
	btn.value = categ;
	btn.innerHTML = categ;
	btn.addEventListener('click', ()=> {
		pieTitle.innerHTML = categ + ' chart';
		pieChart.draw(data.operativity[categ]);
	});
	select.appendChild(btn);
}
select.firstElementChild.click();


const horizontalChart = new HorizontalChart(
	{
		canvas: canvas3,       
		padding: 20,
		spacing: 10,
		gridColor: 'darkgrey',
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



















