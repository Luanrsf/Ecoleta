import {Request, Response, json} from "express"
import knex from "../database/connection";


class PointsController{
    async index(request:Request,response:Response){
        const {city,uf,items} = request.query;

        const parsedItems = String(items).split(',')
        .map(item=>Number(item.trim()));
        
        const points = await knex('points').join('point_items','points.id','=','point_items.point_id')
        .whereIn('point_items.item_id',parsedItems)
        .where('city',String(city))
        .where('uf', String(uf))
        .distinct()
        .select('points.*')
        const serializedPoints = points.map(point=>{
            return {
           ...point,
            image_url:`http://192.168.0.111:3333/uploads/${point.image}`
        };
    })

        


        return response.json(serializedPoints);
    }

    async show(request:Request,response:Response){
        const {id} = request.params;
        const point = await knex('points').where('id',id).first();
        if(!point){
            return response.status(400).json({message:"point not found"});
        }
        const serializedPoint ={
           ...point,
            image_url:`http://192.168.0.111:3333/uploads/${point.image}`
        };
            const items = await knex('items')
            .join('point_items','items.id','=','point_items.item_id')
            .where('point_items.point_id', id).select('items.title')

            return response.json({point:serializedPoint,items});
        

    }
    async create(request:Request,response:Response){
        const{
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
        } = request.body;
//Recolhe dados do body^^

const trx = await knex.transaction();
//Esse 'trx' garante que se falhar uma query, nenhuma vai executar
const point = {
    image:request.file.filename,
    name,
    email,
    whatsapp,
    latitude,
    longitude,
    city,
    uf
}
     const insertedIds = await trx('points').insert(point);
//Posta os dados recolhidos DENTRO database ^^
    
        const point_id = insertedIds[0];
//Ainda nao entendi mas isso retorna o id do point postado^^
        const pointItems = items
        .split(",")
        .map((item:string)=>Number(item.trim()))
        .map((item_id : number) => {
            return{
                item_id,
                point_id};
    })
//Retorna os ids do ponto e do item ^^
try {
    await trx('point_items').insert(pointItems)

    await trx.commit();
  } catch (error) {
    await trx.rollback();
//COMIT É PAR INSERTAR E ROLLBACK É PRA CASO FALHE

    return response.status(400).json({ message: 'Falha na inserção na tabela point_items, verifique se os items informados são válidos' })
  }

  return response.json({ id: point_id, ...point, })
    
    }
}
export default PointsController;