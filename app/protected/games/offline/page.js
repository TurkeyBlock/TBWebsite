"use client"
import styles from "./page.module.css"
export default function Waves () {
    return(
        <div className = {styles.restrictedBox}>
            <div className = {styles.waterContainer}>
                <div className = {`${styles.water} ${styles.first}`} >
                    <div className = {`${styles.shape} ${styles.front}`} style={{animation:`${styles.moveShape} 6s linear infinite`, animationDelay:'0s'}}></div>
                    <div className = {`${styles.shape} ${styles.front}`} style={{animation:`${styles.moveShape} 6s linear infinite`, animationDelay:'2s'}}></div>
                    <div className = {`${styles.shape} ${styles.front}`} style={{animation:`${styles.moveShape} 6s linear infinite`, animationDelay:'4s'}}></div>
                    <div className = {`${styles.shape} ${styles.front}`} style={{animation:`${styles.moveShape} 4s linear infinite`, animationDelay:'0s'}}></div>
                    <div className = {`${styles.shape} ${styles.front}`} style={{animation:`${styles.moveShape} 4s linear infinite`, animationDelay:'2s'}}></div>
                </div>
                <div className = {`${styles.water} ${styles.second}`} >
                    <div className = {`${styles.shape} ${styles.middle}`} style={{animation:`${styles.moveShape} 9s linear infinite`, animationDelay:'0s'}}></div>
                    <div className = {`${styles.shape} ${styles.middle}`} style={{animation:`${styles.moveShape} 9s linear infinite`, animationDelay:'3s'}}></div>
                    <div className = {`${styles.shape} ${styles.middle}`} style={{animation:`${styles.moveShape} 9s linear infinite`, animationDelay:'6s'}}></div>
                    <div className = {`${styles.shape} ${styles.middle}`} style={{animation:`${styles.moveShape} 7s linear infinite`, animationDelay:'0s'}}></div>
                </div>
                <div className = {`${styles.water} ${styles.third}`} >
                    <div className = {`${styles.shape} ${styles.back}`} style={{animation:`${styles.moveShape} 15s linear infinite`, animationDelay:'0s'}}></div>
                    <div className = {`${styles.shape} ${styles.back}`} style={{animation:`${styles.moveShape} 15s linear infinite`, animationDelay:'5s'}}></div>
                    <div className = {`${styles.shape} ${styles.back}`} style={{animation:`${styles.moveShape} 15s linear infinite`, animationDelay:'10s'}}></div>
                    <div className = {`${styles.shape} ${styles.back}`} style={{animation:`${styles.moveShape} 13s linear infinite`, animationDelay:'0s'}}></div>
                </div>
            </div>
        </div>
    );
}