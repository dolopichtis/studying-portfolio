class Table {
        #data;
        #inputRow;
        #config;
        #table;
        #head;
        #body;
        #apiUrl;
        #itemsName;
        #targetPlace;// were to place on DOM
        #hasBody;// for re-paint
        #isSorted;// for re-paint table "as it was" after data manipulation (del, add, change);
        #sortedID;// id of column ;) for that re-paint
        #isSortDecrease;// sort dirrection
        constructor(config, data) {
                this.#config = config;
                this.hasBody = false;
                this.isSorted = false;
                this.#apiUrl = config.apiURL; 
                this.#itemsName = this.#apiUrl.split('/');
                this.#table = document.createElement('table');
                this.#targetPlace = document.querySelector(`${this.#config.parent}`);
                this.#targetPlace.style.overflowX = 'auto';
                this.#head = this.#createHeadTable();
                this.#table.appendChild(this.#head);
                // fetch data and make body and add table to DOM
                this.#addTableBody(data);
        }
        // class methods:
        #addTableBody(data) {
                if(data !== undefined) {
                        this.#data = data;
                        this.#isSorted ? 
                                this.#sortData_updateBody(this.#sortedID, this.#isSortDecrease) 
                                : this.#updateBody();
                } else if(this.#apiUrl !== undefined) {
                        let datasource = this.#apiUrl;
                        fetch(datasource).then(response => {
                                if(response.ok){ 
                                        return response.json();
                                } else {
                                        throw new Error ('some problems with the data on the server');
                                }
                        }).then( (data) => { 
                                this.#data = Object.entries(data.data);
                                this.#isSorted ? 
                                        this.#sortData_updateBody(this.#sortedID, this.#isSortDecrease) 
                                        : this.#updateBody();
                        }).catch(error => {
                                console.log(error);
                        });
                } else {
                        alert('data not set');
                }
        }
        #updateBody() {
                if(this.#hasBody) {
                        this.#body.remove();
                }
                this.#body = this.#createBodyTable(); 
                this.#table.appendChild(this.#body);
                if (!this.#hasBody) {
                        this.#targetPlace.appendChild(this.#table);
                }
                this.#hasBody = true;
        }
        #sortData_updateBody(id, isDecrease) {
                let decrement = isDecrease ? -1 : 1;
                this.#data.sort( (item1, item2) => {
                        if ( ( (id instanceof Function) ? 
                                id(item1[1]) 
                                : item1[1][id] ).toString().toLowerCase() 
                                > ( (id instanceof Function) ? 
                                        id(item2[1]) 
                                        : item2[1][id]).toString().toLowerCase() ) {
                                return -1 * decrement;
                        }
                        if ( ( (id instanceof Function) ? id(item1[1]) : item1[1][id] ).toString().toLowerCase() < ( (id instanceof Function) ? id(item2[1]) : item2[1][id]).toString().toLowerCase()) {return 1 * decrement;}
                        return 0;
                });
                //memoization for re-paint when data was changed
                this.#isSorted = true;
                this.#sortedID = id;
                this.#isSortDecrease = isDecrease;
                //call re-paint
                this.#updateBody();
        }
        // del, add, change
        #changeData(itemID, itemData){ 
                let request = this.#makeRequest(itemID, itemData);
                fetch(request).then( (response) => {
                        if(!response.ok) {
                                alert('request not success;');
                        }
                }
                ).then( () => {
                        this.#addTableBody();
                }).catch( (err) => {
                        console.log(err);
                });
        }
        #makeRequest(itemID, itemData) {
                let uri = `${this.#apiUrl}`;
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

        #createBodyTable() {
                let body = document.createElement('tbody');
                let rowCount = 0;
                //create input row if the table supports data changing
                if (this.#isTableEditable()) {
                        this.#inputRow = this.#createInputRow();
                        body.appendChild(this.#inputRow);
                }
                //making rows 
                for (let item of this.#data){
                        let id = item[0];
                        let idData = item[1];
                        let bodyRow = document.createElement('tr');
                        let bodyCellRowNumber = document.createElement('td');
                        bodyCellRowNumber.innerHTML = `${++rowCount}`;
                        bodyRow.appendChild(bodyCellRowNumber);
                        // making cells
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
                        // adding UI btnCell (change and del)
                        // create boolean on/off switch-setter to on/off editables of the Table;
                        if (this.#isTableEditable()) {
                                let btnCell = this.#createBtnCell(id, rowCount);
                                bodyRow.appendChild(btnCell);
                        }
                        body.appendChild(bodyRow);
                }
                return body;
        }
        /*
         * return input row to add or change data in row
         */
        #createInputRow(id = false) {
                let addItemForm = document.createElement('form');
                addItemForm.setAttribute('id', `${ id ? `${id}editItemForm` : 'addItemForm' }`);
                let inputRow = document.createElement('tr');
                if (!id) {
                        inputRow.classList.add('hidden');
                }
                let inputRowFormCell = document.createElement('td');
                inputRowFormCell.appendChild(addItemForm);
                inputRow.appendChild(inputRowFormCell);
                for (let inputConfig of this.#config.columns) {
                        let inputCell = this.#createInputCell(inputConfig, id);
                        inputRow.appendChild(inputCell);
                }
                // UI btnCell
                let btnCell = this.#createBtnInputCell(addItemForm, id);
                inputRow.appendChild(btnCell);
                return inputRow;
        }
        /*
         * return cell with inputs
         */
        #createInputCell(inputConfig, id) {
                let inputCell = document.createElement('td');
                let subInputs = inputConfig.input.length ? inputConfig.input.length : 1;
                for (let i = 0; i < subInputs; i++) {
                        let input = document.createElement('input');
                        let attributes = subInputs > 1 ? inputConfig.input[i] : inputConfig.input;
                        let type = attributes.type;
                        if (type === 'select') {
                                input = this.#selectInput(attributes, id);
                        }
                        if (type === 'color' && !id) {
                                input.value =  '#' + Math.floor(Math.random()*16777215).toString(16);
                        }
                        if (id) {// if id is present -> set values to inputs from item data
                                let itemData = this.#data.find( (item) => item[0] === id)[1];
                                input.value = itemData[attributes.name];
                        }
                        // creates diff. forms for each row
                        input.setAttribute('form', `${ id ? `${id}editItemForm` : 'addItemForm' }`);
                        //input.setAttribute('required', true); // to built-in form validation uncomment
                        this.#setPlaceholder(input, attributes, inputConfig);
                        for ( let attribute of Object.keys(attributes)) {
                                if (attribute === 'options') continue;
                                if (attributes[attribute] === 'select') {
                                        input.setAttribute(attribute, 'text');
                                        continue;
                                }
                                input.setAttribute(attribute, attributes[attribute]);
                        }
                        inputCell.appendChild(input);
                }
                return inputCell;
        }
        /*
         * return change and add btn cell
         */
        #createBtnInputCell(addItemForm, id = false) {
                let addNewBtnCell = document.createElement('td');
                let addBtn = document.createElement('button');
                addBtn.setAttribute('type', 'submit');
                addBtn.setAttribute('form', `${ id ? `${id}editItemForm` : 'addItemForm'}`);
                addBtn.setAttribute('name', `${ id ? 'edit' : 'add new'}`);
                let addBtnItemName = `${this.#itemsName[this.#itemsName.length-1].slice(0,-1)}`;
                addBtn.innerHTML = `${ id ? 'edit' : 'add new' } ${addBtnItemName}`;
                addItemForm.onsubmit = (e) => {
                        e.preventDefault();
                        const formInputs = Array.from(addItemForm.elements);
                        // validation
                        let notValide = 0;
                        for (let input of formInputs) {
                                input.style.borderColor = 'black';
                                if (input.value === '' && input.type !== 'submit' 
                                        || isCurrency(input) ) {
                                        input.style.borderColor = 'red';
                                        notValide++;
                                }
                        }
                        if (!notValide) {
                                const data = formInputs.reduce(catchInputs, {});
                                this.#changeData(id, JSON.stringify(data));
                        }
                }
                addNewBtnCell.appendChild(addBtn);
                return addNewBtnCell;


                /*
                 * is input a currency choose menu
                 */
                function isCurrency (input) {
                        return input.name === 'currency' && input.value === 'choose currency';
                }

                /*
                 * function for reduce
                 */
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
        /*
         * return menu for 'select' input type
         */
        #selectInput(attributes, id) {
                let select = document.createElement('select');
                let optionDefault = document.createElement('option');
                optionDefault.setAttribute('value', `choose ${attributes.name}`);
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
        /*
         * return cell with edit and del btns
         */
        #createBtnCell(id, rowCount) {
                let btnCell = document.createElement('td');
                btnCell.setAttribute('class', 'changeUI');
                let delBtn = document.createElement('button');
                let rowName = `${this.#itemsName[this.#itemsName.length-1].slice(0,-1)}`;
                delBtn.setAttribute('name', 'del');
                delBtn.innerHTML = `delete ${rowName}`;
                let changeBtn = document.createElement('button');
                changeBtn.setAttribute('name', 'edit');
                changeBtn.innerHTML = `change ${rowName}`;
                delBtn.addEventListener('click', () => {this.#changeData(id, false)});
                changeBtn.addEventListener('click', () => {
                        this.#replaceByInputRow(id, rowCount)});
                btnCell.appendChild(delBtn);
                btnCell.appendChild(changeBtn);
                return btnCell;
        }
        /*
         * replace row with inputRow to change the row data
         */
        #replaceByInputRow(id, rowCount){
                const changeRow = this.#createInputRow(id);
                let replaceTarget = this.#table.rows[rowCount + 1];
                let replacement = replaceTarget.parentElement.replaceChild(changeRow, replaceTarget);
        }
        /*
         * return table's head
         */
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
                if (this.#isTableEditable()) {// if isTableEditable add addButton
                        let addingBtnCell = this.#createInputHead(); 
                        headRow.appendChild(addingBtnCell);
                }
                head.appendChild(headRow);
                return head;
        }
        /*
         * return cell with added new item btn
         */
        #createInputHead() {
                const addingBtnCell = document.createElement('th');
                let itemName = this.#itemsName[this.#itemsName.length-1];
                addingBtnCell.innerHTML = `change ${itemName}`;
                let addNewItem = document.createElement('button');
                addNewItem.innerText = `add new ${itemName}`;
                addNewItem.addEventListener('click', () => {
                        this.#inputRow.classList.toggle('hidden');
                });
                addingBtnCell.appendChild(addNewItem);
                return addingBtnCell;
        }
        /*
         * return boolean is Table editable
         */
        #isTableEditable() {
                return this.#config.columns[0].input;
        }
        /*
         * construct head of the Table
         */
        #constructHeadRow(headRow, headElement) {
                let headCell = document.createElement('th');
                let cellWrapper = document.createElement('div');
                let cellTitle = document.createElement('p'); 
                cellTitle.innerHTML = `${headElement.title}`;
                cellWrapper.appendChild(cellTitle);
                let buttonWrapper = document.createElement('div');
                let increseBtn = document.createElement('div');
                increseBtn.setAttribute('class', 'increase');
                increseBtn.addEventListener('click', () => {
                        this.#sortData_updateBody(headElement.value, false)
                });
                let decreseBtn = document.createElement('div');
                decreseBtn.setAttribute('class', 'decrease');
                decreseBtn.addEventListener('click', () => {
                        this.#sortData_updateBody(headElement.value, true)
                });
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
                        value: (product) => getColorLabel(product.color),
                        input: { type: 'color', name: 'color' }
                }, 
        ],
        apiURL: "https://mock-api.shpp.me/dkolomytsev/products"
        //apiURL: "http://localhost:3000/products" // mockoon
};

const configProducts = {
        parent: '#productsTable',
        columns: [
                {title: 'Item name', value: 'title'},
                {title: 'Item price', value: (product) => `${product.price} ${product.currency}`},
                {title: 'Item color', value: (product) => getColorLabel(product.color)}, // функцію getColorLabel вам потрібно створити
        ],
        apiURL: "https://mock-api.shpp.me/dkolomytsev/products"
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
setCSS();

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

