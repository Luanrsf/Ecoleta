import React, {useEffect,useState,ChangeEvent, FormEvent} from 'react';
import {Link,useHistory} from "react-router-dom";
import "./styles.css";
import {FiArrowLeft, FiFilter} from "react-icons/fi"
import logo from "../../assets/logo.svg";
import {Map,TileLayer,Marker} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import api from "../../services/api";
import axios from "axios";
import {LeafletMouseEvent} from 'leaflet';
import Dropzone from "../../components/dropzone/index";
import { fileURLToPath } from 'url';
import apiIBGE from "../../services/apiIBGE"

interface Item{
    id:number;
    title:string;
    image_url:string;
}
interface IBGEUFResponse{
    sigla:string;
}
interface IBGECityResponse{
    id:number;
    nome:string;
}
interface IBGERealCity{
    municipio:IBGECityResponse
}
 
const IBGE = new apiIBGE ;
const CreatePoint = () =>{
    const [items,setItems] = useState<Item[]>([]);
    const [ufs, setUfs]=useState<string[]>([]);
    const [selectedUf,setSelectedUf] = useState("0");
    const [selectedCity,setSelectedCity] = useState("0");
    const[cities,setCities] = useState<string[]>([]);
    const [selectedPosition, setSelectedPosition]=useState<[number,number]>([0,0]);
    const [initialPosition, setInitialPosition]=useState<[number,number]>([0,0]);
    const [formData,setFormData]=useState({
        name:'',
        email:'',
        whatsapp:'',
});
    const [selectedItems, setSelectedItems]=useState<number[]>([]);
    const [selecetedFile,setSelectedFile]=useState<File>();
    const [IBGECollector,setIBGECollector] = useState<string[]>([]);


    const history = useHistory();


    useEffect(()=>{
        api.get('items').then(response =>{
            setItems(response.data);

        })
    },[]);
    useEffect(()=>{
        axios.get<IBGEUFResponse[]>("https://servicodados.ibge.gov.br/api/v1/localidades/estados")
        .then(response=>{
            const ufInitials = response.data.map(uf=>uf.sigla)
            setUfs(ufInitials);
        });
        
    },[]);
    async function handleCities(uf:string){               
        await IBGE.getCitiesByUf(uf).then(res=>{

            setCities(res)
        })
        
        }
    useEffect(()=>{
        if(selectedUf==="0"){return;}
        handleCities(selectedUf);

            
    },[selectedUf]);
    useEffect(()=>{
        navigator.geolocation.getCurrentPosition(position => {
            const {latitude,longitude} = position.coords;
            setInitialPosition([latitude,longitude]);
            
         })
    },[]);
    function handleSelectUf(event:ChangeEvent<HTMLSelectElement>){
       const uf = event.target.value;

       setSelectedUf(uf);
        
    };
    function handleSelectCity(event:ChangeEvent<HTMLSelectElement>){
        const city = event.target.value;
 
        setSelectedCity(city);
         
     };
     function handleMapClick(event:LeafletMouseEvent){
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng,])

     }
     function handleInputChange(event:ChangeEvent<HTMLInputElement>){
        const {name,value} = event.target;
        setFormData({...formData, [name]:value})

     }
     function handleSelectedItem(id:number){
         const alreadySelected = selectedItems.findIndex(item=>item===id);
         if(alreadySelected>=0){
            const filteredItems = selectedItems.filter(item=>item!==id);
            setSelectedItems(filteredItems);
         }
         else{
        setSelectedItems([...selectedItems, id]);
         }

     };
     
     async function handleSubmit(event:FormEvent){
        event.preventDefault();

        const {name,email,whatsapp} = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude,longitude] = selectedPosition;
        const items = selectedItems;
        const data =new FormData();


     
        data.append('name',name);
        data.append('email',email);
        data.append('whatsapp',whatsapp);
        data.append('uf',uf);
        data.append('city',city);
        data.append('latitude',String(latitude));
        data.append('longitude',String(longitude));
        data.append('items',items.join(','));
        if(selecetedFile){
            data.append('image', selecetedFile)
        }

        await api.post('points',data);
        alert('Ponto de Coleta Enviado');
        history.push('/')
     }
    
    return(
        <div id="page-create-point">
            <header>
                <img src={logo} alt="ecoleta"></img>
                <Link to="/">
                <FiArrowLeft/>
                    Voltar para home</Link>
                </header>
                <form onSubmit={handleSubmit}>
                    <h1>Cadastro do <br/>ponto de coleta</h1>
                    
                    
                    <Dropzone onFileUploaded={setSelectedFile} />


                    <fieldset>
                        <legend><h2>Dados</h2></legend>
                        <div className="field">
                            <label htmlFor="name">Nome da entidade</label>
                            <input 
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                            />
                        </div>
                        <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input 
                            type="text"
                            name="email"
                            id="email"
                            onChange={handleInputChange}
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input 
                            type="text"
                            name="whatsapp"
                            id="whatsapp"
                            onChange={handleInputChange}
                            />
                        </div>
                        </div>
                    </fieldset>



                    <fieldset>
                        <legend>
                            <h2>Endereço</h2>
                            <span>Selecione o endereço no mapa</span>
                        </legend>

                    <Map center={initialPosition} zoom={15} onclick={handleMapClick} id="map">
                    <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                 />
                            <Marker position={selectedPosition}/>
                        </Map>

                        <div className="field-group">
                            <div className="field">
                                <label htmlFor="uf">Estado (UF)</label>
                                <select onChange={handleSelectUf} value={selectedUf} name="uf" id="uf">
                                    <option value="0">Selecione uma UF</option>
                                    {ufs.map(uf=>(
                                        <option key={uf} value={uf}>{uf}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="field">
                                <label htmlFor="city">Cidade</label>
                                <select name="city" id="city" value={selectedCity} onChange={handleSelectCity}>
                                    <option value="0">Selecione uma cidade</option>
                                    {cities.map(city=>(
                                        
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </fieldset>
                    
                    


                    <fieldset>
                        <legend>
                            <h2>Ítems de coleta</h2>
                            </legend>
                    <ul className="items-grid">
                        {items.map(item =>( 
                        <li 
                        key={item.id} 
                        onClick={()=>{handleSelectedItem(item.id)}}
                        className={selectedItems.includes(item.id)?'selected':''}
                        >
                            <img src= {item.image_url} alt="Discarte de bateria ícone"></img>
                            <span>{item.title}</span>
                        </li>))}
                    </ul>
                    </fieldset>
                    <button type="submit">Cadastrar ponto de coleta</button>
                </form>
        </div>
    )
}
export default CreatePoint;