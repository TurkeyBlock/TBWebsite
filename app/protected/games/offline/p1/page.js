import styles from "./page.module.css";

const WaveAnimation = () => {
  return (
    <div className={styles.waveContainer}>
        {/*<svg className={styles.wave1} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 100" width="300%">
          <path d="M 0 50 Q 32 50 64 25 Q 128 -25 192 25 Q 224 50 256 50 Q 288 50 320 25 Q 384 -25 448 25 Q 480 50 512 50 Q 544 50 576 25 Q 640 -25 704 25 Q 736 50 768 50 Q 800 50 832 25 Q 896 -25 960 25 Q 992 50 1024 50 Q 1056 50 1088 25 Q 1152 -25 1216 25 Q 1248 50 1280 50 Q 1312 50 1344 25 Q 1408 -25 1472 25 Q 1504 50 1536 50 L 1280 100 L 0 100 Z" fill="#59afff"></path>
        </svg>*/}
        <div className = {styles.second}>
          <svg className={`${styles.wave1}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 100" width="100%">
            <path d="M 0 50 Q 53.33 50 106.67 25 Q 213.33 -25 320 25 Q 373.33 50 426.67 50 Q 480 50 533.33 25 Q 640 -25 746.67 25 Q 800 50 853.33 50 Q 906.67 50 960 25 Q 1066.67 -25 1173.33 25 Q 1226.67 50 1280 50 Q 1333.33 50 1386.67 25 Q 1493.33 -25 1600 25 Q 1653.33 50 1706.67 50 L 1280 100 L 0 100 Z" fill="blue"></path>
          </svg>
          <svg  className={`${styles.wave2}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 100" width="100%">
            <path d="M 0 50 Q 53.33 50 106.67 25 Q 213.33 -25 320 25 Q 373.33 50 426.67 50 Q 480 50 533.33 25 Q 640 -25 746.67 25 Q 800 50 853.33 50 Q 906.67 50 960 25 Q 1066.67 -25 1173.33 25 Q 1226.67 50 1280 50 Q 1333.33 50 1386.67 25 Q 1493.33 -25 1600 25 Q 1653.33 50 1706.67 50 L 1280 100 L 0 100 Z" fill="blue"></path>
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

    {/*
        <svg className = {styles.wave1} viewBox="0 0 1282 200" xmlns="http://www.w3.org/2000/svg"> <path fill="rgba(47, 73, 94, 1)" d="M 0 0 C 184.5 0 184.5 43 369 43 L 369 43 L 369 0 L 0 0 Z" stroke-width="0"></path> <path fill="rgba(47, 73, 94, 1)" d="M 368 43 C 524 43 524 94 680 94 L 680 94 L 680 0 L 368 0 Z" stroke-width="0"></path> <path fill="rgba(47, 73, 94, 1)" d="M 679 94 C 876.5 94 876.5 65 1074 65 L 1074 65 L 1074 0 L 679 0 Z" stroke-width="0"></path><path fill="rgba(47, 73, 94, 1)" d="M 1073 65 C 1173 65 1173 0 1273 0 L 1273 0 L 1273 0 L 1073 0 Z" stroke-width="0"></path></svg>
        <svg className = {styles.wave2} viewBox="0 0 1282 200" xmlns="http://www.w3.org/2000/svg"> <path fill="rgba(47, 73, 94, 1)" d="M 0 0 C 184.5 0 184.5 43 369 43 L 369 43 L 369 0 L 0 0 Z" stroke-width="0"></path> <path fill="rgba(47, 73, 94, 1)" d="M 368 43 C 524 43 524 94 680 94 L 680 94 L 680 0 L 368 0 Z" stroke-width="0"></path> <path fill="rgba(47, 73, 94, 1)" d="M 679 94 C 876.5 94 876.5 65 1074 65 L 1074 65 L 1074 0 L 679 0 Z" stroke-width="0"></path><path fill="rgba(47, 73, 94, 1)" d="M 1073 65 C 1173 65 1173 0 1273 0 L 1273 0 L 1273 0 L 1073 0 Z" stroke-width="0"></path></svg>
    */}
    </div>
  );
};

export default WaveAnimation;
