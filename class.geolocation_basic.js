/**
*This script houses the Geolocation Module class and contains the module's presentation logic.  This class extends and depends upon the geolocation_basic_abstract class.
*@link http://www.jeremyrperry.com
*@version 0.1
*@author Jeremy Perry jeremyrperry@gmail.com
*@package Node.js Geolocation Basic Module
*
*/

geolocation_basic = {
	/**
	*The export function processes the data requests.
	*@return the requested information in JSON or JavaScript object format depending on how the function call is made.
	*/
	export: function(req, callback){
		//Initial values are false
		var controls = {
			'is_json': true,
			'print_out': true,
		};
		//The user may modify the output formats as needed to suit their needs.
		var strTypes = {
			'true': true,
			'false': false
		};
		for(var c in controls){
			if(typeof(req[c]) != 'undefined'){
				if(strTypes.indexOf(req[c]) != -1){
					controls[c] = strTypes[c];
				}
			}
		}
		if(typeof(req.type) == 'undefined'){
			req.type = 'ip_address';
		}
		var obj = '';
		//Switch statement performed for type
		switch(req.type){
			//DMA infromation is returned
			case 'dma':
				if(typeof(req.value) == 'undefined'){
					this.error();
				}
				else{
					this.getDma(req, callback);
				}
				break;
			//Location by postal code data is returned.
			case 'postal_code':
				if(typeof(req.value) == 'undefined'){
					this.error();
				}
				else{
					this.getPostalCode(req, callback);
				}
				break;
			//Geolocation by address data is returned.
			case 'geo_by_address':
				if(typeof(req.value) == 'undefined'){
					this.error();
				}
				else{
					this.getGeoByAddress(req, callback);
				}
				break;
			//Address by geolocation data is returned.
			case 'address_by_geo':
				if(typeof(req.value) == 'undefined'){
					this.error();
				}
				else{
					this.getAddressByGeo(req, callback);
				}
				break;
			//City-based information by geolocation is returned.
			case 'city_postal_by_geo':
			console.log('about to execute city postal by geo');
				if(typeof(req.value) == 'undefined'){
					this.error();
				}
				else{
					this.getCityPostalByGeo(req, callback);
				}
				break;
			//Weather information data is returned
			case 'weather':
				this.getWeather(req, callback);
				break;
			//Location by IP address data is presumed to be the default.
			case 'ip_address':
				this.getIp(req, callback);
				break;
		}
	},
};

module.exports = function(){
	return geolocation_basic;
};