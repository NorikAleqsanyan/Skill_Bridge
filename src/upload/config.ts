import { HttpException, HttpStatus } from "@nestjs/common"
import { existsSync, mkdirSync } from "fs";
import { extname } from "path"
import { diskStorage } from "multer"
import {v4 as uuid} from "uuid"

export const multerConfig={
    dest:"uploads"
} 

function uuidRandom(file){
    const resul = `${uuid()}${extname(file.originalname)}`;
    return resul
}

export const multerOptions = {
    fileFilterr(req:any,file:any,cb:any){
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
            cb(null,true)
        } else{
            cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST),false);

        }
    },
    storage:diskStorage({
        destination:(req:any,file:any,cb:any) => {
            const uploadPath = multerConfig.dest
            if(!existsSync(uploadPath)){
                mkdirSync(uploadPath);
            }
            cb(null,uploadPath)
        },
        filename:(req:any,file:any,cb:any) => {
            cb(null,uuidRandom(file))
        }
    })
}