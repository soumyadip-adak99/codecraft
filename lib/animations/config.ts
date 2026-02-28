"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const easings = {
  smooth: "power3.out",
  bounce: "back.out(1.7)",
  elastic: "elastic.out(1, 0.3)",
  snappy: "power2.inOut",
};

export const animations = {
  fadeInUp: (element: Element | string, delay = 0) =>
    gsap.fromTo(
      element,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, delay, ease: easings.smooth }
    ),

  fadeIn: (element: Element | string, duration = 0.5, delay = 0) =>
    gsap.fromTo(
      element,
      { opacity: 0 },
      { opacity: 1, duration, delay, ease: easings.smooth }
    ),

  countUp: (element: Element, endValue: number, duration = 2) => {
    const obj = { value: 0 };
    return gsap.to(obj, {
      value: endValue,
      duration,
      ease: "power1.out",
      onUpdate: () => {
        element.textContent = Math.floor(obj.value).toLocaleString();
      },
    });
  },

  staggerCards: (cards: Element[] | NodeListOf<Element>, scrollTrigger?: Element) =>
    gsap.fromTo(
      cards,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: easings.smooth,
        scrollTrigger: scrollTrigger
          ? { trigger: scrollTrigger, start: "top 80%" }
          : undefined,
      }
    ),

  testCaseReveal: (container: Element, items: Element[]) => {
    const tl = gsap.timeline();
    tl.fromTo(
      container,
      { opacity: 0, scale: 0.97 },
      { opacity: 1, scale: 1, duration: 0.3, ease: easings.smooth }
    );
    tl.fromTo(
      items,
      { opacity: 0, x: -16 },
      { opacity: 1, x: 0, duration: 0.35, stagger: 0.07, ease: easings.smooth },
      "-=0.1"
    );
    return tl;
  },

  modalOpen: (backdrop: Element, content: Element) => {
    const tl = gsap.timeline();
    tl.fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.2 });
    tl.fromTo(
      content,
      { opacity: 0, y: 40, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: easings.bounce },
      "-=0.05"
    );
    return tl;
  },

  modalClose: (backdrop: Element, content: Element, onComplete?: () => void) => {
    const tl = gsap.timeline({ onComplete });
    tl.to(content, { opacity: 0, y: 30, scale: 0.92, duration: 0.25, ease: easings.snappy });
    tl.to(backdrop, { opacity: 0, duration: 0.15 });
    return tl;
  },

  heroEntrance: (elements: Element[]) => {
    const tl = gsap.timeline({ delay: 0.2 });
    elements.forEach((el, i) => {
      tl.fromTo(
        el,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 0.7, ease: easings.smooth },
        i * 0.12
      );
    });
    return tl;
  },
};
