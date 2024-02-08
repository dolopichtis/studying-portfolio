function DataTable(config, data) {
        // creating table
        // head
        let html2add = '<table> <thead> <tr> <th>#</th>';
        for (let head of config.columns) {
                html2add += `<th><div><p>${head.title}</p><div><div class='${head.value}-${config.parent.split('#')[1]} low'></div><div class='${head.value}-${config.parent.split('#')[1]} hight'></div></div></div></th>`;
        }
        html2add  += '</tr> </thead>';
        // body
        html2add += '<tbody>';
        let count = 0;
        for (let row of data) {
                html2add += `<tr><td>${++count}</td>`;
                for ( let cell of config.columns) { 
                        html2add += `<td>${row[cell.value]}</td>`;
                }
                html2add += '</tr>';
        }
        html2add  += '</tbody> </table>';
        
        // rendering table
        const target = document.querySelector(config.parent);
        if(target !== null){
                target.innerHTML = html2add;
                for (let head of config.columns) {
                        let sortBtnLow = document.querySelector(`.${head.value}-${config.parent.split('#')[1]}.low`);
                        let sortBtnHight = document.querySelector(`.${head.value}-${config.parent.split('#')[1]}.hight`);
                        sortBtnLow.addEventListener('click', () => {sortData(`${head.value}`, config, data, true)});
                        sortBtnHight.addEventListener('click', () => {sortData(`${head.value}`, config, data, false)});
                }
        } else {
                alert(`you don't incert table id in html, so table (${config.parent}) can't be rendered`);
        }
}
function sortData(column, config, data, isSorted) {
        let isLow = isSorted ? -1 : 1;
                data.sort( (item1, item2) => {
                        if (item1[column].toString().toLowerCase() > item2[column].toString().toLowerCase()) {return -1 * isLow;}
                        if (item1[column].toString().toLowerCase() < item2[column].toString().toLowerCase()) {return 1 * isLow;}
                        return 0;
                });
        DataTable(config, data); 
}
const config1 = {
        parent: '#usersTable',
        columns: [
                {title: 'name', value: 'name'},
                {title: 'surname', value: 'surname'},
                {title: 'age', value: 'age'},
        ]
};
const config2 = {
        parent: '#usersTable2',
        columns: [
                {title: 'name', value: 'name'},
                {title: 'surname ', value: 'surname'},
                {title: 'age ', value: 'age'},
        ]
};

const users = [
        {id: 30050, name: 'John', surname: 'Johnson', age: 12},
        {id: 30051, name: 'John', surname: 'Doe', age: 15},
];
const users2 = [
        {id: 30050, name: 'Johnson', surname: 'Johnatan', age: 12},
        {id: 30051, name: 'Jaine', surname: 'Doe', age: 15},
        {id: 30051, name: 'Jaine', surname: 'Dze', age: 25},
        {id: 30051, name: 'Jaine', surname: 'Dae', age: 35},
];

DataTable(config1, users);
DataTable(config2, users2);
let head = document.getElementsByTagName('HEAD')[0];
let cssLink = document.createElement('link');
cssLink.rel = 'stylesheet';
cssLink.type = 'text/css';
cssLink.href = 'table.css';
head.appendChild(cssLink);
