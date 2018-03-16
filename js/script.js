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
			Success: '#70C167',
			Complications: 'rgba(255, 193, 7, .6)',
			Failure: 'rgba(221, 40, 19, .8)'
		}
	}
);
stackedChart.draw(data.outcome);


const pieChart = new PieChart(
	{
		canvas: canvas2,    
		padding: 20,	
		font: '20px Monospace',		
		colors: ['#fe4e00', '#fd7690', '#66cc66', '#ffae03', '#aae4b7', '#f0caca', '#d1c4a4', '#66cdaa', '#ceea8a', '#ffd319']
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
		colors: ['#fe4e00', '#fd7690', '#66cc66', '#ffae03', '#aae4b7', '#f0caca', '#d1c4a4', '#66cdaa', '#ceea8a', '#ffd319']
	}
);
const btnYears = document.getElementById('btnYears');
const chkOutcomes = document.getElementById('chkOutcomes');
let selectedYearButton = btnYears.firstElementChild;
let selectedOutcomes = ['Success'];
refreshSurgeryData();

btnYears.addEventListener('click', function(e){
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

//scrolling
const links = document.querySelectorAll('#navbarNavAltMarkup>div>a');
links.forEach(i=>i.addEventListener('click', clickedLink));

function clickedLink(event){
	var scrollTo = document.getElementById(event.target.href.split('#')[1]);
	event.preventDefault();
	scrollTo.scrollIntoView({behavior: 'smooth', inline: 'nearest'})
}

let activeLink;
window.addEventListener('scroll', function(){
	if (window.scrollY > 195 && window.scrollY < 690)
		activate(0);
	else if (window.scrollY >= 690 && window.scrollY < 1090)
		activate(1);
	else if (window.scrollY >= 1090)
		activate(2);
	else activate();
	
})

function activate(index){
	if (activeLink)
		activeLink.classList.remove('active','rounded');	
	if (index!==undefined){
		links[index].classList.add('active','rounded');
		activeLink = links[index];
	}
}
















