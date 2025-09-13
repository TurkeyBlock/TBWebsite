import styles from "./page.module.css";

import Image from "next/image"
import Sailboat from "@/public/images/Sailboat.svg"

const WaveAnimation = () => {
  return (
    <div className={styles.waveContainer}>
      <div className = {styles.third}>
        <svg className={`${styles.wave1}`}xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 100" width="100%">
          <path d="M 0 50 Q 40 50 80 25 Q 160 -25 240 25 Q 280 50 320 50 Q 360 50 400 25 Q 480 -25 560 25 Q 600 50 640 50 Q 680 50 720 25 Q 800 -25 880 25 Q 920 50 960 50 Q 1000 50 1040 25 Q 1120 -25 1200 25 Q 1240 50 1280 50 Q 1320 50 1360 25 Q 1440 -25 1520 25 Q 1560 50 1600 50 L 1280 100 L 0 100 Z" fill="blue"></path>
        </svg>
        <svg className={`${styles.wave2}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 100" width="100%">
          <path d="M 0 50 Q 40 50 80 25 Q 160 -25 240 25 Q 280 50 320 50 Q 360 50 400 25 Q 480 -25 560 25 Q 600 50 640 50 Q 680 50 720 25 Q 800 -25 880 25 Q 920 50 960 50 Q 1000 50 1040 25 Q 1120 -25 1200 25 Q 1240 50 1280 50 Q 1320 50 1360 25 Q 1440 -25 1520 25 Q 1560 50 1600 50 L 1280 100 L 0 100 Z" fill="blue"></path>
        </svg>
      </div>
      <Image
        src={Sailboat}
        priority={false}
        alt="Image of a sailboat"
        className={`${styles.boat}`}
      />
      <div className = {styles.second}>
        <svg className={`${styles.wave1}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 100" width="100%">
          <path d="M 0 50 Q 53.33 50 106.67 25 Q 213.33 -25 320 25 Q 373.33 50 426.67 50 Q 480 50 533.33 25 Q 640 -25 746.67 25 Q 800 50 853.33 50 Q 906.67 50 960 25 Q 1066.67 -25 1173.33 25 Q 1226.67 50 1280 50 Q 1333.33 50 1386.67 25 Q 1493.33 -25 1600 25 Q 1653.33 50 1706.67 50 L 1280 100 L 0 100 Z" fill="#3399f8ff"></path>
        </svg>
        <svg  className={`${styles.wave2}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 100" width="100%">
          <path d="M 0 50 Q 53.33 50 106.67 25 Q 213.33 -25 320 25 Q 373.33 50 426.67 50 Q 480 50 533.33 25 Q 640 -25 746.67 25 Q 800 50 853.33 50 Q 906.67 50 960 25 Q 1066.67 -25 1173.33 25 Q 1226.67 50 1280 50 Q 1333.33 50 1386.67 25 Q 1493.33 -25 1600 25 Q 1653.33 50 1706.67 50 L 1280 100 L 0 100 Z" fill="#3399f8ff"></path>
        </svg>
      </div>
      <div className = {styles.first}>
        <svg className={`${styles.wave1}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 100" width="100%">
          <path d="M 0 50 Q 80 50 160 25 Q 320 -25 480 25 Q 560 50 640 50 Q 720 50 800 25 Q 960 -25 1120 25 Q 1200 50 1280 50 Q 1360 50 1440 25 Q 1600 -25 1760 25 Q 1840 50 1920 50 L 1280 100 L 0 100 Z" fill="aqua"></path>
        </svg>
        <svg className={`${styles.wave2}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 100" width="100%">
          <path d="M 0 50 Q 80 50 160 25 Q 320 -25 480 25 Q 560 50 640 50 Q 720 50 800 25 Q 960 -25 1120 25 Q 1200 50 1280 50 Q 1360 50 1440 25 Q 1600 -25 1760 25 Q 1840 50 1920 50 L 1280 100 L 0 100 Z" fill="aqua"></path>
        </svg>
      </div>
    </div>
  );
};

export default WaveAnimation;
