"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const NewsletterForm = dynamic(() => import("./Forms").then((module) => module.NewsletterForm), {
  ssr: false,
  loading: () => <p role="status" className="text-ink-2">Loading the form</p>,
});

/** Form and validation code are only fetched when the visitor gets near this part of the page. */
export function LazyNewsletter() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "500px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="min-h-40">
      {visible && <NewsletterForm />}
    </div>
  );
}
