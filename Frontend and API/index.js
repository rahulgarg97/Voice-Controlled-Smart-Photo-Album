var name = '';
var encoded = null;
var fileExt = null;
window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
const synth = window.speechSynthesis;
const recognition = new SpeechRecognition();
const icon = document.querySelector('i.fa.fa-microphone')
var file = ''

function previewFile(input) {

  let labalElem = document.getElementById("photoLabel");

  
  var reader = new FileReader();
  name = input.files[0].name;
  file = input.files[0];
  fileExt = name.split(".").pop();
  labalElem.innerText = name;
  var onlyname = name.replace(/\.[^/.]+$/, "");
  var finalName = onlyname + "_" + Date.now() + "." + fileExt;
  name = finalName;

  reader.onload = function (e) {
    var src = e.target.result;
    var newImage = document.createElement("img");
    newImage.src = src;
    encoded = newImage.outerHTML;
  }
  reader.readAsDataURL(input.files[0]);
}

function upload() {
  last_index_quote = encoded.lastIndexOf('"');
  if (fileExt == 'jpg' || fileExt == 'jpeg' || fileExt == 'png') {
    encodedStr = encoded.substring(33, last_index_quote);
  }
  else {
    encodedStr = encoded.substring(32, last_index_quote);
  }
  var albumBucketName = "assignment3-imagebucket-n5dmftkngpz0";
  var bucketRegion = "us-west-2";
  var params = {
    "Key": name,
    "Bucket": "assignment3-imagebucket-n5dmftkngpz0",
    "Body": file,
     "ACL": "public-read"
  };

  AWS.config.region = bucketRegion;
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: "us-west-2:0aab97ae-5545-44ed-be1c-2f6bf1daf902"
  });
  var s3 = new AWS.S3({
    apiVersion: "2006-03-01",
    params: { Bucket: albumBucketName }
  });

  s3.putObject(params, function(err, data) {
    if (err) { console.log(err, err.stack);  alert("Some error occurred!");  return }// an error occurred


    alert("Your photo has been uploaded!");
    var input = document.getElementById("inputGroupFile02");
    input.value = '';

  });
}

function searchFromVoice() {
  recognition.start();
  recognition.onresult = (event) => {
    const speechToText = event.results[0][0].transcript;

    var apigClient = apigClientFactory.newClient({ apiKey: "apikey" });
    var params = {
      "q": speechToText
    };
    var body = {
      "q": speechToText
    };

    var additionalParams = {
      queryParams: {
        q: speechToText
      }
    };
    document.getElementById("search").value = speechToText;
    this.search();
    document.getElementById("search").value = '';
  }
}



function search() {
  var div = document.getElementById('div');
  div.innerHTML  = '';
  var searchTerm = document.getElementById("search").value;
  var myHeaders = new Headers();
  // myHeaders.append("Content-Type", "image/jpeg");
  myHeaders.append("X-Amz-Date", "20201212T001914Z");
  myHeaders.append("Authorization", "AWS4-HMAC-SHA256 Credential=" + os.environ.get('AWS_ACCESS_KEY_ID') + "/20201212/us-west-2/execute-api/aws4_request, SignedHeaders=host;x-amz-date, Signature=" + os.environ.get("SIGNATURE"));
  myHeaders.append("Access-Allow-Control-Origin", '*');
  myHeaders.append("Access-Allow-Control-Headers", '*');
  myHeaders.append("Access-Allow-Control-Methods", 'OPTIONS, GET');
  
  var requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  fetch(`https://s93zasv7ka.execute-api.us-west-2.amazonaws.com/prod/search?q=${searchTerm}`, requestOptions)
    .then(response => response.text())
    .then(result =>{
      console.log(result)
      result =  JSON.parse(result).results;
      showImages(result);
    } )
    .catch(error => console.log('error', error));
  }
  



  function showImages(res) {
    var newDiv = document.getElementById("div");

    console.log(res);
    if (res.length == 0) {
        console.log("Inside if");
      var newContent = document.createTextNode("No image to display");
      newDiv.appendChild(newContent);
      var currentDiv = document.getElementById("div1");
      document.body.insertBefore(newDiv, currentDiv);
    }
    else {
      console.log("inside else");
      for (var i = 0; i < res.length; i++) {
        console.log(res[i]);
        var newDiv = document.getElementById("div");
        newDiv.style.display = 'inline'
        var newContent = document.createElement("img");
        newContent.src = res[i];
        newContent.style.height = "200px";
        newContent.style.marginRight = "10px";

        newDiv.appendChild(newContent);
      }
    }
}
