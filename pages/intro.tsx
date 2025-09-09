import { useRouter } from 'next/router';
import { useRef } from 'react';
import styles from '../styles/intro.module.css';

export default function Intro() {
  const router = useRouter();
  const wipeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleReset = () => {
    const wipe = wipeRef.current;
    const container = containerRef.current;
    if (!wipe || !container) return;

    wipe.classList.add(styles.show, styles.top);
    container.classList.add(styles.active);

    setTimeout(() => {
      wipe.classList.remove(styles.show);
      container.classList.remove(styles.active);
      setTimeout(() => {
        //wipe.classList.remove(styles.top);
        router.push('/');
      }, 0);
    }, 1000);
  };

  return (
    <>
      <div className={styles.animationWipe} ref={wipeRef}>
        <span className={styles.box1}></span>
        <span className={styles.box2}></span>
        <span className={styles.loader}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="200px"
            height="200px"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid"
          >
            <path
              d="M10 50A40 40 0 0 0 90 50A40 42 0 0 1 10 50"
              fill="#000000"
              stroke="none"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                dur="1s"
                repeatCount="indefinite"
                keyTimes="0;1"
                values="0 50 51;360 50 51"
              />
            </path>
          </svg>
        </span>
      </div>

      <div className={styles.displayContent} ref={containerRef}>
        <div className="inner-wrap">
          <h1>Click the button</h1>
          <div className={styles.buttonWrap}>
            <button type="button" onClick={handleReset}>
              <span className="text">Start Experience</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
