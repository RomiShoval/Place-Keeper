import { placeService } from "./service/place.service.js";
import { userService } from "./service/user.service.js";


let gMap;
let gMarkers = [];

window.app = {
    onInit,
    onRemovePlace, 
    initMap,
    onPanToPlace,
    showSection,
    onGetUserLocation,
    renderMarkers,
    onLoadUserPref,
    onSaveUserPref,
    handleAge,
    updateBirthtimeDisplay,
    onDownloadCsv,
    deleteUserOnRefersh,
}

function onInit() {
    //deleteUserOnRefersh()
    console.log("1")
    const userPrefs = userService.loadPref();
    if (userPrefs) {
        userService.applyUserPreferences(userPrefs);
    }

    showSection('home-section')
    handleAge()

    const preferencesForm = document.getElementById('preferences-form');
    //console.log(preferencesForm)
    if (preferencesForm) {
        preferencesForm.addEventListener('submit', onSaveUserPref);
    }
    window.addEventListener('load', onLoadUserPref);
}

function deleteUserOnRefersh(){
    try{
        window.onbeforeunload = function(event) {
            event.preventDefault();
            event.returnValue = ""; 
            setTimeout(() => {
                userService.removeUserWhenRefresh();
            }, 10);
        }
    }
    catch(error){
        console.log("Error during unload:",error)
    }

}

async function onDownloadCsv() {
    const places = await placeService.getPlaces();

    if (!places || !places.length) {
        alert("No places available to download.");
        return;
    }

    const csvContent = generateCsv(places);
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "places.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function generateCsv(places) {
    const header = "Name,Latitude,Longitude,Zoom\n";
    const rows = places.map(place => 
        `${place.name},${place.lat},${place.lng},${place.zoom || ''}`
    ).join("\n");

    return header + rows;
}

function handleAge(){
    const ageRange = document.getElementById('age');
    const ageDisplay = document.getElementById('age-value');

    ageDisplay.textContent = ageRange.value;
    ageRange.addEventListener('input', function() {
        ageDisplay.textContent = ageRange.value;
    });
}

function updateBirthtimeDisplay(birthDate, birthTime) {
    const birthtimeDisplay = document.getElementById('birthtime-display');
    if (birthDate && birthTime) {
        birthtimeDisplay.textContent = `${birthDate} at ${birthTime}`;
    } else {
        birthtimeDisplay.textContent = 'Not set';
    }
}


function onSaveUserPref(event){
    event.preventDefault();
    const user = {
        email: document.getElementById('email').value,
        txtColor: document.getElementById('txtColor').value,
        bgColor: document.getElementById('bgColor').value,
        age: document.getElementById('age').value,
        birthDate: document.getElementById('birthDate').value,
        birthTime: document.getElementById('birthTime').value,
        gender: document.getElementById('gender').value,
    };
   
    userService.savePref(user)
    userService.applyUserPreferences(user)
    updateBirthtimeDisplay(user.birthDate, user.birthTime)
    //console.log("here")
    if(!userService.validateAgeMatch(user.birthDate,user.age)){
        alert('Age does not match the provided birth year.');
        return;
    }
    alert('Preferences saved!')
}
    

function onLoadUserPref(){
    const userPref = userService.loadPref()
    if (userPref) {
        userService.applyUserPreferences(userPref)
        updateBirthtimeDisplay(userPref.birthDate, userPref.birthTime)
    }
    else{
        const defaultUser = {
            email: '',
            txtColor: '#000000', 
            bgColor: '#ffffff'  
        };
        userService.applyUserPreferences(defaultUser);
        // document.getElementById('birthDate').value = defaultUser.birthDate;
        // document.getElementById('birthTime').value = defaultUser.birthTime;
        updateBirthtimeDisplay(defaultUser.birthDate, defaultUser.birthTime);
    }
    
}


async function initMap(){
    //console.log("Initializing map...")
    const coordsEilat={lat: 29.5581, lng: 34.9482}
    gMap = await new google.maps.Map(document.getElementById("map"), {
        center: coordsEilat,
        zoom: 10,
    });

    gMap.addListener('click', async ev =>{
        const name = prompt("Place name?","place 1")
        if (!name) return;

        const lat = ev.latLng.lat();
        const lng = ev.latLng.lng();
        await placeService.addPlace(name,lat,lng,gMap.getZoom());
        renderPlaces();
        renderMarkers();
    })
    //console.log("Map initialized:", gMap);
    renderMarkers();
}

async function renderMarkers() { 
    if (!gMap) return;
    const places = await placeService.getPlaces() 
    // remove previous markers 
    gMarkers.forEach(marker => marker.setMap(null)) 
    // every place is creating a marker 
    gMarkers = places.map(place => { 
        return new google.maps.Marker({ 
            position: place, 
            map: gMap, 
            title: place.name }) 
        }) 
}


async function onPanToPlace(placeId) {
    const place = await placeService.getPlaceById(placeId);
    if (!place) return;

    gMap.setCenter({ lat: place.lat, lng: place.lng });
    gMap.setZoom(place.zoom);
}

async function renderPlaces() {
    const places = await placeService.getPlaces();
    const placesList = document.getElementById("places-list")
    placesList.innerHTML = places.map(place => 
        `<li>
        <span>${place.name}</span>
        <button onclick="app.onPanToPlace('${place.id}')">Go</button>
        <button onclick="app.onRemovePlace('${place.id}')">Remove</button>
      </li>`).join("");
}


async function onRemovePlace(placeId) {
    await placeService.removePlace(placeId)
    renderPlaces() 
    renderMarkers()
}

function showSection(sectionId){

    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });

    const sectionToShow = document.getElementById(sectionId);
    if (sectionToShow) {
        sectionToShow.style.display = 'block';
    }

    if(sectionId === 'map-section'){
        renderPlaces();
        if (!gMap) {
            // Initialize the map only if it hasn't been initialized yet
            initMap();
        } else {
            // Update the markers 
            renderMarkers(); 
        }
    }
}

async function onGetUserLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userCoords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };

            gMap.setCenter(userCoords);
            gMap.setZoom(14);

            alert(`You are here: Lat: ${userCoords.lat}, Lng: ${userCoords.lng}`);
        },
        (error) => {
            console.error("Error getting location:", error);
            alert("Unable to fetch location.");
        }
    );
}

