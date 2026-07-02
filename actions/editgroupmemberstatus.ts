"use server"
import Groupconversationodel from '@/models/groupconversation'
import { promote } from "@/types/groupconversations"
import connectDB from '@/database/db_configure'
export default async function Editgroupmemberstatus(value:promote,changeId:string,id:string,groupId:string){
   if(value&&changeId&&id&&groupId){
    await connectDB()
    const groupconversation=await Groupconversationodel.findOne({_id:groupId})
    if(groupconversation){
        if(groupconversation.createdBy===id){
            if(value==="admin"){
                if(!groupconversation.admins.includes(changeId)){
                    groupconversation.admins=groupconversation.admins.push(changeId)
                    return "Success"
                }
                else{
                    return "Success"
                }
            }
            else if(value==="member"){
                if(groupconversation.admins.includes(changeId)){
                    groupconversation.admins=groupconversation.admins.filter((data:string)=>data!==changeId)
                    return "Success"
                }
                else{
                    return "Success"
                }
            }
        }
        else if(groupconversation.createdBy===changeId){
            return "Success"
        }
        else if(groupconversation.admins.includes(id)){
            if(groupconversation.admins.includes(changeId)){
                return "Success"
            }
            else{
                if(value==="admin"){
                    groupconversation.admins=groupconversation.admins.push(changeId)
                    return "Success"
                }
                else if(value==="member"){
                    return "Success"
                }
            }
        }
        else if(!groupconversation.admins.includes(id)){
            return "Success"
        }
    }
    else{
        return "Error"
    }
   }
}