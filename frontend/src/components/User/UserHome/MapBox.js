// import React, { useRef, useEffect, useState } from 'react';
// import mapboxgl from 'mapbox-gl';

// mapboxgl.accessToken = 'pk.eyJ1IjoibmFhdXNlcm5hbWUiLCJhIjoiY2xucXcwY2k4MGw0eDJqbXdoOHI2NGVmdiJ9.IYNH8EDXyXv02EtbOhiOEA';

// export default function MapBox() {
//   const mapContainer = useRef(null);
//   const map = useRef(null);
//   const [lng, setLng] = useState(-97.1526);
//   const [lat, setLat] = useState(33.2075);
//   const [zoom, setZoom] = useState(15);
//   const userMarker = useRef(null);
//   const restroomMarkers = useRef({});

//   // Dummy restroom data
//   const dummyRestroomData = [
//     {
//       name: 'Restroom 1',
//       coordinates: [-97.1526, 33.2075],
//     },
//     {
//       name: 'Restroom 2',
//       coordinates: [-97.1510, 33.2080],
//     },
//     {
//       name: 'Restroom 3',
//       coordinates: [-97.1535, 33.2060],
//     },
//     // Add more restroom data here
//   ];

//   useEffect(() => {
//     if (map.current) return;

//     map.current = new mapboxgl.Map({
//       container: mapContainer.current,
//       style: 'mapbox://styles/mapbox/streets-v12',
//       center: [lng, lat],
//       zoom: zoom,
//     });

//     map.current.on('move', () => {
//       setLng(map.current.getCenter().lng.toFixed(4));
//       setLat(map.current.getCenter().lat.toFixed(4));
//       setZoom(map.current.getZoom().toFixed(2));
//     });
//   });

//   dummyRestroomData.forEach((restroom, index) => {
//     const { name, coordinates } = restroom;
//     const marker = new mapboxgl.Marker()
//       .setLngLat(coordinates)
//       .setPopup(new mapboxgl.Popup().setHTML(`<h3>${name}</h3>`))
//       .addTo(map.current);

//     restroomMarkers.current[index] = marker;
//   });
// }, [lng, lat]);

// const zoomIn = () => {
//   const currentZoom = map.current.getZoom();
//   if (currentZoom < 20) {
//     map.current.zoomTo(currentZoom + 1);
//   }
// };

// const zoomOut = () => {
//   const currentZoom = map.current.getZoom();
//   if (currentZoom > 1) {
//     map.current.zoomTo(currentZoom - 1);
//   }
// };

// const showUserLocation = () => {
//   navigator.geolocation.getCurrentPosition((position) => {
//     const { latitude, longitude } = position.coords;
//     map.current.flyTo({ center: [longitude, latitude], zoom: 14 });

//     if (!userMarker.current) {
//       userMarker.current = new mapboxgl.Marker({ color: 'blue' })
//         .setLngLat([longitude, latitude])
//         .addTo(map.current);
//     } else {
//       userMarker.current.setLngLat([longitude, latitude]);
//     }
//   });
// };

// const resetMap = () => {
//   map.current.flyTo({ center: [-97.1526, 33.2075], zoom: 15 });

//   if (userMarker.current) {
//     userMarker.current.remove();
//   }
// };

// return (
//   <div>
//     <div className="sidebar">
//       Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
//     </div>
//     <div ref={mapContainer} className="map-container" />
//     <div className="map-controls">
//       <button onClick={zoomIn}>+</button>
//       <button onClick={zoomOut}>-</button>
//       <button onClick={showUserLocation}>📍</button>
//       <button onClick={resetMap}>Reset</button>
//     </div>
//   </div>
// );
// }
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { collection, addDoc , getDocs , doc, deleteDoc ,updateDoc} from "firebase/firestore";
import {db} from "../../../firebase";
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import TuneIcon from '@mui/icons-material/Tune';

mapboxgl.accessToken = 'pk.eyJ1IjoibmFhdXNlcm5hbWUiLCJhIjoiY2xucXcwY2k4MGw0eDJqbXdoOHI2NGVmdiJ9.IYNH8EDXyXv02EtbOhiOEA';

export default function MapBox() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-97.1526);
  const [lat, setLat] = useState(33.2075);
  const [zoom, setZoom] = useState(15);
  const userMarker = useRef(null);
  const restroomMarkers = useRef({});
  const directionsRef = useRef(null);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const [formDatas, setFormDatas] = useState([]);
  const [recordsVisible, setRecordsVisible] = useState(false);

  const fetchPost = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "pins"));
      const newData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setFormDatas(newData);
      console.log(newData);
      console.log(formDatas);
      newData.forEach((restroom, index) => {
        const { name, coordinates, image, available } = restroom;
        const marker = new mapboxgl.Marker()
          .setLngLat(coordinates)
          .setPopup(new mapboxgl.Popup().setHTML(`<style>
          .mapboxgl-popup {
            max-width: 160px;
            max-height: 160px;
          }
          
          /* Style for the image carousel container */
          .image-carousel {
            display: flex;
            overflow: hidden;
          }
          
          /* Style for individual carousel slides (images) */
          .carousel-slide img{
            height:100px;
            width:100px;
          }
          </style><h3>${name}</h3><div class="image-carousel">
          <div class="carousel-slide">
          <a href="${image}" style="text-decoration:none;">
            <img src="${image}" alt="Image 1">
            </a>
            </div>
        </div><p>${available}</p>`))
          .addTo(map.current);
      
        marker.getElement().addEventListener('click', () => {
          setSelectedRestroom(restroom);
        });
      
        restroomMarkers.current[index] = marker;
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }
useEffect(()=>{
  fetchPost();
}, [])

  // Dummy restroom data
  const dummyRestroomData = [
    {
      name: 'Restroom 1',
      coordinates: [-97.1526, 33.2075],
      descriptionMon: ' Monday :- Open 5:00 am , Closes 11:00pm',
      descriptionTue: ' TuesDay :- Open 5:00 am , Closes 11:00pm',
      descriptionWed: ' WednesDay :- Open 5:00 am , Closes 11:00pm',
      descriptionThu: ' ThursDay :- Open 5:00 am , Closes 11:00pm',
      descriptionFri: ' Friday :- Open 5:00 am , Closes 11:00pm',
      descriptionSat: ' Saturday :- Open 5:00 am , Closes 11:00pm',
      descriptionSun: ' Sunday :- Open 5:00 am , Closes 11:00pm',
    },
    {
      name: 'Restroom 2',
      coordinates: [-97.1510, 33.2080],
      descriptionMon: ' Monday :- Open 5:00 am , Closes 11:00pm',
      descriptionTue: ' TuesDay :- Open 5:00 am , Closes 11:00pm',
      descriptionWed: ' WednesDay :- Open 5:00 am , Closes 11:00pm',
      descriptionThu: ' ThursDay :- Open 5:00 am , Closes 11:00pm',
      descriptionFri: ' Friday :- Open 5:00 am , Closes 11:00pm',
      descriptionSat: ' Saturday :- Open 5:00 am , Closes 11:00pm',
      descriptionSun: ' Sunday :- Open 5:00 am , Closes 11:00pm',
    },
    {
      name: 'Restroom 3',
      coordinates: [-97.1535, 33.2060],
      descriptionMon: ' Monday :- Open 5:00 am , Closes 11:00pm',
      descriptionTue: ' TuesDay :- Open 5:00 am , Closes 11:00pm',
      descriptionWed: ' WednesDay :- Open 5:00 am , Closes 11:00pm',
      descriptionThu: ' ThursDay :- Open 5:00 am , Closes 11:00pm',
      descriptionFri: ' Friday :- Open 5:00 am , Closes 11:00pm',
      descriptionSat: ' Saturday :- Open 5:00 am , Closes 11:00pm',
      descriptionSun: ' Sunday :- Open 5:00 am , Closes 11:00pm',
    },
    {
      name: 'Restroom 4',
      coordinates: [-97.1520, 33.2072],
      descriptionMon: 'Monday: Open 6:00 am, Closes 10:00 pm',
      descriptionTue: 'Tuesday: Open 6:00 am, Closes 10:00 pm',
      descriptionWed: 'Wednesday: Open 6:00 am, Closes 10:00 pm',
      descriptionThu: 'Thursday: Open 6:00 am, Closes 10:00 pm',
      descriptionFri: 'Friday: Open 6:00 am, Closes 10:00 pm',
      descriptionSat: 'Saturday: Open 6:00 am, Closes 10:00 pm',
      descriptionSun: 'Sunday: Open 6:00 am, Closes 10:00 pm',
    },
    {
      name: 'Restroom 5',
      coordinates: [-97.1515, 33.2078],
      descriptionMon: 'Monday: Open 5:30 am, Closes 9:30 pm',
      descriptionTue: 'Tuesday: Open 5:30 am, Closes 9:30 pm',
      descriptionWed: 'Wednesday: Open 5:30 am, Closes 9:30 pm',
      descriptionThu: 'Thursday: Open 5:30 am, Closes 9:30 pm',
      descriptionFri: 'Friday: Open 5:30 am, Closes 9:30 pm',
      descriptionSat: 'Saturday: Open 5:30 am, Closes 9:30 pm',
      descriptionSun: 'Sunday: Open 5:30 am, Closes 9:30 pm',
    },
    {
      name: 'Restroom 6',
      coordinates: [-97.1529, 33.2062],
      descriptionMon: 'Monday: Open 5:45 am, Closes 9:15 pm',
      descriptionTue: 'Tuesday: Open 5:45 am, Closes 9:15 pm',
      descriptionWed: 'Wednesday: Open 5:45 am, Closes 9:15 pm',
      descriptionThu: 'Thursday: Open 5:45 am, Closes 9:15 pm',
      descriptionFri: 'Friday: Open 5:45 am, Closes 9:15 pm',
      descriptionSat: 'Saturday: Open 5:45 am, Closes 9:15 pm',
      descriptionSun: 'Sunday: Open 5:45 am, Closes 9:15 pm',
    },
    {
      name: 'Restroom 7',
      coordinates: [-97.1513, 33.2070],
      descriptionMon: 'Monday: Open 6:15 am, Closes 9:45 pm',
      descriptionTue: 'Tuesday: Open 6:15 am, Closes 9:45 pm',
      descriptionWed: 'Wednesday: Open 6:15 am, Closes 9:45 pm',
      descriptionThu: 'Thursday: Open 6:15 am, Closes 9:45 pm',
      descriptionFri: 'Friday: Open 6:15 am, Closes 9:45 pm',
      descriptionSat: 'Saturday: Open 6:15 am, Closes 9:45 pm',
      descriptionSun: 'Sunday: Open 6:15 am, Closes 9:45 pm',
    },
    {
      name: 'Restroom 8',
      coordinates: [-97.1532, 33.2078],
      descriptionMon: 'Monday: Open 5:00 am, Closes 11:30 pm',
      descriptionTue: 'Tuesday: Open 5:00 am, Closes 11:30 pm',
      descriptionWed: 'Wednesday: Open 5:00 am, Closes 11:30 pm',
      descriptionThu: 'Thursday: Open 5:00 am, Closes 11:30 pm',
      descriptionFri: 'Friday: Open 5:00 am, Closes 11:30 pm',
      descriptionSat: 'Saturday: Open 5:00 am, Closes 11:30 pm',
      descriptionSun: 'Sunday: Open 5:00 am, Closes 11:30 pm',
    },
    {
      name: 'Restroom 9',
      coordinates: [-97.1537, 33.2080],
      descriptionMon: 'Monday: Open 6:00 am, Closes 11:00 pm',
      descriptionTue: 'Tuesday: Open 6:00 am, Closes 11:00 pm',
      descriptionWed: 'Wednesday: Open 6:00 am, Closes 11:00 pm',
      descriptionThu: 'Thursday: Open 6:00 am, Closes 11:00 pm',
      descriptionFri: 'Friday: Open 6:00 am, Closes 11:00 pm',
      descriptionSat: 'Saturday: Open 6:00 am, Closes 11:00 pm',
      descriptionSun: 'Sunday: Open 6:00 am, Closes 11:00 pm',
    },
    {
      name: 'Restroom 10',
      coordinates: [-97.1534, 33.2068],
      descriptionMon: 'Monday: Open 5:30 am, Closes 10:30 pm',
      descriptionTue: 'Tuesday: Open 5:30 am, Closes 10:30 pm',
      descriptionWed: 'Wednesday: Open 5:30 am, Closes 10:30 pm',
      descriptionThu: 'Thursday: Open 5:30 am, Closes 10:30 pm',
      descriptionFri: 'Friday: Open 5:30 am, Closes 10:30 pm',
      descriptionSat: 'Saturday: Open 5:30 am, Closes 10:30 pm',
      descriptionSun: 'Sunday: Open 5:30 am, Closes 10:30 pm',
    },
    {
      name: 'Restroom 11',
      coordinates: [-97.1527, 33.2073],
      descriptionMon: 'Monday: Open 6:00 am, Closes 11:00 pm',
      descriptionTue: 'Tuesday: Open 6:00 am, Closes 11:00 pm',
      descriptionWed: 'Wednesday: Open 6:00 am, Closes 11:00 pm',
      descriptionThu: 'Thursday: Open 6:00 am, Closes 11:00 pm',
      descriptionFri: 'Friday: Open 6:00 am, Closes 11:00 pm',
      descriptionSat: 'Saturday: Open 6:00 am, Closes 11:00 pm',
      descriptionSun: 'Sunday: Open 6:00 am, Closes 11:00 pm',
    },  
    // Add more restroom data here
  ];

  const [selectedRestroom, setSelectedRestroom] = useState(null);
  

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });


    directionsRef.current = new MapboxDirections({
      accessToken: 'pk.eyJ1IjoibmFhdXNlcm5hbWUiLCJhIjoiY2xucXcwY2k4MGw0eDJqbXdoOHI2NGVmdiJ9.IYNH8EDXyXv02EtbOhiOEA',
    });
  
    map.current.addControl(directionsRef.current, 'top-left');
  
    directionsRef.current.on('route', (event) => {
      const route = event.route[0];
      const distance = (route.distance / 1609.344).toFixed(2); // Convert meters to miles
      const duration = (route.duration / 60).toFixed(2); // Convert seconds to minutes
      alert(`Distance: ${distance} miles, Duration: ${duration} minutes`);
    });
  



    // Add restroom markers
    // console.log(newData)
    // formDatas.forEach((restroom, index) => {
    //   const { name, coordinates, description } = restroom;
    //   const marker = new mapboxgl.Marker()
    //     .setLngLat(coordinates)
    //     .setPopup(new mapboxgl.Popup().setHTML(`<h3>${name}</h3><p>🟢 Available</p>`))
    //     .addTo(map.current);
    
    //   marker.getElement().addEventListener('click', () => {
    //     setSelectedRestroom(restroom);
    //   });
    
    //   restroomMarkers.current[index] = marker;
    // });
  }, [lng, lat]);



  

  const zoomIn = () => {
    const currentZoom = map.current.getZoom();
    if (currentZoom < 20) {
      map.current.zoomTo(currentZoom + 1);
    }
  };

  const zoomOut = () => {
    const currentZoom = map.current.getZoom();
    if (currentZoom > 1) {
      map.current.zoomTo(currentZoom - 1);
    }
  };

  const fiterMethod = () => {
    
  }

  const showUserLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      map.current.flyTo({ center: [longitude, latitude], zoom: 14 });

      if (!userMarker.current) {
        userMarker.current = new mapboxgl.Marker({ color: 'blue' })
          .setLngLat([longitude, latitude])
          .addTo(map.current);
      } else {
        userMarker.current.setLngLat([longitude, latitude]);
      }
    });
  };

  const resetMap = () => {
    map.current.flyTo({ center: [-97.1526, 33.2075], zoom: 15 });

    if (userMarker.current) {
      userMarker.current.remove();
    }
  };

  const calculateRoute = () => {
    // Calculate a walking route from the default location to the selected location
    directionsRef.current.setOrigin([-97.1526, 33.2075]);
    directionsRef.current.setDestination([selectedRestroom.coordinates[0], selectedRestroom.coordinates[1]]);
  };

  const handleSearchLocation = () => {
    // Use the Mapbox Geocoding API to search for the entered location
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${searchLocation}.json?access_token=${mapboxgl.accessToken}`)
      .then((response) => response.json())
      .then((data) => {
        // Extract search results from the API response
        const results = data.features;

        // Update the search results state
        setSearchResults(results);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };



  return (
    <div>
      
      {/* <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div> */}
      
      <div ref={mapContainer} className="map-container" />
      
      <div className="map-controls">
      
        <button onClick={zoomIn}><ZoomInIcon /></button>
        <button onClick={zoomOut}><ZoomOutIcon /></button>
        <button onClick={showUserLocation}><MyLocationIcon /></button>
        <button onClick={resetMap}><RestartAltIcon /></button>
        <button onClick={fiterMethod}><TuneIcon /></button>
      </div>
      {selectedRestroom && (
        <div className="map-control" style={{marginTop:'45px'}}>
          <h3>{selectedRestroom.name}</h3>
          <p>Rating : {selectedRestroom.rating} 🌟 / 5</p>
          <p>Availablity : {selectedRestroom.available}</p>
          <p>Baby Changing Station : {selectedRestroom.babyChangingStation}</p>
          <p>Handicap Availablity : {selectedRestroom.handicap}</p>
          <p>{selectedRestroom.descriptionMon}</p>
          <p>{selectedRestroom.descriptionTue}</p>
          <p>{selectedRestroom.descriptionWed}</p>
          <p>{selectedRestroom.descriptionThu}</p>
          <p>{selectedRestroom.descriptionFri}</p>
          <p>{selectedRestroom.descriptionSat}</p>
          <p>{selectedRestroom.descriptionSun}</p>
          
        </div>
      )}

    </div>
  );
}
