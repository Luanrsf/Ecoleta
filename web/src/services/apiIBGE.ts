import axios from "axios";
interface IBGECity{
  id:number,
  nome:string;
  municipio:void;

}
interface IGetCities{
  getCitiesByUf(uf:string):Promise<string[]>;
}

export default class ApiIBGE implements IGetCities{

  constructor(
  ){}

getCitiesByUf(uf:string){
   const IBGE = axios.get(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/distritos`).then(res=>{
      const cityRaw = res.data;
      const cityFiltered = new Array;
      cityRaw.forEach((city:IBGECity) => {
        delete city.municipio;
        cityFiltered.push(city.nome);
        
      });
      
      
        return cityFiltered;
    })
    return IBGE;
  }
 
  
}
