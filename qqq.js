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


vk.updates.on('message', (context, next) => {

	const {
		messagePayload
	} = context;
	console.log(context);

	console.log(context.forwards);
	//
	var withoutbreakets = context.attachments;
	var urlaudio;
	if (context.senderType == 'user') {
		switchMessage();
		console.log("user");
	}
	if (context.senderType == '145350887') {
		console.log("robot");
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
				break;
		}
	}
	function sendLink() {
		if (context.attachments[0]) { 
			urlaudio = (withoutbreakets[0].url);
			console.log(context.attachments[0]);
			console.log("2");
			console.log(context.attachments);
			context.send("Название песни "+withoutbreakets[0].title+"\nИсполнитель " +withoutbreakets[0].artist + "\nЖанр "+withoutbreakets[0].genreID);
			context.send(urlaudio);
			var A,T,I;
			A=withoutbreakets[0].artist;
			T=withoutbreakets[0].title;
			I=context.senderId;
			if (A!=undefined && T!=undefined){
			connection.query('INSERT INTO musicdl.topchart(artist, track,user_id,dates) VALUES (?,?,?,NOW())',
				[A,T,I],
				function(err,results){console.log(results)});
						}
			console.log("________________");
			console.log(A+"            "+T+"             "+I);
			console.log("________________");
			return next();
		} if (context.forwards[0].attachments[0]) {
			// urlaudio=(withoutbreakets[0].url);
			console.log("3");
			console.log(context.forwards[0].attachments[0].url);
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

	context.state.command = messagePayload && messagePayload.command ?
		messagePayload.command :
		null;

	return next();
});
//connection.end();
//console.log("Закрытие соединения");
vk.updates.start().catch(console.error);
