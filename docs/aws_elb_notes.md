# Using AWS Load Balancers With Socket.io

Please be aware that in order for AWS load balancers to work properly with this module in socket.io mode, you need to run the application on a TCP standard as opposed to HTTP.  Also, this standard does not forward the user's IP address, which is a critical component for a numer of features this module offers.  In a tech support discussion with AWS, I it would be necessary to enable a proxy server to do this.  Links on setting this up are below.

* [AWS Proxy Protocol](http://docs.aws.amazon.com/ElasticLoadBalancing/latest/DeveloperGuide/enable-proxy-protocol.html)
* [AWS Proxy Wrap](http://stackoverflow.com/questions/17981943/how-do-i-use-the-proxy-protocol-to-get-the-clients-real-ip-address)
* [AWS Web Sockets & Sticky Sessions](http://johan.heapsource.com/post/31047804966/the-state-of-websockets-ssl-and-sticky-sessions-in)

__NGIX Options__
* [Web Sockets in NGIX](http://blog.martinfjordvald.com/2013/02/websockets-in-nginx/)
* [Configuring NGIX as a Load Balancer](https://blog.serverdensity.com/how-to-configure-nginx-as-a-load-balancer/)
* [WebSockets Over SSL: HAProxy, Node.js, Nginx](https://www.exratione.com/2012/12/websockets-over-ssl-haproxy-nodejs-nginx/)


All of this said, if you are looking to get a solution up quicker, it is possible to ping your server on a HTTP port first for the user's IP address.  I set up the module to allow the IP address to be imported.  A [Get IP](../exmaples/get_ip.js) script example has also been provided for use.  This method is not the most ideal setup, but it does get you up and running fast.  Front-end example is below.

```
<script src="http://yoursite.com:8081/socket.io/socket.io.js"></script>
<script>
$.get('http://yoursite.com:8082', function(d){
	window.socket = io.connect('http://localhost:8081');
	socket.on('connect', function(){
		var sendData = {
	        'type': 'ip_address',
	        'value': d.ip_address
	    };
	    socket.send(JSON.stringify(sendData));
	    socket.on('message', functtion(d){
	        console.log(d);//The return is a JavaScript object
	    });
	})
});
</script>
```

[Back](../../../)