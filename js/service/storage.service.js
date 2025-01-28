import { utilService } from "./util.service.js"

export const storageService ={
    query,
    getEntityById,
    post,
    remove,
    update
}

async function query(entityType){
    return utilService.loadFromStorage(entityType) || [];
}

//get entity by Id - CRUDL
async function getEntityById(entityId,entityType){
    let entities = await query(entityType);
    const entity = entities.find(entity => entity.id === entityId);
    if(!entity) throw new Error(`Couldnt find place with id ${entityId}`)
    return entity;
}

// create - CRUDL
async function post(newEntity , entityType){
    newEntity = {...newEntity};
    newEntity.id = utilService._makeId();
    let entities = await query(entityType);
    entities.push(newEntity);
    utilService.saveToStorage(entityType,entities);
    return newEntity;
}

//delete - CRUDL
async function remove(entityId,entityType){
    let entities = await query(entityType);
    entities = entities.filter(entity => entityId !== entity.id);
    utilService.saveToStorage(entityType,entities);
}

//update - CRUDL
async function update(entityType , updatedEntity){
    let entities = await query(entityType);
    const idx = entities.findIndex(entity => entity.id === updatedEntity.id)
    if(idx<0) throw new Error (`Update fail, entity with id: ${entity.id} is not found in: ${entityType}`)
    entities.splice(idx,1,updatedEntity);
    utilService.saveToStorage(entityType,entities);
    return updatedEntity;
}