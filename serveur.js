var express = require('express');
var morgan = require('morgan'); // Charge le middleware de logging
var logger = require('log4js').getLogger('Server');
var bodyParser = require('body-parser');
var XMLHttpRequest = require('xhr2');
var app = express();

var token="iPt5AYfkmCNrvIN1wXzU0Bpw3uXrcfWttfQvALUwqSuser5NDnsPMdzaJr58Wrgn";
var idDevice;
var idSensorTemp;
var temps = {};

// config
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan('combined')); // Active le middleware de logging

app.use(express.static(__dirname + '/public')); // Indique que le dossier /public contient des fichiers statiques (middleware chargé de base)

logger.info('server start');

//Function
function getDevice()
{
	var adr = "https://api.sensit.io/v1/devices";
	var http = new XMLHttpRequest();
	http.open("GET", adr, true);
	http.setRequestHeader("Authorization", "Bearer " + token);
	http.onreadystatechange = function()
	{
		if(http.readyState==4)
		{
			var t=JSON.parse(http.responseText);
			idDevice = t.data[0].id;
			logger.info('Recuperation de id device : ' + idDevice);
		}
	}
	http.send(null);
	return idDevice;
};

function getTemperature(idDev, idSen)
{
	var adr = "https://api.sensit.io/v1/devices/" + idDev + "/sensors/" + idSen;
	var http = new XMLHttpRequest();
	http.open("GET", adr, true);
	http.setRequestHeader("Authorization", "Bearer " + token);
	http.onreadystatechange = function()
	{
		if(http.readyState == 4)
		{
			var t = JSON.parse(http.responseText);
			for(var i = 0; i < t.data.history.length; i++)
			{
				var temp = t.data.history[i].data;
				var date = t.data.history[i].date;
				temps[i] = {temp, date};
				logger.info('Recuperation de temp : ' + temps[i].temp);
			}
		}
	}
	http.send(null);
	return temps;
};
		
function getSensors(id)
{
	var adr = "https://api.sensit.io/v1/devices/" + id;
	var http = new XMLHttpRequest();
	http.open("GET", adr, true);
	http.setRequestHeader("Authorization", "Bearer " + token);
	http.onreadystatechange = function()
	{
		if(http.readyState==4)
		{
				var t = JSON.parse(http.responseText);
				for(var i = 0; i < t.data.sensors.length; i++)
				{
					idSensorTemp[i] = t.data.sensors[i].id;
					logger.info('Recuperation de id sensor : ' + idSensorTemp[i]);
				}
		}
	}
	http.send(null);
	return idSensorTemp;
};

// route
app.get('/', function(req, res)
{
	if (idDevice != null) 
	{
		if (idSensorTemp != null) 
		{
			if (temps != null) 
			{
				res.render('affichage', { device : idDevice, sensors : idSensorTemp, temperature : temps});
			}
			else
			{
				for (var i = 0; i <= idSensorTemp.length; i++)
				{
					temps[i] = getTemperature(idSensorTemp);
				}
				res.redirect('/');
			}
		}
		else
		{
			idSensorTemp = getSensors(idDevice);
			res.redirect('/');
		}
	}
	else
	{
		idDevice = getDevice();
		res.redirect('/');
	}   
});

app.listen(1313); 