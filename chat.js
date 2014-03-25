var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var port = 3700;
var usuarios = [];

server.listen(port);

console.log('Listening in port: '+port);

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'html');
app.get('/', function(req, res){
	res.sendfile('index.html');
});

io.sockets.on('connection', function(socket){

	usuarios.push({
		id: socket.id,
		nombre : 'Desconocido'
	});

	socket.broadcast.emit('conectado_nuevo', {nombre: 'Desconocido', id: socket.id});
	socket.emit('conectado', { usuarios: usuarios, mi_id: socket.id });

	socket.on('mensaje_salida', function(mensaje){

		var nombre = '';
		usuarios.forEach(function(elemento, index, arreglo){

			if(elemento.id == socket.id){
				nombre = elemento.nombre;
			}
		});		
		io.sockets.emit('mensaje_llegada', {nombre: nombre, texto: mensaje});
	});


	socket.on('mensaje_privado', function(data){
		var nombre = '';
		var usuario_privado = '';
		var id = '';
		var bandera = false;

		usuarios.forEach(function(elemento, index, arreglo){

			if(elemento.id == socket.id){
				nombre = elemento.nombre;
			}

			if(elemento.nombre == data.usuario){
				id = elemento.id;
				bandera = true;
			}

		});

		if(bandera){
			io.sockets.socket(id).emit('mensaje_llegada', {nombre: nombre, texto: "PRIVADO: " + data.mensaje});
		}	else {
			socket.emit('usuario_no_disponible');
		}

	});


	socket.on('set_username', function(nuevo_nombre){

		var bandera = false;
		usuarios.forEach(function(elemento, index, arreglo){

			if(elemento.nombre == nuevo_nombre || nuevo_nombre == ''){
				bandera = true;
			}

			if(elemento.id == socket.id){
				elemento.nombre = nuevo_nombre;
			}
		});
		if(bandera){
			socket.emit('nombre_usado', nuevo_nombre);		
		}else{

			socket.emit('actualizado');
			io.sockets.emit('actualiza_lista', {usuarios: usuarios, nombre: nuevo_nombre});
		}
	});


	socket.on('disconnect', function(){

		var nuevo_arreglo = [];
		var nombre = '';

		usuarios.forEach(function(elemento, index, arreglo){

			if(elemento.id != socket.id){
				nuevo_arreglo.push(elemento);
			} else {
				nombre = elemento.nombre;
			}
		});	

		usuarios = nuevo_arreglo;
		io.sockets.emit('usuario_desconectado', nombre);
		io.sockets.emit('actualiza_lista', usuarios);

	});

	socket.on('user image', function (mensaje) {
		var nombre = '';
		usuarios.forEach(function(elemento, index, arreglo){
			if(elemento.id == socket.id){
				nombre = elemento.nombre;
			}
		});	
    io.sockets.emit('user image', {nombre: nombre, texto: mensaje});
	});
});