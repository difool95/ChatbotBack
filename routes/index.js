var express = require('express');
var router = express.Router();
var textToSpeech = require('../helpers/tts');
const fs = require('fs')
const { Deepgram } = require('@deepgram/sdk')
const deepgram = new Deepgram('c5da237b45393667a1f2866a3593cf0f20580d83')
const axios = require('axios');
const mime = require('mime-types');
const path = require('path');
//const host = 'http://localhost:5000'
const host = 'https://mouvmntchatbotback.onrender.com'
/* GET home page. */
router.post('/talk', function (req, res) {
  let language = req.body.language;
  console.log(req.body.context);
  textToSpeech(req.body.text, req.body.language, req.body.context)
    .then(result => {
      let { blendData, filename, filena } = result;
      axios.post(host + '/subtitle', { filena, language })
        .then((response) => {
          //console.log(response.data);
          res.json(result);
          console.log("done");
        })
        .catch((error) => {
          console.error(error);
        });
    })
    .catch(err => {
      res.json({});
    });


});

router.post('/clearStorage', function (req, res) {
  const folderPath = path.join(__dirname, '../public'); // Replace with the actual path of the folder you want to delete files from

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(folderPath, file);

      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(`Deleted file: ${filePath}`);
      });
    });
  });
})
router.post('/subtitle', function (req, res) {
  var randomString2 = req.body.filena
  var language = req.body.language;
  let languageOption = "";
  if (language == "french") {
    languageOption = ""
  }
  if (language == "english") {
    languageOption = "en"
  }
  if (language == "arabic") {
    languageOption = "";
  }
  if (languageOption != "") {

    fs.readFile(path.join(__dirname, '../public/speech-') + randomString2 + ".mp3", (error, data) => {
      if (error) {
        console.error(error);
      } else {
        // 'data' contains the buffer of the audio file
        const mimeType = mime.lookup(path.join(__dirname, '../public/speech-') + randomString2 + ".mp3"); // Get the MIME type based on the file path

        deepgram.transcription
          .preRecorded(
            {
              buffer: data,
              mimetype: mimeType
            },
            { punctuate: true, utterances: true, language: languageOption }
          )
          .then((response) => {
            // WebVTT Filename
            const stream = fs.createWriteStream(path.join(__dirname, '../public/') + randomString2 + '.vtt', { flags: 'a' })
            stream.write(response.toWebVTT());
            //console.log(response.toWebVTT());
            //var subtitlestring = response.toWebVTT();
            //const modifiedString = subtitlestring.replace("dièse", "#");
            //console.log(modifiedString);

            res.json(true);
          })
          .catch((error) => {
            console.log({ error })
          })
      }
    });
  }
  else {
    res.json(true);
  }


})
module.exports = router;
