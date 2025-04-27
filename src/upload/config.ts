import { HttpException, HttpStatus } from "@nestjs/common";
import { existsSync, mkdirSync } from "fs";
import { extname } from "path";
import { diskStorage } from "multer";
import { v4 as uuid } from "uuid";

export const multerConfig = {
    dest: "uploads" 
};

/**
 * Generates a unique filename using UUID and the file's original extension.
 *
 * @param file - The file object from the request.
 * @returns A string representing the new filename with a UUID and file extension.
 */
function uuidRandom(file) {
    const result = `${uuid()}${extname(file.originalname)}`;
    return result;
}

export const multerOptions = {
    /**
     * Filters the incoming files based on MIME type.
     * 
     * @param req - The request object.
     * @param file - The file object.
     * @param cb - The callback to accept or reject the file.
     * @throws Returns a BadRequestException if the file type is unsupported.
     */
    fileFilterr(req: any, file: any, cb: any) {
        if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
            cb(null, true);
        } else {
            cb(new HttpException(`Unsupported file type ${extname(file.originalname)}`, HttpStatus.BAD_REQUEST), false);
        }
    },

    /**
     * Configures file storage, handling file saving and naming.
     * 
     * @param req - The request object.
     * @param file - The file object.
     * @param cb - The callback to specify the destination and filename.
     */
    storage: diskStorage({
        /**
         * Configures the directory where files will be stored.
         *
         * @param req - The request object.
         * @param file - The file object.
         * @param cb - The callback to specify the destination directory.
         */
        destination: (req: any, file: any, cb: any) => {
            const uploadPath = multerConfig.dest;
            if (!existsSync(uploadPath)) {
                mkdirSync(uploadPath); 
            }
            cb(null, uploadPath);
        },

        /**
         * Generates a unique filename for each uploaded file.
         *
         * @param req - The request object.
         * @param file - The file object.
         * @param cb - The callback to specify the filename.
         */
        filename: (req: any, file: any, cb: any) => {
            cb(null, uuidRandom(file)); 
        }
    })
};
