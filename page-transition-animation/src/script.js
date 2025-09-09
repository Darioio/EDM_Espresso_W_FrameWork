var button = document.querySelector('.toggle');
var wipe = document.querySelector('.animation-wipe');
var container = document.querySelector('.display-content');

button.addEventListener('click', function() {
	wipe.classList.add('show');
	wipe.classList.add('top');
	container.classList.add('active')
	
	setTimeout(function() {
		wipe.classList.remove('show');
		container.classList.remove('active');
		setTimeout(function() {
			wipe.classList.remove('top');
		}, 600);
	}, 2000);
});