const Changes = require('./lib/index');

const watcher = new Changes();

/*watcher.watch('./test.txt');
watcher.on('change', data=>{
    console.log(data);
});*/


/*let example1 = {
    "glossary": {
        "title": "example glossary",
		"GlossDiv": {
            "title": "S",
			"GlossList": {
                "GlossEntry": {
                    "ID": "SGML",
					"SortAs": "SGML",
					"GlossTerm": "Standard Generalized Markup Language",
					"Acronym": "SGML",
					"Abbrev": "ISO 8879:1986",
					"GlossDef": {
                        "para": "A meta-markup language, used to create markup languages such as DocBook.",
						"GlossSeeAlso": ["GML", "XML"]
                    },
					"GlossSee": "markup"
                }
            }
        }
    }
}

let example2 = {
    "glossary": {
        
		"GlossDiv": {

			"GlossList": {
                "GlossEntry": {
                    "ID": "diferente",
					"SortAs": "SGML",
					"GlossTerm": "Standard Generalized Markup Language",
					"Acronym": "SGML",
					"Abbrev": "ISO 8879:1986",
					"GlossDef": {
                        "para": "A meta-markup language, used to create markup languages such as DocBook.",
						"GlossSeeAlso": ["GML", "XML"]
                    },
					"GlossSee": "markup",
                    "novaChave": "novoValor"
                }
            }
        }
    }
}


let json1 = {
    name: 'Alex',
    email: 'example@mail.com.br'
}

let json2 = {
    email: 'modified-example@mail.com.br'
}

console.log(watcher.jsons(json1, json2));*/


/*let array1 = ["abc", 123];
let array2 = ["abc", 456];

console.log(watcher.arrays(array1, array2));



let str1 = "lorem ipsum";
let str2 = "lorem ipsum dolor sit amet";

console.log(watcher.strings(str1, str2));
*/

// ************************** TESTES ************************** //

//watcher.watch('./tests/files_to_watch/file1.txt');
//watcher.watch('./tests/files_to_watch/file1.txt', true, " ");     Forma semântica

//watcher.watch('./tests/files_to_watch/file1.json');

//watcher.watch('./tests/files_to_watch/file1.html');

//watcher.watch('./tests/files_to_watch/file1.css');

/*watcher.watch('./tests/files_to_watch/file1.css');
watcher.on('change', data=>{

    console.log(data);

});

watcher.files('./tests/jsons/file1.json', './tests/jsons/file2.json').then(differences=>{
    console.log(differences);
}).catch(err=>{
    console.log(err);
});


watcher.files('./tests/htmls/file1.html', './tests/htmls/file2.html').then(differences=>{
    console.log(differences);
}).catch(err=>{
    console.log(err);
});

watcher.files('./tests/css/file1.css', './tests/css/file2.css').then(differences=>{
    console.log(differences);
}).catch(err=>{
    console.log(err);
});

watcher.files('./tests/txt/file1.txt', './tests/txt/file2.txt', true, " ").then(differences=>{
    console.log(differences);
}).catch(err=>{
    console.log(err);
});


let str1 = `
    000 111 222 333 444 555
    666 777 888 999 101 111
`;
let str2 = `
    000 222 444 666 888 101
    121 141 161 181 201 221
`;
*/
let str3 = `rgb(0,0,0) rgb(255,255,255)`;
let str4 = `rgb(255,255,255) rgb(255,255,255) rgb(10,10,10)`;

console.log(watcher.structuredStrings(str3, str4, " "));


// O MÉTODO SEMANTICS NÃO TÁ MOSTRANDO O START E END DAS MUDANÇAS