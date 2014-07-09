
/**
*This script houses the Geolocation Basic Module abstract class and contains the module's data abstraction logic.
*@link http://www.jeremyrperry.com
*@version 0.1
*@author Jeremy Perry jeremyrperry@gmail.com
*@package Node.js Geolocation Basic Module
*
*/

geolocation_basic_abstract = {
	dbSettings: null,
	apiKeys: null,
	db: null,
	http: null,
	host: 'production',
	ipAddress: null,
    devIpAddress: null,
	mdb: null,
	mdbSchema: null,
	now: null,
	socket: null,
	socket_msg_type: 'message',
	time: null,
	//The next four varaibles can be changed from json_files/var_settings.json
	mmdbPath: null,
	useMongo: false,
	mongoAuthentication: true,
	ipSource: null,
	headers: null,
	request: null,
	response: null,
	urlRegex: /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/,

	/**
	*The apiLimitCheck function checks the inputted API object against the maximum API limits and returns the allowed number of API callups remaining
	*@param object arr
	*@return The remaining value and database query are outputted to array fromat.
	*/
	 apiLimitCheck: function(arr, callback){
		//Query values are declared.
		var timestamp = eval(this.now.localtime(Date.now()/1000)+'+'+arr.limit_time_unit);
		//Query is ran, and values are outputted.
		var queryReturn = function(err, row){
			var output = {};
			if(err){
				output.msg = 'query failure';
				output.error = err;
			}
			else{
				output.value = eval(arr.limit_qty+'-'+row[0].used);
			}
			callback(output);
		}
		if(this.useMongo){
			var mGeo = self.mdb.collection('geolocation_api_track');
			var find = {
				'api_key': arr.key,
				'timestamp': {
					'$gte': timestamp
				}
			};
			this.mGeo.find(find).toArray(queryReturn);
		}
		else{
			var query = "select sum(insert_count) as used from geolocation_api_track where api_key = '"+arr.key+"' and timestamp >= '"+timestamp+"'";
			this.db.query(query, queryReturn);
		}
	},

	/**
	*The degreesToDirection function is able to take a degree and convert it into the corresponding geographic direction.  It works in conjunction with the getWeather function.
	*@param string degree
	*@return The degree number is converted into the corresponding geographical direction.
	*/
	degreeToDirection: function(degree){
		if(degree > 348.75 || degree <= 11.25){
			return 'N';
		}
		if(degree > 11.25 && degree <= 33.75){
			return 'NNE';
		}
		if(degree > 33.75 && degree <= 56.25){
			return 'NE';
		}
		if(degree > 56.25 && degree <= 78.75){
			return 'ENE';
		}
		if(degree > 78.75 && degree <= 101.25){
			return 'E';
		}
		if(degree > 101.25 && degree <= 123.75){
			return 'ESE';
		}
		if(degree > 123.75 && degree <= 146.25){
			return 'SE';
		}
		if(degree > 146.25 && degree <= 168.75){
			return 'SSE';
		}
		if(degree > 168.75 && degree <= 191.25){
			return 'S';
		}
		if(degree > 191.25 && degree <= 213.75){
			return 'SSW';
		}
		if(degree > 213.75 && degree <= 236.25){
			return 'SW';
		}
		if(degree > 236.25 && degree <= 258.75){
			return 'WSW';
		}
		if(degree > 258.75 && degree <= 281.25){
			return 'W';
		}
		if(degree > 281.25 && degree <= 303.75){
			return 'WNW';
		}
		if(degree > 303.75 && degree <= 326.25){
			return 'NW';
		}
		if(degree > 326.25 && degree <= 348.75){
			return 'NNW';
		}
	},

	/**
	*The error function is available throughout the object to return an error notifying the user of an invalid req.
	*@return The error message data in JavaScript object format.
	*/
	 error: function(){
	 	return {
	 		'status': 'error',
	 		'msg': 'invalid req'
	 	};
	},

	/**
	*The finalStep returns the processed data back to it's necessary source.
	*@param JavaScript object data
	@param function callback, optional.
	*@return Data is sent back to the callback function if set, or back to the origination source via socket.io or as JSON data.
	*/
	finalStep: function(data, callback){
		if(typeof(callback) == 'function'){
			callback(data);
		}
		else{
			if(this.socket != null){
				this.socket.emit(this.socket_msg_type, data);
			}
			else{
				this.response.writeHead(200, {
					"Content-Type": "text/json",
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST'
				});
				this.response.write(JSON.stringify(data));
		  		this.response.end();
			}
		}
	},

	/**
	*The getAddressByGeo function is set up to make an API call the Google Maps Geocoder to get the full address of the inputted geocoordinates.  It outputs a much more simplified version of the original Google data.  Because of the query limitations imposed by Google, this function is used sparingly.
	*@param object literal req
	*@return Geoolocation information in JavaScript object format.
	*@todo This function was modified on 1-15-2014 to reflect input changes from a string to an array.
	*/
	 getAddressByGeo: function(req, callback){
		//The geocoordinates are presumed to be in the correct comma delimited format, so the API query is ran immediately.
		var self = this;
		var url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+req.value+'&sensor=false';
		if(this.apiKeys.google.key != ''){
			url += '&key='.this.apiKeysthis.apiKeys.google.key;
		}
		var output = {};
		//The information returned is decoded from JSON to a JS object.
		this.http.get(url, function(res){
			var json = '';
			res.on('data', function(chunk){
				json += chunk;
			});
			res.on('end', function(){
				json = JSON.parse(json);
				//The address is obtained by splitting the formatted address field out into an array.
				var address = json.results[0].formatted_address.split(',');
				//The state and postal code have a slightly modified method of retreival.
				var stateZip = address[2].trim().split(' ');
				var results = {
					'address': address[0].trim(),
					'city': address[1].trim(),
					'state_region': stateZip[0],
					'postal_code': stateZip[1],
					'country': address[3].trim(),
				}
				output.status = 'success';
				output.results = results;
				if(req.dma_info){
					dmaArr = {
						'subtype':'geo',
						'value': geo,
					};
					dma = this.getDma(dmaArr);
					if(dma.status == 'success'){
						for(var d in dma.results){
							output.results[d] = dma.results[d];
						}
					}
				}
				self.finalStep(output, callback);
			});
		}).on('error', function(e){
			output.status = 'error';
			output.msg = e.message;
			self.finalStep(output, callback);
		});
	},

	/**
	*The getCityPostalByGeo function provides a lookup of the nearest city, state, and zip based in inputted geocoordinates.
	*@param object literal req
	*@return Geolocation information in JavaScript object format.
	*/
	getCityPostalByGeo: function(req, callback){
		//The latitude and longitude is determined by a comma separation in req.geo..
		var self = this;
		var coords = req.value.split(',');
		var lat = coords[0];
		var lng = coords[1];
		var output = {};
		var num_rows = 0;
		var dist = 100;
		if(typeof(req.dist) == 'number'){
			dist = req.dist;
		}
		//Mongodb sequence
		if(this.useMongo){
			var mGeo = self.mdb.collection('geolocation_cities');
			var find = {
				'loc':{
					'$near':{
						'$geometry':{
							'type':'Point',
							'coordinates':[parseFloat(lng), parseFloat(lat)]
						},
						'$maxDistance': this.toMeters(parseFloat(dist)),
					},
				},
				'postal_code': {
					'$ne': ''
				},
      		};
			mGeo.find(find).limit(1).toArray(function(err, results){
				if(err || results.length < 1){
					self.getAddressByGeo(req, function(res){
						self.finalStep(res, callback);
					});
				}
				else{
					output = {
						status: 'success',
						results: results[0],
						msg: 'by mongo'
					};
					self.finalStep(output, callback);
				}
			});
			
		}
		//RDBMS sequence
		else{
			var insertVals = self.rdbmsGeospatial(lat,lng,dist);
			var query = "select gc.*, round(degrees(acos(sin(radians(:lat0))*sin(radians(gc.lat))+cos(radians(:lat0))*cos(radians(gc.lat))*cos(radians(:lng0 - gc.lng)))) *69.09) as distance from geolocation_cities as gc where gc.postal_code != '' and gc.lng between :lng1 and :lng2 and gc.lat between :lat1 and :lat2 order by distance asc limit 1";
			for(var i in insertVals){
				query = query.replace(new RegExp(i, 'g'), this.db.escape(insertVals[i]));
			}
			this.db.query(query, function(err, results){
				if(err){
					output = {
						'status': 'error',
						'msg': err
					};
				}
				else{
					if(results.length < 1){
						self.getAddressByGeo(req, function(res){
							self.finalStep(res, callback);
						});
					}
					else{
						output = {
							'status': 'success',
							'results': results[0],
						};
					}
				}
				self.finalStep(output, callback);
			});
		}
	},

	/**
	*The getDma function pulls up the closest possible DMA based on the inputted geolocation value.  Because of variations in DMA boundaries, this function may have a noticeable margin of error.
	*@param object literal req
	*@return DMA information
	*/
	getDma: function(req, callback){
		//Output array is set
		var output = {};
		var self = this;
		if(this.useMongo){
			var mGeo = self.mdb.collection('geolocation_cities');
		}
		//The mongodb database object is created if mongo is being used.
		switch(req.subtype){
			//Uses geocoordinates to determine dma information
			case 'geo':
				var geo = req.value.split(',');
				var dist = 1000;
				var lat = geo[0];
				var lng = geo[1];
				runAlt = false;
				//Mongodb sequence
				if(this.useMongo){
					//Geolocation find array is created.
					var find = {
						'loc':{
							'$near':{
								'$geometry':{
									'type':'Point',
									'coordinates':[parseFloat(lng), parseFloat(lat)]
								},
								'$maxDistance': this.toMeters(parseFloat(dist)),
							},
						},
		      		};
		            //Mongo query is run, and checked for a result
					mGeo.find(find).limit(1).toArray(function(err, results){
						if(err){
							output = {
								status: 'error',
								msg: err
							};
							self.finalStep(output, callback);
						}
						if(results.length  > 0){
							var find2 = {
								'dma_code': results[0].dma
							};
							self.mdb.collection('geolocation_dma').find(find2).toArray(function(err, results){
								if(err){
									output = {
										status: 'error',
										msg: err
									};
									self.finalStep(output, callback);
								}
								if(results.length > 0){
									output = {
										status: 'success',
										results: results,
									};
									self.finalStep(output, callback);
								}
								else{
									//If no results were found from the primary search method, the system will attempt to find the closest DMA boundary directly from the dma table.  This method can be inaccurate due to variations in DMA boundaries.
									self.mdb.collection('geolocation_dma').find(find).limit(1).toArray(function(err, results){
										if(err){
											output = {
												status: 'error',
												msg: err
											};
										}
										if(results.length > 0){
											output = {
												status: 'success',
												results: results,
											};
										}
										else{
											output = {
												status: 'error',
												msg: 'no results'
											};
										}
										self.finalStep(output, callback);
									});
								}
							});
						}
					});
				}
				//RDBMS sequence
				else{
					var insertVals = self.rdbmsGeospatial(lat,lng,dist);
					//The next four lines draw up the latitude/longitude permiter to search in, and modified for Node.js/JavaScript.  It uses the values from $lat, $lng, and $dist to perform the calculations.  It is based on that 1 degree of latitude is equivelant to 69.09 miles and 1 degree of longitude is equivelant to the cosign of the latitude times 69.09.  For more detailed information, see slides 10 and 11 of the GeoSpacial MySQL Search whitepaper at http://www.scribd.com/doc/2569355/Geo-Distance-Search-with-MySQL.
					query = "select gd.dma_code, gd.region_name, gd.adperc, gd.tvperc, gd.cableperc, round(degrees(acos(sin(radians(:lat0))*sin(radians(gc.lat))+cos(radians(:lat0))*cos(radians(gc.lat))*cos(radians(:lng0 - gc.lng)))) *69.09) as distance from geolocation_cities as gc left join geolocation_dma as gd on gc.dma_code = gd.dma_code where gc.lng between :lng1 and :lng2 and gc.lat between :lat1 and :lat2 order by distance limit 1";
					queryAlt = 'select *, round(degrees(acos(sin(radians(:lat0))*sin(radians(lat))+cos(radians(:lat0))*cos(radians(lat))*cos(radians(:lng0 - lng)))) *69.09) as distance from geolocation_dma where lng between :lng1 and :lng2 and lat between :lat1 and :lat2 order by distance limit 1';
					//Query is set and run
					for(var i in insertVals){
						query = query = query.replace(new RegExp(i, 'g'), this.db.escape(insertVals[i]));
						queryAlt = queryAlt.replace(new RegExp(i, 'g'), this.db.escape(insertVals[i]));
					}
					this.db.query(query, function(err, results){
						if(err || results.length < 1){
							self.db.query(queryAlt, function(err, results){
								if(err || results.length < 1){
									output.status = 'error';
									output.msg = 'no results';
									if(err){
										output.msg = err;
									}
								}
								else{
									output = {
										status: 'success',
										results: results[0]
									};
								}
								self.finalStep(output, callback);
							});
						}
						else{
							output = {
								status: 'success',
								results: results[0]
							};
							self.finalStep(output, callback);
						}
					});
				}
				break;
			//The default presumes the value is the dma code is present
			default:
				//Mongodb sequence
				if(this.useMongo){
					//Query is set and run.
					var find = {
						'dma_code':parseFloat(req.value)
					};
					mGeo.find(find).toArray(function(err, results){
						if(err){
							output = {
								status: 'error',
								msg: err
							};
						}
						if(results.length > 0){
							output = {
								status: 'success',
								results: results,
							};
						}
						else{
							output = {
								status: 'error',
								msg: 'no results'
							};
						}
						self.finalStep(output, callback);
					});
				}
				//RDBMS sequence
				else{
					var query = "select * from geolocation_dma where dma_code = '"+this.db.escape(req.value)+"'";
					//Query is set and run
					this.db.query(query, function(err, results){
						if(err){
							output = {
								'status': 'error',
								'msg': err
							};
						}
						else{
							if(results.length < 1){
								output = {
									'status': 'error',
									'msg': 'no results'
								};
							}
							else{
								output = {
									'status': success,
									'results': results,
								};
							}
						}
						self.finalStep(output, callback);
					});
				}
				break;
		}
	},

	/**
	*The getGeoByAddress function does a latitude/longitude lookup based on the full address through the Google Maps Geocoder API.  Because of the query limitations imposed by Google, this function is used sparingly and only when exact street address based coordinates are needed.
	*@param object literal req
	*@return Latitude/longitude information in JavaScript object format.
	*/
	getGeoByAddress: function(req, callback){
		//Address is URL encoded to ensure the API query can be run properly.
		var address = encodeURIComponent(req.value);
		//API query is run
		var url = 'http://maps.googleapis.com/maps/api/geocode/json?address='+address+'&sensor=false';
		var output = {};
		var results = {};
		var self = this;
		if(this.apiKeys.google.key != ''){
			url += '&key='+this.apiKeys.google.key;
		}
		//Data is decoded from JSON.
		this.http.get(url, function(res){
			var json = '';
			res.on('data', function(chunk){
				json += chunk;
			});
			res.on('end', function(){
				json = JSON.parse(json);
				var address = json.results[0].formatted_address.split(',');
				results.city = address[1].trim();
				//The state and postal code have a slightly modified method of retreival.
				var stateZip = address[2].trim().split(',');
				results.state_region = stateZip[0];
				results.postal_code = stateZip[1];
				results.country = address[3].trim();
				results.lat = json.results[0].geometry.location.lat;
				results.lng = json.results[0].geometry.location.lng;
				output.status = 'success';
				output.results = results;
				//Pulls dma information if reqed.
				if(req.dma_info){
					var dmaArr = {
						'subtype':'geo',
						'value':results.lat+','+results.lng,
					};
					var dma = self.getDma(dmaArr);
					if(dma.status == 'success'){
						for(var d in dma.results){
							output.results[d] = dma.results[d];
						}
					}
				}
				if(typeof(callback) == 'function'){
					callback(output);
				}
				else{
					self.returnData(output);
				}
			});
		});
	},

	/**
	*The getGeoByAddressMq function is the MapQuest version of getGeoByAddress (lat/lon lookup by full address).  Because MaqQuest has more generous API lookups with their community edition, this function is designed for bulk lookups (i.e. location information importing).
	*@param object literal address
	*@return The full street address geolocation information in JavaScript object format.
	*@todo This function was modified on 1-15-2014 to reflect changes in the input from string to array.
	*/
	 getGeoByAddressMq: function(req, callback){
	 	var self = this;
		var results = {};
		var output = {};
		//Counts out the number of addresses.
		var count = req.length;
		var limit = '';
		var runQueries = function(){
			//The system will resolve as many addresses as possible, but will omit any values exceeding the API limitation.
			if(limit.value < count){
				output.msg = 'Notice: '+limit.value+' of the '+count+' records may not have updated due to API throttling.  Be sure to check the database.  Contact an admin for more information.';
				count = limit.value;
			}
			//Sends a notice to the user when less than 1000 API calls remain.
			else if(limit.value > count){
				remainder = limit.value - count;
				if(remainder < 1000){
					output.msg = 'Notice: you may be throttled if you run more than '+remainder+' calls for this API.  Contact an admin for more information.';
				}
			}
			results = {};
			//MapQuest can run batches of 100 addresses at a time, so the batch number is determined by that fact.
			batchNumber = Math.ceil(count/100);
			//Loops though the number of batch lookups to be performed
			for(var i=0; i<batchNumber; i++){
				var start = i*100;
				//Determines the number of lookups to be performed in the current batch, particularly because the last batch will very unlikely have 100 lookups.
				var end = eval(start+'+'+100);
				var atEnd = false;
				if(i+1 == batchNumber){
					end = count;
					atEnd = true;
				}
				//The addresses in the batch are added to the location variable.
				location = '';
				for(m=start; m<end; m++){
					location += '&location='.encodeURIComponent(req[m].address);
				}
				//The URL is formulated with the API key added.
				url = 'http://www.mapquestapi.com/geocoding/v1/batch?key='+this.apiKeys.mapquest.key+'&callback=renderBatch'+location;
				self.http.get(url, function(res){
					var json = '';
					res.on('data', function(chunk){
						json += chunk;
					});
					res.on('end', function(){
						json = JSON.parse(json.replace('renderBatch(', '').slice(0, - 1));
						var rCount = json.results.length;
						for(var r=0; r<rCount; r++){
							var indexAt = start+r;
							var mqResults = {
								index: req[indexAt].index,
								lat: arr.results[r].locations[0].displayLatLng.lat,
								lng: arr.results[r].locations[0].displayLatLng.lng
							};
							results.push(mqResults);
						}
						if(atEnd){
							//The database is updated with the number of API lookups performed
							var query = "insert into geolocaiton_api_track set api_key = '"+this.apiKeys.mapquest.key+"', insert_count = '"+count+"', timestamp = '"+this.now.localtime(Date.now()/1000)+"'";
							self.db.query(query, function(err, rows, fields){
								if(err){
									output.status = 'error';
									output.msg = err;
								}
								else{
									output.status = 'success';
									output.results = results;
								}
								if(typeof(callback) == 'function'){
									callback(output);
								}
								else{
									self.returnData(output);
								}
							});
						}
					});
				});
			}
		};
		var checkCall = function(res){
			limit = res;
			runQueries();
		};
		//Calls up the apiLimitCheck function to see how many API calls are remaining
		this.apiLimitCheck(this.apiKeys.mapquest, checkCall);	
	},

	/**
	*The getIp function is able to resolve a user's IP address to their local area.  By default, it calls out to freegeoip.net, but this can be overwritten by appropriate settings.  A freegeoip.net callout will still be utilized as a backup.
	*@param string $ipAddress, boolean $json defaults as true.
	*@return The user's location information in JavaScript object format.
	*/
	getIp: function(req, callback){
		var self = this;
		var ipAddress = this.ipAddress;
		if(typeof(req.value) != 'undefined'){
			ipAddress = req.value;
		}
		//Settings are declared.  They can be overridden as needed for desired default operations.
		var settings = {
			'source':this.ipSource,
			'ip_correct':true,
			'dma_info':false,
			'run_update':true
		};
		//Each setting above can be overridden with the proper req value.
		for(var s in settings){
			if(typeof(req[s]) != 'undefined'){
				settings[s] = req[s];
			}
		}
		//Mongo is set if needed
		if(this.useMongo && settings.source == 'mongo'){
			settings.source = 'mongo';
		}
		var binary = function(){
			//Calls up the binary load script.  Please refer to the script for more information.
			var out = {};
			settings.run_update = false;
			var maxmind = require('maxmind-db-reader');
            maxmind.open(self.mmdbPath, function(err, mm_rec){
                var binarySrc = 'getGeoData';
                if(typeof(req.binary_src) != 'undefined'){
                    binarySrc = req.binary_src;
                }
                mm_rec[binarySrc](ipAddress, function(err,record){
                    out.status = 'success';
                    out.results = {
                        'country':record.country.iso_code,
                        'state_region':record.subdivisions[0].iso_code,
                        'city':record.city.names.en,
                        'postal_code':record.postal.code,
                        'lat':record.location.latitude,
                        'lng':record.location.longitude,
                        'dma_code':record.location.metro_code
                    };
                    dataCheck(out);
                });
            });
		};
		var freegeoip = function(){
			var freegeoipUrl = "http://freegeoip.net/json/"+ipAddress;
			self.http.get(freegeoipUrl, function(res){
				var json = '';
				res.on('data', function(chunk){
					json += chunk;
				});
				res.on('end', function(){
					results = JSON.parse(json);
					var out = {
						status: 'success',
						results: {
							country: results.country_code,
							state_region: results.region_code,
							city: results.city,
							postal_code: results.zipcode,
							lat: results.latitude,
							lng: results.longitude,
							dma_code: results.metro_code,
							area_code: results.area_code,
							source: 'freegeoip',
							freegeoip_url: freegeoipUrl
						}
					};
					dataCheck(out);
				});
			});
		};
		var mongo = function(){
			//A second boolean declaration is used in case the default setting was overridden in the corresponding req value.
			self.useMongo = true;
			//Database instance is declared, ipv4 converted, and query is run.
			var mGeo = self.mdb.collection('geolocation_ip_locations');
			var ipv4 = self.getIpv4(ipAddress);
			var find = {
				'start_ip_num':{
					'$lte': ipv4,
				},
				'end_ip_num':{
					'$gte': ipv4,
				}
			};
			mGeo.find(find).limit(1).toArray(function(err, results){
				if(err || results.length < 0){
					out.status = 'error';
					out.msg = 'no results';
					if(err){
						out.msg = err;
					}
					dataCheck(out);
				}

				else{
					mGeo2 = self.mdb.collection('geolocation_cities');
					mGeo2.find({'id': results[0].loc_id}).toArray(function(err, results){
						if(err || results.length < 0){
							freegeoip();
						}
						else{
							out = {
								status: 'success',
								results: results[0]
							};
						}
						dataCheck(out);
					});
				}
			});
		};
		var rdbms = function(){
			//Query is run against the database tables.
			var out = {};
			var query = "select c.* from geolocation_ip_locations as l left join geolocation_cities as c on l.loc_id = c.id where INET_ATON("+self.db.escape(ipAddress)+") between l.start_ip_num and l.end_ip_num limit 1";
			self.db.query(query, function(err, results){
				if(err || results.length < 1){
					freegeoip();
				}
				else{
					out = {
						status: 'success',
						results: results[0]
					}
				}
				dataCheck(out);
			});
		};
		var getDma = function(output){
			var dmaArr = {
				'subtype':'dma_code',
				'value':output.results.dma_code
			};
			self.getDma(dmaArr, function(dma){
				if(dma.status == 'success'){
					for(var d in dma.results){
						output.results[d] = dma.results[d];
					}
				}
				self.finalStep(output, callback);
			});
		};
		var ipCorrect = function(output){
			self.ipCorrect(output.results, settings.run_update, function(res){
				output.results = res;
				if(settings.dma_info){
					dmaInfo(output);
				}
				else{
					self.finalStep(output, callback);
				}
			});
		};
		var dataCheck = function(output){
			var dataGood = true;
			var checkFor = ['lat','lng'];
			for(var i=0; i<checkFor.length; i++){
				var check = checkFor[i];
				if(isNaN(output.results[check])){
					dataGood = false;
					break;
				}
			}
			if(dataGood){
				output.status = 'success';
				//Correcting the IP information is run by default, unless it is disabled for performance.
				if(settings.ip_correct){
					ipCorrect(output);
				}
				//The extra DMA information will be retreived if needed.
				else if(settings.dma_info){
					getDma(output);
				}
				else{
					self.finalStep(output, callback);
				}
			}
			//The lat/lon checks failed, no bueno!
			else{
				output.status = 'error';
				output.msg = 'Unable to fully resolve IP address.';
				self.finalStep(output, callback);
			}
		};
		switch(settings.source){
			//The mondodb sequence.  Will failover to freegeoip if no results are found.
			case 'mongo':
				mongo();
				break;
			//The RDBMS sequence.  Fails over to freegeoip if no results are found.
			case 'rdbms':
				rdbms();
				break;
			//The Maxmind binary db sequence.  Using this procedure is strongly recommended.
			case 'binary':
				binary();
				break;
			//The default and failover from any method above is to use freegeoip.  This function alone will work out of the box with no extra configuration, but freegeoip does impose query limits.  For sites where high volumes of IP lookups will be used, a more advanced primary lookup method is strongly recommended.
			default:
				freegeoip();
		}
	},

	/**
	*The getIpv4 function is able to convert an IP Address into an Ipv4 value.  It is namely for the IP queries using MongoDB resources, but can be used as a backup for RDBMS queries as well.
	*@param string $ip
	*@return the converted Ipv4 value
	*/
	getIpv4: function(ip){
		var ipArr = ip.split('.');
		return eval((16777216 * ipArr[0])+'+'+(65536 * ipArr[1])+'+'+(256 * ipArr[2])+'+'+ipArr[3]);
	},

	/**
	*The getPostalCode function provides a lookup of the City, State, Latitude, and Longitude of an inputted postal code value.
	*@param string $postalCode
	*@return Geolocation information in JavaScript object format.
	*/
	getPostalCode: function(req, callback){
		var self = this;
		var postalCode = req.value.trim().replace(' ', '');
		var lat = '';
		var lng = '';
		var reverse = false;
		var dist = 30;
		var geo = postalCode.split(',');
		if(geo.length > 1){
			lat = geo[0];
			lng = geo[1];
			reverse = true;
		}
		var output = {};
		var num_rows = 0;
		//Query is run, depending on database sequence used.  Attempts to pull from the geolocation_cities database table first.
		//Sequence for mongodb.
		if(this.useMongo){
			//Query is run.
			var mGeo = self.mdb.collection('geolocation_postal_codes');
			var find = {
				'postal_code': parseFloat(postalCode),
			};
			if(reverse){
				find = {
					'loc':{
						'near':{
							'geometry':{
								'type':'Point',
								'coordinates':[parseFloat(lng), parseFloat(lat)]
							},
							'maxDistance':this.toMeters(parseFloat(dist))
						},
					},
				};
			}
			mGeo.find(find).limit(1).toArray(function(err, results){
				if(err || results.length < 1){
					output.status = 'error';
					output.msg = 'no results';
					if(err){
						output.msg = err;
					}
				}
				else{
					output = {
						status: 'success',
						results: results[0]
					}
				}
				self.finalStep(output, callback);
			});
		}
		//Sequence for RDBMS
		else{
			var insertVals = {
				':pc': postalCode,
			};
			var query = "select * from geolocation_postal_codes where postal_code = :pc limit 1";
			if(reverse){
				var insertVals = self.rdbmsGeospatial(lat,lng,dist);
				query = "select gp.*, round(degrees(acos(sin(radians(:lat0))*sin(radians(gp.lat))+cos(radians(:lat0))*cos(radians(gp.lat))*cos(radians(:lng0 - gp.lng)))) *69.09) as distance from geolocation_postal_codes as gp where gp.postal_code != '' and gp.lng between :lng1 and :lng2 and gp.lat between :lat1 and :lat2 order by distance asc limit 1";
			}
			for(var i in insertVals){
				query = query = query.replace(new RegExp(i, 'g'), this.db.escape(insertVals[i]));
			}
			this.db.query(query, function(err, results){
				if(err){
					output.status = 'error';
					output.msg = err;
				}
				if(results.length < 1){
					self.getAddressByGeo(req, function(res){
						self.finalStep(res, callback);
					});
				}
				else{
					output.status = 'success';
					output.results = results[0];
				}
				self.finalStep(output, callback);
			});
		}
	},

	/**
	*The getWeather function is able to pull a National Weather Service weather feed based on the user's geocoordinates.  Its main job is to simplify the data received from NWS, and provides a local cache to help with performance.
	*@param object literal req
	*@return The weater information in JavaScript object format.
	*@todo Modified on 1-15-2014 to provide mongodb support.
	*/
	getWeather: function(req, callback){
		var self = this;
		var output = {};
		var results = null;
		var lat = '';
		var lng = '';
		var mGeo = null;
		if(typeof(req.subtype) == 'undefined'){
			req.subtype = 'ip';
		}
		//NWS is set to pull weather based on geocoordinates.  If a postal code or ip address is detected, the system will call up the respective functions to retreive the geocoordinates.
		//Start and end times are set.  A custom end time can be specified from the user or API end in number of days.
		//var start = this.now.localtime(Date.now()/1000);
		var start = Math.round(Date.now()/1000);
		var endString = '+1 day';
		if(typeof(req.end) != 'undefined'){
			endString = req.end;
		}
		var endTimes = endString.split(' ');
		var endTime = 86400*(endTimes[0].replace('+', ''));
		var end = eval(start+'+'+endTime);
		//Because the NwS feed can be sluggish at times, the system is set up to store forecasts in the local database, and will attempt to check for a stored version less than 3 hours old with the same zipcode and forecast length.  In addition, database caches older than three hours and matching the user's postal code and forecast length are deleted.
		var timestamp = eval(start+'-'+(60*60*3));
		var remove = ['_id', 'id', 'timestamp', 'forecast_length'];
		var proceed = function(){
			//Mongodb lookup/deletion sequence.
			if(self.useMongo){
				mongo();
			}
			//RDBMS sequence
			else{
				rdbms();
			}
		}
		var mongo = function(){
			mGeo = self.mdb.collection('geolocation_weather_cache');
			var find = {
				'postal_code': parseFloat(results.results.postal_code),
				'forecast_length': endString,
				'timestamp':{
					'$gte':parseFloat(timestamp)
				},
			};
			var remove = {
				'postal_code':parseFloat(results.results.postal_code),
				'timestamp':{'$lt':parseFloat(timestamp)},
				'forecast_length':endString
			};
			mGeo.remove(remove, function(err, res){
				mGeo.find(find).limit(1).toArray(function(err, results){
					var out = {};
					if(err || results.length < 1){
						nws();
					}
					else{
						out = {
							status: 'success',
							results: results[0]
						}
						self.finalStep(out, callback);
					}
				});
			});
			nws();
		};
		var rdbms = function(){
			var qArray = {
				':postal_code': results.results.postal_code,
				':timestamp': timestamp,
				':forecast_length': endString
			};
			var query = "select * from geolocation_weather_cache where postal_code = :postal_code and timestamp >= :timestamp and forecast_length = :forecast_length order by timestamp desc limit 1";
			var query2 = 'delete from geolocation_weather_cache where postal_code = :postal_code and timestamp < :timestamp and forecast_length = :forecast_length';
			for(var q in qArray){
				query = query.replace(new RegExp(q, 'g'), self.db.escape(qArray[q]));
				query2 = query2.replace(new RegExp(q, 'g'), self.db.escape(qArray[q]));
			}
			self.db.query(query2);
			self.db.query(query, function(err, res){
				var out = {};
				if(err || res.length < 1){
					nws();
				}
				else{
					out.status = 'success';
					out.results = res;
					self.finalStep(out, callback);
				}
			});
		};
		var nws = function(){
			//The time values are converted to the format needed by the NWS.
			var tStart = new Date(start*1000);
			var tEnd = new Date(end*1000);
			var timeStart = tStart.getFullYear()+'-'+eval(tStart.getMonth()+'+'+1)+'-'+tStart.getDate()+'T00:00:00';
			var timeEnd = tEnd.getFullYear()+'-'+eval(tEnd.getMonth()+'+'+1)+'-'+tEnd.getDate()+'T23:59:59';
			//NWS link is determined and ran.
			var nwsLink = 'http://graphical.weather.gov/xml/sample_products/browser_interface/ndfdXMLclient.php?lat='+lat+'&lon='+lng+'&product=time-series&begin='+timeStart+'&end='+timeEnd+'&Unit=e&maxt=maxt&mint=mint&temp=temp&pop12=pop12&qpf=qpf&rh=rh&sky=sky&wspd=wspd&wdir=wdir&wx=wx&icons=icons';
			self.http.get(nwsLink, function(res){
				var xml = '';
				res.on('data', function(chunk){
					xml+= chunk;
				});
				res.on('end', function(){
					var parseString = require('xml2js').parseString;
					parseString(xml, function(err, res1){
						var content = res1.dwml.data[0];
						var out = {};
						out.status = 'success';
						//The necessary location information, API feed source, and NwS weather page are provided.
						out.results = {};
						out.results.city = results.results.city;
						out.results.state_region = results.results.state_region;
						out.results.postal_code = results.results.postal_code;
						out.results.lat = lat;
						out.results.lng = lng;
						out.results.nws_xml = nwsLink;
						out.results.nws_page = content.moreWeatherInformation[0]['_'];
						//Weather attributes are set up for the ones that require special customization
						out.results.data = {
							icon: [],
							weather_conditions: [],
							maximum_temp: [],
							minimum_temp: [],
							hourly_temp: [],
						};
						//The remaining attributes follow a standard pattern and will be looped through.
						var attrLoop = {
							'precipitation': {
								'new_name': 'precipitation',
								'value_add': ' inches',
							},
							'cloud-amount': {
								'new_name': 'cloud_cover',
								'value_add': '%',
							},
							'probability-of-precipitation': {
								'new_name': '12_hour_precip_prob',
								'value_add': '%',
							},
							'humidity': {
								'new_name': 'humidity',
								'value_add': '%',
							},
							'wind-speed': {
								'new_name': 'wind_speed',
								'value_add': ' MPH',
							},
							'direction': {
								'new_name': 'wind_dir',
								'value_add': '',
							}
						};
						//NWS feeds have a funky time matrix that can be tough to decipher.  This part goes through and extracts the necessary layout keys for later use.
						//The tTimes array will have repeititive use throughout the code.
						var tTimes = {
							0: 'start-valid-time', 
							1: 'end-valid-time'
						};
						var timeLayout = {};
						for(var tl in content['time-layout']){
							var objItem = content['time-layout'][tl];
							var layoutKey = objItem['layout-key'][0];
							timeLayout[layoutKey] = {};
							for(var tt in tTimes){
								//Values with underscores are easier to read with JSON, but the feed uses dashes.  This section replaces the underscores with the dashes to better perform the search in the time matrix.
								var searchFor = tTimes[tt];
								if(typeof(objItem[searchFor]) != 'undefined'){
									timeLayout[layoutKey][searchFor] = objItem[searchFor];
									//timeLayout[layoutKey].push(objItem[searchFor]);
								}
							}
						}
						//Puts the data paramaters into a different variable so it's easier to sort through in the remainder of the function.
						var params = content.parameters[0];
						//The weather conditions icons are extracted from the code, and the appropriate start and end times are added
						var citl = params['conditions-icon'][0]['$']['time-layout'];
						var iCount = 0;
						for(var i in params['conditions-icon'][0]['icon-link']){
							//Value is determined, and each tTime value is gone through to ensure the necessary time values are added.
							var theIcon = params['conditions-icon'][0]['icon-link'][i];
							var input = {
								value: theIcon
							};
							for(var tt in tTimes){
								var tType = tTimes[tt];
								if(typeof(timeLayout[citl][tType]) != 'undefined'){
									input[tType.replace(new RegExp('-', 'g'), '_')] = timeLayout[citl][tType][iCount];
								}
							}
							out.results.data.icon.push(input);
							iCount++;
						}
						//The weather conditions attributes are extracted from the code, and the appropriate start and end times are added.
						var wCount = 0;
						var wtl = params.weather[0]['$']['time-layout'];
						for(var w=0; w<params.weather[0]['weather-conditions'].length; w++){
							var theWeather = params.weather[0]['weather-conditions'][w];
							var input = {
								value: '',
							};
							//Each attribute is put into a string
							if(theWeather != ''){
								if(typeof(theWeather.value[0]['$']) != 'undefined'){
									for(var a in theWeather.value[0]['$']){
										input.value += theWeather.value[0]['$'][a]+' ';
									}
								}
							}
							//Each tTime value is gone through to ensure the necessary time values are added.
							for(var tt in tTimes){
								var tType = tTimes[tt];
								if(typeof(timeLayout[wtl][tType]) != 'undefined'){
									input[tType.replace(new RegExp('-', 'g'), '_')] = timeLayout[wtl][tType][wCount];
								}
							}
							out.results.data.weather_conditions.push(input);
							wCount++;
						}
						//Each temperature type is extracted from the code, and the appropriate start and end times are added.
						for(var temp in params.temperature){
							//The temperature type and time layout is determined.
							var theTemp = params.temperature[temp];
							var type = theTemp['$'].type+'_temp';
							var tl = theTemp['$']['time-layout'];
							var tCount = 0;
							for(var t=0; t<theTemp.value.length; t++){
								//Value is determined, and each tTime value is gone through to ensure the necessary time values are added.
								var input = {
									value: theTemp.value[t]+'&deg;F'
								}
								for(var tt in tTimes){
									var tType = tTimes[tt];
									if(typeof(timeLayout[tl][tType]) != 'undefined'){
										input[tType.replace(new RegExp('-', 'g'), '_')] = timeLayout[tl][tType][tCount];
									}
								}
								out.results.data[type].push(input);
								tCount++;
							}
						}
						//each remaining weather attribute in the attrLoop object is looped through to collect the necessary info.
						for(var a in attrLoop){
							//The attribute information is extracted from the code, and the appropriate start and end times are added.
							var param = params[a][0];
							var tl = param['$']['time-layout'];
							var newName = attrLoop[a].new_name;
							out.results.data[newName] = [];
							for(var v=0; v<param.value.length; v++){
								//Value is determined, and each tTime value is gone through to ensure the necessary time values are added.
								var value = param.value[v];
								//Direction requires a conversion fron nautical miles to statue miles.
								switch(a){
									case 'wind-speed':
										value = self.knotsToMiles(value);
										break;
									case 'direction':
										value = self.degreeToDirection(value);
										break;
								}
								//initial input values are declared.
								var input = {
									value: value+attrLoop[a].value_add,
								};
								//The time format is looped through to grab the necessary start and end times.
								for(var tt in tTimes){
									var tType = tTimes[tt];
									if(typeof(timeLayout[tl][tType]) != 'undefined'){
										input[tType.replace(new RegExp('-', 'g'), '_')] = timeLayout[tl][tType][v];
									}
								}
								//Data is pushed to the output variable
								out.results.data[newName].push(input);
							}
						}
						//The field names are extracted from the array to populate into the database.
						var fields = [];
						for(var k in out.results){
							fields.push(k);
						}
						//Tmestamp and forecast length are added to the fields
						fields.push('timestamp');
						fields.push('forecast_length');
						//The values variable is formatted as an array for database insertion.g
						values = out.results;
						values.timestamp = start;
						values.forecast_length = endString;
						out.msg = 'Got from NWS directly';
						//Insertion query is run
						if(self.useMongo){
							values.postal_code = parseFloat(values.postal_code);
							values.timestamp = parseFloat(values.timestamp);
							mGeo.insert(values, function(err, res){
								self.finalStep(out, callback);
							});
						}
						else{
							//The data gets JSON encoded for database storage.
							values.data = JSON.stringify(values.data);
							iQuery = '';
							for(var v in values){
								if(iQuery != ''){
									iQuery += ', ';
								}
								iQuery += v+" = "+self.db.escape(values[v]);
							}
							iQuery = "insert into geolocation_weather_cache set "+iQuery;
							self.db.query(iQuery, function(err, res){
								self.finalStep(out, callback);
							});
						}
					});
				});
			});
		};
		switch(req.subtype){
			case 'postal_code':
				this.getPostalCode(req, function(res){
					results = res;
					lat = res.results.lat;
					lng = res.results.lng;
					proceed();
				});
				break;
			case 'geo':
				geo = req.value.split(',');
				lat = geo[0];
				lng = geo[1];
				this.getCityPostalByGeo(req, function(res){
					results = res;
					proceed();
				});
				break;
			//The default presumes the system will pull based on the IP address.  No subtype is technically required.
			default:
				this.getIp(req, function(res){
					results = res;
					lat = res.results.lat;
					lng = res.results.lng;
					proceed();
				});
		}
	},

	/**
	*The init function initializes all necessary functionality for the module to work.  Can also work as initialization for other modules designed to inherit this module's funcitonality
	*@param object literal vars.  The controlling script can pass in any number of variables to override defaults. It's extremely important that the controlling script tightly controls the variables that can be passed for security reasons.
	*@param boolean update, default is true.
	*@return The data object is passed to either the export variable (class.geolocation_basic.js) or to a custom callback function
	*/
	init: function(vars, callback){
		var self = this;
		for(var v in vars){
			this[v] = vars[v];
		}
        var varSettings = require('./json_files/var_settings.json');
        for(var i in varSettings){
            this[i] = varSettings[i];
        }
		if(this.ipAddress == null){
			if(typeof(vars.socket) != 'undefined'){
				if(typeof(vars.socket.handshake.headers['x-forwarded-for']) != 'undefined'){
					this.ipAddress = vars.socket.handshake.headers['x-forwarded-for'];
				}
				else{
					this.ipAddress = vars.socket.handshake.address.address;
				}
			}
			else if(typeof(vars.request) != 'undefined'){
				if(typeof(this.request.headers["x-forwarded-for"]) != 'undefined'){
					this.ipAddress = this.request.headers["x-forwarded-for"];
				}
				else{
					this.ipAddress = this.request.connection.remoteAddress;
				}
				if(this.request.headers.host.indexOf('localhost') != -1){
					this.host = 'localhost';
				}
			}
		}
		//IP address is set to an arbitrary value if a local dev environment is detected.
		var convert = ['127.0.0.1', '::1'];
		if(convert.indexOf(this.ipAddress) != -1){
			this.ipAddress = this.devIpAddress;
		}
		/*
		var time = require('time');
		this.now = new time.Date();
		this.now.setTimezone('America/New_York');
		*/
		var sendOff = function(){
			if(typeof(callback) == 'function'){
				callback(vars.data);
			}
        	if(typeof(vars.data) != 'undefined'){
        		self.export(vars.data);
        	}
		}
		this.apiKeys = require('./json_files/api_keys.json');
		this.dbSettings = require('./json_files/db_settings.json');
		if(this.useMongo){
			var mongoSettings = this.dbSettings.mongo[this.host];
			var mongo = require('mongodb');
			var Server = mongo.Server;
			var Db = mongo.Db;
			var server = new Server(mongoSettings.host, 27017, {auto_reconnect : true});
			var db = new Db(mongoSettings.db, server);
			db.open(function(err, client) {
				if(self.mongoAuthentication){
					client.authenticate(mongoSettings.username, mongoSettings.password, function(err, success){
				        if(!err){
				        	self.mdb = client;
				        	sendOff();
				        }
				    });
				}
			    else{
			    	self.mdb = client;
			    	sendOff();
			    }
			});
		}
		else{
			var mysql = require('mysql');
			var mysqlSettings = this.dbSettings.mysql[this.host];
			this.db = mysql.createConnection({
				'host': mysqlSettings.host,
				'user': mysqlSettings.username,
				'password': mysqlSettings.password,
				'database': mysqlSettings.db
			});
			sendOff();
		}
	},

	/**
	*The ipCorrect function scrubs the inputted data to ensure city, state/region, and postal code are present, and will update the database if called for.
	*@param object literal row
	*@param boolean update, default is true.
	*@return The row array is passed back with corrected values as needed.
	*/
	ipCorrect: function(row, update, callback){
		var self = this;
	 	if(typeof(update) != 'boolean') update = false;
		//Values checked for are in an array, and checked against the inputted array for a blank value.
		var checkFor = ['city','state_region','postal_code'];
		correctIt = false;
		for(var c=0; c<checkFor.length; c++){
			if(row[checkFor[c]] == '' || row[checkFor[c]] == null){
				correctIt = true;
				break;
			}
		}
		//If a blank value was detected, the system will call up the getAddressByGeo function to perform a lookup via the Google Geolocator API.
		if(correctIt){
			var geo = {
				value: row.lat+','+row.lng
			};
			//For more info, see the getAddressByGeo function.
			this.getAddressByGeo(geo, function(res){
				var insert = {};
				var getNew = res;
				//The updated values are inserted into the row and insert arrays
				for(var c=0; c<checkFor.length; c++){
					row[checkFor[c]] = getNew.results[checkFor[c]];
					insert[checkFor[c]] = getNew.results[checkFor[c]];
				}
				//If an update is indicated, the system will automatically update the internal database with the new information.
				if(update){
					if(self.useMongo){
						mGeo = self.mdb.collection('geolocation_cities');
						mGeo.update({'id': row.id}, insert).toArray(function(err, results){
							callback(row);
						});
					}
					else{
						var query = '';
						for(var i in insert){
							if(query == ''){
								query = "update geolocation_cities set ";
							}
							else{
								query += ", ";
							}
							query += i+" = '"+query[i]+"'";
						}
						self.db.query(query, function(err, rows, fields){
							callback(rows);
						});
					}
				}
			});
		}
		else{
			callback(row);
		}
		//Data is returned.
		
	},

	/**
	*The knotsToMiles function converts nautical miles into standard miles.  It is used in conjunction with the getWeather function.
	*@param string speed
	*@return The conversion from knots to miles rounded to the nearest 100th.
	*/
	knotsToMiles: function(speed){
		return Math.round(speed*1.15078*100)/100;
	},

	/**
	*The rdbmsGeospatial function generates an object literal of latitude and longitude points needed for an RDBMS geospatial query.
	*@param string/integer lat
	*@param string/integer lng
	*@return a JavaScript object containing the above mentioned information.
	*/
	rdbmsGeospatial: function(lat,lng,dist){
		var geospatial = {
			':lat0':lat,
			':lng0':lng,
			':lat1':eval(lat+'-'+(dist/69.09)),
			':lat2':eval(lat+'+'+(dist/69.09)),
			':lng1':eval(lng+'-'+dist/(Math.abs(Math.cos(lat*(Math.PI/180))*69.09))),
			':lng2':eval(lng+'+'+dist/(Math.abs(Math.cos(lat*(Math.PI/180))*69.09))),
		};
		return geospatial;
	},

	/**
	*The toMeters function converts the distance into meters, which is the measure needed for MongoDB geospatial queries.  Default measurement is miles.  Kilometers and nautical miles are supported
	*@param string value
	*@param string measure, default is m for miles.  Optional values are k for kilometers, and n for nautical miles.
	*@return The inputted value is converted to meters, rounded to the nearest 100th.
	*/
	 toMeters: function(value, measure){
	 	if(typeof(measure) == 'undefined') measure = 'm';
		mult = 1609.34;
		switch(measure){
			case 'k':
				mult = 1000;
				break;
			case 'n':
				mult = 1852;
				break;
		}
		return Math.round(mult*value*100)/100;
	},

};

module.exports = function(){
	return geolocation_basic_abstract;
};