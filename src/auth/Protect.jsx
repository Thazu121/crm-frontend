import React from 'react'
import { Navigate,replace } from 'react-router-dom';

const protect=({children})=> {
    const token=localStorage.getItem("token")
    console.log("got it token");
    if(!token){
        return <navigate to={'login'} replace:true/>
    }
    
  return children
}

export default protect