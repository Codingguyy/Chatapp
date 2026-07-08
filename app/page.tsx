"use client"
import React from 'react'
import { useRouter } from 'next/navigation'
export default function Mainpage(){
    const router=useRouter()
    React.useEffect(()=>{
      router.push("/register")
    },[])
}