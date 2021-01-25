require('dotenv').config();    //подключение библиотеки для обращения к переменным окружения
const mysql = require('mysql2');  //подключение библиотеки для работы с БД
const {
	VK,
	Keyboard
} = require('vk-io');                //подключение библиотеки ВК
const express = require('express');
const TOKEN = process.env.TKN;           //инициализация Токена из группы ВК
const vk = new VK({
	token: TOKEN
});
const connection = mysql.createConnection({             //объявление параметров для подключения к БД
  host:process.env.HST,
  port: process.env.PRT,
  user: process.env.USR,
  database: process.env.DB,
  password:process.env.PSWRD
});
connection.connect(function(err){                            //подключение к БД
    if (err) {
      	return console.error("Ошибка: " + err.message);
    }
    else{
     	console.log("Подключение к серверу MySQL успешно установлено");
   	}
});
var artist;
function getTime(){
	var min, hours,seconds;
	var date=new Date();
	hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    seconds  = date.getSeconds();
    seconds= (seconds < 10 ? "0" : "") + seconds;
    console.log(hour+":"+min+":"+seconds);
	}
function sendPost(){
	getTime();
	/*switch(hour+":"+min){
		case "18:40": console.log("1 alarm 17:35"); 
		break;
		case "18:41": console.log("2 alarm 13:33"); 
		break;
		case "18:43": {
			console.log("________________ryry_________");
			//console.log("по идее артист");
			//connection.query('SELECT artist FROM musicdl.topchart WHERE id=(SELECT MAX(id) FROM musicdl.topchart)',function(results){console.log(results)}); 
		}
		break;
		default:
		break;
	}*/
	//console.log(hour+":"+min+":"+seconds);
}
setInterval(()=>getTime(),6000);
vk.updates.on('message', (context, next) => {

	const {
		messagePayload
	} = context;
	console.log("Id отправителя ["+context.senderId+"]");
	console.log("Тип отправителя ["+context.senderType+"]");
	//console.log(context.peerId);
	console.log("Текст сообщения ["+context.text+"]");
	console.log("Тип сообщения ["+context.type+"]");
	//console.log(context.forwards);
	//
	var withoutbreakets = context.attachments;
	var urlaudio;
	if (context.senderType == 'user') {
		switchMessage();
		console.log("Switch to user");
	}
	if (context.senderType == '145350887') {
		console.log("Switch to robot");
	}
	function switchMessage() {
		switch (context.text) {
			case null:
				sendLink();
				break;
			case "Начать":
				context.send('А волшебное слово?');
				context.sendPhoto("https://sun9-68.userapi.com/c857628/v857628050/f90d3/Tt8rOwAa5sY.jpg");
				break;
			case "Привет":
				context.send('Пока');
				context.sendAudioMessage("https://musicboss.org/get/music/20170902/musicbossorg_Coldplay_-_Politik_47952868.mp3");
				break;
			case "lol":
				context.send('привет lol, а я бот. Рад знакомству');
				context.sendDocument("./file.pdf");
				break;
			default:
				context.send('Пришли мне сообщение с прикреплённым аудио или чьё-то голосовое сообщение, а я пришлю тебе ссылку для скачивания этого файла;)');
				const sql1='SELECT artist FROM topchart WHERE id=(SELECT MAX(id) FROM topchart)';
				const sql3='SELECT * FROM topchart';
				const par=['(SELECT MAX FROM topchart)'];
				connection.query(sql1,par,function(err,results){
					if (err) console.log("Ошибки с извлечением данных "+err);
					//console.log(JSON.stringify(results));
					var res=JSON.stringify(results);
					var fp=res.indexOf(':',1);
					var lp=res.indexOf('}',1);
					fp+=2;
					lp-=1;
					artist=res.slice(fp,lp)
					artist=res;
					console.log("Данные из бд "+artist);
					context.send(artist);		
				});
				break;
		}
	}
	function sendLink() {
		if (context.attachments[0]) { 
			urlaudio = (withoutbreakets[0].url);
			//console.log(context.attachments[0]);
			//console.log("2");
			//console.log(context.attachments);
			context.send("Название песни "+withoutbreakets[0].title+"\nИсполнитель " +withoutbreakets[0].artist);
			context.send(urlaudio);
			var A,T,I;
			A=withoutbreakets[0].artist;
			T=withoutbreakets[0].title;
			I=context.senderId;
			if (A!=undefined && T!=undefined){
			const sql2='INSERT INTO musicdl.topchart(artist, track,user_id,dates) VALUES (?,?,?,NOW())';
			const par2=[A,T,I];
			connection.query(sql2,par2,
				function(err,results){console.log("Добавлена запись в БД под номером ["+results.insertId+"]")});
						}
			console.log("______________________________________________");
			console.log(A+"            "+T+"             "+I);
			console.log("______________________________________________");
			return next();
		} if (context.forwards[0].attachments[0]) {
			// urlaudio=(withoutbreakets[0].url);
			//console.log("3");
			//console.log(context.forwards[0].attachments[0].url);
			urlaudio = (context.forwards[0].attachments[0].url);
			//console.log("3");
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
	context.state.command = messagePayload && messagePayload.command ?
		messagePayload.command :
		null;
	return next();
});
//console.log("МЫ ВЫШЛИ ИЗ МЕТОДА");
//sendPost();
vk.updates.start().catch(console.error);

