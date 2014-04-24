/***
 * APE JSF Setup
 */

APE.Config.baseUrl = 'http://ape-project.org/APE_JSF/js'; //Core file location 
APE.Config.domain = 'auto'; //Website domain ?
APE.Config.server = 'ape-project.org:6969'; //APE server URL

/***
 * APE CORE Files
 */

APE.Config.scripts.push(APE.Config.baseUrl + '/apeCore.min.js');
//APE.Config.scripts.push(APE.Config.baseUrl + '/apeCoreSession.min.js'); //Uncomment to enable Sessions