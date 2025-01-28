import { storageService } from "./storage.service.js"
import { utilService } from "./util.service.js";

export const placeService ={
    getPlaces,
    getPlaceById,
    addPlace,
    removePlace,
    updatePlace,
    _createPlace,
    _createPlaces
}


const PLACES_KEY = 'places'



_createPlaces()
//read all places - CRUDL
function getPlaces(){
    return storageService.query(PLACES_KEY);
}


//get car by Id - CRUDL
async function getPlaceById(placeId){
    return storageService.getEntityById(placeId,PLACES_KEY);
}

// create - CRUDL
async function addPlace(name,lat,lng,zoom){
    return storageService.post({name,lat,lng,zoom},PLACES_KEY)
}

//delete - CRUDL
async function removePlace(placeId){
    storageService.remove(placeId,PLACES_KEY)
}

//update - CRUDL
async function updatePlace(placeId ,lat,lng,name){
    return storageService.update(PLACES_KEY,{id :placeId ,lat,lng,name})
}

async function _createPlace(name,lat,lng,zoom=10){
    return {
        id : utilService._makeId(),
        name :name ,
        lat ,
        lng,
        zoom
    }
}

async function _createPlaces(){
    var places = utilService.loadFromStorage(PLACES_KEY )
    if(places && places.length) return

    //if no places in storage - generate new places
    places =[
    await _createPlace('Bellas House', 32.1416, 34.831213),
    await _createPlace('Alons House', 32.1417, 34.831217)
    ];

    utilService.saveToStorage(PLACES_KEY,places)

}