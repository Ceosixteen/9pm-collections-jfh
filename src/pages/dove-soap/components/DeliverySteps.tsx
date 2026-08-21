import React from 'react';
import { ShoppingBag, Truck, MapPin } from 'lucide-react';

export const DeliverySteps: React.FC = () => {
  const steps = [
    {
      step: "01",
      icon: ShoppingBag,
      title: "1. Select Your Body Treatment",
      desc: "Choose from Vitamin C + Turmeric, Argan Oil + Vitamin E, Retinol + Ferulic Acid, or Hyaluronic Acid + Cica. Bundle 2+ products for automatic -$5 off every item!"
    },
    {
      step: "02",
      icon: MapPin,
      title: "2. Juba Address & Readiness",
      desc: "Provide your phone number & address in Juba. Please only order if you are ready to receive your delivery TODAY!"
    },
    {
      step: "03",
      icon: Truck,
      title: "3. Free 120-Min Delivery & Pay",
      desc: "Delivered FREE across Juba in under 120 minutes! Pay cash (USD/SSP) on delivery, or bank transfer (50% advance deposit for SSP transfers)."
    }
  ];

  return (
    <section id="delivery" className="py-16 bg-[#FAF8FC] border-t border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <span className="px-3.5 py-1 rounded-full bg-purple-100 text-[#B24BF3] text-xs font-extrabold uppercase tracking-wider border border-purple-200">
            HOW ORDERING WORKS IN JUBA
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-sans tracking-tight">
            Same-Day Juba Express Delivery
          </h2>
          <p className="text-sm text-slate-600 font-normal">
            Simple, fast, and 100% risk-free. No advance payment required for Juba addresses!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="relative p-8 rounded-3xl bg-white border border-gray-100 space-y-4 shadow-md hover:shadow-xl hover:border-purple-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[#B24BF3] text-white flex items-center justify-center shadow-md">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-black text-gray-200">
                    {s.step}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 font-sans">{s.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">{s.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
