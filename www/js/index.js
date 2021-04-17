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

const loading = state => {
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
	$('#stopGame').hide();
	$('#gameContorller').show();
}

const gameStart = () => {
	$('#stopGame').show();
	$('#startGame').hide();
}

const gameStop = () => {
	$('#startGame').show();
	$('#stopGame').hide();
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
		gameStart();
	})
	$('#stopGame').click(async () => {
		bt.send('stopGame');
		gameStop();
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