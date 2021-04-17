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
		loading(true);
		return await $.ajax({
			async: true,
			type: 'POST',
			data: {...post, token: this.token},
			url: `http://d91202ip.beget.tech/api.php?act=${method}` + get
		}).done(data => {
			loading(false);
			return {...data, type: 'server'}
		}).fail(data => {
			loading(false);
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

    setCount(count) {
        this.count = count;
        this.renderCount();
        this.request('setCount', {
            count: this.count
        }, );
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