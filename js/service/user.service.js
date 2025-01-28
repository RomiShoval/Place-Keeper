import { utilService } from "./util.service.js";

export const userService ={
    onInit,
    savePref,
    loadPref,
    applyUserPreferences,
    removeUserWhenRefresh,
    validateAgeMatch
}

const USER_PREF_KEY = 'userPref';

const user = { 
    email : '',
    txtColor : '',
    bgColor : '', 
    age : '', 
    birthDate: '', 
    birthTime: '' ,
    gender:''
}

function onInit(){
    loadPref()
}

function savePref(user){
    utilService.saveToStorage(USER_PREF_KEY,user);
}

function loadPref(){
    const userPrefs = utilService.loadFromStorage(USER_PREF_KEY);
    return userPrefs
}

function removeUserWhenRefresh(){
    utilService.removeItem(USER_PREF_KEY)
    console.log('User preferences removed from localStorage.');
}

function applyUserPreferences(userPrefs) {
    if(!userPrefs) return
    try{
        document.body.style.color = userPrefs.txtColor || '#000000';
        document.body.style.backgroundColor = userPrefs.bgColor || '#ffffff';
        document.getElementById('email').value = userPrefs.email || null;
        document.getElementById('age').value = userPrefs.age || null;
        document.getElementById('bgColor').value = userPrefs.bgColor || null;
        document.getElementById('txtColor').value = userPrefs.txtColor || null;
        document.getElementById('birthDate').value = userPrefs.birthDate || null;
        document.getElementById('birthTime').value = userPrefs.birthTime || null;
        document.getElementById('age-value').innerText = userPrefs.age || 'no age';
        document.getElementById('gender').value = userPrefs.gender || '';

    }
    catch(error){
        console.log(error)
    }
    
  }
  function validateAgeMatch(birthDate, age) {
    const birthYear = new Date(birthDate).getFullYear();
    console.log(birthYear)
    const currentYear = new Date().getFullYear();
    const expectedAge = currentYear - birthYear;
    return parseInt(age) === expectedAge;
}


