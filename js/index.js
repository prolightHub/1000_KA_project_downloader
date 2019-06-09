var limit = 60;
var totalLimit = 10000;
var amt = 4;
var stop = false;

var _url = "https://www.khanacademy.org/api/internal/scratchpads/top?casing=camel&sort=3&limit=" + limit + "&subject=pjs&topic_id=xffde7c31";
var json;

function get(url)
{
	$.getJSON(url, function(data)
	{
		if(!json)
		{
			json = data;
		}else{
			json.scratchpads = json.scratchpads.concat(data.scratchpads);
		}	

		if(data.complete)
		{
			json.complete = true;
			console.log("End of list!");
			return;
		}

		if(stop)
		{
			return;
		}

		// console.log(json.scratchpads.length);

		get(_url + "&cursor=" + data.cursor);
	});
}

for(var i = 0; i < amt; i++)
{
	get(_url);	
}


var intervalID = window.setInterval(function() 
{
	if(json && !stop && json.scratchpads.length >= totalLimit)
	{
		stop = true;

		console.log("Completed step 1 of 3");
		process(json);

		window.clearInterval(intervalID);
	}
}, 500);