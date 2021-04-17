class Bt {
	constructor() {
		this.id = '';
		this.status = false;
	}

	connect(id) {
		bluetoothSerial.connect(id, d => {
			this.id = id;
			this.status = true;
			console.log('success', id, d);
			bluetoothSerial.subscribe('\n', this.getData, a => {
				console.log('sub error', a);
			});
			setTab('game');
			gameInit();
			renderDevices();
		}, d => {
			toast('Ошибка подключения');
			console.log('error', d);
		})	
	}

	getData(data) {
		console.log(data);
        let a = data.split(' ');
        let command = a[0];
        switch (command) {
            case 'count':
                api.setCount(+a[1]);
                break;
        
            default:
                break;
        }
	}

	async disconnect() {
		gameDeinit();
		await bluetoothSerial.disconnect(d => {
			console.log('disonnect success', d);
		}, d => { 
			console.log('disconnect error', d); 
		});
		renderDevices();
		this.id = '';
		this.status = false;
	}

	send(data) {
		bluetoothSerial.write(data + '\n', d => {
			console.log('send success', d);
		}, d => { 
			console.log('send error', d); 
		});
	}
}