"use server"
import Conversationodel from '@/models/conversation'
import connectDB from '@/database/db_configure'
export default async function Editonetooneconversationmessage(global_id:string,message:string){
   const conversation=await Conversationodel.findOne({global_id:global_id})
   if(conversation){
      await connectDB()
    conversation.message=message
    await conversation.save()
   }
   
}