function queue(){
        this.queueUrl=[]; // File d'url
};

queue.prototype={
		// Ajoute à la fin du tableau l'url trouvé
		push:function(url){
			this.queueUrl.push(url);
		},
		// Supprime le 1er url du tableau et le retourne 
		shift:function(){
			if(this.queueUrl.length == 0) { // Pour le cas où le tableau est vide
				return undefined;
			}
			var url = this.queueUrl[0];
			this.queueUrl.shift();
			return url;
		}
};

module.exports = new queue();

//Test : 
//
//var q = new queue();
//
//q.push("http://test1.com/");
//q.push("http://test2.com/");
//q.push("http://test3.com/");
//q.push("http://test4.com/");
//
//console.log(q.queueUrl.length);
//console.log(q.shift());
//console.log(q.shift());
//console.log("1er element de la file :");
//console.log(q.queueUrl[0]);