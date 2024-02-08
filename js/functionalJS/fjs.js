const dbGraber = document.querySelector('#db');
const textGraber = document.querySelector('#text');
let db;
let secondDB;
const print = document.querySelector('#print');
const print2wordBase = document.querySelector('#print2wdb');
dbGraber.addEventListener('change', (event) => {db = makeDB(event.currentTarget.value);
        secondDB = makeTwoDB(event.currentTarget.value);
});
textGraber.addEventListener('change', (event) => { 
        if (db !== undefined) {
                print.innerHTML = db(event.currentTarget.value);
                print2wordBase.innerHTML = secondDB(event.currentTarget.value);
        } else {
                print.innerHTML = 'create a db first';
        }
});

function makeDB (text) {
        const db = text.split(/\r?\n/)
        .filter( (item) => { return (item.length > 0 && item.charAt(0) != '#') } )
        .map(tokenize)
        .sort( (item1, item2) => { return item2.population - item1.population; } )
        .slice(0, 10)
        .reduce(createDB,{});
        alert('A new DB was created'); 
        return textModification;
        function tokenize(data) {
                const items = data.split(',');
                return {name: items[2], population: items[3]};
        }
        function createDB(result, item, rateIndex) {
                result[item.name] = {population: item.population, rate: rateIndex + 1};
                return result;
        }
        function textModification (string) {
                Object.keys(db).map( 
                        (city) => {
                                string = string.replaceAll(city, `${city} (${db[city].rate} place in the TOP-10 of towns in the Ukraine, its population is ${db[city].population} ${db[city].population % 10 === 1 ? 'ludyna' : db[city].population % 10 < 5 && db[city].population % 10 > 0  ? 'ludyny' : 'ludey'})`)
                        });
                return string;
        }
}

function makeTwoDB(text) {
        const db = text.split(/\r?\n/)
        .filter( (item) => { return (item.length > 0 && item.charAt(0) != '#') } )
        .map(tokenize)
        .sort( (item1, item2) => { return item2.population - item1.population; } )
        .slice(0, 10)
        .reduce(createDB,{});
        const db2w = Object.keys(db).reduce(make2wdb, {});
        console.log(db2w);
        alert('A single-word search DB was created'); 
        return changeString;
        function changeString (string) {
                //if single-word city names only - it is faster and works quickly with a long db
                const stringArray = string.split(' ');
                console.log(stringArray);
                const newStringArray = stringArray.map((word) => {
                        return Object.keys(db).includes(word) ? 
                                `${word} (${db[word].rate} place [the sentence was created by searching a single-word of the entered String in the DB], population is ${db[word].population} ${db[word].population % 10 === 1 ? 'ludyna'
                                                : db[word].population % 10 < 5 && db[word].population % 10 > 0  ? 'ludyny' 
                                                : 'ludey'})`
                                : word;
                });
                let newString = newStringArray.join(' ');
                // changing not-single-word
                Object.keys(db2w).map( 
                        (city) => {
                                newString = newString.replaceAll(city, `${city} (${db2w[city].rate} place [the sentence was created by searching a more-than-one-word key of the DB in the entered String], its population is ${db2w[city].population} ${db2w[city].population % 10 === 1 ? 'ludyna' : db2w[city].population % 10 < 5 && db2w[city].population % 10 > 0  ? 'ludyny' : 'ludey'})`)
                        });
                return newString;
        }

        function make2wdb(result, key){
                if (key.includes(' ')){
                        result[key] = {population: db[key].population, rate: db[key].rate};
                }
                return result;
        }
        function tokenize(data) {
                const items = data.split(',');
                return {name: items[2], population: items[3]};
        }
        function createDB(result, item, rateIndex) {
                result[item.name] = {population: item.population, rate: rateIndex + 1};
                return result;
        }
}
