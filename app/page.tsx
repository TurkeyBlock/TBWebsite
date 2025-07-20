"use client"
import styles from "./page.module.css";
import Image from "next/image"
import Turkey from "@/public/images/Turkey.png"

export default function Page() {
  return (
    <div className={styles.container}>
      <div className={styles.textContainer}>
       Turkeyblock.org
      </div>
      <div className={styles.imageContainer}>
        <Image
          src={Turkey}
          alt="Turkey"
          className="h-[50vmin] w-[50vmin] rounded-full object-cover border-[2px] border-[black]"
        />
      </div>
    </div>
  )
}