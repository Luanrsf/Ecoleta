import React, {useCallback,useState} from "react";
import {useDropzone} from "react-dropzone";
import './styles.css';
import {FiUpload} from "react-icons/fi";

interface Props{
    onFileUploaded:(file:File)=>void;
}
const Dropzone: React.FC<Props> = ({onFileUploaded}) => {
    const[selectFileUrl,setSelectedFileUrl]=useState('')

    const onDrop = useCallback( acceptedFiles => {
        const file = acceptedFiles[0];
        const fileUrl = URL.createObjectURL(file);
        setSelectedFileUrl(fileUrl);
        onFileUploaded(file);

    },[onFileUploaded])
    const {getRootProps, getInputProps,isDragActive} = useDropzone({
        onDrop,
        accept: "image/*"
    })
    return(
        <div className="dropzone" {...getRootProps()}>
        <input {...getInputProps()} accept="image/*"/>
        {
            selectFileUrl
            ? <img src={selectFileUrl} alt="Point Thumbnail"/>
            :
                isDragActive ?
                <p><FiUpload/>Solte aqui...</p>:
                <p><FiUpload/>Arraste ou clique para inserir a imagem de seu marketplace...</p>
    
            
        }
        
        
        </div>
    )

}
export default Dropzone;