import { v2 as cloudinary } from "cloudinary";
import { v4 as uuid } from "uuid";


const getBase64 = (file) => {
    return `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
};

const uploadFilesToCloud = async(files=[])=>{
    const uploadPromises = files.map((file)=>{
        return new Promise((resolve, reject)=>{
            cloudinary.uploader.upload(getBase64(file),
                {
                    resource_type: "auto",
                    public_id: uuid(),
                },
                (err, result)=>{
                    if(err) return reject(err);
                    return resolve(result);
                }
            )
        })
    })
    

    try {
        const results = await Promise.all(uploadPromises);
        const formatedResults = results.map((result)=>{
            return {
                public_id: result.public_id,
                url: result.secure_url,
            }
        });
        return formatedResults;
    } catch (error) {
        throw new Error("Error uploading files to cloudinary", error);
    }

}

