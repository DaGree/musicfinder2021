const {
	VK,
	TEST
} = require('vk-io');
const fetch = require('node-fetch');
const download = require('image-downloader')
var request = require('request');
var fs = require('fs');
const { addSlashes, stripSlashes } = require('slashes');
const { image_search , image_search_generator } = require('duckduckgo-images-api')
const express = require('express')
const fileGetContents = require('file-get-contents');
var httpBuildQuery = require('http-build-query');
const TOKEN = "2##55f3add656d6c3fed9bfe367b8a173b45a494ae3515d394960453f02e58100d8f6f09caa143162b18a653";
var vk = new VK({
	token: TOKEN
});
const redditimage = require("reddit.images");
const reddit = require("reddit-scrapper")

//for wall post
var owner_id = '145350887';
var access_token = '1##6e12c66af7ea3f26717bfc9ab178aca592e4a18fa0a2ad462a920c849feed1954274d89f61f7c253f54b7';
var message;
var image  = 'https://loremflickr.com/cache/resized/defaultImage.small_800_600_nofilter.jpg';

var artist;
var title;
var audio_id;

// var context;

function	findGroupImage(name){
	image_search({ query: name+" группа",iterations : 2 , moderate: true }).then(results=>{
		console.log(results[getRandomInt(10)].image);
		context.sendPhoto(results[getRandomInt(10)].image);
		
	});
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
  }

  

vk.updates.on('message', (context, next) => {

	const {
		messagePayload
	} = context;
	console.log(context);

	console.log(context.forwards);
	//
	var withoutbreakets = context.attachments;
	var urlaudio;
	//console.log(context.attachments[0].url);

	if (context.senderType == 'user') {
		switchMessage();
		console.log("user");
	}
	if (context.senderType == '-145350887') {
		console.log("robot");
	}



	function switchMessage() {
		if( context.attachments!=0){
			sendLink();
		}
		else {
		switch (context.text) {
			case null:
				sendLink();
				break;
			case "Начать":
				context.send('А волшебное слово?');
				context.sendPhotos("https://sun9-68.userapi.com/c857628/v857628050/f90d3/Tt8rOwAa5sY.jpg");
				break;
			case "Привет":
				context.send('Пока');
				context.sendAudioMessage("https://musicboss.org/get/music/20170902/musicbossorg_Coldplay_-_Politik_47952868.mp3");
				break;
			case "1":
             photoLoader();

				break;
                case "lol":
                redditNew();
			
				break;
                  case "2":
			   getGenre();
				//  getid();
				break;
				case "3":
					context.sendPhotos("photo100172_166443618");
					//findGroupImage("Музыкальная");
			case "id":
				context.send(context.senderId);
				
				break;
			default:
				context.send('Пришли мне сообщение с прикреплённым аудио или чьё-то голосовое сообщение, а я пришлю тебе ссылку для скачивания этого файла;)');
				break;
		}
	}
	}
	//context.send('Пришли мне сообщение с прикреплённым аудио или чьё-то голосовое сообщение, а я пришлю тебе ссылку для скачивания этого файла;)')
	



	function photoLoader(link){

		var typeOfImage=['jazz','rock',"metall","blues","vinyl"];
		var randomType=typeOfImage[getRandomInt(typeOfImage.length-1)];
	//link	https://pixabay.com/api/?key=20030969-600c6fdd0e1a1c2f756316258&q=jazz&image_type=photo&category=music&pretty=true
var linkMain=	'https://pixabay.com/api/?key=20030969-600c6fdd0e1a1c2f756316258&q='+randomType+'&image_type=photo&category=music&pretty=true';
	fileGetContents(linkMain).then(
		(result) => { 
			//getGenre();
	var obj = JSON.parse(result);
	console.log(obj.hits[getRandomInt(10)].webformatURL); //рандомно выбираем одну из 10 фоток
	linkMainFin = obj.hits[getRandomInt(10)].webformatURL;

			
	var options = {
		url: link, //or linkMainFin
		dest: 'C:/Users/litar/Desktop/bot/images/'+randomType+'.jpg'                // will be saved to /path/to/dest/image.jpg
	  }
	  
	  download.image(options)
		.then(({ filename }) => {
		  console.log('Saved to', filename);
		  
		  getid(randomType); 
		  // saved to /path/to/dest/image.jpg
		})
		.catch((err) => console.error(err))

	});
}



	function getid(variable){ //функцию потом стоит переименовать
				fileGetContents('https://api.vk.com/method/photos.getWallUploadServer?group_id=' + owner_id + '&access_token=' + access_token + '&v=5.130').then(
			 (result) => { //сначала обращается к вк для того чтобы он выделил нам сервер и дал ссылку для прикрепления к этой ссылке картинки в формате мультипарт
		 var obj = JSON.parse(result);
		 var randomType = variable;
		 console.log(obj.response.upload_url); //нужная нам ссылка
		console.log(obj);
		var options = {
			'method': 'POST',
			'url': obj.response.upload_url,
			'headers': {
			  'Cookie': 'remixlang=3'
			},
			formData: {
			  'photo': {
				'value': fs.createReadStream('C:/Users/litar/Desktop/bot/images/'+randomType+'.jpg' ), 
				'options': {
				  'filename': '',
				  'contentType': null
				}
			  }
			}
		  };
		  request(options, function (error, response) { //передаём серверу файл с картинкой
			if (error) throw new Error(error);
			var object = JSON.parse(response.body);		//получаем инфу чтобы её на сервере сохранить 
			console.log(object.hash);
			console.log(object.server);
		    console.log(stripSlashes(object.photo));
			fileGetContents('https://api.vk.com/method/photos.saveWallPhoto?group_id=' + owner_id + '&server=' + object.server + '&photo=' + stripSlashes(object.photo) + '&hash=' + object.hash + '&access_token=' + access_token + '&v=5.130').then(
				(results)=>{ //сохраняем каптинку и получаем информацию о id для дальнейшей публикации на стене
				console.log(JSON.parse(results));
				results=JSON.parse(results);
				console.log(results.response[0].owner_id);
				//results=JSON.parse(results);
				console.log(results.response[0].id);
	
					post(results.response[0].owner_id, results.response[0].id,randomType);
				
			});
		
			//console.log(response.body.photo);
		//	console.log(response.body);
		  });
		  })
		  //var uploadUrl=obj.response.upload_url;


		// var options = {
		// 	'method': 'POST',
		// 	'url': uploadUrl,
		// 	'headers': {
		// 	  'Cookie': 'remixlang=3'
		// 	},
		// 	formData: {
		// 	  'photo': {
		// 		'value': fs.createReadStream('https://sun9-68.userapi.com/c857628/v857628050/f90d3/Tt8rOwAa5sY.jpg'),
		// 		'options': {
		// 		  'filename': '',
		// 		  'contentType': null
		// 		}
		// 	  }
		// 	}
		//   };
		//   request(options, function (error, response) {
		// 	if (error) throw new Error(error);
		// 	console.log(response.body);
		//   });



	}

    function redditNew(){
        
reddit({
    search:"funny",
    limits: 2
}).then(response => {
    console.log(response);
   
    context.send(response.data[1].image);
    context.send(response.data[1].title);
    console.log(response.data[1].image);
 
}).catch(error => {
    console.log(error);
//    
})
        
}
    
    
    function post(first_id,second_id,msg){

		//getGenre()

			console.log('photo'+first_id+'_'+second_id );
			var  params = {
		  v: '5.126',
		  access_token: access_token,
		  owner_id : '-' + owner_id, 
		  from_group: '1', 
		  message : message,
		  attachments : 'photo'+first_id+'_'+second_id +','+ audio_id
			};
			  
			  fileGetContents('https://api.vk.com/method/wall.post?' + httpBuildQuery(params));
			  console.log("puf");
    }
    
    
     function reddit(){
        const memeSubreddit = [
    'memes',
    'AdviceAnimals',
    'AdviceAnimals+funny+memes',
    'funny',
    'PrequelMemes',
    'SequelMemes',
    'MemeEconomy',
    'ComedyCemetery',
    'PewdiepieSubmissions',
    'dankmemes',
    'terriblefacebookmemes',
    'shittyadviceanimals',
    'wholesomememes',
    'me_irl',
    '2meirl4meirl',
    'i_irl',
    'meirl',
    'BikiniBottomTwitter',
    'trippinthroughtime',
    'boottoobig',
    'HistoryMemes',
    'fakehistoryporn',
    'OTMemes',
    'starterpacks',
    'gifs',
    'rickandmorty',
    'FellowKids',
    'Memes_Of_The_Dank',
    'raimimemes',
    'comedyhomicide',
    'lotrmemes',
    'freefolk',
    'GameOfThronesMemes',
    'howyoudoin',
    'HolUp',
    'meme',
    'memeswithoutmods',
    'dankmeme',
    'suicidebywords',
    'puns',
    'PerfectTiming'
];
       
//use with await
//redditimage.fetch({ type: "meme" }); //returns 1 meme

//use with callback
//redditimage.fetch({ type: "music" })
//.then((result) => {
//  console.log(result)
//    //context.send(urlaudio);
//}); //returns 1 meme

//options
redditimage.fetch({
  type: "custom",
  total: 1,
   addSubreddit: ["memes", "funny"]
 // removeSubreddit: ["dankmemes"],
}).then((result) => {
  console.log(result);
    context.sendPhoto(result[0].image);
    context.send(result[0].title);
    console.log(result[0].image);
    
});//returns 50 memes by filtering

//custom image fetch from given subreddits
//redditimage.fetch({
//  type: "custom",
//  total: 50,
//  subreddit: ["cats"],
//}); //returns 50 cat images
          
     }
    
	function sendLink() {
		if (context.attachments[0]) { 
			urlaudio = (withoutbreakets[0].url);
			artist = (withoutbreakets[0].artist);
			title = withoutbreakets[0].title;
			// withoutbreakets=
			console.log(context.attachments[0]);
			console.log("2");
			console.log(context.attachments);
			// context.send("https://vk.com/audios"+context.senderId);
			context.send(withoutbreakets[0].title+" - " +withoutbreakets[0].artist);
			context.send(urlaudio);
			getGenre();

			function getGenre(){
				var requestOptions = {
					method: 'GET',
					redirect: 'follow'
				  };
				 // title= 'HFHFHFHF';
				 // artist= 'Mefrrca';
				  
				 message=artist+ " - "+ title;
				  fetch("https://api.discogs.com/database/search?release_title="+title+"&artist="+artist+"&per_page=3&page=1&token=aKuIvTINEIUwrhNvbHBdiNJyZwQDCCtFpZoHMWdX", requestOptions)
					.then(response => response.text())
					.then((result) => {
						var answer = JSON.parse(result).results[0];
						console.log(answer);
						if(answer!=undefined){
						message =  title +". Год выпуска: "+answer.year+". Жанр: " +answer.genre[0]+", " +answer.style[0];
						console.log(message);
						}
						else { 
							
						message=artist+ " + "+ title;
						console.log(message);}
					});
					//.catch(error => console.log('error', error));
					//return message;
			}
			console.log("!!!!!!!!"+artist+"!!!!!!!!!!!!!!!!!!!");
			//context.sendDocument("./file.mp3");

			//
			audio_id = "audio"+withoutbreakets[0].ownerId+"_"+withoutbreakets[0].id;

			if (artist!=undefined){
			image_search({ query: artist + " группа",iterations : 2 , moderate: true }).then(results=>{
				var photo = results[getRandomInt(5)].image;
				console.log(photo);
				//context.send("'"+photo+"'");
				
			photoLoader(photo);
			});
		} else {
			image_search({ query: title + " группа",iterations : 2 , moderate: true }).then(results=>{
				var photo = results[getRandomInt(5)].image;
				console.log(photo);
				//context.send("'"+photo+"'");
				
			photoLoader(photo);
			});
		}
			console.log("2");
			return next();
		} if (context.forwards[0].attachments[0]) {
			// urlaudio=(withoutbreakets[0].url);
			console.log("3");
			console.log(context.forwards[0].attachments[0].url);

			// context.send("https://vk.com/audios"+context.senderId);
			urlaudio = (context.forwards[0].attachments[0].url);
			console.log("3");
			context.send(urlaudio);
			return next();
		}
		if (context.forwards[0].forwards[0].attachments[0]) {
			urlaudio = (context.forwards[0].forwards[0].attachments[0].url);
			context.send(urlaudio);
		}
		else {
			urlaudio = (context.forwards[0].forwards[0].forwards[0].attachments[0].url);
			context.send(urlaudio);
		}
	}

	// withoutbreakets=
	//console.log(context);
	// context.send("https://vk.com/audios"+context.senderId);
	//

	// context.sendPhoto('https://loremflickr.com/400/300/music')
	context.state.command = messagePayload && messagePayload.command ?
		messagePayload.command :
		null;

	return next();
});

vk.updates.start().catch(console.error);
/*
// Simple wrapper for commands
const hearCommand = (name, conditions, handle) => {
	if (typeof handle !== 'function') {
		handle = conditions;
		conditions = [`/${name}`];
	}

	if (!Array.isArray(conditions)) {
		conditions = [conditions];
	}

	vk.updates.hear(
		[
			(text, { state }) => (
				state.command === name
			),
			...conditions
		],
		handle
	);
};
/*
// Handle start button
hearCommand('start', (context, next) => {
	context.state.command = 'help';

	return Promise.all([
		context.send('Hello!'),

		next()
	]);
});

hearCommand('help', async (context) => {
	await context.send({
		message: `
			My commands list
			/help - The help
			/time - The current date
			/cat - Cat photo
			/purr - Cat purring
      /telega - Telega link
		`,
		keyboard: Keyboard.keyboard([
			Keyboard.textButton({
				label: 'The help',
				payload: {
					command: 'help'
				}
			}),
			Keyboard.textButton({
				label: 'The current date',
				payload: {
					command: 'time'
				}
			}),
      
        	Keyboard.textButton({
					label: 'Want telega',
					payload: {
						command: 'telega'
					},
					color: Keyboard.POSITIVE_COLOR
				}),
			[
				Keyboard.textButton({
					label: 'Cat photo',
					payload: {
						command: 'cat'
					},
					color: Keyboard.PRIMARY_COLOR
				}),
				Keyboard.textButton({
					label: 'Cat purring',
					payload: {
						command: 'purr'
					},
					color: Keyboard.PRIMARY_COLOR
				})
			]
		])
	});
});
hearCommand('telega', async (context) => {
	await Promise.all([
		context.send('t.me/CodenotBot'),

		context.sendPhoto('https://loremflickr.com/400/300/robot/')

  ]);console.log("Vladya sam idi nahu");
});

hearCommand('cat', async (context) => {
	await Promise.all([
		context.send('Wait for the uploads awesome 😻'),

		context.sendPhoto('https://loremflickr.com/400/300/')
	]);console.log("Hello!");
});

hearCommand('time', ['/time', '/date'], async (context) => {
	await context.send(String(new Date()));
});

const catsPurring = [
	'http://ronsen.org/purrfectsounds/purrs/trip.mp3',
	'http://ronsen.org/purrfectsounds/purrs/maja.mp3',
	'http://ronsen.org/purrfectsounds/purrs/chicken.mp3'
];

hearCommand('purr', async (context) => {
	const link = catsPurring[Math.floor(Math.random() * catsPurring.length)];

	await Promise.all([
		context.send('Wait for the uploads purring 😻'),

		context.send(link)
	]);
});
*/