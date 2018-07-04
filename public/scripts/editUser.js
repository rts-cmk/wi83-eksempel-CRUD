const statusBox = function(form, success) {
	const box = document.createElement('span');
	const text = document.createTextNode(success ? 'Profile was saved' : 'Something went wrong, try again');
	box.setAttribute('id', 'statusBox');
	box.setAttribute('class', success ? 'success' : 'danger');
	box.appendChild(text);
	form.appendChild(box);
	setTimeout(removeBox, 6000);
};

const removeBox = function () {
	Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
	}
	document.getElementById('statusBox').remove();
};

document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementsByTagName('form')[0];

	form.addEventListener('submit', (event) => {
		event.preventDefault();
		
		fetch(`/user/${form.id.value}`, {
			'method': 'PATCH',
			'headers': {
				'content-type': 'application/json'
			},
			'body': JSON.stringify({
				'id': form.id.value,
				'firstname': form.firstname.value,
				'lastname': form.lastname.value,
				'streetname': form.streetname.value,
				'streetnumber': form.streetnumber.value,
				'zipcode': form.zipcode.value,
				'city': form.city.value
			})
		})
			.then(response => {
				if (response.status === 200) {
					statusBox(form, true);
				} else {
					statusBox(form, false);
				}
			})
			.catch(error => console.log(error));
	});

	form.active[0].addEventListener('change', () => {
		fetch(`/user/${form.id.value}/activate`, {
			'method': 'PATCH'
		})
			.then(response => {
				if (response.status === 200)
					statusBox(form, true);
				else statusBox(form, false);
			})
			.catch(error => console.log(error));
	});

	form.active[1].addEventListener('change', () => {
		fetch(`/user/${form.id.value}/deactivate`, {
			'method': 'PATCH'
		})
			.then(response => {
				if (response.status === 200)
					statusBox(form, true);
				else statusBox(form, false);
			})
			.catch(error => console.log(error));
	});
});
