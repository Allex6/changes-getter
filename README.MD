# ChangesGetter

[![NPM version]](https://www.npmjs.com/package/changes-getter)

## Features

**npm install changes-getter**

```js
const ChangesGetter = require ('changes-getter');
let changes = new ChangesGetter();
```

This tool allows you to find differences between files, objects and strings, in addition to having a method that waits for changes in a given file and returns them as soon as they happen.

## Main methods

* **watch (file, semantics, separator)**
	
	* Path to the file
	* Boolean value that indicates whether changes should be observed semantically. For example, separate the string "lorem ipsum" by the space between words. If the Boolean semantics value is false, the string will be processed character by character. **By default, this value is false.**
	* The separator that will be used if the second parameter of this method is true.
	* Second and third parameters are optional.

	Method responsible for observing a file and returning any changes. You must add a listener to the class in the **'change' event.** For example on ('change').

* **files (file1, file2, semantics, separator)**

	* Path to the first file
	* Path to the second file
	* **The third and fourth parameters are equivalent to the second and third parameters of the watch method, respectively. They are also optional.**

	Method responsible for comparing the contents of two files and returning their differences. Files with the following extensions are accepted: **.txt, .rtf, .html, .css, .json.**
	This method returns a promise.

* **structuredStrings (string1, string2, separator)**

	* First string
	* Second string
	* The separator that defines the structure of the strings. For example, in "rgb(0,0,0) rgb(255,255,255)" is the white space.

	Method responsible for returning differences in structured strings.

	Example: We have the **strings "rgb(0,0,0) rgb(255,255,255)" and "rgb(255,255,255) rgb(0,0,0)"**. Passing the separator " " as a parameter to the method we observe that we will be returned an array with two objects that represent the differences. Basically these differences will be updates in the first and second rgb, because, using the " " separator, the strings are divided into two parts and compared. String1 will have two indexes, which are the first and second rgb(), and string2 will also be divided in the same way. the comparison is made by the indexes, then: string1[0] == string2[0]. For this reason they are called structured strings.

* **Common values**

	* **jsons (json1, json2)**

		Method to compare json objects and return differences.

	* **arrays (array1, array2)**

		Method for comparing arrays and returning differences.

	* **strings (string1, string2)**

		Method for comparing strings in a non-semantic way and returning differences.

	* **semantics (string1, string2)**

		method to compare strings semantically and return differences.

## Examples

* watch

	We will wait for changes in a fictional file called 'file.txt' which has the content 'abc'.
	By modifying the contents of the file to 'bc a', we may receive the following results:

	In the case that we just pass the file path as a parameter to the watch method, we will receive the changes, insertion of the value 'bc ', and removal of the value 'bc' as a return.

	In the case where we pass the file path, the Boolean value true, and the " " separator for the method, we will receive the changes, removal of the value 'abc', and insertions of the values ​​'bc' and 'a' in return.

	As we can see there is a difference in the return of the method when passing the optional parameters. This is because, by default, characters are analyzed individually in search of differences, however, when using the semantic mode, the search for differences is made based on the parts separated by the informed separator (third parameter).
	**Detail:** This method does not return a value, you need to add a listener to the class to detect changes, using on ('change').

* jsons

	By passing the {name: 'Alex', email: 'example@mail.com.br'} and {email: 'modified-example@mail.com.br'} objects as parameters, respectively, we will return an array with two objects representing the differences. In these objects, we will see that the 'name' property has been removed, and the 'email' property has been updated.

* arrays

	By passing the arrays ['abc', 123] and ['abc', 456], as parameters, respectively, we will have as a return a new array with a single object representing the differences. In this case, only one difference will be found in the index [1], indicating an update.

* semantics

	Passing as a parameter the strings "lorem ipsum" and "lorem ipsum dolor sit amet", respectively, we will return an array of differences, which will indicate the insertion of the values "dolor sit amet".

* strings

	Passing as a parameter the strings "lorem ipsum" and "lorem ipsum dolor sit amet", respectively, we will return an array of differences, which will indicate the insertion of the values "dolor sit amet".

	Note that in this case, it does not use either the strings or semantics method, since the returned value will be the same, however, the semantics method uses a separator to analyze parts of the strings, while the string method analyzes characters individually.

* structuredStrings

	Passing as a parameter the strings "rgb(0,0,0) rgb(255,255,255)" and "rgb(255,255,255) rgb(255,255,255) rgb(10,10,10)", respectively, we will have as a return that the first rgb has been updated, and another rgb was inserted at the end.

## License

[MIT](https://github.com/Allex6/changes-getter/blob/master/LICENSE)