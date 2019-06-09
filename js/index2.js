let projectStructure = {
    "css" : {
        "index.css" : "https://raw.githubusercontent.com/prolightHub/KaTemplate/master/css/index.css",
    },
    "js" : {
        "index.js" : "https://raw.githubusercontent.com/prolightHub/KaTemplate/master/js/index.js",
        "loadKa.js" : "https://raw.githubusercontent.com/prolightHub/KaTemplate/master/js/loadKa.js",
    },
    "libraries" : {
        "processing.js" : "https://raw.githubusercontent.com/Khan/processing-js/66bec3a3ae88262fcb8e420f7fa581b46f91a052/processing.js",
    },
    "index.html" : "https://raw.githubusercontent.com/prolightHub/KaTemplate/master/index.html",
};

const proxyUrl = "https://cors-anywhere.herokuapp.com/";
loadCode(projectStructure);

function ajax(url, func)
{
    return fetch(url)
    .then(response => response.text())
    .then(func)
    .catch(err => console.log(err));
}

var c = 0;
function loadCode(object, onFinish)
{
    for(var i in object)
    {
        if(typeof object[i] === "object")
        {
            loadCode(object[i]);
        }
        else if(typeof object[i] === "string")
        {
            ajax(proxyUrl + object[i], content => 
            {
                object[i] = content.toString();
                c++;
            });
        }
    }
}

var limit = 1000;

// has 1 limit, so we can do it one at a time!
var _url = "https://www.khanacademy.org/api/internal/scratchpads/top?casing=camel&sort=3&limit=1&subject=pjs&topic_id=xffde7c31";
var path = "https://www.khanacademy.org/api/internal/scratchpads/";

var urlArray;
var counter = 0;
function iterate(url)
{
    $.getJSON(url, function(data)
    {
        if(counter > limit)
        {
            return;
        }

        urlArray = data.scratchpads[0].url.split("/");
        $.getJSON(path + urlArray[urlArray.length - 1], function(scratchpad)
        {
            act(scratchpad);
        });

        if(data.complete)
        {
            console.log("End of list");
            return;
        }

        counter++;

        iterate(_url + "&cursor=" + data.cursor);
    });
}

function act(scratchpad)
{
    this.zip = new JSZip();

    this.project = {
        title: scratchpad.title,
        filename: scratchpad.relativeUrl.split("/")[2],
        width: scratchpad.width,
        height: scratchpad.height
    };

    var master = this.zip.folder(this.project.filename + "-master");

    if(scratchpad.newUrlPath.indexOf("webpage") !== -1)
    {
        // Webpage
        master.file("index.html", scratchpad.revision.code);
    }
    else if(scratchpad.newUrlPath.indexOf("pjs") !== -1)
    {
        var css = master.folder("css");
            css.file("index.css", projectStructure.css["index.css"]);

        //Processing.js
        var js = master.folder("js");
            js.file("index.js", alignCode(scratchpad.revision.code, this.project.width, this.project.height));
            js.file("loadKa.js", projectStructure.js["loadKa.js"]);

        var libraries = master.folder("libraries");
            libraries.file("processing.js", projectStructure.libraries["processing.js"]);

        master.file("index.html", projectStructure["index.html"].replace("Processing Js", scratchpad.title || ""));
    }

    master.file("scratchpads.json", JSON.stringify(scratchpad));

    this.zip.generateAsync({type : "blob"}).then(function(content) 
    {
        saveAs(content, this.project.filename + "-master.zip");
    });
}

function alignCode(code, width, height)
{
    if(width && height)
    {
        return "function main()\n{\n\nsize(" + width + ", " + height + ");\n\n\n" + code.toString() + "\n\n}\n\ncreateProcessing(main);";
    }else{
        return "function main()\n{\n\n" + code.toString() + "\n\n}\n\ncreateProcessing(main);";
    }
};

function open()
{
    iterate(_url);

    console.log("Done");
}

var id = window.setInterval(function()
{
    if(c >= 4)
    {
        open(_url);
        window.clearInterval(id);
    }
}, 
500);