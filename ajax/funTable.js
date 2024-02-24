//функціональний стиль: намалювати таблицю, відсортувати таблицю, 
//додати/змінити/видалити данні (це один метод, з різними параметрами)
//получається, що в функціональному стилі декомпозиція реалізується в самих HOF методах (*о*)
//
//extract dif. form of data: configData and itemData (as array id:{item data key:value})
//configData - > create Head
//itemData -> create Body
//function for add inputs realized with insert methods (add cell with btns to corresponding row)
//use: rowIndex property; insertRow(index) insertCell() methods; 
//Table object => rows (return tr collection) tBodies (return all tbody of a table) tHead (return all thead elements of a table); 
