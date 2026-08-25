/**
 * useTypewriter.js — Custom hook for typewriter effect with blinking cursor
 * Usage: const { displayed, done } = useTypewriter({ text, speed, startDelay })
 */

import { useState, useEffect } from 'react';

/**
 * @param {object} options
 * @param {string}  options.text        - Full text to type
 * @param {number}  options.speed       - Ms per character (default 45)
 * @param {number}  options.startDelay  - Ms before typing starts (default 0)
 * @returns {{ displayed: string, done: boolean }}
 */
export function useTypewriter({ text = '', speed = 45, startDelay = 0 } = {}) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone]           = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);

    let timeout;
    let interval;

    timeout = setTimeout(() => {
      let i = 0;
      interval = setInterval(() => {
        i += 1;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

export default useTypewriter;
