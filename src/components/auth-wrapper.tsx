"use client";

import useApp from "@/hooks/useApp";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import Loader from "./loader";

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { language, room, username } = useApp();
  const isAuthenticated = (!!room && !!language && !!username);
  const router = useRouter();

  useEffect(()=>{
    if(!isAuthenticated){
      router.push('/')
    }
  },[isAuthenticated])

  if (!isAuthenticated) {
    return <Loader />
  }

  return <>{children}</>
}
