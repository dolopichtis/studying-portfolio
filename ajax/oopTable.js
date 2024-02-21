class Table {
        #data;
        #config;
        #table;
        #head;
        #body;
        #targetPlace;
        #isBody;
        #isSorted;// for re-paint table "as it was" after data manipulation (del, add, change);
        #sortedID;// id of column ;) for that re-paint
        #isSortDecrese;
        constructor(config, data) {
                this.#config = config;
                this.isBody = false;
                this.isSorted = false;
                this.#config.apiurl = config.apiURL; 
                this.#table = document.createElement('table');
                this.#targetPlace = document.querySelector(`${this.#config.parent}`);
                this.#head = this.#createHeadTable();
                this.#table.appendChild(this.#head);
                // fetch data and make body and add table to DOM
                this.#addTableBody(data);
        }
        // class methods:
        #addTableBody(data) {
                if(data !== undefined) {
                        this.#data = data;
                        this.#isSorted ? this.#sortData_updateBody(this.#sortedID, this.#isSortDecrese) : this.#updateBody();
                } else if(this.#config.apiurl !== undefined) {
                        let datasource = this.#config.apiurl;
                        fetch(datasource).then(response => {
                                if(response.ok){ 
                                        return response.json();
                                } else {
                                        alert('some problems with the data on the server');
                                }
                        }).then( (data) => { 
                                this.#data = Object.entries(data.data);
                                this.#isSorted ? this.#sortData_updateBody(this.#sortedID, this.#isSortDecrese) : this.#updateBody();
                        }).catch(error => {
                                console.log(error);
                        });
                } else {
                        alert('data is undefined');
                }
        }
        #updateBody() {
                if(this.#isBody) {
                        this.#body.remove();
                }
                this.#body = this.#createBodyTable(); 
                this.#table.appendChild(this.#body);
                if (!this.#isBody) {
                        this.#targetPlace.appendChild(this.#table);
                }
                this.#isBody = true;
        }
        #sortData_updateBody(id, isDecrese) {
                let decrement = isDecrese ? -1 : 1;
                this.#data.sort( (item1, item2) => {
                        if ( ( (id instanceof Function) ? id(item1[1]) : item1[1][id] ).toString().toLowerCase() > ( (id instanceof Function) ? id(item2[1]) : item2[1][id]).toString().toLowerCase()) {return -1 * decrement;}
                        if ( ( (id instanceof Function) ? id(item1[1]) : item1[1][id] ).toString().toLowerCase() < ( (id instanceof Function) ? id(item2[1]) : item2[1][id]).toString().toLowerCase()) {return 1 * decrement;}
                        return 0;
                });
                //memoization for re-paint on change data
                //
                this.#isSorted = true;
                this.#sortedID = id;
                this.#isSortDecrese = isDecrese;
                //call re-paint
                this.#updateBody();
        }
        // del, add, change
        #changeData(itemID, itemData){ 
                let request = this.#makeRequest(itemID, itemData);
                console.log(request);
                fetch(request).then( (response) => {
                        if(response.ok) {
                                console.log(response);
                                alert('data is submitted');
                        } else {
                                alert('request not success;');
                        }
                }
                ).then( () => {this.#addTableBody();}).catch( (err) => {console.log(err);});
        }
        // TODO you can cut this in length: uri = itemID ? uri+id : uri; method - do the same or switch-case; body in delet - relax;
        #makeRequest(itemID, itemData) {
                let uri = `${this.#config.apiURL}`;
                if (!itemID) {// edit
                        return new Request(uri, {
                                method: 'POST',
                                body: itemData 
                        });
                }

                uri += `/${itemID}`;
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

        // decomposition:
        // todo винести створення з боді та хеду створення елементів для додавання (інпутів, маркер - hasInputConfig)

        #createBodyTable() {
                let body = document.createElement('tbody');
                let rowCount = 0;
                let itemsName = this.#config.apiURL.split('/');
                if (this.#hasInputConfig()) {// if hasInputConfig
                        let inputRow = this.#createInputRow(itemsName);
                        body.appendChild(inputRow);
                }
                for (let item of this.#data){
                        let id = item[0];
                        let idData = item[1];
                        let bodyRow = document.createElement('tr');
                        let bodyCellRowNumber = document.createElement('td');
                        bodyCellRowNumber.innerHTML = `${++rowCount}`;
                        bodyRow.appendChild(bodyCellRowNumber);
                        for (let cellConfig of this.#config.columns) {
                                let bodyCell = document.createElement('td');
                                bodyCell.innerHTML = (
                                        cellConfig.value instanceof Function) ? 
                                        cellConfig.value(idData) 
                                        : (idData[cellConfig.value] !== undefined) ? 
                                        `${idData[cellConfig.value]}` 
                                        : '-';
                                bodyRow.appendChild(bodyCell);
                        }
                        // UI btnCell (change and del)
                        if (this.#hasInputConfig()) {// if hasInputConfig
                                let btnCell = this.#createBtnCell(itemsName, id);
                                bodyRow.appendChild(btnCell);
                        }
                        body.appendChild(bodyRow);
                }
                return body;
        }
        #createInputRow(itemsName, isEdit = false) {
                let addItemForm = document.createElement('form');
                addItemForm.setAttribute('id', `${ isEdit ? 'editItemForm' : 'addItemForm' }`);
                let inputRow = document.createElement('tr');
                if (!isEdit) {
                        inputRow.classList.add('hidden');
                }
                let inputRowFormCell = document.createElement('td');
                inputRowFormCell.appendChild(addItemForm);
                inputRow.appendChild(inputRowFormCell);
                for (let inputConfig of this.#config.columns) {
                        let inputCell = this.#createInputCell(inputConfig, isEdit);
                        inputRow.appendChild(inputCell);
                }
                // UI btnCell
                let addNewBtnCell = this.#createBtnInputCell(addItemForm, isEdit, itemsName);
                inputRow.appendChild(addNewBtnCell);
                return inputRow;
                function catchInputs (data, element) {
                        if (element.type === 'submit' || element.type === 'button') {
                                return data;
                        }
                        let elem = (element.type === 'number') ? Number(element.value) : element.value; 
                        data[element.name] = element.type === 'number' ? Number(element.value) : element.value;
                        return data;
                }
        }
        #createInputCell(inputConfig, isEdit) {
                        let inputCell = document.createElement('td');
                        let subInputs = inputConfig.input.length ? inputConfig.input.length : 1;
                        for (let i = 0; i < subInputs; i++) {
                                let input = document.createElement('input');
                                let attributes = subInputs > 1 ? inputConfig.input[i] : inputConfig.input;
                                let type = attributes.type;
                                if (type === 'select') {
                                        input = this.#selectInput(attributes, isEdit);
                                }
                                input.setAttribute('form', `${ isEdit ? 'editItemForm' : 'addItemForm' }`);
                                input.setAttribute('required', true);
                                if (type === 'color') {
                                        input.value =  '#' + Math.floor(Math.random()*16777215).toString(16);// add some diff.style, than black color
                                }
                                this.#setPlaceholder(input, attributes, inputConfig);
                                for ( let attribute of Object.keys(attributes)) {
                                        if (attribute === 'options') continue;
                                        if (attributes[attribute] === 'select') {
                                                input.setAttribute(attribute, 'text');
                                                continue;
                                        }
                                        if (attributes[attribute] === 'date') {
                                                input.setAttribute(attribute, 'datetime-local');
                                                continue;
                                        }
                                        input.setAttribute(attribute, attributes[attribute]);
                                }
                                inputCell.appendChild(input);
                        }
                return inputCell;
        }
        #createBtnInputCell(addItemForm, isEdit, itemsName) {
                let addNewBtnCell = document.createElement('td');
                let addBtn = document.createElement('button');
                addBtn.setAttribute('type', 'submit');
                addBtn.setAttribute('form', `${isEdit ? 'editItemForm' : 'addItemForm'}`);
                let addBtnItemName = `${itemsName[itemsName.length-1].slice(0,-1)}`;
                addBtn.innerHTML = `${isEdit ? 'edit' : 'add' } new ${addBtnItemName}`;
                addItemForm.onsubmit = (e) => {
                        e.preventDefault();
                        // TODO validate
                        const rowData = Array.from(addItemForm.elements);
                        const data = rowData.reduce(catchInputs, {});
                        console.log(data);
                        this.#changeData(false, JSON.stringify(data));
                }
                addNewBtnCell.appendChild(addBtn);
                return addNewBtnCell;

                function catchInputs(data, input) {
                        if (input.type === 'button' || input.type === 'submit') {
                                return data;
                        }
                        let value = (input.type === 'number') ? Number(input.value) : input.value;
                        data[input.name] = value;
                        return data;
                }
        }
        #setPlaceholder(input, attributes, inputConfig) {
                if (attributes.name !== undefined) {
                        input.setAttribute('placeholder', attributes.name);
                } else {
                        input.setAttribute('placeholder', inputConfig.title);
                }
        }
        #selectInput(attributes, isEdit) {
                let select = document.createElement('select');
                let optionDefault = document.createElement('option');
                optionDefault.setAttribute('value', `choose ${attributes.name}`);// todo in validation this is a not valid value
                optionDefault.innerHTML = `choose ${attributes.name}`;
                select.appendChild(optionDefault);
                for (let optionItem of attributes.options) {
                        let option = document.createElement('option');
                        option.setAttribute('value', optionItem);
                        option.innerHTML = optionItem;
                        select.appendChild(option);
                }
                return select;
        }
        #createBtnCell(itemsName, id) {
                let btnCell = document.createElement('td');
                btnCell.setAttribute('class', 'changeUI');
                let delBtn = document.createElement('button');
                let rowName = `${itemsName[itemsName.length-1].slice(0,-1)}`;
                delBtn.innerHTML = `delete ${rowName}`;
                let changeBtn = document.createElement('button');
                changeBtn.innerHTML = `change ${rowName}`;
                delBtn.addEventListener('click', () => {this.#changeData(id, false)});// id = itemID, data = false idData = data
                changeBtn.addEventListener('click', () => {this.#changeData(id, 'json data from inputs')});// id = itemID, data = false idData = data
                btnCell.appendChild(delBtn);
                btnCell.appendChild(changeBtn);
                return btnCell;
                // add row to body
        }
        #createHeadTable() {
                let head = document.createElement('thead');
                let headRow = document.createElement('tr');
                // # cell
                let numberHeadCell = document.createElement('th');
                numberHeadCell.innerHTML = '#';
                headRow.appendChild(numberHeadCell);
                // config cells
                for (let headElement of this.#config.columns) {
                        this.#constructHeadRow(headRow, headElement);
                }
                if (this.#hasInputConfig()) {// if hasInputConfig
                        let changeTitle = document.createElement('th');
                        changeTitle.innerHTML = `change ${this.#config.apiURL.split('/')[this.#config.apiURL.split('/').length-1]}`;
                        let addNewItem = document.createElement('button');
                        addNewItem.innerText = 'add new';
                        addNewItem.addEventListener('click', () => {
                                let inputRow = document.querySelector('');
                                if (inputRow.classList.contains('hidden')) {
                                        inputRow.classList.remove('hidden');
                                } else {
                                        inputRow.classList.add('hidden');
                                }
                        });
                        changeTitle.appendChild(addNewItem);
                        headRow.appendChild(changeTitle);
                }
                // add row to head
                head.appendChild(headRow);
                return head;
        }
        #hasInputConfig() {
                return this.#config.columns[0].input;
        }
        #constructHeadRow(headRow, headElement) {
                let headCell = document.createElement('th');
                let cellWrapper = document.createElement('div');
                let cellTitle = document.createElement('p'); 
                cellTitle.innerHTML = `${headElement.title}`;
                cellWrapper.appendChild(cellTitle);
                let buttonWrapper = document.createElement('div');
                let increseBtn = document.createElement('div');
                increseBtn.setAttribute('class', 'increse');
                increseBtn.addEventListener('click', () => {this.#sortData_updateBody(headElement.value, false)});
                let decreseBtn = document.createElement('div');
                decreseBtn.setAttribute('class', 'decrese');
                decreseBtn.addEventListener('click', () => {this.#sortData_updateBody(headElement.value, true)});
                buttonWrapper.appendChild(decreseBtn);
                buttonWrapper.appendChild(increseBtn);
                cellWrapper.appendChild(buttonWrapper);
                headCell.appendChild(cellWrapper);
                headRow.appendChild(headCell);
        }
}
const configProductsInput = {
        parent: '#productsTable',
        columns: [
                {
                        title: 'item name', 
                        value: 'title', 
                        input: { type: 'text', name: 'title' }
                },
                {
                        title: 'price', 
                        value: (product) => `${product.price} ${product.currency}`,
                        input: [
                                { type: 'number', name: 'price', label: 'Ціна' },
                                { type: 'select', name: 'currency', label: 'Валюта', options: ['$', '€', '₴'], required: false }
                        ]
                },
                {
                        title: 'color', 
                        value: (product) => getColorLabel(product.color), // функцію getColorLabel вам потрібно створити
                        input: { type: 'color', name: 'color' }
                }, 
        ],
        apiURL: "https://mock-api.shpp.me/dkolomytsev/products"
        //apiURL: "http://localhost:3000/products"
};

const configProducts = {
        parent: '#productsTable',
        columns: [
                {title: 'Item name', value: 'title'},
                {title: 'Item price', value: (product) => `${product.price} ${product.currency}`},
                {title: 'Item color', value: (product) => getColorLabel(product.color)}, // функцію getColorLabel вам потрібно створити
        ],
        apiURL: "https://mock-api.shpp.me/dkolomytsev/products"
        //apiURL: "http://localhost:3000/products"
};
function getColorLabel(color){
        return `<div style='width:20px; height:20px; background:${color}; border-radius: 10px; margin: auto'></div>`;
}
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


const table1 = new Table(configUsers);
//const table2 = new Table(configProducts);
const table3 = new Table(configProductsInput);



function setCSS() {
        let head = document.getElementsByTagName('HEAD')[0];
        let cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.type = 'text/css';
        cssLink.href = 'table.css';
        head.appendChild(cssLink);
}


//DataTable(config1, users);
//DataTable(config2 );
setCSS();