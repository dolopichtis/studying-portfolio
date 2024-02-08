// task 1
function displayNone() {
        let noneRect = document.getElementById("none");
        noneRect.style.display = "none";
}

function remove() {
        let removeRect = document.getElementById('remove');
        removeRect.remove();
}

function hide() {
        let hideRect = document.getElementById('hide');
        hideRect.classList.add("hidden");
}
// task 2

function showHide() {
        let showHideBlock = document.getElementById("show-hide");
        if (showHideBlock.classList.contains("hidden")) {
                showHideBlock.classList.remove("hidden");
        } else {
                showHideBlock.classList.add("hidden");
        }
}
//task 3
function hideAll() {
        // another, simpler, way to do this is to add hidden class to parent container (ul tag)
        let elements = document.querySelectorAll("#third div");
        if (elements[0].classList.contains("hidden")) {
                for (let i = 0; i < elements.length; i++) {
                        elements[i].classList.remove("hidden");
                }
        } else {
                for (let i = 0; i < elements.length; i++) {
                        elements[i].classList.add("hidden");
                }
        }
}
//task 4
function removeSelector() {
        let elementsID = '#fourth ' + document.querySelector("input[name=input-css-selector").value;
        let elements = document.querySelectorAll(elementsID);
        if (elements.length <= 0) {
                alert("this CSS selector not exist in section # fourth");
        } else {
                if (elements[0].classList.contains("hidden")) {
                        for (let i = 0; i < elements.length; i++) {
                                elements[i].classList.remove("hidden");
                        }
                } else {
                        for (let i = 0; i < elements.length; i++) {
                                elements[i].classList.add("hidden");
                        }
                }
        }
}
/*
let times = 0;
function alertHide() {
        let elements = document.querySelectorAll("#fifth div");
        if (times % 2 == 0) {
        alert("hi");
        } else {
                if (elements[0].classList.contains("hidden")) {
                        for (let i = 0; i < elements.length; i++) {
                                elements[i].classList.remove("hidden");
                        }
                } else {
                        for (let i = 0; i < elements.length; i++) {
                                elements[i].classList.add("hidden");
                        }
                }
        }
        times++;
}
*/
//task 5
function alertHide() {
        alert("hi");
        let element = document.querySelector("#fifth div");
        element.onclick = hideAlert;
        element.style.background = "yellow";
}
function hideAlert() {
        let element = document.querySelector('#fifth div');
        element.onclick = alertHide;
        element.style.background = "white";// don't using element.style.visibility = "hidden"; to achive loop of clicking;
}
//task 6
function showOver() {
        let element = document.querySelector("#sixth div");
        element.classList.remove("hidden");
}
function hideOut() {
        let element = document.querySelector('#sixth div');
        element.classList.add("hidden");
}
//task 7
function showRect() {
        let element = document.querySelector('#seventh div');
        element.classList.remove('hidden');
}
function hideRect() {
        let element = document.querySelector('#seventh div');
        element.classList.add('hidden');
}
//tasks 8-12 init
(function init(window) {

        //init for eight assignment
        let button = document.querySelector('#eighth button');
        button.addEventListener("click", function() {showImg();});
        let img = document.querySelector('#eighth img');
        window.img = img;

        // init for nineth assignment
        let buttonNine = document.querySelector('#nineth button');
        buttonNine.addEventListener("click", function() {showImgs();});
        window.imgs = document.querySelector('#nineth ul');

        // init for tenth assignment
        let btnTenth = document.querySelector('#tenth button');
        btnTenth.addEventListener('click', function() {assignmentTen();});

        // init for eleven assignment
        let btnEleven = document.querySelector('#eleven button');
        // btnEleven.addEventListener('click', function() {assignmentEleven();});
        btnEleven.onclick = assignmentEleven;
        
        // init #12
        let btn12 = document.querySelector('#twelve button');
        btn12.onclick = assignmentTwelve;
}
)(window);
// it works!!! self-invoke function that add eventListener on button - this is initialisation!!!
//task 8
function showImg() {
        let imgUrl = document.querySelector('#eighth input').value;
        img.src = imgUrl;
}
//task 9
function showImgs() {
        let imgUrls = document.querySelector('#nineth textarea').value;
        const imgsArray = imgUrls.split('\n');
        for (let i = 0; i < imgsArray.length; i++) {
                const li = document.createElement("li");
                const img = document.createElement('img');
                li.appendChild(img);
                imgs.appendChild(li);
                img.src = imgsArray[i];
        }
}
//task 10
function assignmentTen() {
        //document.addEventListener('mousemove', trackMouse);
        document.onmousemove = trackMouse;
        document.querySelector('#tenth div').style.display = 'flex';
        function trackMouse(mouseEvent) {
                let xMouseCoordinate = mouseEvent.clientX;
                let yMouseCoordinate = mouseEvent.clientY;
                let xPlace = document.querySelector('#tenth p[title=x]');
                let yPlace = document.querySelector('#tenth p[title=y]');
                xPlace.innerText = 'X: ' + xMouseCoordinate + ' px';
                yPlace.innerText= 'Y: ' + yMouseCoordinate + ' px';
        }
}
//task 11
function assignmentEleven() {
        const div = document.querySelector('#tenth div');
        div.style.display = 'flex';
        const navigatorLang = navigator.languages;
        for (let i = 0; i < navigatorLang.length; i++) {
                const langLabel = document.createElement('p');
                langLabel.setAttribute('title', 'lang');
                langLabel.innerText = '# ' + (i + 1) + ' browser language is ' + navigatorLang[i];
                div.appendChild(langLabel);
        }
}
//task 12
function assignmentTwelve() {
        if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showGPS, errorGPS);
        } else {
                alert('browser don\'t support geolocation');
        }
}
function showGPS(gpsLocation) {
        const div = document.querySelector('#tenth div');
        div.style.display = 'flex';
        const position = document.createElement('p');
        position.setAttribute('titile', 'position');
        position.innerText= `Ш: ${gpsLocation.coords.latitude}, Д: ${gpsLocation.coords.longitude}`; 
        div.appendChild(position);
}
function errorGPS(error) {
        const div = document.querySelector('#tenth div');
        const errorText = document.createElement('p');
        errorText.setAttribute('title', 'gpsError');
        div.appendChild(errorText);
        switch(error.code) {
                case error.PERMISSION_DENIED:
                        errorText.innerText = 'User denied the request for Geolocation';
                        break;
                case error.POSITION_UNAVAILABLE:
                        error.Text.innerText = 'Location information is unavailable';
                        break;
                case error.TIMEOUT:
                        error.Text.innerText = '';
                        break;
                case error.UNKNOWN_ERROR:
                        error.Text.innerText = 'An uncnown error';
                        break;
        }
        div.style.display = 'flex';
}
//task 13
window.onload = (e)=> {
        let storage;
        if(window.localStorage){
                storage = localStorage;
                loadText(storage);
        }
        if(window.sessionStorage) {
                storage = sessionStorage;
                loadText(storage);
        }
        if (document.cookie) {
                storage = document.cookie;
                loadText(storage);
        }
};
function saveStorage(storage) {
        let textForStorage;
        switch (storage) {
                case (localStorage):
                        textForStorage = document.querySelector('#thirteen h1[contenteditable=true]').innerText;
                        break;
                case (sessionStorage):
                        textForStorage = document.querySelector('#thirteen h3').innerText;
                        break;
                case (document.cookie):
                        textForStorage = document.querySelector('#thirteen h2').innerText;
                        break;
        }        
        if (storage != document.cookie) {
                storage.setItem('text', textForStorage);
        } else {
                document.cookie = 'text=' + textForStorage + ';path=/; max-age=3600';
        }
}
function loadText(storage) {
        let placeForText;
        switch (storage) {
                case (localStorage):
                        placeForText = document.querySelector('#thirteen h1[contenteditable=true]');
                        break;
                case (sessionStorage):
                        placeForText = document.querySelector('#thirteen h3');
                        break;
                case (document.cookie):
                        placeForText = document.querySelector('#thirteen h2');
                        break;
        }
        if (storage != document.cookie) {
                placeForText.innerText = storage.getItem('text');
        } else {
                const text = storage.split('; ').find((row) => row.startsWith('text')).split('=')[1]; // developer.mozilla/en-US/docs/Web/API/Document/cookie
                if(text!==undefined) {
                        placeForText.innerText = text;
                }
        }
}
//task 14
let upBtn = document.querySelector('#fourteen button');
window.onscroll = () => {
        if (document.body.scrollTop >= document.body.scrollHeight - window.innerHeigh - 20 || document.documentElement.scrollTop >= document.body.scrollHeight - window.innerHeight - 20) {
                upBtn.style.display = 'block';
        } else {
                upBtn.style.display = 'none';
        }
};
//task 15
(function initFifteen() {
        // btnEleven.addEventListener('click', function() {assignmentEleven();});
        const firstDiv = document.querySelectorAll('#fifteen div')[0];
        const secondDiv = document.querySelectorAll('#fifteen div')[1];
        firstDiv.addEventListener('click', divPressed = () => {alert('fist div was pressed');}) 
        secondDiv.addEventListener('click', (e) => {alert('second div was pressed'); e.stopPropagation();});
})();
function scrolling() {
        window.scrollTo(0,0);
}
// task 16
((window) => {
        const blockButton = document.querySelector('#sixteen button');
        window.blockButton = blockButton;
        window.blockDiv;
})(window)
blockButton.onclick = () => {
        document.body.style.overflow = 'hidden';
        blockDiv = document.createElement('div');
        document.querySelector('body').appendChild(blockDiv);
        blockDiv.addEventListener('click', () => {hideBlockDiv();});
}
hideBlockDiv = () => {blockDiv.style.visibility = 'hidden'; document.body.style.overflow = 'scroll';}
// task 17
document.querySelector('#seventeen form').addEventListener('submit', quiteSubmit);
function quiteSubmit(e) {
        alert('form is submited');
        e.preventDefault();
}
//task 18
const upload = document.querySelector('#eighteen input[type=file]');
upload.addEventListener('dragenter', (e) => {upload.setAttribute('title', 'drag-entered');})
upload.addEventListener('dragleave', (e) => {upload.setAttribute('title', 'drag-n-drop');})
upload.addEventListener('change', () => {
        upload.setAttribute('title', 'file-in');
        const filesNumber = upload.files.length;
        alert(filesNumber);
        filesNumber > 0 ? document.querySelector('#eighteen h2').innerHTML = filesNumber + ' files selected' : document.querySelector('#eighteen h2').innerHTML = 'No files selected';
})// I tried that all: addEventListener and element.on, regular function expration and arrowed-functions;
