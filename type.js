const {SetWithKey} = require('@grunmouse/special-map');


class Type {
	get name(){
		return this.constructor.name;
	}
	
	get key(){
		return this.toString();
	}
}

/**
 * @class
 * Конструктор констант примитивных типов
 */
class Primitive extends Type{
	constructor(name){
		if(primitives.has(name)){
			return primitives.get(name);
		}
		this.name = name;
	}
	
	toString(){
		return this.name;
	}
}

const primitives = new Map();

[
	'null', 'number', 'string', 'boolean'
].forEach((name)=>(primitives.set(name, new Primitive(name))));

/**
 * @class
 * абстрактный класс представления структуры
 */
class AbstractStruct extends Type{
	constructor(fields){
		let entries = Array.isArray(fields) ? fields.slice(0) : Object.entries(fields);
		entries.sort(([ia, a], [ib, b])=>((ia > ib) - (ia < ib)));
		this.fields = new Map(entries);
		this.entries = entries;
	}
	
	get length(){
		return this.keys.length;
	}
	
	toString(){
		return this.name+'{' + this.entries.map(([key, value])=>(key + ':' + value.toString())) +'}';
	}
}

/**
 * @class
 * Объект без интерпретации
 */
class JSObject extends AbstractStruct{

	interpret(){
		return new Variant(
			new Struct(this.entries), 
			new Associative(new Variant([...this.fields.values()]))
		);
	}
}

/**
 * @class
 * интерпретация объекта как структуры
 */
class Struct extends AbstractStruct{
	
}

/**
 * @class
 * интерпретация объекта как ассоциативного массива
 */
class Associative extends Type {
	constructor(type){
		this.type = type;
	}
	toString(){
		return this.name + '<' + this.type +'>';
	}
}

/**
 * @class
 * Массив без интерпретации
 */
class JSArray extends Type{
	constructor(items){
		this.items = items;
	}
	
	get length(){
		return this.items.length;
	}
	
	toString(){
		return this.name + '[' + this.items.map(item=>item.toString()).join(',') + ']';
	}
	
	interpret(){
		return new Variant(
			new Tuple(this.items), 
			new TypedArray(new Variant(this.items), this.length)
		);
	}
	
}

/**
 * @class
 * Массив без ограничений на порядок значений
 */
class TypedArray extends Type{
	constructor(type, length){
		this.length = length;
		this.type = type;
	}
	toString(){
		return this.name + '[' + this.length + ']<' + this.type +'>';
	}
}

/**
 * @class
 * Интерпретация массива как кортежа
 * Реализуется структурой, в которой поля поименованы числами, а не строками
 */
class Tuple extends AbstractStruct{
	constructor(items){
		super(items.map((val, i)=>([i, val])));
		this.items = items;
	}

	toString(){
		return this.name + '[' + this.items.map(item=>item.toString()).join(',') + ']';
	}	
}

class AbstractDerived extends Type{
	constructor(parts){
		const set = new SetWithKey();
		for(let part of parts){
			set.add(part);
		}
		this.parts = [...set.values()];
	}
}

/**
 * @class
 * Класс-пересечение совместимых типов
 */
class Product extends AbstractDerived{
	
	toString(){
		return '(' + this.parts.map(item=>item.toString()).join('&') + ')';
	}
}

/**
 * @class
 * Класс-объединение типов
 */
class Variant extends AbstractDerived{

	toString(){
		return '(' + this.parts.map(item=>item.toString()).join('|') + ')';
	}
}