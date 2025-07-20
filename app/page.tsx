"use client"
import styles from "./page.module.css";
import Image from "next/image"
import Turkey from "@/public/images/Turkey.png"

export default function Page() {
  return (
    <div className={styles.container}>
      <div className={styles.subContainer}>
        <h1>Hello D&D Nerds</h1>
        <h2>@Turkeyblock.org</h2>
        <a>aa</a>
        And this is text 1
        And this is text 2
        Etc Etc
      </div>
      <div className={styles.subContainer}>
        <Image
          src={Turkey}
          alt="Turkey"
          className="h-[50vmin] w-[50vmin] rounded-full object-cover border-[2px] border-[black]"
        />
      </div>
    </div>
  )
}