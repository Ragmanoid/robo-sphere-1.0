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
