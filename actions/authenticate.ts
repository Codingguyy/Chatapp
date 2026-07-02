"use server"
import { userr } from "@/types/user"
import { authenticate } from "@/types/user"
import  Jwt  from "jsonwebtoken"
export default async function Authenticate(userdetails:authenticate){
    if(userdetails){
        const token=Jwt.sign({name:userdetails.name,_id:userdetails._id},"secret",{expiresIn:"7h"})
        return token
    }
    else{
        return ""
    }
}