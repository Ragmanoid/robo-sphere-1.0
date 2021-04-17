class Api {
	constructor() {
		this.token = '';
		this.login = '';
		this.name = '';
		this.count = 0;
		this.init = true;
	}

	genGET(data) {
		let res = '';
		for (let p in data)
			res += `&${p}=${data[p]}`;
		return res;
	}

	async request(method, post = {}, get = {}) {
		get = this.genGET(get);
		loding(true);
		return await $.ajax({
			async: true,
			type: 'POST',
			data: {...post, token: this.token},
			url: `http://rs.eu.loclx.io/rs1/api.php?act=${method}` + get
		}).done(data => {
			loding(false);
			return {...data, type: 'server'}
		}).fail(data => {
			loding(false);
			toast('Сетевая ошибка');
			return {...data, type: 'network'}
		})
	}

	async auth(login, password) {
		let res = await this.request('loginWeb', {
			login: login,
			password: password
		});
		if (!res.error) {
			this.token = res.data;
			localStorage.setItem('token', this.token);
		}
		this.count = parseInt(res.count);
		this.renderCount()
		return res; 
	}

	renderCount() {
		$('#count').html(this.count);
	}

	async getUserData() {
		this.token = localStorage.getItem('token');
		if (!this.token || this.token.length !== 50)
			return false;
		
		let {error, data} = await this.request('getUserData');
		console.log(error, data);
		if (error) 
			return false;

		this.count = +data.count;
		this.name = data.name;
		this.login = data.login;
		this.renderCount()
		return true;
	}

	async getTopList() {
		let { data }  = await this.request('getTopList');
		console.log(data);
		renderRating(data);
	}

	async logout() {
		this.token = ''
		localStorage.setItem('token', '');
		location.reload();
	}
}

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
		bluetoothSerial.write(data, d => {
			console.log('send success', d);
		}, d => { 
			console.log('send error', d); 
		});
	}
}

let api = new Api();
let bt = new Bt();

const setPage = async page => {
	await document.querySelector('#navigator').pushPage(page, {data: {title: page}});
	if (page === 'homeBar') {
		api.getTopList();
		setTimeout(initHome, 500);
	}
}

const tabs = {
	home: 0,
	game: 1,
	connect: 2
}

const setTab = tab => {
	document.querySelector('#tabBar').setActiveTab(tabs[tab]);
}

const toast = (data) => {
	ons.notification.toast(data, {
		timeout: 1000
	});
};

const renderRating = (listRating) => {
	let rating = `
		<ons-list-item>
			<div class="left">#</div>
			<div class="center">Имя</div>
			<div class="right">Попаданий</div>
		</ons-list-item>`;
	for (let i = 0; i < listRating.length; i++) {
		rating += `
			<ons-list-item>
				<div class="left">${i + 1}</div>
				<div class="center">${listRating[i].name}</div>
				<div class="right">${listRating[i].count}</div>
			</ons-list-item>
		`
	}
	$('#listRating').html(rating);
}

const renderDevices = async () => {
	let devices = [];
	await bluetoothSerial.list(d => { devices = d; } );
	console.log(devices);
	let devicesList = ``;

	for (let i = 0; i < devices.length; i++) {
		devicesList += `
			<div class="device" onclick="connect('${devices[i].id}')">
				<div class="data">
					<div class="name">
						${devices[i].name}
					</div>
					<div class="id">
						ID: ${devices[i].id}
					</div>
				</div>
				<div class="paired">
					${devices[i].id === bt.id ?
					`<i class="zmdi zmdi-bluetooth-connected zmdi-hc-2x"></i>` :
					`<i class="zmdi zmdi-bluetooth zmdi-hc-2x"></i>`
					}
				</div>
			</div>`
	}
	$('#btDevices').html(devicesList);
}

const loding = state => {
	let modal = document.querySelector('ons-modal');
	if (state) {
		modal.show();
	} else {
		modal.hide();
	}
}

const init = () => {
	document.addEventListener('prechange', (event) => {
		document.querySelector('ons-toolbar .center')
			.innerHTML = event.tabItem.getAttribute('label');
	});
}

const gameInit = () => {
	$('#connectBtnGame').hide();
	$('#gameContorller').show();
}
const gameDeinit = () => {
	$('#connectBtnGame').show();
	$('#gameContorller').hide();
}

const initHome = () => {
	api.renderCount();
	// Home page
	$('#reloadToplistBtn').click(async () => {
		api.getUserData();
		await api.getTopList();
	})
	$('#logoutBtn').click(async () => {
		api.logout();
	})
	// Game page
	$('#connectBtnGame').click(async () => {
		setTab('connect');
	})
	$('#disconnect').click(async () => {
		bt.disconnect();
	})
	$('#startGame').click(async () => {
		bt.send('startGame ' + api.count);
	})
	$('#gameContorller').hide();
	renderDevices();
}

const initLogin = () => {
    $('#btnAuth').click(async () => {
		let login = $('#loginInput').val();
		let password = $('#passwordInput').val();
		
		if (!login || !password) {
			toast('Введите логин и пароль')
			return;
		}
		let res = await api.auth(login, password);
		console.log(res);
		if (!res.error && res.data) {
			setPage('homeBar');
			api.getUserData();
		} else 
			toast('Неверный лоигн или пароль');
	})
}


$(async () => {
	// Validate token
	if (await api.getUserData()) {
		setPage('homeBar');
	} 
	initLogin();
});

document.addEventListener('deviceready', init, false);