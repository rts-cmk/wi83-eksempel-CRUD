const confirmDeleteBox = function (id) {
	const box = document.createElement('div');
	box.setAttribute('class', 'confirmBox');

	const overlay = document.createElement('div');
	overlay.setAttribute('class', 'overlay');

	const p = document.createElement('p');
	const alertText = document.createTextNode(`Do you wish to delete the user with ID ${id}?`);
	
	p.appendChild(alertText);

	box.appendChild(p);

	const buttonYes = document.createElement('button');
	const yes = document.createTextNode('Yes');
	buttonYes.appendChild(yes);

	const buttonNo = document.createElement('button');
	const no = document.createTextNode('No');
	buttonNo.appendChild(no);
	
	buttonYes.addEventListener('click', () => {
		fetch(`/user/${id}`, {
			'method': 'DELETE'
		})
			.then(response => {
				if (response.status === 200)
					window.location.reload();
			})
			.catch(error => {
				console.log(error);
				removeBox();
			});
	});

	buttonNo.addEventListener('click', () => {
		removeBox();
	});

	overlay.addEventListener('click', () => {
		removeBox();
	});

	window.addEventListener('keyup', function (event) {
		if (event.keyCode === 27)
			removeBox();
	});

	box.appendChild(buttonYes);
	box.appendChild(buttonNo);

	document.getElementsByTagName('body')[0].appendChild(overlay);
	document.getElementsByTagName('body')[0].appendChild(box);
};

const removeBox = function () {
	Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
	}
	document.querySelector('.confirmBox').remove();
	document.querySelector('.overlay').remove();
};

document.addEventListener('DOMContentLoaded', () => {
	const delLinks = document.getElementsByClassName('user__delete');
	for (link of delLinks) {
		link.addEventListener('click', function (event) {
			event.preventDefault();
			confirmDeleteBox(this.dataset.id);
		});
	}
});
