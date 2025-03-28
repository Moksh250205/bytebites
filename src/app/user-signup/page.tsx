"use client";

import React, { useRef } from "react";
import { ShineBorder } from "@/components/magicui/shine-border";
import { RetroGrid } from "@/components/magicui/retro-grid";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import SignupForm from "../../components/forms/signupForm";
import ThemeToggleButton from "../../components/themeToggleButton";

const Page = () => {
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const contentRef = useRef(null);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      gsap.set(
        [".feature-item", ".quote-text", ".heading-text", ".desc-text"],
        {
          opacity: 0,
          y: 20,
        }
      );

      gsap.from(containerRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from(formRef.current, {
        x: -50,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: "power2.out",
      });

      gsap.to(".heading-text", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.5,
        ease: "back.out(1.5)",
      });

      gsap.to(".desc-text", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.7,
        ease: "back.out(1.5)",
      });

      gsap.to(".feature-item", {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        delay: 1,
        ease: "power2.out",
      });

      gsap.to(".quote-text", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 1.5,
        ease: "power2.out",
      });

      gsap.to(".shine-effect", {
        backgroundPosition: "200% center",
        duration: 2,
        repeat: -1,
        ease: "none",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative h-dvh w-dvw font-serif z-10 overflow-auto saturate-0 gradient-background transition-colors duration-300">
      <div className="z-0">
        <RetroGrid className="opacity-60 dark:opacity-30 transition-opacity duration-300" />
      </div>
      <div className="inset-0 gradient-overlay fixed transition-colors duration-300" />
      
      <ThemeToggleButton />

      <div
        ref={containerRef}
        className="relative min-h-dvh w-full flex items-center justify-center p-4 sm:p-6"
      >
        <ShineBorder
          color={[
            'var(--shine-color-1)',
            'var(--shine-color-2)',
            'var(--shine-color-3)'
          ]}
          className="w-full max-w-[90vw] lg:max-w-5xl"
        >
          <div className="backdrop-blur-md bg-card/90 rounded-2xl shadow-2xl transition-colors duration-300">
            <div className="flex flex-col lg:flex-row items-center justify-between p-4 sm:p-6 lg:p-8 gap-6 lg:gap-8 max-h-[85vh] overflow-auto">
              <div
                ref={formRef}
                className="w-full lg:w-1/2 max-w-md mx-auto login-form"
              >
                <div className="lg:hidden mb-6 text-center">
                  <h2 className="heading-text text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3 transition-colors duration-300">
                    ByteBites
                  </h2>
                  <p className="desc-text text-sm sm:text-base text-muted-foreground transition-colors duration-300">
                    Your favorite local restaurants, delivered
                  </p>
                </div>
                <SignupForm />
              </div>

              <div
                ref={contentRef}
                className="w-full lg:w-1/2 lg:border-l lg:border-border lg:pl-8 flex items-center justify-center transition-colors duration-300"
                style={{ height: "500px" }}
              >
                <div className="text-center">
                  <h2 className="heading-text text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3 transition-colors duration-300">
                    Hungry? We've got you covered
                  </h2>
                  <div className="space-y-4 lg:space-y-6">
                    <p className="desc-text text-base lg:text-lg text-muted-foreground leading-relaxed transition-colors duration-300">
                      Order from your favorite local restaurants with just a few
                      taps. Fresh, delicious food
                    </p>

                    <div className="flex flex-col items-center lg:items-start space-y-4">
                      <div className="feature-item flex items-center gap-3">
                        <div className="feature-purple p-2 rounded-full transition-colors duration-300">
                          <div className="w-5 h-5">🍽️</div>
                        </div>
                        <p className="text-sm lg:text-base text-gray-700 dark:text-gray-300 transition-colors duration-300">
                          Wide selection of local restaurants
                        </p>
                      </div>

                      <div className="feature-item flex items-center gap-3">
                        <div className="feature-pink p-2 rounded-full transition-colors duration-300">
                          <div className="w-5 h-5">🚀</div>
                        </div>
                        <p className="text-sm lg:text-base text-gray-700 dark:text-gray-300 transition-colors duration-300">
                          Prioritised food ordering
                        </p>
                      </div>

                      <div className="feature-item flex items-center gap-3">
                        <div className="feature-orange p-2 rounded-full transition-colors duration-300">
                          <div className="w-5 h-5">💳</div>
                        </div>
                        <p className="text-sm lg:text-base text-gray-700 dark:text-gray-300 transition-colors duration-300">
                          Secure and easy payment options
                        </p>
                      </div>
                    </div>

                    <blockquote className="quote-text p-3 border-l-4 border-gradient-to-b from-purple-400 to-pink-400 bg-gray-50 dark:bg-gray-800/50 rounded-r-lg transition-colors duration-300">
                      <p className="text-base lg:text-lg italic text-gray-700 dark:text-gray-300 transition-colors duration-300">
                        "From kitchen to couch in minutes"
                      </p>
                    </blockquote>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ShineBorder>
      </div>
    </div>
  );
};

export default Page;