'use strict';
 
/**
 * Web Scraper
 */
 
function scraper (queue, pageUrl, PORT) {
  
  // Instead of the default console.log, you could use your own augmented console.log !
  var console = require('./console');
   
  // Url regexp from http://daringfireball.net/2010/07/improved_regex_for_matching_urls
  var EXTRACT_URL_REG = /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi;
  
  var request         = require('request');
   
  // You should (okay: could) use your OWN implementation here!
  var EventEmitter    = require('events').EventEmitter;
   
  // We create a global EventEmitter (Mediator pattern: http://en.wikipedia.org/wiki/Mediator_pattern )
  var em              = new EventEmitter();
   
  /**
   * Remainder:
   * queue.push("http://..."); // add an element at the end of the queue
   * queue.shift(); // remove and get the first element of the queue (return `undefined` if the queue is empty)
   */
  var queue = require('./queue');
  //var queue = []; 
  
  // Inclusion de mongoose
  var mongoose = require('mongoose');
  
   // Connection à la base de donnée 'dbUrl' ( Si la base n'existe pas elle est automatiquement crée)
   // ~/mongodb/bin/mongod pour lancer le serveur mongodb
  mongoose.connect('mongodb://localhost/dbUrl', function(err) {
    if (err) { throw err; }
  });
  
  // Création du schéma pour les urls à enregistrer dans la base
  // search correspond à l'url du site à scraper
  // url correspond au lien trouvé
  // date correspond a son entrée en base
  var urlSchema = new mongoose.Schema({
    search : String,
    url : String,
    date : { type : Date, default : Date.now }
  });
  
  // Creation du model à partir du schema
  var UrlModel = mongoose.model('url', urlSchema);
  // Création d'une variable qui contiendra une instance du model
  var urlScraped;
   
  /**
   * Get the page from `page_url`
   * @param  {String} page_url String page url to get
   *
   * `get_page` will emit
   */
  function get_page(page_url){
    em.emit('page:scraping', page_url);
     
    // See: https://github.com/mikeal/request
    request({url:page_url,}, function(error, http_client_response, html_str){
      /**
       * The callback argument gets 3 arguments.
       * The first is an error when applicable (usually from the http.Client option not the http.ClientRequest object).
       * The second is an http.ClientResponse object.
       * The third is the response body String or Buffer.
       */
      
      if(error){
        em.emit('page:error', page_url, error);
        return;
      }
      
      // Tableau qui contient les informations à afficher
      //console.log(http_client_response.headers);
      var response_data = [
        http_client_response.headers['content-length'],
        http_client_response.headers['content-type'],
        http_client_response.headers['content-encoding'],
        http_client_response.headers.server,
      ];
      
      em.emit('page:information',response_data);
      
      em.emit('page', page_url, html_str);
    });
  }
   
  /**
   * Extract links from the web pagr
   * @param  {String} html_str String that represents the HTML page
   *
   * `extract_links` should emit an `link(` event each
   */
  function extract_links(page_url, html_str){
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
    // "match" can return "null" instead of an array of url
    // So here I do "(match() || []) in order to always work on an array (and yes, that's another pattern).
    
    (html_str.match(EXTRACT_URL_REG) || []).forEach(function(url){
      // see: http://nodejs.org/api/all.html#all_emitter_emit_event_arg1_arg2
      // Here you could improve the code in order to:
      // - check if we already crawled this url
      // - ...
      
      if(queue.queueUrl.indexOf(url) < 0){
        // Add the url to the queue
        queue.push(url);
        em.emit('url', page_url, html_str, url);
      }else{
        console.log("Already crawled : ",url);
      }
    });
   
    mongoose.connection.close(); // Fermeture de la connection à la base une fois l'exctraction terminer
    console.log('Database connexion close !');
  }
   
  function handle_new_url(from_page_url, from_page_str, url){
    // Add the url to the queue
    //queue.push(url);
     
    // ... and may be do other things like saving it to a database
    // in order to then provide a Web UI to request the data (or monitoring the scraper maybe ?)
    // You'll want to use `express` to do so
  
    var alreadyInDB = UrlModel.find(null); // Cherche dans la base si l'url passer en parametre est dans la base
    alreadyInDB.where('url', url).limit(1);
    
    alreadyInDB.exec(function (err, urlDB) { // Execution de la requete
      if (err) { throw err; }
      if(urlDB[0] !== 'undefined') {
        urlScraped = new UrlModel();
        urlScraped.search = from_page_url;
        urlScraped.url = url;
        // La date est automatiquement remplie
        
        urlScraped.save(function (err) {
        if (err) { throw err; }
          console.log('Url :',url,' add to the database !');
        });  
      }else {
      console.log('Already in database : ',url)
      }
    });  
  }
  
  // Ajout : Emission des informations de la page :
  em.on('page:information', function(response_data){
    console.log('Size : ', response_data[0]);
    console.log('Content-Type : ', response_data[1]);
    console.log('Content-Encoding : ',response_data[2])
    console.log('Server : ',response_data[3])
  });
  // -- Fin --
   
  em.on('page:scraping', function(page_url){
    console.log('Loading... ', page_url);
  });
   
  // Listen to events, see: http://nodejs.org/api/all.html#all_emitter_on_event_listener
  em.on('page', function(page_url, html_str){
    console.log('We got a new page!', page_url);
  });
   
  em.on('page:error', function(page_url, error){
    console.error('Oops an error occured on', page_url, ' : ', error);
  });
   
  em.on('page', extract_links);
   
  em.on('url', function(page_url, html_str, url){
    console.log('We got a link! ', url);
  });
   
  em.on('url', handle_new_url);
   
  // #debug Start the crawler with a link
  get_page(pageUrl);

}

module.exports = new scraper();