/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { useEffect } from "react";

export function useOutsideClick(
  ref: any,
  action: (e?: Event) => void,
  mouseEvent: string = "click",
) {
  useEffect(() => {
    const controller = new AbortController();

    document.addEventListener(
      mouseEvent,
      (e) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        if (ref.current && !ref.current.contains(e.target)) {
          action();
        }
      },
      { signal: controller.signal },
    );

    return () => {
      // Unbind the event listener on clean up
      //document.removeEventListener('click', action);
      controller.abort();
    };
  }, [action, ref]);
}
