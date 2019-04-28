
let config = {
	"apiServerHostname": "api.qisq.top",
	"apiServerPort": "",
	"socketServer": {url: "http://socket.qisq.top"},
	"redis": {
		"host": "116.62.197.116", 
		"port": 6379, 
		"auth_pass": "zrnet@2018"
	}
}

config.socketServer.url = "http://localhost:3003";


module.exports = config;