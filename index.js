/**
 *This script houses the Geolocation Module class and contains the module's presentation logic.  This class extends and depends upon the geolocation_basic_abstract class.
 *@link http://www.jeremyrperry.com
 *@version 0.1
 *@author Jeremy Perry jeremyrperry@gmail.com
 *@package Node.js Geolocation Basic Module
 *
 */

module.exports = function(abstract_only){
    if(typeof(abstract_only) != 'boolean') abstract_only = false;
    var geolocation_basic = {
        abstract: {
            module: require('./class.geolocation_basic_abstract.js')
        }
    };
    if(!abstract_only){
        geolocation_basic.presentation = {
            module: require('./class.geolocation_basic.js')
        }
    }
    var gb = {};
    for(var g in geolocation_basic){
        var holder = new geolocation_basic[g].module;
        for(var h in holder){
            gb[h] = holder[h];
        }
    }
    return gb;
};