const places = [
    "Manglares de Tumbes, Tumbes",
    "Mancora, Piura",
    "Vichayito, Piura",
    "Señor de Sipan, Lambayeque",
    "Chan Chan, Huanchaco",
    "Cordillera Blanca, Ancash",
    "Plaza de Armas, Lima",
    "Paracas, Ica",
    "Huacachina, Ica",
    "Líneas de Nazca, Ica",//9
    "Pampas Galeras, Ayacucho",
    "Arequipa",//11
    "Plaza de Armas, Tacna",
    "Sillustani, Puno",
    "Plaza de Armas, Cusco",
    "Machu Picchu, Cusco",
    "Manu, Madre de Dios",
    "Tambopata, Madre de Dios",//17
    "Pucallpa, Ucayali",
    "Tarapoto, San Martin",
    "Kuelap, Amazonas",
    "Cumbemayo, Cajamarca",
    "Pacaya Samira, Loreto",
    "Iquitos, Loreto"
];
let map = L.map('mapid', {
    center: [-9.189967, -75.015152],
    zoom: 6,
    zoomControl: false,
    minZoom: 6,
    maxZoom: 6
});
let markers = [];
let points = [];
const showMarker = (id) => {
    let checkbox = document.querySelector(`#check${id}`);
    if(checkbox.checked == true)
    {
        if(id == 22 || id == 23)
        {
            alert("La ciudad de Loreto no tiene conexion terrestre")
            checkbox.checked = false
            return
        }
        markers[id].addTo(map).bindPopup(markers[id].options.title).openPopup();
        points.push(markers[id]);
    }
    else
    {
        map.removeLayer(markers[id])
        let index = points.findIndex(e => e==markers[id]);
        points.splice(index, 1)
    }
}
const searchCity = async (place) =>
{
    let response = await fetch("https://nominatim.openstreetmap.org/search?q="+place+" Peru&limit=1&format=json&addressdetails=1")
    let city = await response.json();
    city = city[0];
    return city;
}
const main = async()=>
{ 
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    let checkboxes = document.querySelector("#checkboxes")
    for(let i = 0; i < places.length; i++)
    {
        let info = await searchCity(places[i]);
        markers.push(L.marker([info.lat, info.lon], {
            title: places[i]
        }))
        if(i != 6)
        {
            checkboxes.insertAdjacentHTML("beforeend", `
            <label class="inline-flex items-center mt-3">
                <input type="checkbox" class="form-checkbox h-5 w-5" id="check${i}" onclick="showMarker(${i})"><span class="text-gray-700 text-sm m-2">${places[i]}</span>
            </label>
            `)
        }
        else
        {
            checkboxes.insertAdjacentHTML("beforeend", `
            <label class="inline-flex items-center mt-3">
                <input type="checkbox" class="form-checkbox h-5 w-5" id="check${i}" onclick="showMarker(${i})" checked disabled><span class="text-gray-700 text-sm m-2">${places[i]}</span>
            </label>
            `)
        }
    }
    markers[6].addTo(map).bindPopup(markers[6].options.title).openPopup();
    points.push(markers[6])
    document.getElementById("limpiar").addEventListener("click", () => {
        points.splice(0, points.length)
        points.push(markers[6])
        map.remove();
        map = L.map('mapid', {
            center: [-9.189967, -75.015152],
            zoom: 6,
            zoomControl: false,
            minZoom: 6,
            maxZoom: 6
        });
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        markers[6].addTo(map).bindPopup(markers[6].options.title).openPopup();
        for(let i = 0; i < markers.length; i++)
        {
            let checkbox = document.querySelector(`#check${i}`);
            if(i != 6)
            {
                checkbox.checked = false;
            }
        }
    })
    document.getElementById("ruta").addEventListener("click",async ()=>{
        if(points.length < 6)
        {
            alert("Tienes que elegir minimo 6 ciudades incluyendo lima")
            return
        }
        let string = "";
        for(let i = 0; i < points.length; i++)
        {
            string += points[i].getLatLng().lng.toString() + ","+points[i].getLatLng().lat.toString() +";";
        }
        string = string.slice(0, -1)
        let response = await fetch("https://router.project-osrm.org/trip/v1/driving/"+string+"?steps=false&geometries=geojson");
        let data = await response.json()
        let json = {
            "type": "FeatureCollection",
            "features": [data.trips[0].geometry]
        }
        console.log(json)
        L.geoJSON(json).addTo(map);
    })
}
main()