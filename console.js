var oldLog = console.log;

var d = new Date();
var jour = d.getDate(); // Retourne le jour entre 1-31
var mois = d.getMonth()+1; // Retourne le mois entre 0-11 (d'où le plus 1)
var annee = d.getFullYear(); // Retourne l'année sur 4 digits
var heure = d.getHours(); // Retourne l'heure entre 0-23
var minutes = d.getMinutes(); // Retourne la minute entre 0-59
var secondes = d.getSeconds(); // Retourne la seconde entre 0-59

// Vérifie que le jour, le mois, l'heure,la minute et la seconde possède au moins 2 digits

if(jour<9) {
	jour = "0"+jour;
}
if(mois<9) {
	mois = "0"+mois;
}
if(heure<9) {
	heure = "0"+heure;
}
if(minutes<9) {
	minutes = "0"+minutes;
}
if(secondes<9) {
	secondes = "0"+secondes;
}

var date = jour+"/"+mois+"/"+annee+" - "+heure+":"+minutes+":"+secondes+" --"; // Chaine de caractère au format "dd/mm/yyyy - hh:mm:ss --"

console.log = function() {
	var args = Array.prototype.slice.call(arguments);
	args.unshift(date);
	oldLog.apply(console,args);
};

module.exports = console;