const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const key = process.env.API_KEY;
const url = process.env.API_URL;

const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
  version: '2020-08-01',
  authenticator: new IamAuthenticator({
    apikey: key,
  }),
  serviceUrl: url,
});

exports.handler = async (event, context, callback) => {
    const { datos_paciente, historial_clinico } = event;

    try {
        const analyzeParams = {
            'text': historial_clinico,
            'features': {
                'keywords': {
                    'sentiment': true,
                    'emotion': true,
                    'limit': 5
                },
                'entities': {
                    'sentiment': true,
                    'mentions': true,
                    'emotion': true,
                    'limit': 5,
                }
            }
        };


        const analysisResults = await naturalLanguageUnderstanding.analyze(analyzeParams);
        const resultObj = analysisResults.result;
        const keywords = {};
        const entities = {};

        resultObj.keywords.forEach(e => {
            keywords[e.text] = {
                "sentimiento": e.sentiment.label,
                "relevancia": e.relevance,
                "repeticiones": e.count,
                "emocion": e.emotion,
            }
        });

        resultObj.entities.forEach(e => {
            entities[e.text] = {
                tipo: e.type,
                sentimiento: e.sentiment.label,
                relevancia: e.relevance,
                emocion: e.emotion,
                repeticiones: e.count,
                porcentaje_confianza: e.confidence
            }
        });

        const res = {
            lenguaje_texto: resultObj.language,
            palabras_clave: resultObj.keywords.map(e => e.text),
            entidades: resultObj.entities.map(e => e.text),
            palabras_clave_desc: keywords,
            entidades_desc: entities,
        }

        return res;
    } catch (err) {
        throw new Error("[ERROR] No se pudo hacer procesamiento", err);
    }

};