
document.addEventListener('DOMContentLoaded', function () {
    "use strict";

    var imgs = document.querySelectorAll('img'),
        link,
        src,
        img;

    for (var i = 0, l = imgs.length; i < l; i += 1) {
        img = imgs[i];
        img.classList.add('lazy-load-img');
        src = img.getAttribute('src');
        img.removeAttribute('src');
        img.setAttribute('data-original', src);
        link = document.createElement('a');
        link.setAttribute('href', src);
        link.classList.add('magic-popup-link');
        img.parentNode.replaceChild(link, img);
        link.appendChild(img);
    }
});
