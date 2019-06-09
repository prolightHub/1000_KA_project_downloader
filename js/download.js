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
            });
        }
    }
}
function download(scratchpads)
{
    this.alignCode = function(code, width, height)
    {
        if(width && height)
        {
            return "function main()\n{\n\nsize(" + width + ", " + height + ");\n\n\n" + code.toString() + "\n\n}\n\ncreateProcessing(main);";
        }else{
            return "function main()\n{\n\n" + code.toString() + "\n\n}\n\ncreateProcessing(main);";
        }
    };

    this.zip = new JSZip();

    var master = this.zip.folder("projects-top-master");

    var project;
    var l = scratchpads.length;

    // for(var i = 0; i < scratchpads.length; i++)
    while(scratchpads.length > 0)
    {
        var pad = scratchpads[0];

        project = master.folder(pad.relativeUrl.split("/")[2] + "-master");

        if(pad.newUrlPath.indexOf("webpage") !== -1)
        {
            // Webpage
            project.file("index.html", pad.revision.code);
        }
        else if(pad.newUrlPath.indexOf("pjs") !== -1)
        {
            var css = project.folder("css");
                css.file("index.css", projectStructure.css["index.css"]);

            //Processing.js
            var js = project.folder("js");
                js.file("index.js", this.alignCode(pad.revision.code, pad.width, pad.height));
                js.file("loadKa.js", projectStructure.js["loadKa.js"]);

            var libraries = project.folder("libraries");
                libraries.file("processing.js", projectStructure.libraries["processing.js"]);

            project.file("index.html", projectStructure["index.html"].replace("Processing Js", pad.title || ""));
        }

        project.file("scratchpads.json", JSON.stringify(pad));

        scratchpads.shift();

        // console.log(i + 1, "of", l);
    }

    this.zip.generateAsync({type : "blob"}).then(function(content) 
    {
        saveAs(content, "projects-top-master.zip");
    });

    console.log("Completed step 3 of 3");
    console.log("Downloading...");
}