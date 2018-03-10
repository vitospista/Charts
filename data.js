(function(window){
const outcomes = Object.freeze({
	SUCC: "Success", 
	COMPL: "Complications", 
	FAIL: "Failure"
});
const specialties = Object.freeze({
	ANES: "Anesthesia",
	CARD: "Cardiology",
	DENT: "Dentistry",
	DERM: "Dermatology",
	NEUR: "Neurology",
	OBST: "Obstetrics",
	SURG: "Surgery"	
});
const surgeryTypes = Object.freeze({
	BYPA: "Bypass surgery",
	BREA: "Breast implants",
	HIPS: "Hips replacement",
	KNEE: "Knee replacement",
	VALV: "Valve surgery",
	STIT: "Stitches"
});
const years = [
	2016,
	2017,
	2018
];
const names = [
	"Virgil Zara Howland",
	"Lenny Joy Boon",
	"Bridget Malinda",
	"Dalton Moore",
	"Rosalynne Nigel",
	"Addie Adcock",
	"Desiree Lucas",
	"Adam Carter",
	"Leanne Brier",
	"Mylee Pearson",
	"Justice Salazar",
	"Litzy Wilcox",
	"Damari Craig",
	"Malaki Choi",
	"Alanna Burnett",
	"Donavan Ellis",
	"Darrell Foster",
	"Selena Andersen",
	"Peyton Preston",
	"Paxton Huerta",
	"Gaven Turner",
	"Lilah Torres",
	"Luz Tran",
	"Amara Landry",
	"Noemi Mccann",
	"Barbara Mcclure",
	"Dallas Huerta",
	"Damian Saunders",
	"Roman Sherman",
	"Ayden Lopez",
	"Selah Duffy",
	"Maliyah Byrd",
	"Isiah Massey"
];

let doctors = names.map(function(i){
	let specialtyCount = Object.keys(specialties).length;
	let specialtyIndex = Math.floor(Math.random()*specialtyCount);
	return {name: i, spec: Object.values(specialties)[specialtyIndex]};
});

let interventions = [];
for (let i=0; i < 1000; i++){
	let doctorIndex = Math.floor(Math.random()*doctors.length);
	let yearIndex = Math.floor(Math.random()*years.length);
	let outcomeIndex = Math.floor(Math.random()*3);
	
	let newIntervention = {
		year: years[yearIndex],
		doctor: doctors[doctorIndex],
		outcome: Object.values(outcomes)[outcomeIndex]
	};
	
	if (newIntervention.doctor.spec===specialties.SURG){
		surgeryTypeCount = Object.keys(surgeryTypes).length;
		let surgeryIndex = Math.floor(Math.random()*surgeryTypeCount);
		newIntervention.surgeryType = Object.values(surgeryTypes)[surgeryIndex];
	}
	interventions.push(newIntervention);
};

let outcomeData = {};
interventions.map(function(i){
	if (!outcomeData[i.doctor.name]){
		outcomeData[i.doctor.name] = {[i.outcome]: 1};
	} else if (!outcomeData[i.doctor.name][i.outcome]){
		outcomeData[i.doctor.name][i.outcome] = 1; 
	} else {
		outcomeData[i.doctor.name][i.outcome]++;
	}
});

let operativityData = {};
interventions.map(function(i){
	if (!operativityData[i.doctor.spec]){
		operativityData[i.doctor.spec] = {[i.doctor.name]: 1};
	} else if (!operativityData[i.doctor.spec][i.doctor.name]){
		operativityData[i.doctor.spec][i.doctor.name] = 1; 
	} else {
		operativityData[i.doctor.spec][i.doctor.name]++;
	}
});

let surgeries = interventions.filter(
	i => i.doctor.spec===specialties.SURG
);

let surgeryData = {};
surgeries.map(function(i){
	if (!surgeryData[i.year]){
		surgeryData[i.year] = {[i.surgeryType]: {[i.outcome]: 1}};
	} else if (!surgeryData[i.year][i.surgeryType]){
		surgeryData[i.year][i.surgeryType] = {[i.outcome]: 1}; 
	} else if (!surgeryData[i.year][i.surgeryType][i.outcome]){
		surgeryData[i.year][i.surgeryType][i.outcome] = 1;
	} else {
		surgeryData[i.year][i.surgeryType][i.outcome]++;
	}
});

window.data = {
	outcome: outcomeData,
	operativity: operativityData,
	surgery: surgeryData
}

})(window)