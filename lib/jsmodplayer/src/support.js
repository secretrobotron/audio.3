//Various helper functions


/*
	Creates a typed array (a view into an ArrayBuffer)
		Size is number of entries, not bytes
		Type is the kind of view
			can be "int8", "uint8", "int16", or "uint16"
			
	If unsupported (Opera) then it simply creates a normal array
*/

function TypedArray(size, type) {
	var multable = {int8: 1, uint8: 1, int16: 2, uint16: 2}
	var view;
	var supported = 
		(typeof ArrayBuffer !== "undefined") &&
		(typeof Int8Array !== "undefined") &&
		(typeof Int16Array !== "undefined") &&
		(typeof Uint8Array !== "undefined") &&
		(typeof Uint16Array !== "undefined");
		
	if (supported) {
		var buffer = new ArrayBuffer(size * multable[type]);
		switch (type) {
			case "int8": return new Int8Array(buffer); break;
			case "int16": return new Int16Array(buffer); break;
			case "uint8": return new Uint8Array(buffer); break;
			case "uint16": return new Uint16Array(buffer); break;
		}
	} else {
		return new Array(size);
	}

	return
	
}

