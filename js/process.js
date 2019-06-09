
var scratchpads = [];
const path = "https://www.khanacademy.org/api/internal/scratchpads/";

function process(loadedData)
{
	console.log("Now processing!");

	var pads = loadedData.scratchpads;
	var array;

	var c = 0;

	for(var i = pads.length - 1; i >= 0; i--)
	{
		array = pads[i].url.split("/");
		$.getJSON(path + array[array.length - 1], function(data)
		{
			scratchpads.push(data);

			// console.log(++c, "of", pads.length);
		});
	}

	var setID = window.setInterval(function()
	{
		if(scratchpads.length >= pads.length)
		{
			console.log("Completed step 2 of 3");
			console.log("Now loading...");
			download(scratchpads);

			window.clearInterval(setID);
		}
	}, 500);
}