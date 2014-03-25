(function(){
	var socket = io.connect();
	var boton = $('#btn_enviar');
	var boton_privado = $('#btn_enviar_privado');
	var conectados = $('#conectados ul');
	var sala = $('#sala ul');
	var sala_id = $('#sala');
	var set = $('#set_username');
	var username = $('#username');
 	var TFtexto = $('#texto');
 	var texto = $('#texto');
 	var del_chat = $('#del_chat');
 	var archivo = $('#imagefile');
 	var usuario_privado = $('#usuario_privado');

 	var mi_id = '';

 	del_chat.hide();

	set.on('click', function(){
		socket.emit('set_username', username.val());
	});

	socket.on('nombre_usado', function(nombre){
		if(nombre === ''){
			alert('Debes ingresar algún nombre');
		} else {
			alert('El nombre '+nombre+' no está disponible! D=');
		}
	});

	socket.on('conectado_nuevo', function(data){
		conectados.append($('<li>').append($('<a>').append(data.nombre)));
	});

	socket.on('conectado', function(data){
		data.usuarios.forEach(function(elemento, index, arreglo){
			conectados.append($('<li>').append($('<a>').append(elemento.nombre)));
		});

	});

	socket.on('actualiza_lista', function(data){
		conectados.html("");
		data.usuarios.forEach(function(elemento, index, arreglo){
			conectados.append($('<li>').append($('<a>').append(elemento.nombre)));
		});

		sala.append($('<li>').append('- El usuario ' + data.nombre + ' se ha conectado -')).show('slow');
	});

	socket.on('actualizado', function(){
		username.hide("slow")
		set.hide("slow");
		del_chat.show("slow");
	});

	socket.on('usuario_desconectado', function(nombre){
		sala.append($('<li>').append('- El usuario ' + nombre + ' se ha desconectado -')).show('slow');
	});

	socket.on('mensaje_llegada', function(mensaje){
		sala.append($('<li>').append(mensaje.nombre + ": " + mensaje.texto)).show('slow');
	});

	boton.on('click', function(){
		var mensaje = texto.val();
		texto.val('');
		socket.emit('mensaje_salida', mensaje);
	});

	boton_privado.on('click', function(){
		var mensaje = texto.val();
		var usuario = usuario_privado.val();
		texto.val('');
		usuario_privado.val('');
		socket.emit('mensaje_privado', {mensaje: mensaje, usuario: usuario});
	});

	archivo.on('change', function(e){

    var file = e.originalEvent.target.files[0],
        reader = new FileReader();
    reader.onload = function(evt){
        socket.emit('user image', evt.target.result);
    };
    
    reader.readAsDataURL(file);  
	});

	socket.on('user image', function(data) {
    sala.append(data.nombre + ": " +'<img src="' + data.texto + '"/>');
    sala_id.scrollTop(sala_id[0].scrollHeight);
	});

	socket.on('usuario_no_disponible', function(){
		alert('No existe el usuario! =(');
	});

})();