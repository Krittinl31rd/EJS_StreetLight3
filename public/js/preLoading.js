window.addEventListener('load', () => {
    const preloader=document.getElementById('preloader');
    preloader.classList.add('hidden');
    setTimeout(() => {
        if (document.getElementById('alertLogin')) {
            document.getElementById('alertLogin').remove();
        }
    }, 3500);
});