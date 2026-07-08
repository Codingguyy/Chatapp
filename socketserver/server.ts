import { user, userlistt } from '../types/user'
import {WebSocketServer} from 'ws'
import jsonwebtoken from 'jsonwebtoken'
import { MySocket } from '../types/wd'
import { usersocket } from '../types/user'
import { messagetypee, oneto1conversation, status } from '@/types/1to1conversations'
import { conversations } from '@/types/1to1conversations'
import { userst } from '../types/user'
import { onetoonerequest } from '@/types/request'
import { onetooneconversationdetails } from '@/types/1to1conversations'
import { usrlist } from '../types/user'
import { message } from '@/types/1to1conversations'
import { messagetype } from '@/types/1to1conversations'
import { messagestatus } from '@/types/1to1conversations'
import { messageattachment } from '@/types/1to1conversations'
import { requesttype } from '../types/user'
import {onetooneconversationtyping} from '@/types/user'
import { usrlistt } from '../types/user'
import { groupconversation, groupconversations as groupcnvrsations, promote, RequestType, groupsettings, grpconversations } from '@/types/groupconversations'
import { groupconversations as groupconversationsmessages } from '@/types/groupconversations'
import { groupcode } from '@/types/groupconversations'
import { grouprequest } from '@/types/groupconversations'
import { groupsexistlist } from '@/types/groupconversations'
import { grpstatustype } from '@/types/groupconversations'
import { grouptyping } from '@/types/groupconversations'
import { grouponlinetyping } from '@/types/groupconversations'
import Createonetooneconversationrequest from '@/actions/createonetooneconversationrequest'
import Markonetooneconversationrequest from '@/actions/markonetooneconversationrequest'
import Getconversationsafteronetooneconversations from '@/actions/getconversationsafteronetooneconversations'
import Getonetoonefirstconversations from '@/actions/getonetoonefirstconversations'
import Getusrs from '@/actions/getusrs'
import Createonetooneconversations from '@/actions/createonetooneconversation'
import Getspecificonetooneconversation from '@/actions/getspecificonetooneconversation'
import Createonetooneconversationroom from '@/actions/createonetooneconversationroom'
import Markonetooneconversations from '@/actions/markonetooneconversations'
import Getpendingmessages from '@/actions/getpendingmessages'
import Createonetooneconversationwithreplyto from '@/actions/createonetooneconversationewithreplyto'
import Editonetooneconversationmessage from '@/actions/editonetooneconversationmessage'
import Creategroup from '@/actions/creategroup'
import Getcreategroup from '@/actions/getcreategroup'
import Creategroupconversation from '@/actions/creategroupconversations'
import Getgroupconversations from '@/actions/getgroupconversations'
import Getgroupfirstconversations from '@/actions/getgroupfirstconversations'
import Getgroupafterconversations from '@/actions/getgroupafterconversations'
import Creategroupreplyconversations from '@/actions/creategroupreplyconversations'
import Markgroupconversationstatus from '@/actions/markgroupconversationstatus'
import Creategroupmessageedit from '@/actions/creategroupmessageedit'
import Creategrouprequest from '@/actions/creategrouprequest'
import Markgrouprequeststatus from '@/actions/markgrouprequeststatus'
import Editgroupmemberstatus from '@/actions/editgroupmemberstatus'
import Markgroupblockmember from '@/actions/markgroupblockmember'
import Editgroupkickmember from '@/actions/editgroupkickmember'
import Editgroupname from '@/actions/editgroupname'
import Editgroupsettings from '@/actions/editgroupsettings'
import Editgroupleave from '@/actions/editgroupleave'
import Editonetooneconversationleave from '@/actions/editonetooneconversationleave'
import Loadgroupexistlist from '@/actions/loadgroupexistlist'
import Loadgrouprequests from '@/actions/loadgrouprequests'
import Loadonetooneconversationexistlist from '@/actions/loadonetooneconversationexistlist'
import Loadonetooneconversationrequests from '@/actions/loadonetooneconversationrequests'
import Editgroupdescription from '@/actions/editgroupdescription'
import { Grouprecieverequest } from '@/components/store'
import { MessageSquareWarning } from 'lucide-react'
import Getonetooneconversations from '@/actions/getonetooneconversations'
import Loadallmaps from '@/actions/loadallmaps'
console.log("websocket running on 8080")
const userlist=new Map<string,Set<usersocket>>()
const oneto1conversations=new Map<string,oneto1conversation>()
const oneto1conversationmessages=new Map<string,conversations[]>()
const oneto1conversationrequest=new Map<string,onetoonerequest>()
const oneto1conversationtyping=new Map<string,onetooneconversationtyping>()
const groupconversations=new Map<string,groupconversation>()
const groupconversationmessages=new Map<string,groupconversationsmessages[]>()
const groupconversationcode=new Map<string,groupcode>()
const groupconversationrequest=new Map<string,grouprequest>()
const groupconversationtyping=new Map<string,grouptyping[]>()
const onetooneunreadcounts=new Map<string,number>()

async function bootstrapmapmemory(){
    try{
        const data=await Loadallmaps()

        data.onetooneconversations.forEach((value:any)=>{
            oneto1conversations.set(value.chatId,{participants:value.participants,createdAt:value.createdAt,chatId:value.chatId,deletedAt:value.deletedAt,status:value.status})
        })

        data.onetooneconversationmessages.forEach((value:any)=>{
            const existing=oneto1conversationmessages.get(value.chatId)||[]
            existing.push({chatId:value.chatId,global_id:value.global_id,senderId:value.senderId,message:value.message,status:value.status,createdAt:value.createdAt,replyto:value.replyTo?{global_id:value.replyTo.global_id,message:value.replyTo.message}:undefined})
            oneto1conversationmessages.set(value.chatId,existing)
        })

        data.onetooneconversationrequests.forEach((value:any)=>{
            oneto1conversationrequest.set(getkey(value.senderId,value.recieverId),{senderId:value.senderId,recieverId:value.recieverId,sendAt:value.sendAt,status:value.status})
        })

        data.groupconversations.forEach((value:any)=>{
            const groupId=String(value._id)
            groupconversations.set(groupId,{groupId:groupId,name:value.name,description:value.description,code:value.code,members:value.members,admins:value.admins.map((id:any)=>String(id)),createdAt:value.createdAt,createdBy:String(value.createdBy),updatedAt:value.updatedAt,settings:value.settings,status:value.status,blocked:value.blocked||[]})
            groupconversationcode.set(value.code,{code:value.code,groupId:groupId})
        })

        data.groupconversationmessages.forEach((value:any)=>{
            const existing=groupconversationmessages.get(value.groupId)||[]
            existing.push({_id:String(value._id),groupId:value.groupId,globalId:value.globalId,message:value.message,sendBy:value.sendBy,createdAt:value.createdAt,status:value.status,editedAt:value.editedAt,replyTo:value.replyTo?{globalId:value.replyTo.globalId,message:value.replyTo.message}:undefined} as groupconversationsmessages)
            groupconversationmessages.set(value.groupId,existing)
        })

        data.grouprequests.forEach((value:any)=>{
            groupconversationrequest.set(getkey(value.groupId,value.sendBy.id),{sendBy:value.sendBy,groupId:value.groupId,sendAt:value.sendAt,status:value.status,type:value.type})
        })

        console.log("map memory populated from database on server start")
    }catch(error){
        console.log("error populating map memory on server start",error)
    }
}
bootstrapmapmemory()

const wss=new WebSocketServer({port:8080})
function handleregister(name:string,email:string,_id:string,socket:any){
    userlist.set(_id,new Set())
    const userr=userlist.get(_id)
    userr?.add({name:name,email:email,_id:_id,socket:socket,description:""})
}
async function handlesearchrequest(search:string,name:string,_id:string){
   const user:userst[]=[]
   const formatted_users=await Getusrs()
        formatted_users.forEach((valuee)=>{
            if((oneto1conversationrequest.get(getkey(_id,valuee._id))?.status==="pending"||!oneto1conversationrequest.get(getkey(_id,valuee._id)))&&!oneto1conversations.get(getkey(_id,valuee._id))){
            let getsimilarityscore=getsimilarityusers(search,valuee.name)
            user.push({name:valuee.name,email:valuee.email,description:valuee.description,score:getsimilarityscore,_id:valuee._id})
            }
        }) 
   const users:userlistt[]=([...user].sort((a,b)=>b.score-a.score)).map(data=>({...data,conversation_exist:false,request_send:getrequestsend(data._id,_id)}))
   if(users.length===0){
    userlist.get(_id)?.forEach((value)=>{
        if(value.socket.readyState===WebSocket.OPEN){
            value.socket.send(JSON.stringify({event:"search:response",payload:{users:users,message:"No user found..."}}))
        }
    })
   }
   else{
    userlist.get(_id)?.forEach((value)=>{
        if(value.socket.readyState===WebSocket.OPEN){
            value.socket.send(JSON.stringify({event:"search:response",payload:{users:[...users].map(data=>({...data,score:undefined})),message:"Users found"}}))
        }
    })
   }
}
function getsimilarityusers(search:string,name:string){
   const namelength=name.length
   let index=0
   let score=0
   for(let i=0;i<namelength;i++){
     if(search.includes(name[i])&&(index<search.indexOf(name[i])||i===0)){
        score+=1
        index=search.indexOf(name[i])
     }
   }
   return score
}
function handleonetooneconversationrequest(senderId:string,recieverId:string){
    console.log("function triggered")
    if(oneto1conversationrequest.get(getkey(senderId,recieverId))){
        const message=getrequestsendrecievedmessage(senderId,recieverId)
        userlist.get(senderId)?.forEach((value)=>{
            if(value.socket.readyState===WebSocket.OPEN){
                value.socket.send(JSON.stringify({event:"request:response:sender:onetooneconversation",payload:{message:message}}))
            }
        })
    }
    else{
        console.log("details",senderId,recieverId)
        oneto1conversationrequest.set(getkey(senderId,recieverId),{senderId:senderId,recieverId:recieverId,sendAt:new Date(),status:"pending"})
        userlist.get(senderId)?.forEach((value)=>{
            if(value.socket.readyState===WebSocket.OPEN){
                value.socket.send(JSON.stringify({event:"request:response:sender:successfull:onetooneconversation",payload:{message:"Request send Successfully"}}))
            }
        })
        userlist.get(recieverId)?.forEach((value)=>{
            if(value.socket.readyState===WebSocket.OPEN){
                value.socket.send(JSON.stringify({event:"request:response:reciever:onetooneconversation",payload:{request:oneto1conversationrequest.get(getkey(senderId,recieverId))}}))
            }
        })
        handlecreaterequest(senderId,recieverId,new Date(),"pending")
    }
    
}
async function handleonetooneconversationrequestaccepted(senderId:string,recieverId:string){
    if(senderId&&recieverId){
        console.log("condi passed")
        oneto1conversations.set(getkey(senderId,recieverId),{participants:[senderId,recieverId],createdAt:new Date(),chatId:getkey(senderId,recieverId),status:"accepted"})
        console.log(oneto1conversations)
        await Createonetooneconversationroom({chatId:getkey(senderId,recieverId),status:"accepted",participants:[senderId,recieverId],createdAt:new Date()})
        const userr:usrlistt={name:"",email:"",description:"",_id:"",seen:false,unred_messages:0}
        userlist.get(recieverId)?.forEach((value)=>{
            if(value.socket.readyState===WebSocket.OPEN){
                userr._id=recieverId,
                userr.name=value.name
                userr.description=value.description
                userr.email=value.email
            }
        })
        console.log(userr)
        userlist.get(senderId)?.forEach((value)=>{
            if(value.socket.readyState===WebSocket.OPEN){
                value.socket.send(JSON.stringify({event:"request:response:sender:accepted:onetooneconversation",payload:{senderId:senderId,recieverId:recieverId,message:"Your request got accepted",userr:userr}}))
            }
        })
        userlist.get(senderId)?.forEach((value)=>{
            if(value.socket.readyState===WebSocket.OPEN){
                userr.name=value.name
                userr.email=value.email
                userr.description=value.description
                userr._id=value._id
            }
        })
        console.log(userr)
        userlist.get(recieverId)?.forEach((value)=>{
            if(value.socket.readyState===WebSocket.OPEN){
                value.socket.send(JSON.stringify({event:"request:response:reciever:accepted:onetooneconversation",payload:{senderId:senderId,recieverId:recieverId,message:"You accepted request",userr:userr}}))
            }
        })
        if(!oneto1conversationmessages.has(getkey(senderId,recieverId))){
            console.log("onetooneconversationmessages")
            oneto1conversationmessages.set(getkey(senderId,recieverId),[])
        }
        handlemarkonetooneconversationrequest(senderId,recieverId,"accepted")
        const onetooneconversationrequest=oneto1conversationrequest.get(getkey(senderId,recieverId))
        if(onetooneconversationrequest){
            console.log("status")
            onetooneconversationrequest.status="accepted"
        }
        if(!oneto1conversationtyping.get(getkey(senderId,recieverId))){
            console.log("typing")
            oneto1conversationtyping.set(getkey(senderId,recieverId),{user_1:{_id:senderId,typing:false},user_2:{_id:recieverId,typing:false},chatId:getkey(senderId,recieverId)})
        }
    }
}
export function getkey(senderId:string,recieverId:string){
    const array=[senderId,recieverId].map(data=>data.toString()).sort((a,b)=>a.toLowerCase().localeCompare(b.toLowerCase())).join(":")
    return array
}
function getunreadkey(senderId:string,recieverId:string,viewerId:string){
    return `${getkey(senderId,recieverId)}:${viewerId}`
}
function handleonetooneconversationunreadincrement(senderId:string,recieverId:string,messagesenderId:string){
    const viewerId=messagesenderId===senderId?recieverId:senderId
    const key=getunreadkey(senderId,recieverId,viewerId)
    const current=onetooneunreadcounts.get(key)||0
    const updated=current+1
    onetooneunreadcounts.set(key,updated)
    userlist.get(viewerId)?.forEach((value)=>{
        if(value.socket.readyState===WebSocket.OPEN){
            value.socket.send(JSON.stringify({event:"message:response:unreadcount:onetooneconversation",payload:{_id:messagesenderId,unred_messages:updated}}))
        }
    })
}
function handleonetooneconversationunreadreset(senderId:string,recieverId:string,viewerId:string){
    const key=getunreadkey(senderId,recieverId,viewerId)
    const otherId=viewerId===senderId?recieverId:senderId
    if(onetooneunreadcounts.get(key)){
        onetooneunreadcounts.set(key,0)
        userlist.get(viewerId)?.forEach((value)=>{
            if(value.socket.readyState===WebSocket.OPEN){
                value.socket.send(JSON.stringify({event:"message:response:unreadcount:onetooneconversation",payload:{_id:otherId,unred_messages:0}}))
            }
        })
    }
}
function handleonetooneconversationrequestrejected(senderId:string,recieverId:string){
    if(senderId&&recieverId){
        oneto1conversationrequest.delete(getkey(senderId,recieverId))
        userlist.get(senderId)?.forEach((value)=>{
            if(value.socket.readyState===WebSocket.OPEN){
                value.socket.send(JSON.stringify({event:"request:response:sender:rejected:onetooneconevrsation",payload:{senderId:senderId,recieverId:recieverId,message:"Your request is being rejected"}}))
            }
        })
        userlist.get(recieverId)?.forEach((value)=>{
            if(value.socket.readyState==WebSocket.OPEN){
                value.socket.send(JSON.stringify({event:"request:response:reciever:rejected:onetooneconversation",payload:{senderId:senderId,recieverid:recieverId,message:"You rejected the request"}}))
            }
        })
        handlemarkonetooneconversationrequest(senderId,recieverId,"deleted")
    }
}
    async function handleonetooneconversationdetails(senderId:string,recieverId:string,pressed:string){
        const senderdetails:usrlist={name:"",email:"",_id:"",description:""}
        const recieverdetails:usrlist={name:"",email:"",_id:"",description:""}
        const mesages:messagetype[]=[]
        console.log("triggered")
        userlist.get(senderId)?.forEach((value)=>{
            if(value.socket.readyState===WebSocket.OPEN){
                senderdetails.email=value.email
                senderdetails.name=value.name
                senderdetails.description=value.description
                senderdetails._id=value._id
            }
        })
        console.log(senderdetails)
        userlist.get(recieverId)?.forEach((value)=>{
            if(value.socket.readyState===WebSocket.OPEN){
                recieverdetails.name=value.name
                recieverdetails.email=value.email
                recieverdetails.description=value.description
                recieverdetails._id=value._id
            }
        })
        console.log(recieverdetails)
        if(oneto1conversationmessages.get(getkey(senderId,recieverId))&&oneto1conversations.get(getkey(senderId,recieverId))?.status!=="deleted"&&oneto1conversations.get(getkey(senderId,recieverId))?.status!=="pending"){
            oneto1conversationmessages.get(getkey(senderId,recieverId))?.forEach((value)=>{
                mesages.push({senderId:value.senderId,message:value.message,createdAt:value.createdAt,status:value.status})
            })
        }
        console.log(mesages)
        const messages_seen=await Getunredmessages(senderId,pressed)
        const messages=await handleloadfirstconversations(senderId,recieverId)
        console.log("first conversations",messages)
        const messagess=messages?.length?messages.reverse():[]
        const onetooneconversationdetailss:onetooneconversationdetails={senderId:senderdetails,recieverId:recieverdetails,chatId:getkey(senderId,recieverId),conversations:messagess||[],createdAt:oneto1conversations.get(getkey(senderId,recieverId))?.createdAt||new Date(),status:oneto1conversations.get(getkey(senderId,recieverId))?.status||"accepted"}
        console.log("conversationdetails",onetooneconversationdetailss)
        userlist.get(pressed)?.forEach((value)=>{
            if(value.socket.readyState===WebSocket.OPEN){
                value.socket.send(JSON.stringify({event:"request:response:conversation:onetooneconversations",payload:{onetooneconversationsdetails:onetooneconversationdetailss,senderId:senderId,recieverId:recieverId,cursor_id:messagess[0]?._id||"",hasMore:messagess?.length===20,messages_seen:messages_seen}}))
            }
        })
        {/* here i have to do a function and iterration for it*/}
    }
    async function handleonetooneconversationmessages(senderId:string,recieverId:string,message:string,createdAt:Date,_id:string,status:messagestatus,replyto:{global_id:string,message:string},attachment?:messageattachment){
        if(oneto1conversationmessages.has(getkey(senderId,recieverId))&&oneto1conversationrequest.get(getkey(senderId,recieverId))?.status==="accepted"&&oneto1conversations.has(getkey(senderId,recieverId))){
            const cryptomessageid=await handleoneto1conversationmessages(senderId,recieverId,message,createdAt,_id,status,replyto,attachment)
            const messages_seen=await Getunredmessages(_id,_id===senderId?recieverId:senderId)
            handleonetooneconversationunreadincrement(senderId,recieverId,_id)
            userlist.get(senderId)?.forEach((value)=>{
                if(value.socket.readyState===WebSocket.OPEN){
                    value.socket.send(JSON.stringify({event:"message:response:sent:onetooneconversation",payload:{senderId:senderId,recieverId:recieverId,message:message,createdAt:createdAt,_id:_id,status:status,global_id:cryptomessageid,messages_seen:messages_seen,replyto:replyto,attachment:attachment}}))
                }
            })
            userlist.get(recieverId)?.forEach((value)=>{
                if(value.socket.readyState===WebSocket.OPEN){
                    value.socket.send(JSON.stringify({event:"message:response:sent:onetooneconversation",payload:{senderId:senderId,recieverId:recieverId,createdAt:createdAt,message:message,_id:_id,status:status,global_id:cryptomessageid,messages_seen:messages_seen,replyto:replyto,attachment:attachment}}))
                }
            }) 
            const onetooneconversations=oneto1conversationmessages.get(getkey(senderId,recieverId))
            if(onetooneconversations?.length){
                if(onetooneconversations.length===1){
                console.log("cursorhasmore function","triggered")
            await handlegetcursoridhasmore(senderId,recieverId,cryptomessageid)
                }
            }
        }
    }
    async function handleoneto1conversationmessages(senderId:string,recieverId:string,message:string,createdAt:Date,_id:string,status:messagestatus,replyto:{global_id:string,message:string},attachment?:messageattachment){
        const cryptomessageid=getcryptomessageid()
        if(oneto1conversationmessages.has(getkey(senderId,recieverId))){
            console.log("cryptofunction",cryptomessageid)
            const messages=oneto1conversationmessages.get(getkey(senderId,recieverId))
            console.log("message",messages)
            const messagess=messages?.slice(-50)
            messagess?.push({chatId:getkey(senderId,recieverId),senderId:_id,createdAt:createdAt,status:status,message:message,global_id:cryptomessageid,attachment:attachment})
            console.log("messagee",messagess)
            oneto1conversationmessages.set(getkey(senderId,recieverId),messagess||[])
        }
        else{
            oneto1conversationmessages.set(getkey(senderId,recieverId),[])
            const messages=oneto1conversationmessages.get(getkey(senderId,recieverId))
            messages?.push({chatId:getkey(senderId,recieverId),senderId:_id,createdAt:createdAt,status:status,message:message,global_id:cryptomessageid,attachment:attachment})
        }
        if(!replyto.global_id&&!replyto.message){
        await Createonetooneconversations({senderId:_id,createdAt:createdAt,chatId:getkey(senderId,recieverId),status:status,message:message,global_id:cryptomessageid,attachment:attachment})
        }
        else if(replyto.global_id&&replyto.message){
        await Createonetooneconversationwithreplyto({senderId:_id,createdAt:createdAt,chatId:getkey(senderId,recieverId),status:status,message:message,global_id:cryptomessageid,attachment:attachment})
        }
        return cryptomessageid
    }
    async function handleonetooneconversationdeletemessages(senderId:string,recieverId:string,status:messagestatus,_id:string,message:string,createdAt:Date,globalId:string){
        if(oneto1conversationmessages.has(getkey(senderId,recieverId))){
            const messages=oneto1conversationmessages.get(getkey(senderId,recieverId))
            const messagess:conversations[]=[...messages||[]].map(data=>data.message===message&&data.senderId===_id&&data.createdAt===createdAt?{...data,status:getstatus(status,senderId,recieverId,_id,message,createdAt)}:data)||[]
            oneto1conversationmessages.set(getkey(senderId,recieverId),messagess)
            console.log("message deletion in server triggered")
            userlist.get(senderId)?.forEach((value)=>{
                if(value.socket.readyState===WebSocket.OPEN){
                    value.socket.send(JSON.stringify({event:"message:response:deleted:onetooneconversation",payload:{message:message,createdAt:createdAt,_id:_id,status:"deleted",senderwho:senderId===_id?"sender":"no_sender",globalId:globalId}}))
                }
            })
            userlist.get(recieverId)?.forEach((value)=>{
                if(value.socket.readyState===WebSocket.OPEN){
                    value.socket.send(JSON.stringify({event:"message:response:deleted:onetooneconversation",payload:{message:message,createdAt:createdAt,_id:_id,senderwho:recieverId===_id?"sender":"no_sender",globalId:globalId}}))
                }
            })
            await Markonetooneconversations(globalId,status)
        }
    }
    function getstatus(status:messagestatus,senderId:string,recieverId:string,_id:string,message:string,createdAt:Date){
        if(oneto1conversationmessages.has(getkey(senderId,recieverId))){
            const messages=oneto1conversationmessages.get(getkey(senderId,recieverId))
            const messageee=messages?.find(data=>data.createdAt===createdAt&&data.senderId===_id&&data.message===message)
            if(messageee){
                if(messageee.status==="view"||messageee.status!=="deleted"){
                    return "deleted"
                }
            }
            else{
                return status
            }
        }
        return status
    }
    function getcryptomessageid(){
        const messageid=crypto.randomUUID()
        return messageid
    }
    async function handleonetooneconversationviewmessages(senderId:string,recieverId:string,_id:string,global_id:string,status:messagestatus){
        const onetooneconversationmessages=oneto1conversationmessages.get(getkey(senderId,recieverId))?.map(data=>data.global_id===global_id?{...data,status:status}:data)
        oneto1conversationmessages.set(getkey(senderId,recieverId),onetooneconversationmessages||[])
        await Markonetooneconversations(global_id,status)
        const messages_seen=await Getunredmessages(_id===senderId?recieverId:senderId,_id)
        handleonetooneconversationunreadreset(senderId,recieverId,_id)
        userlist.get(senderId)?.forEach((value)=>{
            if(value.socket.readyState===WebSocket.OPEN){
                value.socket.send(JSON.stringify({event:"message:response:view:onetooneconversation",payload:{global_id:global_id,status:status,messages_seen:messages_seen,_id:_id,senderId:_id===senderId?recieverId:senderId}}))
            }
        })
        userlist.get(recieverId)?.forEach((value)=>{
            if(value.socket.readyState===WebSocket.OPEN){
                value.socket.send(JSON.stringify({event:"message:response:view:onetooneconversation",payload:{global_id:global_id,status:status,messages_seen:messages_seen,_id:_id,senderId:_id===senderId?recieverId:senderId}}))
            }
        })
    }
    async function handlecreaterequest(senderId:string,recieverId:string,sendAt:Date,status:status){
        const onetooneconversationrequest:onetoonerequest={senderId:senderId,recieverId:recieverId,sendAt:sendAt,status:status}
        await Createonetooneconversationrequest(onetooneconversationrequest)
    }
    async function handlemarkonetooneconversationrequest(senderId:string,recieverId:string,status:status){
        await Markonetooneconversationrequest(senderId,recieverId,status)
    }
    function getrequestsend(recieverId:string,senderId:string){
        const requestsend=oneto1conversationrequest.get(getkey(senderId,recieverId))
        let value:requesttype="send"
        if(requestsend?.senderId===senderId&&requestsend?.recieverId===recieverId){
            return value
        }
        else if(requestsend?.recieverId===senderId&&requestsend?.senderId===recieverId){
            value="recieved"
            return value
        }
        else{
            value="none"
            return value 
        }
    } 
    function handletypingonetooneconversation(senderId:string,recieverId:string,typing_id:string,typing:boolean){
        const onetooneconversationtyping=oneto1conversationtyping.get(getkey(senderId,recieverId))
        console.log(onetooneconversationtyping)
        let id:string=""
        if(onetooneconversationtyping&&typing){
            if(onetooneconversationtyping.user_1._id===typing_id){
                onetooneconversationtyping.user_1.typing=true
                id=onetooneconversationtyping.user_2._id
                console.log("typing",id)
            }
            else if(onetooneconversationtyping.user_2._id===typing_id){
                onetooneconversationtyping.user_2.typing=true
                id=onetooneconversationtyping.user_1._id
                console.log("typing",id)
            }
            userlist.get(id)?.forEach((value)=>{
                if(value.socket.readyState===WebSocket.OPEN){
                    console.log("sended")
                    value.socket.send(JSON.stringify({event:"message:response:typing:onetooneconversation",payload:{id:typing_id,typing:typing}}))
                }
            })
        }
        else if(onetooneconversationtyping&&!typing){
            if(onetooneconversationtyping.user_1._id===typing_id){
                onetooneconversationtyping.user_1.typing=false
                id=onetooneconversationtyping.user_2._id
                console.log("not_typing",id)
            }
            else if(onetooneconversationtyping.user_2._id===typing_id){
                onetooneconversationtyping.user_2.typing=false
                id=onetooneconversationtyping.user_1._id
                console.log("not_typing",id)
            }
            userlist.get(id)?.forEach((value)=>{
                if(value.socket.readyState===WebSocket.OPEN){
                    value.socket.send(JSON.stringify({event:"message:response:typing:onetooneconversation",payload:{id:typing_id,typing:typing}}))
                }
            })
        }
    }
    function handleloginonetooneconversation(id:string,_id:string){
        oneto1conversations.forEach((value)=>{
           if(value.participants.includes(id)&&value.participants.includes(_id)){
              if(_id&&id){
                const partnerisonline=(userlist.get(_id)?.size||0)>0
                userlist.get(id)?.forEach((value)=>{
                    if(value.socket.readyState===WebSocket.OPEN){
                        value.socket.send(JSON.stringify({event:"user:status:onetooneconversation",payload:{id:_id,online:partnerisonline}}))
                    }
                })
              }
           }
       })
    }
    async function handleloadmoreonetooneconversations(senderId:string,recieverId:string,id:string,cursor_id:string){
        const messages=await Getconversationsafteronetooneconversations(getkey(senderId,recieverId),cursor_id)
        console.log("load more conversations",senderId,recieverId,id,cursor_id)
        const data={
            messages:[{}],
            cursor_id:"",
            hasMore:false
        }
        console.log("data skeleton",data)
        if(messages?.length){
            data.messages=[...messages].reverse()
            data.cursor_id=messages[messages.length-1]._id
            data.hasMore=messages.length===20
        }
        console.log("data populated",data)
        userlist.get(id)?.forEach((value)=>{
            if(value.socket.readyState===WebSocket.OPEN){
                value.socket.send(JSON.stringify({event:"message:response:loadmore:conversations",payload:{data:data}}))
            }
        })
    }
    async function handleloadfirstconversations(senderId:string,recieverId:string){
        const messages=await Getonetoonefirstconversations(getkey(senderId,recieverId))
        return messages
    }
    function handleexistonetooneconversationlist(id:string){
        const userss:usrlist[]=[]
        const userdetails:usrlist={name:"",email:"",_id:"",description:""}
        oneto1conversations.forEach((value)=>{
            if(value.participants.includes(id)){
                const users=value.participants.filter(data=>data!==id)[0]
                userlist.get(users)?.forEach((valuee)=>{
                    userdetails.name=valuee.name
                    userdetails.email=valuee.email
                    userdetails._id=valuee._id
                    userdetails.description=valuee.description
                })
                userss.push(userdetails)
            }
        })
        userlist.get(id)?.forEach((value)=>{
            if(value.socket.readyState===WebSocket.OPEN){
                value.socket.send(JSON.stringify({event:"login:response:existlist:onetooneconversation",payload:{users:userss}}))
            }
        })
    }
    function handlerequestonetooneconversation(id:string){
        const request_send:onetoonerequest[]=[]
        const request_recieve:onetoonerequest[]=[]
        oneto1conversationrequest.forEach((value)=>{
            if(value.recieverId===id){
                request_recieve.push(value)
            }
            else if(value.senderId===id){
                request_send.push(value)
            }
        })
        userlist.get(id)?.forEach((value)=>{
            if(value.socket.readyState===WebSocket.OPEN){
                value.socket.send(JSON.stringify({event:"login:response:requests:onetooneconversation",payload:{request_send:request_send,request_recieve:request_recieve}}))
            }
        })
    }
    function getrequestsendrecievedmessage(senderId:string,recieverId:string){
        const request=oneto1conversationrequest.get(getkey(senderId,recieverId))
        console.log(senderId,recieverId)
        if(request?.senderId===senderId){
            console.log("triggerrrrr")
            return "Request Already send"
        }
        else if(request?.recieverId===senderId){
            console.log("triggerrrrrrrrr")
            return "Request Already recieved"
        }
    }
    async function handlegetcursoridhasmore(senderId:string,recieverId:string,cryptoid:string){
        const messageId=await Getspecificonetooneconversation(cryptoid)
        console.log("specificconversation",messageId)
        userlist.get(senderId)?.forEach((value)=>{
            if(value.socket.readyState===WebSocket.OPEN){
                value.socket.send(JSON.stringify({event:"message:response:cursorid",payload:{cursor_id:messageId}}))
            }
        })
        userlist.get(recieverId)?.forEach((value)=>{
            if(value.socket.readyState===WebSocket.OPEN){
                value.socket.send(JSON.stringify({event:"message:response:cursorid",payload:{cursor_id:messageId}}))
            }
        })
    }
    async function handleleaveonetooneconversation(pressed:string,senderId:string,recieverId:string){
        if(pressed&&senderId&&recieverId){
            oneto1conversationmessages.delete(getkey(senderId,recieverId))
            const onetooneconversation=oneto1conversations.get(getkey(senderId,recieverId))
            if(onetooneconversation?.status){
            onetooneconversation.status="deleted"
            }
            oneto1conversationrequest.delete(getkey(senderId,recieverId))
            await Editonetooneconversationleave(senderId,recieverId,getkey(senderId,recieverId))
            let id=""
            if(pressed===senderId){
                id=recieverId
            }
            else if(pressed===recieverId){
                id=senderId
            }
            userlist.get(pressed)?.forEach((value)=>{
                if(value.socket.readyState===WebSocket.OPEN){
                    value.socket.send(JSON.stringify({event:"request:response:onetooneconversation:leave",payload:{message:"Thos conversation is now deleted",senderId:senderId,recieverId:recieverId,_id:id}}))
                }
            })
            userlist.get(id)?.forEach((value)=>{
                if(value.socket.readyState===WebSocket.OPEN){
                    value.socket.send(JSON.stringify({event:"request:response:onetooneconversation:leave",payload:{message:"Your conversation is being deleted due to the other party leaving",senderId:senderId,recieverId:recieverId,_id:pressed}}))
                }
            })
        }
    }
    function handledeleteformeonetooneconversation(senderId:string,recieverId:string,status:messagestatus,messageid:string,userid:string){
        if(senderId&&recieverId&&status&&userid&&messageid){
            const message=oneto1conversationmessages.get(getkey(senderId,recieverId))
            const messagess=[...message||[]].map(data=>data.global_id===messageid?{...data,status:status}:data)
            console.log("function for message deletion in server triggered")
            oneto1conversationmessages.set(getkey(senderId,recieverId),messagess)
            let id=""
            if(senderId===userid){
                id=recieverId
            }
            else if(recieverId===userid){
                id=senderId
            }
            userlist.get(userid)?.forEach((value)=>{
               if(value.socket.readyState===WebSocket.OPEN){
                value.socket.send(JSON.stringify({event:"message:response:deleteforme:onetooneconversation",payload:{message:"Message deleted for u",messageId:messageid,status:"deleteforme"}}))
               }
            })
        }
    }
    function handlechangenameonetooneconversation(id:string,name:string){
      if(id&&name){
        userlist.get(id)?.forEach((value)=>{
            if(value.socket.readyState===WebSocket.OPEN){
                value.name=name
                value.socket.send(JSON.stringify({event:"request:response:namechange:onetooneconversation",payload:{message:"Name changed",_id:id,name:name}}))
            }
        })
        oneto1conversations.forEach((value)=>{
            if(value.participants.includes(id)){
                const partnerId=value.participants.filter(data=>data!==id)[0]
                if(partnerId){
                    sendmessage(partnerId,"request:response:namechange:onetooneconversation",{message:"Name changed",_id:id,name:name})
                }
            }
        })
      }
    }
    function handlechangedescriptiononetooneconversation(description:string,_id:string){
        userlist.get(_id)?.forEach((value)=>{
            if(value.socket.readyState===WebSocket.OPEN){
                value.description=description
                value.socket.send(JSON.stringify({event:"request:response:descriptionchange:onetooneconversation",payload:{_id:_id,description:description,message:"Description changed successfully"}}))
            }
        })
        oneto1conversations.forEach((value)=>{
            if(value.participants.includes(_id)){
                const partnerId=value.participants.filter(data=>data!==_id)[0]
                if(partnerId){
                    sendmessage(partnerId,"request:response:descriptionchange:onetooneconversation",{_id:_id,description:description,message:"Description changed successfully"})
                }
            }
        })
    }
    function handlelogoutonetooneconversation(id:string){
        oneto1conversations.forEach((value)=>{
            if(value.participants.includes(id)){
                const idd=value.participants.filter(data=>data!==id)[0]
                userlist.get(idd)?.forEach((value)=>{
                    if(value.socket.readyState===WebSocket.OPEN){
                        value.socket.send(JSON.stringify({event:"user:status:logout:onetooneconversation",payload:{id:id,oneline:false,date:new Date()}}))
                    }
                })
            }
        })
    }
    async function handleexistusers(id:string){
        let userrr:usrlistt={name:"",description:"",_id:"",email:"",unred_messages:0,seen:false}
        let userrs:usrlistt[]=[]
        const userlst=oneto1conversations
        for(const [key,conversation] of userlst){
            if(conversation.participants.includes(id)){
                const _id=conversation.participants.filter(data=>data!==id)[0]
                userlist.get(_id)?.forEach((valuee)=>{
                    userrr._id=valuee._id
                    userrr.description=valuee.description
                    userrr.name=valuee.name
                    userrr.email=valuee.email
                })
                const messages=await Getpendingmessages(_id,id)
                if(messages<=0){
                    userrr.seen=false
                }
                else if(messages>0){
                    userrr.seen=true
                }
                userrr.unred_messages=messages
                userrs.push(userrr)
            }
        }
        userlist.get(id)?.forEach((value)=>{
            if(value.socket.readyState===WebSocket.OPEN){
                value.socket.send(JSON.stringify({event:"request:response:userexist",payload:{users:userrs}}))
            }
        })
    }
    async function Getunredmessages(senderId:string,recieverId:string){
        if(senderId&&recieverId){
            const unred_messages=await Getpendingmessages(senderId,recieverId)
            let seen:boolean=false
            if(unred_messages<=0){
                seen=false
            }
            else if(unred_messages>0){
                seen=true
            }
            return {unred_messages:unred_messages,seen:seen}
        }
    }
    async function handleeditmessageonetooneconversation(global_id:string,message:string,senderId:string,recieverId:string,_id:string){
        await Editonetooneconversationmessage(global_id,message)
        userlist.get(senderId)?.forEach((value)=>{
            if(value.socket.readyState===WebSocket.OPEN){
                value.socket.send(JSON.stringify({event:"message:response:sent:edit:onetooneconversation",payload:{message:message,global_id:global_id,_id:_id}}))
            }
        })
        userlist.get(recieverId)?.forEach((value)=>{
            if(value.socket.readyState===WebSocket.OPEN){
                value.socket.send(JSON.stringify({event:"message:response:sent:edit:onetooneconversation",payload:{global_id:global_id,message:message,_id:_id}}))
            }
        })
    }
    async function handlecreategroup(name:string,description:string,_id:string,createdname:string){
        console.log("function triggered in server")
        const code=generateCode()
        const response=await Creategroup(name,description,_id,createdname,code)
        if(response!=="An error occurred"){
            const getresponse=await Getcreategroup(code)
            if(getresponse!=="An error occurred"){
                const groupconversationap:groupconversation={name:getresponse.name,description:getresponse.description,code:getresponse.code,members:[{id:_id,name:createdname,lastseenmessageId:""}],admins:[_id],groupId:getresponse.groupId,createdBy:_id,createdAt:getresponse.createdAt,settings:getresponse.settings,status:getresponse.status,blocked:[]}
                console.log(groupconversationap,"groupbody")
                const grpconversation=groupconversations.get(getresponse.groupId)
                if(grpconversation){
                    sendmessage(_id,"request:response:creategroup",{message:"Group already exists"})
                }
                else{
                    console.log("group created in map memory")
                    const group:groupsexistlist={name:groupconversationap.name,description:groupconversationap.description,code:groupconversationap.code,status:groupconversationap.status,member_no:groupconversationap.members.length,createdAt:groupconversationap.createdAt,createdBy:groupconversationap.createdBy,admins_info:[{id:_id,name:createdname,lastseenmessageId:""}],groupId:groupconversationap.groupId}
                    groupconversations.set(String(getresponse.groupId),groupconversationap)
                    sendmessage(_id,"request:response:creategroup",{group:group,message:"Success"})
                    const groupconversation=groupconversationmessages.get(getresponse.groupId)
                    if(!groupconversation){
                        groupconversationmessages.set(getresponse.groupId,[])
                    }
                }
            }
            else{
                sendmessage(_id,"request:response:creategroup",{message:"An error occurred"})
            }
        }
        else{
            sendmessage(_id,"request:response:creategroup",{message:"An error occurred"})
        }
    }
    export function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}
  function sendmessage(_id:string,event:string,payload:object){
    userlist.get(_id)?.forEach((value)=>{
        if(value.socket.readyState===WebSocket.OPEN){
            value.socket.send(JSON.stringify({event:event,payload:payload}))
        }
    })
  }
  function handlesearchgrouprequest(search:string,_id:string){
    if(search&&_id){
        console.log("search request function triggered in server")
        console.log(search,_id)
        const grouplist:groupconversation[]=[]
        const groupnamelist:any=[]
        groupconversations.forEach((value)=>{
            if(value.code.toUpperCase()===search.toUpperCase()){
                grouplist.push(value)
            }
        })
        console.log(groupconversations)
        groupconversations.forEach((value)=>{
            if(value.status!=="deleted"){
                let similarityusers=getsimilarityusers(search,value.name)
                groupnamelist.push({...value,similarityscore:similarityusers})
            }
        })
        console.log(groupnamelist)
        const namelist:any=[...groupnamelist].sort((a,b)=>a.similarityscore-b.similarityscore).map(data=>({name:data.name,description:data.description,code:data.code,member_no:data.members.length,status:data.status,createdAt:data.createdAt,admins_info:data.members.map((dataa:any)=>({name:dataa.name,id:dataa.id,lastseenmessageId:""})),groupId:data.groupId,createdBy:data.createdBy}))
        console.log(grouplist)
        if((grouplist?.length+namelist?.length)>0){
            const grpslst:groupsexistlist[]=[...grouplist,...namelist].map((data)=>({name:data.name,description:data.description,code:data.code,member_no:data.members?.length,status:data.status,createdAt:data.createdAt,admins_info:data.members?.map((dataa:{name:string,id:string,lastseenmessageId?:string})=>({name:dataa.name,id:dataa.id,lastseenmessageId:""})),groupId:data.groupId,createdBy:data.createdBy}))
            sendmessage(_id,"request:response:groups:search",{groups:grpslst,message:`${grpslst.length} groups found`})
        }
        else{
            sendmessage(_id,"request:response:groups:search",{groups:grouplist,message:"No groups found"})
        }
    }
  }
  function handlegroupstatuschange(groupId:string,status:grpstatustype,_id:string){
        const group=groupconversations.get(groupId)
        if(group){
            group.status=status
            sendmessage(_id,"request:response:statuschange:group",{message:"An error occurred"})
        }
        else{
            sendmessage(_id,"request:response:statuschange:group",{groupId:groupId,status:status,message:"Group status chnaged"})
        }
  }
  async function handlegroupsendrequest(groupId:string,status:status,_id:string,name:string,type:RequestType){
        const grouprequest=groupconversationrequest.get(getkey(groupId,_id))
        if(groupconversations.get(groupId)?.status!=="deleted"||groupconversations.get(groupId)?.status!=="archived"){
        if(grouprequest){
            sendmessage(_id,"request:response:sendgrouprequest:group",{message:"Request already send"})
        }
        else{
            const request:grouprequest={sendBy:{id:_id,name:name},sendAt:new Date(),status:status,groupId:groupId,type:type}
            const response=await Creategrouprequest(request)
            console.log(request)
            if(response!=="Error"){
            groupconversationrequest.set(getkey(groupId,_id),request)
            sendmessage(_id,"request:response:sendgrouprequest:group",{message:"Group request send successfully",request:request})
            const adminsid=groupconversations.get(groupId)?.admins
            console.log("groups",groupconversations,"specific group",groupconversations.get(groupId))
            console.log("group admins",adminsid)
            if(adminsid?.length){
                adminsid.forEach((value)=>{
                    sendmessage(value,"request:response:recieve:sendgrouprequest:group",{message:"An new request recieved",request:request})
                })
            }
        }
        else{
            sendmessage(_id,"request:response:sendgrouprequest:group",{message:"Error"})
        }
        }
    }
    else{
        sendmessage(_id,"request:response:sendgrouprequest:group",{message:"Group dosent exist"})
    }
  }
  function handlegrouprequestaccept(groupId:string,name:string,_id:string,id:string){
        const grouprequst=groupconversationrequest.get(getkey(groupId,id))
        console.log("grouprequest",grouprequst)
        if(grouprequst?.status!=="accepted"&&grouprequst?.status!=="deleted"){
            console.log("condition 1")
            console.log("parameters",groupId,name,_id,id)
            console.log("group",groupconversations.get(groupId))
        if(grouprequst&&groupconversations.get(groupId)?.admins.includes(_id)){
            console.log("condition 2")
            grouprequst.status="accepted"
            sendmessage(_id,"request:response:reciever:grouprequestaccept:group",{groupId:groupId,member:grouprequst.sendBy,status:"accepted",message:"Success"})
            handlegrouprequestacceptthings(groupId,_id,id,"accepted")
        }
        else{
            sendmessage(_id,"request:response:reciever:grouprequestaccept:group",{message:"Request doesnt exist"})
        }
    }
    else{
        sendmessage(_id,"request:response:reciever:grouprequestaccept:group",{message:"Request already taken care of"})
    }
  }
  async function handlegrouprequestacceptthings(groupId:string,adminId:string,sendBy:string,status:status){
       const gropp=groupconversations.get(groupId)
       if(gropp){
        let name=""
        userlist.forEach((value)=>{
           value.forEach((valuee)=>{
            if(valuee.socket.readyState===WebSocket.OPEN&&valuee._id===sendBy){
                name=valuee.name
            }
           })
        })
        const response=await Markgrouprequeststatus(groupId,{id:sendBy,name:name},status)
        if(response!=="Error"){
        gropp.members.push({name:name,id:sendBy,lastseenmessageId:""})
       const group:groupsexistlist={name:gropp.name,description:gropp.description,code:gropp.code,member_no:gropp.members.length,status:gropp.status,createdAt:gropp.createdAt,admins_info:gropp.admins.map(dataa=>({name:gropp.members.find(data=>data.id===dataa)?.name||"",id:dataa,lastseenmessageId:""})),groupId:gropp.groupId,createdBy:gropp.createdBy}
       sendmessage(sendBy,"request:response:sender:grouprequestaccept:group",{group:group,groupId:groupId,sendBy:sendBy,status:"accepted",message:"Success"})
        }
       }
       else{
        sendmessage(sendBy,"request:response:sender:grouprequestaccept:group",{message:"Group doesnt exist"})
       }
  }
  async function handlegroupinvitesend(groupId:string,sendTo:string,status:status,type:RequestType,sendBy:string,name:string){
       const group=groupconversations.get(groupId)
       if(group?.admins.includes(sendBy)&&group?.members.some(data=>data.id===sendBy)){
        const requstt=groupconversationrequest.get(getkey(groupId,sendBy))
        if(requstt){
            sendmessage(sendBy,"request:response:sendgroupinviterequest:group",{message:"Request already send"})
        }
        else{
        const request:grouprequest={sendBy:{id:sendBy,name:name},groupId:groupId,sendAt:new Date(),status:status,type:type}
        const response=await Creategrouprequest(request)
        if(response==="Success"){
        groupconversationrequest.set(getkey(groupId,sendBy),request)
        sendmessage(sendBy,"request:response:sendgroupinviterequest:group",{request:request,message:"Request send successfully"})
        sendmessage(sendTo,"request:response:recieve:sendgroupinviterequest:group",{message:"You have new request",request:request})
        }
        else if(response==="Error"){
            sendmessage(sendBy,"request:response:sendgroupinviterequest:group",{message:"Error"})
        }
        }
       }
  }
  async function handlegroupinviteaccept(groupId:string,sendBy:string,sendTo:string,name:string){
       const group=groupconversations.get(groupId)
       const request=groupconversationrequest.get(getkey(groupId,sendBy))
       if(request&&request?.status!=="deleted"&&request?.status!=="accepted"){
        if(group&&group?.status!=="deleted"&&group?.admins.includes(sendTo)){
            const response=await Markgrouprequeststatus(groupId,{id:sendBy,name:request.sendBy.name},"accepted")
            if(response==="Success"){
            request.status="accepted"
            group.members.push({id:sendTo,name:name,lastseenmessageId:""})
            const gropp:groupsexistlist={name:group.name,description:group.description,code:group.code,member_no:group.members.length,status:group.status,createdAt:group.createdAt,admins_info:group.members.map(dataa=>({name:dataa.name,id:dataa.id,lastseenmessageId:""})),groupId:group.groupId,createdBy:group.createdBy}
            sendmessage(sendTo,"request:response:groupinviteaccept:group",{groupId:groupId,sendBy:sendBy,sendTo:sendTo,name:name,group:gropp,message:"You accepted request"})
            sendmessage(sendBy,"request:response:groupinviteaccept:group",{groupId:groupId,sendBy:sendBy,sendTo:sendTo,name:name,message:"Your invite got accepted"})
            }
        }
        else{
            sendmessage(sendTo,"request:response:groupinviteaccept:group",{message:"Group dosent exist anymore"})
        }
       }
       else{
        sendmessage(sendTo,"request:response:groupinviteaccept:group",{message:"Request already got accepted"})
       }
  }
  async function handlegroupconversation(_id:string,name:string,groupId:string){
       const group=groupconversations.get(groupId)
       if(group){
        const groupmessages=await Getgroupfirstconversations(groupId)
          const gropp:groupconversation=group
          sendmessage(_id,"request:response:groupconversations:group",{group:gropp,groupmessages:groupmessages.reverse()})
       }
       else{
        sendmessage(_id,"request:response:groupconversations:group",{message:"Group doesnt exist anymore"})
       }
  }
  async function handlegroupsendmessage(groupId:string,message:string,_id:string,name:string,reply:boolean,attachment?:messageattachment){
       if(groupId&&(message||attachment)&&_id&&name&&(reply===true||reply===false)){
        const globalId=await Creategroupconversation(groupId,message,_id,name,getcryptomessageid(),"none",attachment)
        const response=await Getgroupconversations(globalId)
        const group=groupconversations.get(groupId)
        if(group){
        if(response!=="An error occurred"&&typeof response!=="string"){
            const groupconversation=groupconversationmessages.get(groupId)
            if(groupconversation){
                groupconversation.push(response)
            }
            const group_members=group.members
            group_members?.forEach((value)=>{
                sendmessage(value.id,"request:response:sendmessage:group",{message:"Success",conversation:response})
            })
        }
        else{
            sendmessage(_id,"request:response:sendmessage:group",{message:"An error occurred"})
        }
    }
    else{
        sendmessage(_id,"request:response:sendmessage:group",{message:"Group dont exist"})
    }
       }
  }
  async function handleviewgroupmessage(groupId:string,globalId:string,_id:string,name:string){
      const group=groupconversations.get(groupId)
      const groupconversation=await Getgroupconversations(globalId)
      console.log(group,groupconversation)
      if(group&&typeof groupconversation!=="string"){
        console.log("condition 1")
        const members=group.members
        members.forEach((value)=>{
            if(value.id===_id){
            value.lastseenmessageId=groupconversation?._id?groupconversation?._id:""
            }
        })
        console.log(members)
        members.forEach((value)=>{
            if(value.id===_id){
                console.log(members,_id,"response send")
            sendmessage(value.id,"request:response:viewmessage:group",{groupId:groupId,globalId:globalId,messageId:groupconversation._id})
            }
        })
      }
  }
  function handlechangememberstatus(groupId:string,promoteId:string,status:promote,id:string){
      const group=groupconversations.get(groupId)
      if(group){
        const groupmembers=group.members
        if(status==="admin"){
        if(group.admins.includes(id)&&groupmembers.some(data=>data.id===promoteId)){
            if(group.admins.includes(promoteId)){
                sendmessage(id,"request:response:changememberstatus:group",{message:"Already an admin"})
            }
            else{
            group.admins.push(promoteId)
            sendmessage(id,"request:response:changememberstatus:group",{message:"Success",status:status,promoteId:promoteId,name:group.members.find(data=>data.id===promoteId)?.name,extramessage:"Member successfully converted to admin"})
            sendmessage(promoteId,"request:response:changememberstatus:group",{message:"Success",status:status,promoteId:promoteId,name:group.members.find(data=>data.id===promoteId)?.name,extramessage:`You are converted to admin of group ${group.name}`})
            }
        }
    }
    else if(status==="member"){
        if(group.admins.includes(id)&&groupmembers.some(data=>data.id===promoteId)&&group.createdBy===id){
            if(group.admins.includes(promoteId)){
               group.admins=[...group.admins].filter(data=>data!==promoteId)
               sendmessage(id,"request:response:changememberstatus:group",{message:"Success",status:status,promoteId:promoteId,name:group.members.find(data=>data.id===promoteId)?.name,extramessage:"Member successfully demoted to admin to member"})
               sendmessage(promoteId,"request:response:changememberstatus:group",{message:"Success",status:status,promoteId:promoteId,name:group.members.find(data=>data.id===promoteId)?.name,extramessage:"You are demoted to member from admin"})
            }
            else{
                sendmessage(id,"request:response:changememberstatus:group",{message:"Already an member"})
            }
        }
        else{
            sendmessage(id,"request:response:changememberstatus:group",{message:"Only creator of group can demote from admin to member"})
        }
    }
      }
  }
   async function handleleavegroup(groupId:string,id:string){
    const group=groupconversations.get(groupId)
    if(group){
        const response=await Editgroupleave(groupId,id)
        if(response!=="Error"){
        if(group.members.find(data=>data.id===id)){
        if(group.admins.includes(id)){
            group.admins=[...group.admins].filter(data=>data!==id)
            group.members=[...group.members].filter(data=>data.id!==id)
            if(group.members.length!==0){
            if(group.createdBy===id){
                group.createdBy=group.members[0].id
            }
            if(group.admins.length===0){
                group.admins.push(group.members[0].id)
            }
            sendmessage(id,"request:response:leavegroup:group",{groupId:groupId,id:id,admin:true,deletee:false})
            group.members.forEach((value)=>{
                sendmessage(value.id,"request:response:leavegroup:group",{groupId:groupId,id:id,deletee:false})
            })
        }
        else{
            groupconversations.delete(groupId)
            sendmessage(id,"request:response:leavegroup:group",{groupId:groupId,id:id,deletee:true})
        }
        }
        else{
            group.members=[...group.members].filter(data=>data.id!==id)
            sendmessage(id,"request:response:leavegroup:group",{groupId:groupId,id:id,admin:false})
            group.members.forEach((value)=>{
                sendmessage(value.id,"request:response:leavegroup:group",{groupId:groupId,id:id,admin:false})
            })
        }
    }
        }
    }
  }
  function handlegrouptyping(groupId:string,id:string,name:string,status:boolean){
        const group=groupconversations.get(groupId)
        if(group){
        if(status){
            const groupconversation=groupconversationtyping.get(groupId)
            if(groupconversation){
                groupconversation.push({id:id,name:name,typing:status})
            }
            else{
                groupconversationtyping.set(groupId,[{id:id,name:name,typing:status}])
            }
        }
        else{
            const groupconversation=groupconversationtyping.get(groupId)
            if(groupconversation){
                let array:grouptyping[]=groupconversation
                   array=[...array].filter(data=>data.id!==id)
                   groupconversationtyping.set(groupId,array)  
            }
            else{
                groupconversationtyping.set(groupId,[])
            }
        }
        group.members.forEach((value)=>{
            if(value.id!==id){
                sendmessage(value.id,"request:response:grouptyping:group",{id:id,name:name,status:group.admins.includes(id)?"admin":"member",online:true,typing:true})
            }
        })
    }
  }
  async function handlegroupchangename(groupId:string,name:string,id:string){
    const group=groupconversations.get(groupId)
    if(group){
        const response=await Editgroupname(groupId,name,id)
        if(response!=="Error"){
        let check:boolean=false
        if(group.settings.onlyAdminCanEditInfo){
            if(group.createdBy===id){
                group.name=name
                check=true
            }
            else if(group.admins.includes(id)){
                group.name=name
                check=true
            }
           else{
           sendmessage(id,"request:response:changename:group",{message:"You cannot change name change settings first"})
           check=false
           }
        }
        else{
            if(group.createdBy===id){
                group.name=name
                check=true
            }
        }
        if(check===true){
         group.members.forEach((value)=>{
            sendmessage(value.id,"request:response:changename:group",{groupId:groupId,name:name,id:id,message:"Success"})})
         }
    }
    else{
        sendmessage(id,"request:response:changename:group",{message:"Error occurred"})
    }
}
    else{
        sendmessage(id,"request:response:changename:group",{message:"Group doesnt exist"})
    }
  }
  async function handlegrouppagination(groupId:string,messageId:string,_id:string){
    const group=groupconversations.get(groupId)
    console.log("pagination triggered")
    if(group){
        console.log("condition passed")
        const conversations=await Getgroupafterconversations(groupId,messageId)
        const groupconversations=conversations.reverse()
        console.log(groupconversations,"conversations from server")
        const response={
            hasMore:conversations.length===20,
            cursorId:conversations.length?groupconversations[0]._id:"",
            conversations:groupconversations
        }
        console.log(response)
        sendmessage(_id,"request:response:pagimoremessage:group",{hasMore:response.hasMore,cursorId:response.cursorId,conversations:response.conversations})
    }
  }
  async function handlereplygroupmessage(globalId:string,message:string,id:string,name:string,groupId:string,replymessage:string){
    const global_id=await Creategroupreplyconversations(message,globalId,groupId,replymessage,id,name,getcryptomessageid(),"none")
    const group=groupconversations.get(groupId)
    if(group){
        const response=await Getgroupconversations(global_id)
        if(response!=="An error occurred"&& typeof response!=="string"){
            const mapgroupconversation=groupconversationmessages.get(groupId)
            if(mapgroupconversation){mapgroupconversation.push(response)}
            const members=group.members
            members.forEach((value)=>{
                sendmessage(value.id,"request:response:sendmessage:group",{conversation:response})
            })
        }
    }
  }
  async function handlegrouprecieverejectrequest(groupId:string,sendBy:string,id:string){
    const group=groupconversations.get(groupId)
    if(group&&groupconversationrequest.get(getkey(groupId,sendBy))?.status==="pending"&&group.members.find(data=>data.id===sendBy)&&group.admins.some(data=>data===sendBy)){
        const response=await Markgrouprequeststatus(groupId,{id:sendBy,name:groupconversationrequest.get(getkey(groupId,sendBy))?.sendBy.name||""},"deleted")
        if(response!=="Error"){
        const grouprequest=groupconversationrequest.get(groupId)
        if(grouprequest){
            grouprequest.status="deleted"
        }
        sendmessage(sendBy,"request:response:grouprecieverejectrequest:group",{id:id,groupId:groupId,status:"deleted",type:"sender",message:"Ur invite got rejected"})
        sendmessage(id,"request:response:grouprecieverejectrequest:group",{groupId:groupId,id:id,status:"deleted",type:"reciever",message:"You rejected the group invite request"})
    }
    }
  }
  async function handlegroupsenderrequestcancel(groupId:string,status:status,type:RequestType,id:string){
        const grouprequest=groupconversationrequest.get(groupId)
        if(grouprequest&&type==="group_join_request"){
            const response=await Markgrouprequeststatus(groupId,{id:id,name:groupconversationrequest.get(getkey(groupId,id))?.sendBy.name||""},"deleted")
            if(response!=="Error"){
            const group=groupconversations.get(groupId)
            if(group){
                const groupadmins=group.admins
                groupadmins.forEach((value)=>{
                    sendmessage(value,"request:response:reciever:groupsenderrequestcancel:group",{groupId:groupId,status:"deleted",id:id,message:"Request for group is being cancelled by sender"})
                })
            }
            sendmessage(id,"request:response:sender:groupsenderrequestcancel:group",{groupId:groupId,status:"deleted",message:"U deleted ur request for group"})
        }
        }
  }
  function handlegrouptypingonline(groupId:string,id:string,name:string,value:boolean){
        const group=groupconversations.get(groupId)
        if(group){
            const members=group.members
            const admins=group.admins
            const groupmember:grouponlinetyping={name:name,id:id,status:(members.some(data=>data.id===id))?admins.includes(id)?"admin":"member":"member",online:value,typing:false}
            members.forEach((value)=>{
                if(value.id!==id){
                    sendmessage(value.id,"request:response:grouptypingonline:group",{memberstatus:groupmember,groupId:groupId})
                }
            })
            if(value){
                members.forEach((m)=>{
                    if(m.id!==id){
                        const isonline=(userlist.get(m.id)?.size||0)>0
                        const membersnapshot:grouponlinetyping={name:m.name,id:m.id,status:admins.includes(m.id)?"admin":"member",online:isonline,typing:false}
                        sendmessage(id,"request:response:grouptypingonline:group",{memberstatus:membersnapshot,groupId:groupId})
                    }
                })
            }
        }
  }
  async function handlegroupmessagestatuschange(groupId:string,messageId:string,id:string,status:grpconversations){
    const group=groupconversations.get(groupId)
    if(group){
        const response=await Markgroupconversationstatus(groupId,messageId,status,id)
        if(response!=="Error"){
            const members=group.members
            members.forEach((value)=>{
                sendmessage(value.id,"request:response:messagestatuschange:group",{groupId:groupId,messageId:messageId,status:status,message:"Success"})
            })
        }
        else if(response==="Error"){
            sendmessage(id,"request:response:messagestatuschange:group",{message:"An error occured"})
        }
    }
  }
  async function handlegroupmessageedit(groupId:string,globalId:string,id:string,message:string){
    const group=groupconversations.get(groupId)
    if(group){
        const response=await Creategroupmessageedit(groupId,globalId,message,id)
        if(response!=="Error"){
            const members=group.members
            members.forEach((value)=>{
                sendmessage(value.id,"request:response:editmessage:group",{editmessage:message,globalId:globalId,sender:value.id===id})
            })
        }
        else{
            sendmessage(id,"request:response:editmessage:group",{message:"An error occured during editing"})
        }
    }
  }
  function handlegrouptypingonlinetyping(groupId:string,id:string,status:boolean){
        const group=groupconversations.get(groupId)
        if(group){
            const members=group.members
            if(members.some(data=>data.id===id)){
                members.forEach((value)=>{
                    if(value.id!==id){
                        sendmessage(value.id,"request:response:grouptypingonlinetyping:group",{groupId:groupId,status:status,id:id})
                    }
                })
            }
        }
  }
    async function handlechangegroupmemberstatus(memberId:string,status:promote,id:string,groupId:string){
        const group=groupconversations.get(groupId)
        if(group){
            console.log("data",memberId,id,status)
            const response=await Editgroupmemberstatus(status,memberId,id,groupId)
            if(response!=="Error"){
            if(group.createdBy===memberId){
                sendmessage(id,"request:response:memberstatus:group",{Success:false,message:"You cannot change group creator status"})
            }
            else{
                if(group.createdBy===id){
                    console.log("condition one")
                    if(group.admins.includes(memberId)){
                        if(status==="member"){
                            console.log("member done")
                        group.admins=group.admins.filter(data=>data!==memberId)
                        sendmessage(memberId,"request:response:memberstatus:group",{Success:true,message:"You got demoted from admin to member",id:memberId,status:status})
                        sendmessage(id,"request:response:sender:memberstatus:group",{Success:true,message:"Status conversion successfull",id:memberId,status:status})
                        }
                        else{
                            sendmessage(id,"request:response:sender:memberstatus:group",{Success:false,message:"Status is already member"})
                        }
                    }
                    else if(!group.admins.includes(memberId)){
                        console.log("admin done")
                        if(status==="admin"){
                        group.admins=[...group.admins,memberId]
                        sendmessage(memberId,"request:response:memberstatus:group",{Success:true,message:"You got promoted from member to admin",id:memberId,status:status})
                        sendmessage(id,"request:response:sender:memberstatus:group",{Success:true,message:"Status conversion succesfull",id:memberId,status:status})
                        }
                    }
                }
                else if(group.admins.includes(id)&&group.admins.includes(memberId)){
                    sendmessage(id,"request:response:sender:memberstatus:group",{Success:false,message:"You cannot change the other admin status"})
                }
                else if(group.admins.includes(memberId)&&!group.admins.includes(id)){
                    sendmessage(id,"request:response:sender:memberstatus:group",{Success:false,message:"You cannot change admin status by being a member"})
                }
                else if(group.admins.includes(id)&&!group.admins.includes(memberId)){
                    if(status==="admin"){
                        group.admins=[...group.admins,memberId]
                        sendmessage(memberId,"request:response:memberstatus:group",{Success:true,message:"You got promoted from member to admin",id:memberId,status:status})
                        sendmessage(id,"request:response:sender:memberstatus:group",{Success:true,message:"Status conversion succesfull",id:memberId,status:status})
                    }
                    else{
                        sendmessage(id,"request:response:sender:memberstatus:group",{Success:false,message:"You cannot demote below from member"})
                    }
                }
            }
        }
        else{
            sendmessage(id,"request:response:sender:memberstatus:group",{Success:false,message:"Some error occurred"})
        }
        }
  }
  async function handlegroupblockmember(memberId:string,id:string,groupId:string,action:"block"|"unblock"){
    const group=groupconversations.get(groupId)
    if(group){
        if(!group.admins.includes(id)){
            sendmessage(id,"request:response:block:group",{Success:false,message:"Only admins can block members",groupId:groupId})
            return
        }
        if(group.createdBy===memberId){
            sendmessage(id,"request:response:block:group",{Success:false,message:"You cannot block the group creator",groupId:groupId})
            return
        }
        const response=await Markgroupblockmember(groupId,memberId,id,action)
        if(response==="Success"){
            if(action==="block"){
                if(!group.blocked.includes(memberId)){
                    group.blocked=[...group.blocked,memberId]
                }
            }
            else if(action==="unblock"){
                group.blocked=group.blocked.filter(data=>data!==memberId)
            }
            const members=group.members
            members.forEach((value)=>{
                sendmessage(value.id,"request:response:block:group",{Success:true,message:action==="block"?"Member blocked":"Member unblocked",groupId:groupId,memberId:memberId,action:action})
            })
        }
        else{
            sendmessage(id,"request:response:block:group",{Success:false,message:"An error occurred",groupId:groupId})
        }
    }
    else{
        sendmessage(id,"request:response:block:group",{Success:false,message:"An error occurred",groupId:groupId})
    }
  }
  async function handlekickmember(groupId:string,memberId:string,id:string){
    const group=groupconversations.get(groupId)
    if(group){
        if(!group.admins.includes(id)){
            sendmessage(id,"request:response:kickmember:group",{Success:false,message:"Only admins can kick members",groupId:groupId})
            return
        }
        if(group.createdBy===memberId){
            sendmessage(id,"request:response:kickmember:group",{Success:false,message:"You cannot kick the group creator",groupId:groupId})
            return
        }
        if(group.admins.includes(memberId)&&group.createdBy!==id){
            sendmessage(id,"request:response:kickmember:group",{Success:false,message:"Only the group creator can kick an admin",groupId:groupId})
            return
        }
        const response=await Editgroupkickmember(groupId,memberId,id)
        if(response==="Success"){
            const kickedname=group.members.find(data=>data.id===memberId)?.name
            group.admins=[...group.admins].filter(data=>data!==memberId)
            group.members=[...group.members].filter(data=>data.id!==memberId)
            sendmessage(memberId,"request:response:kickmember:group",{Success:true,groupId:groupId,id:memberId,message:"You were removed from the group"})
            group.members.forEach((value)=>{
                sendmessage(value.id,"request:response:kickmember:group",{Success:true,groupId:groupId,id:memberId,message:`${kickedname||"A member"} was removed from the group`})
            })
        }
        else{
            sendmessage(id,"request:response:kickmember:group",{Success:false,message:"An error occurred",groupId:groupId})
        }
    }
    else{
        sendmessage(id,"request:response:kickmember:group",{Success:false,message:"An error occurred",groupId:groupId})
    }
  }
  async function handlegroupsettingschange(settings:groupsettings,value:boolean,id:string,groupId:string){
        const group=groupconversations.get(groupId)
        if(group){
            const response=await Editgroupsettings(groupId,settings,value,id)
            if(response!=="Error"){
            if(group.admins.includes(id)){
                if(settings==="OnlyAdminCanEditInfo"){
                    group.settings.onlyAdminCanEditInfo=value
                }
                else if(settings==="OnlyAdminCanEditMessage"){
                    group.settings.onlyAdminCanMessage=value
                }
            const members=group.members
            members.forEach((valuee)=>{
                sendmessage(valuee.id,"request:response:groupsettings:group",{settings:settings,value:value,message:"Group settings been changed"})
            })
            sendmessage(id,"request:response:sender:groupsettings:group",{settings:settings,value:value,message:"Group settings changed successfully"})
        }
        }
        else{
            
        }
        }
  }
  async function handlereloadgroupexistlist(name:string,id:string){
      const groupexistlist=await Loadgroupexistlist(id)
      sendmessage(id,"request:response:reload:groupexistlist:group",{grouplist:groupexistlist.length?groupexistlist:[]})
  }
  async function handlereloadgrouprequestrecieve(id:string){
    const grouprequestsrecieve=await Loadgrouprequests(2,id)
    sendmessage(id,"request:response:reload:grouprequestrecieve:group",{grouprequestsrecieve:grouprequestsrecieve})
  }
  async function handlereloadgrouprequestsend(id:string){
    const grouprequestsend=await Loadgrouprequests(1,id)
    sendmessage(id,"request:response:reload:grouprequestsend:group",{grouprequestsend:grouprequestsend})
  }
  async function handlereloadonetooneconversationrequests(id:string){
    const {onetooneconversationrecieverequests,onetooneconversationsendrequests}=await Loadonetooneconversationrequests(id)
    sendmessage(id,"request:response:reload:onetooneconversationrequests:onetooneconversation",{onetooneconversationrecieverequests:onetooneconversationrecieverequests,onetooneconversationsendrequests:onetooneconversationsendrequests})
  }
  async function handlegroupchangedescription(groupId:string,id:string,description:string){
     const group=groupconversations.get(groupId)
     if(group){
       if(group.admins.includes(id)){
         if(group.settings.onlyAdminCanEditInfo||group.createdBy===id){
            group.description=description
            const members=group.members
            members.forEach((value)=>{
                if(value.id!==id){
                    sendmessage(value.id,"request:response:groupdescription:group",{Success:true,sender:false,description:description,message:"Group name is changed by admin"})
                    sendmessage(id,"request:response:groupdescription:group",{Success:true,sender:true,description:description,message:"Group description is changed"})
                }
                else{
                    sendmessage(id,"request:response:groupdescription:group",{Success:false,sender:false,message:"Group description settings that info cannot be changed"})
                }
            })
         }
       }
     }
  }
  async function handlereloadconversationonetooneconversations(id:string){
    if(id){
        const onetooneconversations=await Loadonetooneconversationexistlist(id)
        sendmessage(id,"request:response:reload:conversation:onetooneconversation",{onetooneconversations:onetooneconversations.length?onetooneconversations:[]})
    }
  }
  wss.on("connection",(socket:MySocket,req)=>{
    const url=new URL(req.url!,"http://localhost:8080")
    const token=url.searchParams.get("token")
   socket.on("message",(data)=>{
        const {event,payload}=JSON.parse(data.toString())
        if(event==="login:request"){
            const {token,email}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify){
                handleregister(verify.name,email,verify._id,socket)
                userlist.get(verify._id)?.forEach((value)=>{
                    if(value.socket.readyState===WebSocket.OPEN){
                       value.socket.send(JSON.stringify({event:"login:request:response",payload:{verify:true}}))
                    }
                })
                handleexistonetooneconversationlist(verify._id)
                handlerequestonetooneconversation(verify._id)
            }
        }
        if(event==="register:request"){
            const {token,name,email,_id}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify){
                console.log(verify)
                handleregister(name,email,_id,socket)
                socket._id=_id
                socket.name=name
                socket.email=email
                socket.description=""
                userlist.get(_id)?.forEach((value)=>{
                    if(value.socket.readyState===WebSocket.OPEN){
                        value.socket.send(JSON.stringify({event:"register:request:response",payload:{verify:true}}))
                    }
                })
            }
        }
        if(event==="search:request"){
            const {token,search}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                console.log(search,verify._id,verify.name)
                handlesearchrequest(search,verify.name,verify?._id)
            }
        }
        if(event==="request:onetooneconversation"){
            const {senderId,recieverId,token}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                if(oneto1conversationrequest.get(getkey(senderId,recieverId))?.status!=="accepted"){
                    console.log("request condition passed",senderId,recieverId)
                handleonetooneconversationrequest(senderId,recieverId)
                }
            }
        }
        if(event==="request:accepted:onetooneconversation"){
            const {senderId,recieverId,token}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            console.log(senderId,recieverId,verify,token,oneto1conversationrequest.get(getkey(senderId,recieverId)))
            if(verify.name&&verify._id){
                if(oneto1conversationrequest.get(getkey(senderId,recieverId))?.status!=="accepted"&&oneto1conversationrequest.get(getkey(senderId,recieverId))){
                    console.log(senderId,recieverId,"triggered")
                    handleonetooneconversationrequestaccepted(senderId,recieverId)
                }
            }
        }
        if(event==="request:rejected:onetooneconversation"){
            const {senderId,recieverId,token}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                if(oneto1conversationrequest.get(getkey(senderId,recieverId))?.status!=="accepted"&&oneto1conversationrequest.get(getkey(senderId,recieverId))?.status!=="deleted"&&oneto1conversationrequest.get(getkey(senderId,recieverId))?.status){
                    handleonetooneconversationrequestrejected(senderId,recieverId)
                }
            }
        }
        if(event==="message:sent:onetooneconversation"){
            const {senderId,recieverId,message,createdAt,token,status,replyto,attachment}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                if(oneto1conversationmessages.has(getkey(senderId,recieverId))&&oneto1conversationrequest.get(getkey(senderId,recieverId))?.status==="accepted"&&oneto1conversations.has(getkey(senderId,recieverId))){
                    console.log("condi passed")
                    handleonetooneconversationmessages(senderId,recieverId,message,createdAt,verify._id,status,replyto,attachment)
                }
            }
        }
        if(event==="message:deleted:onetooneconversation"){
            const {senderId,recieverId,message,createdAt,token,status,messagesenderId,globalId}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                if(oneto1conversationmessages.has(getkey(senderId,recieverId))&&oneto1conversationrequest.get(getkey(senderId,recieverId))?.status==="accepted"&&oneto1conversations.has(getkey(senderId,recieverId))&&messagesenderId===verify._id){
                    console.log("message deleted")
                    handleonetooneconversationdeletemessages(senderId,recieverId,status,messagesenderId,message,createdAt,globalId)
                }
            }
        }
        if(event==="message:view:onetooneconversation"){
            const {senderId,recieverId,global_id,token}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                if(oneto1conversationmessages.has(getkey(senderId,recieverId))&&oneto1conversationrequest.get(getkey(senderId,recieverId))?.status==="accepted"&&oneto1conversations.has(getkey(senderId,recieverId))){
                    handleonetooneconversationviewmessages(senderId,recieverId,verify._id,global_id,"view")
                }
            }
        }
        if(event==="request:conversations:onetooneconversations"){
            const {senderId,token}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                console.log(senderId,verify)
                handleonetooneconversationdetails(senderId,verify._id,verify._id)
            }
        }
        if(event==="message:typing:onetooneconversation"){
            const {senderId,recieverId,token,typing}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                console.log("typing request",verify)
                handletypingonetooneconversation(senderId,recieverId,verify._id,typing)
            }
        }
        if(event==="message:loadmore:onetooneconversations"){
            const {senderId,recieverId,token,cursor_id}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify._id&&verify.name){
                console.log("load more request came")
                handleloadmoreonetooneconversations(senderId,recieverId,verify._id,cursor_id)
            }
        }
        if(event==="request:conversation:leave"){
            const {token,senderId,recieverId}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handleleaveonetooneconversation(verify._id,senderId,recieverId)
            }
        }
        if(event==="message:deleteforme:onetooneconversation"){
            const {senderId,recieverId,status,messageid,userid,token}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify._id&&verify.name&&userid===verify._id){
                handledeleteformeonetooneconversation(senderId,recieverId,status,messageid,verify._id)
            }
        }
        if(event==="request:namechange:onetooneconversation"){
            const {token,name}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlechangenameonetooneconversation(verify._id,name)
            }
        }
        if(event==="request:descriptionchange:onetooneconversation"){
            const {token,description}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify._id&&verify.name){
                handlechangedescriptiononetooneconversation(description,verify._id)
            }
        }
        if(event==="request:online:onetooneconversation"){
            const {token,id}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify._id&&verify.name&&id){
                handleloginonetooneconversation(verify._id,id)
            }
        }
        if(event==="request:userexist"){
            const {token}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify._id&&verify.name){
                handleexistusers(verify._id)
            }
        }
        if(event==="message:sent:edit:onetooneconversation"){
            const {token,global_id,message,senderId,recieverId}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handleeditmessageonetooneconversation(global_id,message,senderId,recieverId,verify._id)
            }
        }
        if(event==="request:creategroup"){
            const {token,name,description}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                console.log("server event triggered")
                handlecreategroup(name,description,verify._id,verify.name)
            }
        }
        if(event==="request:groups:search"){
            const {token,search}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlesearchgrouprequest(search,verify._id)
            }
        }
        if(event==="request:statuschange:group"){
            const {groupId,status,token}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlegroupstatuschange(groupId,status,verify._id)
            }
        }
        if(event==="request:sendgrouprequest:group"){
            const {groupId,status,token,type}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                console.log("request event in server")
                handlegroupsendrequest(groupId,status,verify._id,verify.name,type)
            }
        }
        if(event==="request:grouprequestaccept:group"){
            const {groupId,sendBy,token}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                console.log("group request accept")
                handlegrouprequestaccept(groupId,verify.name,verify._id,sendBy)
            }
        }
        if(event==="request:sendgroupinviterequest:group"){
            const {groupId,sendTo,token,status,type}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlegroupinvitesend(groupId,sendTo,status,type,verify._id,verify.name)
            }
        }
        if(event==="request:groupinviteaccept:group"){
            const {groupId,sendBy,token}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlegroupinviteaccept(groupId,sendBy,verify._id,verify.name)
            }
        }
        if(event==="request:groupconversations:group"){
            const {groupId,token}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlegroupconversation(verify._id,verify.name,groupId)
            }
        }
        if(event==="request:sendmessage:group"){
            const {groupId,token,message,reply,attachment}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlegroupsendmessage(groupId,message,verify._id,verify.name,reply,attachment)
            }
        }
        if(event==="request:viewmessage:group"){
            const {groupId,globalId,sendBy,token}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            console.log(event)
            if(verify.name&&verify._id){
                console.log("server event triggered")
                handleviewgroupmessage(groupId,globalId,verify._id,verify.name)
            }
        }
        if(event==="request:changememberstatus:group"){
            const {groupId,promoteId,token,status}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlechangememberstatus(groupId,promoteId,status,verify._id)
            }
        }
        if(event==="request:groupleave:group"){
            const {groupId,token}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handleleavegroup(groupId,verify._id)
            }
        }
        if(event==="request:grouptyping:group"){
            const {groupId,token,status}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlegrouptyping(groupId,verify._id,verify.name,status)
            }
        }
        if(event==="request:groupname:group"){
            const {token,groupId,name}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlegroupchangename(groupId,name,verify._id)
            }
        }
        if(event==="request:groupdescription:group"){
            const {token,groupId,description}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlegroupchangedescription(groupId,verify._id,description)
            }
        }
        if(event==="request:pagimoremessage:group"){
            const {token,groupId,id}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlegrouppagination(groupId,id,verify._id)
            }
        }
        if(event==="request:replymessage:group"){
            const {token,globalId,message,groupId,replymessage}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlereplygroupmessage(globalId,message,token._id,token.name,groupId,replymessage)
            }
        }
        if(event==="request:grouprecieverejectrequest:group"){
            const {groupId,sendBy,token}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlegrouprecieverejectrequest(groupId,sendBy,verify._id)
            }
        }
        if(event==="request:groupsenderrequestcancel:group"){
            const {groupId,status,type,token}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlegroupsenderrequestcancel(groupId,status,type,verify._id)
            }
        }
        if(event==="request:grouptypingonline:group"){
            const {groupId,token}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlegrouptypingonline(groupId,verify._id,verify.name,true)
            }
        }
        if(event==="request:messagestatuschange:group"){
            const {groupId,messageId,token,status}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlegroupmessagestatuschange(groupId,messageId,verify._id,status)
            }
        }
        if(event==="request:editmessage:group"){
            const {groupId,globalId,token,message}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlegroupmessageedit(groupId,globalId,verify._id,message)
            }
        }
        if(event==="request:grouptypingonlinetyping:group"){
            const {groupId,token,status}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlegrouptypingonlinetyping(groupId,verify._id,status)
            }
        }
        if(event==="request:memberstatus:group"){
            const {memberId,token,status,groupId}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlechangegroupmemberstatus(memberId,status,verify._id,groupId)
            }
        }
        if(event==="request:block:group"){
            const {memberId,token,groupId,action}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlegroupblockmember(memberId,verify._id,groupId,action)
            }
        }
        if(event==="request:kickmember:group"){
            const {memberId,token,groupId}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlekickmember(groupId,memberId,verify._id)
            }
        }
        if(event==="request:groupsettings:group"){
            const {Settings,value,token,groupId}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlegroupsettingschange(Settings,value,verify._id,groupId)
            }
        }
        if(event==="request:reload:groupexistlist:group"){
            const {token}=payload
            const verify=jsonwebtoken.verify(token,"secret") as{name:string,_id:string}
            if(verify.name&&verify._id){
                handlereloadgroupexistlist(verify.name,verify._id)
            }
        }
        if(event==="request:reload:grouprequestrecieve:group"){
            const {token}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlereloadgrouprequestrecieve(verify._id)
            }
        }
        if(event==="request:reload:grouprequestsend:group"){
            const {token}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlereloadgrouprequestsend(verify._id)
            }
        }
        if(event==="request:reload:onetooneconversationrequests:onetooneconversation"){
            const {token}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlereloadonetooneconversationrequests(verify._id)
            }
        }
        if(event==="request:reload:conversation:onetooneconversation"){
            const {token}=payload
            const verify=jsonwebtoken.verify(token,"secret") as {name:string,_id:string}
            if(verify.name&&verify._id){
                handlereloadconversationonetooneconversations(verify._id)
            }
        }
    })
    socket.on("close",(data)=>{
       handlelogoutonetooneconversation(socket._id)
       groupconversations.forEach((value,key)=>{
        const groupId=key
        const id=socket._id
        const name=socket.name
        if(value.members.some(dataa=>dataa.id===id)){
            handlegrouptypingonline(groupId,id,name,false)
        }
       })
    })
}) 