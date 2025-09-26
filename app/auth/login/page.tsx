"use client"

import { LoginForm } from "@/components/login-form";
import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Link from "next/link";
import { useState, useEffect } from "react";

import styles from './page.module.css'

export default function Page() {

    const [hasSession, setHasSession] = useState(false);
    const [sessionUser, setSessionUser] = useState({
      is_anonymous:'Error',
      user_metadata:{
        displayName:'Error', 
        email:'Error',
        email_verified:'Error',
      }
    });

    const [showEmail, setShowEmail] = useState(false);
    function toggleShowEmail(){
      setShowEmail((prev)=>!prev);
    }

    useEffect(()=>{
      async function getSession(){
        const supabase = createClient();
        const {data, error} = await supabase.auth.getSession()
        if(error){
          console.log(error);
        }
        if(data.session){
          setHasSession(true);
          setSessionUser(data.session.user) //Ignore Warning; SessionUser loads with error-defaults
          if(data.session.user.is_anonymous){
            setSessionUser((prev) => ({
              ...prev,
              user_metadata:{
                displayName: prev.user_metadata.displayName,
                email:"N/A",
                email_verified:"N/A",
            }}))
          }
        }
      }
      getSession();
    },[])

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        
        {hasSession ? 
          <div style={{display:'flex', justifyContent:'center', flexDirection:'column'}}>
            <Card>
              <CardHeader>
                <CardTitle className={`text-2xl`} style={{display:'flex', justifyContent:'center'}}>
                  {sessionUser.user_metadata.displayName}
                </CardTitle>
                <CardDescription>
                  {sessionUser.is_anonymous ? "Anonymous User" : ""}
                </CardDescription>
              </CardHeader>
              <CardContent>
                  <div>
                    <span className = {styles.header}>Email: </span>
                    <button className = {`${styles.content} ${styles.hidden}`} onClick = {toggleShowEmail}>
                      {showEmail ? 
                        sessionUser.user_metadata.email
                        : 'Click to reveal'
                      }
                    </button>
                    <div>
                      <span className = {styles.header}>Verified:</span>
                      <span className = {`${styles.content}`}>{" "+sessionUser.user_metadata.email_verified}</span>
                    </div>
                  </div> 
                  {sessionUser.is_anonymous ? "" :
                  <>
                    <br></br>
                    <Link
                      href="/auth/forgot-password"
                      className={`ml-auto inline-block text-sm underline-offset-4 hover:underline`}
                    >
                      Reset Password
                    </Link>
                    <br></br>
                  </>
                  }
                <br></br>
                <LogoutButton/>
              </CardContent>
            </Card>
            <br></br>
            
          </div>
        
        : <LoginForm />}
      </div>
    </div>
  );
}
