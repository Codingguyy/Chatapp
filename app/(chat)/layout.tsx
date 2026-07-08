import Chatdashboard from '@/components/chat'
import Floatingnavbar from '@/components/floatingnavbar'
export default async function Layout({children}:Readonly<{children:React.ReactNode}>){
    return(
        <div className="relative max-w-9xl w-screen flex items-stretch bg-[#0a0a0a] no-scrollbar h-[calc(100vh-3.5rem)]">
             <Floatingnavbar/>
            <Chatdashboard/> 
            {children}
        </div>
    )
}
