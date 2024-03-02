const configUsers = {
        parent: '#usersTable',
        columns: [
                {title: 'Name', value: 'name'},
                {title: 'Surname', value: 'surname'},
                {title: 'Age', value: (user) => getAge(user.birthday)}, // функцію getAge вам потрібно створити
                {title: 'Foto', value: (user) => {return `<img src="${user.avatar}" alt="${user.name} ${user.surname}"/>`} }
        ],
        apiURL: 'https://mock-api.shpp.me/dkolomytsev/users'
        //apiURL: 'http://localhost:3000/users'
};

function getAge(userBirthday) {
        const currentDate = new Date();
        let currentYear = currentDate.getFullYear();
        const birthday = userBirthday.slice(0,4);
        return currentYear - birthday;
}

//===============================

setCSS();
drawTable(configUsers);
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

/*
 * make and add table to DOM 
 */
function drawTable(config, data) {
        const tableState = {
                isSorted: false,
                sortId: '',
                sortIsDecrease: false
        };
// get data and add table to DOM
        getData(config, data).then( (data) => {
                let dataArray = Object.entries(data.data);
                const table = constructTable(config, dataArray);
                let target = document.querySelector(configUsers.parent);
                target.appendChild(table);
                // return new Promise(getChangedData) .then data => drawTable(data, isSorted, sortId, sortIsDicrease);
        });

//decomposition:
        /*
         * get data from api or local data if provided
         */
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
        /*
         * construct table from data and config
         */
        function constructTable(config, dataArray) {
                const table = document.createElement('TABLE');
                const head = config.columns.reduce(constructHead, document.createElement('thead'));
                table.appendChild(head);
                console.log(dataArray);
                const body = dataArray.reduce(constructBody, document.createElement('tbody'));
                table.appendChild(body);
                return table;
                // closure:
                function constructBody(body, currentRowData, currentRowNumber) {
                        //KEY: currentRowData[0] = id; currentRowData[1] = dataObject
                        const row = body.insertRow();
                        let id = currentRowData[0];
                        let data = currentRowData[1];
                        config.columns.forEach(constructCell);
                        addChangeBtn(row, id);// need to add if(isTableMutable)

                        return body;
                        //closure:
                        function constructCell(itemProperty) {
                                const cell = row.insertCell();
                                let getValue = itemProperty.value;
                                cell.innerHTML = (getValue instanceof Function) ? 
                                        getValue(data) 
                                        : ( (data[getValue] !== undefined) ? 
                                                data[getValue] : '-');
                        }
                        function addChangeBtn(row, id) {
                                let cell = row.insertCell();
                                let delBtn = document.createElement('button');
                                delBtn.name = 'del';
                                delBtn.innerHTML = 'delete';
                                cell.appendChild(delBtn);
                                delBtn.addEventListener('click', () => {changeData(id)});
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
                                sortTable(false, setState);
                        })
                        const decreaseBtn = document.createElement('div');
                        decreaseBtn.setAttribute('class', 'decrease');
                        decreaseBtn.addEventListener('click', () => {
                                sortTable(true, setState);
                        })
                        btnWrap.appendChild(decreaseBtn);
                        btnWrap.appendChild(increaseBtn);
                        cellWrap.appendChild(btnWrap);
                        headCell.appendChild(cellWrap);
                        head.appendChild(headCell);
                        return head;
                        //closure:
                        function sortTable(isDecrease, setState) {
                                setState(tableState, true, rowConfig.value, isDecrease);
                                let data = sortData(dataArray, rowConfig.value, isDecrease);// TODO tableState as param? todo dataArray
                                updateTable(data);
                        }
                }
        }

        function setState(state, isSorted, sortId, sortIsDecrease) {
                state.isSorted = isSorted;
                state.sortId = sortId;
                state.sortIsDecrease = sortIsDecrease;
        }
        function sortData(data, sortId, sortIsDecrease) {
                let newData = data.sort(sortData);
                return newData;
                //closure
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
        /*
         * update entire table because data closure in head (in the Sort function)
         */
        function updateTable(data) {
                let table = constructTable(config, data);
                let domTable = document.querySelector(`${config.parent}>table`);
                domTable.remove();
                let target = document.querySelector(configUsers.parent);
                target.appendChild(table);
        }
        // request api to change data: add, delete and change item
        function changeData(itemId, itemData) {
                let apiUrl = config.apiURL;
                let request = makeRequest(itemId, itemData);
                fetch(request).then( (response) => {
                        if(!response.ok) {
                                alert('request not success;');
                        }
                }
                ).then( () => {
                        getData(configUsers).then( (data) => {
                                let sortedData = Object.entries(data.data);
                                if (tableState.isSorted) {
                                        sortedData = sortData(sortedData, tableState.sortId, tableState.sortIsDecrease);
                                }
                                updateTable(sortedData);
                        });
                }).catch( (err) => {
                        console.log(err);
                });
                //decomposition:
                function makeRequest(itemID, itemData) {
                        let uri = `${apiUrl}`;
                        if (!itemID) {// edit
                                return new Request(uri, {
                                        method: 'POST',
                                        body: itemData 
                                });
                        }

                        uri += `/${itemId}`;
                        if (!itemData) {// del
                                return new Request(uri, {
                                        method: 'DELETE'
                                });
                        }
                        return new Request(uri, { // change
                                method: 'PUT',
                                body: itemData 
                        });
                }
        }
}

