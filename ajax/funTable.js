//функціональний стиль: get the data
//(closure: extract config, extract data) 
//намалювати таблицю, відсортувати таблицю, 
//
//get/add/change/delete data (це один метод, з різними параметрами)
//
//получається, що в функціональному стилі декомпозиція реалізується в самих HOF методах (*о*)
//
//extract dif. form of data: configData and itemData (as array id:{item data key:value})
//configData - > create Head and InputRow
//itemData -> create Body
//function for add inputs realized with insert methods (add cell with btns to corresponding row)
//use: rowIndex property; insertRow(index) insertCell() methods; 
//Table object => rows (return tr collection) 
//
//callback to use:
//var findLargest = require('./findLargest')
//findLargest('./path/to/dir', function (er, filename) {
//// TODO in my case - get data or fetch request
//  if (er) return console.error(er)
//  console.log('largest file was:', filename) 
//  //TODO in my case - draw the Table
//}
//
//tBodies (return all tbody of a table) tHead (return all thead elements of a table); 


function getData(config, data) {
        if (data) { // if data exist (not undefined == false) - return
                return Promise.resolve(data);
        }
        let dataSource = config.apiURL;
        return fetch(dataSource).then(response => {
                if(response.ok) {
                        return response.json();
                }else{
                        throw new Error ('some problems fetching data');
                }
        }).catch( err => {
                console.log(err);
        });
}
function drawTable(data, config) {
        const table = document.createElement('TABLE');
        const head = config.columns.reduce(constructHead, document.createElement('thead'));
        table.appendChild(head);
        const body = Object.entries(data.data).reduce(constructBody, document.createElement('tbody'));
        table.appendChild(body);
        return table;
        
        //closure:
        function constructBody(body, currentRowData, currentRowNumber) {
                //KEY: currentRowData[0] = id; currentRowData[1] = dataObject
                const row = body.insertRow();
                config.columns.forEach(constructCell);
                return body;
                //closure:
                function constructCell(element) {
                        const cell = row.insertCell();
                        let data = currentRowData[1];
                        let getValue = element.value;
                        cell.innerHTML = (getValue instanceof Function) ? 
                                getValue(data) 
                                : ( (data[getValue] !== undefined) ? 
                                        data[getValue] : '-');
                }
        }
        function constructHead(head, rowConfig, currentCellNumber) {
                const headCell = document.createElement('th');
                headCell.innerHTML = rowConfig.title;
                // rowConfig.value;// for sort and changeData()
                head.appendChild(headCell);
                return head;
        }
}

const configUsers = {
        parent: '#usersTable',
        columns: [
                {title: 'Name', value: 'name'},
                {title: 'Surname', value: 'surname'},
                {title: 'Age', value: (user) => getAge(user.birthday)}, // функцію getAge вам потрібно створити
                {title: 'Foto', value: (user) => {return `<img src="${user.avatar}" alt="${user.name} ${user.surname}"/>`} }
        ],
        //apiURL: 'https://mock-api.shpp.me/dkolomytsev/users'
        apiURL: 'http://localhost:3000/users'
};

function getAge(userBirthday) {
        const currentDate = new Date();
        let currentYear = currentDate.getFullYear();
        const birthday = userBirthday.slice(0,4);
        return currentYear - birthday;
}

//===============================

setCSS();

getData(configUsers).then( (data) => {
        const table = drawTable(data, configUsers);
        let target = document.querySelector(configUsers.parent);
        target.appendChild(table);
});
/*
 * load CSS file
 */
function setCSS() {
        let head = document.getElementsByTagName('HEAD')[0];
        let cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.type = 'text/css';
        cssLink.href = 'table.css';
        head.appendChild(cssLink);
}

