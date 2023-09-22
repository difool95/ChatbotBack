// azure-cognitiveservices-speech.js
require('dotenv').config()
const sdk = require('microsoft-cognitiveservices-speech-sdk');
const blendShapeNames = require('./blendshapeNames');
const _ = require('lodash');
const askGPT = require('./askGPT');
const translate = require('arabic-name-to-en/translate');


let SSML = '';

let SSML2 = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">
<voice name="en-US-JennyNeural">
  <mstts:viseme type="FacialExpression"/>
  __TEXT__
</voice>
</speak>`;

const key = process.env.AZURE_KEY;
const region = process.env.AZURE_REGION;
//<voice name="en-US-JennyNeural">
//<voice name="ar-TN-ReemNeural">
let currentLanguage = "french";
let didChangeLanguage = false;
let triggerNumber = 0;
/**
 * Node.js server code to convert text to speech
 * @returns stream
 * @param {*} key your resource key
 * @param {*} region your resource region
 * @param {*} text text to convert to audio/speech
 * @param {*} filename optional - best for long text - temp file for converted speech/audio
 */
const textToSpeech = async (text, language, context) => {
    // convert callback function to promise
    return new Promise(async (resolve, reject) => {
        let speech = null;
        let ssml = null;
        let ssml2 = null;
        triggerNumber += 1;
        let systemContent = null;
        //systemContent = context;
        ///ChatGPT: "Quoi de neuf chez TT ? Découvrez les services de Tunisie Telecom (TT), tels que proposés par l'utilisateur. Ne dépassez pas 40 mots et répondez dans la langue de l'utilisateur.
        if (language == "arabic") {
            //systemContent = " أنت تشاتبوت مساعدة مفيدة من أورنج تونس ولديك جميع هذه المعلومات. المعلومات: اكتشف خدمات أورانج تونس: 1- حول أورانج تونس: أورانج تونس هو مشغل خاص للاتصالات في تونس. إنه نتيجة تحالف بين أورانج إس.أيه وشركة إنفستيك. بين الرموز المفيدة التي يمكنك استخدامها: تتبع الاستهلاك / المكافأة: نجمة 101 # بوابة الخدمات: نجمة 111 # اشحنني: نجمة 114 * الرقم # اتصل بي: نجمة 115 * الرقم # تحويل الرصيد: نجمة 116 نجمة الرقم نجمة المبلغ نجمة الرقم التعريفي # معرفة رقمي: نجمة 123 # إعدادات الإنترنت والرسائل القصيرة: نجمة 121 # الولاء لأورانج: نجمة 112 # لتتبع استهلاكك للشهر: نجمة 101 نجمة 4 # لمتابعة مكافأة الإنترنت المحمولة: نجمة 101 نجمة 5 # تحصيل الفواتير بمقدار 60 ثانية للمكالمات الوطنية إعادة شحن: نجمة 100 نجمة رمز الشحن # من بين عروض أورانج، نجد ثلاثة عروض مسبقة الدفع: إدوخ : مع عرض إضواءك، استفد من أرخص سعر للدقيقة في السوق واتصل بجميع المشغلين الثابتين والمحمولين في تونس بسعر 35 مليم في الدقيقة على مدار الساعة وطوال أيام الأسبوع ومدى الحياة. يستمر عرض إضواءك في تقديم أفضل سعر للدقيقة في السوق لجميع المشتركين، سواء القدامى أو الجدد. يمكنك طلب حزمة إضواءك التي تشمل 25 جيجابايت بسعر 23.750 دينار والاستفادة من التوصيل المجاني. بعد تفعيل عرضك، ستحصل تلقائيًا على 25 غيغابايت من الإنترنت المحمول صالحة لمدة 30 يومًا. تتبع استهلاكك عبر MyOrange. زان بلاس: مع عرض زن بلس، استفد من سعر دقيقة واحدة فقط نحو جميع المشغلين، بالإضافة إلى: رقمين مفضلين كل شهر. استهلك 10 دنانير واحصل على رقم مفضل من أورانج صالح حتى نهاية الشهر الحالي. استهلك 20 دينارًا واحصل على رقم مفضل لأي مشغل صالح حتى نهاية الشهر الحالي. عالمي: مع العرض الجديد علمي: اتصل في الداخل ونحو فرنسا وإيطاليا وبلجيكا وألمانيا وكندا بنفس السعر. استفد من سعر مميز (ثابت ومحمول) للتواصل مع أحبائك في تونس ودوليًا على مدار الساعة وطوال أيام الأسبوع وبدون قيود. تتم فواتير المكالمات الوطنية بالتدرج بمقدار 60 ثانية. يتم فواتير الاتصال بالدول غير المشمولة في العرض وغير المذكورة أعلاه بسعر الاتصال الدولي الحالي."
        }
        else if (language == "french") {
            //systemContent = "Vous etes la chatbot assistante d'orange tunisie vous avez ces informations Découvrez les services d’Orange tunisie : 1- A propos d’Orange tunisie : Orange Tunisie est un opérateur privé de télécommunications tunisien. Il est le fruit d'une alliance entre Orange SA et la société Investec. Parmi les codes utiles que vous pouvez utiliser Suivi Conso / Bonus : * 101 # Portail de services:  * 111 # Recharge moi: * 114 * numéro # Rappelle-moi: * 115 * numéro # Transfert de crédit: * 116 * numéro * montant étoile  le PIN # Connaître mon numéro: * 123 # Paramétrages internet et SMS: * 121 # Orange Fidélité: * 112 # Pour suivre votre consommation du mois: * 101 * 4 # Pour suivre votre bonus internet mobile: * 101 * 5 # Facturation par palier de 60 secondes pour les appels nationaux Recharge: étoile 100 étoile le code de recharge # Parmi les offres d’Orange on trouve les trois offres Prépayée: A- EDAWAKH: Avec l’offre Edawakh bénéficiez du prix minute le moins cher du marché et appelez vers tous les opérateurs fixe et mobile en Tunisie à seulement 35 millimes la minute 24 Heures sur 24 et 7jours sur 7 et à vie. L'offre Edawakh continue à offrir à tous ses abonnés, anciens et nouveaux, le meilleur tarif minute sur le marché. Vous pouvez commander le pack Edawakh avec 25 Go inclus à 23,750Dinars et bénéficier de la livraison gratuite. Suite à l’activation de votre offre, vous bénéficierez automatiquement de 25 Giga octet d’internet mobile valables 30 jours. Suivi consommation sur MyOrange B- ZEN PLUS: Avec l’offre Zen plus profitez d’un tarif minute unique vers tous les opérateurs mais également de : Deux numéros favoris chaque mois : Consommez 10 dinars et bénéficiez immédiatement d’un numéro Orange favori valable jusqu'à la fin du mois en cours. Consommez 20 dinars et bénéficiez immédiatement d’un numéro tout opérateur favori valable jusqu'à la fin du mois en cours. C- ALAMI: Avec la nouvelle offre alami : appelez en national et vers la France, l’Italie, la Belgique, l’Allemagne et le canada au même prix . Bénéficiez d’un tarif avantageux (fixe et mobile) pour communiquer avec vos proches en Tunisie ainsi qu’à l’international 24 heures sur 24, 7 jours sur 7 et sans condition. Facturation par palier de 60 secondes pour les appels nationaux. Le tarif vers les pays non inclus dans l’offre et hors indiqués ci-dessus sont facturés au tarif vers l’international en vigueur.";
        }
        else if (language == "english") {
            //systemContent = "You are Orange Tunisia helpfull women assitant chatbot that has all these informations: Discover the services of Orange Tunisia: 1- About Orange Tunisia: Orange Tunisia is a private Tunisian telecommunications operator. It is the result of an alliance between Orange SA and the Investec company. Among the useful codes you can use: Consumption Tracking/Bonus: *101# Service Portal: *111# Recharge Me: 114number# Call Me Back: 115number# Credit Transfer: 116numberamountpin# Know My Number: *123# Internet and SMS settings: *121# Orange Loyalty: *112# To track your monthly consumption: 1014# To track your mobile internet bonus: 1015# Billing per 60-second intervals for national calls Recharge: 100recharge code# Among Orange's offers, we find three prepaid offers: A- EDAWAKH: With the Edawakh offer, benefit from the lowest per-minute price in the market and call all fixed and mobile operators in Tunisia for only 35 millimes per minute, 24/7 and for life. The Edawakh offer continues to provide all its subscribers, old and new, with the best per-minute rate in the market. You can order the Edawakh pack with 25 GB included for 23,750 Dinars and enjoy free delivery. Upon activating your offer, you will automatically receive 25 gigabytes of mobile internet valid for 30 days. Consumption tracking available on MyOrange. B- ZEN PLUS: With the Zen Plus offer, enjoy a single per-minute rate to all operators, as well as: Two favorite numbers each month: Consume 10 dinars and immediately get an Orange favorite number valid until the end of the current month. Consume 20 dinars and immediately get a favorite number on any operator valid until the end of the current month. C- ALAMI: With the new Alami offer, make national and international calls to France, Italy, Belgium, Germany, and Canada at the same price. Benefit from advantageous rates (fixed and mobile) to communicate with your loved ones in Tunisia and internationally, 24/7 and without conditions. Billing per 60-second intervals for national calls. Rates for countries not included in the offer and not mentioned above are charged at the applicable international rates.";
        }

        if (triggerNumber % 8 === 0 || currentLanguage != language) {
            didChangeLanguage = true;
            currentLanguage = language;
        } else {
            didChangeLanguage = false;
        }

        speech = await askGPT(text, context, didChangeLanguage);
        //speech = "how can i help you my friend";

        if (language == "arabic") {
            SSML = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="ar-TN">
            <voice name="ar-TN-ReemNeural">
            <mstts:viseme type="FacialExpression"/>
            __TEXT__
            </voice>
            </speak>`;
            ssml = SSML.replace("__TEXT__", speech);
            ssml2 = SSML2.replace("__TEXT__", translate(speech));
        }
        else if (language == "french") {
            SSML = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="fr-FR">
            <voice name="fr-FR-CoralieNeural">
            <mstts:viseme type="FacialExpression"/>
            __TEXT__
            </voice>
            </speak>`;
            ssml = SSML.replace("__TEXT__", speech);
            ssml2 = SSML2.replace("__TEXT__", speech);
        }
        else if (language == "english") {
            SSML = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">
            <voice name="en-US-JennyNeural">
            <mstts:viseme type="FacialExpression"/>
            __TEXT__
            </voice>
            </speak>`;
            ssml = SSML.replace("__TEXT__", speech);
            ssml2 = SSML2.replace("__TEXT__", speech);
        }



        const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
        speechConfig.speechSynthesisOutputFormat = 5; // mp3

        let audioConfig = null;
        let audioConfig2 = null;
        // if (filename) {
        let randomString = Math.random().toString(36).slice(2, 7);
        let filename = `./public/speech-${randomString}.mp3`;
        audioConfig = sdk.AudioConfig.fromAudioFileOutput(filename);
        // }

        let randomString2 = Math.random().toString(36).slice(2, 7);
        let filename2 = `./public/speech-${randomString2}.mp3`;
        audioConfig2 = sdk.AudioConfig.fromAudioFileOutput(filename2);

        let blendData = [];
        let timeStep = 1 / 60;
        let timeStamp = 0;
        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

        const synthesizer2 = new sdk.SpeechSynthesizer(speechConfig, audioConfig2);

        // Subscribes to viseme received event
        synthesizer2.visemeReceived = function (s, e) {
            // `Animation` is an xml string for SVG or a json string for blend shapes

            var animation = JSON.parse(e.animation);
            _.each(animation.BlendShapes, blendArray => {

                let blend = {};
                _.each(blendShapeNames, (shapeName, i) => {
                    blend[shapeName] = blendArray[i];
                });

                blendData.push({
                    time: timeStamp,
                    blendshapes: blend
                });
                timeStamp += timeStep;
            });

        }


        synthesizer.speakSsmlAsync(

            ssml,
            result => {
                synthesizer.close();
                //resolve({ blendData, filename: `/speech-${randomString}.mp3` });

            },
            error => {
                synthesizer.close();
                reject(error);
            });

        synthesizer2.speakSsmlAsync(

            ssml2,
            result => {
                synthesizer2.close();
                resolve({ blendData, filename: `/speech-${randomString}.mp3`, filena: randomString, speech: speech });

            },
            error => {
                synthesizer2.close();
                reject(error);
            });

    });


};

module.exports = textToSpeech;
