"use client"
import { useState } from "react";
import styles from "./page.module.css";
import Image from "next/image"
import Turkey from "@/public/images/Turkey.png"

export default function Page() {
  return (
    <div className={styles.container} style={{}}>
      <div className={styles.textContainer}>
       <h1>Turkeyblock.org</h1>
       <sub style={{textAlign:`right`, fontSize:`clamp(1rem, 0.5rem + 1.66vw, 6.66rem)`, alignContent:`right`}}>A Hobby Website</sub>
      </div>
      <div className={styles.imageContainer}>
        <Image
          src={Turkey}
          priority={true}
          alt="Image of a Turkey"
          className="h-[60vmin] w-[60vmin] rounded-full object-cover border-[2px] border-[black]"
        />
      </div>
    </div>
  )
}