#!/usr/bin/env node

const EventEmitter = require('events');

const FIRST_HIGHER = 1;
const FIRST_SMALLER = 2;
const EQUAL = 3;

class Changes extends EventEmitter {

	constructor(){

		super();

		this.fs = require('fs');
		this.util = require('util');
		this.path = require('path');
		this.promisifyFunctions();
		this.internalEvents();

		this.jsonChanges = [];

	}

	promisifyFunctions(){

		this.fs.readFile = this.util.promisify(this.fs.readFile);

	}

	watch(file, semantics = false, separator = null){

		this.fs.readFile(file).then(data=>{

			this.oldFileContent = data;
			this.emit('file-readded-first');

		}).catch(err=>{
			console.log(err);
		});

		this.on('file-readded-first', ()=>{

			this.fs.watchFile(file, ((current, previous)=>{

				if (current.mtime != previous.mtime) {

					this.fs.readFile(file).then(data=>{

						this.newFileContent = data;
						let dataToPass = {
							fileExt: this.path.extname(file),
							semantics,
							separator
						}
						this.emit('new-change', dataToPass);

					}).catch(err=>{
						console.log(err);
					});

				}

			}));

		});

	}

	internalEvents(){

		this.on('new-change', (dataToPass)=>{

			if (!this.newFileContent.equals(this.oldFileContent)) {

				switch (dataToPass.fileExt) {

					case '.rtf':
					case '.txt':
						
						if (dataToPass.semantics) {
							
							this.emit('change', this.semantics(this.oldFileContent.toString(), this.newFileContent.toString(), dataToPass.separator));

						} else{
							this.emit('change', this.strings(this.oldFileContent.toString(), this.newFileContent.toString()));
						}

						break;

					case '.html':

						this.emit('change', this.getHTMLDifferences(this.oldFileContent.toString(), this.newFileContent.toString()));

						break;

					case '.css':

						this.emit('change', this.getCSSDifferences(this.oldFileContent.toString(), this.newFileContent.toString()));

						break;

					case '.json':

						this.emit('change', this.jsons(this.oldFileContent.toString(), this.newFileContent.toString()));

						break;

				}

			}

		});

	}

	removeCommas(string){

		return string.replace(/,/g, "");

	}

	removeLinesChars(string){

		string = string.replace(/\n/g, "");
		string = string.replace(/\r/g, "");
		string = string.replace(/\t/g, "");

		return string;

	}

	txt(file1, file2){

		this.processFiles(file1, file2).then(data=>{

			let contents = this.convertContentsToStrings(data);
			contents[0] = this.removeLinesChars(contents[0]);
			contents[1] = this.removeLinesChars(contents[1]);

			this.strings(contents[0], contents[1]);

		}).catch(err=>{
			console.log(err);
		});

	}

	processFiles(file1, file2){

		return new Promise((resolve, reject)=>{

			let files = [];

			this.fs.readFile(file1).then(data=>{

				files.push(data);

				this.fs.readFile(file2).then(data=>{

					files.push(data);
					resolve(files);

				}).catch(err=>{
					reject(err);
				});

			}).catch(err=>{
				reject(err);
			});

		});

	}

	convertContentsToStrings(contents = []){

		let finalContents = [];

		contents.forEach(content=>{
			finalContents.push(content.toString());
		});

		return finalContents;

	}


	strings(string1, string2){

		let finalDifferences = [];

		let obj;

		while (string1 != string2) {
			
			if (string1.length > string2.length) {

				obj = this.stringProcess(string1, string2, FIRST_HIGHER);

			} else if (string1.length <= string2.length) {
				
				obj = this.stringProcess(string1, string2, FIRST_SMALLER);

			}

			string1 = (obj.value1).join("");
			string2 = (obj.value2).join("");

			obj.differences.forEach(el=>{
				finalDifferences.push(el);
			});

		}

		return finalDifferences;

	}

	stringProcess(string1, string2, mode){

		string1 = string1.split("");
		string2 = string2.split("");

		let difs = 0;
		let start = 0;
		let end = 0;
		let differencesCollection = [];
		let aux = 0;

		let obj = {
			value1: string1,
			value2: string2,
			differences: differencesCollection
		};

		switch (mode) {

			case FIRST_HIGHER:
				
				for (var i = 0; i <= (string1.length - 1); i++) {

					if (string2[i - aux]) {//verifica se o new ainda possui conteúdo a frente

						if (string2[i - aux] != string1[i]) {

							if (difs == 0) start = i;

							difs++;
							aux++;

						} else if (string2[i - aux] == string1[i] && difs > 0) {
							
							end = i;

							differencesCollection.push({
								start,
								end,
								difs,
								type: 'removed',
								content: (string1.slice(start, end)).join("")
							});

							obj.value1.splice(start, (difs));

							difs = 0;
							end = 0;
							start = 0;

						}

					} else {

						start = i;
						end = string1.length;
						difs = end - start;

						differencesCollection.push({
							start,
							end,
							difs,
							type: 'removed',
							content: (string1.slice(start, end)).join("")
						});

						obj.value1.splice(string2.length);

						difs = 0;
						end = 0;
						start = 0;

						break;

					}

				}

				if (string1 != string2 && differencesCollection.length == 0 && difs > 0) {

					differencesCollection.push({
						start,
						end: start + 1,
						difs: 1,
						type: 'removed',
						content: (string1.slice(start, (start + 1))).join("")
					});

					obj.value1.splice(start, 1);

				}

				obj.differences = differencesCollection;

				return obj;

				break;

			case FIRST_SMALLER:
				
				for (var i = 0; i <= (string2.length - 1); i++) {

					if (string1[i - aux]) {

						if (string1[i - aux] != string2[i]) {

							if (difs == 0) start = i;

							difs++;
							aux++;

						} else if (string1[i - aux] == string2[i] && difs > 0) {
							
							end = i;

							differencesCollection.push({
								start,
								end,
								difs,
								type: 'inserted',
								content: (string2.slice(start, end)).join("")
							});

							obj.value2.splice(start, (difs));

							difs = 0;
							end = 0;
							start = 0;

							break;

						}

					} else {

						start = i;
						end = string2.length;
						difs = end - start;

						differencesCollection.push({
							start,
							end,
							difs,
							type: 'inserted',
							content: (string2.slice(string1.length)).join("")
						});

						obj.value2.splice(string1.length);
						

						difs = 0;
						end = 0;
						start = 0;
						break;

					}

				}

				if (string1 != string2 && differencesCollection.length == 0 && difs > 0) {

					differencesCollection.push({
						start,
						end: start + 1,
						difs: 1,
						type: 'removed',
						content: (string1.slice(start, (start + 1))).join("")
					});

					obj.value1.splice(start, 1);

				}

				obj.differences = differencesCollection;

				return obj;

				break;

		}

	}

	processObjs(obj1, obj2, parent = null){

		for (let propertie in obj1) {

			if (typeof obj1[propertie] == 'object' && obj2[propertie] && typeof obj2[propertie] == 'object') {
				this.processObjs(obj1[propertie], obj2[propertie], propertie);
			} else {

				let element = {
					propertie,
					value: obj1[propertie],
					type: typeof obj1[propertie],
					parent,
					change: 'removed'
				};

				if (!obj2[propertie]) {

					this.jsonChanges.push(element);

				} else if (obj2[propertie] && obj2[propertie] != obj1[propertie]) {

					let updatedElement = {
						propertie,
						value: obj2[propertie],
						type: typeof obj2[propertie],
						parent,
						change: 'updated'
					};

					this.jsonChanges.push(updatedElement);

				}

				obj2[propertie] = undefined;

			}

		}

		this.jsonObj1 = obj1;
		this.jsonObj2 = obj2;

	}

	processObj2Residual(obj2, parent = null){

		for (let propertie in obj2) {

			if (typeof obj2[propertie] == 'object') {
				this.processObj2Residual(obj2[propertie], propertie);
			} else {

				if (obj2[propertie] != undefined) {

					this.jsonChanges.push({
						propertie,
						value: obj2[propertie],
						type: typeof obj2[propertie],
						parent,
						change: 'inserted'
					});

				}

			}
			
		}

	}

	jsonProcess(){
		this.processObj2Residual(this.jsonObj2);
	}

	jsons(obj1, obj2){

		this.jsonChanges = [];

		if (typeof obj1 != 'object' && typeof obj2 != 'object') {
			obj1 = JSON.parse(obj1);
			obj2 = JSON.parse(obj2);
		}

		this.processObjs(obj1, obj2);
		this.jsonProcess();

		return this.jsonChanges;

	}

	arrays(array1, array2){

		return this.jsons(array1, array2);

	}

	semantics(string1, string2, separator){

		let array1 = string1.split(separator);
		let array2 = string2.split(separator);

		let changes = [];

		for (let i = 0; i <= (array1.length - 1); i++) {

			let indexOfMatch = array2.indexOf(array1[i]);
			
			if (indexOfMatch == -1) {
				
				changes.push({
					value: array1[i],
					type: 'removed'
				});

			} else {
				
				array2[indexOfMatch] = undefined;

			}

		}

		array2.forEach(word=>{

			if (word != undefined) changes.push({
				value: word,
				type: 'inserted'
			});

		});

		return changes;

	}

	files(file1, file2, semantics = false, separator = null){

		return new Promise((resolve, reject)=>{

			let ext1 = this.path.extname(file1);
			let ext2 = this.path.extname(file2);

			if (ext1 != ext2) {
				throw new Error("The provided files do not have same extensions!");
			} else {

				switch (ext1) {

					case '.rtf':
					case '.txt':
						
						if (semantics) {
							
							this.txtSemantic(file1, file2, separator).then(differences=>{

								resolve(differences);

							}).catch(err=>{
							    reject(err);
							});

						} else{
							this.txt(file1, file2);
						}

						break;

					case '.html':

						this.htmlFiles(file1, file2).then(differences=>{

							resolve(differences);

						}).catch(err=>{
						    reject(err);
						});

						break;

					case '.css':

						this.cssFiles(file1, file2).then(differences=>{

							resolve(differences);

						}).catch(err=>{
						    reject(err);
						});

						break;

					case '.json':

						this.jsonFiles(file1, file2).then(differences=>{

							resolve(differences);

						}).catch(err=>{
						    reject(err);
						});

						break;

				}

			}

		});

	}

	txtSemantic(file1, file2, separator){

		return new Promise((resolve, reject)=>{

			this.processFiles(file1, file2).then(data=>{

				let contents = this.convertContentsToStrings(data);
				if (contents[0] && contents[1]) {

					let str1 = contents[0];
					let str2 = contents[1];

					resolve(this.semantics(str1, str2, separator));

				}

			}).catch(err=>{
				reject(err);
			});

		});

	}

	htmlFiles(file1, file2){

		return new Promise((resolve, reject)=>{

			this.processFiles(file1, file2).then(data=>{

				let contents = this.convertContentsToStrings(data);
				if (contents[0] && contents[1]) {

					let str1 = contents[0];
					let str2 = contents[1];

					resolve(this.getHTMLDifferences(str1, str2));

				}

			}).catch(err=>{
				reject(err);
			});

		});

	}

	cssFiles(file1, file2){

		return new Promise((resolve, reject)=>{

			this.processFiles(file1, file2).then(data=>{

				let contents = this.convertContentsToStrings(data);
				if (contents[0] && contents[1]) {

					let str1 = contents[0];
					let str2 = contents[1];

					resolve(this.getCSSDifferences(str1, str2));

				}

			}).catch(err=>{
				reject(err);
			});

		});

	}

	jsonFiles(file1, file2){

		return new Promise((resolve, reject)=>{

			this.processFiles(file1, file2).then(data=>{

				let contents = this.convertContentsToStrings(data);
				if (contents[0] && contents[1]) {

					let json1 = JSON.parse(contents[0]);
					let json2 = JSON.parse(contents[1]);

					resolve(this.jsons(json1, json2));

				}

			}).catch(err=>{
				reject(err);
			});

		});

	}

	getHTMLDifferences(str1, str2){

		let OTstr1 = str1.match(/<(\w+.*?)>/gim); //tags de abertura
		let CTstr1 = str1.match(/<\/\w+>/gim); //tags de fechamento

		let OTstr2 = str2.match(/<(\w+.*?)>/gim); //tags de abertura
		let CTstr2 = str2.match(/<\/\w+>/gim); //tags de fechamento

		let str1Elements = this.organizeHTMLElements(str1, OTstr1);
		let str2Elements = this.organizeHTMLElements(str2, OTstr2);

		return this.postProcessHTMLDifferences(str1Elements, str2Elements);

	}

	postProcessHTMLDifferences(str1Elements, str2Elements){

		let differences = [];
		let indexesToBeRemoved = [];

		str1Elements.forEach(el=>{

			for (let i = 0; i <= (str2Elements.length - 1); i++) {
				
				if (str2Elements[i].tag == el.tag && str2Elements[i].content != el.content) {

					differences.push({
						tag: str2Elements[i].tag,
						content: str2Elements[i].content,
						start: str2Elements[i].start,
						end: str2Elements[i].end,
						type: 'updated'
					});

					indexesToBeRemoved.push(i);

					break;

				} else if (str2Elements[i].tag == el.tag && str2Elements[i].content == el.content) {

					indexesToBeRemoved.push(i);

					break;

				} else if (i == (str2Elements.length - 1)) {
					
					differences.push({
						tag: el.tag,
						content: el.content,
						start: el.start,
						end: el.end,
						type: 'removed'
					});

				}

			}

		});

		indexesToBeRemoved.forEach(index=>{

			str2Elements[index] = undefined;

		});

		str2Elements.forEach(el=>{

			if (el != undefined) {

				differences.push({
					tag: el.tag,
					content: el.content,
					start: el.start,
					end: el.end,
					type: 'inserted'
				});

			}

		});

		return differences;

	}

	organizeHTMLElements(str, openingTags){

		let elementsArray = [];

		openingTags.forEach(tag=>{

			let start = str.search(tag);
			let end = this.getClosingTagPos(str, tag);
			let content = '';

			if (end != '') {
				content = this.removeLinesChars(str.slice(start, end));
			}

			if (tag != '<html>' && tag != '<body>') {

				elementsArray.push({
					tag,
					content,
					start,
					end
				});

			}

		});

		return elementsArray;

	}

	getClosingTagPos(str, tag){

		switch (tag) {

			case '<br>':
				return '';
				break;

			default:

				tag = tag.replace("<", "</");
				if (tag.indexOf(" ") != -1) tag = tag.split(" ")[0]+">";
				return (str.search(tag) + tag.length);

				break;

		}

	}

	getCSSDifferences(str1, str2){

		let str1Properties = this.removeKeysFromArray(str1.match(/^(.+?){/gim));
		let str2Properties = this.removeKeysFromArray(str2.match(/^(.+?){/gim));

		let str1Elements = this.organizeCSSElements(str1Properties, str1);
		let str2Elements = this.organizeCSSElements(str2Properties, str2);

		let differences = [];

		for (let name in str1Elements) {

			if (str2Elements[name]) {

				let result = this.jsons(str1Elements[name], str2Elements[name]);
				
				if (result.length > 0) {

					result.forEach(el=>{
						el.selector = name;
					});

					differences = Object.assign(differences, result);

				}

				str2Elements[name] = undefined;

			} else {

				differences.push({
					type: 'removed',
					selector: name,
					content: str1Elements[name]
				});

			}

		}

		for (let propertie in str2Elements) {
			
			if (str2Elements[propertie] != undefined) {

				differences.push({
					type: 'inserted',
					selector: propertie,
					content: str2Elements[propertie]
				});

			}

		}

		return differences;

	}

	organizeCSSElements(strProperties, cssStr){

		let strElements = [];

		for (let i = 0; i <= (strProperties.length - 1); i++) {

			if (i == (strProperties.length - 1)) {

				let start = cssStr.search(strProperties[i]) + strProperties[i].length;
				strElements[strProperties[i]] = this.cssToJSON(cssStr.substr(start));

			} else {

				let start = cssStr.search(strProperties[i]) + strProperties[i].length;
				let end = cssStr.search(strProperties[i + 1]);

				strElements[strProperties[i]] = this.cssToJSON(cssStr.substring(start, end));

			}

		}

		return strElements;

	}

	cssToJSON(css){

		css = this.removeLinesChars(css).trim().replace(/;/g, ",");

		let json = {};

		css.split(",").forEach(pair=>{

			let keyValue = pair.split(":");

			if (keyValue.length == 2) {

				let key = keyValue[0].trim().replace(/{/g, "").replace(/}/g, "");
				let value = keyValue[1].trim().replace(/{/g, "").replace(/}/g, "");

				json[key] = value;

			}

		});

		return json;

	}

	removeKeysFromArray(array){

		let newValues = [];

		array.forEach(str=>{

			newValues.push(str.replace(" {", ""));

		});

		return newValues;

	}

	structuredStrings(str1, str2, separator){

		str1 = this.removeLinesChars(str1);
		str2 = this.removeLinesChars(str2);

		let str1Separated = str1.split(separator);
		let str2Separated = str2.split(separator);

		let differences = [];
		let oldStart = 0;
		let oldEnd = 0;
		let newStart = 0;
		let newEnd = 0;

		for (let i = 0; i <= (str1Separated.length - 1); i++) {
			
			if (str2Separated[i] && str1Separated[i] == str2Separated[i]) {
				str2Separated[i] = undefined;
				continue;
			} else if (str2Separated[i] && str1Separated[i] != str2Separated[i]) {

				oldStart = i * (str1Separated[i].length + (separator.length));
				oldEnd = oldStart + (str1Separated[i].length + (separator.length));

				newStart = i * (str2Separated[i].length + (separator.length));
				newEnd = newStart + (str2Separated[i].length + (separator.length));

				differences.push({
					type: 'updated',
					oldContent: str1Separated[i],
					newContent: str2Separated[i],
					oldStart,
					oldEnd,
					newStart,
					newEnd
				});

				str2Separated[i] = undefined;

			}

		}

		str2Separated.forEach(el=>{

			if (el != undefined && el != '') {

				differences.push({
					type: 'inserted',
					content: el
				});

			}

		});

		return differences;

	}

}

module.exports = Changes;