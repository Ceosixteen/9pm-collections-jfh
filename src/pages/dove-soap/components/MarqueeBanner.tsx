import React from 'react';
import { PhoneCall } from 'lucide-react';

export const MarqueeBanner: React.FC = () => {
  const items = [
    "Free delivery within Juba Town",
    "Pay on delivery (Cash) or Paystack (Card)",
    "100% Authentic Dove Beauty Bar Dermatologist-Tested Body Care",
    "Same-Day Dispatch across Munuki, Tongping, Gudele & Hai Cinema",
    "WhatsApp / Call Support: +211 911 267 703",
  ];

  return (
    <div className="w-full bg-[#F3E8FF] text-[#6B21A8] py-2.5 overflow-hidden border-y border-purple-200/80 shadow-xs">
      <div className="animate-marquee flex items-center whitespace-nowrap text-xs sm:text-sm font-bold">
        {[...items, ...items, ...items].map((text, idx) => (
          <div key={idx} className="flex items-center gap-3 mx-6 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#B24BF3]"></span>
            <span>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
