"use server"
import Conversationodel from '@/models/conversation'
import { messagestatus } from '@/types/1to1conversations'
import connectDB from '@/database/db_configure'
export default async function Markonetooneconversations(global_id:string,status:messagestatus){
   if(global_id&&status){
      await connectDB()
     const conversation=await Conversationodel.findOne({global_id:global_id})
     if(conversation){
        conversation.status=status
        await conversation.save()
     }
   }
}