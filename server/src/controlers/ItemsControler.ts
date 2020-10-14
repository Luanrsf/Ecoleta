import {Request,Response} from "express";
import knex from "./../database/connection";
class ItemsController {
    async index(req:Request,res:Response){
    const items = await knex('items').select('*');
// Declara e recolhe os dados da database ^^
    const serializedItems = items.map(item=>{return {
        id: item.id,
        title:item.title,
        image_url:`http://192.168.0.111:3333/uploads/${item.image}`
    }})
//Filtra os dados da Database ^^
    console.log(serializedItems)
    return res.json(serializedItems)
    }}
export default ItemsController;