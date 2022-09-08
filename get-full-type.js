
/** 
 * Функция возвращает полную сигнатуру типа данных переданного объекта
 */
function getFullType(obj){
	if(obj == null){
		return {type:'null', primitive:true};
	}
	let type = typeof(obj);
	if(type !== 'object'){
		return {type:type, primitive:true};
	}
	if(Array.isArray(obj)){
		return {
			type:'array',
			length:obj.length,
			items:obj.map(getFullType)
		};
	}
	else{
		let keys = Object.keys(obj).sort();
		
		return {
			type:'object',
			keys,
			fields:Object.fromEntries(Object.entries().map(([key, value])=>([key, getFullType(value)]))
		}
	}
}

module.exports = getFullType;