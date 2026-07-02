"use server"
import Conversationodel from '@/models/conversation'
import connectDB from '@/database/db_configure'
export default async function Getonetoonefirstconversations(id:string){
    if(id){
        await connectDB()
        const conversations=await Conversationodel.find({chatId:id}).sort({_id:-1}).limit(20)
        console.log(conversations)
        return conversations
    }
}