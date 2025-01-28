export const utilService ={
    saveToStorage,
    loadFromStorage,
    _makeId,
    removeItem
}
function saveToStorage(key, val) {
    const strVal = JSON.stringify(val)
	localStorage.setItem(key, strVal)
}

function loadFromStorage(key) {
	var val = localStorage.getItem(key)
	return JSON.parse(val)
}

function removeItem(key){
    localStorage.removeItem(key)
}

function _makeId() {
    return Date.now().toString(36)
}