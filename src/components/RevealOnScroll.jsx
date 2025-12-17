// src/components/RevealOnScroll.jsx
import React, { useState, useEffect, useRef } from 'react';

const RevealOnScroll = ({ children, className = "" }) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, { threshold: 0.1 });

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, []);

    return (
        <div
            ref={ref}
            className={`reveal-item ${isVisible ? "reveal-visible" : "reveal-hidden"} ${className}`}
        >
            {children}
        </div>
    );
};

export default RevealOnScroll;