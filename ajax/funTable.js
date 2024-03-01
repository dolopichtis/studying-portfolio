//global object _state_ {isSorted, sortId, sortDirrection(isDecrease)}
//getData -> drawTable;
//if sortBtn pressed -> change _state_ with callbackFunction -> repaint Body
//if changeDataBtn pressed -> fetchData, see in _state_ -> repaint Body
//
//функціональний стиль: get the data
//намалювати таблицю, відсортувати таблицю, 
//
//get/add/change/delete data (це один метод, з різними параметрами)
//
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
                } else {
                        throw new Error ('some problems fetching data');
                }
        }).catch( err => {
                console.log(err);
        });
}
// isSorted - boolean, for stay sorted on dataChange; 
// sortId - column of sortion; 
// sortDirrection - increse/dicrease;
function drawTable(data, config, isSorted, sortId, sortIsDecrease) {
        const tableState = {
                isSorted: false,
                sortId: '',
                sortIsDecrease: false
        };
        let dataArray = Object.entries(data.data);
        const table = document.createElement('TABLE');
        const head = config.columns.reduce(constructHead, document.createElement('thead'));
        table.appendChild(head);
        const body = dataArray.reduce(constructBody, document.createElement('tbody'));
        table.appendChild(body);
        return table;

        //decomposition
        function setState(state, isSorted, sortId, sortIsDecrease) {
                state.isSorted = isSorted;
                state.sortId = sortId;
                state.sortIsDecrease = sortIsDecrease;
        }
        function sortData(data, sortId, sortIsDecrease) {
                let newData = data.sort(sortData);
                return newData;
                //decomposition
                function sortData(prev, next) {
                        let decrement = sortIsDecrease ? -1 : 1;
                        if (getData(prev) > getData(next)) return -1 * decrement;
                        if (getData(prev) < getData(next)) return 1 * decrement;
                        //decomposition
                        function getData(data) {
                                let extractedData = data[1];
                                return ((sortId instanceof Function ?
                                        sortId(extractedData)
                                        : extractedData[sortId]).toString().toLowerCase());
                        }
                }
        }
        function updateBody(data) {
                const body = data.reduce(constructBody, document.createElement('tbody'));
                let domTable = document.querySelector(`${config.parent}>table`);
                let domTbody = document.querySelector(`${config.parent}>table>tbody`);
                domTbody.remove();
                domTable.appendChild(body);
        }
        function constructBody(body, currentRowData, currentRowNumber) {
                //KEY: currentRowData[0] = id; currentRowData[1] = dataObject
                const row = body.insertRow();
                config.columns.forEach(constructCell);// TODO is it pure function? is config a 'side effect'?
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
                const cellWrap = document.createElement('div');
                const cellTitle = document.createElement('p');
                cellTitle.innerHTML = rowConfig.title;
                cellWrap.appendChild(cellTitle);
                const btnWrap = document.createElement('div');
                const increaseBtn = document.createElement('div');
                increaseBtn.setAttribute('class', 'increase');
                increaseBtn.addEventListener('click', () => {
                        sortTable(false);
                })
                const decreaseBtn = document.createElement('div');
                decreaseBtn.setAttribute('class', 'decrease');
                decreaseBtn.addEventListener('click', () => {
                        sortTable(true);
                })
                btnWrap.appendChild(decreaseBtn);
                btnWrap.appendChild(increaseBtn);
                cellWrap.appendChild(btnWrap);
                headCell.appendChild(cellWrap);
                head.appendChild(headCell);
                return head;
                //decomposition:
                function sortTable(isDecrease) {
                        setState(tableState, true, rowConfig.value, isDecrease);
                        let data = sortData(dataArray, rowConfig.value, isDecrease);
                        updateBody(data);
                }
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
        // catch call to sortTable() isSorted => true, sortId, sortIsDecrease;
        // catch call to changeData(isSorted...);
        // return new Promise(getChangedData) .then data => drawTable(data, isSorted, sortId, sortIsDicrease);
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

